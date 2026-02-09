import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner.jsx';
import { addCalibraciones, upCalibraciones } from '../api/calibraciones.js';

// ══════════════════════════════════════════════════════════
// CONSTANTES Y CONFIGURACIONES
// ══════════════════════════════════════════════════════════

const opcionesEstado = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'No aplica'];
const opcionesModelo = ['Modelo1', 'Modelo2', 'Modelo3', 'Modelo4', 'Modelo5'];
const opcionesMateriales = ['Acero Inox', 'Fundicion', 'Plastico', 'Otros'];

const COLOR_CONFIG = {
  Rojo: { bg: '#dc3545', border: '#b02a37', icon: '🔴' },
  Amarillo: { bg: '#ffc107', border: '#d39e00', icon: '🟡' },
  Azul: { bg: '#0dcaf0', border: '#0aa2c0', icon: '🔵' },
  Verde: { bg: '#198754', border: '#146c43', icon: '🟢' },
  Gris: { bg: '#6c757d', border: '#545b62', icon: '⚪' },
};

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
    modelo: '',
    materiales: '',
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
    color: '',
    numero: '',
    presenciaORing: 'No',
    materiales: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_filtroSecundario: {
    estado: '',
    color: '',
    numero: '',
    presenciaORing: 'No',
    materiales: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  estado_FiltroLinea: {
    estado: '',
    color: '',
    numero: '',
    presenciaORing: 'No',
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
  mixer: {
    estado: '',
    observacion: '',
    nombreArchivo: '',
    recomendaciones: [],
  },
  secciones: {},
  presion_unimap: '',
  presion_computadora: '',
  presion_manometro: '',
  observaciones_acronex: '',
  Observaciones: '',
};

// ══════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES
// ══════════════════════════════════════════════════════════

const parseEstadoField = (estadoString) => {
  if (!estadoString) {
    return {
      estado: '',
      modelo: '',
      materiales: '',
      color: '',
      numero: '',
      presenciaORing: 'No',
      observacion: '',
      nombreArchivo: '',
      recomendaciones: [],
    };
  }

  try {
    let parsed = JSON.parse(estadoString);

    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    return {
      estado: parsed.estado || '',
      modelo: parsed.modelo || '',
      materiales: parsed.materiales || '',
      color: parsed.color || '',
      numero: parsed.numero || '',
      presenciaORing: parsed.presenciaORing || 'No',
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
      modelo: '',
      materiales: '',
      color: '',
      numero: '',
      presenciaORing: 'No',
      observacion: '',
      nombreArchivo: '',
      recomendaciones: [],
    };
  }
};

// ══════════════════════════════════════════════════════════
// COMPONENTE: Selector de Color con Botones
// ══════════════════════════════════════════════════════════

const ColorSelector = ({ value, onChange, disabled }) => {
  return (
    <div className="color-selector-container">
      <div className="d-flex gap-2 flex-wrap">
        {Object.entries(COLOR_CONFIG).map(([colorName, config]) => (
          <button
            key={colorName}
            type="button"
            className={`btn-color ${value === colorName ? 'selected' : ''}`}
            onClick={() => onChange(colorName)}
            disabled={disabled}
            style={{
              '--color-bg': config.bg,
              '--color-border': config.border,
            }}
            title={colorName}
          >
            <span className="color-icon">{config.icon}</span>
            <span className="color-label">{colorName}</span>
          </button>
        ))}
      </div>
      {value && (
        <button
          type="button"
          className="btn btn-sm btn-link text-danger mt-2 p-0"
          onClick={() => onChange('')}
          disabled={disabled}
          style={{ fontSize: '0.7rem' }}
        >
          <i className="bi bi-x-circle me-1"></i>
          Limpiar selección
        </button>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// COMPONENTE: Input Numérico con Validación
// ══════════════════════════════════════════════════════════

const NumeroInput = ({ value, onChange, disabled, min = 0, max = 200 }) => {
  const handleChange = (e) => {
    const val = e.target.value;

    if (val === '' || /^\d+$/.test(val)) {
      const numVal = val === '' ? '' : parseInt(val, 10);

      if (val === '' || (numVal >= min && numVal <= max)) {
        onChange(numVal);
      }
    }
  };

  return (
    <div className="numero-input-container">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="form-control-pozos text-center"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder={`${min}-${max}`}
        style={{ fontSize: '0.85rem', fontWeight: '500' }}
      />
      <div className="d-flex justify-content-between mt-1">
        <small className="text-white-50" style={{ fontSize: '0.65rem' }}>
          Mín: {min}
        </small>
        <small className="text-white-50" style={{ fontSize: '0.65rem' }}>
          Máx: {max}
        </small>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// COMPONENTE: Toggle Switch para Presencia O-Ring
// ══════════════════════════════════════════════════════════

const ORingToggle = ({ value, onChange, disabled }) => {
  const isPresent = value === 'Si' || value === true;

  const handleToggle = () => {
    onChange(isPresent ? 'No' : 'Si');
  };

  return (
    <div className="oring-toggle-container">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className={`toggle-button ${isPresent ? 'active' : ''}`}
          onClick={handleToggle}
          disabled={disabled}
        >
          <span className="toggle-slider"></span>
        </button>
        <div className="toggle-label">
          <span
            className={`badge-soft ${
              isPresent ? 'badge-soft-success' : 'badge-soft-warning'
            }`}
          >
            <i
              className={`bi ${isPresent ? 'bi-check-circle-fill' : 'bi-x-circle'} me-1`}
            ></i>
            {isPresent ? 'Con O-Ring' : 'Sin O-Ring'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// COMPONENTE: Gestor de Recomendaciones
// ══════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════
// COMPONENTE: Gestor de Secciones con Presiones (FIJAS 1-30)
// ══════════════════════════════════════════════════════════

const SeccionesManager = ({ secciones = {}, onChange, disabled }) => {
  const TOTAL_SECCIONES = 30;
  const MIN_PRESION = 0;
  const MAX_PRESION = 20;

  // Crear array de secciones fijas del 1 al 30
  const seccionesArray = Array.from({ length: TOTAL_SECCIONES }, (_, i) => {
    const numeroSeccion = i + 1;
    return {
      seccion: numeroSeccion,
      presion: secciones[numeroSeccion] || '',
    };
  });

  const actualizarPresion = (seccion, valor) => {
    // Validar que el valor esté dentro del rango permitido
    if (valor !== '') {
      const numValor = parseFloat(valor);
      if (isNaN(numValor) || numValor < MIN_PRESION || numValor > MAX_PRESION) {
        return;
      }
    }

    const nuevasSecciones = { ...secciones };

    if (valor === '' || valor === null) {
      // Si el valor está vacío, eliminar la sección
      delete nuevasSecciones[seccion];
    } else {
      // Guardar con máximo 2 decimales
      nuevasSecciones[seccion] = parseFloat(parseFloat(valor).toFixed(2));
    }

    onChange(nuevasSecciones);
  };

  const limpiarTodasSecciones = () => {
    if (window.confirm('¿Está seguro de limpiar todas las secciones?')) {
      onChange({});
    }
  };

  // Contar secciones con datos
  const seccionesCargadas = Object.keys(secciones).length;

  return (
    <div className="secciones-container">
      {/* Header con información */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="badge bg-info text-dark me-2">
            <i className="bi bi-list-ol me-1"></i>
            {seccionesCargadas} / {TOTAL_SECCIONES} secciones cargadas
          </span>
          {seccionesCargadas > 0 && (
            <span className="badge bg-success">
              <i className="bi bi-speedometer2 me-1"></i>
              Promedio:{' '}
              {(
                Object.values(secciones).reduce(
                  (acc, val) => acc + parseFloat(val),
                  0,
                ) / seccionesCargadas
              ).toFixed(2)}{' '}
              bares
            </span>
          )}
        </div>
        {seccionesCargadas > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={limpiarTodasSecciones}
            disabled={disabled}
          >
            <i className="bi bi-trash me-1"></i>
            Limpiar todas
          </button>
        )}
      </div>

      {/* Info de validación */}
      <div
        className="alert alert-info py-2 px-3 mb-3"
        style={{ fontSize: '0.75rem' }}
      >
        <i className="bi bi-info-circle me-2"></i>
        Rango permitido: <strong>0 a 20 bares</strong> (hasta 2 decimales). Las
        secciones se mantienen fijas del 1 al 30.
      </div>

      {/* Tabla de secciones */}
      <div
        className="table-responsive"
        style={{ maxHeight: '400px', overflowY: 'auto' }}
      >
        <table className="table table-dark table-sm table-hover mb-0">
          <thead
            style={{
              position: 'sticky',
              top: 0,
              background: '#212529',
              zIndex: 10,
            }}
          >
            <tr>
              <th
                style={{ width: '25%', fontSize: '0.8rem', padding: '0.75rem' }}
              >
                <i className="bi bi-hash me-1"></i>Sección
              </th>
              <th
                style={{ width: '55%', fontSize: '0.8rem', padding: '0.75rem' }}
              >
                <i className="bi bi-speedometer me-1"></i>Presión (bares)
              </th>
              <th
                style={{ width: '20%', fontSize: '0.8rem', padding: '0.75rem' }}
                className="text-center"
              >
                <i className="bi bi-gear-fill"></i>Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {seccionesArray.map(({ seccion, presion }) => {
              const tieneDatos = presion !== '';
              return (
                <tr
                  key={seccion}
                  style={{
                    background: tieneDatos
                      ? 'rgba(13, 202, 240, 0.05)'
                      : 'transparent',
                  }}
                >
                  {/* Número de sección */}
                  <td
                    style={{
                      verticalAlign: 'middle',
                      padding: '0.5rem 0.75rem',
                    }}
                  >
                    <span
                      className={`badge ${tieneDatos ? 'bg-primary' : 'bg-secondary'}`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      Sección {seccion}
                    </span>
                  </td>

                  {/* Input de presión */}
                  <td
                    style={{
                      verticalAlign: 'middle',
                      padding: '0.5rem 0.75rem',
                    }}
                  >
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={presion}
                      onChange={(e) =>
                        actualizarPresion(seccion, e.target.value)
                      }
                      onBlur={(e) => {
                        // Al perder el foco, formatear a 2 decimales
                        if (e.target.value !== '') {
                          const valor = parseFloat(e.target.value);
                          if (!isNaN(valor)) {
                            actualizarPresion(seccion, valor.toFixed(2));
                          }
                        }
                      }}
                      disabled={disabled}
                      min={MIN_PRESION}
                      max={MAX_PRESION}
                      step="0.01"
                      placeholder={`${MIN_PRESION} - ${MAX_PRESION}`}
                      style={{
                        fontSize: '0.85rem',
                        background: tieneDatos
                          ? 'rgba(13, 202, 240, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: tieneDatos
                          ? '1px solid rgba(13, 202, 240, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        fontWeight: tieneDatos ? '600' : '400',
                      }}
                    />
                  </td>

                  {/* Estado / Acción */}
                  <td
                    className="text-center"
                    style={{
                      verticalAlign: 'middle',
                      padding: '0.5rem 0.75rem',
                    }}
                  >
                    {tieneDatos ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => actualizarPresion(seccion, '')}
                        disabled={disabled}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.4rem',
                        }}
                        title="Limpiar valor"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    ) : (
                      <span
                        className="text-white-50"
                        style={{ fontSize: '0.7rem' }}
                      >
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer informativo */}
      <div
        className="mt-3 p-2"
        style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '5px' }}
      >
        <small className="text-white-50 d-block" style={{ fontSize: '0.7rem' }}>
          <i className="bi bi-lightbulb me-1"></i>
          <strong>Tip:</strong> Las secciones están numeradas del 1 al 30. Solo
          ingrese valores en las secciones que necesite. Puede dejar las demás
          vacías.
        </small>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// COMPONENTE: Navegación de Páginas
// ══════════════════════════════════════════════════════════

const PaginationNav = ({ currentPage, onPageChange, errors }) => {
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

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: Modal de Calibraciones
// ══════════════════════════════════════════════════════════

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
    { campo: 'estado_filtroLinea', label: 'Filtro Línea', icon: 'bi-filter' },
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
    { campo: 'mixer', label: 'Mixer', icon: 'bi-circle-fill' },
  ];

  useEffect(() => {
    if (calibracion) {
      if (calibracion.id) {
        const parsedCalibracion = { ...calibracion };

        camposEstado.forEach(({ campo }) => {
          if (typeof calibracion[campo] === 'string') {
            parsedCalibracion[campo] = parseEstadoField(calibracion[campo]);
          } else if (!calibracion[campo]) {
            parsedCalibracion[campo] = {
              estado: '',
              modelo: '',
              materiales: '',
              color: '',
              numero: '',
              presenciaORing: 'No',
              observacion: '',
              nombreArchivo: '',
              recomendaciones: [],
            };
          }
        });

        // Parsear secciones si existe
        if (typeof calibracion.secciones === 'string') {
          try {
            parsedCalibracion.secciones = JSON.parse(calibracion.secciones);
          } catch (error) {
            console.error('Error parseando secciones:', error);
            parsedCalibracion.secciones = {};
          }
        } else if (!calibracion.secciones) {
          parsedCalibracion.secciones = {};
        }

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

  if (!calibracion) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleEstadoChange = (campo, propiedad, value) => {
    setForm((prev) => ({
      ...prev,
      [campo]: {
        ...prev[campo],
        [propiedad]: value,
      },
    }));
  };

  const handleRecomendacionesChange = (campo, recomendaciones) => {
    setForm((prev) => ({
      ...prev,
      [campo]: {
        ...prev[campo],
        recomendaciones,
      },
    }));
  };

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
      setCurrentPage(1);
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

      // Convertir secciones a JSON string
      if (typeof formToSend.secciones === 'object') {
        formToSend.secciones = JSON.stringify(formToSend.secciones);
      }

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
              {camposEstado.map(({ campo, label, icon }) => {
                const esFiltro = [
                  'Filtro Primario',
                  'Filtro Secundario',
                  'Filtro Línea',
                ].includes(label);
                const esBomba = label === 'Bomba';

                return (
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

                      {esBomba && (
                        <>
                          <div className="mb-2">
                            <label
                              className="form-label-pozos"
                              style={{ fontSize: '0.8rem' }}
                            >
                              Modelo
                            </label>
                            <select
                              className="form-control-pozos"
                              value={form[campo]?.modelo || ''}
                              onChange={(e) =>
                                handleEstadoChange(
                                  campo,
                                  'modelo',
                                  e.target.value,
                                )
                              }
                              disabled={isSubmitting}
                              style={{ fontSize: '0.85rem' }}
                            >
                              <option value="">Seleccione Modelo</option>
                              {opcionesModelo.map((op) => (
                                <option key={op} value={op}>
                                  {op}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mb-2">
                            <label
                              className="form-label-pozos"
                              style={{ fontSize: '0.8rem' }}
                            >
                              Materiales
                            </label>
                            <select
                              className="form-control-pozos"
                              value={form[campo]?.materiales || ''}
                              onChange={(e) =>
                                handleEstadoChange(
                                  campo,
                                  'materiales',
                                  e.target.value,
                                )
                              }
                              disabled={isSubmitting}
                              style={{ fontSize: '0.85rem' }}
                            >
                              <option value="">Seleccione Materiales</option>
                              {opcionesMateriales.map((op) => (
                                <option key={op} value={op}>
                                  {op}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      {esFiltro && (
                        <>
                          <div className="mb-3">
                            <label
                              className="form-label-pozos mb-2"
                              style={{ fontSize: '0.8rem' }}
                            >
                              <i className="bi bi-palette me-1"></i>
                              Color
                            </label>
                            <ColorSelector
                              value={form[campo]?.color || ''}
                              onChange={(color) =>
                                handleEstadoChange(campo, 'color', color)
                              }
                              disabled={isSubmitting}
                            />
                          </div>

                          <div className="mb-3">
                            <label
                              className="form-label-pozos mb-2"
                              style={{ fontSize: '0.8rem' }}
                            >
                              <i className="bi bi-123 me-1"></i>
                              Número (0-200)
                            </label>
                            <NumeroInput
                              value={form[campo]?.numero || ''}
                              onChange={(numero) =>
                                handleEstadoChange(campo, 'numero', numero)
                              }
                              disabled={isSubmitting}
                              min={0}
                              max={200}
                            />
                          </div>

                          <div className="mb-3">
                            <label
                              className="form-label-pozos mb-2"
                              style={{ fontSize: '0.8rem' }}
                            >
                              <i className="bi bi-circle me-1"></i>
                              Presencia O-Ring
                            </label>
                            <ORingToggle
                              value={form[campo]?.presenciaORing || 'No'}
                              onChange={(valor) =>
                                handleEstadoChange(
                                  campo,
                                  'presenciaORing',
                                  valor,
                                )
                              }
                              disabled={isSubmitting}
                            />
                          </div>
                        </>
                      )}

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
                                cursor: isSubmitting
                                  ? 'not-allowed'
                                  : 'pointer',
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
                                style={{
                                  fontSize: '0.7rem',
                                  maxWidth: '150px',
                                }}
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
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="fade-in">
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

            <h4 className="fw-bold mb-4 text-white d-flex align-items-center">
              <i className="bi bi-list-ol me-2"></i>
              Secciones y Presiones
            </h4>

            <div className="row g-4 mb-5">
              <div className="col-12">
                <div
                  className="border rounded p-4"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <SeccionesManager
                    secciones={form.secciones || {}}
                    onChange={(nuevasSecciones) =>
                      setForm((prev) => ({
                        ...prev,
                        secciones: nuevasSecciones,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

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

            <PaginationNav
              currentPage={currentPage}
              totalPages={3}
              onPageChange={handlePageChange}
              errors={errors}
            />

            {renderPageContent()}
          </div>

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
                  className="btn-guardar-calibraciones"
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

        .secciones-container {
          font-size: 0.85rem;
        }

        /* ══════════════════════════════════════════ */
        /* COLOR SELECTOR STYLES */
        /* ══════════════════════════════════════════ */
        .color-selector-container {
          width: 100%;
        }

        .btn-color {
          flex: 1;
          min-width: 60px;
          padding: 0.5rem 0.3rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .btn-color:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: var(--color-border);
          background: var(--color-bg);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .btn-color.selected {
          border-color: var(--color-border);
          background: var(--color-bg);
          border-width: 3px;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
        }

        .btn-color:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .color-icon {
          font-size: 1.2rem;
          line-height: 1;
        }

        .color-label {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ══════════════════════════════════════════ */
        /* NUMERO INPUT STYLES */
        /* ══════════════════════════════════════════ */
        .numero-input-container input {
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
        }

        /* ══════════════════════════════════════════ */
        /* O-RING TOGGLE STYLES */
        /* ══════════════════════════════════════════ */
        .oring-toggle-container {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }

        .toggle-button {
          position: relative;
          width: 56px;
          height: 28px;
          background: #6c757d;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          padding: 0;
        }

        .toggle-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .toggle-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-button.active {
          background: #198754;
        }

        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-button.active .toggle-slider {
          transform: translateX(28px);
        }

        .toggle-label {
          flex: 1;
        }

        .toggle-label .badge {
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
          font-weight: 600;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .btn-color {
            min-width: 50px;
            padding: 0.4rem 0.2rem;
          }

          .color-icon {
            font-size: 1rem;
          }

          .color-label {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </>
  );
};
