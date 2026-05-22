import React, { useState, useEffect, useCallback, useRef } from 'react';
import { addNota, upNota, delNotas, notasCliente } from '../api/notas';

import Spinner from './Spinner';
import ModalEliminar from './ModalEliminar';
import { formatFecha } from '../utils/formatFecha';

// ─── Constantes ────────────────────────────────────────────────────────────────

const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

export const EMPTY_NOTA = {
  fecha: getToday(),
  comentario: '',
  cliente_id: null,
};

// ─── Sub-componente: Tarjeta de nota en el listado ────────────────────────────

const NotaCard = ({
  nota,
  onEdit,
  setShowEliminar,
  setNotaSelected,
  isDeleting,
}) => {
  const fechaFormateada = nota.fecha ? formatFecha(nota.fecha) : '—';

  return (
    <div className="nota-card">
      <div className="nota-card__header">
        <span className="nota-card__fecha">
          <i className="bi bi-calendar3 me-1"></i>
          {fechaFormateada}
        </span>
        <div className="nota-card__actions">
          <button
            className="nota-card__btn nota-card__btn--edit"
            onClick={() => onEdit(nota)}
            title="Editar nota"
            disabled={isDeleting}
          >
            <i className="bi bi-pencil-fill"></i>
          </button>
          <button
            className="nota-card__btn nota-card__btn--delete"
            onClick={() => {
              setNotaSelected(nota); // 👈 usar la nota del map
              setShowEliminar(true);
            }}
            title="Eliminar nota"
            disabled={isDeleting === nota.id} // 👈 mejora recomendada
          >
            {isDeleting === nota.id ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              />
            ) : (
              <i className="bi bi-trash-fill"></i>
            )}
          </button>{' '}
        </div>
      </div>
      <p className="nota-card__comentario">{nota.comentario}</p>
    </div>
  );
};

// ─── Sub-componente: Formulario crear/editar ──────────────────────────────────

const NotaForm = ({
  formData,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}) => (
  <div className="nota-form">
    <h6 className="nota-form__title">
      <i
        className={`bi ${formData.id ? 'bi-pencil-square' : 'bi-plus-circle-fill'} me-2`}
      ></i>
      {formData.id ? 'Editar nota' : 'Nueva nota'}
    </h6>

    {/* Fecha */}
    <div className="form-group mb-3">
      <label className="form-label">
        <i className="bi bi-calendar3 me-1"></i>
        Fecha
      </label>
      <input
        type="date"
        name="fecha"
        className={`form-control form-control--dark ${errors.fecha ? 'is-invalid' : ''}`}
        value={formData.fecha}
        onChange={onChange}
        disabled={isSubmitting}
      />
      {errors.fecha && (
        <div className="invalid-feedback">
          <i className="bi bi-exclamation-circle me-1"></i>
          {errors.fecha}
        </div>
      )}
    </div>

    {/* Comentario */}
    <div className="form-group mb-3">
      <label className="form-label">
        <i className="bi bi-chat-left-text-fill me-1"></i>
        Comentario
      </label>
      <textarea
        name="comentario"
        rows={3}
        className={`form-control form-control--dark ${errors.comentario ? 'is-invalid' : ''}`}
        placeholder="Escribí el contenido de la nota..."
        value={formData.comentario}
        onChange={onChange}
        disabled={isSubmitting}
      />
      {errors.comentario && (
        <div className="invalid-feedback">
          <i className="bi bi-exclamation-circle me-1"></i>
          {errors.comentario}
        </div>
      )}
    </div>

    {errors.submit && (
      <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2">
        <i className="bi bi-exclamation-triangle-fill"></i>
        {errors.submit}
      </div>
    )}

    {/* Acciones del formulario */}
    <div className="d-flex justify-content-end gap-2">
      <button
        type="button"
        className="btn-cancel"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <i className="bi bi-x-circle me-1"></i>
        Cancelar
      </button>
      <button
        type="button"
        className="btn-save"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Guardando...
          </>
        ) : (
          <>
            <i
              className={`bi ${formData.id ? 'bi-check-circle' : 'bi-plus-circle'} me-1`}
            ></i>
            {formData.id ? 'Actualizar' : 'Guardar'}
          </>
        )}
      </button>
    </div>
  </div>
);

// ─── Componente principal: ModalNotas ─────────────────────────────────────────

