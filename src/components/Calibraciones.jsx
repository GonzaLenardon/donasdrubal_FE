import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { calibracionesMaquina } from '../api/calibraciones';
import { ModalCalibraciones } from './ModalCalibraciones';

export const Calibraciones = () => {
  const { id_maquina, id_user } = useParams();
  const [calibraciones, setCalibraciones] = useState();
  const [calibracion, setCalibracion] = useState();
  const [openIndex, setOpenIndex] = useState(null);
  const [modalCalibraciones, setModalCalibraciones] = useState(false);

  console.log('id_maquina', id_maquina, id_user);

  useEffect(() => {
    allcalibraciones();
  }, []);

  const allcalibraciones = async () => {
    try {
      const resp = await calibracionesMaquina(id_maquina);
      console.log('calibraciones', resp);
      setCalibraciones(resp.data);
    } catch (error) {
      console.log(error.data.message);
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

  const handleEditar = (cal) => {
    console.log('clclclclclla', cal);
    setCalibracion(cal);
    setModalCalibraciones(true);
  };

  return (
    <>
      <div className="container-view">
        <div className="container-datos">
          <div className="datos-user">
            <div className="user-name">{calibraciones?.cliente.nombre}</div>
            <span>{calibraciones?.cliente.datosImpositivos}</span>
            <span>{calibraciones?.cliente.telefono}</span>
          </div>

          <div className="datos-user">
            <div className="user-name">Calibraciones</div>
            <span>
              <strong>Marca :</strong> {calibraciones?.marca}
            </span>
            <span>
              <strong>Modelo :</strong> {calibraciones?.modelo}
            </span>
          </div>
        </div>

        <div className="d-flex pe-5 justify-content-end ">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleEditar({ maquina_id: id_maquina })}
          >
            +
          </button>
        </div>

        <div className="calibracion-container">
          {calibraciones?.calibraciones.map((cal, i) => {
            const fechaFormateada = new Date(cal.fecha).toLocaleDateString(
              'es-AR',
              {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }
            );

            return (
              <div
                key={i}
                className={`acordeon-item ${openIndex === i ? 'active' : ''}`}
              >
                {/* --- HEADER SIEMPRE VISIBLE --- */}
                <div className="acordeon-header" onClick={() => toggle(i)}>
                  <h5>Calibracion #{i + 1}</h5>

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

                    {/* --- BOTÓN DE 3 PUNTITOS --- */}
                    <div
                      className="dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="btn btn-light btn-sm"
                        data-bs-toggle="dropdown"
                      >
                        ⋮
                      </button>

                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleEditar(cal)}
                          >
                            Editar
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* --- CUERPO EXPANDIBLE --- */}
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
