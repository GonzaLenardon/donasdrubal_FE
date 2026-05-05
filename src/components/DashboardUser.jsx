import { useEffect, useState } from 'react';
import { allServices } from '../api/dashUser';
import { allCliente } from '../api/clientes';
import { useCliente } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

// ─── helpers ────────────────────────────────────────────────────────────────

const calcClienteMetrics = (cliente) => {
  let totalCal = 0,
    doneCal = 0,
    totalAgua = 0,
    doneAgua = 0,
    totalJornada = 0,
    doneJornada = 0;

  cliente.maquinas?.forEach((m) => {
    m.calibracionesmaquina?.forEach((cal) => {
      totalCal++;
      if (cal.estado === 'CERRADO') doneCal++;
    });
  });

  cliente.pozos?.forEach((p) => {
    p.muestrasAgua?.forEach((muestra) => {
      totalAgua++;
      if (muestra.estado === 'CERRADO') doneAgua++;
    });
  });

  cliente.jornadas?.forEach((j) => {
    totalJornada++;
    if (j.estado === 'CERRADO') doneJornada++;
  });

  const calPct = totalCal > 0 ? Math.round((doneCal / totalCal) * 100) : 0;
  const aguaPct = totalAgua > 0 ? Math.round((doneAgua / totalAgua) * 100) : 0;
  const jornadaPct =
    totalJornada > 0 ? Math.round((doneJornada / totalJornada) * 100) : 0;

  let estado = 'sin';
  if (calPct === 100 && aguaPct === 100) estado = 'completo';
  else if (calPct > 0 || aguaPct > 0) estado = 'proceso';

  return {
    totalCal,
    doneCal,
    calPct,
    totalAgua,
    doneAgua,
    aguaPct,
    totalJornada,
    doneJornada,
    jornadaPct,
    estado,
    totalMaquinas: cliente.maquinas?.length ?? 0,
    totalPozos: cliente.pozos?.length ?? 0,
  };
};

const calcGlobalMetrics = (clientes) => {
  console.log('CLICLCICLCICLICLICICLCICLCICI', clientes);

  let totalCal = 0,
    doneCal = 0;
  let totalAgua = 0,
    doneAgua = 0;
  // ── Jornadas acumuladas en este scope ──
  let totalJornada = 0,
    doneJornada = 0;

  const rows = [];

  clientes.forEach((c) => {
    const m = calcClienteMetrics(c);

    totalCal += m.totalCal;
    doneCal += m.doneCal;
    totalAgua += m.totalAgua;
    doneAgua += m.doneAgua;
    totalJornada += m.totalJornada;
    doneJornada += m.doneJornada;

    rows.push({
      id: c.id,
      razon_social: c.razon_social,
      litros_estimados: c.litros_estimados,
      cuil_cuit: c.cuil_cuit,
      direccion: c.direccion,
      telefono: c.telefono,
      ...m,
    });
  });

  return {
    totalCal,
    doneCal,
    calPct: totalCal > 0 ? Math.round((doneCal / totalCal) * 100) : 0,
    totalAgua,
    doneAgua,
    aguaPct: totalAgua > 0 ? Math.round((doneAgua / totalAgua) * 100) : 0,
    totalJornada,
    doneJornada,
    jornadaPct:
      totalJornada > 0 ? Math.round((doneJornada / totalJornada) * 100) : 0,
    rows,
    sin: rows.filter((r) => r.estado === 'sin').length,
    proceso: rows.filter((r) => r.estado === 'proceso').length,
    completos: rows.filter((r) => r.estado === 'completo').length,
  };
};

// ─── sub-components ──────────────────────────────────────────────────────────

const ResumenCard = ({ icon, title, done, total, pct, pendiente }) => (
  <div className="card h-100">
    <div className="card-body">
      <div className="d-flex align-items-center gap-2 mb-3">
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span className="fw-medium">{title}</span>
      </div>
      <div className="d-flex justify-content-between align-items-baseline mb-1">
        <span className="fs-4 fw-medium">
          {done !== null ? `${done} / ${total}` : '— / —'}
        </span>
      </div>
      <div className="progress mb-1" style={{ height: 8 }}>
        <div
          className="progress-bar bg-success"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="d-flex justify-content-between">
        <small className="text-success fw-medium">{pct}%</small>
        <small className="text-muted">{pendiente}</small>
      </div>
    </div>
  </div>
);

const ESTADO_CONFIG = {
  sin: {
    label: 'Sin iniciar',
    badgeClass: 'text-bg-danger',
    dotColor: '#E24B4A',
  },
  proceso: {
    label: 'En proceso',
    badgeClass: 'text-bg-warning',
    dotColor: '#EF9F27',
  },
  completo: {
    label: 'Completado',
    badgeClass: 'text-bg-success',
    dotColor: '#639922',
  },
};

const EstadoBadge = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.sin;
  return (
    <span className={`badge rounded-pill ${cfg.badgeClass}`}>{cfg.label}</span>
  );
};

const MiniBar = ({ done, total, pct }) => (
  <div className="d-flex align-items-center gap-2">
    <small className="text-muted" style={{ minWidth: 34 }}>
      {done}/{total}
    </small>
    <div className="progress flex-fill" style={{ height: 6 }}>
      <div className="progress-bar bg-success" style={{ width: `${pct}%` }} />
    </div>
    <small className="text-muted" style={{ minWidth: 32, textAlign: 'right' }}>
      {pct}%
    </small>
  </div>
);

