import { React, useEffect, useState } from 'react';
import ModalPozos from './ModalPozos';
import { clientePozos } from '../api/pozos';
import { useNavigate } from 'react-router-dom';
import { getStatusClass } from '../utils/statusMap';
import { useCliente } from '../context/UserContext';
import { apiGenerarInformeMultiplePozos } from '../api/informes';
import generarPDF from '../utils/generarPdf';

const Pozos = ({ cliente_id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pozos, setPozos] = useState([]);
  const [onlyView, setOnlyView] = useState(false);
  const [pozoId, setPozoId] = useState([]);
  const [conclusion, setConclusion] = useState('');
  const [showConclusion, setShowConclusion] = useState(false);
  const [errorConclusion, setErrorConclusion] = useState('');
  const [generando, setGenerando] = useState(false);

  const navigate = useNavigate();
  const { setSelectedPozo, selectedPozo } = useCliente();

  useEffect(() => {
    getPozos();
  }, []);

  const getPozos = async () => {
    try {
      const res = await clientePozos(cliente_id);
      setPozos(res.data);
    } catch (error) {
      console.error('Error al traer pozos:', error);
    }
  };

  const handleInformes = (e, pozoIdNum) => {
    e.stopPropagation();
    setPozoId((prev) =>
      prev.includes(pozoIdNum)
        ? prev.filter((i) => i !== pozoIdNum)
        : [...prev, pozoIdNum],
    );
  };

  const handleAbrirModalConclusion = () => {
    setConclusion('');
    setErrorConclusion('');
    setShowConclusion(true);
  };

  const handleCerrarModalConclusion = () => {
    if (generando) return;
    setShowConclusion(false);
    setConclusion('');
    setErrorConclusion('');
  };

  const handleConclusion = (e) => {
    setConclusion(e.target.value);
    if (errorConclusion) setErrorConclusion('');
  };

  const generarInformeMultiplesPozos = async () => {
    if (!conclusion.trim()) {
      setErrorConclusion('La conclusión es requerida para generar el informe');
      return;
    }
    try {
      setGenerando(true);
      const blob = await apiGenerarInformeMultiplePozos(
        cliente_id,
        pozoId,
        conclusion.trim(),
      );
      if (blob.type !== 'application/pdf') {
        console.error('El servidor no devolvió un PDF válido');
        return;
      }
      const filename = `informe_${cliente_id}_pozos_${pozoId.join('_')}.pdf`;
      generarPDF(blob, filename, 'preview');
      handleCerrarModalConclusion();
      setPozoId([]);
    } catch (error) {
      console.error('Error al generar informe múltiple:', error);
      setErrorConclusion(
        'Ocurrió un error al generar el informe. Intentá nuevamente.',
      );
    } finally {
      setGenerando(false);
    }
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

          {/* BARRA DE SELECCIÓN */}
          {pozoId.length > 0 && (
            <div className="pozos-selection-bar mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="pozos-selection-icon">
                  <i className="bi bi-ui-checks"></i>
                </div>
                <div>
                  <span className="pozos-selection-count">{pozoId.length}</span>
                  <span className="pozos-selection-label">
                    {' '}
                    pozo{pozoId.length > 1 ? 's' : ''} seleccionado
                    {pozoId.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="pozos-btn-limpiar"
                  onClick={() => setPozoId([])}
                >
                  <i className="bi bi-x-lg me-1"></i>Limpiar
                </button>
                <button
                  className="pozos-btn-informe"
                  onClick={handleAbrirModalConclusion}
                >
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i>Generar
                  Informe
                </button>
              </div>
            </div>
          )}

          {/* GRID */}
          <div className="pozos-container">
            {pozos.map((pozo) => {
              const isSelected = pozoId.includes(pozo.id);
              return (
                <div
                  className={`card_pozos ${isSelected ? 'card_pozos--selected' : ''}`}
                  key={pozo.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPozo(pozo);
                    setIsOpen(true);
                    setOnlyView(true);
                  }}
                >
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
                    <div className="d-flex align-items-center gap-2">
                      <label
                        className={`pozo-checkbox-label ${isSelected ? 'pozo-checkbox-label--checked' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        title={
                          isSelected
                            ? 'Quitar del informe'
                            : 'Agregar al informe'
                        }
                      >
                        <input
                          type="checkbox"
                          className="pozo-checkbox-input"
                          checked={isSelected}
                          onChange={(e) => handleInformes(e, pozo.id)}
                        />
                        <span className="pozo-checkbox-custom">
                          {isSelected && <i className="bi bi-check-lg"></i>}
                        </span>
                      </label>
                      <div className="pozo-id-badge">
                        <span className="fw-bold pozo-id-text">#{pozo.id}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="pozo-selected-indicator mb-2">
                      <i className="bi bi-file-earmark-check"></i>
                      Incluido en el informe
                    </div>
                  )}

                  <hr className="pozo-divider" />

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

                  <div className="d-flex gap-2 mt-3 pt-3 pozo-actions">
                    <button
                      className="btn btn-sm flex-fill pozo-btn-ver"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPozo(pozo);
                        const url = `/cliente/${cliente_id}/detalles/pozos/${pozo.id}/muestras`;
                        console.log('uuuuuuuuuurrrrrrrrrrrrrlllllllllll', url);
                        navigate(url);
                      }}
                    >
                      <i className="bi bi-eye me-1"></i>Muestras
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
                      <i className="bi bi-pencil me-1"></i>Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL POZO */}
      {selectedPozo && (
        <ModalPozos
          pozo={selectedPozo}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSaved={getPozos}
          onlyView={onlyView}
        />
      )}

      {/* MODAL CONCLUSIÓN */}
      {showConclusion && (
        <div className="modal-overlay" onClick={handleCerrarModalConclusion}>
          <div
            className="modal-container modal-conclusion"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon">
                  <i className="bi bi-file-earmark-text-fill"></i>
                </div>
                <div>
                  <h3 className="modal-title mb-1">Conclusión del Informe</h3>
                  <p className="modal-subtitle mb-0">
                    Para las últimas muestras de los pozos seleccionados
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={handleCerrarModalConclusion}
                disabled={generando}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/*  <div className="modal-conclusion-pozos-resumen"> */}

            <div className="modal-body">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i
                  className="bi bi-check-circle-fill"
                  style={{ color: '#22c55e', fontSize: '13px' }}
                ></i>
                <span className="modal-conclusion-resumen-titulo">
                  {pozoId.length} pozo{pozoId.length > 1 ? 's' : ''} incluido
                  {pozoId.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {pozoId.map((id) => {
                  const pozo = pozos.find((p) => p.id === id);
                  return (
                    <span key={id} className="modal-conclusion-pozo-chip">
                      <i className="bi bi-droplet-fill me-1"></i>
                      {pozo?.nombre ?? `Pozo #${id}`}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="modal-body">
              <label htmlFor="conclusion" className="modal-conclusion-label">
                Conclusión final <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="conclusion"
                name="conclusion"
                className={`modal-conclusion-textarea ${errorConclusion ? 'modal-conclusion-textarea--error' : ''}`}
                placeholder="Describí las conclusiones del análisis de calidad del agua para los pozos seleccionados..."
                value={conclusion}
                onChange={handleConclusion}
                disabled={generando}
              />
              {errorConclusion ? (
                <div className="modal-conclusion-error">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {errorConclusion}
                </div>
              ) : (
                <small className="modal-conclusion-hint">
                  <i className="bi bi-info-circle me-1"></i>
                  Este texto se incluirá como conclusión final en el informe
                  PDF.
                </small>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCerrarModalConclusion}
                disabled={generando}
              >
                <i className="bi bi-x-circle me-1"></i>Cancelar
              </button>
              <button
                type="button"
                className="btn btn-save"
                onClick={generarInformeMultiplesPozos}
                disabled={generando}
              >
                {generando ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Generando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-pdf-fill me-1"></i>
                    Generar Informe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pozos;