const ModalNotas = ({ isOpen, onClose, clienteId, userId }) => {
  const [notas, setNotas] = useState([]);
  const [formData, setFormData] = useState({ ...EMPTY_NOTA });
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);
  const [notaSelected, setNotaSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [scrollToForm, setScrollToForm] = useState(false);
  const formRef = useRef(null);

  // usuario_id desde localStorage

  // ── Carga de notas ──────────────────────────────────────────────────────────

  const fetchNotas = useCallback(async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      setMsg('Cargando notas...');
      const data = await notasCliente(clienteId, null);

      const notasOrdenadas = data?.data.sort(
        (b, a) => new Date(b.fecha) - new Date(a.fecha),
      );

      setNotas(notasOrdenadas);
    } catch (error) {
      console.error('Error al cargar notas:', error);
      setNotas([]);
    } finally {
      setLoading(false);
      setMsg('');
    }
  }, [clienteId]);

  useEffect(() => {
    if (isOpen) fetchNotas();
  }, [isOpen, fetchNotas]);

  // ── Handlers del formulario ────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.comentario?.trim())
      newErrors.comentario = 'El comentario es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setLoading(true);

      const payload = {
        ...formData,
        cliente_id: clienteId,
        usuario_id: userId,
      };

      if (formData.id) {
        setMsg('Actualizando nota...');
        await upNota(payload);
      } else {
        setMsg('Guardando nota...');
        await addNota(payload);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMsg(formData.id ? 'Nota actualizada' : 'Nota guardada');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchNotas();
      handleCancelForm();
    } catch (error) {
      console.error('Error al guardar nota:', error);
      setErrors({ submit: 'Error al guardar la nota. Intentá nuevamente.' });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setTimeout(() => setMsg(''), 2000);
    }
  };

  // ── Editar ─────────────────────────────────────────────────────────────────

  const handleEdit = (nota) => {
    setFormData({
      id: nota.id,
      fecha: nota.fecha?.split('T')[0] ?? '',
      comentario: nota.comentario ?? '',
    });
    setErrors({});
    setShowForm(true);
    setScrollToForm(true);
  };

  useEffect(() => {
    if (showForm && scrollToForm) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setScrollToForm(false);
    }
  }, [showForm, scrollToForm]);

  // ── Eliminar ───────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    const { cliente_id, id } = notaSelected;
    try {
      setShowEliminar(false);
      setLoading(true);
      setDeletingId(id);
      setMsg('Eliminando nota...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await delNotas(cliente_id, id);

      setMsg('Nota eliminada');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setNotas((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      setMsg('Error al eliminar la nota. Intentá nuevamente.');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setLoading(false);
      setDeletingId(null);
      setMsg('');
    }
  };

  // ── Reset form ─────────────────────────────────────────────────────────────

  const handleCancelForm = () => {
    setFormData({ ...EMPTY_NOTA });
    setErrors({});
    setShowForm(false);
  };

  const handleClose = () => {
    handleCancelForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div
          className="modal-container modal-container--notas"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="modal-header">
            <div className="d-flex align-items-center gap-3">
              <div className="modal-icon-container">
                <i className="bi bi-journal-text"></i>
              </div>
              <div>
                <h3 className="modal-title-pozos mb-1">Notas del cliente</h3>
                <p className="modal-subtitle-pozos mb-0">
                  {notas.length > 0
                    ? `${notas.length} nota${notas.length !== 1 ? 's' : ''} registrada${notas.length !== 1 ? 's' : ''}`
                    : 'Sin notas registradas'}
                </p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={handleClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="modal-body-pozos">
            {/* Formulario (visible solo cuando se crea o edita) */}
            {showForm && (
              <div ref={formRef}>
                <NotaForm
                  formData={formData}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onCancel={handleCancelForm}
                />
              </div>
            )}

            {/* Botón agregar (visible solo cuando no hay formulario abierto) */}
            {!showForm && (
              <button
                type="button"
                className="btn-agregar-nota mb-3"
                onClick={() => {
                  setFormData({ ...EMPTY_NOTA });
                  setErrors({});
                  setShowForm(true);
                }}
              >
                <i className="bi bi-plus-circle-fill me-2"></i>
                Agregar nota
              </button>
            )}

            {/* Separador visual */}
            {showForm && notas.length > 0 && (
              <div className="nota-separador">
                <span>Notas anteriores</span>
              </div>
            )}

            {/* Listado de notas */}
            {notas.length > 0 ? (
              <div className="notas-lista">
                {notas.map((nota) => (
                  <NotaCard
                    key={nota.id}
                    nota={nota}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isDeleting={deletingId}
                    setNotaSelected={setNotaSelected}
                    setShowEliminar={setShowEliminar}
                  />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="notas-empty">
                  <i className="bi bi-journal-x"></i>
                  <p>No hay notas registradas para este cliente</p>
                </div>
              )
            )}
          </div>

          {/* ── Footer ── */}
          <div className="modal-footer justify-content-end">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              <i className="bi bi-x-circle me-2"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {showEliminar && (
        <ModalEliminar
          handleEliminar={handleDelete}
          onCancelar={() => setShowEliminar(false)}
          servicio={'nota'}
        />
      )}

      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default ModalNotas;