const FocoCard = ({ color, count, label }) => (
  <div className="card h-100">
    <div className="card-body d-flex align-items-center gap-2">
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span className="fw-medium" style={{ fontSize: 14 }}>
        {count} {label}
      </span>
    </div>
  </div>
);

// ─── main component ──────────────────────────────────────────────────────────

const DashboardUser = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clienteIds, setClienteIds] = useState([]);
  const { setSelectedCliente } = useCliente();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    setSelectedCliente(null); // Limpiar cliente seleccionado al entrar al dashboard
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const clientesRes = await allCliente();
      const ids = clientesRes.data.map((c) => c.id);
      setClienteIds(ids);
      const serviciosRes = await allServices(ids);
      setClientes(serviciosRes.data?.data ?? serviciosRes.data ?? []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 300 }}
      >
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        {error}
        <button
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={fetchData}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const m = calcGlobalMetrics(clientes);

  const handleCliente = (row) => {
    console.log('ROWWWWWWWWWWWWWW', row);
    setSelectedCliente(row);
    navigate(`/cliente/${row.id}/detalles`);
  };

  return (
    <div className="p-3">
      {/* ── Resumen General ── */}
      <h6 className="fw-medium mb-3">Resumen general</h6>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="🚜"
            title="Calibraciones"
            done={m.doneCal}
            total={m.totalCal}
            pct={m.calPct}
            pendiente={`Pendientes: ${m.totalCal - m.doneCal}`}
          />
        </div>
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="💧"
            title="Muestreo de agua"
            done={m.doneAgua}
            total={m.totalAgua}
            pct={m.aguaPct}
            pendiente={`Pendientes: ${m.totalAgua - m.doneAgua}`}
          />
        </div>
        {/* ── Jornadas (reemplaza Capacitaciones) ── */}
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="🎓"
            title="Jornadas"
            done={m.doneJornada}
            total={m.totalJornada}
            pct={m.jornadaPct}
            pendiente={`Pendientes: ${m.totalJornada - m.doneJornada}`}
          />
        </div>
      </div>

      {/* ── Foco del día ── */}
      <h6 className="fw-medium mb-3">Foco del día</h6>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <FocoCard
            color="#E24B4A"
            count={m.sin}
            label={`cliente${m.sin !== 1 ? 's' : ''} sin arrancar`}
          />
        </div>
        <div className="col-12 col-md-4">
          <FocoCard
            color="#EF9F27"
            count={m.proceso}
            label={`cliente${m.proceso !== 1 ? 's' : ''} en proceso`}
          />
        </div>
        <div className="col-12 col-md-4">
          <FocoCard
            color="#639922"
            count={m.completos}
            label={`cliente${m.completos !== 1 ? 's' : ''} completo${m.completos !== 1 ? 's' : ''}`}
          />
        </div>
      </div>

      {/* ── Tabla de clientes ── */}
      <h6 className="fw-medium mb-3">Clientes</h6>
      <div className="card mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: '16%' }}>Cliente</th>
                <th className="text-end" style={{ width: '6%' }}>
                  Máquinas
                </th>
                <th style={{ width: '15%' }}>Calibraciones</th>
                <th className="text-end" style={{ width: '6%' }}>
                  Pozos
                </th>
                <th style={{ width: '15%' }}>Muestras de agua</th>
                <th style={{ width: '15%' }}>Jornadas</th>
                <th
                  style={{
                    width: '10%',
                    textAlign: 'center',
                  }}
                >
                  Lts. Estimados
                </th>
              </tr>
            </thead>
            <tbody>
              {m.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Sin clientes registrados
                  </td>
                </tr>
              ) : (
                m.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCliente(row)}
                      >
                        {row.razon_social}
                      </span>
                    </td>
                    <td className="text-end">
                      <span
                        className="badge rounded bg-info text-dark "
                        style={{ fontSize: '0.9rem' }}
                      >
                        {row.totalMaquinas}
                      </span>
                    </td>
                    <td>
                      <MiniBar
                        done={row.doneCal}
                        total={row.totalCal}
                        pct={row.calPct}
                      />
                    </td>
                    <td className="text-end">
                      <span
                        className="badge rounded bg-info text-dark"
                        style={{ fontSize: '0.9rem' }}
                      >
                        {row.totalPozos}
                      </span>
                    </td>
                    <td>
                      <MiniBar
                        done={row.doneAgua}
                        total={row.totalAgua}
                        pct={row.aguaPct}
                      />
                    </td>
                    <td>
                      <MiniBar
                        done={row.doneJornada}
                        total={row.totalJornada}
                        pct={row.jornadaPct}
                      />
                    </td>
                    <td className="text-center">
                      {row?.litros_estimados ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Alertas ── */}
      <h6 className="fw-medium mb-3">Alertas / Notificaciones</h6>
      <div
        className="alert alert-secondary d-flex align-items-center gap-2 mb-0"
        role="alert"
      >
        <i className="bi bi-bell" />
        <span>Sección de alertas pendiente de implementar.</span>
      </div>
    </div>
  );
};

export default DashboardUser;
