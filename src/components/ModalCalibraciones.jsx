import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner.jsx';
import { addCalibraciones, upCalibraciones } from '../api/calibraciones.js';

const opcionesEstado = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'No aplica'];

const emptyCalibracion = {
  fecha: '',
  responsable: '',
  estado_maquina: { estado: '', observacion: '', nombreArchivo: '' },
  estado_bomba: { estado: '', observacion: '', nombreArchivo: '' },
  estado_agitador: { estado: '', observacion: '', nombreArchivo: '' },
  estado_filtroPrimario: { estado: '', observacion: '', nombreArchivo: '' },
  estado_filtroSecundario: { estado: '', observacion: '', nombreArchivo: '' },
  estado_FiltroLinea: { estado: '', observacion: '', nombreArchivo: '' },
  estado_manguerayconexiones: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
  },
  estado_antigoteo: { estado: '', observacion: '', nombreArchivo: '' },
  estado_limpiezaTanque: { estado: '', observacion: '', nombreArchivo: '' },
  estabilidadVerticalBotalon: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
  },
  estado_pastillas: { estado: '', observacion: '', nombreArchivo: '' },
  presion_unimap: '',
  presion_computadora: '',
  presion_manometro: '',
  observaciones_acronex: '',
  Observaciones: '',
};

