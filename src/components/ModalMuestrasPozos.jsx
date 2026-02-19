import React, { useState, useEffect } from 'react';
import { addMuestraPozo, upMuestraPozo } from '../api/muestrasAgua';

const ModalMuestrasPozos = ({
  isOpen,
  onClose,
  muestra,
  onSaved,
  onlyView,
}) => {
  const [formData, setFormData] = useState({
    ph: '',
    dureza: '',
    alcalinidad: '',
    salinidad: '',
    fuerza_ionica: '',
    dosis: '',
    fecha_muestra: '',
    fecha_analisis: '',
  });

  console.log('muestars', onlyView);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (muestra) {
      setFormData({
        ...muestra,
        fecha_muestra: muestra.fecha_muestra?.split('T')[0] || '',
        fecha_analisis: muestra.fecha_analisis?.split('T')[0] || '',
      });
    } else {
      resetForm();
    }
  }, [muestra, isOpen]);

  useEffect(() => {
    console.log('Formdata', formData);
  }, [formData]);

  const resetForm = () => {
    setFormData({
      ph: '',
      dureza: '',
      alcalinidad: '',
      salinidad: '',
      fuerza_ionica: '',
      dosis: '',
      fecha_muestra: '',
      fecha_analisis: '',
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      formData.ph &&
      (isNaN(formData.ph) || formData.ph < 0 || formData.ph > 14)
    ) {
      newErrors.ph = 'pH debe estar entre 0 y 14';
    }

    if (formData.dureza && (isNaN(formData.dureza) || formData.dureza < 0)) {
      newErrors.dureza = 'Dureza debe ser un número positivo';
    }

    if (
      formData.alcalinidad &&
      (isNaN(formData.alcalinidad) || formData.alcalinidad < 0)
    ) {
      newErrors.alcalinidad = 'Alcalinidad debe ser un número positivo';
    }

    if (
      formData.salinidad &&
      (isNaN(formData.salinidad) || formData.salinidad < 0)
    ) {
      newErrors.salinidad = 'Salinidad debe ser un número positivo';
    }

    if (
      formData.fuerza_ionica &&
      (isNaN(formData.fuerza_ionica) || formData.fuerza_ionica < 0)
    ) {
      newErrors.fuerza_ionica = 'Fuerza iónica debe ser un número positivo';
    }

    if (!formData.fecha_muestra) {
      newErrors.fecha_muestra = 'La fecha de muestra es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSend = {
        ...formData,
        ph: formData.ph ? parseFloat(formData.ph) : null,
        dureza: formData.dureza ? parseFloat(formData.dureza) : null,
        alcalinidad: formData.alcalinidad
          ? parseFloat(formData.alcalinidad)
          : null,
        salinidad: formData.salinidad ? parseFloat(formData.salinidad) : null,
        fuerza_ionica: formData.fuerza_ionica
          ? parseFloat(formData.fuerza_ionica)
          : null,
        dosis: formData.dosis || null,
        fecha_muestra: formData.fecha_muestra,
        fecha_analisis: formData.fecha_analisis || null,
      };

      console.log('Datos a enviar:', dataToSend);

      let resp;

      if (dataToSend.id) resp = await upMuestraPozo(dataToSend);
      else resp = await addMuestraPozo(dataToSend);

      console.log(resp);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSaved) {
        onSaved();
      }

      handleClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ submit: 'Error al guardar la muestra. Intente nuevamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getValorIndicador = (valor, campo) => {
    if (!valor) return null;

    const val = parseFloat(valor);
    const rangos = {
      ph: { min: 6.5, max: 8.5 },
      dureza: { min: 0, max: 500 },
      salinidad: { min: 0, max: 1000 },
      alcalinidad: { min: 0, max: 500 },
    };

    const rango = rangos[campo];
    if (!rango) return null;

    if (val < rango.min || val > rango.max) {
      return { status: 'fuera', icon: '⚠', color: 'danger' };
    }
    return { status: 'ok', icon: '✓', color: 'success' };
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header ">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded d-flex align-items-center justify-content-center"
              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',

                fontSize: '1.5rem',
                color: 'white',
              }}
            >
              <i className="bi bi-clipboard-data"></i>
            </div>
            <div>
              <h3
                className="fw-bold text-white mb-1"
                style={{ fontSize: '1.5rem' }}
              >
                {muestra?.id ? 'Editar Muestra' : 'Nueva Muestra'}
              </h3>
              <p
                className="mb-0"
                style={{
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {muestra
                  ? 'Modifica los datos de la muestra'
                  : 'Registra una nueva muestra de agua'}
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm rounded"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.8)',
              width: '36px',
              height: '36px',
            }}
            onClick={handleClose}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Error general */}
          {errors.submit && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
              <i className="bi bi-exclamation-triangle-fill"></i>
              {errors.submit}
            </div>
          )}

          {/* Fechas */}

          <div className="p-3 rounded mb-4">
            <h6
              className="fw-semibold mb-3 pb-2"
              style={{ borderBottom: '2px solid rgba(34,197,94,0.35)' }}
            >
              <i className="bi bi-calendar3 me-2"></i>
              Fechas
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label
                  className="form-label fw-semibold  d-flex align-items-center"
                  style={{ fontSize: '0.875rem' }}
                >
                  Fecha de Muestra
                  <span className="text-danger ms-1">*</span>
                </label>
                <input
                  type="date"
                  name="fecha_muestra"
                  className={`form-control ${
                    errors.fecha_muestra ? 'is-invalid' : ''
                  }`}
                  value={formData.fecha_muestra}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.fecha_muestra && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.fecha_muestra}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label
                  className="form-label fw-semibold"
                  style={{ fontSize: '0.875rem' }}
                >
                  Fecha de Análisis
                </label>
                <input
                  type="date"
                  name="fecha_analisis"
                  className="form-control"
                  value={formData.fecha_analisis}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Parámetros Químicos */}

          <div className="p-3 rounded mb-4">
            <div className="form-group"></div>

            <h6
              className="fw-semibold  mb-3 pb-2"
              style={{ borderBottom: '2px solid rgba(102, 126, 234, 0.3)' }}
            >
              <i className="bi bi-droplet-half me-2"></i>
              Parámetros Químicos
            </h6>
            <div className="row g-3">
              {/* pH */}
              <div className="col-md-4">
                <label
                  className="form-label fw-semibold d-flex justify-content-between align-items-center"
                  style={{ fontSize: '0.875rem' }}
                >
                  <span>pH</span>
                  {formData.ph && getValorIndicador(formData.ph, 'ph') && (
                    <span
                      className={`badge bg-${
                        getValorIndicador(formData.ph, 'ph').color
                      }`}
                    >
                      {getValorIndicador(formData.ph, 'ph').icon}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="ph"
                  className={`form-control ${errors.ph ? 'is-invalid' : ''}`}
                  placeholder="6.5 - 8.5"
                  value={formData.ph}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.ph && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.ph}
                  </div>
                )}
              </div>

              {/* Dureza */}
              <div className="col-md-4">
                <label
                  className="form-label fw-semibold  d-flex justify-content-between align-items-center"
                  style={{ fontSize: '0.875rem' }}
                >
                  <span>Dureza (mg/L)</span>
                  {formData.dureza &&
                    getValorIndicador(formData.dureza, 'dureza') && (
                      <span
                        className={`badge bg-${
                          getValorIndicador(formData.dureza, 'dureza').color
                        }`}
                      >
                        {getValorIndicador(formData.dureza, 'dureza').icon}
                      </span>
                    )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="dureza"
                  className={`form-control ${
                    errors.dureza ? 'is-invalid' : ''
                  }`}
                  placeholder="0 - 500"
                  value={formData.dureza}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.dureza && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.dureza}
                  </div>
                )}
              </div>

              {/* Alcalinidad */}
              <div className="col-md-4">
                <label
                  className="form-label fw-semibold d-flex justify-content-between align-items-center"
                  style={{ fontSize: '0.875rem' }}
                >
                  <span>Alcalinidad (mg/L)</span>
                  {formData.alcalinidad &&
                    getValorIndicador(formData.alcalinidad, 'alcalinidad') && (
                      <span
                        className={`badge bg-${
                          getValorIndicador(formData.alcalinidad, 'alcalinidad')
                            .color
                        }`}
                      >
                        {
                          getValorIndicador(formData.alcalinidad, 'alcalinidad')
                            .icon
                        }
                      </span>
                    )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="alcalinidad"
                  className={`form-control ${
                    errors.alcalinidad ? 'is-invalid' : ''
                  }`}
                  placeholder="0 - 500"
                  value={formData.alcalinidad}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.alcalinidad && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.alcalinidad}
                  </div>
                )}
              </div>

              {/* Salinidad */}
              <div className="col-md-4">
                <label
                  className="form-label fw-semibold d-flex justify-content-between align-items-center"
                  style={{ fontSize: '0.875rem' }}
                >
                  <span>Salinidad (mg/L)</span>
                  {formData.salinidad &&
                    getValorIndicador(formData.salinidad, 'salinidad') && (
                      <span
                        className={`badge bg-${
                          getValorIndicador(formData.salinidad, 'salinidad')
                            .color
                        }`}
                      >
                        {
                          getValorIndicador(formData.salinidad, 'salinidad')
                            .icon
                        }
                      </span>
                    )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="salinidad"
                  className={`form-control ${
                    errors.salinidad ? 'is-invalid' : ''
                  }`}
                  placeholder="0 - 1000"
                  value={formData.salinidad}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.salinidad && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.salinidad}
                  </div>
                )}
              </div>

              {/* Fuerza Iónica */}
              <div className="col-md-4">
                <label
                  className="form-label fw-semibold"
                  style={{ fontSize: '0.875rem' }}
                >
                  Fuerza Iónica
                </label>
                <input
                  type="number"
                  step="0.001"
                  name="fuerza_ionica"
                  className={`form-control ${
                    errors.fuerza_ionica ? 'is-invalid' : ''
                  }`}
                  placeholder="0.000"
                  value={formData.fuerza_ionica}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.fuerza_ionica && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.fuerza_ionica}
                  </div>
                )}
              </div>

              {/* Dosis */}
              {/*  <div className="col-md-4">
                  <label
                    className="form-label fw-semibold text-white"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Dosis
                  </label>
                  <input
                    type="text"
                    name="dosis"
                    className="form-control"
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      color: 'white',
                    }}
                    placeholder="Ej: 2.5 L/ha"
                    value={formData.dosis}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div> */}
            </div>
          </div>

          {/* Botones */}

          {!onlyView && (
            <div className="modalx-footer">
              <button
                type="button"
                className="btnx-cancelar"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cancelar
              </button>
              <button
                type="button"
                className="btnx-guardar"
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
                    {muestra?.id ? 'Actualizar' : 'Guardar Muestra'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalMuestrasPozos;
