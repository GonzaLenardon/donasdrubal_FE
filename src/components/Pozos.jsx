import { React, useEffect, useState } from 'react';
import ModalPozos from './ModalPozos';
import { clientePozos, delPozo } from '../api/pozos'; // ← asegurate de exportar deletePozos
import { useNavigate } from 'react-router-dom';
import { useCliente } from '../context/UserContext';
import { apiGenerarInformeMultiplePozos } from '../api/informes';
import generarPDF from '../utils/generarPdf';
import ModalEliminar from './ModalEliminar';
import ModalInformativo from './ModalInformativo';
import Spinner from './Spinner';
import { Modal } from 'bootstrap';

const Pozos = ({ cliente_id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pozos, setPozos] = useState([]);
  const [onlyView, setOnlyView] = useState(false);
  const [pozoId, setPozoId] = useState([]);
  const [conclusion, setConclusion] = useState('');
  const [showConclusion, setShowConclusion] = useState(false);
  const [errorConclusion, setErrorConclusion] = useState('');
  const [generando, setGenerando] = useState(false);
  const [msg, setMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showInformativo, setShowInformativo] = useState(false);

  // ── Borrado ───────────────────────────────────────────────────────────────
  const [pozoAEliminar, setPozoAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  /*  const [showModalBloqueo, setShowModalBloqueo] = useState(false); */

  const navigate = useNavigate();
  const { setSelectedPozo, selectedPozo } = useCliente();

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.rol === 'Administrador';

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

  // ── Informe múltiple ──────────────────────────────────────────────────────

  const handleToggleInforme = (e, pozoIdNum) => {
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

  // ── Borrado ───────────────────────────────────────────────────────────────

  /**
   * Al clickear el ícono de basura en una card:
   * - Si el pozo tiene muestras asociadas → muestra ModalInformativo (bloqueo)
   * - Si no tiene muestras               → muestra ModalEliminar (confirmación)
   *
   * Nota: si tu API devuelve el conteo de muestras dentro del objeto pozo
   * (ej: pozo.muestrasAgua o pozo.cantidad_muestras), usá eso directamente.
   * Si no viene en el objeto, reemplazá por un fetch puntual acá.
   */

  const handleConfirmarBorrado = async () => {
    try {
      setShowConfirmarDelete(false);
      await delPozo(pozoAEliminar.id);

      setPozoAEliminar(null);

      setLoading(true);

      setMsg('Eliminando Pozo ...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMsg('Pozo eliminado exitosamente');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMsg('');
      await getPozos();
    } catch (error) {
      const status = error.response?.status;
      console.log('LLLLLegggogo aca ');

      if (status === 409) {
        setShowInformativo(true);
        return;
      }

      if (status === 404) {
        alert('El pozo no existe');
        return;
      }

      alert('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="pozos-wrapper">
        <div style={{ margin: '0 auto' }}>
          {/* ── Header ── */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-1">Gestión de Pozos</h2>
              <p className="text-white-50 mb-0" style={{ fontSize: '13px' }}>
                {pozos.length} pozos registrados
              </p>
            </div>
            <button
              className="pozo-btn-nuevo d-flex align-items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPozo({ cliente_id });
                setIsOpen(true);
              }}
            >
              <i className="bi bi-plus-lg" style={{ fontSize: '13px' }}></i>
              Nuevo Pozo
            </button>
          </div>

          {/* ── Barra de selección informe ── */}
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

          {/* ── Grid de cards ── */}
          <div className="pozos-grid">
            {pozos.map((pozo) => {
              const isSelected = pozoId.includes(pozo.id);
              return (
                <div
                  key={pozo.id}
                  className={`pcard ${isSelected ? 'pcard--selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPozo(pozo);
                    setIsOpen(true);
                    setOnlyView(true);
                  }}
                >
                  {/* Top: nombre + checkbox informe */}
                  <div className="pcard-top">
                    <div>
                      {isSelected && (
                        <div className="pcard-sel-indicator">
                          <i className="bi bi-check-circle-fill"></i>
                          En informe
                        </div>
                      )}
                      <p className="pcard-name">{pozo.nombre}</p>
                      <p className="pcard-id">#{pozo.id}</p>
                    </div>

                    <label
                      className="pcard-chk-label"
                      onClick={(e) => e.stopPropagation()}
                      title="Informe múltiple"
                    >
                      <input
                        type="checkbox"
                        className="pcard-chk-input"
                        checked={isSelected}
                        onChange={(e) => handleToggleInforme(e, pozo.id)}
                      />
                      <span className="pcard-chk-box">
                        {isSelected && (
                          <i className="bi bi-check-lg pcard-chk-icon"></i>
                        )}
                      </span>
                      <span className="pcard-chk-text">Informe</span>
                    </label>
                  </div>

                  {/* Datos */}
                  <div className="pcard-data">
                    <div className="pcard-row">
                      <i className="bi bi-building pcard-row-icon"></i>
                      <div>
                        <span className="pcard-row-label">Establecimiento</span>
                        <span className="pcard-row-val">
                          {pozo.establecimiento}
                        </span>
                      </div>
                    </div>
                    <div className="pcard-row">
                      <i className="bi bi-geo-alt-fill pcard-row-icon"></i>
                      <div>
                        <span className="pcard-row-label">Coordenadas</span>
                        <span className="pcard-row-val">
                          {pozo.latitud}, {pozo.longitud}
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="pcard-divider" />

                  {/* ── Acciones ── */}
                  <div className="pcard-actions">
                    <button
                      className="pcard-icon-btn pozo-btn-ver"
                      title="Ver muestras"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPozo(pozo);
                        navigate(
                          `/cliente/${cliente_id}/detalles/pozos/${pozo.id}/muestras`,
                        );
                      }}
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    <button
                      className="pcard-icon-btn pozo-btn-editar"
                      title="Editar pozo"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPozo(pozo);
                        setOnlyView(false);
                        setIsOpen(true);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    {/* Eliminar — solo Admin */}
                    {isAdmin && (
                      <button
                        className="pcard-icon-btn pozo-btn-eliminar"
                        title="Eliminar pozo"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPozoAEliminar(pozo);
                          setShowConfirmarDelete(true);
                        }}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Modal Pozo ── */}
      {selectedPozo && (
        <ModalPozos
          pozo={selectedPozo}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSaved={getPozos}
          onlyView={onlyView}
        />
      )}

      {/* ── Modal Conclusión ── */}
      {showConclusion && (
        <div className="modal-overlay" onClick={handleCerrarModalConclusion}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
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

            <div className="p-3 m-2">
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

            <div className="modal-body-conclusion-pozos">
              <label htmlFor="conclusion" className="modal-conclusion-label">
                Conclusión final <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="conclusion"
                name="conclusion"
                className={`modal-conclusion-textarea${errorConclusion ? ' modal-conclusion-textarea--error' : ''}`}
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

      {/* ── Modal confirmación borrado ── */}
      {showConfirmarDelete && (
        <ModalEliminar
          handleEliminar={handleConfirmarBorrado}
          onCancelar={() => setShowConfirmarDelete(false)}
          servicio="pozo"
          /*  detalle={`${pozoAEliminar.nombre} — ${pozoAEliminar.establecimiento}`} */
          cantidad={1}
        />
      )}

      {/* ── Modal bloqueo por muestras asociadas ── */}

      {showInformativo && (
        <ModalInformativo
          onClose={() => setShowInformativo(false)}
          tipo="Pozos"
          dependencias="muestras de agua"
        />
      )}
      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default Pozos;
