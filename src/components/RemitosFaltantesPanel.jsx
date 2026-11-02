import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, Layers } from 'lucide-react';
import { getRemitosFaltantes } from '../api/remitos';
import Spinner from './Spinner';
import '../css/page-header.css';
import '../css/remitosFaltantes.css';

const STATUS_COLORS = {
  PENDIENTE: '#EF9F27',
  REVISION: '#3b82f6',
  COMPLETADO: '#146c43',
  ANULADO: '#dc3545',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR');
};

const RemitosFaltantesPanel = ({ depositos = [], ingenieros = [] }) => {
  const [filtroDeposito, setFiltroDeposito] = useState('');
  const [filtroIngeniero, setFiltroIngeniero] = useState('');
  const [agrupar, setAgrupar] = useState(true);
  const [soloConFaltantes, setSoloConFaltantes] = useState(false);
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarInforme = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const res = await getRemitosFaltantes({
        depositoId: filtroDeposito ? Number(filtroDeposito) : null,
        ingenieroId: filtroIngeniero ? Number(filtroIngeniero) : null,
        agrupar,
      });

      setDatos(res.data ?? null);
    } catch (err) {
      console.error('Error al cargar faltantes de remitos:', err);
      setDatos(null);
      setError(
        err.response?.data?.mensaje ||
          err.response?.data?.message ||
          err.message ||
          'No se pudo cargar el informe de faltantes',
      );
    } finally {
      setLoading(false);
    }
  }, [filtroDeposito, filtroIngeniero, agrupar]);

  useEffect(() => {
    cargarInforme();
  }, [cargarInforme]);

  const gruposBase = useMemo(() => {
    const lista = datos?.grupos ?? [];

    if (filtroDeposito && filtroIngeniero) {
      return lista.filter(
        (grupo) => grupo.deposito_id === Number(filtroDeposito),
      );
    }

    return lista;
  }, [datos, filtroDeposito, filtroIngeniero]);

  const grupos = useMemo(
    () =>
      soloConFaltantes
        ? gruposBase.filter((grupo) => grupo.total_faltantes > 0)
        : gruposBase,
    [gruposBase, soloConFaltantes],
  );

  const resumen = useMemo(
    () => ({
      total_remitos: gruposBase.reduce(
        (acc, grupo) => acc + grupo.total_remitos,
        0,
      ),
      total_faltantes: gruposBase.reduce(
        (acc, grupo) => acc + grupo.total_faltantes,
        0,
      ),
      depositos_con_faltantes: gruposBase.filter(
        (grupo) => grupo.total_faltantes > 0,
      ).length,
      total_depositos: gruposBase.length,
    }),
    [gruposBase],
  );

  const hayFiltros = Boolean(filtroDeposito || filtroIngeniero);

  const limpiarFiltros = () => {
    setFiltroDeposito('');
    setFiltroIngeniero('');
  };

  const exportarCsv = () => {
    const encabezado = ['Deposito', 'Desde', 'Hasta', 'Cantidad', 'Tipo'];
    const filas = [];

    gruposBase.forEach((grupo) => {
      const nombre = grupo.deposito
        ? `${grupo.deposito.nombre} (${grupo.deposito.codigo})`
        : `Deposito #${grupo.deposito_id}`;

      grupo.faltantes.forEach((faltante) => {
        filas.push([
          nombre,
          faltante.desde_texto,
          faltante.hasta_texto,
          String(faltante.cantidad),
          faltante.agrupado ? 'Rango' : 'Numero',
        ]);
      });
    });

    const escapar = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;
    const csv = [encabezado, ...filas]
      .map((fila) => fila.map(escapar).join(';'))
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faltantes-remitos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="remitos faltantes">
      <div className="remitos-filtros">
        <div className="remitos-filtros__group">
          <label className="remitos-filtros__label">Depósito</label>
          <select
            className="remitos-filtros__input"
            value={filtroDeposito}
            onChange={(e) => setFiltroDeposito(e.target.value)}
          >
            <option value="">Todos</option>
            {depositos.map((deposito) => (
              <option key={deposito.id} value={deposito.id}>
                {deposito.nombre} ({deposito.codigo})
              </option>
            ))}
          </select>
        </div>

        {ingenieros.length > 0 && (
          <div className="remitos-filtros__group">
            <label className="remitos-filtros__label">
              Ingeniero / Empleado
            </label>
            <select
              className="remitos-filtros__input"
              value={filtroIngeniero}
              onChange={(e) => setFiltroIngeniero(e.target.value)}
            >
              <option value="">Todos</option>
              {ingenieros.map((ingeniero) => (
                <option key={ingeniero.id} value={ingeniero.id}>
                  {ingeniero.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="remitos-filtros__group">
          <label className="remitos-filtros__label">Agrupación</label>
          <label className="faltantes-toggle">
            <input
              type="checkbox"
              checked={agrupar}
              onChange={(e) => setAgrupar(e.target.checked)}
            />
            Agrupar saltos mayores a 5
          </label>
        </div>

        <label className="faltantes-toggle">
          <input
            type="checkbox"
            checked={soloConFaltantes}
            onChange={(e) => setSoloConFaltantes(e.target.checked)}
          />
          Solo depósitos con faltantes
        </label>

        <button
          className="remitos-filtros__limpiar"
          onClick={limpiarFiltros}
          disabled={!hayFiltros}
        >
          Limpiar filtros
        </button>

        <button
          className="faltantes-btn"
          onClick={exportarCsv}
          disabled={!resumen.total_faltantes}
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="faltantes-alerta faltantes-alerta--error">{error}</div>
      )}

      {datos?.scope === 'PARCIAL' && (
        <div className="faltantes-alerta faltantes-alerta--warning">
          <AlertTriangle size={14} />
          Análisis parcial: solo se consideran los remitos de los clientes
          asignados a tu usuario, por lo que los saltos detectados pueden no
          ser reales.
        </div>
      )}

      {datos && !error && (
        <div className="faltantes-modo">
          <span className="faltantes-chip">
            {datos.modo === 'agrupados'
              ? `Saltos agrupados (corridas de más de ${datos.umbral_agrupacion})`
              : 'Cada número faltante por separado'}
          </span>
        </div>
      )}

      {loading ? (
        <div className="faltantes-cargando">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="faltantes-resumen">
            <div className="faltantes-resumen__card">
              <span className="faltantes-resumen__label">
                Remitos analizados
              </span>
              <strong className="faltantes-resumen__valor">
                {resumen.total_remitos}
              </strong>
            </div>
            <div className="faltantes-resumen__card faltantes-resumen__card--alerta">
              <span className="faltantes-resumen__label">
                Números faltantes
              </span>
              <strong className="faltantes-resumen__valor">
                {resumen.total_faltantes}
              </strong>
            </div>
            <div className="faltantes-resumen__card">
              <span className="faltantes-resumen__label">
                Depósitos con faltantes
              </span>
              <strong className="faltantes-resumen__valor">
                {resumen.depositos_con_faltantes}
              </strong>
            </div>
            <div className="faltantes-resumen__card">
              <span className="faltantes-resumen__label">
                Depósitos analizados
              </span>
              <strong className="faltantes-resumen__valor">
                {resumen.total_depositos}
              </strong>
            </div>
          </div>

          {grupos.length === 0 ? (
            <div className="remitos-box">
              <p className="remitos-vacio">
                {hayFiltros
                  ? 'Sin resultados para los filtros aplicados'
                  : 'Sin remitos registrados'}
              </p>
            </div>
          ) : (
            grupos.map((grupo) => (
              <div className="remitos-box" key={grupo.deposito_id}>
                <div className="remitos-box__header">
                  <h4 className="remitos-box__title">
                    <Layers size={16} />
                    {grupo.deposito
                      ? `${grupo.deposito.nombre} (${grupo.deposito.codigo})`
                      : `Depósito #${grupo.deposito_id}`}
                  </h4>
                  <div className="faltantes-box__meta">
                    <span>{grupo.total_remitos} remitos</span>
                    {grupo.total_faltantes > 0 ? (
                      <span className="faltantes-chip faltantes-chip--alerta">
                        <AlertTriangle size={12} />
                        {grupo.total_faltantes} faltantes
                      </span>
                    ) : (
                      <span className="faltantes-chip faltantes-chip--ok">
                        Sin faltantes
                      </span>
                    )}
                    {grupo.numeracion_min && (
                      <span>
                        Serie: {grupo.numeracion_min} — {grupo.numeracion_max}
                      </span>
                    )}
                    {grupo.siguiente_numero && (
                      <span>Próximo: {grupo.siguiente_numero}</span>
                    )}
                    {grupo.truncado && (
                      <span className="faltantes-chip faltantes-chip--alerta">
                        Lista truncada: {grupo.total_faltantes} faltantes
                      </span>
                    )}
                  </div>
                </div>

                <div className="remitos-scroll">
                  <table className="faltantes-tabla">
                    <thead>
                      <tr>
                        <th>Número</th>
                        <th>Tipo</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.filas.map((fila, index) => {
                        if (fila.tipo === 'faltante') {
                          return (
                            <tr
                              key={`falta-${fila.desde}-${index}`}
                              className="faltantes-fila faltantes-fila--falta"
                            >
                              <td className="faltantes-fila__numero">
                                {fila.agrupado
                                  ? `${fila.desde_texto} … ${fila.hasta_texto}`
                                  : fila.desde_texto}
                              </td>
                              <td
                                colSpan={4}
                                className="faltantes-fila__detalle"
                              >
                                {fila.agrupado
                                  ? `Faltante (${fila.cantidad} números)`
                                  : 'Faltante'}
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={fila.id} className="faltantes-fila">
                            <td className="faltantes-fila__numero">
                              {fila.remito_number}
                            </td>
                            <td>
                              <span
                                className={`remitos-badge ${
                                  fila.type === 'OFICIAL'
                                    ? 'remitos-badge--oficial'
                                    : 'remitos-badge--no-oficial'
                                }`}
                              >
                                {fila.type === 'OFICIAL' ? 'Oficial' : 'No Oficial'}
                              </span>
                            </td>
                            <td>{fila.cliente ?? `Cliente #${fila.cliente_id}`}</td>
                            <td>{formatDate(fila.createdAt)}</td>
                            <td>
                              <span
                                className={`remitos-badge remitos-badge--${(
                                  fila.status || 'PENDIENTE'
                                ).toLowerCase()}`}
                                style={{
                                  backgroundColor:
                                    STATUS_COLORS[fila.status] ??
                                    STATUS_COLORS.PENDIENTE,
                                }}
                              >
                                {fila.status || 'PENDIENTE'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default RemitosFaltantesPanel;
