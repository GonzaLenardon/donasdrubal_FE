import React, { useState, useEffect } from 'react';
import { upNota, delNotas } from '../api/notas';
import { formatFecha } from '../utils/formatFecha';
import ModalEliminar from './ModalEliminar';
import Spinner from './Spinner';

// ─── Constantes ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  id: null,
  fecha: '',
  comentario: '',
  usuario_id: null,
  cliente_id: null,
};

// ─── Utils ─────────────────────────────────────────────────────────────────────

/**
 * Extrae los clientes únicos del array de notas para el dropdown de filtro.
 */
const extractClientes = (notas) => {
  const map = new Map();
  notas.forEach(({ cliente_id, cliente }) => {
    if (!map.has(cliente_id)) {
      map.set(cliente_id, {
        id: cliente_id,
        razon_social: cliente?.razon_social ?? `Cliente #${cliente_id}`,
      });
    }
  });
  return Array.from(map.values()).sort((a, b) =>
    a.razon_social.localeCompare(b.razon_social),
  );
};

// ─── Sub-componente: Formulario de edición inline ─────────────────────────────

const NotaEditForm = ({
  formData,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}) => (
  <div className="drawer-edit-form">
    <h6 className="drawer-edit-form__title">
      <i className="bi bi-pencil-square me-2"></i>
      Editando nota
    </h6>

    {/* Cliente (solo lectura) */}
    <div className="form-group mb-3">
      <label className="form-label">
        <i className="bi bi-building me-1"></i>
        Cliente
      </label>
      <input
        type="text"
        className="form-control form-control--dark"
        value={formData.razon_social ?? ''}
        disabled
      />
    </div>

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
            <i className="bi bi-check-circle me-1"></i>
            Actualizar
          </>
        )}
      </button>
    </div>
  </div>
);

// ─── Sub-componente: Card de nota (modo admin) ────────────────────────────────

const NotaCardAdmin = ({ nota, onEdit, onDeleteRequest, deletingId }) => {
  const fechaFormateada = nota.fecha ? formatFecha(nota.fecha) : '—';
  const isDeleting = deletingId === nota.id;

  return (
    <div className="nota-card nota-card--admin">
      {/* Razon social destacada */}
      <div className="nota-card__cliente">
        <i className="bi bi-building me-1"></i>
        {nota.cliente?.razon_social ?? `Cliente #${nota.cliente_id}`}
      </div>

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
            onClick={() => onDeleteRequest(nota)}
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

      <p className="nota-card__comentario">{nota.comentario}</p>
    </div>
  );
};

// ─── Componente principal: DrawerNotasUsuario ─────────────────────────────────

