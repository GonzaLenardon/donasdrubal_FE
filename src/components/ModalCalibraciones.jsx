import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner.jsx';
import { addCalibraciones, upCalibraciones } from '../api/calibraciones.js';

const opcionesEstado = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'No aplica'];

const emptyCalibracion = {
  fecha: '',
  responsable: '',
  estado_maquina: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_bomba: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_agitador: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_filtroPrimario: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_filtroSecundario: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_FiltroLinea: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_manguerayconexiones: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_antigoteo: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_limpiezaTanque: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estabilidadVerticalBotalon: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_pastillas: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  presion_unimap: '',
  presion_computadora: '',
  presion_manometro: '',
  observaciones_acronex: '',
  Observaciones: '',
};

// Función auxiliar para parsear estados con doble escape
const parseEstadoField = (estadoString) => {
  if (!estadoString) {
    return {
      estado: '',
      observacion: '',
      nombreArchivo: '',
      recomendaciones: [],
    };
  }

  try {
    let parsed = JSON.parse(estadoString);

    // Si es string, intentar parsear de nuevo (doble escape)
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    return {
      estado: parsed.estado || '',
      observacion: parsed.observacion || '',
      nombreArchivo: parsed.nombreArchivo || parsed.nombre_archivo || '',
      recomendaciones: Array.isArray(parsed.recomendaciones)
        ? parsed.recomendaciones
        : [],
      path: parsed.path || '',
    };
  } catch (error) {
    console.error('Error parseando estado:', error);
    return {
      estado: '',
      observacion: '',
      nombreArchivo: '',
      recomendaciones: [],
    };
  }
};

