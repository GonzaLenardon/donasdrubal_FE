import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { calibracionesMaquina } from '../api/calibraciones';
import { ModalCalibraciones } from './ModalCalibraciones';
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
} from 'lucide-react';

export const Calibraciones = () => {
  const { maquina_id, cliente_id } = useParams();
  const [calibraciones, setCalibraciones] = useState();
  const [calibracion, setCalibracion] = useState();
  const [openIndex, setOpenIndex] = useState(null);
  const [modalCalibraciones, setModalCalibraciones] = useState(false);

  console.log('id_maquina', maquina_id, cliente_id);

  useEffect(() => {
    allcalibraciones();
  }, []);

  const allcalibraciones = async () => {
    try {
      const resp = await calibracionesMaquina(maquina_id, cliente_id);
      console.log('calibraciones', resp);
      setCalibraciones(resp.data);
    } catch (error) {
      console.log(error.data.message);
    }
  };

  // Función para parsear los campos JSON stringificados
  const parseEstado = (estadoString) => {
    if (!estadoString)
      return { estado: '', observacion: '', nombreArchivo: '', path: '' };
    let parsed = estadoString;
    try {
      // Algunos campos tienen doble escape, intentar parsear dos veces
      // let parsed = JSON.parse(estadoString);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      // if (typeof parsed === 'object') {
      //     return {
      //       estado: parsed.estado || '',
      //       observacion: parsed.observacion || '',
      //       nombreArchivo: parsed.nombreArchivo || parsed.nombre_archivo || '',
      //       path: parsed.path || '',
      //     };
      // }      
      return {
        estado: parsed.estado || '',
        observacion: parsed.observacion || '',
        nombreArchivo: parsed.nombreArchivo || parsed.nombre_archivo || '',
        path: parsed.path || '',
      };
    } catch (error) {
      console.error('Error parseando estado:', error, estadoString);
      return { estado: '', observacion: '', nombreArchivo: '', path: '' };
    }
  };

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
  };

  const getEstadoColor = (estado) => {
    const colores = {
      'Muy bueno': {
        bg: '#059669',
        border: '#10b981',
        color: '#ffffff',
      },
      Bueno: {
        bg: '#16a34a',
        border: '#22c55e',
        color: '#ffffff',
      },
      Regular: {
        bg: '#f59e0b',
        border: '#fbbf24',
        color: '#000000',
      },
      Malo: {
        bg: '#dc2626',
        border: '#ef4444',
        color: '#ffffff',
      },
      'No aplica': {
        bg: '#6b7280',
        border: '#9ca3af',
        color: '#ffffff',
      },
    };

    return (
      colores[estado] || { bg: '#6b7280', border: '#9ca3af', color: '#ffffff' }
    );
  };

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  const handleEditar = (cal) => {
    setCalibracion(cal);
    setModalCalibraciones(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* HEADER REDISEÑADO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Card Cliente */}
            <div className="card_calibracion">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white mb-3">
                    Información del Cliente
                  </h2>
                  <div className="space-y-1">
                    <div className="d-flex gap-5">
                      <p className="text-md w-25">Razón Social</p>
                      <p className="text-base font-xl font-bold">
                        {calibraciones?.cliente?.razon_social}
                      </p>
                    </div>
                    <div className="d-flex gap-5">
                      <p className="text-md w-25">Teléfono</p>
                      <p className="text-base font-lx font-bold">
                        {calibraciones?.cliente?.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Máquina */}
            <div className="card_calibracion">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Wrench className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-3">
                    Información de la Máquina
                  </h2>
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-md">Marca</p>
                        <p className="text-base font-xl font-bold">
                          {calibraciones?.tipo?.marca}
                        </p>
                      </div>
                      <div>
                        <p className="text-md">Modelo</p>
                        <p className="text-base font-xl font-bold">
                          {calibraciones?.tipo?.modelo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CALIBRACIONES */}
          <div className="calibracion-wrapper">
            {/* HEADER Y BOTÓN NUEVA CALIBRACION */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Calibraciones
                </h1>
                <p className="text-sm text-gray-700 mt-1">
                  {calibraciones?.calibraciones?.length || 0} registros
                  encontrados
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
                const fechaFormateada = new Date(cal.fecha).toLocaleDateString(
                  'es-AR',
                  {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  }
                );
                const isOpen = openIndex === i;

                // Parsear el estado general de la máquina
                const estadoMaquinaData = parseEstado(cal.estado_maquina);

                return (
                  <div
                    key={i}
                    className="card_calibracion_acordeon"
                    style={{ marginBottom: '1rem' }}
                  >
                    {/* HEADER DEL ACORDEÓN */}
                    <div className="card_calibracion_header">
                      <div className="row mb-3">
                        {/* Columna Izquierda - Calibración */}
                        <div className="col-12 col-md-3">
                          <h5 className="fw-bold text-white mb-1 calibracion-nombre">
                            Calibración #{i + 1}
                          </h5>
                          <span
                            className="badge calibracion-estado-badge"
                            style={{
                              backgroundColor: getEstadoColor(
                                estadoMaquinaData.estado
                              ).bg,
                              border: `2px solid ${
                                getEstadoColor(estadoMaquinaData.estado).border
                              }`,
                              color: getEstadoColor(estadoMaquinaData.estado)
                                .color,
                            }}
                          >
                            {estadoMaquinaData.estado}
                          </span>
                        </div>

                        {/* Columna Centro - Fecha y Responsable */}
                        <div className="col-12 col-md-3 d-flex flex-column gap-2">
                          {/* Fecha */}
                          <div className="d-flex align-items-start gap-2">
                            <i className="bi bi-calendar-event calibracion-icon"></i>
                            <div style={{ flex: 1 }}>
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
                            <div style={{ flex: 1 }}>
                              <p className="mb-0 text-white-50 calibracion-label">
                                Responsable
                              </p>
                              <p className="mb-0 text-white calibracion-responsable">
                                {cal.responsable}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Columna Derecha - Observaciones Generales */}
                        {cal.Observaciones && (
                          <div className="col-12 col-md-6">
                            <div
                              className="p-3 h-100"
                              style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '8px',
                              }}
                            >
                              <p
                                className="mb-1 fw-semibold"
                                style={{
                                  color: '#93c5fd',
                                  fontSize: '0.875rem',
                                }}
                              >
                                Observaciones Generales
                              </p>
                              <p
                                className="mb-0"
                                style={{
                                  color: '#bfdbfe',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {cal.Observaciones}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Divider */}
                      <hr className="calibracion-divider" />

                      {/* Footer con Acciones */}
                      <div className="d-flex gap-2 mt-3 pt-3 calibracion-actions">
                        <button
                          className="btn btn-sm flex-fill calibracion-btn-ver"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggle(i);
                          }}
                        >
                          <i
                            className={`bi ${
                              isOpen ? 'bi-eye-slash' : 'bi-eye'
                            } me-1`}
                          ></i>
                          {isOpen ? 'Ocultar' : 'Ver Detalles'}
                        </button>
                        <button
                          className="btn btn-sm flex-fill calibracion-btn-editar"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditar(cal);
                          }}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </button>
                      </div>
                    </div>

                    {/* CUERPO EXPANDIBLE */}
                    {isOpen && (
                      <div
                        style={{
                          marginTop: '1rem',
                          paddingTop: '1rem',
                          borderTop: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {/* Grid de Estados */}
                        <div className="row g-3">
                          {Object.keys(formateo).map((key) => {
                            if (formateo[key] === 'Estado General') return null;

                            const estadoData = parseEstado(cal[key]);

                            // No mostrar si no hay estado o es vacío
                            if (!estadoData.estado) return null;

                            return (
                              <div
                                key={key}
                                className="col-12 col-md-6 col-lg-3"
                              >
                                <div
                                  className="p-3 d-flex flex-column"
                                  style={{
                                    background: 'rgba(34, 87, 80, 0.85)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    height: '100%',
                                    minHeight: '60px',
                                  }}
                                >
                                  {/* ESTADO PARAMETRO RELEVADO */}
                                  <div className="d-flex flex-column align-items-start mb-3">
                                    <p
                                      className="mb-2 fw-bold text-white"
                                      style={{ fontSize: '0.875rem' }}
                                    >
                                      {formateo[key]}
                                    </p>
                                    <span
                                      className="badge"
                                      style={{
                                        backgroundColor: getEstadoColor(
                                          estadoData.estado
                                        ).bg,
                                        border: `1px solid ${
                                          getEstadoColor(estadoData.estado)
                                            .border
                                        }`,
                                        color: getEstadoColor(estadoData.estado)
                                          .color,
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.5rem',
                                        minWidth: '80px',
                                        textAlign: 'center',
                                        display: 'inline-block',
                                        fontWeight: '600',
                                      }}
                                    >
                                      {estadoData.estado}
                                    </span>
                                  </div>

                                  {/* OBSERVACION PARAMETRO RELEVADO */}
                                  {estadoData.observacion && (
                                    <p
                                      className="mt-2 mb-0 ps-2 flex-grow-1"
                                      style={{
                                        borderLeft:
                                          '2px solid rgba(255,255,255,0.3)',
                                        borderRadius: '4px',
                                        padding: '0.5rem',
                                        color: 'white',
                                        opacity: '0.7',
                                        fontSize: '0.813rem',
                                        overflow: 'auto',
                                      }}
                                    >
                                      {estadoData.observacion}
                                    </p>
                                  )}

                                  {/* IMAGEN SI EXISTE */}
                                  {estadoData.nombreArchivo && (
                                    <div className="mt-2">
                                      <a
                                        href={`${import.meta.env.VITE_API_URL}/uploads/calibraciones/${estadoData.nombreArchivo}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-outline-light w-100"
                                        style={{ fontSize: '0.75rem' }}
                                      >
                                        <i className="bi bi-image me-1"></i>
                                        Ver Imagen
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Información adicional (presiones y observaciones ACRONEX) */}
                        {(cal.presion_unimap ||
                          cal.presion_computadora ||
                          cal.presion_manometro ||
                          cal.observaciones_acronex) && (
                          <div className="row g-3 mt-3">
                            <div className="col-12">
                              <div
                                className="p-3"
                                style={{
                                  background: 'rgba(99, 102, 241, 0.1)',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(99, 102, 241, 0.3)',
                                }}
                              >
                                <h6 className="fw-bold text-white mb-3">
                                  <i className="bi bi-speedometer2 me-2"></i>
                                  Información de Presiones
                                </h6>
                                <div className="row g-3">
                                  {cal.presion_unimap && (
                                    <div className="col-md-4">
                                      <p
                                        className="mb-1 text-white-50"
                                        style={{ fontSize: '0.875rem' }}
                                      >
                                        Presión Unimap
                                      </p>
                                      <p className="mb-0 text-white fw-bold">
                                        {cal.presion_unimap} bar
                                      </p>
                                    </div>
                                  )}
                                  {cal.presion_computadora && (
                                    <div className="col-md-4">
                                      <p
                                        className="mb-1 text-white-50"
                                        style={{ fontSize: '0.875rem' }}
                                      >
                                        Presión Computadora
                                      </p>
                                      <p className="mb-0 text-white fw-bold">
                                        {cal.presion_computadora} bar
                                      </p>
                                    </div>
                                  )}
                                  {cal.presion_manometro && (
                                    <div className="col-md-4">
                                      <p
                                        className="mb-1 text-white-50"
                                        style={{ fontSize: '0.875rem' }}
                                      >
                                        Presión Manómetro
                                      </p>
                                      <p className="mb-0 text-white fw-bold">
                                        {cal.presion_manometro} bar
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {cal.observaciones_acronex && (
                                  <div className="mt-3">
                                    <p
                                      className="mb-1 text-white-50"
                                      style={{ fontSize: '0.875rem' }}
                                    >
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

      {modalCalibraciones && (
        <ModalCalibraciones
          onClose={() => setModalCalibraciones(false)}
          calibracion={calibracion}
          onSaved={() => allcalibraciones()}
        />
      )}
    </>
  );
};
