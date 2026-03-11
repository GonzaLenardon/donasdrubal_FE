import { React, useEffect, useState } from 'react';
import ModalPozos from './ModalPozos';
import { clientePozos } from '../api/pozos';
import { useNavigate } from 'react-router-dom';
import { getStatusClass } from '../utils/statusMap';
import { useCliente } from '../context/UserContext';
import { multiInformes } from '../api/informes';

const Pozos = ({ cliente_id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pozos, setPozos] = useState([]);
  const [onlyView, setOnlyView] = useState(false);
  const navigate = useNavigate();
  const { setSelectedPozo, selectedPozo } = useCliente();
  const [informes, setInformes] = useState([]);

  useEffect(() => {
    getPozos();
  }, []);

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

  const handleInformes = ({ target: { id, checked } }) => {
    setInformes((prev) =>
      checked ? [...prev, Number(id)] : prev.filter((i) => i !== Number(id)),
    );
  };

  const handleMultiInforme = async () => {
    const res = await multiInformes(cliente_id, informes);
    console.log('Informes', res);
  };

  return (
    <>
      <div className="pozos-wrapper">
        <div style={{ margin: '0 auto' }}>
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-1">Gestión de Pozos</h2>
              <p className="text-white-50 mb-0">
                {pozos.length} pozos registrados
              </p>
            </div>

            {informes.length > 0 && (
              <button
                className="btn text-white d-flex align-items-center gap-2 shadow-lg pozo-btn-nuevo"
                onClick={handleMultiInforme}
              >
                <i className="bi bi-plus-lg"></i>
                Generar Informe
              </button>
            )}

            <button
              className="btn text-white d-flex align-items-center gap-2 shadow-lg pozo-btn-nuevo"
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
              return (
                <div
                  className="card_pozos"
                  key={pozo.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPozo(pozo);
                    setIsOpen(true);
                    setOnlyView(true);
                  }}
                >
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div style={{ flex: 1 }}>
                      <h5 className="fw-bold text-white mb-1 pozo-nombre">
                        {pozo.nombre}
                      </h5>

                      <span
                        className={`status-badge ${getStatusClass(pozo.estado)}`}
                      >
                        {pozo.estado || 'Desconocido'}
                      </span>
                    </div>

                    <div className="pozo-id-badge">
                      <span className="fw-bold pozo-id-text">#{pozo.id}</span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between text-white">
                    <span>Multi Informe</span>

                    <input
                      type="checkbox"
                      id={pozo.id}
                      onClick={(e) => e.stopPropagation()} // ⭐ SOLUCIÓN
                      onChange={handleInformes}
                    />
                  </div>

                  {/* Divider */}
                  <hr className="pozo-divider" />

                  {/* Información */}
                  <div className="d-flex flex-column gap-2">
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

                  {/* Footer */}
                  <div className="d-flex gap-2 mt-3 pt-3 pozo-actions">
                    <button
                      className="btn btn-sm flex-fill pozo-btn-ver"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('pozito', pozo);
                        setSelectedPozo(pozo);

                        navigate(
                          `/cliente/${cliente_id}/detalles/pozos/${pozo.id}/muestras`,
                        );
                      }}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Muestras
                    </button>

                    <button
                      className="btn btn-sm flex-fill pozo-btn-editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPozo(pozo);
                        setIsOpen(true);
                        setOnlyView(false);
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
          onlyView={onlyView}
        />
      )}
    </>
  );
};

export default Pozos;
