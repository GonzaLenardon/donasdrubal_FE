import { useEffect, useState } from 'react';
import { allServicesToClients, totalServices } from '../api/dashUser';
import { useCliente } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * A partir del nuevo objeto de allServicesToClients, deriva las métricas
 * necesarias para la tabla y el foco del día.
 * El backend ya devuelve los totales — no hay que iterar registros anidados.
 */
const calcRowMetrics = (cliente) => {
  const cal = cliente.Maquinas;
  const agua = cliente.Pozos;
  const jorn = cliente.Jornadas;

  const doneCal = cal.totalCalibraciones - cal.calibracionesPendientes;
  const doneAgua = agua.totalMuestras - agua.muestrasPendientes;
  const doneJornada = jorn.totalJornadas - jorn.jornadasPendientes;

  const calPct =
    cal.totalCalibraciones > 0
      ? Math.round((doneCal / cal.totalCalibraciones) * 100)
      : 0;
  const aguaPct =
    agua.totalMuestras > 0
      ? Math.round((doneAgua / agua.totalMuestras) * 100)
      : 0;
  const jornadaPct =
    jorn.totalJornadas > 0
      ? Math.round((doneJornada / jorn.totalJornadas) * 100)
      : 0;

  // Estado global del cliente para "Foco del día"
  let estado = 'sin';
  if (calPct === 100 && aguaPct === 100) estado = 'completo';
  else if (calPct > 0 || aguaPct > 0) estado = 'proceso';

  return {
    // Calibraciones
    totalCal: cal.totalCalibraciones,
    doneCal,
    calPct,
    // Muestras
    totalAgua: agua.totalMuestras,
    doneAgua,
    aguaPct,
    // Jornadas
    totalJornada: jorn.totalJornadas,
    doneJornada,
    jornadaPct,
    // Contadores
    totalMaquinas: cal.totalMaquinas,
    totalPozos: agua.totalPozos,
    estado,
  };
};

const buildRows = (clientes) => {
  const rows = clientes.map((c) => ({
    id: c.id,
    razon_social: c.razon_social,
    litros_estimados: c.litros_estimados,
    ciudad: c.ciudad,
    provincia: c.provincia,
    ...calcRowMetrics(c),
  }));

  return {
    rows,
    sin: rows.filter((r) => r.estado === 'sin').length,
    proceso: rows.filter((r) => r.estado === 'proceso').length,
    completos: rows.filter((r) => r.estado === 'completo').length,
  };
};

// ─── Sub-componentes ───────────────────────────────────────────────────────────

