import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner.jsx';
import { addCalibraciones, upCalibraciones } from '../api/calibraciones.js';

const opcionesEstado = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'No aplica'];
const opcionesMateriales = ['Acero Inox', 'Fundicion', 'Plastico', 'Otros'];

const COLOR_CONFIG = {
  Rojo: { bg: '#dc3545', border: '#b02a37', icon: '🔴' },
  Amarillo: { bg: '#ffc107', border: '#d39e00', icon: '🟡' },
  Azul: { bg: '#0dcaf0', border: '#0aa2c0', icon: '🔵' },
  Verde: { bg: '#198754', border: '#146c43', icon: '🟢' },
  Gris: { bg: '#6c757d', border: '#545b62', icon: '⚪' },
};

// ── Constantes de validación de archivos ──────────────────────────────────
const TIPOS_IMAGEN_PERMITIDOS = ['image/png', 'image/jpeg', 'image/jpg'];
const EXTENSION_IMAGEN_REGEX = /\.(png|jpg|jpeg)$/i;
const TIPOS_PDF_PERMITIDOS = ['application/pdf'];
const EXTENSION_PDF_REGEX = /\.pdf$/i;

// ── Estado vacío ──────────────────────────────────────────────────────────
const emptyCalibracion = {
  fecha: '',
  responsable_id: '',
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
    nombreArchivoPdf: '',
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
  observaciones_presion: '',
  recomendaciones_presion: '',
  observaciones_acronex: '',
  observaciones_generales: '',
};

// ── Helpers de parseo ──────────────────────────────────────────────────────

const parseEstadoField = (estadoString) => {
  if (!estadoString)
    return {
      estado: '',
      modelo: '',
      materiales: '',
      color: '',
      numero: '',
      presenciaORing: 'No',
      observacion: '',
      nombreArchivo: '',
      nombreArchivoPdf: '',
      recomendaciones: [],
    };
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
      nombreArchivoPdf: parsed.nombreArchivoPdf || '',
      recomendaciones: Array.isArray(parsed.recomendaciones)
        ? parsed.recomendaciones
        : [],
      path: parsed.path || '',
    };
  } catch {
    return {
      estado: '',
      modelo: '',
      materiales: '',
      color: '',
      numero: '',
      presenciaORing: 'No',
      observacion: '',
      nombreArchivo: '',
      nombreArchivoPdf: '',
      recomendaciones: [],
    };
  }
};