// Componente para gestionar recomendaciones
const RecomendacionesManager = ({
  recomendaciones = [],
  onChange,
  disabled,
}) => {
  const [nuevaRecomendacion, setNuevaRecomendacion] = useState('');

  const agregarRecomendacion = () => {
    if (nuevaRecomendacion.trim()) {
      const nuevaRec = {
        id: Date.now(),
        texto: nuevaRecomendacion.trim(),
        fecha: new Date().toISOString(),
      };
      onChange([...recomendaciones, nuevaRec]);
      setNuevaRecomendacion('');
    }
  };

  const eliminarRecomendacion = (id) => {
    onChange(recomendaciones.filter((rec) => rec.id !== id));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      agregarRecomendacion();
    }
  };

  return (
    <div className="recomendaciones-container">
      {/* Lista de recomendaciones */}
      {recomendaciones.length > 0 && (
        <div className="mb-2">
          {recomendaciones.map((rec) => (
            <div
              key={rec.id}
              className="d-flex align-items-start gap-2 mb-2 p-2 rounded"
              style={{
                background: 'rgba(13, 202, 240, 0.1)',
                border: '1px solid rgba(13, 202, 240, 0.2)',
              }}
            >
              <i
                className="bi bi-check-circle-fill text-info mt-1"
                style={{ fontSize: '0.8rem' }}
              ></i>
              <small
                className="flex-grow-1 text-white"
                style={{ fontSize: '0.75rem' }}
              >
                {rec.texto}
              </small>
              <button
                type="button"
                className="btn btn-sm btn-link text-danger p-0"
                onClick={() => eliminarRecomendacion(rec.id)}
                disabled={disabled}
                style={{ fontSize: '0.8rem' }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input para nueva recomendación */}
      <div className="input-group input-group-sm">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Escribir recomendación... (Enter para agregar)"
          value={nuevaRecomendacion}
          onChange={(e) => setNuevaRecomendacion(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          style={{
            fontSize: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
          }}
        />
        <button
          type="button"
          className="btn btn-outline-info btn-sm"
          onClick={agregarRecomendacion}
          disabled={disabled || !nuevaRecomendacion.trim()}
          style={{ fontSize: '0.75rem' }}
        >
          <i className="bi bi-plus-lg"></i>
        </button>
      </div>
    </div>
  );
};

// Componente de navegación por páginas
const PaginationNav = ({ currentPage, totalPages, onPageChange, errors }) => {
  const pages = [
    { number: 1, title: 'Datos Básicos', icon: 'bi-info-circle' },
    { number: 2, title: 'Estados y Componentes', icon: 'bi-clipboard-check' },
    { number: 3, title: 'Presiones y Observaciones', icon: 'bi-speedometer2' },
  ];

  return (
    <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
      {pages.map((page) => {
        const hasErrors = errors[`page${page.number}`];
        return (
          <button
            key={page.number}
            type="button"
            className={`btn ${currentPage === page.number ? 'btn-primary' : 'btn-outline-secondary'} btn-sm position-relative`}
            onClick={() => onPageChange(page.number)}
            style={{ minWidth: '150px' }}
          >
            <i className={`${page.icon} me-2`}></i>
            {page.title}
            {hasErrors && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                !
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const ModalCalibraciones = ({ onClose, calibracion, onSaved }) => {
  const [form, setForm] = useState({ ...emptyCalibracion });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    if (calibracion) {
      if (calibracion.id) {
        const parsedCalibracion = { ...calibracion };

        // Parsear cada campo de estado
        camposEstado.forEach(({ campo }) => {
          if (typeof calibracion[campo] === 'string') {
            parsedCalibracion[campo] = parseEstadoField(calibracion[campo]);
          } else if (!calibracion[campo]) {
            parsedCalibracion[campo] = {
              estado: '',
              observacion: '',
              nombreArchivo: '',
              recomendaciones: [],
            };
          }
        });

        setForm({
          ...parsedCalibracion,
          fecha: calibracion.fecha ? calibracion.fecha.split('T')[0] : '',
        });
      } else {
        setForm({
          ...emptyCalibracion,
          maquina_id: calibracion.maquina_id,
        });
      }
    }
  }, [calibracion]);

  useEffect(() => {
    console.log('Formulario', form);
  }, [form]);

  if (!calibracion) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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

  // Manejo de recomendaciones
  const handleRecomendacionesChange = (campo, recomendaciones) => {
    setForm((prev) => ({
      ...prev,
      [campo]: {
        ...prev[campo],
        recomendaciones,
      },
    }));
  };

  // Manejo de archivos
  const handleFileChange = (campo, file) => {
    if (file) {
      const timestamp = Date.now();
      const nombreUnico = `${campo}_${timestamp}_${file.name}`;

      setForm((prev) => ({
        ...prev,
        [campo]: {
          ...prev[campo],
          nombreArchivo: nombreUnico,
          archivo: file,
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
    const archivosParaSubir = [];

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
      return true;
    }

    try {
      for (const item of archivosParaSubir) {
        const formData = new FormData();
        formData.append('campo', item.campo);
        formData.append('nombreArchivo', item.nombreArchivo);
        formData.append('file', item.archivo);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/calibraciones/upload`,
          {
            method: 'POST',
            credentials: 'include',
            body: formData,
          },
        );

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

  const validarCamposPorPagina = (pageNumber) => {
    const newErrors = {};

    if (pageNumber === 1) {
      if (!form.responsable?.trim()) {
        newErrors.responsable = 'El responsable es requerido';
      }
      if (!form.fecha) {
        newErrors.fecha = 'La fecha es requerida';
      }
      if (Object.keys(newErrors).length > 0) {
        newErrors.page1 = true;
      }
    }

    return newErrors;
  };

  const validarTodoElFormulario = () => {
    const newErrors = {};

    // Validar página 1
    if (!form.responsable?.trim()) {
      newErrors.responsable = 'El responsable es requerido';
      newErrors.page1 = true;
    }
    if (!form.fecha) {
      newErrors.fecha = 'La fecha es requerida';
      newErrors.page1 = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePageChange = (pageNumber) => {
    // Validar página actual antes de cambiar
    const erroresActuales = validarCamposPorPagina(currentPage);
    if (Object.keys(erroresActuales).length > 0) {
      setErrors(erroresActuales);
      return;
    }
    setCurrentPage(pageNumber);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validarTodoElFormulario()) {
      setCurrentPage(1); // Ir a la primera página si hay errores
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);
      setMsg('Procesando...');

      await uploadFiles();

      const formToSend = { ...form };

      camposEstado.forEach(({ campo }) => {
        if (typeof formToSend[campo] === 'object') {
          const { archivo, path, ...jsonData } = formToSend[campo];
          formToSend[campo] = JSON.stringify(jsonData);
        }
      });

      let resp;
      if (form.id) {
        setMsg('Actualizando calibración...');
        const { id, ...formSinId } = formToSend;
        resp = await upCalibraciones(id, formSinId);
      } else {
        setMsg('Creando calibración...');
        resp = await addCalibraciones(formToSend);
      }

      setMsg(resp.message || 'Calibración guardada exitosamente');

      await new Promise((res) => setTimeout(res, 1500));

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrors({ submit: error.message || 'Error al guardar la calibración' });
      setMsg('Error al guardar');

      setTimeout(() => {
        setMsg('');
      }, 3000);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Renderizar contenido de cada página
  const renderPageContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="fade-in">
            <h4 className="fw-bold mb-4 text-white d-flex align-items-center">
              <i className="bi bi-info-circle me-2"></i>
              Información General
            </h4>

            <div className="row g-4">
              <div className="col-md-8">
                <div className="form-group-pozos">
                  <label htmlFor="responsable" className="form-label-pozos">
                    <i className="bi bi-person-fill me-2"></i>
                    Responsable <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="responsable"
                    className={`form-control-pozos ${errors.responsable ? 'is-invalid' : ''}`}
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
                    Fecha <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    className={`form-control-pozos ${errors.fecha ? 'is-invalid' : ''}`}
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

            <div
              className="alert alert-info mt-4 d-flex align-items-start gap-2"
              role="alert"
            >
              <i className="bi bi-info-circle-fill mt-1"></i>
              <div>
                <strong>Información:</strong> Complete los datos básicos para
                continuar con los estados de los componentes.
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="fade-in">
            <h4 className="fw-bold mb-4 text-white d-flex align-items-center">
              <i className="bi bi-clipboard-check me-2"></i>
              Estados y Componentes
            </h4>

            <div className="row g-3">
              {camposEstado.map(({ campo, label, icon }) => (
                <div className="col-xl-4 col-lg-6 col-md-6 mb-3" key={campo}>
                  <div
                    className="border rounded p-3 h-100"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="d-flex align-items-center mb-3">
                      <i className={`${icon} me-2 text-info`}></i>
                      <h6 className="mb-0 text-white fw-bold">{label}</h6>
                    </div>

                    {/* Estado */}
                    <div className="mb-2">
                      <label
                        className="form-label-pozos"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Estado
                      </label>
                      <select
                        className="form-control-pozos"
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
                    </div>

                    {/* Observación */}
                    <div className="mb-2">
                      <label
                        className="form-label-pozos"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Observación
                      </label>
                      <textarea
                        className="form-control-pozos"
                        rows="2"
                        placeholder="Observaciones..."
                        value={form[campo]?.observacion || ''}
                        onChange={(e) =>
                          handleEstadoChange(
                            campo,
                            'observacion',
                            e.target.value,
                          )
                        }
                        disabled={isSubmitting}
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>

                    {/* Recomendaciones */}
                    <div className="mb-2">
                      <label
                        className="form-label-pozos"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Recomendaciones
                      </label>
                      <RecomendacionesManager
                        recomendaciones={form[campo]?.recomendaciones || []}
                        onChange={(recs) =>
                          handleRecomendacionesChange(campo, recs)
                        }
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Archivo */}
                    <div className="mt-3">
                      <label
                        className="form-label-pozos"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Archivo adjunto
                      </label>
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
                            Adjuntar archivo
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
                              style={{ fontSize: '0.7rem', maxWidth: '150px' }}
                              title={form[campo]?.nombreArchivo}
                            >
                              <i className="bi bi-check-circle me-1"></i>
                              Archivo adjunto
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
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="fade-in">
            {/* PRESIONES */}
            <h4 className="fw-bold mb-4 text-white d-flex align-items-center">
              <i className="bi bi-speedometer2 me-2"></i>
              Presiones
            </h4>

            <div className="row g-4 mb-5">
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
            <h4 className="fw-bold mb-4 text-white d-flex align-items-center">
              <i className="bi bi-chat-left-text me-2"></i>
              Observaciones Adicionales
            </h4>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group-pozos">
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
                    rows="4"
                    placeholder="Ingrese observaciones de ACRONEX..."
                    name="observaciones_acronex"
                    value={form.observaciones_acronex || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group-pozos">
                  <label htmlFor="Observaciones" className="form-label-pozos">
                    <i className="bi bi-journal-text me-2"></i>
                    Observaciones Generales
                  </label>
                  <textarea
                    id="Observaciones"
                    className="form-control-pozos"
                    rows="4"
                    placeholder="Ingrese observaciones generales..."
                    name="Observaciones"
                    value={form.Observaciones || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="modal-overlay">
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
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            {errors.submit && (
              <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {errors.submit}
              </div>
            )}

            {/* Navegación por páginas */}
            <PaginationNav
              currentPage={currentPage}
              totalPages={3}
              onPageChange={handlePageChange}
              errors={errors}
            />

            {/* Contenido de la página actual */}
            {renderPageContent()}
          </div>

          {/* FOOTER */}
          <div className="modal-footer-pozos">
            <button
              type="button"
              className="btn-cancelar-pozos"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <i className="bi bi-x-circle me-2"></i>
              Cancelar
            </button>

            <div className="d-flex gap-2">
              {currentPage > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-chevron-left me-2"></i>
                  Anterior
                </button>
              )}

              {currentPage < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={isSubmitting}
                >
                  Siguiente
                  <i className="bi bi-chevron-right ms-2"></i>
                </button>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>

      <Spinner msg={msg} loading={loading} />

      {/* Estilos adicionales para animaciones */}
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .recomendaciones-container {
          font-size: 0.85rem;
        }
      `}</style>
    </>
  );
};
