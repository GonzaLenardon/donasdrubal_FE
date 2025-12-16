import { React, useEffect, useState } from 'react';
import ModalPozos from './ModalPozos';

const Pozos = ({ pozos }) => {
  const [selectedPozo, setSelectedPozo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('Pozo Seleccionado', selectedPozo);
  }, [selectedPozo]);

  const getEstadoColor = (estado) => {
    const colors = {
      Activo: { bg: '#22c55e', border: '#16a34a' },
      Inactivo: { bg: '#ef4444', border: '#dc2626' },
      Mantenimiento: { bg: '#f59e0b', border: '#d97706' },
    };
    return colors[estado] || { bg: '#6b7280', border: '#4b5563' };
  };

  return (
    <>
      <div className="pozos-wrapper">
        <div className="pozos-content">
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-1 pozos-title">
                Gestión de Pozos
              </h2>
              <p className="text-white-50 mb-0 pozos-subtitle">
                {pozos.length} pozos registrados
              </p>
            </div>
            <button className="btn text-white d-flex align-items-center gap-2 shadow-lg pozos-btn-nuevo">
              <i className="bi bi-plus-lg"></i>
              Nuevo Pozo
            </button>
          </div>

          {/* GRID DE POZOS */}
          <div className="pozos-container">
            {pozos.map((pozo) => {
              const estadoColor = getEstadoColor(pozo.estado);

              return (
                <div
                  className="card_pozos"
                  key={pozo.id}
                  onClick={() => setSelectedPozo(pozo)}
                >
                  {/* Header de la Card */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div style={{ flex: 1 }}>
                      <h5 className="fw-bold text-white mb-1 pozo-nombre">
                        {pozo.nombre}
                      </h5>
                      <span
                        className="badge pozo-estado-badge"
                        style={{
                          backgroundColor: estadoColor.bg,
                          border: `2px solid ${estadoColor.border}`,
                        }}
                      >
                        {pozo.estado}
                      </span>
                    </div>
                    <div className="pozo-id-badge">
                      <span className="fw-bold pozo-id-text">#{pozo.id}</span>
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="pozo-divider" />

                  {/* Información del Pozo */}
                  <div className="d-flex flex-column gap-2">
                    {/* Establecimiento */}
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-building pozo-icon"></i>
                      <div style={{ flex: 1 }}>
                        <p className="mb-0 text-white-50 pozo-label">
                          Establecimiento
                        </p>
                        <p className="mb-0 text-white fw-semibold pozo-value">
                          {pozo.establecimiento}
                        </p>
                      </div>
                    </div>

                    {/* Coordenadas */}
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-geo-alt-fill pozo-icon"></i>
                      <div style={{ flex: 1 }}>
                        <p className="mb-0 text-white-50 pozo-label">
                          Coordenadas
                        </p>
                        <p className="mb-0 text-white pozo-coords">
                          {pozo.latitud}, {pozo.longitud}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer con Acciones */}
                  <div className="d-flex gap-2 mt-3 pt-3 pozo-actions">
                    <button
                      className="btn btn-sm flex-fill pozo-btn-ver"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Ver detalles:', pozo);
                      }}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Ver
                    </button>
                    <button
                      className="btn btn-sm flex-fill pozo-btn-editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPozo(pozo);
                        setIsOpen(true);
                      }}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedPozo && (
        <ModalPozos
          pozo={selectedPozo}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
export default Pozos;
