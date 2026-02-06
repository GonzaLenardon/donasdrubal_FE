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
  };

  return (
    <div
      style={{
        /*  minHeight: '100vh', */
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '15px',
      }}
    >
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
            className="btn text-white d-flex align-items-center gap-2 shadow-lg pozo-btn-nuevo"
            onClick={() => {
              setMaquinaEdit({ cliente_id: cliente_id });
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
        <div
          className="rounded shadow-lg"
          style={{
            background: 'linear-gradient(145deg, #4a5d7c 0%, #3d4d69 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-white" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-white mt-3">Cargando máquinas...</p>
            </div>
          ) : maquinas.length === 0 ? (
            <div className="p-5 text-center">
              <i
                className="bi bi-inbox"
                style={{ fontSize: '3rem', color: 'rgba(255, 255, 255, 0.5)' }}
              ></i>
              <h5 className="text-white mt-3 mb-2">No hay máquinas</h5>
              <p className="text-white-50 mb-3">
                Aún no hay máquinas registradas para este cliente
              </p>
              <button className="btn btn-light" onClick={handleNuevaMaquina}>
                <i className="bi bi-plus-lg me-2"></i>
                Agregar primera máquina
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                className="table table-hover mb-0"
                style={{
                  '--bs-table-bg': 'transparent',
                  '--bs-table-accent-bg': 'transparent',
                  '--bs-table-striped-bg': 'transparent',
                  '--bs-table-hover-bg': 'rgba(102, 126, 234, 0.1)',
                  '--bs-table-color': '#ffffff',
                  '--bs-table-border-color': 'rgba(255,255,255,0.15)',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                      borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-award me-2"></i>Marca
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-box-seam me-2"></i>Modelo
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-tag-fill me-2"></i>Tipo
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-arrows-expand me-2"></i>Ancho
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-droplet-half me-2"></i>Tanque
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-hash me-2"></i>Picos
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-rulers me-2"></i>Dist. Picos
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-scissors me-2"></i>Corte
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-person-fill me-2"></i>Operario
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3 text-center"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-gear me-2"></i>Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {maquinas.map((maq) => (
                    <tr
                      key={maq.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'rgba(102, 126, 234, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Marca */}
                      <td className="py-2 px-3">
                        <span
                          className="fw-semibold text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {maq.tipo.marca}
                        </span>
                      </td>

                      {/* Modelo */}
                      <td className="py-2 px-3">
                        <span
                          className="text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {maq.tipo.modelo}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="py-2 px-3">
                        <span
                          className="badge bg-info text-dark px-2 py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {maq.tipo.tipo}
                        </span>
                      </td>

                      {/* Ancho Trabajo */}
                      <td className="py-2 px-3">
                        <span
                          className="badge bg-success text-white px-2 py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {maq.ancho_trabajo}
                        </span>
                      </td>

                      {/* Capacidad Tanque */}
                      <td className="py-2 px-3">
                        <span
                          className="badge bg-primary text-white px-2 py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {maq.capacidad_tanque}
                        </span>
                      </td>

                      {/* Número Picos */}
                      <td className="py-2 px-3">
                        <span
                          className="badge bg-warning text-dark px-2 py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {maq.numero_picos}
                        </span>
                      </td>

                      {/* Distancia entre Picos */}
                      <td className="py-2 px-3">
                        <span
                          className="badge bg-secondary text-white px-2 py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {maq.distancia_entrePicos}
                        </span>
                      </td>

                      {/* Sistema Corte */}
                      <td className="py-2 px-3">
                        <span
                          className="badge bg-danger text-white px-2 py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {maq.sistema_corte}
                        </span>
                      </td>

                      {/* Responsable */}
                      <td className="py-2 px-3">
                        <span
                          className="text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {maq.responsable || '-'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-2 px-3">
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(102, 126, 234, 0.2)',
                              color: '#93c5fd',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              padding: '0.3rem 0.8rem',
                            }}
                            onClick={() => handleEditarMaquina(maq)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              padding: '0.3rem 0.8rem',
                            }}
                            onClick={() =>
                              navigate(
                                `/cliente/${cliente_id}/detalles/maquinas/${maq.id}/calibraciones`,
                              )
                            }
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
        />
      )}
    </div>
  );
};

export default Maquinas;
