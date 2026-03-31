import React, { useState, useEffect } from 'react';
import { addJornadas, upJornadas } from '../api/jornadas';
import Spinner from './Spinner';

const emptyJornada = {
  fecha_jornada: '',
  motivo: '',
  estado: '',
  observaciones: '',
};

const ESTADOS_JORNADA = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Alertado', label: 'Alertado' },
  { value: 'Vencido', label: 'Vencido' },
  { value: 'Completado', label: 'Completado' },
  { value: 'Cancelado', label: 'Cancelado' },
];

const MOTIVOS_JORNADA = [
  { value: 'Mezclas', label: 'Mezclas' },
  { value: 'Capacitacion', label: 'Capacitación' },
  { value: 'Otro', label: 'Otro' },
];

const ModalJornadas = ({ isOpen, onClose, jornada, onSaved }) => {
  const [formData, setFormData] = useState({ ...emptyJornada });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (jornada) {
      // crea objeto vacio -> completa con datos de jornada
      setFormData({
        ...emptyJornada,
        ...jornada,
        fecha_jornada: jornada.fecha_jornada?.split('T')[0] || '',
      });
    } else {
      // Modo crear
      resetForm();
    }
  }, [jornada, isOpen]);

  useEffect(() => {
    console.log('Form Data', formData);
  }, [formData]);

  const resetForm = () => {
    setFormData({ ...emptyJornada });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha_jornada) {
      newErrors.fecha_jornada = 'La fecha de jornada es requerida';
    }

    // if (!formData.observaciones.trim()) {
    //   newErrors.observaciones = 'Las observaciones son requeridas';
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Convertir latitud y longitud a números
      const dataToSend = {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
      };

      console.log('Datos a enviar:', dataToSend);

      let resp;
      if (dataToSend.id) resp = await upJornadas(dataToSend);
      else resp = await addJornadas(dataToSend);

      console.log('Response', resp);
      setMsg(resp.message);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Notificar éxito
      if (onSaved) {
        onSaved();
      }

      // Cerrar modal
      handleClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ submit: 'Error al guardar la Jornada. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setMsg('');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
            {/* Error general */}
            {errors.submit && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {errors.submit}
              </div>
            )}

            {/* Fecha Jornada */}
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                <i className="bi bi-pencil-fill me-2"></i>
                Fecha de la jornada
              </label>
              <input
                type="date"
                name="fecha_jornada"
                className={`form-control ${
                  errors.fecha_jornada ? 'is-invalid' : ''
                }`}
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

            {/* Motivo */}
            <div className="form-group">
              <label htmlFor="motivo" className="form-label">
                <i className="bi bi-building me-2"></i>
                Motivo
              </label>
              <select
                className="form-control form-control-jornadas"
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
            </div>

            {/* Estado */}
            <div className="form-group">
              <label htmlFor="estado" className="form-label">
                <i className="bi bi-building me-2"></i>
                Estado
              </label>
              <select
                className="form-control form-control-jornadas"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="">Seleccione un estado</option>

                {ESTADOS_JORNADA.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
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
                className={`form-control ${
                  errors.observaciones ? 'is-invalid' : ''
                }`}
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

            {/* Botones */}
            <div className="modal-footer">
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

      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default ModalJornadas;
