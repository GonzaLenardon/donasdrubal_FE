import { stateColors } from '../utils/colors';

const MaquinasMobileList = ({
  maquinas,
  modoSeleccion,
  seleccionado,
  onSeleccionar,
  onEditar,
  onVerCalibraciones,
}) => {
  if (maquinas.length === 0) {
    return (
      <p className="text-center text-white-50 py-3" style={{ fontSize: 14 }}>
        Sin máquinas registradas
      </p>
    );
  }

  return (
    <div className="maquinas-mobile-grid">
      {maquinas.map((maq) => {
        const isSelected = seleccionado === maq.id;
        const estado = maq?.calibracionesmaquina?.[0]?.estado;

        const colorBadge =
          estado === 'CERRADO'
            ? stateColors.COLOR_CERRADAS
            : estado === 'EN PROCESO'
              ? stateColors.COLOR_PROCESO
              : stateColors.COLOR_PENDIENTES;

        return (
          <div
            key={maq.id}
            className={`maquina-card ${isSelected ? 'maquina-card--selected' : ''}`}
            onClick={() => modoSeleccion && onSeleccionar(maq.id)}
            style={{ cursor: modoSeleccion ? 'pointer' : 'default' }}
          >
            {/* Header */}
            <div className="maquina-card__header">
              {modoSeleccion && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSeleccionar(maq.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="maquina-card__checkbox"
                />
              )}
              <span className="maquina-card__marca">{maq.tipo.marca}</span>
              <span
                className="maquina-card__badge"
                style={{ backgroundColor: colorBadge }}
              >
                {estado || 'Sin cal.'}
              </span>
            </div>

            {/* Modelo + Tipo */}
            <div className="maquina-card__modelo">
              <span>{maq.tipo.modelo}</span>
              <span className="maquina-card__tipo">{maq.tipo.tipo}</span>
            </div>

            {/* Specs */}
            <div className="maquina-card__specs">
              <div className="maquina-card__specs-numeric">
                <span>
                  <i className="bi bi-arrows-expand me-1"></i>
                  {maq.ancho_trabajo}
                </span>
                <span>
                  <i className="bi bi-droplet-fill me-1"></i>
                  {maq.capacidad_tanque}
                </span>
                <span>
                  <i className="bi bi-hash me-1"></i>
                  {maq.numero_picos} picos
                </span>
              </div>
              <span className="maquina-card__specs-extra">
                <i className="bi bi-scissors me-1"></i>
                {maq.sistema_corte}
              </span>
            </div>

            {/* Operario */}
            {maq.responsable && (
              <div className="maquina-card__operario">
                <i className="bi bi-person-fill me-1"></i>
                {maq.responsable}
              </div>
            )}

            {/* Footer */}
            {!modoSeleccion && (
              <div className="maquina-card__footer">
                <button
                  className="btn btn-sm btn-outline-info"
                  style={{ fontSize: 11, padding: '2px 8px', flex: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerCalibraciones(maq);
                  }}
                >
                  <i className="bi bi-eye me-1"></i>Calibraciones
                </button>
                <button
                  className="btn btn-sm btn-outline-light"
                  style={{ fontSize: 11, padding: '2px 8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditar(maq);
                  }}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MaquinasMobileList;
