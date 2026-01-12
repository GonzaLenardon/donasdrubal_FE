import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { muestraAguaPozoCliente } from '../api/muestrasAgua';
import ModalMuestrasPozos from './ModalMuestrasPozos';
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

const MuestrasPozos = () => {
  const { cliente_id, pozos_id } = useParams();

  const [muestras, setMuestras] = useState([]);
  const [cliente, setCliente] = useState([]);
  const [pozo, setPozo] = useState([]);
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
      setPozo(res.data);
      setCliente(res.data.cliente);
      setMuestras(res.data.muestrasAgua);
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
  console.log('Muestras para filtrar', muestras);
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


    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER REDISEÑADO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Card Cliente */}
          <div className="card_calibracion">
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

                      {cliente?.razon_social || 'sin razón social'}
                    </p>
                  </div>
                  <div className="d-flex gap-5">
                    <p className="text-md w-25">Teléfono</p>
                    <p className="text-base font-lx  font-bold">

                      {cliente?.telefono || 'sin telefono'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Pozo */}
          <div className="card_calibracion">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Wrench className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-3">
                  Información del Pozo
                </h2>
                <div className="space-y-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-md">Nombre</p>
                      <p className="text-base font-xl font-bold ">
                        {pozo?.nombre || 'Sin nombre'}
                      </p>
                    </div>
                    <div>
                      <p className="text-md">Modelo</p>
                      <p className="text-base font-xl font-bold ">
                        {pozo?.establecimiento || 'Sin establecimiento'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>




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
                <h2 className="fw-bold text-white mb-1">
                  Muestras de Agua
                </h2>
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
                            'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                          borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
                        }}
                      >
                        <th
                          className="text-white fw-semibold py-2 px-3"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-calendar-event me-2"></i>Fecha
                        </th>
                        <th
                          className="text-white fw-semibold py-2 px-3 text-center"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-droplet me-2"></i>pH
                        </th>
                        <th
                          className="text-white fw-semibold py-2 px-3 text-center"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-shield-check me-2"></i>Dureza
                        </th>
                        <th
                          className="text-white fw-semibold py-2 px-3 text-center"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-graph-up me-2"></i>Alcalinidad
                        </th>
                        <th
                          className="text-white fw-semibold py-2 px-3 text-center"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-water me-2"></i>Salinidad
                        </th>
                        <th
                          className="text-white fw-semibold py-2 px-3 text-center"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-lightning-charge me-2"></i>F. Iónica
                        </th>
                        <th
                          className="text-white fw-semibold py-2 px-3"
                          style={{ fontSize: '0.875rem' }}
                        >
                          <i className="bi bi-prescription2 me-2"></i>Dosis
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
                      {muestrasFiltradas.map((m) => {
                        const ph = getValorColor(m.ph, 6.5, 8.5);
                        const du = getValorColor(m.dureza, 0, 500);
                        const al = getValorColor(m.alcalinidad, 0, 500);
                        const sa = getValorColor(m.salinidad, 0, 1000);

                        return (
                          <tr
                            key={m.id}
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
                            {/* Fecha */}
                            <td className="py-2 px-3">
                              <span
                                className="fw-semibold text-white"
                                style={{ fontSize: '0.85rem' }}
                              >
                                {formatFecha(m.fecha_muestra)}
                              </span>
                            </td>

                            {/* pH, Dureza, Alcalinidad, Salinidad */}
                            {[
                              { v: m.ph, c: ph },
                              { v: m.dureza, c: du },
                              { v: m.alcalinidad, c: al },
                              { v: m.salinidad, c: sa },
                            ].map((x, i) => (
                              <td key={i} className="text-center py-2 px-3">
                                <span
                                  className="rounded px-2 py-1"
                                  style={{
                                    background: x.c.bg,
                                    color: x.c.color,
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    display: 'inline-block',
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {getValorIcon(x.v, 0, 9999)} {x.v ?? '-'}
                                </span>
                              </td>
                            ))}

                            {/* Fuerza Iónica */}
                            <td className="text-center py-2 px-3">
                              <span
                                className="text-white"
                                style={{ fontSize: '0.85rem' }}
                              >
                                {m.fuerza_ionica ?? '-'}
                              </span>
                            </td>

                            {/* Dosis */}
                            <td className="py-2 px-3">
                              <span
                                className="text-white"
                                style={{ fontSize: '0.85rem' }}
                              >
                                {m.dosis || '-'}
                              </span>
                            </td>

                            {/* Acciones */}
                            <td className="text-center py-2 px-3">
                              <button
                                className="btn btn-sm"
                                style={{
                                  background: 'rgba(102, 126, 234, 0.2)',
                                  color: '#93c5fd',
                                  border: '1px solid rgba(102, 126, 234, 0.3)',
                                  padding: '0.3rem 0.8rem',
                                }}
                                onClick={() => handleEditarMuestra(m)}
                              >
                                <i className="bi bi-pencil"></i>
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
      </div>
    </div>
  );
};

export default MuestrasPozos;
