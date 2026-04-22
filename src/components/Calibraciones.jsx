import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { calibracionesMaquina, openCalibraciones } from '../api/calibraciones';
import { ModalCalibraciones } from './ModalCalibraciones';
import { useCliente } from '../context/UserContext';
import {
  Building2,
  Wrench,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  MoreVertical,
  FileText,
  Lightbulb,
  Image as ImageIcon,
} from 'lucide-react';
import ModalImpresion from './ModalImpresion';
import { calibracionesPreview, calibracionInforme } from '../api/informes';
import ModalFinalizarServicios from './ModalFinalizarServicios';
import Spinner from './Spinner';

export const Calibraciones = () => {
  const { maquina_id, cliente_id } = useParams();
  const [calibraciones, setCalibraciones] = useState();
  const [calibracion, setCalibracion] = useState();
  const [openIndex, setOpenIndex] = useState(null);
  const [modalCalibraciones, setModalCalibraciones] = useState(false);
  const [isReabrir, setIsReabrir] = useState(false);
  const [calibracionReabrir, setCalibracionReabrir] = useState(null);
  const [msg, setMsg] = useState(false);
  const [loading, setLoading] = useState(false);

  const { selectedMaquina, setSelectedMaquina } = useCliente();
  const [ingenieros, setIngenieros] = useState('');

  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    allcalibraciones();
  }, []);

  const allcalibraciones = async () => {
    try {
      const resp = await calibracionesMaquina(maquina_id, cliente_id);
      setCalibraciones(resp.data);
      setIngenieros(resp.data.cliente.ingenieros);
      console.log('Ingenieros del Cliente => ', resp.data.cliente.ingenieros);
    } catch (error) {
      console.log(error.data.message);
    }
  };

  // ── Parsers ────────────────────────────────────────────────────────────────

  const parseEstado = (calibracion_id, estadoString) => {
    if (!estadoString)
      return {
        estado: '',
        observacion: '',
        nombreArchivo: '',
        path: '',
        recomendaciones: [],
        modelo: '',
        materiales: '',
        color: '',
        numero: '',
        presenciaORing: 'No',
      };
    let parsed = estadoString;
    let path = `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${calibracion_id}/`;
    try {
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return {
        estado: parsed.estado || '',
        observacion: parsed.observacion || '',
        materiales: parsed.materiales || '',
        modelo: parsed.modelo || '',
        color: parsed.color || '',
        numero: parsed.numero || '',
        presenciaORing: parsed.presenciaORing || 'No',
        nombreArchivo: parsed.nombreArchivo || parsed.nombre_archivo || '',
        path: path || '',
        recomendaciones: Array.isArray(parsed.recomendaciones)
          ? parsed.recomendaciones
          : [],
      };
    } catch (error) {
      console.error('Error parseando estado:', error, estadoString);
      return {
        estado: '',
        observacion: '',
        nombreArchivo: '',
        path: '',
        recomendaciones: [],
        modelo: '',
        materiales: '',
        color: '',
        numero: '',
        presenciaORing: 'No',
      };
    }
  };

  /**
   * Parsea la estructura de presión { valor, nombreArchivo }.
   * La DB devuelve doble-encoded: string que contiene otro string JSON.
   * Ej: "\"{\\\"valor\\\":\\\"15\\\",\\\"nombreArchivo\\\":\\\"...\\\"}\""
   * Cubre: doble-encoding, objeto directo, número plano (formato viejo).
   */
  const parsePresion = (presionData) => {
    if (presionData === null || presionData === undefined) {
      return { valor: '', nombreArchivo: '' };
    }

    // Número plano (retrocompatibilidad con campo FLOAT viejo)
    if (typeof presionData === 'number') {
      return { valor: presionData, nombreArchivo: '' };
    }

    // Objeto ya parseado correctamente
    if (typeof presionData === 'object') {
      return {
        valor: presionData.valor ?? '',
        nombreArchivo: presionData.nombreArchivo ?? '',
      };
    }

    if (typeof presionData === 'string') {
      if (presionData.trim() === '') return { valor: '', nombreArchivo: '' };

      try {
        // Primer parse
        let parsed = JSON.parse(presionData);

        // 👇 Doble-encoding: si sigue siendo string, parsear de nuevo
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }

        // Número plano serializado
        if (typeof parsed === 'number') {
          return { valor: parsed, nombreArchivo: '' };
        }

        // Objeto { valor, nombreArchivo }
        if (typeof parsed === 'object' && parsed !== null) {
          return {
            valor: parsed.valor ?? '',
            nombreArchivo: parsed.nombreArchivo ?? '',
          };
        }
      } catch {
        // Número como string puro sin JSON ("3.5")
        const numValor = parseFloat(presionData);
        return { valor: isNaN(numValor) ? '' : numValor, nombreArchivo: '' };
      }
    }

    return { valor: '', nombreArchivo: '' };
  };

  const parseSecciones = (seccionesString) => {
    if (!seccionesString) return {};
    try {
      let parsed = JSON.parse(seccionesString);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      return parsed || {};
    } catch (error) {
      console.error('Error parseando secciones:', error);
      return {};
    }
  };

  // ── Helpers de UI ──────────────────────────────────────────────────────────

  const formateo = {
    estado_maquina: 'Estado General',
    estado_bomba: 'Bomba',
    estado_agitador: 'Agitador',
    estado_filtroPrimario: 'Filtro Primario',
    estado_filtroSecundario: 'Filtro Secundario',
    estado_filtroLinea: 'Filtro de Línea',
    estado_manguerayconexiones: 'Mangueras y Conexiones',
    estado_antigoteo: 'Sistema Antigoteo',
    estado_limpiezaTanque: 'Limpieza de Tanque',
    estabilidadVerticalBotalon: 'Estabilidad Vertical Botalón',
    estado_pastillas: 'Pastillas',
    mixer: 'Mixer',
    secciones: 'Secciones',
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'Muy bueno': { bg: '#059669', border: '#10b981', color: '#ffffff' },
      Bueno: { bg: '#16a34a', border: '#22c55e', color: '#ffffff' },
      Regular: { bg: '#f59e0b', border: '#fbbf24', color: '#000000' },
      Malo: { bg: '#dc2626', border: '#ef4444', color: '#ffffff' },
      'No aplica': { bg: '#6b7280', border: '#9ca3af', color: '#ffffff' },
    };
    return (
      colores[estado] || { bg: '#6b7280', border: '#9ca3af', color: '#ffffff' }
    );
  };

  const getColorHex = (colorName) => {
    const colorMap = {
      Rojo: '#dc3545',
      Amarillo: '#ffc107',
      Azul: '#0dcaf0',
      Verde: '#198754',
      Gris: '#6c757d',
    };
    return colorMap[colorName] || '#6c757d';
  };

  const getComponentIcon = (componentName) => {
    const iconMap = {
      'Estado General': 'bi-gear-wide-connected',
      Bomba: 'bi-droplet-fill',
      Agitador: 'bi-arrow-repeat',
      'Filtro Primario': 'bi-funnel',
      'Filtro Secundario': 'bi-funnel-fill',
      'Filtro de Línea': 'bi-filter',
      'Mangueras y Conexiones': 'bi-diagram-3',
      'Sistema Antigoteo': 'bi-shield-check',
      'Limpieza de Tanque': 'bi-droplet-half',
      'Estabilidad Vertical Botalón': 'bi-arrow-bar-up',
      Pastillas: 'bi-circle-fill',
    };
    return iconMap[componentName] || 'bi-gear';
  };

  // 👇 NUEVO: helper para renderizar el botón de archivo adjunto
  /*   const BtnArchivo = ({ nombreArchivo }) => {
    if (!nombreArchivo)
      return <span className="text-white-50 fst-italic">—</span>;
    return (
      <a
        href={`${import.meta.env.VITE_API_URL}/uploads/calibraciones/${nombreArchivo}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-outline-info"
        style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
      >
        <i className="bi bi-image me-1"></i>Ver
      </a>
    );
  }; */

  const BtnArchivo = ({ archivo }) => {
    if (!archivo?.nombreArchivo)
      return <span className="text-white-50 fst-italic">—</span>;

    return (
      <button
        type="button"
        className="btn btn-sm btn-outline-info"
        onClick={() => {
          // setViewerUrl(`/uploads/calibraciones/${nombreArchivo}`);
          setViewerUrl(`${archivo.path}/${archivo.nombreArchivo}`);
          setShowViewer(true);
        }}
      >
        Ver
      </button>
    );
  };

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const handleEditar = (cal) => {
    setCalibracion(cal);
    setModalCalibraciones(true);
  };

  const handleReabrir = (cal) => {
    setCalibracionReabrir(cal);
  };

  const handleConfirmarReabrir = async () => {
    try {
      setLoading(true);
      setMsg('Reabriendo calibración...');
      await openCalibraciones(calibracionReabrir.id);
      setCalibracionReabrir(null);
      setMsg('Calibración reabierta exitosamente');
      await new Promise((r) => setTimeout(r, 1500));
      await allcalibraciones();
    } catch (error) {
      console.error('Error al reabrir:', error);
      setMsg('Error al reabrir calibración');
      await new Promise((r) => setTimeout(r, 2000));
    } finally {
      setLoading(false);
      setCalibracionReabrir(null);
    }
  };

  const generarInformeCalibracion = async (cal) => {
    const { id } = cal;
    try {
      const blob = await calibracionesPreview(id);

      // Verificamos que sea realmente un PDF
      if (blob.type !== 'application/pdf') {
        console.error('El servidor no devolvió un PDF válido');
        return;
      }

      // Creamos una URL temporal en memoria para el blob
      const url = URL.createObjectURL(blob);

      // Opción A: abrir en una nueva pestaña (previsualización)
      window.open(url, '_blank');

      // Opción B: forzar descarga (comentá la línea de arriba y usá esto)
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `calibracion-${id}.pdf`;
      // link.click();

      // Liberamos la memoria después de un tiempo prudencial
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (error) {
      console.error(
        'Error al previsualizar PDF:',
        error?.response?.data?.message ?? error.message,
      );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-0">
        <div className="mx-auto">
          <div className="calibraciones-wrapper">
            <div style={{ margin: '0 auto' }}>
              {/* HEADER Y BOTÓN NUEVA CALIBRACIÓN */}

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="fw-bold text-white mb-1">Calibraciones</h2>
                  <p
                    style={{
                      fontSize: '1.2em',
                      fontWeight: '600',
                      color: 'rgba(248, 243, 243, 0.5)',
                      margin: '0px',
                    }}
                  >
                    <strong>Maquina: </strong>
                    {selectedMaquina?.tipo.marca} {selectedMaquina?.tipo.modelo}
                  </p>
                  <p className="text-white-50 mb-0">
                    {calibraciones?.calibraciones?.length || 0} calibraciones
                    encontradas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEditar({ maquina_id: maquina_id })}
                  className="btn text-white d-flex align-items-center gap-2 shadow-lg calibracion-btn-nuevo"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Calibración
                </button>
              </div>

              {/* LISTA DE CALIBRACIONES */}
              <div className="calibracion-container">
                {calibraciones?.calibraciones?.map((cal, i) => {
                  const fechaFormateada = new Date(
                    cal.fecha,
                  ).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  });
                  const isOpen = openIndex === i;
                  const estadoMaquinaData = parseEstado(
                    cal.id,
                    cal.estado_maquina,
                  );
                  console.log(
                    'Estado Máquina => ',
                    cal.estado_maquina,
                    estadoMaquinaData,
                  );

                  const isCerrado = cal.estado === 'CERRADO';
                  const isAdmin = user.rol === 'Administrador';

                  const ingResponsable = ingenieros.find(
                    (i) => i.id === cal.responsable_id,
                  );

                  console.log('ddddddddddddddd,', ingResponsable);
                  console.log('queeuueeueu', cal.responsable_id);

                  // 👇 NUEVO: parsear presiones con nueva estructura
                  const presionUnimap = parsePresion(cal.presion_unimap);
                  const presionComputadora = parsePresion(
                    cal.presion_computadora,
                  );
                  const presionManometro = parsePresion(cal.presion_manometro);

                  // Hay datos de presión si al menos una tiene valor
                  // Usamos String() + trim() para cubrir: '', null, undefined, 0, '0', '3.5'
                  const tieneValor = (v) => String(v ?? '').trim() !== '';

                  const hayPresiones =
                    tieneValor(presionUnimap.valor) ||
                    tieneValor(presionComputadora.valor) ||
                    tieneValor(presionManometro.valor);

                  return (
                    <div
                      key={i}
                      className="card_calibracion_acordeon"
                      style={{ marginBottom: '1rem' }}
                    >
                      {/* HEADER DEL ACORDEÓN */}

                      <div className="d-flex card_calibracion align-items-strech p-3">
                        {/* ================= CONTENIDO PRINCIPAL ================= */}
                        <div className="flex-grow-1">
                          {/* HEADER */}
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <h5
                              className="fw-bold text-white mb-0"
                              style={{ fontSize: '1.1rem' }}
                            >
                              Calibración #{i + 1}
                            </h5>

                            {cal.estado === 'CERRADO' && (
                              <span className="badge bg-danger">CERRADO</span>
                            )}

                            <span
                              className="badge"
                              style={{
                                backgroundColor: getEstadoColor(
                                  estadoMaquinaData.estado,
                                ).bg,
                                border: `2px solid ${getEstadoColor(estadoMaquinaData.estado).border}`,
                                color: getEstadoColor(estadoMaquinaData.estado)
                                  .color,
                              }}
                            >
                              {estadoMaquinaData.estado}
                            </span>
                          </div>

                          {/* ================= FILA PRINCIPAL ================= */}
                          <div className="d-flex flex-wrap gap-4 align-items-start">
                            {/* Fecha */}
                            <div className="d-flex align-items-start gap-2">
                              <i className="bi bi-calendar-event calibracion-icon"></i>
                              <div>
                                <p className="mb-0 text-white-50 calibracion-label">
                                  Fecha
                                </p>
                                <p className="mb-0 text-white fw-semibold calibracion-value">
                                  {fechaFormateada}
                                </p>
                              </div>
                            </div>

                            {/* Responsable */}
                            <div className="d-flex align-items-start gap-2">
                              <i className="bi bi-person-fill calibracion-icon"></i>
                              <div>
                                <p className="mb-0 text-white-50 calibracion-label">
                                  Responsable
                                </p>
                                <p className="mb-0 text-white calibracion-responsable">
                                  {ingResponsable?.nombre}
                                </p>
                              </div>
                            </div>

                            {/* Observaciones (ahora al lado) */}
                            {cal.observaciones_generales && (
                              <div
                                className="p-3 flex-grow-1"
                                style={{
                                  minWidth: '250px',
                                  backgroundColor: 'rgba(226, 230, 237, 0.98)',
                                  border: '1px solid rgba(59, 130, 246, 0.3)',
                                  borderRadius: '8px',
                                }}
                              >
                                <p
                                  className="mb-1 fw-semibold"
                                  style={{
                                    color: '#386133',
                                    fontSize: '0.975rem',
                                  }}
                                >
                                  Observaciones
                                </p>
                                <p
                                  className="mb-0"
                                  style={{
                                    color: '#272e36',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {cal.observaciones_generales}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* ================= BOTÓN EXPANDIR ABAJO DERECHA ================= */}
                        </div>

                        {/* ================= BOTONES LATERALES ================= */}
                        <div className="container-botones-calibracion">
                          {!isCerrado && (
                            <button
                              className="btn btn-sm calibracion-botones text-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditar(cal);
                              }}
                              title="Editar calibración"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}

                          {isCerrado && isAdmin && (
                            <button
                              className="btn btn-sm calibracion-botones text-warning"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReabrir(cal);
                              }}
                              title="Reabrir calibración"
                            >
                              <i className="bi bi-arrow-repeat"></i>
                            </button>
                          )}

                          <button
                            className="btn btn-sm calibracion-botones text-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              generarInformeCalibracion(cal);
                            }}
                            title="Generar informe PDF"
                          >
                            <i className="bi bi-file-earmark-pdf-fill"></i>
                          </button>

                          {/* BOTÓN FIJO ABAJO */}
                          <button
                            className="btn btn-sm btn-link text-white p-0 mt-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggle(i);
                            }}
                            title={
                              isOpen
                                ? 'Ocultar detalles adicionales'
                                : 'Ver detalles adicionales'
                            }
                          >
                            <i
                              className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                              style={{ fontSize: '1.2rem' }}
                            ></i>
                          </button>
                        </div>
                      </div>

                      {/* ═══════════════════════════════════════════════════ */}
                      {/* CUERPO EXPANDIBLE                                  */}
                      {/* ═══════════════════════════════════════════════════ */}
                      {isOpen && (
                        <div
                          style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          {/* 👇 IMAGEN DEL INFORME — solo si existe */}
                          {cal.imagen && (
                            <div className="mb-4">
                              <p
                                className="mb-2 fw-semibold text-white-50"
                                style={{
                                  fontSize: '0.8rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                <i className="bi bi-image-fill me-2 text-info"></i>
                                Imagen del Informe
                              </p>
                              <img
                                src={`${import.meta.env.VITE_API_URL}/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/${cal.imagen}`}
                                alt="Imagen del informe"
                                className="rounded"
                                style={{
                                  maxHeight: '200px',
                                  maxWidth: '100%',
                                  objectFit: 'contain',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                }}
                              />
                            </div>
                          )}

                          {/* TABLA DE COMPONENTES */}
                          <div
                            className="table-responsive"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '10px',
                              overflow: 'hidden',
                            }}
                          >
                            <table
                              className="table table-dark table-hover mb-0"
                              style={{ fontSize: '0.85rem' }}
                            >
                              <thead
                                style={{
                                  background: 'rgba(255,255,255,0.1)',
                                  position: 'sticky',
                                  top: 0,
                                  zIndex: 10,
                                }}
                              >
                                <tr>
                                  <th
                                    style={{
                                      width: '20%',
                                      padding: '1rem',
                                      fontWeight: '700',
                                      fontSize: '0.8rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                    }}
                                  >
                                    <i className="bi bi-list-ul me-2"></i>
                                    Componente
                                  </th>
                                  <th
                                    style={{
                                      width: '12%',
                                      padding: '1rem',
                                      fontWeight: '700',
                                      fontSize: '0.8rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <i className="bi bi-clipboard-check me-2"></i>
                                    Estado
                                  </th>
                                  <th
                                    style={{
                                      width: '25%',
                                      padding: '1rem',
                                      fontWeight: '700',
                                      fontSize: '0.8rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                    }}
                                  >
                                    <i className="bi bi-chat-left-text me-2"></i>
                                    Observación
                                  </th>
                                  <th
                                    style={{
                                      width: '18%',
                                      padding: '1rem',
                                      fontWeight: '700',
                                      fontSize: '0.8rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                    }}
                                  >
                                    <i className="bi bi-info-circle me-2"></i>
                                    Detalles
                                  </th>
                                  <th
                                    style={{
                                      width: '15%',
                                      padding: '1rem',
                                      fontWeight: '700',
                                      fontSize: '0.8rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                    }}
                                  >
                                    <Lightbulb
                                      size={14}
                                      className="me-2"
                                      style={{ display: 'inline' }}
                                    />
                                    Recomendaciones
                                  </th>
                                  <th
                                    style={{
                                      width: '10%',
                                      padding: '1rem',
                                      fontWeight: '700',
                                      fontSize: '0.8rem',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px',
                                      textAlign: 'center',
                                    }}
                                  >
                                    <i className="bi bi-image me-2"></i>Archivo
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.keys(formateo).map((key) => {
                                  if (formateo[key] === 'Estado General')
                                    return null;

                                  const estadoData = parseEstado(
                                    cal.id,
                                    cal[key],
                                  );
                                  console.log(
                                    'estadoData => ',
                                    key,
                                    estadoData,
                                  );
                                  if (!estadoData.estado) return null;

                                  const isFiltro =
                                    formateo[key].includes('Filtro');
                                  const isBomba = formateo[key] === 'Bomba';

                                  return (
                                    <tr
                                      key={key}
                                      style={{
                                        borderBottom:
                                          '1px solid rgba(255,255,255,0.05)',
                                      }}
                                    >
                                      {/* COMPONENTE */}
                                      <td
                                        style={{
                                          padding: '1rem',
                                          verticalAlign: 'top',
                                        }}
                                      >
                                        <div className="d-flex align-items-center gap-2">
                                          <i
                                            className={`${getComponentIcon(formateo[key])} text-info`}
                                            style={{ fontSize: '1.2rem' }}
                                          ></i>
                                          <span className="fw-bold text-white">
                                            {formateo[key]}
                                          </span>
                                        </div>
                                      </td>

                                      {/* ESTADO */}
                                      <td
                                        style={{
                                          padding: '1rem',
                                          verticalAlign: 'top',
                                          textAlign: 'center',
                                        }}
                                      >
                                        <span
                                          className="badge"
                                          style={{
                                            backgroundColor: getEstadoColor(
                                              estadoData.estado,
                                            ).bg,
                                            border: `1px solid ${getEstadoColor(estadoData.estado).border}`,
                                            color: getEstadoColor(
                                              estadoData.estado,
                                            ).color,
                                            fontSize: '0.75rem',
                                            padding: '0.4rem 0.8rem',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          {estadoData.estado}
                                        </span>
                                      </td>

                                      {/* OBSERVACIÓN */}
                                      <td
                                        style={{
                                          padding: '1rem',
                                          verticalAlign: 'top',
                                        }}
                                      >
                                        {estadoData.observacion ? (
                                          <p
                                            className="mb-0 text-white-50"
                                            style={{
                                              fontSize: '0.8rem',
                                              lineHeight: '1.5',
                                            }}
                                          >
                                            {estadoData.observacion}
                                          </p>
                                        ) : (
                                          <span className="text-white-50 fst-italic">
                                            Sin observación
                                          </span>
                                        )}
                                      </td>

                                      {/* DETALLES */}
                                      <td
                                        style={{
                                          padding: '1rem',
                                          verticalAlign: 'top',
                                        }}
                                      >
                                        <div className="d-flex flex-column gap-2">
                                          {isBomba && (
                                            <>
                                              {estadoData.modelo && (
                                                <div className="d-flex align-items-center gap-2">
                                                  <i
                                                    className="bi bi-tag text-info"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  ></i>
                                                  <span
                                                    className="text-white-50"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  >
                                                    Modelo:
                                                  </span>
                                                  <span
                                                    className="text-white fw-semibold"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  >
                                                    {estadoData.modelo}
                                                  </span>
                                                </div>
                                              )}
                                              {estadoData.materiales && (
                                                <div className="d-flex align-items-center gap-2">
                                                  <i
                                                    className="bi bi-box-seam text-info"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  ></i>
                                                  <span
                                                    className="text-white-50"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  >
                                                    Material:
                                                  </span>
                                                  <span
                                                    className="text-white fw-semibold"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  >
                                                    {estadoData.materiales}
                                                  </span>
                                                </div>
                                              )}
                                            </>
                                          )}

                                          {isFiltro && (
                                            <>
                                              {estadoData.color && (
                                                <div className="d-flex align-items-center gap-2">
                                                  <span
                                                    style={{
                                                      display: 'inline-block',
                                                      width: '12px',
                                                      height: '12px',
                                                      borderRadius: '50%',
                                                      backgroundColor:
                                                        getColorHex(
                                                          estadoData.color,
                                                        ),
                                                      border:
                                                        '2px solid rgba(255,255,255,0.4)',
                                                    }}
                                                  ></span>
                                                  <span
                                                    className="text-white fw-semibold"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  >
                                                    {estadoData.color}
                                                  </span>
                                                </div>
                                              )}
                                              {estadoData.numero !== '' &&
                                                estadoData.numero !== null && (
                                                  <div className="d-flex align-items-center gap-2">
                                                    <i
                                                      className="bi bi-123 text-info"
                                                      style={{
                                                        fontSize: '0.75rem',
                                                      }}
                                                    ></i>
                                                    <span
                                                      className="text-white-50"
                                                      style={{
                                                        fontSize: '0.75rem',
                                                      }}
                                                    >
                                                      Nº:
                                                    </span>
                                                    <span
                                                      className="text-white fw-bold"
                                                      style={{
                                                        fontSize: '0.75rem',
                                                        fontFamily:
                                                          'Courier New, monospace',
                                                      }}
                                                    >
                                                      {estadoData.numero}
                                                    </span>
                                                  </div>
                                                )}
                                              {estadoData.presenciaORing && (
                                                <div>
                                                  <span
                                                    className={`badge ${estadoData.presenciaORing === 'Si' ? 'bg-success' : 'bg-secondary'}`}
                                                    style={{
                                                      fontSize: '0.65rem',
                                                      padding: '0.25rem 0.5rem',
                                                    }}
                                                  >
                                                    <i
                                                      className={`bi ${estadoData.presenciaORing === 'Si' ? 'bi-check-circle-fill' : 'bi-x-circle'} me-1`}
                                                    ></i>
                                                    {estadoData.presenciaORing ===
                                                    'Si'
                                                      ? 'Con O-Ring'
                                                      : 'Sin O-Ring'}
                                                  </span>
                                                </div>
                                              )}
                                              {estadoData.materiales && (
                                                <div className="d-flex align-items-center gap-2">
                                                  <i
                                                    className="bi bi-box-seam text-info"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  ></i>
                                                  <span
                                                    className="text-white-50"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  >
                                                    Material:
                                                  </span>
                                                  <span
                                                    className="text-white fw-semibold"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                    }}
                                                  >
                                                    {estadoData.materiales}
                                                  </span>
                                                </div>
                                              )}
                                            </>
                                          )}

                                          {!isBomba &&
                                            !isFiltro &&
                                            !estadoData.modelo &&
                                            !estadoData.materiales &&
                                            !estadoData.color &&
                                            !estadoData.numero &&
                                            !estadoData.presenciaORing && (
                                              <span className="text-white-50 fst-italic">
                                                —
                                              </span>
                                            )}
                                        </div>
                                      </td>

                                      {/* RECOMENDACIONES */}
                                      <td
                                        style={{
                                          padding: '1rem',
                                          verticalAlign: 'top',
                                        }}
                                      >
                                        {estadoData.recomendaciones &&
                                        estadoData.recomendaciones.length >
                                          0 ? (
                                          <div className="d-flex flex-column gap-1">
                                            {estadoData.recomendaciones.map(
                                              (rec, idx) => (
                                                <div
                                                  key={rec.id || idx}
                                                  className="d-flex align-items-start gap-2"
                                                  style={{
                                                    background:
                                                      'rgba(13,202,240,0.1)',
                                                    padding: '0.4rem 0.6rem',
                                                    borderRadius: '4px',
                                                    border:
                                                      '1px solid rgba(13,202,240,0.2)',
                                                  }}
                                                >
                                                  <i
                                                    className="bi bi-check-circle-fill"
                                                    style={{
                                                      color: '#0dcaf0',
                                                      fontSize: '0.7rem',
                                                      marginTop: '2px',
                                                      flexShrink: 0,
                                                    }}
                                                  ></i>
                                                  <span
                                                    className="text-white"
                                                    style={{
                                                      fontSize: '0.75rem',
                                                      lineHeight: '1.4',
                                                    }}
                                                  >
                                                    {rec.texto}
                                                  </span>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-white-50 fst-italic">
                                            Sin recomendaciones
                                          </span>
                                        )}
                                      </td>

                                      {/* ARCHIVO */}
                                      <td
                                        style={{
                                          padding: '1rem',
                                          verticalAlign: 'top',
                                          textAlign: 'center',
                                        }}
                                      >
                                        <BtnArchivo
                                          archivo={{
                                            path: estadoData.path,
                                            nombreArchivo:
                                              estadoData.nombreArchivo,
                                          }}
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* SECCIONES Y PRESIONES POR ZONA */}
                          {cal.secciones &&
                            Object.keys(parseSecciones(cal.secciones)).length >
                              0 && (
                              <div className="mt-4">
                                <div
                                  className="p-3"
                                  style={{
                                    background: 'rgba(139,92,246,0.1)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(139,92,246,0.3)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                  }}
                                >
                                  <h6 className="fw-bold text-white mb-3">
                                    <i className="bi bi-list-ol me-2"></i>
                                    Secciones y Presiones por Zona
                                  </h6>
                                  <div
                                    className="table-responsive"
                                    style={{
                                      background: 'rgba(255,255,255,0.05)',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <table className="table table-dark table-sm table-hover mb-0">
                                      <thead
                                        style={{
                                          background: 'rgba(139,92,246,0.2)',
                                        }}
                                      >
                                        <tr>
                                          <th
                                            style={{
                                              width: '40%',
                                              padding: '0.75rem 1rem',
                                              fontSize: '0.85rem',
                                              fontWeight: '700',
                                            }}
                                          >
                                            <i className="bi bi-hash me-2"></i>
                                            Sección
                                          </th>
                                          <th
                                            style={{
                                              width: '60%',
                                              padding: '0.75rem 1rem',
                                              fontSize: '0.85rem',
                                              fontWeight: '700',
                                            }}
                                          >
                                            <i className="bi bi-speedometer me-2"></i>
                                            Presión (bares)
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Object.entries(
                                          parseSecciones(cal.secciones),
                                        )
                                          .map(([seccion, presion]) => ({
                                            seccion: parseInt(seccion),
                                            presion,
                                          }))
                                          .sort((a, b) => a.seccion - b.seccion)
                                          .map(({ seccion, presion }) => (
                                            <tr
                                              key={seccion}
                                              style={{
                                                borderBottom:
                                                  '1px solid rgba(255,255,255,0.05)',
                                              }}
                                            >
                                              <td
                                                style={{
                                                  padding: '0.75rem 1rem',
                                                  verticalAlign: 'middle',
                                                }}
                                              >
                                                <span
                                                  className="badge bg-primary me-2"
                                                  style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.4rem 0.6rem',
                                                  }}
                                                >
                                                  {seccion}
                                                </span>
                                                <span
                                                  className="text-white fw-semibold"
                                                  style={{
                                                    fontSize: '0.85rem',
                                                  }}
                                                >
                                                  Sección {seccion}
                                                </span>
                                              </td>
                                              <td
                                                style={{
                                                  padding: '0.75rem 1rem',
                                                  verticalAlign: 'middle',
                                                }}
                                              >
                                                <span
                                                  className="badge"
                                                  style={{
                                                    backgroundColor:
                                                      'rgba(139,92,246,0.3)',
                                                    border:
                                                      '1px solid rgba(139,92,246,0.5)',
                                                    color: '#fff',
                                                    fontSize: '0.8rem',
                                                    padding: '0.4rem 0.8rem',
                                                    fontWeight: '600',
                                                  }}
                                                >
                                                  <i className="bi bi-speedometer2 me-1"></i>
                                                  {presion} bares
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                      </tbody>
                                      <tfoot
                                        style={{
                                          background: 'rgba(139,92,246,0.15)',
                                        }}
                                      >
                                        <tr>
                                          <td
                                            colSpan="2"
                                            className="text-end fw-bold"
                                            style={{
                                              padding: '0.75rem 1rem',
                                              fontSize: '0.8rem',
                                              color: '#c4b5fd',
                                            }}
                                          >
                                            <i className="bi bi-list-check me-2"></i>
                                            Total de secciones:{' '}
                                            {
                                              Object.keys(
                                                parseSecciones(cal.secciones),
                                              ).length
                                            }
                                            {' | '}
                                            Promedio:{' '}
                                            {(
                                              Object.values(
                                                parseSecciones(cal.secciones),
                                              ).reduce(
                                                (acc, val) =>
                                                  acc + parseFloat(val),
                                                0,
                                              ) /
                                              Object.keys(
                                                parseSecciones(cal.secciones),
                                              ).length
                                            ).toFixed(2)}{' '}
                                            bares
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* 👇 INFORMACIÓN DE PRESIONES — nueva estructura con adjuntos */}
                          {(hayPresiones || cal.observaciones_acronex) && (
                            <div className="mt-4">
                              <div
                                className="p-3"
                                style={{
                                  background: 'rgba(99,102,241,0.1)',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(99,102,241,0.3)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                              >
                                <h6 className="fw-bold text-white mb-3">
                                  <i className="bi bi-speedometer2 me-2"></i>
                                  Información de Presiones
                                </h6>

                                <div className="row g-3">
                                  {/* Presión Unimap */}
                                  {tieneValor(presionUnimap.valor) && (
                                    <div className="col-md-4">
                                      <div
                                        className="p-3 rounded-3"
                                        style={{
                                          background: 'rgba(255,255,255,0.05)',
                                          border:
                                            '1px solid rgba(255,255,255,0.1)',
                                        }}
                                      >
                                        <p
                                          className="mb-1 text-white-50 d-flex align-items-center gap-2"
                                          style={{ fontSize: '0.8rem' }}
                                        >
                                          <i className="bi bi-speedometer text-indigo-400"></i>
                                          Presión Unimap
                                        </p>
                                        <p className="mb-2 text-white fw-bold fs-5">
                                          {presionUnimap.valor}{' '}
                                          <small
                                            className="text-white-50 fw-normal"
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            bar
                                          </small>
                                        </p>
                                        <BtnArchivo
                                          archivo={{
                                            path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,
                                            nombreArchivo:
                                              presionUnimap.nombreArchivo,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Presión Computadora */}
                                  {tieneValor(presionComputadora.valor) && (
                                    <div className="col-md-4">
                                      <div
                                        className="p-3 rounded-3"
                                        style={{
                                          background: 'rgba(255,255,255,0.05)',
                                          border:
                                            '1px solid rgba(255,255,255,0.1)',
                                        }}
                                      >
                                        <p
                                          className="mb-1 text-white-50 d-flex align-items-center gap-2"
                                          style={{ fontSize: '0.8rem' }}
                                        >
                                          <i className="bi bi-speedometer text-indigo-400"></i>
                                          Presión Computadora
                                        </p>
                                        <p className="mb-2 text-white fw-bold fs-5">
                                          {presionComputadora.valor}{' '}
                                          <small
                                            className="text-white-50 fw-normal"
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            bar
                                          </small>
                                        </p>
                                        <BtnArchivo
                                          archivo={{
                                            path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,
                                            nombreArchivo:
                                              presionComputadora.nombreArchivo,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Presión Manómetro */}
                                  {tieneValor(presionManometro.valor) && (
                                    <div className="col-md-4">
                                      <div
                                        className="p-3 rounded-3"
                                        style={{
                                          background: 'rgba(255,255,255,0.05)',
                                          border:
                                            '1px solid rgba(255,255,255,0.1)',
                                        }}
                                      >
                                        <p
                                          className="mb-1 text-white-50 d-flex align-items-center gap-2"
                                          style={{ fontSize: '0.8rem' }}
                                        >
                                          <i className="bi bi-speedometer text-indigo-400"></i>
                                          Presión Manómetro
                                        </p>
                                        <p className="mb-2 text-white fw-bold fs-5">
                                          {presionManometro.valor}{' '}
                                          <small
                                            className="text-white-50 fw-normal"
                                            style={{ fontSize: '0.75rem' }}
                                          >
                                            bar
                                          </small>
                                        </p>
                                        <BtnArchivo
                                          archivo={{
                                            path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,
                                            nombreArchivo:
                                              presionManometro.nombreArchivo,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {cal.observaciones_presion && (
                                  <div
                                    className="mt-3 pt-3"
                                    style={{
                                      borderTop:
                                        '1px solid rgba(255,255,255,0.08)',
                                    }}
                                  >
                                    <p
                                      className="mb-1 text-white-50"
                                      style={{ fontSize: '0.875rem' }}
                                    >
                                      <i className="bi bi-journal-text me-2"></i>
                                      Observaciones Presion
                                    </p>
                                    <p
                                      className="mb-0 text-white"
                                      style={{ fontSize: '0.875rem' }}
                                    >
                                      {cal.observaciones_presion}
                                    </p>
                                  </div>
                                )}

                                {cal.recomendaciones_presion && (
                                  <div
                                    className="mt-3 pt-3"
                                    style={{
                                      borderTop:
                                        '1px solid rgba(255,255,255,0.08)',
                                    }}
                                  >
                                    <p
                                      className="mb-1 text-white-50"
                                      style={{ fontSize: '0.875rem' }}
                                    >
                                      <i className="bi bi-journal-text me-2"></i>
                                      Recomendaciones Presion
                                    </p>
                                    <p
                                      className="mb-0 text-white"
                                      style={{ fontSize: '0.875rem' }}
                                    >
                                      {cal.recomendaciones_presion}
                                    </p>
                                  </div>
                                )}

                                {/* Observaciones ACRONEX */}
                                {cal.observaciones_acronex && (
                                  <div
                                    className="mt-3 pt-3"
                                    style={{
                                      borderTop:
                                        '1px solid rgba(255,255,255,0.08)',
                                    }}
                                  >
                                    <p
                                      className="mb-1 text-white-50"
                                      style={{ fontSize: '0.875rem' }}
                                    >
                                      <i className="bi bi-journal-text me-2"></i>
                                      Observaciones ACRONEX
                                    </p>
                                    <p
                                      className="mb-0 text-white"
                                      style={{ fontSize: '0.875rem' }}
                                    >
                                      {cal.observaciones_acronex}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalCalibraciones && (
        <ModalCalibraciones
          onClose={() => setModalCalibraciones(false)}
          calibracion={calibracion}
          ingenieros={ingenieros}
          onSaved={() => allcalibraciones()}
        />
      )}
      {calibracionReabrir && (
        <ModalFinalizarServicios
          handleFinalizar={handleConfirmarReabrir}
          servicio="calibración"
          setShowFinalizar={() => setCalibracionReabrir(null)}
          isReabrir={true}
        />
      )}

      <Spinner loading={loading} msg={msg} />

      {showViewer && (
        <ModalImpresion setShowViewer={setShowViewer} viewerUrl={viewerUrl} />
      )}
    </>
  );
};
