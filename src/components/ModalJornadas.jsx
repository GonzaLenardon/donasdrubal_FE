import React, { useState, useEffect } from 'react';
import { addJornadas, upJornadas } from '../api/jornadas';

const emptyJornada = {
  motivo: '',
  fecha_jornada: '',
  estado: '',
  observaciones: '',
};

const ModalJornadas = ({ isOpen, onClose, jornada, onSaved }) => {
  const [formData, setFormData] = useState({ ...emptyJornada });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('hay jornadas ?', jornada);

    if (!isOpen) return;

    if (jornada) {
      setFormData({ ...emptyJornada, ...jornada }); // crea objeto vacio ->completa con datos de jornada
    } else {
      // Modo crear
      resetForm();
    }
  }, [jornada, isOpen]);

  useEffect(() => {
    console.log('Form Data', formData);
  }, [formData]);

  const resetForm = () => {
    setFormData({
      motivo: '',
      fecha_jornada: '',
      observaciones: '',
    });
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

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.establecimiento.trim()) {
      newErrors.establecimiento = 'El establecimiento es requerido';
    }

    if (!formData.latitud) {
      newErrors.latitud = 'La latitud es requerida';
    } else if (isNaN(formData.latitud)) {
      newErrors.latitud = 'Debe ser un número válido';
    }

    if (!formData.longitud) {
      newErrors.longitud = 'La longitud es requerida';
    } else if (isNaN(formData.longitud)) {
      newErrors.longitud = 'Debe ser un número válido';
    }

    /*    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido';
    } */

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

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
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-pozos">
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

          {/* Nombre */}
          <div className="form-group-pozos">
            <label htmlFor="nombre" className="form-label-pozos">
              <i className="bi bi-pencil-fill me-2"></i>
              Nombre de la Jornada
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              className={`form-control-pozos ${
                errors.nombre ? 'is-invalid' : ''
              }`}
              placeholder="Ej: Jornada mezclas de agua"
              value={formData.nombre}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <div className="invalid-feedback-pozos">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.nombre}
              </div>
            )}
          </div>

          {/* Establecimiento */}
          <div className="form-group-pozos">
            <label htmlFor="establecimiento" className="form-label-pozos">
              <i className="bi bi-building me-2"></i>
              Establecimiento
            </label>
            <input
              type="text"
              id="establecimiento"
              name="establecimiento"
              className={`form-control-pozos ${
                errors.establecimiento ? 'is-invalid' : ''
              }`}
              placeholder="Ej: Campo La Esperanza"
              value={formData.establecimiento}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.establecimiento && (
              <div className="invalid-feedback-pozos">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.establecimiento}
              </div>
            )}
          </div>

          {/* Coordenadas */}
          <div className="row g-3">
            <div className="col-md-6">
              <div className="form-group-pozos">
                <label htmlFor="latitud" className="form-label-pozos">
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  Latitud
                </label>
                <input
                  type="text"
                  id="latitud"
                  name="latitud"
                  className={`form-control-pozos ${
                    errors.latitud ? 'is-invalid' : ''
                  }`}
                  placeholder="-31.4201"
                  value={formData.latitud}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.latitud && (
                  <div className="invalid-feedback-pozos">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.latitud}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group-pozos">
                <label htmlFor="longitud" className="form-label-pozos">
                  <i className="bi bi-geo-alt-fill me-2"></i>
                  Longitud
                </label>
                <input
                  type="text"
                  id="longitud"
                  name="longitud"
                  className={`form-control-pozos ${
                    errors.longitud ? 'is-invalid' : ''
                  }`}
                  placeholder="-64.1888"
                  value={formData.longitud}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.longitud && (
                  <div className="invalid-feedback-pozos">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.longitud}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cliente ID */}
          {/*    <div className="form-group-pozos">
            <label htmlFor="cliente_id" className="form-label-pozos">
              <i className="bi bi-person-fill me-2"></i>
              ID Cliente
            </label>
            <input
              type="number"
              id="cliente_id"
              name="cliente_id"
              className={`form-control-pozos ${
                errors.cliente_id ? 'is-invalid' : ''
              }`}
              placeholder="1"
              value={formData.cliente_id}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.cliente_id && (
              <div className="invalid-feedback-pozos">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.cliente_id}
              </div>
            )}
          </div> */}

          {/* Botones */}
          <div className="modal-footer-pozos">
            <button
              type="button"
              className="btn-cancelar-pozos"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-guardar-pozos"
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
  );
};

export default ModalJornadas;