const parsePresionField = (presionData) => {
  if (presionData === null || presionData === undefined)
    return { valor: '', nombreArchivo: '' };
  if (typeof presionData === 'number')
    return { valor: presionData, nombreArchivo: '' };
  if (typeof presionData === 'object')
    return {
      valor: presionData.valor ?? '',
      nombreArchivo: presionData.nombreArchivo ?? '',
    };
  if (typeof presionData === 'string') {
    if (presionData.trim() === '') return { valor: '', nombreArchivo: '' };
    try {
      let parsed = JSON.parse(presionData);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (typeof parsed === 'number')
        return { valor: parsed, nombreArchivo: '' };
      if (typeof parsed === 'object' && parsed !== null)
        return {
          valor: parsed.valor ?? '',
          nombreArchivo: parsed.nombreArchivo ?? '',
        };
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
        <small className="text-muted" style={{ fontSize: '0.65rem' }}>
          Mín: {min}
        </small>
        <small className="text-muted" style={{ fontSize: '0.65rem' }}>
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
            <div key={rec.id} className="cal-recomendacion-item">
              <i className="bi bi-check-circle-fill cal-recomendacion-icon"></i>
              <small className="flex-grow-1">{rec.texto}</small>
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
          className="form-control form-control-sm cal-rec-input"
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
        />
        <button
          type="button"
          className="btn btn-outline-success btn-sm"
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

// ── SeccionesManager: grilla de cards ─────────────────────────────────────
const SeccionesManager = ({ secciones = {}, onChange, disabled }) => {
  const TOTAL_SECCIONES = 30;
  const MIN_PRESION = 0;
  const MAX_PRESION = 20;

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
        <div className="d-flex gap-2 flex-wrap">
          <span className="cal-seccion-badge-count">
            <i className="bi bi-list-ol me-1"></i>
            {seccionesCargadas} / {TOTAL_SECCIONES} cargadas
          </span>
          {seccionesCargadas > 0 && (
            <span className="cal-seccion-badge-avg">
              <i className="bi bi-speedometer2 me-1"></i>
              Promedio:{' '}
              {(
                Object.values(secciones).reduce(
                  (acc, val) => acc + parseFloat(val),
                  0,
                ) / seccionesCargadas
              ).toFixed(2)}{' '}
              bar
            </span>
          )}
        </div>
        {seccionesCargadas > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              if (window.confirm('¿Limpiar todas las secciones?')) onChange({});
            }}
            disabled={disabled}
            style={{ fontSize: '0.75rem' }}
          >
            <i className="bi bi-trash me-1"></i>Limpiar todo
          </button>
        )}
      </div>

      <p className="cal-seccion-hint">
        <i className="bi bi-info-circle me-1"></i>
        Rango: <strong>0 – 20 bares</strong> (2 decimales). Completá solo las
        secciones que apliquen.
      </p>

      <div className="cal-secciones-grid">
        {Array.from({ length: TOTAL_SECCIONES }, (_, i) => {
          const seccion = i + 1;
          const presion = secciones[seccion] ?? '';
          const tieneDatos = presion !== '';
          return (
            <div
              key={seccion}
              className={`cal-seccion-card ${tieneDatos ? 'cal-seccion-card--activa' : ''}`}
            >
              <span className="cal-seccion-numero">S{seccion}</span>
              <input
                type="number"
                className="cal-seccion-input"
                value={presion}
                onChange={(e) => actualizarPresion(seccion, e.target.value)}
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
                placeholder="—"
              />
              {tieneDatos && (
                <button
                  type="button"
                  className="cal-seccion-clear"
                  onClick={() => actualizarPresion(seccion, '')}
                  disabled={disabled}
                  title="Limpiar"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          );
        })}
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
          className={`btn ${currentPage === page.number ? 'btn-success' : 'btn-outline-secondary'} btn-sm position-relative`}
          onClick={() => onPageChange(page.number)}
          style={{
            minWidth: '160px',
            fontWeight: currentPage === page.number ? 600 : 400,
          }}
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

// ── AdjuntoArchivo — solo imágenes PNG/JPG ────────────────────────────────
const AdjuntoArchivo = ({ campo, form, onFileChange, onRemove, disabled }) => {
  const nombreArchivo = form[campo]?.nombreArchivo;
  const tieneArchivoNuevo = !!form[campo]?.archivo;

  return (
    <div className="cal-adjunto-wrapper">
      <p className="cal-adjunto-label">
        <i className="bi bi-paperclip cal-adjunto-label-icon"></i>
        Archivo adjunto
      </p>

      {!nombreArchivo ? (
        <label
          className={`cal-adjunto-zona ${disabled ? 'cal-adjunto-zona--disabled' : ''}`}
        >
          <i className="bi bi-cloud-upload cal-adjunto-upload-icon"></i>
          <span className="cal-adjunto-upload-text">Adjuntar imagen</span>
          <span className="cal-adjunto-upload-hint">PNG o JPG</span>
          <input
            type="file"
            className="d-none"
            onChange={(e) => onFileChange(campo, e.target.files[0])}
            disabled={disabled}
            accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          />
        </label>
      ) : tieneArchivoNuevo ? (
        <div className="cal-adjunto-pendiente">
          <i className="bi bi-clock-history cal-adjunto-pendiente-icon"></i>
          <span className="cal-adjunto-pendiente-text">
            Nueva imagen pendiente
          </span>
          <button
            type="button"
            className="cal-adjunto-btn-quitar"
            onClick={() => onRemove(campo)}
            disabled={disabled}
            title="Cancelar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      ) : (
        <div className="cal-adjunto-existente">
          <i className="bi bi-image cal-adjunto-existente-icon"></i>
          <a
            href={`${import.meta.env.VITE_API_URL}/uploads/calibraciones/${nombreArchivo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cal-adjunto-btn-ver"
          >
            <i className="bi bi-eye me-1"></i>Ver
          </a>
          <label
            className={`cal-adjunto-btn-reemplazar ${disabled ? 'disabled' : ''}`}
          >
            <i className="bi bi-arrow-repeat me-1"></i>Reemplazar
            <input
              type="file"
              className="d-none"
              onChange={(e) => onFileChange(campo, e.target.files[0])}
              disabled={disabled}
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
            />
          </label>
          <button
            type="button"
            className="cal-adjunto-btn-quitar"
            onClick={() => onRemove(campo)}
            disabled={disabled}
            title="Quitar"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};

// ── AdjuntoArchivoPdf — solo PDF, usa nombreArchivoPdf / archivoPdf ────────
const AdjuntoArchivoPdf = ({
  campo,
  form,
  onFileChange,
  onRemove,
  disabled,
}) => {
  // 👇 Claves separadas: NO comparten estado con AdjuntoArchivo
  const nombreArchivo = form['estado_pastillas']?.nombreArchivoPdf;
  const tieneArchivoNuevo = !!form['estado_pastillas']?.archivoPdf;

  console.log('Campo', campo);
  console.log('que ?', nombreArchivo, tieneArchivoNuevo);

  return (
    <div className="cal-adjunto-wrapper">
      <p className="cal-adjunto-label">
        <i className="bi bi-file-pdf cal-adjunto-label-icon"></i>
        Informe de agua (PDF)
      </p>

      {!nombreArchivo ? (
        <label
          className={`cal-adjunto-zona ${disabled ? 'cal-adjunto-zona--disabled' : ''}`}
        >
          <i className="bi bi-file-earmark-pdf cal-adjunto-upload-icon"></i>
          <span className="cal-adjunto-upload-text">Adjuntar Informe</span>
          <span className="cal-adjunto-upload-hint">.PDF</span>
          <input
            type="file"
            className="d-none"
            onChange={(e) => onFileChange(campo, e.target.files[0])}
            disabled={disabled}
            accept=".pdf,application/pdf"
          />
        </label>
      ) : tieneArchivoNuevo ? (
        <div className="cal-adjunto-pendiente">
          <i className="bi bi-clock-history cal-adjunto-pendiente-icon"></i>
          <span className="cal-adjunto-pendiente-text">
            PDF pendiente de guardar
          </span>
          <button
            type="button"
            className="cal-adjunto-btn-quitar"
            onClick={() => onRemove(campo)}
            disabled={disabled}
            title="Cancelar"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      ) : (
        <div className="cal-adjunto-existente">
          <i className="bi bi-file-pdf cal-adjunto-existente-icon"></i>
          <a
            href={`${import.meta.env.VITE_API_URL}/uploads/calibraciones/${nombreArchivo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cal-adjunto-btn-ver"
          >
            <i className="bi bi-eye me-1"></i>Ver PDF
          </a>
          <label
            className={`cal-adjunto-btn-reemplazar ${disabled ? 'disabled' : ''}`}
          >
            <i className="bi bi-arrow-repeat me-1"></i>Reemplazar
            <input
              type="file"
              className="d-none"
              onChange={(e) => onFileChange(campo, e.target.files[0])}
              disabled={disabled}
              accept=".pdf,application/pdf"
            />
          </label>
          <button
            type="button"
            className="cal-adjunto-btn-quitar"
            onClick={() => onRemove(campo)}
            disabled={disabled}
            title="Quitar"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════

export const ModalCalibraciones = ({
  onClose,
  calibracion,
  ingenieros,
  onSaved,
}) => {
  const [form, setForm] = useState({ ...emptyCalibracion });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [fileErrors, setFileErrors] = useState({});

  const camposEstado = [
    { campo: 'estado_maquina', label: 'Estado Máquina', icon: 'bi-gear-fill' },
    { campo: 'estado_bomba', label: 'Bomba', icon: 'bi-droplet-fill' },
    { campo: 'estado_agitador', label: 'Agitador', icon: 'bi-arrow-repeat' },
    {
      campo: 'estado_filtroPrimario',
      label: 'Filtro Primario',
      icon: 'bi-funnel',
      recomendaciones: 'Protege a la bomba de pulverización',
    },
    {
      campo: 'estado_filtroSecundario',
      label: 'Filtro Secundario',
      icon: 'bi-funnel-fill',
      recomendaciones: 'Protegen caudalímetro, electroválvulas',
    },
    {
      campo: 'estado_filtroLinea',
      label: 'Filtro Línea',
      icon: 'bi-filter',
      recomendaciones: 'Protegen a las boquillas de taponamiento',
    },
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
              nombreArchivoPdf: '',
              recomendaciones: [],
            };
          }
        });

        ['presion_unimap', 'presion_computadora', 'presion_manometro'].forEach(
          (campo) => {
            parsedCalibracion[campo] = parsePresionField(calibracion[campo]);
          },
        );

        parsedCalibracion.imagen = calibracion.imagen || '';

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

  useEffect(() => {
    console.log('SetFormmmmmm', form);
  }, [form]);

  if (!calibracion) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'responsable_id' ? (value ? Number(value) : '') : value,
    }));
    if (errors[name])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
  };

  const handleEstadoChange = (campo, propiedad, value) =>
    setForm((prev) => ({
      ...prev,
      [campo]: { ...prev[campo], [propiedad]: value },
    }));

  const handleRecomendacionesChange = (campo, recomendaciones) =>
    setForm((prev) => ({
      ...prev,
      [campo]: { ...prev[campo], recomendaciones },
    }));

  // ── handleFileChange — imagen vs PDF según campo ───────────────────────
  const handleFileChange = (campo, file) => {
    if (!file) return;

    // estado_pastillas con AdjuntoArchivoPdf → espera PDF
    // Todos los demás → esperan imagen
    const esperaPdf = campo === 'estado_pastillas_pdf';

    if (esperaPdf) {
      if (
        !TIPOS_PDF_PERMITIDOS.includes(file.type) ||
        !EXTENSION_PDF_REGEX.test(file.name)
      ) {
        setFileErrors((prev) => ({
          ...prev,
          [campo]: 'Solo se permiten archivos PDF.',
        }));
        return;
      }
    } else {
      if (
        !TIPOS_IMAGEN_PERMITIDOS.includes(file.type) ||
        !EXTENSION_IMAGEN_REGEX.test(file.name)
      ) {
        setFileErrors((prev) => ({
          ...prev,
          [campo]: 'Solo se permiten imágenes PNG o JPG.',
        }));
        return;
      }
    }

    setFileErrors((prev) => {
      const n = { ...prev };
      delete n[campo];
      return n;
    });

    const inicial = esperaPdf ? 'informePastilla' : campo;

    const nombreUnico = `${inicial}_${Date.now()}_${file.name}`;

    // Imagen de portada del informe
    if (campo === 'imagen') {
      setForm((prev) => ({
        ...prev,
        imagen: nombreUnico,
        imagenArchivo: file,
      }));
      return;
    }

    // PDF de pastillas — campo virtual 'estado_pastillas_pdf'
    if (campo === 'estado_pastillas_pdf') {
      setForm((prev) => ({
        ...prev,
        estado_pastillas: {
          ...prev.estado_pastillas,
          nombreArchivoPdf: nombreUnico,
          archivoPdf: file,
        },
      }));
      return;
    }

    // Imagen estándar de cualquier componente
    setForm((prev) => ({
      ...prev,
      [campo]: { ...prev[campo], nombreArchivo: nombreUnico, archivo: file },
    }));
  };

  // ── handleRemoveFile ──────────────────────────────────────────────────────
  const handleRemoveFile = (campo) => {
    setFileErrors((prev) => {
      const n = { ...prev };
      delete n[campo];
      return n;
    });

    if (campo === 'imagen') {
      setForm((prev) => ({ ...prev, imagen: '', imagenArchivo: null }));
      return;
    }

    if (campo === 'estado_pastillas_pdf') {
      setForm((prev) => ({
        ...prev,
        estado_pastillas: {
          ...prev.estado_pastillas,
          nombreArchivoPdf: '',
          archivoPdf: null,
        },
      }));
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

    // Imágenes de componentes
    camposEstado.forEach(({ campo }) => {
      if (form[campo]?.archivo)
        archivosParaSubir.push({
          campo,
          archivo: form[campo].archivo,
          nombreArchivo: form[campo].nombreArchivo,
        });
    });

    // PDF de pastillas — campo separado
    if (form.estado_pastillas?.archivoPdf)
      archivosParaSubir.push({
        campo: 'estado_pastillas_pdf',
        archivo: form.estado_pastillas.archivoPdf,
        nombreArchivo: form.estado_pastillas.nombreArchivoPdf,
      });

    // Imágenes de presiones
    ['presion_unimap', 'presion_computadora', 'presion_manometro'].forEach(
      (campo) => {
        if (form[campo]?.archivo)
          archivosParaSubir.push({
            campo,
            archivo: form[campo].archivo,
            nombreArchivo: form[campo].nombreArchivo,
          });
      },
    );

    // Imagen de portada
    if (form.imagenArchivo)
      archivosParaSubir.push({
        campo: 'imagen',
        archivo: form.imagenArchivo,
        nombreArchivo: form.imagen,
      });

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
      if (!form.responsable_id)
        newErrors.responsable_id = 'El responsable es requerido';
      if (!form.fecha) newErrors.fecha = 'La fecha es requerida';
      if (Object.keys(newErrors).length > 0) newErrors.page1 = true;
    }
    return newErrors;
  };

  const validarTodoElFormulario = () => {
    const newErrors = {};
    if (!form.responsable_id) {
      newErrors.responsable_id = 'El responsable es requerido';
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

      camposEstado.forEach(({ campo }) => {
        if (typeof formToSend[campo] === 'object') {
          // Excluir archivos binarios antes de serializar
          const { archivo, archivoPdf, path, ...jsonData } = formToSend[campo];
          formToSend[campo] = JSON.stringify(jsonData);
        }
      });

      ['presion_unimap', 'presion_computadora', 'presion_manometro'].forEach(
        (campo) => {
          if (typeof formToSend[campo] === 'object') {
            const { archivo, ...jsonData } = formToSend[campo];
            formToSend[campo] = JSON.stringify(jsonData);
          }
        },
      );

      delete formToSend.imagenArchivo;
      if (typeof formToSend.secciones === 'object')
        formToSend.secciones = JSON.stringify(formToSend.secciones);

      let resp;
      if (form.id) {
        setMsg('Actualizando calibración...');
        const { id, ...formSinId } = formToSend;
        console.log('FomttoSend', formToSend);
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
            <div className="cal-section-card">
              <div className="cal-section-card-header">
                <i className="bi bi-info-circle-fill cal-section-card-icon"></i>
                <h5 className="cal-section-card-title">Información General</h5>
              </div>
              <div className="row g-3">
                <div className="col-md-8">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-person-fill"></i>Responsable{' '}
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-control ${errors.responsable_id ? 'is-invalid' : ''}`}
                      name="responsable_id"
                      value={form.responsable_id || ''}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccione responsable</option>
                      {ingenieros.map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.nombre}
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
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-calendar-fill"></i>Fecha{' '}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
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
              </div>
            </div>

            {/* Imagen del Informe */}
            <div className="cal-section-card mt-3">
              <div className="cal-section-card-header">
                <i className="bi bi-image-fill cal-section-card-icon"></i>
                <h5 className="cal-section-card-title">
                  Imagen del Informe
                  <small className="cal-section-card-subtitle">opcional</small>
                </h5>
              </div>

              {form.imagen && !form.imagenArchivo && (
                <div className="mb-3">
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/calibraciones/${form.imagen}`}
                    alt="Imagen actual"
                    className="cal-imagen-preview"
                  />
                  <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                    <span className="cal-imagen-badge">
                      <i className="bi bi-image me-1"></i>Imagen guardada
                    </span>
                    <label
                      className={`cal-adjunto-btn-reemplazar ${isSubmitting ? 'disabled' : ''}`}
                    >
                      <i className="bi bi-arrow-repeat me-1"></i>Reemplazar
                      <input
                        type="file"
                        className="d-none"
                        onChange={(e) =>
                          handleFileChange('imagen', e.target.files[0])
                        }
                        disabled={isSubmitting}
                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      />
                    </label>
                    <button
                      type="button"
                      className="cal-adjunto-btn-quitar"
                      onClick={() => handleRemoveFile('imagen')}
                      disabled={isSubmitting}
                    >
                      <i className="bi bi-trash me-1"></i>Quitar
                    </button>
                  </div>
                </div>
              )}

              {form.imagenArchivo && (
                <div className="mb-3">
                  <img
                    src={URL.createObjectURL(form.imagenArchivo)}
                    alt="Preview"
                    className="cal-imagen-preview"
                  />
                  <div className="d-flex align-items-center gap-2 mt-2">
                    <span className="cal-imagen-badge-pending">
                      <i className="bi bi-clock me-1"></i>Nueva imagen —
                      pendiente de guardar
                    </span>
                    <small className="text-muted">
                      {form.imagenArchivo.name}
                    </small>
                    <button
                      type="button"
                      className="cal-adjunto-btn-quitar"
                      onClick={() => handleRemoveFile('imagen')}
                      disabled={isSubmitting}
                    >
                      <i className="bi bi-trash me-1"></i>Quitar
                    </button>
                  </div>
                </div>
              )}

              {!form.imagen && !form.imagenArchivo && (
                <>
                  <label
                    className={`cal-imagen-dropzone ${isSubmitting ? 'cal-imagen-dropzone--disabled' : ''}`}
                  >
                    <i className="bi bi-cloud-upload cal-imagen-dropzone-icon"></i>
                    <span className="cal-imagen-dropzone-text">
                      Hacé clic para seleccionar una imagen
                    </span>
                    <small className="cal-imagen-dropzone-hint">
                      PNG o JPG
                    </small>
                    <input
                      type="file"
                      className="d-none"
                      onChange={(e) =>
                        handleFileChange('imagen', e.target.files[0])
                      }
                      disabled={isSubmitting}
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    />
                  </label>
                  {fileErrors['imagen'] && (
                    <p className="cal-file-error">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {fileErrors['imagen']}
                    </p>
                  )}
                </>
              )}
            </div>

            <div
              className="alert alert-info mt-3 d-flex align-items-start gap-2"
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
            <h4 className="cal-page-title">
              <i className="bi bi-clipboard-check me-2"></i>Estados y
              Componentes
            </h4>

            <div className="row g-3">
              {camposEstado.map(({ campo, label, icon, recomendaciones }) => {
                const esFiltro = [
                  'Filtro Primario',
                  'Filtro Secundario',
                  'Filtro Línea',
                ].includes(label);
                const esBomba = label === 'Bomba';
                const esPastilla = label === 'Pastillas';

                return (
                  <div className="col-xl-4 col-lg-6 col-md-6" key={campo}>
                    <div className="cal-componente-card">
                      <div className="cal-componente-card-header">
                        <i className={`${icon} cal-componente-icon`}></i>
                        <div>
                          <h6 className="cal-componente-title">{label}</h6>
                          {recomendaciones && (
                            <span className="cal-componente-subtitle">
                              {recomendaciones}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Estado */}
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
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Modelo bomba..."
                              value={form[campo]?.modelo || ''}
                              onChange={(e) =>
                                handleEstadoChange(
                                  campo,
                                  'modelo',
                                  e.target.value,
                                )
                              }
                              disabled={isSubmitting}
                            />
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

                      {/* PDF exclusivo de pastillas */}
                      {esPastilla && (
                        <div className="mt-3 pt-2 cal-componente-adjunto-separator">
                          <AdjuntoArchivoPdf
                            campo="estado_pastillas_pdf" // 👈 campo virtual independiente
                            form={form}
                            onFileChange={handleFileChange}
                            onRemove={handleRemoveFile}
                            disabled={isSubmitting}
                          />
                          {fileErrors['estado_pastillas_pdf'] && (
                            <p className="cal-file-error mt-1">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              {fileErrors['estado_pastillas_pdf']}
                            </p>
                          )}
                        </div>
                      )}

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

                      {/* Imagen estándar de todos los componentes */}
                      <div className="mt-3 pt-2 cal-componente-adjunto-separator">
                        <AdjuntoArchivo
                          campo={campo} // 👈 campo real del componente
                          form={form}
                          onFileChange={handleFileChange}
                          onRemove={handleRemoveFile}
                          disabled={isSubmitting}
                        />
                        {fileErrors[campo] && (
                          <p className="cal-file-error mt-1">
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            {fileErrors[campo]}
                          </p>
                        )}
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
            <div className="cal-section-card mb-4">
              <div className="cal-section-card-header">
                <i className="bi bi-speedometer2 cal-section-card-icon"></i>
                <h5 className="cal-section-card-title">Presiones</h5>
              </div>
              <div className="row g-3">
                {[
                  { campo: 'presion_unimap', label: 'Presión Unimap' },
                  {
                    campo: 'presion_computadora',
                    label: 'Presión Computadora',
                  },
                  { campo: 'presion_manometro', label: 'Presión Manómetro' },
                ].map(({ campo, label }) => (
                  <div className="col-md-4" key={campo}>
                    <div className="cal-presion-card">
                      <label
                        className="form-label"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <i className="bi bi-speedometer me-1"></i>
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
                      {fileErrors[campo] && (
                        <p className="cal-file-error mt-1">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          {fileErrors[campo]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="row g-3 mt-2">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-journal-text"></i>Observaciones
                      Presiones
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Ingrese observaciones de las presiones..."
                      name="observaciones_presion"
                      value={form.observaciones_presion || ''}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-journal-text"></i>Recomendaciones
                      Presiones
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Ingrese recomendaciones de las presiones..."
                      name="recomendaciones_presion"
                      value={form.recomendaciones_presion || ''}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="cal-section-card mb-4">
              <div className="cal-section-card-header">
                <i className="bi bi-list-ol cal-section-card-icon"></i>
                <h5 className="cal-section-card-title">
                  Secciones y Presiones
                </h5>
              </div>
              <SeccionesManager
                secciones={form.secciones || {}}
                onChange={(nuevasSecciones) =>
                  setForm((prev) => ({ ...prev, secciones: nuevasSecciones }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="cal-section-card">
              <div className="cal-section-card-header">
                <i className="bi bi-chat-left-text cal-section-card-icon"></i>
                <h5 className="cal-section-card-title">
                  Observaciones Adicionales
                </h5>
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-journal-text"></i>Observaciones
                      ACRONEX
                    </label>
                    <textarea
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
                    <label className="form-label">
                      <i className="bi bi-journal-text"></i>Observaciones
                      Generales
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Ingrese observaciones generales..."
                      name="observaciones_generales"
                      value={form.observaciones_generales || ''}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </div>
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
          className="modal-container cal-modal-calibraciones"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="d-flex align-items-center gap-3">
              <div className="modal-icon">
                <i className="bi bi-gear-wide-connected"></i>
              </div>
              <div>
                <h3 className="modal-title mb-1">
                  {form?.id ? 'Editar Calibración' : 'Nueva Calibración'}
                </h3>
                <p className="modal-subtitle mb-0">
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

          <div className="modal-body cal-modal-body">
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

          <div className="modal-footer px-4">
            <div className="d-flex gap-2">
              {currentPage > 1 && (
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-chevron-left me-2"></i>Anterior
                </button>
              )}
              {currentPage < 3 ? (
                <button
                  type="button"
                  className="btn-save"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={isSubmitting}
                >
                  Siguiente<i className="bi bi-chevron-right ms-2"></i>
                </button>
              ) : (
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
    </>
  );
};
