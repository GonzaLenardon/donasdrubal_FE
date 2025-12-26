import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { clienteJornadas } from '../api/jornadas';
import ModalJornadas from './ModalJornadas';

const JornadasTable = () => {
  const { cliente_id } = useParams();

  const [jornadas, setJornadas] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [jornadaEdit, setJornadaEdit] = useState(null);

  useEffect(() => {
    getJornadas();
  }, []);

  const getJornadas = async () => {
    try {
      setLoading(true);
      const res = await clienteJornadas(cliente_id);
      setJornadas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  /* ================= RENDER ================= */

  return (
    <div
      style={{
        /*  minHeight: '100vh', */
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '15px',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-white mb-1">Gestión de Jornadas</h2>
            <p className="text-white-50 mb-0">{jornadas.length} Jornadas</p>
          </div>

          <button
            className="btn text-white"
            style={{
              background: 'rgba(102,126,234,0.35)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.6rem 1.2rem',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setJornadaEdit({ cliente_id: cliente_id });
              setIsOpen(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>Nueva jornada
          </button>
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

        {/* TABLA */}
        <div
          className="rounded shadow"
          style={{
            background: 'linear-gradient(145deg,#4a5d7c 0%,#3d4d69 100%)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '0.75rem',
          }}
        >
          {loading ? (
            <div className="text-center text-white py-5">
              <div className="spinner-border" />
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
                        'linear-gradient(135deg,rgba(102,126,234,0.35),rgba(118,75,162,0.35))',
                      borderBottom: '2px solid rgba(102,126,234,0.4)',
                    }}
                  >
                    <th className="text-center">Fecha</th>
                    <th className="text-center">Motivo</th>
                    <th className="text-center">Estado</th>
                    <th className="text-center">Observaciones</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody style={{ background: 'transparent' }}>
                  {jornadasFiltradas.map((m) => {
                    return (
                      <tr
                        key={m.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <td className="px-4 py-3">
                          <strong>{formatFecha(m.fecha_jornada)}</strong>
                        </td>
                        <td className="text-center">{m.motivo || '-'}</td>
                        <td className="text-center">{m.estado || '-'}</td>
                        <td className="text-left">{m.observaciones || '-'}</td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(102,126,234,0.25)',
                              color: '#93c5fd',
                              border: '1px solid rgba(102,126,234,0.35)',
                            }}
                            onClick={() => handleEditarJornada(m)}
                          >
                            <i className="bi bi-pencil me-1"></i>Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ModalJornadas
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        jornada={jornadaEdit}
        onSaved={getJornadas}
      />
    </div>
  );
};

export default JornadasTable;
