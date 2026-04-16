import React, { useState, useEffect } from 'react';
import {
  addMuestraPozo,
  closeMuestra,
  upMuestraPozo,
} from '../api/muestrasAgua';
import Spinner from './Spinner';
import ModalImpresion from './ModalImpresion';
import { useParams } from 'react-router-dom';

const ModalMuestrasPozos = ({
  isOpen,
  onClose,
  muestra,
  onSaved,
  onlyView,
}) => {
  const { cliente, cliente_id } = useParams();

  const [formData, setFormData] = useState({
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

  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);

  const rangos = {
    ph: { min: 0, max: 50 },
    dureza: { min: 0, max: 1500 },
    salinidad: { min: 0, max: 3000 },
    alcalinidad: { min: 0, max: 1000 },
  };

  const TIPOS_PDF_PERMITIDOS = ['application/pdf'];
  const EXTENSION_PDF_REGEX = /\.pdf$/i;

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
    setFileErrors(null);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (campo, file) => {
    if (!file) return;
    if (
      !TIPOS_PDF_PERMITIDOS.includes(file.type) ||
      !EXTENSION_PDF_REGEX.test(file.name)
    ) {
      setFileErrors('Solo se permiten archivos PDF.');
      return;
    }
    const ext = file.name.includes('.')
      ? file.name.substring(file.name.lastIndexOf('.') + 1)
      : '';
    const nombreUnico = `${campo}_${Date.now()}${ext ? `.${ext}` : ''}`;
    setFileErrors(null);
    setFormData((prev) => ({
      ...prev,
      informe: nombreUnico,
      informeFile: file,
    }));
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, informe: '', informeFile: null }));
  };

  const handleOpenViewer = (url) => {
    setViewerUrl(url);
    setShowViewer(true);
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const uploadFile = async (resp) => {
    if (!formData.informeFile) return true;
    const fd = new FormData();
    fd.append('cliente_id', cliente_id);
    fd.append('pozo_id', resp.data.pozo_id);
    fd.append('muestra_agua_id', resp.data.id);
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

  // ── Validación ─────────────────────────────────────────────────────────────
  const validateForm = () => {
    const newErrors = {};
    if (
      formData.ph &&
      (isNaN(formData.ph) || formData.ph < 0 || formData.ph > 14)
    )
      newErrors.ph = 'pH debe estar entre 0 y 14';
    if (formData.dureza && (isNaN(formData.dureza) || formData.dureza < 0))
      newErrors.dureza = 'Dureza debe ser un número positivo';
    if (
      formData.alcalinidad &&
      (isNaN(formData.alcalinidad) || formData.alcalinidad < 0)
    )
      newErrors.alcalinidad = 'Alcalinidad debe ser un número positivo';
    if (
      formData.salinidad &&
      (isNaN(formData.salinidad) || formData.salinidad < 0)
    )
      newErrors.salinidad = 'Salinidad debe ser un número positivo';
    if (
      formData.fuerza_ionica &&
      (isNaN(formData.fuerza_ionica) || formData.fuerza_ionica < 0)
    )
      newErrors.fuerza_ionica = 'Fuerza iónica debe ser un número positivo';
    if (!formData.fecha_muestra)
      newErrors.fecha_muestra = 'La fecha de muestra es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit guardar ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setLoading(true);
    setMsg('Procesando...');

    try {
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

      let resp;
      if (dataToSend.id) {
        setMsg('Actualizando muestra...');
        resp = await upMuestraPozo(dataToSend);
      } else {
        setMsg('Guardando muestra...');
        resp = await addMuestraPozo(dataToSend);
      }

      await uploadFile(resp);
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

  // ── Finalizar muestra ─────────────────────────────────────────────────────
  const handleFinalizarMuestra = async () => {
    // Lo implementás vos — acá va tu lógica de finalización

    try {
      setLoading(true);

      const resp = await closeMuestra(muestra.id);

      console.log('Respuesta de cierre Muestra', resp);
      setMsg('Muestra finalizada correctamente');
      if (onSaved) onSaved();
      await new Promise((r) => setTimeout(r, 2000));
      console.log('Paso x aca ?');
      handleClose();
    } catch (error) {
      console.error('Error al finalizar:', error);
      setMsg('Error al finalizar Muestra');
      await new Promise((r) => setTimeout(r, 3000));
    } finally {
      setMsg('');
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setShowFinalizarModal(false);
    onClose();
  };

  // ── Derivados — SIEMPRE antes del early return ────────────────────────────
  const previewUrl = React.useMemo(() => {
    if (!formData.informeFile) return null;
    return URL.createObjectURL(formData.informeFile);
  }, [formData.informeFile]);

  const getValorIndicador = (valor, campo) => {
    if (!valor) return null;
    const val = parseFloat(valor);
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

  // isFormComplete como variable derivada — se recalcula en cada render reactivamente
  const isFormComplete =
    !!formData.fecha_muestra &&
    !!formData.ph &&
    !!formData.dureza &&
    !!formData.alcalinidad &&
    !!formData.salinidad &&
    !!formData.fuerza_ionica &&
    !!(formData.informe || formData.informeFile);

  // ── Early return — SIEMPRE después de todos los hooks ────────────────────
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
        <div
          className="modal-container modal-container--wide"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="d-flex align-items-center gap-3">
              <div>
                <i className="bi bi-clipboard-data"></i>
              </div>
              <div>
                <h3 className="modal-title-pozos mb-1">
                  {muestra?.id ? 'Editar Muestra' : 'Nueva Muestra'}
                </h3>
                <p className="modal-subtitle-pozos mb-0">
                  {muestra
                    ? 'Modifica los datos de la muestra'
                    : 'Registra una nueva muestra de agua'}
                </p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={handleClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Body */}
          <div className="modal-body-grid p-3">
            {errors.submit && (
              <div
                className="alert alert-danger d-flex align-items-center gap-2 mb-0"
                style={{ gridColumn: '1 / -1' }}
              >
                <i className="bi bi-exclamation-triangle-fill"></i>
                {errors.submit}
              </div>
            )}

            {/* Fechas */}
            <div className="form-section">
              <h6 className="form-section__title">
                <i className="bi bi-calendar3 me-2"></i>Fechas
              </h6>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label form-label--sm">
                    Fecha de Muestra <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_muestra"
                    className={
                      'form-control form-control-sm' +
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
                <div className="col-6">
                  <label className="form-label form-label--sm">
                    Fecha de Análisis
                  </label>
                  <input
                    type="date"
                    name="fecha_analisis"
                    className="form-control form-control-sm"
                    value={formData.fecha_analisis}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Informe adjunto */}
            <div className="form-section">
              <h6 className="form-section__title">
                <i className="bi bi-paperclip me-2"></i>Informe adjunto
                <small className="fw-normal ms-2 text-secondary">(PDF)</small>
              </h6>

              {/* Estado A: sin archivo */}
              {!formData.informe && !formData.informeFile && (
                <>
                  <label
                    className="file-dropzone"
                    style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    <i className="bi bi-cloud-upload file-dropzone__icon"></i>
                    <span className="file-dropzone__label">
                      Clic para adjuntar el informe .PDF
                    </span>
                    <input
                      type="file"
                      className="d-none"
                      accept=".pdf,application/pdf"
                      onChange={(e) =>
                        handleFileChange('muestra', e.target.files[0])
                      }
                      disabled={isSubmitting}
                    />
                  </label>
                  {fileErrors && (
                    <p className="cal-file-error mt-2 mb-0">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {fileErrors}
                    </p>
                  )}
                </>
              )}

              {/* Estado B: archivo nuevo pendiente */}
              {tieneArchivoNuevo && (
                <div className="file-preview-card">
                  {esImagen && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="file-preview-card__img"
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
                        className="mb-0 fw-semibold text-truncate"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {formData.informeFile.name}
                      </p>
                      <small className="text-secondary">
                        {(formData.informeFile.size / 1024).toFixed(1)} KB
                      </small>
                    </div>
                    <span
                      className="badge bg-warning text-dark"
                      style={{ fontSize: '0.7rem' }}
                    >
                      <i className="bi bi-clock me-1"></i>Pendiente de guardar
                    </span>
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
                        accept=".pdf,application/pdf"
                        onChange={(e) =>
                          handleFileChange('muestra', e.target.files[0])
                        }
                        disabled={isSubmitting}
                      />
                    </label>
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

              {/* Estado C: archivo guardado en DB */}
              {tieneArchivoGuardado && (
                <div className="file-preview-card">
                  {esImagen && (
                    <img
                      src={'/uploads/muestrasagua/' + formData.informe}
                      alt="Informe"
                      className="file-preview-card__img"
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
                        className="mb-0 fw-semibold text-truncate"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {formData.informe}
                      </p>
                      <small className="text-secondary">
                        Informe guardado en servidor
                      </small>
                    </div>
                    <span
                      className="badge bg-success"
                      style={{ fontSize: '0.7rem' }}
                    >
                      <i className="bi bi-check-circle me-1"></i>Guardado
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info"
                      style={{ fontSize: '0.75rem' }}
                      title="Ver informe"
                      onClick={() =>
                        handleOpenViewer(
                          '/uploads/muestrasagua/' + formData.informe,
                        )
                      }
                    >
                      <i className="bi bi-eye"></i>
                    </button>
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
                        accept=".pdf,application/pdf"
                        onChange={(e) =>
                          handleFileChange('muestra', e.target.files[0])
                        }
                        disabled={isSubmitting}
                      />
                    </label>
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

            {/* Parámetros Químicos */}
            <div className="form-section form-section--full">
              <h6 className="form-section__title">
                <i className="bi bi-droplet-half me-2"></i>Parámetros Químicos
              </h6>
              <div className="row g-3">
                {/* pH */}
                <div className="col">
                  <label className="form-label form-label--sm d-flex justify-content-between align-items-center">
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
                      'form-control form-control-sm' +
                      (errors.ph ? ' is-invalid' : '')
                    }
                    placeholder={rangos['ph'].min + ' - ' + rangos['ph'].max}
                    value={formData.ph}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <small className="form-hint">Máx {rangos['ph'].max}</small>
                  {errors.ph && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.ph}
                    </div>
                  )}
                </div>

                {/* Dureza */}
                <div className="col">
                  <label className="form-label form-label--sm d-flex justify-content-between align-items-center">
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
                      'form-control form-control-sm' +
                      (errors.dureza ? ' is-invalid' : '')
                    }
                    placeholder={
                      rangos['dureza'].min + ' - ' + rangos['dureza'].max
                    }
                    value={formData.dureza}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <small className="form-hint">
                    Máx {rangos['dureza'].max}
                  </small>
                  {errors.dureza && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.dureza}
                    </div>
                  )}
                </div>

                {/* Alcalinidad */}
                <div className="col">
                  <label className="form-label form-label--sm d-flex justify-content-between align-items-center">
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
                      'form-control form-control-sm' +
                      (errors.alcalinidad ? ' is-invalid' : '')
                    }
                    placeholder={
                      rangos['alcalinidad'].min +
                      ' - ' +
                      rangos['alcalinidad'].max
                    }
                    value={formData.alcalinidad}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <small className="form-hint">
                    Máx {rangos['alcalinidad'].max}
                  </small>
                  {errors.alcalinidad && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.alcalinidad}
                    </div>
                  )}
                </div>

                {/* Salinidad */}
                <div className="col">
                  <label className="form-label form-label--sm d-flex justify-content-between align-items-center">
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
                      'form-control form-control-sm' +
                      (errors.salinidad ? ' is-invalid' : '')
                    }
                    placeholder={
                      rangos['salinidad'].min + ' - ' + rangos['salinidad'].max
                    }
                    value={formData.salinidad}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <small className="form-hint">
                    Máx {rangos['salinidad'].max}
                  </small>
                  {errors.salinidad && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.salinidad}
                    </div>
                  )}
                </div>

                {/* Fuerza Iónica */}
                <div className="col">
                  <label className="form-label form-label--sm">
                    Fuerza Iónica
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    name="fuerza_ionica"
                    className={
                      'form-control form-control-sm' +
                      (errors.fuerza_ionica ? ' is-invalid' : '')
                    }
                    placeholder="0.000"
                    value={formData.fuerza_ionica}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {formData.fuerza_ionica &&
                    getValorIndicador(
                      formData.fuerza_ionica,
                      'fuerza_ionica',
                    ) && (
                      <small className="form-hint">
                        Máx{' '}
                        {
                          getValorIndicador(
                            formData.fuerza_ionica,
                            'fuerza_ionica',
                          ).valorMax
                        }
                      </small>
                    )}
                  {errors.fuerza_ionica && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.fuerza_ionica}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {!onlyView && (
            <div className="modal-footer ">
              {/* Izquierda: Finalizar */}
              <button
                type="button"
                className="btn-finalizar"
                onClick={() => setShowFinalizarModal(true)}
                disabled={!isFormComplete || isSubmitting}
                title={
                  !isFormComplete
                    ? 'Completá todos los campos y adjuntá el PDF para finalizar'
                    : 'Finalizar y cerrar la muestra'
                }
              >
                <i className="bi bi-check-circle-fill me-2"></i>
                Finalizar Muestra
              </button>

              {/* Derecha: Cancelar + Guardar */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-circle me-2"></i>Cancelar
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
                      {muestra?.id ? 'Actualizar' : 'Guardar Muestra'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal confirmación — Finalizar Muestra */}
      {showFinalizarModal && (
        <div className="modal-overlay-logout">
          <div
            className="modal-card-logout"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon-logout">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h3 className="modal-title-logout">
              ¿Deseas finalizar la Muestra?
            </h3>

            <p className="modal-text-logout">
              Estás a punto de finalizar esta <strong>muestra de agua </strong>.
              Una vez finalizada no podrá ser modificada. Asegurate de que todos
              los datos sean correctos antes de continuar.
            </p>

            <div className="modal-buttons-logout">
              <button
                className="btn-logout-cancel"
                onClick={() => setShowFinalizarModal(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-logout-confirm"
                onClick={() => {
                  setShowFinalizarModal(false);
                  handleFinalizarMuestra();
                }}
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default ModalMuestrasPozos;
