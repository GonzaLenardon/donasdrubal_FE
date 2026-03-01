import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner.jsx';
import { addCalibraciones, upCalibraciones } from '../api/calibraciones.js';

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
  imagen: '',
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
  presion_unimap: { valor: '', nombreArchivo: '' },
  presion_computadora: { valor: '', nombreArchivo: '' },
  presion_manometro: { valor: '', nombreArchivo: '' },
  observaciones_acronex: '',
  Observaciones: '',
};

// ── Helpers de parseo ──────────────────────────────────────────────────────

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
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
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

/**
 * Parser para campos de presión — soporta doble encoding de DB.
 * La DB devuelve: "\"{\\\"valor\\\":\\\"15\\\",\\\"nombreArchivo\\\":\\\"...\\\"}\""
 * Cubre: doble-encoding, objeto directo, número plano (retrocompat FLOAT).
 */
const parsePresionField = (presionData) => {
  if (presionData === null || presionData === undefined)
    return { valor: '', nombreArchivo: '' };
  if (typeof presionData === 'number')
    return { valor: presionData, nombreArchivo: '' };
  if (typeof presionData === 'object') {
    return {
      valor: presionData.valor ?? '',
      nombreArchivo: presionData.nombreArchivo ?? '',
    };
  }
  if (typeof presionData === 'string') {
    if (presionData.trim() === '') return { valor: '', nombreArchivo: '' };
    try {
      let parsed = JSON.parse(presionData);
      // 👇 Doble encoding: la DB serializa el JSON.stringify del frontend como string
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (typeof parsed === 'number')
        return { valor: parsed, nombreArchivo: '' };
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          valor: parsed.valor ?? '',
          nombreArchivo: parsed.nombreArchivo ?? '',
        };
      }
    } catch {
      const numValor = parseFloat(presionData);
      return { valor: isNaN(numValor) ? '' : numValor, nombreArchivo: '' };
    }
  }
  return { valor: '', nombreArchivo: '' };
};

// ── Sub-componentes ────────────────────────────────────────────────────────

