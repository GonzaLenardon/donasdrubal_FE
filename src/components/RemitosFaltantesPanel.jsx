import { useMemo, useState } from 'react';
import { AlertTriangle, Download, Layers } from 'lucide-react';
import {
  analizarRemitos,
  construirCsvFaltantes,
  construirFilasGrupo,
  formatNumeroRemito,
  UMBRAL_GRUPADO_POR_DEFECTO,
} from '../utils/remitosFaltantes';
import '../css/page-header.css';
import '../css/remitosFaltantes.css';

const STATUS_COLORS = {
  PENDIENTE: '#EF9F27',
  REVISION: '#3b82f6',
  COMPLETADO: '#146c43',
  ANULADO: '#dc3545',
};

const OPCIONES_UMBRAL = [
  { value: '3', label: 'Agrupar desde 3' },
  { value: '5', label: 'Agrupar desde 5' },
  { value: '10', label: 'Agrupar desde 10' },
  { value: '999999', label: 'No agrupar' },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-AR');
};

const RemitosFaltantesPanel = ({
  remitos = [],
  depositos = [],
  clientes = [],
  ingenieros = [],
}) => {
  const [filtroDeposito, setFiltroDeposito] = useState('');
  const [filtroIngeniero, setFiltroIngeniero] = useState('');
  const [umbral, setUmbral] = useState(String(UMBRAL_GRUPADO_POR_DEFECTO));
  const [soloConFaltantes, setSoloConFaltantes] = useState(false);

  const getNombreDeposito = (id) => {
    const deposito = depositos.find((dep) => dep.id === id);
    return deposito ? `${deposito.nombre} (${deposito.codigo})` : `Depósito #${id}`;
  };

  const getNombreCliente = (id) => {
    const cliente = clientes.find((cli) => cli.id === id);
    return cliente ? cliente.razon_social : `Cliente #${id}`;
  };

  const analisis = useMemo(
    () =>
      analizarRemitos(
        remitos,
        {
          depositoId: filtroDeposito,
          ingenieroId: filtroIngeniero,
          umbral: Number(umbral),
        },
        clientes,
      ),
    [remitos, clientes, filtroDeposito, filtroIngeniero, umbral],
  );

  const gruposVisibles = useMemo(
    () =>
      soloConFaltantes
        ? analisis.grupos.filter((grupo) => grupo.totalFaltantes > 0)
        : analisis.grupos,
    [analisis.grupos, soloConFaltantes],
  );

  const hayFiltros = Boolean(filtroDeposito || filtroIngeniero);

  const limpiarFiltros = () => {
    setFiltroDeposito('');
    setFiltroIngeniero('');
  };

  const exportarCsv = () => {
    const csv = construirCsvFaltantes(analisis.grupos, getNombreDeposito);
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
          <select
            className="remitos-filtros__input"
            value={umbral}
            onChange={(e) => setUmbral(e.target.value)}
          >
            {OPCIONES_UMBRAL.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
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
          disabled={analisis.totalFaltantes === 0}
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      <div className="faltantes-resumen">
        <div className="faltantes-resumen__card">
          <span className="faltantes-resumen__label">Remitos analizados</span>
          <strong className="faltantes-resumen__valor">
            {analisis.totalRemitos}
          </strong>
        </div>
        <div className="faltantes-resumen__card faltantes-resumen__card--alerta">
          <span className="faltantes-resumen__label">Números faltantes</span>
          <strong className="faltantes-resumen__valor">
            {analisis.totalFaltantes}
          </strong>
        </div>
        <div className="faltantes-resumen__card">
          <span className="faltantes-resumen__label">Depósitos con faltantes</span>
          <strong className="faltantes-resumen__valor">
            {analisis.depositosConFaltantes}
          </strong>
        </div>
        <div className="faltantes-resumen__card">
          <span className="faltantes-resumen__label">Próximo número esperado</span>
          <strong className="faltantes-resumen__valor faltantes-resumen__valor--chico">
            {filtroDeposito && analisis.grupos[0]?.siguienteNumero
              ? formatNumeroRemito(
                  analisis.grupos[0].siguienteNumero,
                  analisis.grupos[0].ancho,
                )
              : 'Por depósito'}
          </strong>
        </div>
      </div>

      {gruposVisibles.length === 0 ? (
        <div className="remitos-box">
          <p className="remitos-vacio">
            {hayFiltros
              ? 'Sin resultados para los filtros aplicados'
              : 'Sin remitos registrados'}
          </p>
        </div>
      ) : (
        gruposVisibles.map((grupo) => {
          const filas = construirFilasGrupo(grupo);

          return (
            <div className="remitos-box" key={grupo.depositoId}>
              <div className="remitos-box__header">
                <h4 className="remitos-box__title">
                  <Layers size={16} />
                  {getNombreDeposito(grupo.depositoId)}
                </h4>
                <div className="faltantes-box__meta">
                  <span>{grupo.totalRemitos} remitos</span>
                  {grupo.totalFaltantes > 0 ? (
                    <span className="faltantes-chip faltantes-chip--alerta">
                      <AlertTriangle size={12} />
                      {grupo.totalFaltantes} faltantes
                    </span>
                  ) : (
                    <span className="faltantes-chip faltantes-chip--ok">
                      Sin faltantes
                    </span>
                  )}
                  {grupo.siguienteNumero !== null && (
                    <span>
                      Próximo:{' '}
                      {formatNumeroRemito(grupo.siguienteNumero, grupo.ancho)}
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
                    {filas.map((fila, index) => {
                      if (fila.tipo === 'faltante') {
                        return (
                          <tr
                            key={`falta-${fila.desde}-${index}`}
                            className="faltantes-fila faltantes-fila--falta"
                          >
                            <td className="faltantes-fila__numero">
                              {fila.agrupado ? (
                                <>
                                  {formatNumeroRemito(fila.desde, grupo.ancho)}{' '}
                                  …{' '}
                                  {formatNumeroRemito(fila.hasta, grupo.ancho)}
                                </>
                              ) : (
                                formatNumeroRemito(fila.desde, grupo.ancho)
                              )}
                            </td>
                            <td colSpan={4} className="faltantes-fila__detalle">
                              {fila.agrupado
                                ? `Faltante (${fila.cantidad} números)`
                                : 'Faltante'}
                            </td>
                          </tr>
                        );
                      }

                      const remito = fila.remito;

                      return (
                        <tr key={remito.id} className="faltantes-fila">
                          <td className="faltantes-fila__numero">
                            {remito.remito_number}
                          </td>
                          <td>
                            <span
                              className={`remitos-badge ${
                                remito.type === 'OFICIAL'
                                  ? 'remitos-badge--oficial'
                                  : 'remitos-badge--no-oficial'
                              }`}
                            >
                              {remito.type === 'OFICIAL' ? 'Oficial' : 'No Oficial'}
                            </span>
                          </td>
                          <td>{getNombreCliente(remito.destination_client_id)}</td>
                          <td>{formatDate(remito.createdAt)}</td>
                          <td>
                            <span
                              className={`remitos-badge remitos-badge--${(
                                remito.status || 'PENDIENTE'
                              ).toLowerCase()}`}
                              style={{
                                backgroundColor:
                                  STATUS_COLORS[remito.status] ??
                                  STATUS_COLORS.PENDIENTE,
                              }}
                            >
                              {remito.status || 'PENDIENTE'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default RemitosFaltantesPanel;
