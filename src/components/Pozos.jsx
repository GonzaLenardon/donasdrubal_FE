import { React, useEffect, useState } from 'react';
import ModalPozos from './ModalPozos';
import { clientePozos } from '../api/pozos';
import { useNavigate } from 'react-router-dom';

const Pozos = ({ cliente_id }) => {
  const [selectedPozo, setSelectedPozo] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pozos, setPozos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPozos();
  }, []);

  const getEstadoColor = (estado) => {
    const colors = {
      Activo: { bg: '#22c55e', border: '#16a34a' },
      Inactivo: { bg: '#ef4444', border: '#dc2626' },
      Mantenimiento: { bg: '#f59e0b', border: '#d97706' },
    };
    return colors[estado] || { bg: '#6b7280', border: '#4b5563' };
  };

  const getPozos = async () => {
    try {
      console.log('paso x aca POZOS', cliente_id);
      const res = await clientePozos(cliente_id);
      setPozos(res.data);
      console.log('todas los POZOS', res.data);
    } catch (error) {
      console.log(error.data.message);
    }
  };

  return (
    <>
      <div
        style={{
          /*  minHeight: '100vh', */
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '15px',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* HEADER */}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-1">Gestión de Pozos</h2>
              <p className="text-white-50 mb-0">
                {pozos.length} pozos registrados
              </p>
            </div>
            <button
              className="btn text-white d-flex align-items-center gap-2 shadow-lg pozos-btn-nuevo"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPozo({ cliente_id });
                setIsOpen(true);
              }}
            >
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
                        navigate(
                          `/cliente/${cliente_id}/detalles/pozos/${pozo.id}/muestras`
                        );
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
          onSaved={getPozos}
        />
      )}
    </>
  );
};
export default Pozos;