const ColorSelector = ({ value, onChange, disabled }) => (
  <div className="color-selector-container">
    <div className="d-flex gap-2 flex-wrap">
      {Object.entries(COLOR_CONFIG).map(([colorName, config]) => (
        <button
          key={colorName}
          type="button"
          className={`btn-color ${value === colorName ? 'selected' : ''}`}
          onClick={() => onChange(colorName)}
          disabled={disabled}
          style={{ '--color-bg': config.bg, '--color-border': config.border }}
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
        <i className="bi bi-x-circle me-1"></i>Limpiar selección
      </button>
    )}
  </div>
);

const NumeroInput = ({ value, onChange, disabled, min = 0, max = 200 }) => {
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      const numVal = val === '' ? '' : parseInt(val, 10);
      if (val === '' || (numVal >= min && numVal <= max)) onChange(numVal);
    }
  };
  return (
    <div className="numero-input-container">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        className="form-control text-center"
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

const ORingToggle = ({ value, onChange, disabled }) => {
  const isPresent = value === 'Si' || value === true;
  return (
    <div className="oring-toggle-container">
      <div className="d-flex align-items-center gap-3">
        <button
          type="button"
          className={`toggle-button ${isPresent ? 'active' : ''}`}
          onClick={() => onChange(isPresent ? 'No' : 'Si')}
          disabled={disabled}
        >
          <span className="toggle-slider"></span>
        </button>
        <div className="toggle-label">
          <span
            className={`badge-soft ${isPresent ? 'badge-soft-success' : 'badge-soft-warning'}`}
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

const RecomendacionesManager = ({
  recomendaciones = [],
  onChange,
  disabled,
}) => {
  const [nuevaRecomendacion, setNuevaRecomendacion] = useState('');

  const agregarRecomendacion = () => {
    if (nuevaRecomendacion.trim()) {
      onChange([
        ...recomendaciones,
        {
          id: Date.now(),
          texto: nuevaRecomendacion.trim(),
          fecha: new Date().toISOString(),
        },
      ]);
      setNuevaRecomendacion('');
    }
  };

  const eliminarRecomendacion = (id) =>
    onChange(recomendaciones.filter((rec) => rec.id !== id));

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
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              agregarRecomendacion();
            }
          }}
          disabled={disabled}
          style={{
            fontSize: '0.75rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
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

const SeccionesManager = ({ secciones = {}, onChange, disabled }) => {
  const TOTAL_SECCIONES = 30;
  const MIN_PRESION = 0;
  const MAX_PRESION = 20;

  const seccionesArray = Array.from({ length: TOTAL_SECCIONES }, (_, i) => ({
    seccion: i + 1,
    presion: secciones[i + 1] || '',
  }));

  const actualizarPresion = (seccion, valor) => {
    if (valor !== '') {
      const numValor = parseFloat(valor);
      if (isNaN(numValor) || numValor < MIN_PRESION || numValor > MAX_PRESION)
        return;
    }
    const nuevasSecciones = { ...secciones };
    if (valor === '' || valor === null) {
      delete nuevasSecciones[seccion];
    } else {
      nuevasSecciones[seccion] = parseFloat(parseFloat(valor).toFixed(2));
    }
    onChange(nuevasSecciones);
  };

  const seccionesCargadas = Object.keys(secciones).length;

  return (
    <div className="secciones-container">
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
            onClick={() => {
              if (
                window.confirm('¿Está seguro de limpiar todas las secciones?')
              )
                onChange({});
            }}
            disabled={disabled}
          >
            <i className="bi bi-trash me-1"></i>Limpiar todas
          </button>
        )}
      </div>

      <div
        className="alert alert-info py-2 px-3 mb-3"
        style={{ fontSize: '0.75rem' }}
      >
        <i className="bi bi-info-circle me-2"></i>
        Rango permitido: <strong>0 a 20 bares</strong> (hasta 2 decimales).
      </div>

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
                <i className="bi bi-gear-fill"></i> Estado
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
                      ? 'rgba(13,202,240,0.05)'
                      : 'transparent',
                  }}
                >
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
                        if (e.target.value !== '') {
                          const valor = parseFloat(e.target.value);
                          if (!isNaN(valor))
                            actualizarPresion(seccion, valor.toFixed(2));
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
                          ? 'rgba(13,202,240,0.1)'
                          : 'rgba(255,255,255,0.05)',
                        border: tieneDatos
                          ? '1px solid rgba(13,202,240,0.3)'
                          : '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontWeight: tieneDatos ? '600' : '400',
                      }}
                    />
                  </td>
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

      <div
        className="mt-3 p-2"
        style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '5px' }}
      >
        <small className="text-white-50 d-block" style={{ fontSize: '0.7rem' }}>
          <i className="bi bi-lightbulb me-1"></i>
          <strong>Tip:</strong> Ingrese solo los valores de las secciones que
          necesite.
        </small>
      </div>
    </div>
  );
};