const ResumenCard = ({ icon, title, total, pendientes, extra, extraLabel }) => {
  const realizadas = total - pendientes;
  const pct = total > 0 ? Math.round((realizadas / total) * 100) : 0;

  const barColor = pct === 100 ? '#639922' : pct >= 50 ? '#EF9F27' : '#E24B4A';

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span className="fw-medium">{title}</span>
          </div>
          {extra != null && (
            <span
              className="badge rounded-pill bg-info text-dark"
              style={{ fontSize: '0.8rem' }}
            >
              {extra} {extraLabel}
            </span>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-baseline mb-1">
          <span className="fs-4 fw-medium">
            {realizadas}{' '}
            <span className="fs-6 text-muted fw-normal">/ {total}</span>
          </span>
          <small className="text-muted">{pct}% completado</small>
        </div>

        <div className="progress mb-2" style={{ height: 8, borderRadius: 4 }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${pct}%`,
              background: barColor,
              transition: 'width .4s ease',
            }}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="d-flex justify-content-between">
          <small style={{ color: barColor }} className="fw-medium">
            ✓ {realizadas} realizadas
          </small>
          <small className="text-muted">⏳ {pendientes} pendientes</small>
        </div>
      </div>
    </div>
  );
};

/**
 * MiniBar — barra de progreso compacta para la tabla de clientes.
 * Cambia de color igual que ResumenCard para mantener coherencia visual.
 */
const MiniBar = ({ done, total }) => {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const barColor = pct === 100 ? '#639922' : pct >= 50 ? '#EF9F27' : '#E24B4A';

  return (
    <div className="d-flex align-items-center gap-2">
      <small
        className="text-muted"
        style={{ minWidth: 38, whiteSpace: 'nowrap' }}
      >
        {done}/{total}
      </small>
      <div className="progress flex-fill" style={{ height: 6 }}>
        <div
          className="progress-bar"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      <small
        className="text-muted"
        style={{ minWidth: 32, textAlign: 'right' }}
      >
        {pct}%
      </small>
    </div>
  );
};

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

// ─── Componente principal ──────────────────────────────────────────────────────

const DashboardUser = () => {
  const [totales, setTotales] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { setSelectedCliente } = useCliente();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    setSelectedCliente(null);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [serviciosRes, totalesRes] = await Promise.all([
        allServicesToClients(),
        totalServices(),
      ]);

      setClientes(serviciosRes.data?.data ?? serviciosRes.data ?? []);
      setTotales(totalesRes.data?.data ?? totalesRes.data ?? null);
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

  const filteredClientes = clientes.filter((cliente) =>
    cliente.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const { rows, sin, proceso, completos } = buildRows(filteredClientes);

  const handleCliente = (row) => {
    setSelectedCliente(row);
    navigate(`/cliente/${row.id}/detalles`);
  };

  return (
    <div className="p-3">
      {/* ── Resumen general ── */}
      <h6 className="fw-medium mb-3">Resumen general</h6>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="🚜"
            title="Calibraciones"
            total={totales?.Maquinas?.totalCalibraciones ?? 0}
            pendientes={totales?.Maquinas?.calibracionesPendientes ?? 0}
            extra={totales?.Maquinas?.totalMaquinas}
            extraLabel="máq."
          />
        </div>
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="💧"
            title="Muestreo de agua"
            total={totales?.Pozos?.totalMuestras ?? 0}
            pendientes={totales?.Pozos?.muestrasPendientes ?? 0}
            extra={totales?.Pozos?.totalPozos}
            extraLabel="pozos"
          />
        </div>
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="🎓"
            title="Jornadas"
            total={totales?.Jornadas?.totalJornadas ?? 0}
            pendientes={totales?.Jornadas?.jornadasPendientes ?? 0}
          />
        </div>
      </div>

      {/* ── Foco del día ── */}
      <h6 className="fw-medium mb-3">Foco del día</h6>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <FocoCard
            color="#E24B4A"
            count={sin}
            label={`cliente${sin !== 1 ? 's' : ''} sin arrancar`}
          />
        </div>
        <div className="col-12 col-md-4">
          <FocoCard
            color="#EF9F27"
            count={proceso}
            label={`cliente${proceso !== 1 ? 's' : ''} en proceso`}
          />
        </div>
        <div className="col-12 col-md-4">
          <FocoCard
            color="#639922"
            count={completos}
            label={`cliente${completos !== 1 ? 's' : ''} completo${completos !== 1 ? 's' : ''}`}
          />
        </div>
      </div>

      <div
        className="container-table rounded shadow-lg mb-2"
        style={{ background: '#1c4f1b36' }}
      >
        <div>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                <th>Cliente</th>
                <th className="text-center">Máquinas</th>
                <th>Calibraciones</th>
                <th className="text-center">Pozos</th>
                <th>Muestras de agua</th>
                <th>Jornadas</th>
                <th className="text-center">Lts. Estimados</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Sin clientes registrados
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCliente(row)}
                  >
                    {/* Cliente */}
                    <td>
                      <div className="fw-medium">{row.razon_social}</div>
                      <small className="text-muted">
                        {row.ciudad}, {row.provincia}
                      </small>
                    </td>

                    {/* Máquinas */}
                    <td className="text-center">
                      <span
                        className="badge rounded bg-info text-dark"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {row.totalMaquinas}
                      </span>
                    </td>

                    {/* Calibraciones */}
                    <td>
                      <MiniBar done={row.doneCal} total={row.totalCal} />
                    </td>

                    {/* Pozos */}
                    <td className="text-center">
                      <span
                        className="badge rounded bg-info text-dark"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {row.totalPozos}
                      </span>
                    </td>

                    {/* Muestras */}
                    <td>
                      <MiniBar done={row.doneAgua} total={row.totalAgua} />
                    </td>

                    {/* Jornadas */}
                    <td>
                      <MiniBar
                        done={row.doneJornada}
                        total={row.totalJornada}
                      />
                    </td>

                    {/* Litros */}
                    <td className="text-center">
                      {row.litros_estimados ?? '—'}
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
