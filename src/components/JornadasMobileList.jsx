// src/components/JornadasMobileList.jsx

const badgeConfig = {
  CERRADO: { className: 'badge bg-danger', label: 'Cerrado' },
  PENDIENTE: { className: 'badge bg-success', label: 'Pendiente' },
  'EN PROCESO': {
    className: 'badge bg-warning text-dark',
    label: 'En proceso',
  },
};

const formatFecha = (fecha) =>
  fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';

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
      <p
        style={{
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          padding: '1.5rem 0',
          fontSize: 14,
        }}
      >
        Sin jornadas registradas
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {jornadas.map((m) => {
        const isClosed = m.estado === 'CERRADO';
        const badge = badgeConfig[m.estado] ?? {
          className: 'badge bg-secondary',
          label: m.estado,
        };
        const isSelected = seleccionado === m.id;

        return (
          <div
            key={m.id}
            className={`jornada-card ${isSelected ? 'jornada-card--selected' : ''}`}
            onClick={() => modoSeleccion && onSeleccionar(m.id)}
            style={{ cursor: modoSeleccion ? 'pointer' : 'default' }}
          >
            {/* Header */}
            <div className="jornada-card__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {modoSeleccion && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSeleccionar(m.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 15,
                      height: 15,
                      cursor: 'pointer',
                      accentColor: '#ef4444',
                    }}
                  />
                )}
                <span className="jornada-card__fecha">
                  {formatFecha(m.fecha_jornada)}
                </span>
              </div>
              <div className="jornada-card__meta">
                <span
                  className={badge.className}
                  style={{ fontSize: '0.72rem', padding: '0.35rem 0.7rem' }}
                >
                  {badge.label}
                </span>
                <span className="jornada-card__id">#{m.id}</span>
              </div>
            </div>

            {/* Body */}
            <div className="jornada-card__body">
              <p className="jornada-card__motivo">{m.motivo || '-'}</p>
              {m.observaciones && (
                <p className="jornada-card__obs">{m.observaciones}</p>
              )}
            </div>

            {/* Footer */}
            {!modoSeleccion && (
              <div className="jornada-card__footer">
                {!isClosed && (
                  <button
                    className="btn btn-sm btn-outline-light"
                    style={{ fontSize: 12, opacity: 0.8, padding: '3px 10px' }}
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
                    style={{ fontSize: 12, padding: '3px 10px' }}
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
