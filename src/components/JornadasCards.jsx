import { React, useEffect, useState } from 'react';
import ModalPozos from './ModalPozos';
import { clienteJornadas } from '../api/jornadas';
import { useNavigate } from 'react-router-dom';

const Jornadas = ({ cliente_id }) => {
  const [selectedJornada, setSelectedJornada] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [jornadas, setJornadas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getJornadas();
  }, []);

  const getEstadoColor = (estado) => {
    const colors = {
      Activo: { bg: '#22c55e', border: '#16a34a' },
      Inactivo: { bg: '#ef4444', border: '#dc2626' },
      Mantenimiento: { bg: '#f59e0b', border: '#d97706' },
    };
    return colors[estado] || { bg: '#6b7280', border: '#4b5563' };
  };

  const getJornadas = async () => {
    try {
      console.log('paso x aca JORNADAS', cliente_id);
      const res = await clienteJornadas(cliente_id);
      setJornadas(res.data);
      console.log('todas las JORNADAS', res.data);
    } catch (error) {
      console.log(error.data.message);
    }
  };

  return (
    <>
      <div className="pozos-wrapper">
        <div style={{ margin: '0 auto' }}>
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-1 pozos-title">
                Gestión de Jornadas
              </h2>
              <p className="text-white-50 mb-0 pozos-subtitle">
                {jornadas.length} jornadas registradas
              </p>
            </div>

            <button
              className="btn text-white d-flex align-items-center gap-2 shadow-lg maquina-btn-nuevo"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedJornada({ cliente_id });
                setIsOpen(true);
              }}
            >
              <i className="bi bi-plus-lg"></i>
              Nueva Jornada ccc
            </button>
          </div>

          {/* GRID DE JORNADAS */}
          <div className="pozos-container">
            {jornadas.map((jornada) => {
              const estadoColor = getEstadoColor(jornada.estado);

              return (
                <div
                  className="card_pozos"
                  key={jornada.id}
                  onClick={() => setSelectedJornada(jornada)}
                >
                  {/* Header de la Card */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div style={{ flex: 1 }}>
                      <h5 className="fw-bold text-white mb-1 pozo-nombre">
                        {jornada.motivo}
                      </h5>
                      <span
                        className="badge pozo-estado-badge"
                        style={{
                          backgroundColor: estadoColor.bg,
                          border: `2px solid ${estadoColor.border}`,
                        }}
                      >
                        {jornada.fecha_jornada}
                      </span>
                    </div>
                    <div className="pozo-id-badge">
                      <span className="fw-bold pozo-id-text">
                        #{jornada.id}
                      </span>
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
                          {jornada.observaciones}
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
                          {/* {jornada.latitud}, {jornada.longitud} */}
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
                          `/cliente/${cliente_id}/jornadas/${jornada.id}`,
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
                        setSelectedJornada(jornada);
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

      {selectedJornada && (
        <ModalJornadas
          jornada={selectedJornada}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSaved={getJornadas}
        />
      )}
    </>
  );
};
export default Jornadas;
