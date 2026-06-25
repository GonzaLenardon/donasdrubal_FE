import React, { useState, useEffect, useRef } from 'react';
import { addNota, upNota, delNotas, notasCliente } from '../api/notas';

import Spinner from './Spinner';
import ModalEliminar from './ModalEliminar';
import { formatFecha } from '../utils/formatFecha';

// ─── Constantes ────────────────────────────────────────────────────────────────

const getToday = () => new Date().toISOString().split('T')[0];

const EMPTY_NOTA = {
  fecha: getToday(),
  comentario: '',
  cliente_id: null,
};

// ─── Sub-componente: Tarjeta de nota ─────────────────────────────────────────

const NotaCard = ({
  nota,
  onEdit,
  setShowEliminar,
  setNotaSelected,
  deletingId,
}) => {
  const fechaFormateada = nota.fecha ? formatFecha(nota.fecha) : '—';
  const isDeleting = deletingId === nota.id;

  return (
    <div className="nc-card">
      <div className="nc-card__header">
        <span className="nc-card__fecha">
          <i className="bi bi-calendar3 me-1"></i>
          {fechaFormateada}
        </span>
        <div className="nc-card__actions">
          <button
            className="nc-card__btn nc-card__btn--edit"
            onClick={() => onEdit(nota)}
            title="Editar nota"
            disabled={isDeleting}
          >
            <i className="bi bi-pencil-fill"></i>
          </button>
          <button
            className="nc-card__btn nc-card__btn--delete"
            onClick={() => {
              setNotaSelected(nota);
              setShowEliminar(true);
            }}
            title="Eliminar nota"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              />
            ) : (
              <i className="bi bi-trash-fill"></i>
            )}
          </button>
        </div>
      </div>
      <p className="nc-card__comentario">{nota.comentario}</p>
    </div>
  );
};

// ─── Sub-componente: Modal de formulario ──────────────────────────────────────

const NotaFormModal = ({
  formData,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}) => (
  <div className="notas-form-overlay" onClick={onCancel}>
    <div className="notas-form-modal" onClick={(e) => e.stopPropagation()}>
      {/* Header del modal */}
      <div className="notas-form-modal__header">
        <div className="d-flex align-items-center gap-2">
          <i
            className={`bi ${formData.id ? 'bi-pencil-square' : 'bi-plus-circle-fill'}`}
          ></i>
          <h6 className="mb-0">{formData.id ? 'Editar nota' : 'Nueva nota'}</h6>
        </div>
        <button
          className="notas-form-modal__close"
          onClick={onCancel}
          disabled={isSubmitting}
          title="Cerrar"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Body del modal */}
      <div className="notas-form-modal__body">
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
            rows={4}
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
      </div>

      {/* Footer del modal */}
      <div className="notas-form-modal__footer">
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
  </div>
);

// ─── Componente principal: NotasCliente ───────────────────────────────────────

const NotasCliente = ({ clienteId, userId }) => {
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

  // ── Carga de notas al montar ───────────────────────────────────────────────

  const fetchNotas = async () => {
    if (!clienteId) return;
    try {
      setLoading(true);
      setMsg('Cargando notas...');
      const data = await notasCliente(clienteId, null);
      const notasOrdenadas = (data?.data ?? []).sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha),
      );
      setNotas(notasOrdenadas);
    } catch (error) {
      console.error('Error al cargar notas:', error);
      setNotas([]);
    } finally {
      setLoading(false);
      setMsg('');
    }
  };

  useEffect(() => {
    fetchNotas();
  }, [clienteId]);

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
  };

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

  const handleNuevaNota = () => {
    setFormData({ ...EMPTY_NOTA });
    setErrors({});
    setShowForm(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="notas-container">
        {/* ── Header de sección ── */}
        <div className="notas-header">
          <div className="d-flex align-items-center gap-3">
            <div className="notas-header__icon">
              <i className="bi bi-journal-text"></i>
            </div>
            <div>
              <h3 className="notas-header__title mb-0">Notas del cliente</h3>
              <p className="notas-header__subtitle mb-0">
                {notas.length > 0
                  ? `${notas.length} nota${notas.length !== 1 ? 's' : ''} registrada${notas.length !== 1 ? 's' : ''}`
                  : 'Sin notas registradas'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleNuevaNota}
          >
            <i className="bi bi-plus-circle-fill me-2"></i>
            Nueva nota
          </button>
        </div>

        {/* ── Grilla de notas ── */}
        {!loading && notas.length > 0 && (
          <div className="notas-grid">
            {notas.map((nota) => (
              <NotaCard
                key={nota.id}
                nota={nota}
                onEdit={handleEdit}
                deletingId={deletingId}
                setNotaSelected={setNotaSelected}
                setShowEliminar={setShowEliminar}
              />
            ))}
          </div>
        )}

        {/* ── Estado vacío ── */}
        {!loading && notas.length === 0 && (
          <div className="notas-empty">
            <i className="bi bi-journal-x"></i>
            <p>No hay notas registradas para este cliente</p>
          </div>
        )}
      </div>

      {/* ── Modal formulario ── */}
      {showForm && (
        <NotaFormModal
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
        />
      )}

      {/* ── Modal eliminar ── */}
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

export default NotasCliente;
