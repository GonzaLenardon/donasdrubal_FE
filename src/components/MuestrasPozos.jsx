import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { muestraAguaPozoCliente } from '../api/muestrasAgua';
import ModalMuestrasPozos from './ModalMuestrasPozos';

const MuestrasPozos = () => {
  const { cliente_id, pozos_id } = useParams();

  const [muestras, setMuestras] = useState([]);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [muestraEdit, setMuestraEdit] = useState(null);

  useEffect(() => {
    getMuestras();
  }, []);

  const getMuestras = async () => {
    try {
      setLoading(true);
      const res = await muestraAguaPozoCliente(cliente_id, pozos_id);
      setMuestras(res.data);
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

  const muestrasFiltradas = muestras.filter((m) => {
    if (!desde && !hasta) return true;
    const f = new Date(m.fecha_muestra);
    if (desde && f < new Date(desde)) return false;
    if (hasta && f > new Date(hasta)) return false;
    return true;
  });

  const limpiarFiltros = () => {
    setDesde('');
    setHasta('');
  };

  const handleEditarMuestra = (m) => {
    setMuestraEdit({ ...m });
    setIsOpen(true);
  };

  /* ================= RENDER ================= */

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-white mb-1">Muestras de Agua</h2>
            <p className="text-white-50 mb-0">
              {muestras.length} muestras registradas
            </p>
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
              setMuestraEdit({ pozo_id: pozos_id });
              setIsOpen(true);
            }}
          >
            <i className="bi bi-plus-lg me-2"></i>Nueva muestra
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
                    <th className="py-3 px-4">Fecha</th>
                    <th className="text-center">pH</th>
                    <th className="text-center">Dureza</th>
                    <th className="text-center">Alcalinidad</th>
                    <th className="text-center">Salinidad</th>
                    <th className="text-center">F. Iónica</th>
                    <th>Dosis</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody style={{ background: 'transparent' }}>
                  {muestrasFiltradas.map((m) => {
                    const ph = getValorColor(m.ph, 6.5, 8.5);
                    const du = getValorColor(m.dureza, 0, 500);
                    const al = getValorColor(m.alcalinidad, 0, 500);
                    const sa = getValorColor(m.salinidad, 0, 1000);

                    return (
                      <tr
                        key={m.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <td className="px-4 py-3">
                          <strong>{formatFecha(m.fecha_muestra)}</strong>
                        </td>

                        {[
                          { v: m.ph, c: ph },
                          { v: m.dureza, c: du },
                          { v: m.alcalinidad, c: al },
                          { v: m.salinidad, c: sa },
                        ].map((x, i) => (
                          <td key={i} className="text-center">
                            <span
                              className="px-3 py-2 rounded d-inline-flex gap-2"
                              style={{
                                background: x.c.bg,
                                color: x.c.color,
                                fontWeight: 600,
                              }}
                            >
                              {getValorIcon(x.v, 0, 9999)} {x.v ?? '-'}
                            </span>
                          </td>
                        ))}

                        <td className="text-center">
                          {m.fuerza_ionica ?? '-'}
                        </td>
                        <td>{m.dosis || '-'}</td>

                        <td className="text-center">
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(102,126,234,0.25)',
                              color: '#93c5fd',
                              border: '1px solid rgba(102,126,234,0.35)',
                            }}
                            onClick={() => handleEditarMuestra(m)}
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

      <ModalMuestrasPozos
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        muestra={muestraEdit}
        onSaved={getMuestras}
      />
    </div>
  );
};

export default MuestrasPozos;
