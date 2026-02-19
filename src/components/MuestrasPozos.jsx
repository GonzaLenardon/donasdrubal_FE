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
  Droplet,
  Phone,
  MapPin,
  Building,
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
  const [onlyView, setOnlyView] = useState(false);
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
    // Sin dato
    if (valor === null || valor === undefined) {
      return {
        color: '#9ca3af', // gris claro legible
        bg: 'rgba(156,163,175,0.12)', // fondo neutro suave
      };
    }

    // Fuera de rango (alerta)
    if (valor < min || valor > max) {
      return {
        color: '#fecaca', // rojo claro (menos agresivo)
        bg: 'rgba(220,38,38,0.25)', // rojo profundo translúcido
      };
    }

    // OK / dentro de rango
    return {
      color: '#d1fae5', // verde muy claro (excelente contraste)
      bg: 'rgba(16,185,129,0.25)', // verde esmeralda acorde a la paleta
    };
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
    setOnlyView(false);
    setMuestraEdit({ ...m });
    setIsOpen(true);
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* HEADER REDISEÑADO */}

        <div className="info-cards-grid">
          {/* Card Cliente */}

          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-icon">
                <Building2 size={24} />
              </div>
              <h3 className="info-card-title">Información del Cliente</h3>
            </div>
            <div className="info-card-body-row">
              <div className="info-item-horizontal">
                <div className="info-item-icon">
                  <Building size={20} />
                </div>
                <div className="info-item-content">
                  <span className="info-item-label">Razón Social</span>
                  <span className="info-item-value">
                    {cliente?.razon_social || 'Sin razón social'}
                  </span>
                </div>
              </div>

              <div className="info-item-horizontal">
                <div className="info-item-icon">
                  <Phone size={20} />
                </div>
                <div className="info-item-content">
                  <span className="info-item-label">Teléfono</span>
                  <span className="info-item-value">
                    {cliente?.telefono || 'No especificado'}
                  </span>
                </div>
              </div>

              <div className="info-item-horizontal">
                <div className="info-item-icon">
                  <MapPin size={20} />
                </div>
                <div className="info-item-content">
                  <span className="info-item-label">Localidad</span>
                  <span className="info-item-value">
                    {cliente?.ciudad || 'No especificado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Pozo */}
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-card-icon">
                <Droplet size={24} />
              </div>
              <h3 className="info-card-title">Información del Pozo</h3>
            </div>
            <div className="info-card-body-row">
              <div className="info-item-horizontal">
                <div className="info-item-icon">
                  <Droplet size={20} />
                </div>
                <div className="info-item-content">
                  <span className="info-item-label">Nombre</span>
                  <span className="info-item-value">
                    {pozo?.nombre || 'Sin nombre'}
                  </span>
                </div>
              </div>

              <div className="info-item-horizontal">
                <div className="info-item-icon">
                  <Building size={20} />
                </div>
                <div className="info-item-content">
                  <span className="info-item-label">Establecimiento</span>
                  <span className="info-item-value">
                    {pozo?.establecimiento || 'No especificado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="muestras-pozos-wrapper">
          <div style={{ margin: '0 auto' }}>
            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold text-white mb-1">Muestras de Agua</h2>
                <p className="text-white-50 mb-0">
                  {muestras?.length || 0} muestras registradas
                </p>
              </div>

              <button
                className="btn text-white d-flex align-items-center gap-2 shadow-lg muestra-pozo-btn-nuevo"
                onClick={(e) => {
                  e.stopPropagation();
                  setMuestraEdit({ pozo_id: pozos_id });
                  setOnlyView(false);
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

            <div className="container-table rounded shadow-lg">
              {loading ? (
                <div className="text-center text-white py-5">
                  <div className="spinner-border" />
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>
                          <i className="bi bi-calendar-event me-2"></i>Fecha
                        </th>
                        <th>
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
                          <i className="bi bi-lightning-charge me-2"></i>F.
                          Iónica
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
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setMuestraEdit(m);
                              setOnlyView(true);
                              setIsOpen(true);
                            }}
                          >
                            {/* Fecha */}
                            <td className="py-2 px-3">
                              <span
                                className="fw-semibold"
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
                                    /*    color: x.c.color, */
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
                              <span>{m.fuerza_ionica ?? '-'}</span>
                            </td>

                            {/* Dosis */}
                            <td className="py-2 px-3">
                              <span>{m.dosis || '-'}</span>
                            </td>

                            {/* Acciones */}
                            <td className="text-center py-2 px-3">
                              <button
                                className="btn btn-sm maquina-btn-editar"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditarMuestra(m);
                                }}
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
            onClose={() => {
              setIsOpen(false);
            }}
            muestra={muestraEdit}
            onSaved={getMuestras}
            onlyView={onlyView}
          />
        </div>
      </div>
    </div>
  );
};

export default MuestrasPozos;
