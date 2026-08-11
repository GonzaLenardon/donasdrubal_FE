import { stateColors } from '../utils/colors';

const formatFecha = (fecha) =>
  fecha
    ? new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '-';

const JornadasMobileList = ({
  jornadas,
  isAdmin,
  modoSeleccion,
  seleccionado,
  onSeleccionar,
  onEditar,
  onReabrir,
}) => {
  if (jornadas.length === 0) {
    return (
      <p className="text-center text-white-50 py-3" style={{ fontSize: 14 }}>
        Sin jornadas registradas
      </p>
    );
  }

  return (
    <div className="jornadas-mobile-grid">
      {jornadas.map((m) => {
        const isClosed = m.estado === 'CERRADO';
        const isSelected = seleccionado === m.id;

        const colorBadge =
          m.estado === 'CERRADO'
            ? stateColors.COLOR_CERRADAS
            : m.estado === 'EN PROCESO'
              ? stateColors.COLOR_PROCESO
              : stateColors.COLOR_PENDIENTES;

        return (
          <div
            key={m.id}
            className={`jornada-card ${isSelected ? 'jornada-card--selected' : ''}`}
            onClick={() => modoSeleccion && onSeleccionar(m.id)}
            style={{ cursor: modoSeleccion ? 'pointer' : 'default' }}
          >
            {/* Header */}
            <div className="jornada-card__header">
              {modoSeleccion && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSeleccionar(m.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="jornada-card__checkbox"
                />
              )}
              <span className="jornada-card__id">#{m.id}</span>
              <span
                className="jornada-card__badge"
                style={{ backgroundColor: colorBadge }}
              >
                {m.estado}
              </span>
            </div>

            {/* Fecha */}
            <span className="jornada-card__fecha">
              {formatFecha(m.fecha_jornada)}
            </span>

            {/* Motivo */}
            <p className="jornada-card__motivo">{m.motivo || '-'}</p>

            {/* Responsable */}
            {m.responsable?.nombre && (
              <div className="jornada-card__responsable">
                <i className="bi bi-person-fill me-1"></i>
                {m.responsable.nombre}
              </div>
            )}

            {/* Footer */}
            {!modoSeleccion && (!isClosed || isAdmin) && (
              <div className="jornada-card__footer">
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default JornadasMobileList;
