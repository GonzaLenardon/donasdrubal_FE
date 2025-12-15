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
    } finally {
      /* await new Promise((resolve) => setTimeout(resolve, 3000)); */
    }
  };

  const formateo = {
    estado_maquina: 'Estado General',
    estado_bomba: 'Bomba',
    estado_agitador: 'Agitador',
    estado_filtroPrimario: 'Filtro Primario',
    estado_filtroSecundario: 'Filtro Secundario',
    estado_FiltroLinea: 'Filtro de Línea',
    estado_manguerayconexiones: 'Mangueras y Conexiones',
    estado_antigoteo: 'Sistema Antigoteo',
    estado_limpiezaTanque: 'Limpieza de Tanque',
    estabilidadVerticalBotalon: 'Estabilidad Vertical Botalón',
    estado_pastillas: 'Pastillas',
  };

  const observacionesMap = {
    estado_maquina: 'observaciones_estado_maquina',
    estado_bomba: 'observaciones_estado_bomba',
    estado_agitador: 'observaciones_estado_agitador',
    estado_filtroPrimario: 'observarciones_estado_filtroPrimario',
    estado_filtroSecundario: 'observaciones_filtroSecundario',
    estado_FiltroLinea: 'observaciones_estado_FiltroLinea',
    estado_manguerayconexiones: 'observaciones_estado_manguerayconexiones',
    estado_antigoteo: 'observaciones_estado_antigoteo',
    estado_limpiezaTanque: 'observaciones_estado_limpiezaTanque',
    estabilidadVerticalBotalon: 'observaciones_estabilidadVerticalBotalon',
    estado_pastillas: 'observaciones_estado_pastillas',
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      Bueno: 'bg-green-500 text-green-800 border-secondary-200',
      Regular: 'bg-yellow-300 text-yellow-800 ',
      Malo: 'bg-red-500 text-black  ',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  const handleEditar = (cal) => {
    console.log('clclclclclla', cal);
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
            {/*      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"> */}
            <div className="card_Calibraciones">
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
                      <p className="text-base font-xl  font-bold">
                        {calibraciones?.cliente?.razon_social}
                      </p>
                    </div>
                    <div className="d-flex gap-5">
                      <p className="text-md w-25">Teléfono</p>
                      <p className="text-base font-lx  font-bold">
                        {calibraciones?.cliente?.telefono}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Máquina */}
            <div className="card_Calibraciones">
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
                        <p className="text-base font-xl font-bold ">
                          {calibraciones?.tipo?.marca}
                        </p>
                      </div>
                      <div>
                        <p className="text-md">Modelo</p>
                        <p className="text-base font-xl font-bold ">
                          {calibraciones?.tipo?.modelo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HEADER DE CALIBRACIONES Y BOTÓN */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Calibraciones
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {calibraciones?.calibraciones?.length || 0} registros
                encontrados
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleEditar({ maquina_id: maquina_id })}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nueva Calibración
            </button>
          </div>

          {/* LISTA DE CALIBRACIONES */}
          <div className="space-y-4">
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

              return (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* HEADER DEL ACORDEÓN */}
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggle(i)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`p-3 rounded-lg ${getEstadoBadge(
                            cal.estado_maquina
                          )}`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Calibración #{i + 1}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(
                                cal.estado_maquina
                              )}`}
                            >
                              {cal.estado_maquina}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{fechaFormateada}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{cal.responsable}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditar(cal);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CUERPO EXPANDIBLE */}
                  {isOpen && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6">
                        {/* Observación General */}
                        {cal.Observaciones && (
                          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              Observaciones Generales
                            </p>
                            <p className="text-sm text-blue-800">
                              {cal.Observaciones}
                            </p>
                          </div>
                        )}

                        {/* Grid de Estados */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {Object.keys(formateo).map((key) => {
                            const observacionKey = observacionesMap[key];
                            const observacion = cal[observacionKey];

                            return (
                              <div
                                key={key}
                                className="p-3 rounded-lg border border-gray-200"
                                style={{
                                  background: 'rgba(34, 87, 80, 0.85)',
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-bold text-white">
                                    {formateo[key]}
                                  </p>
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(
                                      cal[key]
                                    )}`}
                                  >
                                    {cal[key]}
                                  </span>
                                </div>

                                {observacion && (
                                  <p
                                    className="mt-2 pl-3 border border-l border-gray-300 "
                                    style={{
                                      borderRadius: '15px',
                                      minHeight: '60%',
                                      padding: '5px',
                                      color: 'white',
                                      opacity: '0.7 ',
                                    }}
                                  >
                                    {observacion}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
