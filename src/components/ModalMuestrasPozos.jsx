import React, { useState, useEffect } from 'react';
import { addMuestraPozo, upMuestraPozo } from '../api/muestrasAgua';
import Spinner from './Spinner';
import ModalImpresion from './ModalImpresion';

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
    // Archivo — mismo patron que ModalPozos / ModalCalibraciones
    informe: '', // nombreUnico guardado en DB
    informeFile: null, // File object temporal, NO se envia al backend
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  // VISOR DE INFORME
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  // ── Cargar datos al abrir ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (muestra) {
      setFormData({
        ...muestra,
        fecha_muestra: muestra.fecha_muestra?.split('T')[0] || '',
        fecha_analisis: muestra.fecha_analisis?.split('T')[0] || '',
        informe: muestra.informe ?? '',
        informeFile: null,
      });
    } else {
      resetForm();
    }
  }, [muestra, isOpen]);

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
      informe: '',
      informeFile: null,
    });
    setErrors({});
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
  };

  // Mismo patron que ModalPozos / ModalCalibraciones
  const handleFileChange = (campo, file) => {
    if (!file) return;
    const nombreUnico = campo + '_' + Date.now() + '_' + file.name;
    setFormData((prev) => ({
      ...prev,
      informe: nombreUnico, // nombre que se guarda en DB
      informeFile: file, // File object para subir
    }));
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, informe: '', informeFile: null }));
  };

  // ── Upload separado (mismo patron uploadFile de ModalPozos) ───────────────

  const uploadFile = async () => {
    if (!formData.informeFile) return true;

    const fd = new FormData();
    fd.append('campo', 'muestra');
    fd.append('nombreArchivo', formData.informe);
    fd.append('file', formData.informeFile);

    const response = await fetch(
      import.meta.env.VITE_API_URL + '/muestrasAgua/upload',
      { method: 'POST', credentials: 'include', body: fd },
    );
    if (!response.ok)
      throw new Error('Error al subir el informe de la muestra');
    return true;
  };

  // ── Validacion ─────────────────────────────────────────────────────────────

  const validateForm = () => {
    const newErrors = {};
    if (
      formData.ph &&
      (isNaN(formData.ph) || formData.ph < 0 || formData.ph > 14)
    )
      newErrors.ph = 'pH debe estar entre 0 y 14';
    if (formData.dureza && (isNaN(formData.dureza) || formData.dureza < 0))
      newErrors.dureza = 'Dureza debe ser un numero positivo';
    if (
      formData.alcalinidad &&
      (isNaN(formData.alcalinidad) || formData.alcalinidad < 0)
    )
      newErrors.alcalinidad = 'Alcalinidad debe ser un numero positivo';
    if (
      formData.salinidad &&
      (isNaN(formData.salinidad) || formData.salinidad < 0)
    )
      newErrors.salinidad = 'Salinidad debe ser un numero positivo';
    if (
      formData.fuerza_ionica &&
      (isNaN(formData.fuerza_ionica) || formData.fuerza_ionica < 0)
    )
      newErrors.fuerza_ionica = 'Fuerza ionica debe ser un numero positivo';
    if (!formData.fecha_muestra)
      newErrors.fecha_muestra = 'La fecha de muestra es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Abrir visor
  const handleOpenViewer = (url) => {
    setViewerUrl(url);
    setShowViewer(true);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setLoading(true);
    setMsg('Procesando...');

    try {
      // 1. Subir archivo si hay uno nuevo seleccionado
      await uploadFile();

      // 2. Armar payload JSON (sin el File object)
      const { informeFile, ...dataToSend } = formData;
      dataToSend.ph = formData.ph ? parseFloat(formData.ph) : null;
      dataToSend.dureza = formData.dureza ? parseFloat(formData.dureza) : null;
      dataToSend.alcalinidad = formData.alcalinidad
        ? parseFloat(formData.alcalinidad)
        : null;
      dataToSend.salinidad = formData.salinidad
        ? parseFloat(formData.salinidad)
        : null;
      dataToSend.fuerza_ionica = formData.fuerza_ionica
        ? parseFloat(formData.fuerza_ionica)
        : null;
      dataToSend.dosis = formData.dosis || null;
      dataToSend.fecha_analisis = formData.fecha_analisis || null;

      // 3. Guardar muestra
      let resp;
      if (dataToSend.id) {
        setMsg('Actualizando muestra...');
        resp = await upMuestraPozo(dataToSend);
      } else {
        setMsg('Guardando muestra...');
        resp = await addMuestraPozo(dataToSend);
      }

      setMsg(resp?.message || 'Muestra guardada correctamente');
      await new Promise((r) => setTimeout(r, 1000));
      if (onSaved) onSaved();
      handleClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({
        submit:
          error.message || 'Error al guardar la muestra. Intente nuevamente.',
      });
      setMsg('Error al guardar');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // useMemo ANTES del early return — regla de hooks: nunca hooks despues de return condicional
  const previewUrl = React.useMemo(() => {
    if (!formData.informeFile) return null;
    return URL.createObjectURL(formData.informeFile);
  }, [formData.informeFile]);

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
    if (val < rango.min || val > rango.max)
      return {
        status: 'fuera',
        icon: 'bi-exclamation-triangle-fill',
        color: 'danger',
      };
    return { status: 'ok', icon: 'bi-check-circle-fill', color: 'success' };
  };

  if (!isOpen) return null;
  const tieneArchivoNuevo = !!formData.informeFile;
  const tieneArchivoGuardado = !!formData.informe && !formData.informeFile;
  const esImagen = formData.informeFile
    ? formData.informeFile.type.startsWith('image/')
    : /\.(jpg|jpeg|png|webp)$/i.test(formData.informe ?? '');
  const esPdf =
    !esImagen &&
    (formData.informeFile?.type === 'application/pdf' ||
      /\.pdf$/i.test(formData.informe ?? ''));

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded d-flex align-items-center justify-content-center"
                style={{
                  width: '50px',
                  height: '50px',
                  background:
                    'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
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
              onClick={handleClose}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.8)',
                width: '36px',
                height: '36px',
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Body */}
          <div className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                <i className="bi bi-calendar3 me-2"></i>Fechas
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label
                    className="form-label fw-semibold d-flex align-items-center"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Fecha de Muestra <span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_muestra"
                    className={
                      'form-control' +
                      (errors.fecha_muestra ? ' is-invalid' : '')
                    }
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
                    Fecha de Analisis
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

            {/* Parametros Quimicos */}
            <div className="p-3 rounded mb-4">
              <h6
                className="fw-semibold mb-3 pb-2"
                style={{ borderBottom: '2px solid rgba(102,126,234,0.3)' }}
              >
                <i className="bi bi-droplet-half me-2"></i>Parametros Quimicos
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
                      <i
                        className={
                          'bi ' +
                          getValorIndicador(formData.ph, 'ph').icon +
                          ' text-' +
                          getValorIndicador(formData.ph, 'ph').color
                        }
                      ></i>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="ph"
                    className={
                      'form-control' + (errors.ph ? ' is-invalid' : '')
                    }
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
                    className="form-label fw-semibold d-flex justify-content-between align-items-center"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <span>Dureza (mg/L)</span>
                    {formData.dureza &&
                      getValorIndicador(formData.dureza, 'dureza') && (
                        <i
                          className={
                            'bi ' +
                            getValorIndicador(formData.dureza, 'dureza').icon +
                            ' text-' +
                            getValorIndicador(formData.dureza, 'dureza').color
                          }
                        ></i>
                      )}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="dureza"
                    className={
                      'form-control' + (errors.dureza ? ' is-invalid' : '')
                    }
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
                      getValorIndicador(
                        formData.alcalinidad,
                        'alcalinidad',
                      ) && (
                        <i
                          className={
                            'bi ' +
                            getValorIndicador(
                              formData.alcalinidad,
                              'alcalinidad',
                            ).icon +
                            ' text-' +
                            getValorIndicador(
                              formData.alcalinidad,
                              'alcalinidad',
                            ).color
                          }
                        ></i>
                      )}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="alcalinidad"
                    className={
                      'form-control' + (errors.alcalinidad ? ' is-invalid' : '')
                    }
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
                        <i
                          className={
                            'bi ' +
                            getValorIndicador(formData.salinidad, 'salinidad')
                              .icon +
                            ' text-' +
                            getValorIndicador(formData.salinidad, 'salinidad')
                              .color
                          }
                        ></i>
                      )}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="salinidad"
                    className={
                      'form-control' + (errors.salinidad ? ' is-invalid' : '')
                    }
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

                {/* Fuerza Ionica */}
                <div className="col-md-4">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Fuerza Ionica
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    name="fuerza_ionica"
                    className={
                      'form-control' +
                      (errors.fuerza_ionica ? ' is-invalid' : '')
                    }
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
              </div>
            </div>

            {/* Informe adjunto */}
            <div className="p-3 rounded mb-4">
              <h6
                className="fw-semibold mb-3 pb-2"
                style={{ borderBottom: '2px solid rgba(34,197,94,0.35)' }}
              >
                <i className="bi bi-paperclip me-2"></i>Informe adjunto
                <small className="text-50 fw-normal ms-2">
                  (opcional - JPG, PNG, PDF)
                </small>
              </h6>

              {/* Estado A: sin archivo */}
              {!formData.informe && !formData.informeFile && (
                <label
                  className="d-flex flex-column align-items-center justify-content-center gap-2 rounded w-100 p-4"
                  style={{
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    border: '2px dashed rgba(255, 255, 255, 0.89)',
                    background: '#edf5ec',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting)
                      e.currentTarget.style.background = '#9caca89f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#edf5ec';
                  }}
                >
                  <i
                    className="bi bi-cloud-upload"
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bolder',
                      color: 'rgba(20, 59, 4, 0.85)',
                    }}
                  ></i>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      color: 'rgba(20, 59, 4, 0.85)',
                    }}
                  >
                    Hace clic para adjuntar el informe
                  </span>
                  <small
                    style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    JPG - PNG - PDF
                  </small>
                  <input
                    type="file"
                    className="d-none"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      handleFileChange('muestra', e.target.files[0])
                    }
                    disabled={isSubmitting}
                  />
                </label>
              )}

              {/* Estado B: archivo nuevo seleccionado (pendiente de guardar) */}
              {tieneArchivoNuevo && (
                <div
                  className="rounded p-3"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {esImagen && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="rounded mb-2 d-block"
                      style={{
                        maxHeight: '160px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  )}
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <i
                      className={
                        'bi fs-5 ' +
                        (esPdf
                          ? 'bi-file-earmark-pdf-fill text-danger'
                          : 'bi-image-fill text-info')
                      }
                    ></i>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p
                        className="mb-0  fw-semibold text-truncate"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {formData.informeFile.name}
                      </p>
                      <small className="text-50">
                        {(formData.informeFile.size / 1024).toFixed(1)} KB
                      </small>
                    </div>
                    <span
                      className="badge bg-warning text-dark"
                      style={{ fontSize: '0.7rem' }}
                    >
                      <i className="bi bi-clock me-1"></i>Pendiente de guardar
                    </span>
                    {/* Reemplazar */}
                    <label
                      className="btn btn-sm btn-outline-secondary mb-0"
                      style={{
                        fontSize: '0.75rem',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      }}
                      title="Reemplazar"
                    >
                      <i className="bi bi-arrow-repeat"></i>
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleFileChange('muestra', e.target.files[0])
                        }
                        disabled={isSubmitting}
                      />
                    </label>
                    {/* Quitar */}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                      title="Quitar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Estado C: archivo existente guardado en DB */}
              {tieneArchivoGuardado && (
                <div
                  className="rounded p-3"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {esImagen && (
                    <img
                      src={'/uploads/muestrasAgua/' + formData.informe}
                      alt="Informe"
                      className="rounded mb-2 d-block"
                      style={{
                        maxHeight: '160px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  )}
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <i
                      className={
                        'bi fs-5 ' +
                        (esPdf
                          ? 'bi-file-earmark-pdf-fill text-danger'
                          : 'bi-image-fill text-info')
                      }
                    ></i>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p
                        className="mb-0  fw-semibold text-truncate"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {formData.informe}
                      </p>
                      <small className="text-50">
                        Informe guardado en servidor
                      </small>
                    </div>
                    <span
                      className="badge bg-success"
                      style={{ fontSize: '0.7rem' }}
                    >
                      <i className="bi bi-check-circle me-1"></i>Guardado
                    </span>
                    {/* Ver */}
                    {/*   <a
                      href={
                        apiUrl + '/uploads/muestrasAgua/' + formData.informe
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-info"
                      style={{ fontSize: '0.75rem' }}
                      title="Ver informe"
                    >
                      <i className="bi bi-eye"></i>
                    </a> */}

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info"
                      style={{ fontSize: '0.75rem' }}
                      title="Ver informe"
                      onClick={() =>
                        handleOpenViewer(
                          '/uploads/muestrasAgua/' + formData.informe,
                        )
                      }
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    {/* Reemplazar */}
                    <label
                      className="btn btn-sm btn-outline-warning mb-0"
                      style={{
                        fontSize: '0.75rem',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      }}
                      title="Reemplazar"
                    >
                      <i className="bi bi-arrow-repeat"></i>
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleFileChange('muestra', e.target.files[0])
                        }
                        disabled={isSubmitting}
                      />
                    </label>
                    {/* Quitar */}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleRemoveFile}
                      disabled={isSubmitting}
                      title="Quitar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              )}
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
                  <i className="bi bi-x-circle me-2"></i>Cancelar
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

      <Spinner loading={loading} msg={msg} />

      {showViewer && (
        /*    <div className="modal-overlay">
          <div
            className="modal-container"
            style={{ maxWidth: '1000px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h5 className="fw-bold text-white mb-0">
                Vista previa del informe
              </h5>
              <button
                className="btn btn-sm"
                onClick={() => setShowViewer(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div
              className="p-3"
              style={{ maxHeight: '75vh', overflow: 'auto' }}
            >
              {viewerUrl?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={viewerUrl}
                  title="PDF Viewer"
                  style={{
                    width: '100%',
                    height: '75vh',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                />
              ) : (
                <img
                  src={viewerUrl}
                  alt="Informe"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '75vh',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              )}
            </div>

            <div className="modalx-footer">
              <button
                className="btnx-cancelar"
                onClick={() => setShowViewer(false)}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cerrar
              </button>

              <button className="btnx-guardar" onClick={handlePrint}>
                <i className="bi bi-printer me-2"></i>
                Imprimir
              </button>
            </div>
          </div>
        </div> */

        <ModalImpresion setShowViewer={setShowViewer} viewerUrl={viewerUrl} />
      )}
    </>
  );
};

export default ModalMuestrasPozos;
