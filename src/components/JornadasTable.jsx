import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { clienteJornadas, delJornada, openJornada } from '../api/jornadas';
import ModalJornadas from './ModalJornadas';
import ModalFinalizarServicios from './ModalFinalizarServicios';
import Spinner from './Spinner';
import ModalEliminar from './ModalEliminar';
import ModalInformativo from './ModalInformativo';

const JornadasTable = () => {
  const { cliente_id } = useParams();

  const [jornadas, setJornadas] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [jornadaEdit, setJornadaEdit] = useState(null);
  const [jornadaReabrir, setJornadaReabrir] = useState(null);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.rol === 'Administrador';

  useEffect(() => {
    getJornadas();
  }, []);

  const getJornadas = async () => {
    try {
      /* setLoading(true); */
      const res = await clienteJornadas(cliente_id);
      setJornadas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      /* setLoading(false); */
    }
  };

  /* ================= HELPERS ================= */

  const formatFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';

  const getValorColor = (valor, min, max) => {
    if (valor === null || valor === undefined)
      return { color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' };
    if (valor < min || valor > max)
      return { color: '#ef4444', bg: 'rgba(239,68,68,0.2)' };
    return { color: '#22c55e', bg: 'rgba(34,197,94,0.2)' };
  };

  const getValorIcon = (valor, min, max) => {
    if (valor === null || valor === undefined) return '•';
    if (valor < min || valor > max) return '⚠';
    return '✓';
  };

  /* ================= FILTROS ================= */

  const jornadasFiltradas = jornadas.filter((m) => {
    if (!desde && !hasta) return true;
    const f = new Date(m.fecha_jornada);
    if (desde && f < new Date(desde)) return false;
    if (hasta && f > new Date(hasta)) return false;
    return true;
  });

  const limpiarFiltros = () => {
    setDesde('');
    setHasta('');
  };

  const handleEditarJornada = (m) => {
    setJornadaEdit({ ...m });
    setIsOpen(true);
  };

  const handleReabrirJornada = async () => {
    try {
      setJornadaReabrir(null);
      setLoading(true);
      await openJornada(jornadaReabrir.id);
      setMsg('Jornada abierta correctamente');
      await new Promise((r) => setTimeout(r, 1500));

      getJornadas();
    } catch (error) {
      console.error('Error al finalizar:', error);
      setMsg('Error al abrir Jornada');
      await new Promise((r) => setTimeout(r, 3000));
    } finally {
      setLoading(false);
      setMsg('');
    }
  };

  const toggleModoSeleccion = () => {
    setModoSeleccion((prev) => !prev);
    setSeleccionado(null);
  };

  const cancelarSeleccion = () => {
    setModoSeleccion(false);
    setSeleccionado(null);
  };

  const handleConfirmarBorrado = async () => {
    try {
      setShowConfirmDelete(false);
      await delJornada(seleccionado);
      setSeleccionado(null);

      setLoading(true);

      setMsg('Eliminando Jornada ...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setMsg('Jornada eliminada exitosamente');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMsg('');
      await getJornadas();
    } catch (error) {
      console.log('Error al eliminar jornada:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="maquinas-wrapper">
      <div style={{ margin: '0 auto' }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-white mb-1">Gestión de Jornadas</h2>
            <p className="text-white-50 mb-0">{jornadas.length} Jornadas</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                className={`btn btn-sm d-flex align-items-center gap-2 ${modoSeleccion ? 'btn-outline-danger' : 'btn-outline-light'
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
              onClick={(e) => {
                e.stopPropagation();
                setJornadaEdit({ cliente_id: cliente_id });
                setIsOpen(true);
              }}
            >
              <i className="bi bi-plus-lg me-2"></i>Nueva jornada
            </button>
          </div>
        </div>

        {/* FILTROS */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="text-white fw-semibold">Desde</label>
            <input
              type="date"
              className="form-control"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="text-white fw-semibold">Hasta</label>
            <input
              type="date"
              className="form-control"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button
              className="btn btn-light w-100"
              onClick={limpiarFiltros}
              disabled={!desde && !hasta}
            >
              Limpiar filtros
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
          <div className="table-wrapper">
            <table className="table mb-0">
              <thead>
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
                    <i className="bi bi-calendar-event"></i>Fecha
                  </th>
                  <th>
                    <i className="bi bi-chat-left-text"></i>Motivo
                  </th>

                  <th>
                    <i className="bi bi-card-text"></i>Observaciones
                  </th>
                  <th>
                    <i className="bi bi-flag-fill"></i>Estado
                  </th>
                  <th className="text-center">
                    <i className="bi bi-gear"></i>Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {jornadasFiltradas.map((m) => {
                  const isClosed = m.estado === 'CERRADO';

                  return (
                    <tr key={m.id} /* onClick={() => handleEditarJornada(m)} */>
                      {modoSeleccion && (
                        <td style={{ padding: '0.85rem 0.5rem 0.85rem 1rem' }}>
                          <input
                            type="checkbox"
                            checked={seleccionado === m.id}
                            onClick={(e) => e.stopPropagation()} // evita que suba al <tr>
                            onChange={() => setSeleccionado(m.id)}
                            style={{
                              width: '15px',
                              height: '15px',
                              cursor: 'pointer',
                              accentColor: '#ef4444',
                            }}
                          />
                        </td>
                      )}

                      {/* Fecha */}
                      <td>
                        <span className="table-text fw-semibold">
                          {formatFecha(m.fecha_jornada)}
                        </span>
                      </td>

                      {/* Motivo */}
                      <td>
                        <span className="table-text">{m.motivo || '-'}</span>
                      </td>

                      {/* Estado */}

                      {/* Observaciones */}
                      <td>
                        <span className="table-text">
                          {m.observaciones || '-'}
                        </span>
                      </td>
                      {/* ESTADO ABIERTO/CERRADO */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {m.estado === 'CERRADO' && (
                          <span
                            className="badge bg-danger"
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.35rem 0.7rem',
                            }}
                          >
                            CERRADO
                          </span>
                        )}

                        {m.estado === 'PENDIENTE' && (
                          <span
                            className="badge bg-success"
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.35rem 0.7rem',
                            }}
                          >
                            PENDIENTE
                          </span>
                        )}

                        {m.estado === 'EN PROCESO' && (
                          <span
                            className="badge bg-warning"
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.35rem 0.7rem',
                            }}
                          >
                            EN PROCESO
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td>
                        <div className="table-actions">
                          {!isClosed && (
                            <button
                              className="table-btn table-btn-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditarJornada(m);
                              }}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}

                          {isClosed && isAdmin && (
                            <button
                              className="btn btn-sm calibracion-botones text-warning"
                              onClick={() => setJornadaReabrir(m)}
                              title="Reabrir calibración"
                            >
                              <i className="bi bi-arrow-repeat"></i>
                            </button>
                          )}
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

      <ModalJornadas
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        jornada={jornadaEdit}
        onSaved={getJornadas}
      />
      {jornadaReabrir && (
        <ModalFinalizarServicios
          handleFinalizar={handleReabrirJornada}
          servicio="jornada"
          setShowFinalizar={() => setJornadaReabrir(null)}
          accion="reabrir"
        />
      )}

      {showConfirmDelete && (
        <ModalEliminar
          handleEliminar={handleConfirmarBorrado}
          onCancelar={() => setShowConfirmDelete(false)}
          servicio="jornada"
          /* detalle={`${maquinaSeleccionada?.tipo.marca} ${maquinaSeleccionada?.tipo.modelo}`} */
          cantidad={1}
        />
      )}

      <Spinner msg={msg} loading={loading} />
    </div>
  );
};

export default JornadasTable;
