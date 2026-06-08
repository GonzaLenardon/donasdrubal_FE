import { useEffect, useState } from 'react';
import { allServicesToClients, totalServices } from '../api/dashUser';
import { useCliente } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import ClientesMobileList from '../components/ClientesMobileList';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const calcRowMetrics = (cliente) => {
  const cal = cliente.Maquinas;
  const agua = cliente.Pozos;
  const jorn = cliente.Jornadas;

  const calCerradas = cal.calibracionesCerradas ?? 0;
  const calProceso = cal.calibracionesProceso ?? 0;
  const calPendientes = cal.calibracionesPendientes ?? 0;
  const totalCal = cal.totalCalibraciones ?? 0;
  const calPct = totalCal > 0 ? Math.round((calCerradas / totalCal) * 100) : 0;

  const aguaCerradas = agua.muestrasCerradas ?? 0;
  const aguaProceso = agua.muestrasProceso ?? 0;
  const aguaPendientes = agua.muestrasPendientes ?? 0;
  const totalAgua = agua.totalMuestras ?? 0;
  const aguaPct =
    totalAgua > 0 ? Math.round((aguaCerradas / totalAgua) * 100) : 0;

  const jorCerradas = jorn.jornadasCerradas ?? 0;
  const jorProceso = jorn.jornadasProceso ?? 0;
  const jorPendientes = jorn.jornadasPendientes ?? 0;
  const totalJornada = jorn.totalJornadas ?? 0;
  const jorPct =
    totalJornada > 0 ? Math.round((jorCerradas / totalJornada) * 100) : 0;

  let estado = 'sin';
  if (calPct === 100 && aguaPct === 100) estado = 'completo';
  else if (
    calCerradas > 0 ||
    calProceso > 0 ||
    aguaCerradas > 0 ||
    aguaProceso > 0
  )
    estado = 'proceso';

  return {
    totalCal,
    calCerradas,
    calProceso,
    calPendientes,
    calPct,
    totalAgua,
    aguaCerradas,
    aguaProceso,
    aguaPendientes,
    aguaPct,
    totalJornada,
    jorCerradas,
    jorProceso,
    jorPendientes,
    jorPct,
    totalMaquinas: cal.totalMaquinas ?? 0,
    totalPozos: agua.totalPozos ?? 0,
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

/**
 * ResumenCard — barra segmentada con números y porcentajes.
 * Sección "Resumen general".
 */
const ResumenCard = ({
  icon,
  title,
  total,
  cerradas,
  proceso,
  pendientes,
  extra,
  extraLabel,
}) => {
  const totalNum = Number(total) || 0;
  const cerradasNum = Number(cerradas) || 0;
  const procesoNum = Number(proceso) || 0;
  const pendientesNum = Number(pendientes) || 0;

  const pctCerradas = totalNum > 0 ? (cerradasNum / totalNum) * 100 : 0;
  const pctProceso = totalNum > 0 ? (procesoNum / totalNum) * 100 : 0;
  const pctPendientes = totalNum > 0 ? (pendientesNum / totalNum) * 100 : 0;

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span className="fw-medium">{title}</span>
          </div>
          {extra != null && (
            <span
              className="badge rounded-pill bg-info text-dark"
              style={{ fontSize: '0.78rem' }}
            >
              {extra} {extraLabel}
            </span>
          )}
        </div>

        <div className="mb-2">
          <span className="fs-4 fw-semibold">{totalNum}</span>
          <span className="text-muted ms-1" style={{ fontSize: '0.85rem' }}>
            en total
          </span>
        </div>

        <div className="progress mb-3" style={{ height: 10, borderRadius: 6 }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${pctCerradas}%`, transition: 'width .4s ease' }}
          />
          <div
            className="progress-bar bg-warning"
            style={{ width: `${pctProceso}%`, transition: 'width .4s ease' }}
          />
          <div
            className="progress-bar bg-danger"
            style={{ width: `${pctPendientes}%`, transition: 'width .4s ease' }}
          />
        </div>

        <div className="d-flex justify-content-between">
          <div className="d-flex flex-column align-items-start">
            <span
              className="text-success fw-medium"
              style={{ fontSize: '0.8rem' }}
            >
              ✔ {cerradasNum}
            </span>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
              cerradas ({Math.round(pctCerradas)}%)
            </span>
          </div>
          <div className="d-flex flex-column align-items-center">
            <span
              className="text-warning fw-medium"
              style={{ fontSize: '0.8rem' }}
            >
              ⚙ {procesoNum}
            </span>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
              proceso ({Math.round(pctProceso)}%)
            </span>
          </div>
          <div className="d-flex flex-column align-items-end">
            <span
              className="text-danger fw-medium"
              style={{ fontSize: '0.8rem' }}
            >
              ⏳ {pendientesNum}
            </span>
            <span className="text-muted" style={{ fontSize: '0.72rem' }}>
              pendientes ({Math.round(pctPendientes)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MiniDonut — SVG con % en el centro + sublabel debajo + stats en grilla 2×2.
 * Sección "Clientes" (tabla).
 *
 * Props:
 * @param {number} cerradas
 * @param {number} proceso
 * @param {number} pendientes
 * @param {number} total
 * @param {string} [subLabel]  — contexto bajo el círculo (ej: "2 máq.", "5 poz.")
 */

// ── Constantes del donut SVG ──────────────────────────────────────────────────

const DONUT_SIZE = 52;
const DONUT_R = 18;
const DONUT_SW = 6;
const DONUT_CX = DONUT_SIZE / 2;
const DONUT_CY = DONUT_SIZE / 2;
const DONUT_CIRC = 2 * Math.PI * DONUT_R;

const DONUT_STATS = [
  { label: 'Cerradas', key: 'cerradas', color: '#3b6d11', border: '#639922' },
  { label: 'Proceso', key: 'proceso', color: '#854f0b', border: '#EF9F27' },
  {
    label: 'Pendientes',
    key: 'pendientes',
    color: '#a32d2d',
    border: '#E24B4A',
  },
  { label: 'Total', key: 'total', color: '#555555', border: '#cccccc' },
];

const MiniDonut = ({ cerradas, proceso, pendientes, total, subLabel }) => {
  const vals = { cerradas, proceso, pendientes, total };

  const CirculoVacio = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        flexShrink: 0,
      }}
    >
      <svg
        width={DONUT_SIZE}
        height={DONUT_SIZE}
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
      >
        <circle
          cx={DONUT_CX}
          cy={DONUT_CY}
          r={DONUT_R}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={DONUT_SW}
        />
        <text
          x={DONUT_CX}
          y={DONUT_CY + 4}
          textAnchor="middle"
          fontSize="10"
          fill="#9ca3af"
        >
          —
        </text>
      </svg>
      {subLabel && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: '#082c09',
            whiteSpace: 'nowrap',
          }}
        >
          {subLabel}
        </span>
      )}
    </div>
  );

  if (!total) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
        }}
      >
        <CirculoVacio />
        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          Sin registros
        </span>
      </div>
    );
  }

  const pct = Math.round((cerradas / total) * 100);
  const pG = (cerradas / total) * DONUT_CIRC;
  const pA = (proceso / total) * DONUT_CIRC;
  const pR = (pendientes / total) * DONUT_CIRC;

  const Arc = ({ len, color, offset }) => (
    <circle
      cx={DONUT_CX}
      cy={DONUT_CY}
      r={DONUT_R}
      fill="none"
      stroke={color}
      strokeWidth={DONUT_SW}
      strokeDasharray={`${len} ${DONUT_CIRC - len}`}
      strokeDashoffset={offset}
      transform={`rotate(-90 ${DONUT_CX} ${DONUT_CY})`}
      strokeLinecap="round"
    />
  );

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}
    >
      {/* Izquierda: círculo + sublabel */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          flexShrink: 0,
        }}
      >
        <svg
          width={DONUT_SIZE}
          height={DONUT_SIZE}
          viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        >
          <circle
            cx={DONUT_CX}
            cy={DONUT_CY}
            r={DONUT_R}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={DONUT_SW}
          />
          <Arc len={pG} color="#639922" offset={0} />
          <Arc len={pA} color="#EF9F27" offset={-pG} />
          <Arc len={pR} color="#E24B4A" offset={-(pG + pA)} />
          <text
            x={DONUT_CX}
            y={DONUT_CY + 4}
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="#1f2937"
          >
            {pct}%
          </text>
        </svg>
        {subLabel && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#082c09',
              whiteSpace: 'nowrap',
            }}
          >
            {subLabel}
          </span>
        )}
      </div>

      {/* Derecha: stats en grilla 2×2 — Opción C (borde coloreado) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3px',
          flex: 1,
        }}
      >
        {DONUT_STATS.map(({ label, key, color, border }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: 20,
              border: `1.5px solid ${border}`,
              color,
              background: 'transparent',
            }}
          >
            <span>{label}</span>
            <span>{vals[key]}</span>
          </div>
        ))}
      </div>
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

  const isMobile = useIsMobile();

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

  const clientesFiltrados = clientes.filter((c) =>
    c.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const { rows, sin, proceso, completos } = buildRows(clientesFiltrados);

  const handleCliente = (row) => {
    setSelectedCliente(row);
    navigate(`/cliente/${row.id}/detalles`);
  };

  return (
    <div className="p-1 p-md-3">
      {/* ── Resumen general — barras segmentadas ── */}
      <h6 className="fw-medium mb-3">Resumen general</h6>
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="🚜"
            title="Calibraciones"
            total={totales?.Maquinas?.totalCalibraciones ?? 0}
            cerradas={totales?.Maquinas?.cerradas ?? 0}
            proceso={totales?.Maquinas?.proceso ?? 0}
            pendientes={totales?.Maquinas?.pendientes ?? 0}
            extra={totales?.Maquinas?.totalMaquinas}
            extraLabel="máq."
          />
        </div>
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="💧"
            title="Muestreo de agua"
            total={totales?.Pozos?.totalMuestras ?? 0}
            cerradas={totales?.Pozos?.cerradas ?? 0}
            proceso={totales?.Pozos?.proceso ?? 0}
            pendientes={totales?.Pozos?.pendientes ?? 0}
            extra={totales?.Pozos?.totalPozos}
            extraLabel="pozos"
          />
        </div>
        <div className="col-12 col-md-4">
          <ResumenCard
            icon="🎓"
            title="Jornadas"
            total={totales?.Jornadas?.totalJornadas ?? 0}
            cerradas={totales?.Jornadas?.cerradas ?? 0}
            proceso={totales?.Jornadas?.proceso ?? 0}
            pendientes={totales?.Jornadas?.pendientes ?? 0}
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

      {/* ── Clientes — tabla (desktop) / cards (mobile) ── */}
      <h6 className="fw-medium mb-3">Clientes</h6>
      <div className="card mb-4">
        {/* Buscador — igual que antes */}
        <div
          className="container-table rounded mb-2 p-2"
          style={{ background: '#1c4f1b36' }}
        >
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Renderizado condicional */}
        {isMobile ? (
          <div className="p-2">
            <ClientesMobileList
              rows={rows}
              searchTerm={searchTerm}
              onSelect={handleCliente}
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              {/* thead y tbody exactamente igual que antes — sin ningún cambio */}
              <thead className="table-light">
                <tr>
                  <th style={{ minWidth: 160 }}>Cliente</th>
                  <th>Máq. / Calibraciones</th>
                  <th>Poz. / Muestras</th>
                  <th>Jornadas</th>
                  <th className="text-center" style={{ width: 90 }}>
                    Lts. Est.
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      {searchTerm
                        ? 'No se encontraron clientes'
                        : 'Sin clientes registrados'}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCliente(row)}
                    >
                      <td>
                        <div className="fw-medium">{row.razon_social}</div>
                        <small className="text-muted">
                          {row.ciudad}, {row.provincia}
                        </small>
                      </td>
                      <td>
                        <MiniDonut
                          cerradas={row.calCerradas}
                          proceso={row.calProceso}
                          pendientes={row.calPendientes}
                          total={row.totalCal}
                          subLabel={`${row.totalMaquinas} máq.`}
                        />
                      </td>
                      <td>
                        <MiniDonut
                          cerradas={row.aguaCerradas}
                          proceso={row.aguaProceso}
                          pendientes={row.aguaPendientes}
                          total={row.totalAgua}
                          subLabel={`${row.totalPozos} poz.`}
                        />
                      </td>
                      <td>
                        <MiniDonut
                          cerradas={row.jorCerradas}
                          proceso={row.jorProceso}
                          pendientes={row.jorPendientes}
                          total={row.totalJornada}
                        />
                      </td>
                      <td className="text-center text-muted">
                        {row.litros_estimados ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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
