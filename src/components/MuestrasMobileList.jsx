import { stateColors } from '../utils/colors';
import { formatFecha } from '../utils/formatFecha';

const getValorColor = (valor, min, max) => {
  if (valor === null || valor === undefined) {
    return { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' };
  }
  if (valor < min || valor > max) {
    return { color: '#fecaca', bg: 'rgba(220,38,38,0.25)' };
  }
  return { color: '#d1fae5', bg: 'rgba(16,185,129,0.25)' };
};

const getValorIcon = (valor, min, max) => {
  if (valor === null || valor === undefined) return '•';
  if (valor < min || valor > max) return '⚠';
  return '✓';
};

const MuestrasMobileList = ({
  muestras,
  isAdmin,
  modoSeleccion,
  seleccionados,
  onToggleSeleccion,
  onEditar,
  onReabrir,
  onVerInforme,
  onVerMuestra,
}) => {
  if (muestras.length === 0) {
    return (
      <p className="text-center text-white-50 py-3" style={{ fontSize: 14 }}>
        Sin muestras registradas
      </p>
    );
  }

  return (
    <div className="muestras-mobile-grid">
      {muestras.map((m) => {
        const isClosed = m.estado === 'CERRADO';
        const isSelected = seleccionados.includes(m.id);

        const colorBadge =
          m.estado === 'CERRADO'
            ? stateColors.COLOR_CERRADAS
            : m.estado === 'EN PROCESO'
              ? stateColors.COLOR_PROCESO
              : stateColors.COLOR_PENDIENTES;

        const ph = getValorColor(m.ph, 6.5, 8.5);
        const du = getValorColor(m.dureza, 0, 500);
        const al = getValorColor(m.alcalinidad, 0, 500);
        const sa = getValorColor(m.salinidad, 0, 1000);

        return (
          <div
            key={m.id}
            className={`muestra-card ${isSelected ? 'muestra-card--selected' : ''}`}
            onClick={() => {
              if (modoSeleccion) onToggleSeleccion(m.id);
              else if (!isClosed) onVerMuestra(m);
            }}
            style={{
              cursor: modoSeleccion
                ? 'pointer'
                : isClosed
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {/* Header */}
            <div className="muestra-card__header">
              {modoSeleccion && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSeleccion(m.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="muestra-card__checkbox"
                />
              )}
              <span className="muestra-card__id">#{m.id}</span>
              <span
                className="muestra-card__badge"
                style={{ backgroundColor: colorBadge }}
              >
                {m.estado}
              </span>
            </div>

            {/* Fechas */}
            <div className="muestra-card__fechas">
              <span className="muestra-card__fecha">
                <i className="bi bi-calendar3 me-1"></i>
                {formatFecha(m.fecha_muestra)}
              </span>
              {m.fecha_analisis && (
                <span className="muestra-card__fecha-analisis">
                  <i className="bi bi-flask me-1"></i>
                  Análisis: {formatFecha(m.fecha_analisis)}
                </span>
              )}
            </div>

            {/* Métricas principales */}
            <div className="muestra-card__specs-grid">
              {[
                { label: 'pH', v: m.ph, c: ph },
                { label: 'Dureza', v: m.dureza, c: du },
                { label: 'Alcalinidad', v: m.alcalinidad, c: al },
                { label: 'Salinidad', v: m.salinidad, c: sa },
              ].map((x) => (
                <div
                  key={x.label}
                  className="muestra-card__specs-item"
                  style={{ background: x.c.bg }}
                >
                  <span className="muestra-card__specs-label">{x.label}</span>
                  <span className="muestra-card__specs-value">
                    {getValorIcon(x.v, 0, 9999)} {x.v ?? '-'}
                  </span>
                </div>
              ))}
            </div>

            {/* Datos extra */}
            <div className="muestra-card__extra">
              <span className="muestra-card__extra-item">
                <i className="bi bi-lightning-charge-fill me-1"></i>
                F. Iónica: <strong>{m.fuerza_ionica ?? '-'}</strong>
              </span>
              <span className="muestra-card__extra-item">
                <i className="bi bi-prescription2 me-1"></i>
                Dosis Hard: <strong>{m.dosis || '-'}</strong>
              </span>
            </div>

            {/* Footer */}
            {!modoSeleccion && (
              <div className="muestra-card__footer">
                {!isClosed && (
                  <button
                    className="btn btn-sm btn-outline-light"
                    style={{ fontSize: 11, padding: '2px 8px', flex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditar(m);
                    }}
                  >
                    <i className="bi bi-pencil me-1"></i>Editar
                  </button>
                )}
                {isClosed && isAdmin && (
                  <button
                    className="btn btn-sm btn-outline-warning"
                    style={{ fontSize: 11, padding: '2px 8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReabrir(m);
                    }}
                  >
                    <i className="bi bi-arrow-repeat me-1"></i>Reabrir
                  </button>
                )}
                {m.informe && (
                  <button
                    className="btn btn-sm btn-outline-info"
                    style={{ fontSize: 11, padding: '2px 8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onVerInforme(m);
                    }}
                  >
                    <i className="bi bi-file-earmark-arrow-down"></i>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MuestrasMobileList;
