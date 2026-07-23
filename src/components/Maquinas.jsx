import React, { useEffect, useState } from 'react';
import { allMaquinas, delMaquina } from '../api/maquinas';
import { ModalMaquinas } from './ModalMaquinas';
import { useNavigate } from 'react-router-dom';
import { useCliente } from '../context/UserContext';
import ModalFinalizarServicios from './ModalFinalizarServicios';
import ModalInformativo from './ModalInformativo';
import Spinner from './Spinner';
import ModalEliminar from './ModalEliminar';
import { Dot, LeyendaEstados } from './EstadoServicio';
import { stateColors } from '../utils/colors';

const Maquinas = ({ cliente_id }) => {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [maquinaEdit, setMaquinaEdit] = useState({});
  const [onlyView, setOnlyView] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showInformativo, setShowInformativo] = useState(false);

  const { setSelectedMaquina } = useCliente();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.rol === 'Administrador';

  useEffect(() => {
    getMaquinas();
  }, []);

  const getMaquinas = async () => {
    try {
      setLoading(true);
      const res = await allMaquinas(cliente_id);
      setMaquinas(res.data);
    } catch (error) {
      setMsg(error?.response?.data?.message || 'Error cargando máquinas');
    } finally {
      setLoading(false);
    }
  };

  const handleEditarMaquina = (maquina) => {
    setMaquinaEdit(maquina);
    setModal(true);
    setOnlyView(false);
  };

  const handleDelete = async () => {
    try {
      setShowConfirmDelete(false);
      await delMaquina(seleccionado);

      setLoading(true);
      setMsg('Eliminando Maquina ...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMsg('Maquina eliminada exitosamente');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMsg('');
      await getMaquinas();
    } catch (error) {
      const status = error.response?.status;
      console.log('LLLLLegggogo aca ');

      if (status === 409) {
        setShowInformativo(true);
        return;
      }

      if (status === 404) {
        alert('La máquina no existe');
        return;
      }

      alert('Error inesperado ddd');
    } finally {
      setLoading(false);
    }
  };

  const cancelarSeleccion = () => {
    setModoSeleccion(false);
    setSeleccionado(null);
  };

  /*  const toggleSeleccion = (id) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }; */

  const toggleSeleccion = (id) => {
    setSeleccionado((prev) => (prev === id ? null : id));
  };

  const toggleModoSeleccion = () => {
    setModoSeleccion((prev) => !prev);
    setSeleccionado(null);
  };

  return (
    <div className="maquinas-wrapper">
      <div style={{ margin: '0 auto' }}>
        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="notas-header__title mb-0">Maquinas</h2>

            <p className="notas-header__subtitle mb-0">
              {maquinas.length} máquinas registradas
            </p>
          </div>

          {/* 🔹 Contenedor de botones */}
          <div className="d-flex align-items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 ${
                  modoSeleccion ? 'btn-outline-danger' : 'btn-outline-light'
                }`}
                style={{ opacity: modoSeleccion ? 1 : 0.65 }}
                onClick={toggleModoSeleccion}
              >
                <i className="bi bi-trash3"></i>
                {modoSeleccion ? 'Cancelar' : 'Seleccionar'}
              </button>
            )}

            <button
              className="btn text-white d-flex align-items-center gap-2 shadow-lg maquina-btn-nuevo"
              onClick={() => {
                setMaquinaEdit({ cliente_id: cliente_id });
                setOnlyView(false);
                setModal(true);
              }}
            >
              <i className="bi bi-plus-lg"></i>
              Nueva Máquina
            </button>
          </div>
        </div>

        {modoSeleccion && seleccionado && (
          <div
            className="d-flex align-items-center justify-content-between mb-3 px-3 py-2 rounded"
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-ui-checks text-white-50"></i>

              <span className="text-white-50" style={{ fontSize: '0.85rem' }}>
                <span className="text-white fw-bold p-1">1</span>
                Maquina seleccionada
              </span>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-light"
                style={{ opacity: 0.5, fontSize: '0.8rem' }}
                onClick={cancelarSeleccion}
              >
                Cancelar
              </button>
              <button
                className="btn btn-sm btn-danger d-flex align-items-center gap-2"
                style={{ fontSize: '0.8rem' }}
                onClick={() => setShowConfirmDelete(true)}
              >
                <i className="bi bi-trash3"></i>
                Eliminar{' '}
                {seleccionado.length > 0 ? `(${seleccionado.length})` : ''}
              </button>
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className="container-table rounded shadow-lg">
          <LeyendaEstados className="bg-info" />
          <div className="table-wrapper">
            {maquinas.length === 0 ? (
              <div className="p-5 text-center">
                <i
                  className="bi bi-inbox"
                  style={{ fontSize: '3rem', color: 'var(--color-gray-300)' }}
                ></i>
                <h5
                  className="mt-3 mb-2"
                  style={{ color: 'var(--color-gray-700)' }}
                >
                  No hay máquinas
                </h5>
                <p className="mb-3" style={{ color: 'var(--color-gray-600)' }}>
                  Aún no hay máquinas registradas para este cliente
                </p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setMaquinaEdit({ cliente_id: cliente_id });
                    setOnlyView(false);
                    setModal(true);
                  }}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Agregar primera máquina
                </button>
              </div>
            ) : (
              <table className="table mb-0">
                <thead
                  style={{
                    background: 'rgba(206, 190, 110, 0.12)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <tr>
                    {modoSeleccion && (
                      <th
                        style={{
                          padding: '0.85rem 0.5rem 0.85rem 1rem',
                          width: '40px',
                        }}
                      ></th>
                    )}
                    <th>
                      <i className="bi bi-award"></i>Marca
                    </th>
                    <th>
                      <i className="bi bi-box-seam"></i>Modelo
                    </th>
                    <th>
                      <i className="bi bi-tag-fill"></i>Tipo
                    </th>
                    <th>
                      <i className="bi bi-arrows-expand"></i>Ancho
                    </th>
                    <th>
                      <i className="bi bi-droplet-half"></i>Tanque
                    </th>
                    <th>
                      <i className="bi bi-hash"></i>Picos
                    </th>
                    <th>
                      <i className="bi bi-rulers"></i>Dist. Picos
                    </th>
                    <th>
                      <i className="bi bi-scissors"></i>Corte
                    </th>
                    <th>
                      <i className="bi bi-person-fill"></i>Operario
                    </th>
                    <th>
                      <i className="bi bi-info-circle"></i>Calibracion
                    </th>
                    <th className="text-center">
                      <i className="bi bi-gear"></i>Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {maquinas.map((maq) => (
                    <tr
                      key={maq.id}
                      onClick={() => {
                        setMaquinaEdit(maq);
                        setModal(true);
                        setOnlyView(true);
                      }}
                    >
                      {modoSeleccion && (
                        <td style={{ padding: '0.85rem 0.5rem 0.85rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={seleccionado === maq.id}
                            onClick={(e) => e.stopPropagation()} // evita que suba al <tr>
                            onChange={() => toggleSeleccion(maq.id)}
                            style={{
                              width: '15px',
                              height: '15px',
                              cursor: 'pointer',
                              accentColor: '#ef4444',
                            }}
                          />
                        </td>
                      )}

                      {/* Marca */}
                      <td>
                        <span className="table-text fw-semibold">
                          {maq.tipo.marca}
                        </span>
                      </td>

                      {/* Modelo */}
                      <td>
                        <span className="table-text">{maq.tipo.modelo}</span>
                      </td>

                      {/* Tipo */}
                      <td>
                        <span className="table-badge-info">
                          {maq.tipo.tipo}
                        </span>
                      </td>

                      {/* Ancho Trabajo */}
                      <td>
                        <span className="table-badge-success">
                          <i className="bi bi-arrows-expand me-1"></i>
                          {maq.ancho_trabajo}
                        </span>
                      </td>

                      {/* Capacidad Tanque */}
                      <td>
                        <span className="table-badge-primary">
                          <i className="bi bi-droplet-fill me-1"></i>
                          {maq.capacidad_tanque}
                        </span>
                      </td>

                      {/* Número Picos */}
                      <td>
                        <span className="table-badge-warning">
                          {maq.numero_picos}
                        </span>
                      </td>

                      {/* Distancia entre Picos */}
                      <td>
                        <span className="table-badge-secondary">
                          {maq.distancia_entrePicos}
                        </span>
                      </td>

                      {/* Sistema Corte */}
                      <td>
                        <span className="table-badge-danger">
                          {maq.sistema_corte}
                        </span>
                      </td>

                      {/* Responsable */}
                      <td>
                        <span className="table-text">
                          {maq.responsable || '-'}
                        </span>
                      </td>

                      <td className="text-center">
                        <Dot
                          color={
                            maq?.calibracionesmaquina[0].estado === 'CERRADO'
                              ? stateColors.COLOR_CERRADAS
                              : maq?.calibracionesmaquina[0].estado ===
                                  'EN PROCESO'
                                ? stateColors.COLOR_PROCESO
                                : stateColors.COLOR_PENDIENTES
                          }
                          size={20}
                        ></Dot>
                      </td>

                      {/* Acciones */}
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-btn table-btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarMaquina(maq);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="table-btn table-btn-view"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMaquina(maq);

                              navigate(
                                `/clientes/${cliente_id}/maquinas/${maq.id}/calibraciones`,
                              );
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {/* MODAL */}
      {modal && (
        <ModalMaquinas
          onClose={() => {
            setModal(false);
            setMaquinaEdit(null);
          }}
          onSaved={() => getMaquinas()}
          maquinaEdit={maquinaEdit}
          setMaquinaEdit={setMaquinaEdit}
          onlyView={onlyView}
        />
      )}

      {showConfirmDelete && (
        <ModalEliminar
          handleEliminar={handleDelete}
          onCancelar={() => setShowConfirmDelete(false)}
          servicio="maquina"
          /* detalle={`${maquinaSeleccionada?.tipo.marca} ${maquinaSeleccionada?.tipo.modelo}`} */
          cantidad={1}
        />
      )}

      {showInformativo && (
        <ModalInformativo
          onClose={() => setShowInformativo(false)}
          tipo="Maquina"
          dependencias="calibraciones"
        />
      )}

      <Spinner loading={loading} msg={msg} />
    </div>
  );
};

export default Maquinas;
