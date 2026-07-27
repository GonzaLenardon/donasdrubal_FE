import React, { useState, useEffect } from 'react';
import { addJornadas, upJornadas, closeJornada } from '../api/jornadas';
import Spinner from './Spinner';
import ModalFinalizarServicios from './ModalFinalizarServicios';
import ModalImpresion from './ModalImpresion';
import { useParams } from 'react-router-dom';

const emptyJornada = {
  fecha_jornada: '',
  responsable_id: '',
  motivo: '',
  estado: 'PENDIENTE',
  observaciones: '',
  informe: '',
  informeFile: null,
};

const MOTIVOS_JORNADA = [
  { value: 'Mezclas', label: 'Mezclas' },
  { value: 'Capacitacion', label: 'Capacitación' },
  { value: 'Acronex', label: 'Acronex' },
  { value: 'Microvidas', label: 'Microvidas' },
  { value: 'Otro', label: 'Otro' },
];

const TIPOS_PDF_PERMITIDOS = ['application/pdf'];
const EXTENSION_PDF_REGEX = /\.pdf$/i;

const ModalJornadas = ({
  isOpen,
  onClose,
  jornada,
  ingenieros = [],
  onSaved,
}) => {
  const { cliente_id } = useParams();

  const [formData, setFormData] = useState({ ...emptyJornada });
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [showCerrar, setShowCerrar] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (jornada) {
      setFormData({
        ...emptyJornada,
        ...jornada,
        fecha_jornada: jornada.fecha_jornada?.split('T')[0] || '',
        informe: jornada.informe ?? '',
        informeFile: null,
      });
    } else {
      resetForm();
    }
  }, [jornada, isOpen]);

  const resetForm = () => {
    setFormData({ ...emptyJornada });
    setErrors({});
    setFileErrors(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ── Archivo adjunto (informe) ─────────────────────────────────────────────
  /*   const handleFileChange = (file) => {
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
    const nombreUnico = `informe_${Date.now()}${ext ? `.${ext}` : ''}`;
    setFileErrors(null);
    setFormData((prev) => ({
      ...prev,
      informe: nombreUnico,
      informeFile: file,
    }));
  }; */

  const handleFileChange = (file) => {
    if (!file) return;
    if (
      !TIPOS_PDF_PERMITIDOS.includes(file.type) ||
      !EXTENSION_PDF_REGEX.test(file.name)
    ) {
      setFileErrors('Solo se permiten archivos PDF.');
      return;
    }
    setFileErrors(null);
    setFormData((prev) => ({
      ...prev,
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

  /*  const uploadFile = async (resp) => {
    if (!formData.informeFile) return true;
    const jornadaId = resp?.data?.id ?? formData.id;

    const fd = new FormData();
    fd.append('cliente_id', cliente_id ?? formData.cliente_id);
    fd.append('jornada_id', jornadaId);
    fd.append('campo', 'jornada');
    fd.append('nombreArchivo', formData.informe);
    fd.append('file', formData.informeFile);

    const response = await fetch(
      import.meta.env.VITE_API_URL + '/jornadas/upload',
      { method: 'POST', credentials: 'include', body: fd },
    );
    if (!response.ok)
      throw new Error('Error al subir el informe de la jornada');
    return true;
  }; */

  const uploadFile = async (jornadaId) => {
    if (!formData.informeFile) return null;

    const ext = formData.informeFile.name.includes('.')
      ? formData.informeFile.name.substring(
          formData.informeFile.name.lastIndexOf('.') + 1,
        )
      : 'pdf';
    const nombreFinal = `jornada_${jornadaId}_${Date.now()}.${ext}`;

    const fd = new FormData();
    fd.append('cliente_id', cliente_id ?? formData.cliente_id);
    fd.append('jornada_id', jornadaId);
    fd.append('campo', 'jornada');
    fd.append('nombreArchivo', nombreFinal);
    fd.append('file', formData.informeFile);

    const response = await fetch(
      import.meta.env.VITE_API_URL + '/jornadas/upload',
      { method: 'POST', credentials: 'include', body: fd },
    );
    if (!response.ok)
      throw new Error('Error al subir el informe de la jornada');
    return nombreFinal;
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

  /*   const saveJornada = async () => {
    if (!validateForm()) return false;
    setIsSubmitting(true);
    setLoading(true);
    try {
      setMsg('Procesando...');
      const { cliente, informeFile, ...resto } = formData;

      const dataToSend = {
        ...resto,
        cliente_id: parseInt(formData.cliente_id ?? cliente_id),
      };

      let resp;
      if (dataToSend.id) {
        setMsg('Actualizando jornada...');
        resp = await upJornadas(dataToSend);
      } else {
        setMsg('Guardando jornada...');
        resp = await addJornadas(dataToSend);
      }

      await uploadFile(resp);

      setMsg(resp.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({
        submit:
          error.message || 'Error al guardar la Jornada. Intente nuevamente.',
      });
      setMsg('Error al guardar');
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }; */

  const saveJornada = async () => {
    if (!validateForm()) return false;
    setIsSubmitting(true);
    setLoading(true);
    try {
      setMsg('Procesando...');
      const { cliente, informeFile, ...resto } = formData;

      const dataToSend = {
        ...resto,
        cliente_id: parseInt(formData.cliente_id ?? cliente_id),
      };

      let resp;
      if (dataToSend.id) {
        setMsg('Actualizando jornada...');
        resp = await upJornadas(dataToSend);
      } else {
        setMsg('Guardando jornada...');
        resp = await addJornadas(dataToSend);
      }

      const jornadaId = resp?.data?.id ?? dataToSend.id;

      // Recién acá conocemos el id real — subimos el archivo con un
      // nombre que lo referencia, y persistimos ese nombre en el registro.
      if (formData.informeFile) {
        setMsg('Subiendo informe...');
        const nombreFinal = await uploadFile(jornadaId);
        await upJornadas({
          ...dataToSend,
          id: jornadaId,
          informe: nombreFinal,
        });
        setFormData((prev) => ({
          ...prev,
          id: jornadaId,
          informe: nombreFinal,
          informeFile: null,
        }));
      }

      setMsg(resp.message);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({
        submit:
          error.message || 'Error al guardar la Jornada. Intente nuevamente.',
      });
      setMsg('Error al guardar');
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

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
    }
  };

  const handleClose = () => {
    resetForm();
    setShowCerrar(false);
    onClose();
  };

  const previewUrl = React.useMemo(() => {
    if (!formData.informeFile) return null;
    return URL.createObjectURL(formData.informeFile);
  }, [formData.informeFile]);

  const isFormComplete = !!formData.fecha_jornada && !!formData.motivo;

  if (!isOpen) return null;

  const tieneArchivoNuevo = !!formData.informeFile;
  const tieneArchivoGuardado = !!formData.informe && !formData.informeFile;

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

            {/* Datos de la jornada */}
            <div className="form-section form-section--cards">
              <h6 className="form-section__title">
                <i className="bi bi-calendar3 me-2"></i>Datos de la jornada
              </h6>

              <div className="form-group">
                <label
                  htmlFor="fecha_jornada"
                  className="form-label form-label--sm"
                >
                  Fecha de la jornada <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  id="fecha_jornada"
                  name="fecha_jornada"
                  className={`form-control form-control-sm ${errors.fecha_jornada ? 'is-invalid' : ''}`}
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
                <label
                  htmlFor="responsable_id"
                  className="form-label form-label--sm"
                >
                  Ingeniero Responsable <span className="text-danger">*</span>
                </label>
                <select
                  id="responsable_id"
                  className={`form-control form-control-sm ${errors.responsable_id ? 'is-invalid' : ''}`}
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

              <div className="form-group">
                <label htmlFor="motivo" className="form-label form-label--sm">
                  Motivo <span className="text-danger">*</span>
                </label>
                <select
                  id="motivo"
                  className={`form-control form-control-sm ${errors.motivo ? 'is-invalid' : ''}`}
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

              <div className="form-group">
                <label
                  htmlFor="observaciones"
                  className="form-label form-label--sm"
                >
                  Observaciones <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="observaciones"
                  name="observaciones"
                  className={`form-control form-control-sm ${errors.observaciones ? 'is-invalid' : ''}`}
                  placeholder="Deje aquí algún comentario sobre la jornada..."
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
            </div>

            {/* Informe adjunto */}
            <div className="form-section form-section--cards">
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
                      onChange={(e) => handleFileChange(e.target.files[0])}
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

              {/* Estado B: archivo nuevo pendiente de guardar */}
              {tieneArchivoNuevo && (
                <div className="file-preview-card">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <i className="bi fs-5 bi-file-earmark-pdf-fill text-danger"></i>
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
                        onChange={(e) => handleFileChange(e.target.files[0])}
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

              {/* Estado C: archivo ya guardado */}
              {tieneArchivoGuardado && (
                <div className="file-preview-card">
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <i className="bi fs-5 bi-file-earmark-pdf-fill text-danger"></i>
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
                          `/uploads/clientes/${cliente_id ?? formData.cliente_id}/jornadas/${formData.id}/${formData.informe}`,
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
                        onChange={(e) => handleFileChange(e.target.files[0])}
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
          </div>

          {/* Footer */}
          <div className="modal-footer modal-footer--space-between">
            <button
              type="button"
              className="btn-finalizar"
              onClick={() => setShowCerrar(true)}
              disabled={!isFormComplete || isSubmitting}
              title={
                !isFormComplete
                  ? 'Completá fecha y motivo para finalizar la jornada'
                  : 'Finalizar la jornada'
              }
            >
              <i className="bi bi-check-circle-fill me-2"></i>
              Finalizar Jornada
            </button>

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

      {showCerrar && (
        <ModalFinalizarServicios
          handleFinalizar={handleCerrarJornada}
          servicio="jornada"
          setShowFinalizar={() => setShowCerrar(false)}
          accion="finalizar"
          cantidad={1}
        />
      )}

      {showViewer && (
        <ModalImpresion setShowViewer={setShowViewer} viewerUrl={viewerUrl} />
      )}

      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default ModalJornadas;
