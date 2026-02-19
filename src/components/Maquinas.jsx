import React, { useEffect, useState } from 'react';
import { allMaquinas } from '../api/maquinas';
import { ModalMaquinas } from './ModalMaquinas';
import { useNavigate } from 'react-router-dom';

const Maquinas = ({ cliente_id }) => {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  const [maquinaEdit, setMaquinaEdit] = useState({});
  const [onlyView, setOnlyView] = useState(false);

  useEffect(() => {
    getMaquinas();
  }, []);

  const getMaquinas = async () => {
    try {
      setLoading(true);
      const res = await allMaquinas(cliente_id);
      console.log('dadadadada', res.data);
      setMsg(res.data.mensaje);
      setMaquinas(res.data);
    } catch (error) {
      setMsg(error.data.message);
    } finally {
      /* await new Promise((resolve) => setTimeout(resolve, 3000)); */
      setLoading(false);
      setMsg('');
    }
  };

  const handleNuevaMaquina = () => {
    setMaquinaEdit(null);
    setModal(true);
  };

  const handleEditarMaquina = (maquina) => {
    setMaquinaEdit(maquina);
    setModal(true);
    setOnlyView(false);
  };

  return (
    <div className="maquinas-wrapper">
      <div style={{ margin: '0 auto' }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-white mb-1">Maquinas</h2>
            <p className="text-white-50 mb-0">
              {maquinas.length} máquinas registradas
            </p>
          </div>
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

        {/* MENSAJE */}
        {msg && (
          <div className="alert alert-info mb-4" role="alert">
            {msg}
          </div>
        )}

        {/* TABLA */}
        <div className="container-table rounded shadow-lg">
          <div className="table-wrapper">
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border"
                  style={{ color: 'var(--color-base)' }}
                  role="status"
                >
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3" style={{ color: 'var(--color-gray-600)' }}>
                  Cargando máquinas...
                </p>
              </div>
            ) : maquinas.length === 0 ? (
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
                <button className="btn-primary" onClick={handleNuevaMaquina}>
                  <i className="bi bi-plus-lg me-2"></i>
                  Agregar primera máquina
                </button>
              </div>
            ) : (
              <table className="table mb-0">
                <thead>
                  <tr>
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
                              navigate(
                                `/cliente/${cliente_id}/detalles/maquinas/${maq.id}/calibraciones`,
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
    </div>
  );
};

export default Maquinas;