const PaginationNav = ({ currentPage, onPageChange, errors }) => {
  const pages = [
    { number: 1, title: 'Datos Básicos', icon: 'bi-info-circle' },
    { number: 2, title: 'Estados y Componentes', icon: 'bi-clipboard-check' },
    { number: 3, title: 'Presiones y Observaciones', icon: 'bi-speedometer2' },
  ];
  return (
    <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
      {pages.map((page) => (
        <button
          key={page.number}
          type="button"
          className={`btn ${currentPage === page.number ? 'btn-primary' : 'btn-outline-secondary'} btn-sm position-relative`}
          onClick={() => onPageChange(page.number)}
          style={{ minWidth: '150px' }}
        >
          <i className={`${page.icon} me-2`}></i>
          {page.title}
          {errors[`page${page.number}`] && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              !
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

/**
 * AdjuntoArchivo — muestra archivo existente (con link "Ver") o permite adjuntar uno nuevo.
 * En edición, si hay nombreArchivo guardado en DB se ofrece ver el archivo actual.
 */
const AdjuntoArchivo = ({ campo, form, onFileChange, onRemove, disabled }) => {
  const nombreArchivo = form[campo]?.nombreArchivo;
  const tieneArchivoNuevo = !!form[campo]?.archivo;

  return (
    <div>
      <label className="form-label" style={{ fontSize: '0.8rem' }}>
        <i className="bi bi-paperclip me-1"></i>Archivo adjunto
      </label>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        {!nombreArchivo ? (
          /* Sin archivo — zona de carga */
          <label
            className="btn btn-sm btn-outline-success flex-grow-1"
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <i className="bi bi-paperclip me-1"></i>Adjuntar archivo
            <input
              type="file"
              className="d-none"
              onChange={(e) => onFileChange(campo, e.target.files[0])}
              disabled={disabled}
              accept="image/*,.pdf"
            />
          </label>
        ) : tieneArchivoNuevo ? (
          /* Archivo nuevo seleccionado (aún no subido) */
          <>
            <span
              className="badge bg-warning text-dark flex-grow-1 text-truncate"
              style={{ fontSize: '0.7rem', maxWidth: '160px' }}
              title={nombreArchivo}
            >
              <i className="bi bi-clock me-1"></i>Nuevo archivo pendiente
            </span>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
              onClick={() => onRemove(campo)}
              disabled={disabled}
              title="Cancelar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </>
        ) : (
          /* Archivo existente guardado en DB */
          <>
            <a
              href={`${import.meta.env.VITE_API_URL}/uploads/calibraciones/${nombreArchivo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-info"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
            >
              <i className="bi bi-eye me-1"></i>Ver actual
            </a>
            {/* Reemplazar archivo existente */}
            <label
              className="btn btn-sm btn-outline-warning"
              style={{
                fontSize: '0.7rem',
                padding: '0.2rem 0.5rem',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              <i className="bi bi-arrow-repeat me-1"></i>Reemplazar
              <input
                type="file"
                className="d-none"
                onChange={(e) => onFileChange(campo, e.target.files[0])}
                disabled={disabled}
                accept="image/*,.pdf"
              />
            </label>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
              onClick={() => onRemove(campo)}
              disabled={disabled}
              title="Quitar archivo"
            >
              <i className="bi bi-trash"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
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

        // Parsear campos de estado
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

        // Parsear presiones — con doble encoding de DB
        ['presion_unimap', 'presion_computadora', 'presion_manometro'].forEach(
          (campo) => {
            parsedCalibracion[campo] = parsePresionField(calibracion[campo]);
          },
        );

        parsedCalibracion.imagen = calibracion.imagen || '';

        // Parsear secciones
        if (typeof calibracion.secciones === 'string') {
          try {
            parsedCalibracion.secciones = JSON.parse(calibracion.secciones);
          } catch {
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
        setForm({ ...emptyCalibracion, maquina_id: calibracion.maquina_id });
      }
    }
  }, [calibracion]);

  if (!calibracion) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
  };

  const handleEstadoChange = (campo, propiedad, value) => {
    setForm((prev) => ({
      ...prev,
      [campo]: { ...prev[campo], [propiedad]: value },
    }));
  };

  const handleRecomendacionesChange = (campo, recomendaciones) => {
    setForm((prev) => ({
      ...prev,
      [campo]: { ...prev[campo], recomendaciones },
    }));
  };

  const handleFileChange = (campo, file) => {
    if (!file) return;
    const nombreUnico = `${campo}_${Date.now()}_${file.name}`;
    if (campo === 'imagen') {
      setForm((prev) => ({
        ...prev,
        imagen: nombreUnico,
        imagenArchivo: file,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [campo]: { ...prev[campo], nombreArchivo: nombreUnico, archivo: file },
    }));
  };

  const handleRemoveFile = (campo) => {
    if (campo === 'imagen') {
      setForm((prev) => ({ ...prev, imagen: '', imagenArchivo: null }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [campo]: { ...prev[campo], nombreArchivo: '', archivo: null },
    }));
  };

  // ── Upload de archivos ────────────────────────────────────────────────────

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

    ['presion_unimap', 'presion_computadora', 'presion_manometro'].forEach(
      (campo) => {
        if (form[campo]?.archivo) {
          archivosParaSubir.push({
            campo,
            archivo: form[campo].archivo,
            nombreArchivo: form[campo].nombreArchivo,
          });
        }
      },
    );

    if (form.imagenArchivo) {
      archivosParaSubir.push({
        campo: 'imagen',
        archivo: form.imagenArchivo,
        nombreArchivo: form.imagen,
      });
    }

    if (archivosParaSubir.length === 0) return true;

    for (const item of archivosParaSubir) {
      const formData = new FormData();
      formData.append('campo', item.campo);
      formData.append('nombreArchivo', item.nombreArchivo);
      formData.append('file', item.archivo);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/calibraciones/upload`,
        { method: 'POST', credentials: 'include', body: formData },
      );
      if (!response.ok)
        throw new Error(`Error al subir archivo de ${item.campo}`);
    }
    return true;
  };

  // ── Validaciones ──────────────────────────────────────────────────────────

  const validarCamposPorPagina = (pageNumber) => {
    const newErrors = {};
    if (pageNumber === 1) {
      if (!form.responsable?.trim())
        newErrors.responsable = 'El responsable es requerido';
      if (!form.fecha) newErrors.fecha = 'La fecha es requerida';
      if (Object.keys(newErrors).length > 0) newErrors.page1 = true;
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

  // ── Submit ────────────────────────────────────────────────────────────────

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

      // Serializar campos de estado
      camposEstado.forEach(({ campo }) => {
        if (typeof formToSend[campo] === 'object') {
          const { archivo, path, ...jsonData } = formToSend[campo];
          formToSend[campo] = JSON.stringify(jsonData);
        }
      });

      // Serializar presiones
      ['presion_unimap', 'presion_computadora', 'presion_manometro'].forEach(
        (campo) => {
          if (typeof formToSend[campo] === 'object') {
            const { archivo, ...jsonData } = formToSend[campo];
            formToSend[campo] = JSON.stringify(jsonData);
          }
        },
      );

      delete formToSend.imagenArchivo;

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
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // RENDER POR PÁGINA
  // ══════════════════════════════════════════════════════════

  const renderPageContent = () => {
    switch (currentPage) {
      // ── Página 1: Datos básicos + imagen ──────────────────────────────────
      case 1:
        return (
          <div className="fade-in">
            <h4 className="fw-bold mb-4 d-flex align-items-center">
              <i className="bi bi-info-circle me-2"></i>Información General
            </h4>

            <div className="row g-4">
              <div className="col-md-8">
                <div className="form-group">
                  <label htmlFor="responsable" className="form-label">
                    <i className="bi bi-person-fill me-2"></i>
                    Responsable <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="responsable"
                    className={`form-control ${errors.responsable ? 'is-invalid' : ''}`}
                    name="responsable"
                    placeholder="Ej: Juan Pérez"
                    value={form.responsable || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.responsable && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.responsable}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="fecha" className="form-label">
                    <i className="bi bi-calendar-fill me-2"></i>
                    Fecha <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    id="fecha"
                    className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
                    name="fecha"
                    value={form.fecha || ''}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  {errors.fecha && (
                    <div className="invalid-feedback">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {errors.fecha}
                    </div>
                  )}
                </div>
              </div>

              {/* Imagen del Informe */}
              <div className="col-12">
                <div
                  className="border rounded p-4"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderStyle: 'dashed',
                  }}
                >
                  <label className="form-label d-flex align-items-center gap-2 mb-3">
                    <i className="bi bi-image-fill text-info fs-5"></i>
                    <span>
                      Imagen del Informe{' '}
                      <small className="text-white-50 fw-normal">
                        (opcional)
                      </small>
                    </span>
                  </label>

                  {/* EDICIÓN: imagen guardada en DB — mostrar preview + acciones */}
                  {form.imagen && !form.imagenArchivo && (
                    <div className="mb-3">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/calibraciones/${form.imagen}`}
                        alt="Imagen actual del informe"
                        className="rounded mb-2"
                        style={{
                          maxHeight: '160px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          border: '1px solid rgba(255,255,255,0.15)',
                          display: 'block',
                        }}
                      />
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span
                          className="badge bg-info text-dark px-2 py-1"
                          style={{ fontSize: '0.7rem' }}
                        >
                          <i className="bi bi-image me-1"></i>Imagen actual
                          guardada
                        </span>
                        {/* Reemplazar */}
                        <label
                          className="btn btn-sm btn-outline-warning mb-0"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <i className="bi bi-arrow-repeat me-1"></i>Reemplazar
                          <input
                            type="file"
                            className="d-none"
                            onChange={(e) =>
                              handleFileChange('imagen', e.target.files[0])
                            }
                            disabled={isSubmitting}
                            accept="image/*,.pdf"
                          />
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                          }}
                          onClick={() => handleRemoveFile('imagen')}
                          disabled={isSubmitting}
                        >
                          <i className="bi bi-trash me-1"></i>Quitar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Preview imagen nueva seleccionada */}
                  {form.imagenArchivo && (
                    <div className="mb-3">
                      <img
                        src={URL.createObjectURL(form.imagenArchivo)}
                        alt="Preview informe"
                        className="rounded mb-2"
                        style={{
                          maxHeight: '180px',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          border: '1px solid rgba(255,255,255,0.1)',
                          display: 'block',
                        }}
                      />
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="badge bg-warning text-dark"
                          style={{ fontSize: '0.7rem' }}
                        >
                          <i className="bi bi-clock me-1"></i>Nueva imagen —
                          pendiente de guardar
                        </span>
                        <small className="text-white-50">
                          {form.imagenArchivo.name}
                        </small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveFile('imagen')}
                          disabled={isSubmitting}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                          }}
                        >
                          <i className="bi bi-trash me-1"></i>Quitar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Zona de carga — solo si no hay imagen ni preview */}
                  {!form.imagen && !form.imagenArchivo && (
                    <label
                      className="d-flex flex-column align-items-center justify-content-center gap-2 rounded p-4"
                      style={{
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        border: '2px dashed rgba(13,202,240,0.3)',
                        background: 'rgba(13,202,240,0.03)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting)
                          e.currentTarget.style.background =
                            'rgba(13,202,240,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'rgba(13,202,240,0.03)';
                      }}
                    >
                      <i
                        className="bi bi-cloud-upload text-info"
                        style={{ fontSize: '2rem' }}
                      ></i>
                      <span
                        className="text-white-50"
                        style={{ fontSize: '0.85rem' }}
                      >
                        Hacé clic para seleccionar una imagen
                      </span>
                      <small
                        className="text-white-50"
                        style={{ fontSize: '0.7rem' }}
                      >
                        JPG, PNG, PDF
                      </small>
                      <input
                        type="file"
                        className="d-none"
                        onChange={(e) =>
                          handleFileChange('imagen', e.target.files[0])
                        }
                        disabled={isSubmitting}
                        accept="image/*,.pdf"
                      />
                    </label>
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

      // ── Página 2: Estados y Componentes ───────────────────────────────────
      case 2:
        return (
          <div className="fade-in">
            <h4 className="fw-bold mb-4 text-white d-flex align-items-center">
              <i className="bi bi-clipboard-check me-2"></i>Estados y
              Componentes
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
                        background: 'rgba(255,255,255,0.05)',
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <div className="d-flex align-items-center mb-3">
                        <i className={`${icon} me-2 text-info`}></i>
                        <h6 className="mb-0 text-white fw-bold">{label}</h6>
                      </div>

                      <div className="mb-2">
                        <label
                          className="form-label"
                          style={{ fontSize: '0.8rem' }}
                        >
                          Estado
                        </label>
                        <select
                          className="form-control"
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
                              className="form-label"
                              style={{ fontSize: '0.8rem' }}
                            >
                              Modelo
                            </label>
                            <select
                              className="form-control"
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
                              className="form-label"
                              style={{ fontSize: '0.8rem' }}
                            >
                              Materiales
                            </label>
                            <select
                              className="form-control"
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
                              className="form-label mb-2"
                              style={{ fontSize: '0.8rem' }}
                            >
                              <i className="bi bi-palette me-1"></i>Color
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
                              className="form-label mb-2"
                              style={{ fontSize: '0.8rem' }}
                            >
                              <i className="bi bi-123 me-1"></i>Número (0-200)
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
                              className="form-label mb-2"
                              style={{ fontSize: '0.8rem' }}
                            >
                              <i className="bi bi-circle me-1"></i>Presencia
                              O-Ring
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
                          className="form-label"
                          style={{ fontSize: '0.8rem' }}
                        >
                          Observación
                        </label>
                        <textarea
                          className="form-control"
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
                          className="form-label"
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
                        <AdjuntoArchivo
                          campo={campo}
                          form={form}
                          onFileChange={handleFileChange}
                          onRemove={handleRemoveFile}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ── Página 3: Presiones + secciones + observaciones ───────────────────
      case 3:
        return (
          <div className="fade-in">
            <h4 className="fw-bold mb-4 text-white d-flex align-items-center">
              <i className="bi bi-speedometer2 me-2"></i>Presiones
            </h4>

            <div className="row g-4 mb-5">
              {[
                { campo: 'presion_unimap', label: 'Presión Unimap' },
                { campo: 'presion_computadora', label: 'Presión Computadora' },
                { campo: 'presion_manometro', label: 'Presión Manómetro' },
              ].map(({ campo, label }) => (
                <div className="col-md-4" key={campo}>
                  <div
                    className="border rounded p-3 h-100"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <label className="form-label">
                      <i className="bi bi-speedometer me-2"></i>
                      {label} (bares)
                    </label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      placeholder="Ej: 3.5"
                      step="0.1"
                      value={form[campo]?.valor || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [campo]: { ...prev[campo], valor: e.target.value },
                        }))
                      }
                      disabled={isSubmitting}
                    />
                    <AdjuntoArchivo
                      campo={campo}
                      form={form}
                      onFileChange={handleFileChange}
                      onRemove={handleRemoveFile}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>

            <h4 className="fw-bold mb-4 text-white d-flex align-items-center">
              <i className="bi bi-list-ol me-2"></i>Secciones y Presiones
            </h4>
            <div className="row g-4 mb-5">
              <div className="col-12">
                <div
                  className="border rounded p-4"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderColor: 'rgba(255,255,255,0.1)',
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
              <i className="bi bi-chat-left-text me-2"></i>Observaciones
              Adicionales
            </h4>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="observaciones_acronex" className="form-label">
                    <i className="bi bi-journal-text me-2"></i>Observaciones
                    ACRONEX
                  </label>
                  <textarea
                    id="observaciones_acronex"
                    className="form-control"
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
                <div className="form-group">
                  <label htmlFor="Observaciones" className="form-label">
                    <i className="bi bi-journal-text me-2"></i>Observaciones
                    Generales
                  </label>
                  <textarea
                    id="Observaciones"
                    className="form-control"
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

  // ══════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ══════════════════════════════════════════════════════════

  return (
    <>
      <div className="modal-overlay">
        <div
          className="modal-container"
          style={{ maxWidth: '95vw', width: '95vw', minHeight: '95vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
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
              <i className="bi bi-x-circle me-2"></i>Cancelar
            </button>

            <div className="d-flex gap-2">
              {currentPage > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-chevron-left me-2"></i>Anterior
                </button>
              )}

              {currentPage < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={isSubmitting}
                >
                  Siguiente<i className="bi bi-chevron-right ms-2"></i>
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
        .numero-input-container input {
          font-family: 'Courier New', monospace;
          letter-spacing: 1px;
        }
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
