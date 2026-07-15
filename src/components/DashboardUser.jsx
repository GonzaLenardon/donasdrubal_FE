import { useEffect, useState } from 'react';
import { allServicesToClients, totalServices } from '../api/dashUser';
import { allIngenieros } from '../api/users';
import { allTipoClientes } from '../api/tipoClientes';
import { useCliente } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import ClientesMobileList from '../components/ClientesMobileList';
import EstadoServicio, { LeyendaEstados } from '../components/EstadoServicio';

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

const INITIAL_STATUS_FILTERS = {
  pendientes: true,
  proceso: true,
  cerradas: true,
};

const INITIAL_SERVICE_VISIBILITY = {
  maquinas: true,
  muestras: true,
  jornadas: true,
};

const SERVICE_COLUMNS = [
  { key: 'maquinas', label: 'Máq. / Calibraciones' },
  { key: 'muestras', label: 'Poz. / Muestras' },
  { key: 'jornadas', label: 'Jornadas' },
];

const hasSelectedStatus = (cliente, statusFilters, visibleServices) => {
  const selectedStatuses = Object.entries(statusFilters)
    .filter(([, isSelected]) => isSelected)
    .map(([status]) => status);
  const allStatusesSelected =
    selectedStatuses.length === Object.keys(statusFilters).length;

  const visibleServiceKeys = Object.entries(visibleServices)
    .filter(([, isVisible]) => isVisible)
    .map(([serviceKey]) => serviceKey);

  if (visibleServiceKeys.length === 0) return false;
  if (allStatusesSelected) return true;
  if (selectedStatuses.length === 0) return false;

  const serviceData = {
    maquinas: {
      pendientes: cliente.Maquinas?.calibracionesPendientes ?? 0,
      proceso: cliente.Maquinas?.calibracionesProceso ?? 0,
      cerradas: cliente.Maquinas?.calibracionesCerradas ?? 0,
    },
    muestras: {
      pendientes: cliente.Pozos?.muestrasPendientes ?? 0,
      proceso: cliente.Pozos?.muestrasProceso ?? 0,
      cerradas: cliente.Pozos?.muestrasCerradas ?? 0,
    },
    jornadas: {
      pendientes: cliente.Jornadas?.jornadasPendientes ?? 0,
      proceso: cliente.Jornadas?.jornadasProceso ?? 0,
      cerradas: cliente.Jornadas?.jornadasCerradas ?? 0,
    },
  };

  const statusTotals = visibleServiceKeys.reduce(
    (totals, serviceKey) => ({
      pendientes:
        totals.pendientes + (serviceData[serviceKey]?.pendientes ?? 0),
      proceso: totals.proceso + (serviceData[serviceKey]?.proceso ?? 0),
      cerradas: totals.cerradas + (serviceData[serviceKey]?.cerradas ?? 0),
    }),
    { pendientes: 0, proceso: 0, cerradas: 0 },
  );

  return selectedStatuses.some((status) => statusTotals[status] > 0);
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

const ToggleButton = ({ id, label, checked, onChange }) => (
  <div>
    <input
      type="checkbox"
      className="btn-check"
      id={id}
      checked={checked}
      onChange={onChange}
    />
    <label
      className={`btn btn-sm ${checked ? 'btn-success' : 'btn-outline-secondary'}`}
      htmlFor={id}
      style={{ borderRadius: 20 }}
    >
      {label}
    </label>
  </div>
);

// ─── Componente principal ──────────────────────────────────────────────────────

const DashboardUser = () => {
  const [totales, setTotales] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [tipoClientes, setTipoClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngenieroId, setSelectedIngenieroId] = useState('');
  const [selectedTipoClienteId, setSelectedTipoClienteId] = useState('');
  const [statusFilters, setStatusFilters] = useState(INITIAL_STATUS_FILTERS);
  const [visibleServices, setVisibleServices] = useState(
    INITIAL_SERVICE_VISIBILITY,
  );

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
      const [serviciosRes, totalesRes, ingenierosRes, tipoClientesRes] =
        await Promise.all([
          allServicesToClients(),
          totalServices(),
          allIngenieros(),
          allTipoClientes(),
        ]);
      setClientes(serviciosRes.data?.data ?? serviciosRes.data ?? []);
      setTotales(totalesRes.data?.data ?? totalesRes.data ?? null);
      setIngenieros(ingenierosRes.data ?? ingenierosRes ?? []);
      setTipoClientes(
        tipoClientesRes?.data ?? tipoClientesRes ?? [],
      );
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

  const clientesFiltrados = clientes.filter((c) => {
    const matchesSearch = c.razon_social
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesIngeniero =
      !selectedIngenieroId ||
      c.ingenieros?.some((ing) => ing.id === Number(selectedIngenieroId));
    const matchesTipoCliente =
      !selectedTipoClienteId ||
      c.tipo_cliente_id === Number(selectedTipoClienteId) ||
      c.tipo_cliente?.id === Number(selectedTipoClienteId);
    const matchesStatus = hasSelectedStatus(c, statusFilters, visibleServices);

    return matchesSearch && matchesIngeniero && matchesTipoCliente && matchesStatus;
  });

  const { rows, sin, proceso, completos } = buildRows(clientesFiltrados);
  const visibleServiceCount =
    Object.values(visibleServices).filter(Boolean).length;
  const tableColSpan = 2 + visibleServiceCount;
  const hasActiveFilters =
    searchTerm ||
    selectedIngenieroId ||
    selectedTipoClienteId ||
    !Object.values(statusFilters).every(Boolean) ||
    !Object.values(visibleServices).every(Boolean);

  const toggleStatusFilter = (key) => {
    setStatusFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleServiceVisibility = (key) => {
    setVisibleServices((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-medium mb-0">Clientes</h6>
        <span className="badge rounded-pill bg-success-subtle text-success-emphasis">
          {rows.length} cliente{rows.length !== 1 ? 's' : ''} listado
          {rows.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="card mb-4">
        {/* Buscador — igual que antes */}
        <div
          className="container-table rounded mb-2 p-2"
          style={{ background: '#1c4f1b36' }}
        >
          <div className="row g-2">
            <div className="col-12 col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={selectedIngenieroId}
                onChange={(e) => setSelectedIngenieroId(e.target.value)}
              >
                <option value="">Todos los ingenieros</option>
                {ingenieros.map((ingeniero) => (
                  <option key={ingeniero.id} value={ingeniero.id}>
                    {ingeniero.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4">
              <select
                className="form-select"
                value={selectedTipoClienteId}
                onChange={(e) => setSelectedTipoClienteId(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                {tipoClientes.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.tipoClientes ?? tipo.nombre ?? tipo.tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="d-flex flex-column flex-lg-row gap-3 mt-3">
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="text-muted small fw-medium me-1">Estado</span>
              <ToggleButton
                id="dashboard-filter-pendientes"
                label="Pendientes"
                checked={statusFilters.pendientes}
                onChange={() => toggleStatusFilter('pendientes')}
              />
              <ToggleButton
                id="dashboard-filter-proceso"
                label="En proceso"
                checked={statusFilters.proceso}
                onChange={() => toggleStatusFilter('proceso')}
              />
              <ToggleButton
                id="dashboard-filter-cerradas"
                label="Cerradas"
                checked={statusFilters.cerradas}
                onChange={() => toggleStatusFilter('cerradas')}
              />
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <span className="text-muted small fw-medium me-1">Mostrar</span>
              <ToggleButton
                id="dashboard-show-maquinas"
                label="Máquinas"
                checked={visibleServices.maquinas}
                onChange={() => toggleServiceVisibility('maquinas')}
              />
              <ToggleButton
                id="dashboard-show-muestras"
                label="Muestras"
                checked={visibleServices.muestras}
                onChange={() => toggleServiceVisibility('muestras')}
              />
              <ToggleButton
                id="dashboard-show-jornadas"
                label="Jornadas"
                checked={visibleServices.jornadas}
                onChange={() => toggleServiceVisibility('jornadas')}
              />
            </div>
          </div>
        </div>

        {/* ✅ Leyenda de colores — referencia fija de qué significa cada color */}
        <LeyendaEstados />

        {/* Renderizado condicional */}
        {isMobile ? (
          <div className="p-2">
            <ClientesMobileList
              rows={rows}
              hasActiveFilters={hasActiveFilters}
              visibleServices={visibleServices}
              onSelect={handleCliente}
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              {/* thead y tbody exactamente igual que antes — sin ningún cambio */}
              <thead className="table-light">
                <tr>
                  <th style={{ width: '30%' }}>Cliente</th>
                  {SERVICE_COLUMNS.filter(
                    ({ key }) => visibleServices[key],
                  ).map(({ key, label }) => (
                    <th key={key}>{label}</th>
                  ))}
                  <th className="text-center" style={{ width: 90 }}>
                    Lts. Est.
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableColSpan}
                      className="text-center text-muted py-4"
                    >
                      {hasActiveFilters
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

                      {visibleServices.maquinas && (
                        <td>
                          <EstadoServicio
                            cerradas={row.calCerradas}
                            proceso={row.calProceso}
                            pendientes={row.calPendientes}
                            total={row.totalCal}
                            unitLabel="máq."
                          />
                        </td>
                      )}
                      {visibleServices.muestras && (
                        <td>
                          <EstadoServicio
                            cerradas={row.aguaCerradas}
                            proceso={row.aguaProceso}
                            pendientes={row.aguaPendientes}
                            total={row.totalAgua}
                            unitLabel="poz."
                          />
                        </td>
                      )}
                      {visibleServices.jornadas && (
                        <td>
                          <EstadoServicio
                            cerradas={row.jorCerradas}
                            proceso={row.jorProceso}
                            pendientes={row.jorPendientes}
                            total={row.totalJornada}
                          />
                        </td>
                      )}

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
