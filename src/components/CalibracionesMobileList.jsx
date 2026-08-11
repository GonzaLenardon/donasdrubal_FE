import { stateColors } from '../utils/colors';

const getEstadoColor = (estado) => {
  const colores = {
    'Muy bueno': { bg: '#059669', border: '#10b981', color: '#ffffff' },
    Bueno: { bg: '#16a34a', border: '#22c55e', color: '#ffffff' },
    Regular: { bg: '#f59e0b', border: '#fbbf24', color: '#000000' },
    Malo: { bg: '#dc2626', border: '#ef4444', color: '#ffffff' },
    'No aplica': { bg: '#6b7280', border: '#9ca3af', color: '#ffffff' },
  };
  return (
    colores[estado] || { bg: '#6b7280', border: '#9ca3af', color: '#ffffff' }
  );
};

const CalibracionesMobileList = ({
  calibraciones,
  ingenieros,
  isAdmin,
  modoSeleccion,
  seleccionados,
  onToggleSeleccion,
  onEditar,
  onReabrir,
  onVerDetalle,
  onVerPdf,
}) => {
  if (calibraciones.length === 0) {
    return (
      <p className="text-center text-white-50 py-3" style={{ fontSize: 14 }}>
        Sin calibraciones registradas
      </p>
    );
  }

  return (
    <div className="calificaciones-mobile-grid">
      {calibraciones.map((cal, i) => {
        const isClosed = cal.estado === 'CERRADO';
        const isSelected = seleccionados.includes(cal.id);

        const colorBadge =
          cal.estado === 'CERRADO'
            ? stateColors.COLOR_CERRADAS
            : cal.estado === 'EN PROCESO'
              ? stateColors.COLOR_PROCESO
              : stateColors.COLOR_PENDIENTES;

        const estadoMaquina = (() => {
          if (!cal.estado_maquina) return '';
          try {
            let parsed = cal.estado_maquina;
            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
            return parsed.estado || '';
          } catch {
            return '';
          }
        })();

        const estadoMaqColor = getEstadoColor(estadoMaquina);
        const ingResponsable = ingenieros?.find(
          (ing) => ing.id === cal.responsable_id,
        );

        const fechaFormateada = new Date(cal.fecha).toLocaleDateString(
          'es-AR',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          },
        );

        return (
          <div
            key={cal.id}
            className={`calificacion-card ${isSelected ? 'calificacion-card--selected' : ''}`}
            onClick={() => modoSeleccion && onToggleSeleccion(cal.id)}
            style={{ cursor: modoSeleccion ? 'pointer' : 'default' }}
          >
            {/* Header */}
            <div className="calificacion-card__header">
              <div className="d-flex align-items-center gap-2">
                {modoSeleccion && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSeleccion(cal.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="calificacion-card__checkbox"
                  />
                )}
                <div className="calificacion-card__id-fecha">
                  <span className="calificacion-card__id">#{i + 1}</span>
                  <span className="calificacion-card__fecha">
                    {fechaFormateada}
                  </span>
                </div>
              </div>
              <div className="calificacion-card__meta">
                <span
                  className="badge"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.35rem 0.7rem',
                    backgroundColor: colorBadge,
                  }}
                >
                  {cal.estado}
                </span>
                {estadoMaquina && (
                  <span
                    className="badge"
                    style={{
                      backgroundColor: estadoMaqColor.bg,
                      border: `2px solid ${estadoMaqColor.border}`,
                      color: estadoMaqColor.color,
                      fontSize: '0.72rem',
                      padding: '0.35rem 0.7rem',
                      fontWeight: '600',
                    }}
                  >
                    {estadoMaquina}
                  </span>
                )}
              </div>
            </div>

            {/* Responsable */}
            {ingResponsable && (
              <div className="calificacion-card__responsable">
                <i className="bi bi-person-fill me-1"></i>
                {ingResponsable.nombre}
              </div>
            )}

            {/* Footer */}
            {!modoSeleccion && (
              <div className="calificacion-card__footer">
                <button
                  className="btn btn-sm btn-outline-info"
                  style={{ fontSize: 11, padding: '2px 8px', flex: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerDetalle(cal);
                  }}
                >
                  <i className="bi bi-eye me-1"></i>Ver
                </button>
                {!isClosed && (
                  <button
                    className="btn btn-sm btn-outline-light"
                    style={{ fontSize: 11, padding: '2px 8px', flex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditar(cal);
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
                      onReabrir(cal);
                    }}
                  >
                    <i className="bi bi-arrow-repeat me-1"></i>Reabrir
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-danger"
                  style={{ fontSize: 11, padding: '2px 8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerPdf(cal);
                  }}
                >
                  <i className="bi bi-file-earmark-pdf-fill"></i>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalibracionesMobileList;
