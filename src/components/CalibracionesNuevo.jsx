import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { calibracionesMaquina, openCalibraciones } from '../api/calibraciones';
import { ModalCalibraciones } from './ModalCalibraciones';
import { useCliente } from '../context/UserContext';
import { Plus, Lightbulb } from 'lucide-react';
import ModalImpresion from './ModalImpresion';
import { calibracionesPreview } from '../api/informes';
import ModalFinalizarServicios from './ModalFinalizarServicios';
import ModalDetalleCalibracion from './ModalDetalleCalibracion';
import Spinner from './Spinner';

export const Calibraciones = () => {
  const { maquina_id, cliente_id } = useParams();
  const [calibraciones, setCalibraciones] = useState();
  const [calibracion, setCalibracion] = useState();
  const [modalCalibraciones, setModalCalibraciones] = useState(false);
  const [calibracionAReabrir, setCalibracionAReabrir] = useState(null);
  const [calibracionDetalle, setCalibracionDetalle] = useState(null);
  const [calibracionDetalleIndex, setCalibracionDetalleIndex] = useState(null);
  const [msg, setMsg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ingenieros, setIngenieros] = useState([]);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  const { selectedMaquina } = useCliente();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    allcalibraciones();
  }, []);

  const allcalibraciones = async () => {
    try {
      const resp = await calibracionesMaquina(maquina_id, cliente_id);
      setCalibraciones(resp.data);
      setIngenieros(resp.data.cliente.ingenieros);
    } catch (error) {
      console.error('Error cargando calibraciones:', error);
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
    const path = `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${calibracion_id}/`;
    try {
      let parsed = estadoString;
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
        path,
        recomendaciones: Array.isArray(parsed.recomendaciones)
          ? parsed.recomendaciones
          : [],
      };
    } catch (error) {
      console.error('Error parseando estado:', error);
      return {
        estado: '',
        observacion: '',
        nombreArchivo: '',
        path,
        recomendaciones: [],
        modelo: '',
        materiales: '',
        color: '',
        numero: '',
        presenciaORing: 'No',
      };
    }
  };

  const parsePresion = (presionData) => {
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

  const BtnArchivo = ({ archivo }) => {
    if (!archivo?.nombreArchivo)
      return <span className="text-white-50 fst-italic">—</span>;
    return (
      <button
        type="button"
        className="btn btn-sm btn-outline-info"
        onClick={() => {
          setViewerUrl(`${archivo.path}/${archivo.nombreArchivo}`);
          setShowViewer(true);
        }}
      >
        Ver
      </button>
    );
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleEditar = (cal) => {
    setCalibracion(cal);
    setModalCalibraciones(true);
  };

  const handleReabrir = (cal) => {
    setCalibracionAReabrir(cal);
  };

  const handleConfirmarReabrir = async () => {
    try {
      setLoading(true);
      setMsg('Reabriendo calibración...');
      await openCalibraciones(calibracionAReabrir.id);
      setCalibracionAReabrir(null);
      setMsg('Calibración reabierta exitosamente');
      await new Promise((r) => setTimeout(r, 1500));
      await allcalibraciones();
    } catch (error) {
      console.error('Error al reabrir:', error);
      setMsg('Error al reabrir calibración');
      await new Promise((r) => setTimeout(r, 2000));
    } finally {
      setLoading(false);
      setCalibracionAReabrir(null);
    }
  };

  const generarInformeCalibracion = async (cal) => {
    try {
      const blob = await calibracionesPreview(cal.id);
      if (blob.type !== 'application/pdf') {
        console.error('El servidor no devolvió un PDF válido');
        return;
      }
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
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
              {/* HEADER */}
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
                    <strong>Máquina: </strong>
                    {selectedMaquina?.tipo.marca} {selectedMaquina?.tipo.modelo}
                  </p>
                  <p className="text-white-50 mb-0">
                    {calibraciones?.calibraciones?.length || 0} calibraciones
                    encontradas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEditar({ maquina_id })}
                  className="btn text-white d-flex align-items-center gap-2 shadow-lg calibracion-btn-nuevo"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Calibración
                </button>
              </div>

              {/* TABLA DE CALIBRACIONES */}
              <div
                className="table-responsive"
                style={{ borderRadius: '10px', overflow: 'hidden' }}
              >
                <table
                  className="table table-dark table-hover mb-0"
                  style={{ fontSize: '0.85rem' }}
                >
                  <thead
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                    }}
                  >
                    <tr>
                      {[
                        '#',
                        'Fecha',
                        'Responsable',
                        'Estado máquina',
                        'Observaciones',
                        'Estado',
                        'Acciones',
                      ].map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: '0.85rem 1rem',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calibraciones?.calibraciones?.map((cal, i) => {
                      const fechaFormateada = new Date(
                        cal.fecha,
                      ).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                      const estadoMaquinaData = parseEstado(
                        cal.id,
                        cal.estado_maquina,
                      );
                      const ingResponsable = ingenieros.find(
                        (ing) => ing.id === cal.responsable_id,
                      );
                      const isCerrado = cal.estado === 'CERRADO';
                      const isAdmin = user?.rol === 'Administrador';

                      return (
                        <tr
                          key={cal.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            verticalAlign: 'middle',
                          }}
                        >
                          {/* # */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className="fw-bold text-white">#{i + 1}</span>
                          </td>

                          {/* FECHA */}
                          <td
                            style={{
                              padding: '0.85rem 1rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-calendar-event calibracion-icon"></i>
                              <span className="text-white">
                                {fechaFormateada}
                              </span>
                            </div>
                          </td>

                          {/* RESPONSABLE */}
                          <td
                            style={{
                              padding: '0.85rem 1rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-person-fill calibracion-icon"></i>
                              <span className="text-white">
                                {ingResponsable?.nombre ?? '—'}
                              </span>
                            </div>
                          </td>

                          {/* ESTADO MÁQUINA */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: getEstadoColor(
                                  estadoMaquinaData.estado,
                                ).bg,
                                border: `2px solid ${getEstadoColor(estadoMaquinaData.estado).border}`,
                                color: getEstadoColor(estadoMaquinaData.estado)
                                  .color,
                                fontSize: '0.72rem',
                                padding: '0.35rem 0.7rem',
                                fontWeight: '600',
                              }}
                            >
                              {estadoMaquinaData.estado || '—'}
                            </span>
                          </td>

                          {/* OBSERVACIONES */}
                          <td
                            style={{
                              padding: '0.85rem 1rem',
                              maxWidth: '220px',
                            }}
                          >
                            {cal.observaciones_generales ? (
                              <span
                                className="text-white-50"
                                style={{
                                  fontSize: '0.8rem',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {cal.observaciones_generales}
                              </span>
                            ) : (
                              <span className="text-white-50 fst-italic">
                                —
                              </span>
                            )}
                          </td>

                          {/* ESTADO ABIERTO/CERRADO */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {isCerrado ? (
                              <span
                                className="badge bg-danger"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.35rem 0.7rem',
                                }}
                              >
                                CERRADO
                              </span>
                            ) : (
                              <span
                                className="badge bg-success"
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.35rem 0.7rem',
                                }}
                              >
                                ABIERTO
                              </span>
                            )}
                          </td>

                          {/* ACCIONES */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="d-flex align-items-center gap-1">
                              {/* Ver detalle */}
                              <button
                                className="btn btn-sm calibracion-botones text-info"
                                onClick={() => {
                                  setCalibracionDetalle(cal);
                                  setCalibracionDetalleIndex(i);
                                }}
                                title="Ver detalle completo"
                              >
                                <i className="bi bi-eye"></i>
                              </button>

                              {/* Editar — solo si no está cerrado */}
                              {!isCerrado && (
                                <button
                                  className="btn btn-sm calibracion-botones text-success"
                                  onClick={() => handleEditar(cal)}
                                  title="Editar calibración"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                              )}

                              {/* Reabrir — solo si cerrado y admin */}
                              {isCerrado && isAdmin && (
                                <button
                                  className="btn btn-sm calibracion-botones text-warning"
                                  onClick={() => handleReabrir(cal)}
                                  title="Reabrir calibración"
                                >
                                  <i className="bi bi-arrow-repeat"></i>
                                </button>
                              )}

                              {/* Generar PDF */}
                              <button
                                className="btn btn-sm calibracion-botones text-danger"
                                onClick={() => generarInformeCalibracion(cal)}
                                title="Generar informe PDF"
                              >
                                <i className="bi bi-file-earmark-pdf-fill"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal editar/crear */}
      {modalCalibraciones && (
        <ModalCalibraciones
          onClose={() => setModalCalibraciones(false)}
          calibracion={calibracion}
          ingenieros={ingenieros}
          onSaved={() => allcalibraciones()}
        />
      )}

      {/* Modal detalle completo */}
      {calibracionDetalle && (
        <ModalDetalleCalibracion
          cal={calibracionDetalle}
          index={calibracionDetalleIndex}
          onClose={() => {
            setCalibracionDetalle(null);
            setCalibracionDetalleIndex(null);
          }}
          parseEstado={parseEstado}
          parsePresion={parsePresion}
          parseSecciones={parseSecciones}
          getEstadoColor={getEstadoColor}
          getColorHex={getColorHex}
          getComponentIcon={getComponentIcon}
          formateo={formateo}
          ingenieros={ingenieros}
          cliente_id={cliente_id}
          maquina_id={maquina_id}
          setViewerUrl={setViewerUrl}
          setShowViewer={setShowViewer}
        />
      )}

      {/* Modal reabrir */}
      {calibracionAReabrir && (
        <ModalFinalizarServicios
          handleFinalizar={handleConfirmarReabrir}
          servicio="calibración"
          setShowFinalizar={() => setCalibracionAReabrir(null)}
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
