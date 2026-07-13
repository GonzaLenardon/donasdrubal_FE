// src/components/JornadasTable.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { clienteJornadas, delJornada, openJornada } from '../api/jornadas';
import ModalJornadas from './ModalJornadas';
import ModalFinalizarServicios from './ModalFinalizarServicios';
import Spinner from './Spinner';
import ModalEliminar from './ModalEliminar';
import JornadasMobileList from './JornadasMobileList';
import { useIsMobile } from '../hooks/useIsMobile';

const badgeConfig = {
  CERRADO: { className: 'badge bg-danger', label: 'Cerrado' },
  PENDIENTE: { className: 'badge bg-success', label: 'Pendiente' },
  'EN PROCESO': {
    className: 'badge bg-warning text-dark',
    label: 'En proceso',
  },
};

const formatFecha = (fecha) =>
  fecha ? new Date(fecha).toLocaleDateString('es-AR') : '-';

const JornadasTable = () => {
  const { cliente_id } = useParams();
  const isMobile = useIsMobile();

  const [jornadas, setJornadas] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [jornadaEdit, setJornadaEdit] = useState(null);
  const [ingenieros, setIngenieros] = useState([]);
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
      const res = await clienteJornadas(cliente_id);

      setJornadas(res.data.jornadas);
      setIngenieros(res.data.ingenieros);
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Filtros ── */

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

  /* ── Handlers ── */

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
    } catch {
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
      await new Promise((r) => setTimeout(r, 2000));
      setMsg('Jornada eliminada exitosamente');
      await new Promise((r) => setTimeout(r, 1500));
      setMsg('');
      await getJornadas();
    } catch (error) {
      console.error('Error al eliminar jornada:', error);
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ── */

  return (
    <div className="maquinas-wrapper">
      <div style={{ margin: '0 auto' }}>
        {/* ── Header ── */}

        {/* ── Header ── */}
        <div className="jornadas-header mb-4">
          <div>
            <h2 className="fw-bold text-white mb-1">Gestión de Jornadas</h2>
            <p className="text-white-50 mb-0">{jornadas.length} Jornadas</p>
          </div>
          <div className="jornadas-header-actions">
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
              className="btn btn-sm text-white d-flex align-items-center gap-2 maquina-btn-nuevo"
              onClick={(e) => {
                e.stopPropagation();
                setJornadaEdit({ cliente_id });
                setIsOpen(true);
              }}
            >
              <i className="bi bi-plus-lg"></i>Nueva jornada
            </button>
          </div>
        </div>

        {/* ── Filtros ── */}
        {/* ── Filtros ── */}
        <div className="jornadas-filtros mb-4">
          <div className="jornadas-filtro-group">
            <label className="text-white fw-semibold" style={{ fontSize: 13 }}>
              Desde
            </label>
            <input
              type="date"
              className="form-control jornadas-filtro-input"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="jornadas-filtro-group">
            <label className="text-white fw-semibold" style={{ fontSize: 13 }}>
              Hasta
            </label>
            <input
              type="date"
              className="form-control jornadas-filtro-input"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <button
            className="btn btn-light jornadas-filtro-limpiar"
            onClick={limpiarFiltros}
            disabled={!desde && !hasta}
          >
            Limpiar filtros
          </button>
        </div>

        {/* ── Banner selección activa ── */}
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
                jornada seleccionada
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
                <i className="bi bi-trash3"></i>Eliminar
              </button>
            </div>
          </div>
        )}

        {/* ── Tabla (desktop) / Cards (mobile) ── */}
        {isMobile ? (
          <JornadasMobileList
            jornadas={jornadasFiltradas}
            isAdmin={isAdmin}
            modoSeleccion={modoSeleccion}
            seleccionado={seleccionado}
            onSeleccionar={setSeleccionado}
            onEditar={handleEditarJornada}
            onReabrir={setJornadaReabrir}
          />
        ) : (
          <div className="container-table rounded shadow-lg">
            <div className="table-wrapper">
              <table className="table mb-0">
                <thead>
                  <tr>
                    {modoSeleccion && (
                      <th
                        style={{
                          padding: '0.85rem 0.5rem 0.85rem 1rem',
                          width: 40,
                        }}
                      />
                    )}
                    <th>
                      <i className="bi bi-calendar-event me-1"></i>Fecha
                    </th>
                    <th>
                      <i className="bi bi-chat-left-text me-1"></i>Motivo
                    </th>
                    <th>
                      <i className="bi bi-card-text me-1"></i>Observaciones
                    </th>
                    <th>
                      <i className="bi bi-flag-fill me-1"></i>Estado
                    </th>

                    <th className="text-center">
                      <i className="bi bi-person-fill me-1"></i>Ing. Responsable
                    </th>
                    <th className="text-center">
                      <i className="bi bi-gear me-1"></i>Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jornadasFiltradas.map((m) => {
                    const isClosed = m.estado === 'CERRADO';
                    const badge = badgeConfig[m.estado] ?? {
                      className: 'badge bg-secondary',
                      label: m.estado,
                    };

                    return (
                      <tr key={m.id}>
                        {modoSeleccion && (
                          <td
                            style={{ padding: '0.85rem 0.5rem 0.85rem 1rem' }}
                          >
                            <input
                              type="checkbox"
                              checked={seleccionado === m.id}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => setSeleccionado(m.id)}
                              style={{
                                width: 15,
                                height: 15,
                                cursor: 'pointer',
                                accentColor: '#ef4444',
                              }}
                            />
                          </td>
                        )}
                        <td>
                          <span className="table-text fw-semibold">
                            {formatFecha(m.fecha_jornada)}
                          </span>
                        </td>
                        <td>
                          <span className="table-text">{m.motivo || '-'}</span>
                        </td>
                        <td>
                          <span className="table-text">
                            {m.observaciones || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            className={badge.className}
                            style={{
                              fontSize: '0.72rem',
                              padding: '0.35rem 0.7rem',
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>

                        <td className="text-center">
                          <span className="table-text">
                            {m.responsable?.nombre || '-'}
                          </span>
                        </td>

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
                                title="Reabrir jornada"
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
        )}
      </div>

      {/* ── Modales ── */}
      <ModalJornadas
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        jornada={jornadaEdit}
        onSaved={getJornadas}
        ingenieros={ingenieros}
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
          cantidad={1}
        />
      )}

      <Spinner msg={msg} loading={loading} />
    </div>
  );
};

export default JornadasTable;
