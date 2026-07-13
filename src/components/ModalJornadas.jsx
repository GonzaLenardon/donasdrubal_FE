import React, { useState, useEffect } from 'react';
import { addJornadas, upJornadas, closeJornada } from '../api/jornadas';
import Spinner from './Spinner';
import ModalFinalizarServicios from './ModalFinalizarServicios';

const emptyJornada = {
  fecha_jornada: '',
  responsable_id: '',
  motivo: '',
  estado: 'PENDIENTE',
  observaciones: '',
};

const ESTADOS_JORNADA = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN PROCESO', label: 'En Proceso' },
  { value: 'VENCIDO', label: 'Vencido' },
  { value: 'CERRADO', label: 'Cerrado' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

const MOTIVOS_JORNADA = [
  { value: 'Mezclas', label: 'Mezclas' },
  { value: 'Capacitacion', label: 'Capacitación' },
  { value: 'Acronex', label: 'Acronex' },
  { value: 'Microvidas', label: 'Microvidas' },
  { value: 'Otro', label: 'Otro' },
];

const ModalJornadas = ({
  isOpen,
  onClose,
  jornada,
  ingenieros = [],
  onSaved,
}) => {
  const [formData, setFormData] = useState({ ...emptyJornada });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [showCerrar, setShowCerrar] = useState(false);

  console.log('Joooororororororororo', jornada, ingenieros);

  useEffect(() => {
    if (!isOpen) return;
    if (jornada) {
      setFormData({
        ...emptyJornada,
        ...jornada,

        fecha_jornada: jornada.fecha_jornada?.split('T')[0] || '',
      });
    } else {
      resetForm();
    }
  }, [jornada, isOpen]);

  const resetForm = () => {
    setFormData({ ...emptyJornada });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fecha_jornada) {
      newErrors.fecha_jornada = 'La fecha de jornada es requerida';
    }

    if (!formData.responsable_id) {
      newErrors.responsable_id = 'El responsable es requerido';
    }

    if (!formData.motivo) {
      newErrors.motivo = 'El motivo es requerido';
    }

    if (!formData.observaciones?.trim()) {
      newErrors.observaciones = 'Las observaciones son requeridas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      if (await saveJornada()) {
        if (onSaved) onSaved();
        handleClose();
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({
        submit:
          error.message || 'Error al guardar la jornada. Intente nuevamente.',
      });
      setMsg('Error al guardar');
      setTimeout(() => setMsg(''), 3000);
      return false;
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const saveJornada = async () => {
    if (!validateForm()) return false;
    setIsSubmitting(true);
    setLoading(true);
    try {
      setMsg('Procesando...');
      const { cliente, ...resto } = formData;

      console.log('REsto ', resto);

      const dataToSend = {
        ...resto,
        cliente_id: parseInt(formData.cliente_id),
      };

      let resp;
      if (dataToSend.id) {
        setMsg('Actualizando jornada...');
        resp = await upJornadas(dataToSend);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        setMsg('Guardando jornada...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        resp = await addJornadas(dataToSend);
      }

      setMsg(resp.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({
        submit: 'Error al guardar la Jornada. Intente nuevamente.',
      });
      setMsg('Error al guardar');
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } finally {
      setIsSubmitting(false);
    }
  };

  // La lógica de cerrar jornada la implementás vos acá
  const handleCerrarJornada = async () => {
    try {
      setLoading(true);
      setShowCerrar(false);
      const guardadoExitoso = await saveJornada();
      if (!guardadoExitoso) return;
      setMsg('Finalizando muestra...');
      const resp = await closeJornada(jornada.id);
      console.log('rsp finalizar', resp.message);
      setMsg('Jornada finalizada exitosamente');
      await new Promise((r) => setTimeout(r, 2000));

      if (onSaved) onSaved();

      handleClose();
    } catch (error) {
      console.error('Error al finalizar:', error);
      setMsg('Error al finalizar Jornada');
      await new Promise((r) => setTimeout(r, 3000));
    } finally {
      setLoading(false);
      // setMsg('');
    }
  };

  const handleClose = () => {
    resetForm();
    setShowCerrar(false);
    onClose();
  };

  // isFormComplete — se habilita el botón Cerrar solo si la jornada
  // tiene fecha y estado cargados (ajustá los campos según tu criterio)
  const isFormComplete = !!formData.fecha_jornada && !!formData.motivo;

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="d-flex align-items-center gap-3">
              <div className="modal-icon-container">
                <i className="bi bi-droplet-fill"></i>
              </div>
              <div>
                <h3 className="modal-title-pozos mb-1">
                  {jornada ? 'Editar Jornada' : 'Nueva Jornada'}
                </h3>
                <p className="modal-subtitle-pozos mb-0">
                  {jornada
                    ? 'Modifica la información de la jornada'
                    : 'Completa los datos de la nueva jornada'}
                </p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={handleClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Body */}
          <div className="modal-body-pozos">
            {errors.submit && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {errors.submit}
              </div>
            )}

            {/* Fecha Jornada */}
            <div className="form-group">
              <label htmlFor="fecha_jornada" className="form-label">
                <i className="bi bi-pencil-fill me-2"></i>
                Fecha de la jornada
              </label>
              <input
                type="date"
                name="fecha_jornada"
                className={`form-control ${errors.fecha_jornada ? 'is-invalid' : ''}`}
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
                value={formData.fecha_jornada}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.fecha_jornada && (
                <div className="invalid-feedback">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.fecha_jornada}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="motivo" className="form-label">
                <i className="bi bi-building me-2"></i>
                Ingeniero Responsable
              </label>
              <select
                className={`form-control form-control-jornadas ${errors.responsable_id ? 'is-invalid' : ''}`}
                name="responsable_id"
                value={formData.responsable_id}
                onChange={handleChange}
              >
                <option value="">Seleccione responsable</option>
                {ingenieros.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.nombre}
                  </option>
                ))}
              </select>
              {errors.responsable_id && (
                <div className="invalid-feedback">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.responsable_id}
                </div>
              )}
            </div>

            {/* Motivo */}
            <div className="form-group">
              <label htmlFor="motivo" className="form-label">
                <i className="bi bi-building me-2"></i>
                Motivo
              </label>
              <select
                className={`form-control form-control-jornadas ${errors.motivo ? 'is-invalid' : ''}`}
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
              >
                <option value="">Seleccione un motivo</option>
                {MOTIVOS_JORNADA.map((motivo) => (
                  <option key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </option>
                ))}
              </select>
              {errors.motivo && (
                <div className="invalid-feedback">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.motivo}
                </div>
              )}
            </div>

            {/* Observaciones */}
            <div className="form-group">
              <label htmlFor="observaciones" className="form-label">
                <i className="bi bi-building me-2"></i>
                Observaciones
              </label>
              <input
                type="text"
                id="observaciones"
                name="observaciones"
                className={`form-control ${errors.observaciones ? 'is-invalid' : ''}`}
                placeholder="Deje aqui algun comentario sobre la jornada..."
                value={formData.observaciones}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.observaciones && (
                <div className="invalid-feedback">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  {errors.observaciones}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer modal-footer--space-between">
              {/* Izquierda: Cerrar Jornada */}
              <button
                type="button"
                className="btn-finalizar"
                onClick={() => setShowCerrar(true)}
                disabled={!isFormComplete || isSubmitting}
                title={
                  !isFormComplete
                    ? 'Completá fecha, motivo y estado para finalizar la jornada'
                    : 'Finalizar la jornada'
                }
              >
                <i className="bi bi-check-circle-fill me-2"></i>
                Finalizar Jornada
              </button>

              {/* Derecha: Cancelar + Guardar */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {formData.id ? 'Actualizar' : 'Crear Jornada'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCerrar && (
        <ModalFinalizarServicios
          handleFinalizar={handleCerrarJornada}
          servicio="jornada"
          setShowFinalizar={() => setShowCerrar(false)}
          accion="finalizar"
          cantidad={1}
        />
      )}

      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default ModalJornadas;