const DrawerNotasUsuario = ({
  isOpen,
  onClose,
  notas: notasIniciales = [],
  nombreUsuario,
}) => {
  const [notas, setNotas] = useState([]);
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [clientes, setClientes] = useState([]);

  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [showEliminar, setShowEliminar] = useState(false);
  const [notaSelected, setNotaSelected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // ── Sincronizar notas y clientes cuando cambia el prop ────────────────────

  useEffect(() => {
    if (isOpen) {
      // Ordenar por fecha descendente al abrir
      const ordenadas = [...notasIniciales].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha),
      );
      setNotas(ordenadas);
      setClientes(extractClientes(notasIniciales));
      setClienteFiltro('');
      setShowForm(false);
      setFormData({ ...EMPTY_FORM });
      setErrors({});
    }
  }, [isOpen, notasIniciales]);

  // ── Notas filtradas ───────────────────────────────────────────────────────

  const notasFiltradas = clienteFiltro
    ? notas.filter((n) => String(n.cliente_id) === clienteFiltro)
    : notas;

  // ── Handlers formulario ───────────────────────────────────────────────────

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

  const handleEdit = (nota) => {
    setFormData({
      id: nota.id,
      fecha: nota.fecha?.split('T')[0] ?? '',
      comentario: nota.comentario ?? '',
      // CRÍTICO: preservar usuario_id y cliente_id originales de la nota
      usuario_id: nota.usuario_id,
      cliente_id: nota.cliente_id,
      razon_social: nota.cliente?.razon_social ?? '',
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setLoading(true);
      setMsg('Actualizando nota...');

      // Payload explícito: nunca se incluye el id del admin,
      // se usa el usuario_id que vino en la nota original.
      const payload = {
        id: formData.id,
        fecha: formData.fecha,
        comentario: formData.comentario,
        usuario_id: formData.usuario_id, // ← usuario original preservado
        cliente_id: formData.cliente_id,
      };

      await upNota(payload);
      await new Promise((r) => setTimeout(r, 800));
      setMsg('Nota actualizada');
      await new Promise((r) => setTimeout(r, 1500));

      // Actualizar estado local sin refetch
      setNotas((prev) =>
        prev.map((n) =>
          n.id === formData.id
            ? {
                ...n,
                fecha: formData.fecha + 'T00:00:00.000Z',
                comentario: formData.comentario,
              }
            : n,
        ),
      );

      handleCancelForm();
    } catch (error) {
      console.error('Error al actualizar nota:', error);
      setErrors({ submit: 'Error al actualizar la nota. Intentá nuevamente.' });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setTimeout(() => setMsg(''), 1000);
    }
  };

  const handleCancelForm = () => {
    setFormData({ ...EMPTY_FORM });
    setErrors({});
    setShowForm(false);
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────

  const handleDeleteRequest = (nota) => {
    setNotaSelected(nota);
    setShowEliminar(true);
  };

  const handleDelete = async () => {
    if (!notaSelected) return;
    const { id, cliente_id } = notaSelected;

    try {
      setShowEliminar(false);
      setDeletingId(id);
      setLoading(true);
      setMsg('Eliminando nota...');
      await new Promise((r) => setTimeout(r, 800));
      await delNotas(cliente_id, id);

      setMsg('Nota eliminada');
      await new Promise((r) => setTimeout(r, 1500));

      // Actualizar estado local y recalcular clientes disponibles
      setNotas((prev) => {
        const actualizadas = prev.filter((n) => n.id !== id);
        setClientes(extractClientes(actualizadas));
        // Si el cliente filtrado ya no tiene notas, limpiar filtro
        const sigueExistiendo = actualizadas.some(
          (n) => String(n.cliente_id) === clienteFiltro,
        );
        if (!sigueExistiendo) setClienteFiltro('');
        return actualizadas;
      });
    } catch (error) {
      console.error('Error al eliminar nota:', error);
      setMsg('Error al eliminar. Intentá nuevamente.');
      await new Promise((r) => setTimeout(r, 2000));
    } finally {
      setDeletingId(null);
      setLoading(false);
      setNotaSelected(null);
      setTimeout(() => setMsg(''), 500);
    }
  };

  // ── Close ─────────────────────────────────────────────────────────────────

  const handleClose = () => {
    handleCancelForm();
    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop ${isOpen ? 'drawer-backdrop--visible' : ''}`}
        onClick={handleClose}
      />

      {/* Panel lateral */}
      <div className={`drawer-panel ${isOpen ? 'drawer-panel--open' : ''}`}>
        {/* ── Header ── */}
        <div className="drawer-header">
          <div className="d-flex align-items-center gap-3">
            <div className="modal-icon-container">
              <i className="bi bi-journal-text"></i>
            </div>
            <div>
              <h3 className="modal-title-pozos mb-1">
                Notas de {nombreUsuario ?? 'usuario'}
              </h3>
              <p className="modal-subtitle-pozos mb-0">
                {notas.length > 0
                  ? `${notas.length} nota${notas.length !== 1 ? 's' : ''} · ${clientes.length} cliente${clientes.length !== 1 ? 's' : ''}`
                  : 'Sin notas registradas'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={handleClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* ── Filtro por cliente ── */}
        {clientes.length > 1 && !showForm && (
          <div className="drawer-filter">
            <select
              className="form-control form-control--dark"
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
            >
              <option value="">
                <i className="bi bi-funnel"></i> Todos los clientes
              </option>
              {clientes.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.razon_social}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ── Body ── */}
        <div className="drawer-body">
          {/* Formulario de edición */}
          {showForm && (
            <NotaEditForm
              formData={formData}
              errors={errors}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={handleCancelForm}
            />
          )}

          {/* Separador cuando el form está abierto y hay notas */}
          {showForm && notasFiltradas.length > 0 && (
            <div className="nota-separador mt-3">
              <span>Notas registradas</span>
            </div>
          )}

          {/* Listado de notas */}
          {!loading && notasFiltradas.length === 0 ? (
            <div className="notas-empty">
              <i className="bi bi-journal-x"></i>
              <p>
                {clienteFiltro
                  ? 'No hay notas para este cliente'
                  : 'Este usuario no tiene notas registradas'}
              </p>
            </div>
          ) : (
            <div className="notas-lista">
              {notasFiltradas.map((nota) => (
                <NotaCardAdmin
                  key={nota.id}
                  nota={nota}
                  onEdit={handleEdit}
                  onDeleteRequest={handleDeleteRequest}
                  deletingId={deletingId}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="drawer-footer">
          <button type="button" className="btn-cancel" onClick={handleClose}>
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </button>
        </div>
      </div>

      {showEliminar && (
        <ModalEliminar
          handleEliminar={handleDelete}
          onCancelar={() => setShowEliminar(false)}
          servicio="nota"
        />
      )}

      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default DrawerNotasUsuario;