export const ModalCalibraciones = ({ onClose, calibracion, onSaved }) => {
  const [form, setForm] = useState({ ...emptyCalibracion });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (calibracion) {
      // Parsear campos JSON si vienen como string
      const parsedCalibracion = { ...calibracion };

      camposEstado.forEach(({ campo }) => {
        if (typeof calibracion[campo] === 'string') {
          try {
            parsedCalibracion[campo] = JSON.parse(calibracion[campo]);
          } catch (e) {
            parsedCalibracion[campo] = {
              estado: '',
              observacion: '',
              nombreArchivo: '',
            };
          }
        } else if (!calibracion[campo]) {
          parsedCalibracion[campo] = {
            estado: '',
            observacion: '',
            nombreArchivo: '',
          };
        }
      });

      setForm({
        ...emptyCalibracion,
        ...parsedCalibracion,
        fecha: calibracion.fecha ? calibracion.fecha.split('T')[0] : '',
      });
    }
  }, [calibracion]);

  useEffect(() => {
    console.log('valorForm', form);
  }, [form]);

  if (!calibracion) return null;

  const camposEstado = [
    { campo: 'estado_maquina', label: 'Estado Máquina', icon: 'bi-gear-fill' },
    { campo: 'estado_bomba', label: 'Bomba', icon: 'bi-droplet-fill' },
    { campo: 'estado_agitador', label: 'Agitador', icon: 'bi-arrow-repeat' },
    {
      campo: 'estado_filtroPrimario',
      label: 'Filtro Primario',
      icon: 'bi-funnel',
    },
    {
      campo: 'estado_filtroSecundario',
      label: 'Filtro Secundario',
      icon: 'bi-funnel-fill',
    },
    { campo: 'estado_FiltroLinea', label: 'Filtro Línea', icon: 'bi-filter' },
    {
      campo: 'estado_manguerayconexiones',
      label: 'Mangueras y Conexiones',
      icon: 'bi-diagram-3',
    },
    {
      campo: 'estado_antigoteo',
      label: 'Sistema Antigoteo',
      icon: 'bi-shield-check',
    },
    {
      campo: 'estado_limpiezaTanque',
      label: 'Limpieza Tanque',
      icon: 'bi-droplet-half',
    },
    {
      campo: 'estabilidadVerticalBotalon',
      label: 'Estabilidad Botalón',
      icon: 'bi-arrow-bar-up',
    },
    { campo: 'estado_pastillas', label: 'Pastillas', icon: 'bi-circle-fill' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejo de cambios para campos JSON
  const handleEstadoChange = (campo, propiedad, value) => {
    setForm((prev) => ({
      ...prev,
      [campo]: {
        ...prev[campo],
        [propiedad]: value,
      },
    }));
  };

  // Manejo de archivos
  const handleFileChange = (campo, file) => {
    if (file) {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const nombreUnico = `${campo}_${timestamp}_${file.name}`;

      setForm((prev) => ({
        ...prev,
        [campo]: {
          ...prev[campo],
          nombreArchivo: nombreUnico,
          archivo: file, // Guardar el archivo para subirlo después
        },
      }));
    }
  };

  // Eliminar archivo
  const handleRemoveFile = (campo) => {
    setForm((prev) => ({
      ...prev,
      [campo]: {
        ...prev[campo],
        nombreArchivo: '',
        archivo: null,
      },
    }));
  };

  // Función para subir archivos al servidor
  const uploadFiles = async () => {
  const archivosParaSubir = []

    // Recopilar todos los archivos que necesitan ser subidos
    camposEstado.forEach(({ campo }) => {
      if (form[campo]?.archivo) {
        archivosParaSubir.push({
          campo,
          archivo: form[campo].archivo,
          nombreArchivo: form[campo].nombreArchivo,
        });
      }
    });

    if (archivosParaSubir.length === 0) {
      return true; // No hay archivos para subir
    }

    try {
      // Subir cada archivo
      for (const item of archivosParaSubir) {
        const formData = new FormData();
        formData.append('file', item.archivo);
        formData.append('nombreArchivo', item.nombreArchivo);
        formData.append('campo', item.campo);

        // Ajusta esta URL a tu endpoint de subida de archivos
        const response = await fetch(
          'http://localhost:3000/calibraciones/upload', 
          {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error al subir archivo de ${item.campo}`);
        }

        const result = await response.json();
        console.log(`Archivo ${item.nombreArchivo} subido exitosamente`);
      }

      return true;
    } catch (error) {
      console.error('Error al subir archivos:', error);
      throw error;
    }
  };

  const validarCampos = () => {
    const newErrors = {};

    if (!form.responsable?.trim()) {
      newErrors.responsable = 'El responsable es requerido';
    }

    if (!form.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarCampos()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      // Primero subir los archivos
      await uploadFiles();

      // Convertir objetos JSON a strings para enviar al backend
      const formToSend = { ...form };

      camposEstado.forEach(({ campo }) => {
        if (typeof formToSend[campo] === 'object') {
          // Remover el campo 'archivo' antes de stringify (ya se subió)
          const { archivo, ...jsonData } = formToSend[campo];
          formToSend[campo] = JSON.stringify(jsonData);
        }
      });

      let resp;
      if (form.id) {
        const { id, ...formSinId } = formToSend;
        resp = await upCalibraciones(id, formSinId);
      } else {
        resp = await addCalibraciones(formToSend);
      }

      setMsg(resp.message);
      onSaved();

      await new Promise((res) => setTimeout(res, 2000));
      onClose();
    } catch (error) {
      console.error(error.message);
      setErrors({ submit: error.message || 'Error al guardar la calibración' });
      setMsg(error.message || 'Error al guardar la calibración');
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      await new Promise((res) => setTimeout(res, 2000));
      setMsg('');
    }
  };

  return (
    <>
      <div className="modal-overlay" >
        <div
          className="modal-container"
          style={{ maxWidth: '95vw', width: '95vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="modal-header-pozos">
            <div className="d-flex align-items-center gap-3">
              <div className="modal-icon-container">
                <i className="bi bi-gear-wide-connected"></i>
              </div>
              <div>
                <h3 className="modal-title-pozos mb-1">
                  {form?.id ? 'Editar Calibración' : 'Nueva Calibración'}
                </h3>
                <p className="modal-subtitle-pozos mb-0">
                  {form?.id
                    ? 'Modifica la información de la calibración'
                    : 'Completa los datos de la nueva calibración'}
                </p>
              </div>
            </div>
            <button className="modal-close-btn" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* BODY */}
          <div
            className="modal-body-pozos"
            style={{ maxHeight: '75vh', overflowY: 'auto' }}
          >
            {errors.submit && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {errors.submit}
              </div>
            )}

            {/* DATOS PRINCIPALES */}
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <div className="form-group-pozos">
                  <label htmlFor="responsable" className="form-label-pozos">
                    <i className="bi bi-person-fill me-2"></i>
                    Responsable
                  </label>
                  <input
                    type="text"
                    id="responsable"
                    className={`form-control-pozos ${
                      errors.responsable ? 'is-invalid' : ''
                    }`}
                    name="responsable"
                    placeholder="Ej: Juan Pérez"
                    value={form.responsable || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.responsable && (
                    <div className="invalid-feedback-pozos">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.responsable}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group-pozos">
                  <label htmlFor="fecha" className="form-label-pozos">
                    <i className="bi bi-calendar-fill me-2"></i>
                    Fecha
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    className={`form-control-pozos ${
                      errors.fecha ? 'is-invalid' : ''
                    }`}
                    name="fecha"
                    value={form.fecha || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.fecha && (
                    <div className="invalid-feedback-pozos">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.fecha}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ESTADOS + OBSERVACIONES + ARCHIVOS */}
            <h4 className="fw-bold mb-3 border-bottom pb-2 text-white">
              <i className="bi bi-clipboard-check me-2"></i>
              Estados y Observaciones
            </h4>

            <div className="row g-3">
              {camposEstado.map(({ campo, label, icon }) => (
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3" key={campo}>
                  <div
                    className="border rounded p-3 h-100"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <label className="form-label-pozos mb-2">
                      <i className={`${icon} me-2`}></i>
                      {label}
                    </label>

                    {/* Estado */}
                    <select
                      className="form-control-pozos mb-2"
                      value={form[campo]?.estado || ''}
                      onChange={(e) =>
                        handleEstadoChange(campo, 'estado', e.target.value)
                      }
                      disabled={isSubmitting}
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="">Seleccione estado</option>
                      {opcionesEstado.map((op) => (
                        <option key={op} value={op}>
                          {op}
                        </option>
                      ))}
                    </select>

                    {/* Observación */}
                    <textarea
                      className="form-control-pozos mb-2"
                      rows="2"
                      placeholder="Observaciones..."
                      value={form[campo]?.observacion || ''}
                      onChange={(e) =>
                        handleEstadoChange(campo, 'observacion', e.target.value)
                      }
                      disabled={isSubmitting}
                      style={{ fontSize: '0.8rem' }}
                    />

                    {/* Archivo */}
                    <div className="d-flex align-items-center gap-2">
                      {!form[campo]?.nombreArchivo ? (
                        <label
                          className="btn btn-sm btn-outline-light flex-grow-1"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <i className="bi bi-paperclip me-1"></i>
                          Adjuntar
                          <input
                            type="file"
                            className="d-none"
                            onChange={(e) =>
                              handleFileChange(campo, e.target.files[0])
                            }
                            disabled={isSubmitting}
                            accept="image/*,.pdf"
                          />
                        </label>
                      ) : (
                        <>
                          <span
                            className="badge bg-success flex-grow-1 text-truncate"
                            style={{ fontSize: '0.7rem', maxWidth: '120px' }}
                            title={form[campo]?.nombreArchivo}
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            Archivo
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.4rem',
                            }}
                            onClick={() => handleRemoveFile(campo)}
                            disabled={isSubmitting}
                            title="Eliminar archivo"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PRESIONES */}
            <h4 className="fw-bold mb-3 border-bottom pb-2 text-white mt-4">
              <i className="bi bi-speedometer2 me-2"></i>
              Presiones
            </h4>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="form-group-pozos">
                  <label htmlFor="presion_unimap" className="form-label-pozos">
                    <i className="bi bi-speedometer me-2"></i>
                    Presión Unimap (bares)
                  </label>
                  <input
                    type="number"
                    id="presion_unimap"
                    className="form-control-pozos"
                    name="presion_unimap"
                    placeholder="Ej: 3.5"
                    step="0.1"
                    value={form.presion_unimap || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group-pozos">
                  <label
                    htmlFor="presion_computadora"
                    className="form-label-pozos"
                  >
                    <i className="bi bi-speedometer me-2"></i>
                    Presión Computadora (bares)
                  </label>
                  <input
                    type="number"
                    id="presion_computadora"
                    className="form-control-pozos"
                    name="presion_computadora"
                    placeholder="Ej: 3.5"
                    step="0.1"
                    value={form.presion_computadora || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group-pozos">
                  <label
                    htmlFor="presion_manometro"
                    className="form-label-pozos"
                  >
                    <i className="bi bi-speedometer me-2"></i>
                    Presión Manómetro (bares)
                  </label>
                  <input
                    type="number"
                    id="presion_manometro"
                    className="form-control-pozos"
                    name="presion_manometro"
                    placeholder="Ej: 3.5"
                    step="0.1"
                    value={form.presion_manometro || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* OBSERVACIONES */}
            <h4 className="fw-bold mb-3 border-bottom pb-2 text-white mt-4">
              <i className="bi bi-chat-left-text me-2"></i>
              Observaciones Adicionales
            </h4>

            <div className="form-group-pozos mb-3">
              <label
                htmlFor="observaciones_acronex"
                className="form-label-pozos"
              >
                <i className="bi bi-journal-text me-2"></i>
                Observaciones ACRONEX
              </label>
              <textarea
                id="observaciones_acronex"
                className="form-control-pozos"
                rows="3"
                placeholder="Ingrese observaciones de ACRONEX..."
                name="observaciones_acronex"
                value={form.observaciones_acronex || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group-pozos">
              <label htmlFor="Observaciones" className="form-label-pozos">
                <i className="bi bi-journal-text me-2"></i>
                Observaciones Generales
              </label>
              <textarea
                id="Observaciones"
                className="form-control-pozos"
                rows="3"
                placeholder="Ingrese observaciones generales..."
                name="Observaciones"
                value={form.Observaciones || ''}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>

            {/* FOOTER */}
            <div className="modal-footer-pozos mt-4">
              <button
                type="button"
                className="btn-cancelar-pozos"
                onClick={onClose}
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
                    {form?.id ? 'Actualizar' : 'Crear Calibración'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Spinner msg={msg} loading={loading} />
    </>
  );
};
