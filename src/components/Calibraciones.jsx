import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { calibracionesMaquina } from '../api/calibraciones';

export const Calibraciones = () => {
  const { id_maquina, id_user } = useParams();
  const [calibracion, setCalibracion] = useState();
  const [openIndex, setOpenIndex] = useState(null);

  console.log('id_maquina', id_maquina, id_user);

  useEffect(() => {
    calibraciones();
  }, []);

  const calibraciones = async () => {
    try {
      const resp = await calibracionesMaquina(id_maquina);
      console.log('calibraciones', resp);
      setCalibracion(resp);
    } catch (error) {
      console.log(error.message);
    } finally {
      /* await new Promise((resolve) => setTimeout(resolve, 3000)); */
    }
  };

  const formateo = {
    Observaciones: 'Observaciones',
    estabilidadVerticalBotalon: 'Estabilidad Vertical Botalon',
    estado_FiltroLinea: 'Estado Filtro Linea',
    estado_agitador: 'Estado Agitador',
    estado_antigoteo: 'Estado Antigoteo',
    estado_bomba: 'Estado Bomba',
    estado_filtroPrimario: 'Estado Filtro Primario',
    estado_filtroSecundario: 'Estado Filtro Secundario',
    estado_limpiezaTanque: 'Estado Limpieza Tanque',
    estado_manguerayconexiones: 'Estado Manguera y Conexiones',
    estado_maquina: 'Estado Maquina',
    estado_pastillas: 'Estado Pastillas',
    fecha: 'Fecha',
    id: 'Id',
    maquina_id: 'Maquina id',
    responsable: 'Responsable',
  };

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="container-view">
      <div className="container-datos">
        <div className="datos-user">
          <div className="user-name">{calibracion?.cliente.nombre}</div>
          <span>{calibracion?.cliente.datosImpositivos}</span>
          <span>{calibracion?.cliente.telefono}</span>
        </div>

        <div className="datos-user">
          <div className="user-name">Calibraciones</div>
          <span>
            <strong>Marca</strong> {calibracion?.marca}
          </span>
          <span>
            <strong>Modelo</strong> {calibracion?.modelo}
          </span>
        </div>
      </div>

      <div className="calibracion-container">
        {calibracion?.calibraciones.map((cal, i) => {
          const fechaFormateada = new Date(cal.fecha).toLocaleDateString(
            'es-AR',
            {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }
          );

          return (
            <div className={`acordeon-item ${openIndex === i ? 'active' : ''}`}>
              {/* --- HEADER SIEMPRE VISIBLE --- */}
              <div className="acordeon-header" onClick={() => toggle(i)}>
                <h5>Registro #{i + 1}</h5>

                <div className="acordeon-info">
                  <span>
                    <strong>Fecha:</strong> {fechaFormateada}
                  </span>
                  <span>
                    <strong>Responsable:</strong> {cal.responsable}
                  </span>
                  <span>
                    <strong>Estado:</strong> {cal.estado_maquina}
                  </span>
                </div>

                <span className={`arrow ${openIndex === i ? 'open' : ''}`}>
                  ▼
                </span>
              </div>

              {/* --- CUERPO QUE SE ABRE --- */}
              {openIndex === i && (
                <div className="acordeon-body">
                  <div className="acordeon-grid">
                    {Object.entries(cal)
                      .filter(
                        ([key]) =>
                          ![
                            'id',
                            'maquina_id',
                            'fecha',
                            'responsable',
                            'estado_maquina',
                            'createdAt',
                            'updatedAt',
                          ].includes(key)
                      )
                      .map(([key, value]) => (
                        <div key={key} className="dato-item">
                          <span className="dato-label">
                            {formateo[key] || key}:
                          </span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
