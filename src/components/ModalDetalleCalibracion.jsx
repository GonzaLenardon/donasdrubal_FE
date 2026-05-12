import React from 'react';
import { Lightbulb } from 'lucide-react';

const ModalDetalleCalibracion = ({
  cal,
  index,
  onClose,
  parseEstado,
  parsePresion,
  parseSecciones,
  getEstadoColor,
  getColorHex,
  getComponentIcon,
  formateo,
  ingenieros,
  cliente_id,
  maquina_id,
  setViewerUrl,
  setShowViewer,
}) => {
  if (!cal) return null;

  const fechaFormateada = new Date(cal.fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const ingResponsable = ingenieros?.find((i) => i.id === cal.responsable_id);

  const presionUnimap = parsePresion(cal.presion_unimap);
  const presionComputadora = parsePresion(cal.presion_computadora);
  const presionManometro = parsePresion(cal.presion_manometro);
  const tieneValor = (v) => String(v ?? '').trim() !== '';
  const hayPresiones =
    tieneValor(presionUnimap.valor) ||
    tieneValor(presionComputadora.valor) ||
    tieneValor(presionManometro.valor);

  // ── BtnArchivo local ───────────────────────────────────────────────────────
  const BtnArchivo = ({ archivo }) => {
    if (!archivo?.nombreArchivo)
      return <span className="text-white-50 fst-italic">—</span>;
    return (
      <button
        type="button"
        className="btn btn-sm btn-outline-info"
        style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem' }}
        onClick={() => {
          setViewerUrl(`${archivo.path}/${archivo.nombreArchivo}`);
          setShowViewer(true);
        }}
      >
        <i className="bi bi-eye me-1"></i>Ver
      </button>
    );
  };

  // ── Secciones helpers ──────────────────────────────────────────────────────
  const renderSecciones = () => {
    if (!cal.secciones) return null;
    const seccionesData = parseSecciones(cal.secciones);
    if (Object.keys(seccionesData).length === 0) return null;

    const valores = Object.values(seccionesData).map((v) => parseFloat(v));
    const total = Object.keys(seccionesData).length;
    const promedio = (valores.reduce((a, b) => a + b, 0) / total).toFixed(2);
    const maximo = Math.max(...valores).toFixed(2);
    const minimo = Math.min(...valores).toFixed(2);

    return (
      <div className="mt-4">
        <div
          className="p-3"
          style={{
            background: '#212529',
            borderRadius: '10px',
            border: '1px solid rgba(139,92,246,0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <h6 className="fw-bold text-white mb-3">
            <i className="bi bi-list-ol me-2"></i>
            Secciones y Presiones por Zona
          </h6>

          {/* GRILLA 30 CELDAS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(15, 1fr)',
              gap: '5px',
            }}
          >
            {Array.from({ length: 30 }, (_, idx) => {
              const num = idx + 1;
              const valor = seccionesData[num];
              const tieneDato = valor !== undefined && valor !== '';

              return (
                <div
                  key={num}
                  style={{
                    borderRadius: '6px',
                    padding: '6px 4px',
                    textAlign: 'center',
                    background: tieneDato
                      ? 'rgba(139,92,246,0.2)'
                      : 'rgba(255,255,255,0.03)',
                    border: tieneDato
                      ? '1px solid rgba(139,92,246,0.5)'
                      : '1px dashed rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.58rem',
                      color: tieneDato
                        ? 'rgba(196,181,253,0.6)'
                        : 'rgba(255,255,255,0.2)',
                      lineHeight: 1,
                      marginBottom: '3px',
                    }}
                  >
                    Sec {num}
                  </div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: tieneDato ? '700' : '400',
                      color: tieneDato ? '#c4b5fd' : 'rgba(255,255,255,0.12)',
                      lineHeight: 1.1,
                    }}
                  >
                    {tieneDato ? parseFloat(valor).toFixed(1) : '—'}
                  </div>
                  {tieneDato && (
                    <div
                      style={{
                        fontSize: '0.55rem',
                        color: 'rgba(196,181,253,0.45)',
                        lineHeight: 1,
                        marginTop: '2px',
                      }}
                    >
                      bar
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* STATS PIE */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            {[
              { label: 'Cargadas', value: `${total} / 30` },
              { label: 'Promedio', value: `${promedio} bar` },
              { label: 'Máx', value: `${maximo} bar` },
              { label: 'Mín', value: `${minimo} bar` },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                {label}: <strong style={{ color: '#c4b5fd' }}>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Presiones helpers ──────────────────────────────────────────────────────
  const renderPresiones = () => {
    if (!hayPresiones && !cal.observaciones_acronex) return null;

    const presiones = [
      {
        label: 'Presión Unimap',
        data: presionUnimap,
        path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,
      },
      {
        label: 'Presión Computadora',
        data: presionComputadora,
        path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,
      },
      {
        label: 'Presión Manómetro',
        data: presionManometro,
        path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,
      },
    ];

    return (
      <div className="mt-4">
        <div
          className="p-3"
          style={{
            background: '#212529',
            borderRadius: '10px',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <h6 className="fw-bold text-white mb-3">
            <i className="bi bi-speedometer2 me-2"></i>
            Información de Presiones
          </h6>

          <div className="row g-3">
            {presiones.map(({ label, data, path }) =>
              tieneValor(data.valor) ? (
                <div className="col-md-4" key={label}>
                  <div
                    className="p-3 rounded-3"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <p
                      className="mb-1 text-white-50"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <i className="bi bi-speedometer me-1"></i>
                      {label}
                    </p>
                    <p className="mb-2 text-white fw-bold fs-5">
                      {data.valor}{' '}
                      <small
                        className="text-white-50 fw-normal"
                        style={{ fontSize: '0.75rem' }}
                      >
                        bar
                      </small>
                    </p>
                    <BtnArchivo
                      archivo={{ path, nombreArchivo: data.nombreArchivo }}
                    />
                  </div>
                </div>
              ) : null,
            )}
          </div>

          {/* Observaciones y recomendaciones de presión */}
          {[
            {
              campo: cal.observaciones_presion,
              label: 'Observaciones Presión',
            },
            {
              campo: cal.recomendaciones_presion,
              label: 'Recomendaciones Presión',
            },
            {
              campo: cal.observaciones_acronex,
              label: 'Observaciones ACRONEX',
            },
          ]
            .filter(({ campo }) => !!campo)
            .map(({ campo, label }) => (
              <div
                key={label}
                className="mt-3 pt-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p
                  className="mb-1 text-white-50"
                  style={{ fontSize: '0.875rem' }}
                >
                  <i className="bi bi-journal-text me-2"></i>
                  {label}
                </p>
                <p className="mb-0 text-white" style={{ fontSize: '0.875rem' }}>
                  {campo}
                </p>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // ── Tabla de componentes ───────────────────────────────────────────────────
  const renderTablaComponentes = () => (
    <div
      className="table-responsive"
      style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
        overflow: 'hidden',
      }}
    >
      <table
        className="table table-dark table-hover mb-0"
        style={{ fontSize: '0.85rem' }}
      >
        <thead
          style={{
            background: 'rgba(255,255,255,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <tr>
            {[
              { label: 'Componente', icon: 'bi-list-ul' },
              { label: 'Estado', icon: 'bi-clipboard-check', center: true },
              { label: 'Observación', icon: 'bi-chat-left-text' },
              { label: 'Detalles', icon: 'bi-info-circle' },
              { label: 'Recomendaciones', icon: 'bi-lightbulb' },
              { label: 'Archivo', icon: 'bi-image', center: true },
            ].map(({ label, icon, center }) => (
              <th
                key={label}
                style={{
                  padding: '1rem',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: center ? 'center' : 'left',
                }}
              >
                <i className={`bi ${icon} me-2`}></i>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(formateo).map((key) => {
            if (formateo[key] === 'Estado General') return null;

            const estadoData = parseEstado(cal.id, cal[key]);
            if (!estadoData.estado) return null;

            const isFiltro = formateo[key].includes('Filtro');
            const isBomba = formateo[key] === 'Bomba';

            return (
              <tr
                key={key}
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                {/* COMPONENTE */}
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i
                      className={`${getComponentIcon(formateo[key])} text-info`}
                      style={{ fontSize: '1.1rem' }}
                    ></i>
                    <span className="fw-bold text-white">{formateo[key]}</span>
                  </div>
                </td>

                {/* ESTADO */}
                <td
                  style={{
                    padding: '1rem',
                    verticalAlign: 'top',
                    textAlign: 'center',
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      backgroundColor: getEstadoColor(estadoData.estado).bg,
                      border: `1px solid ${getEstadoColor(estadoData.estado).border}`,
                      color: getEstadoColor(estadoData.estado).color,
                      fontSize: '0.75rem',
                      padding: '0.4rem 0.8rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {estadoData.estado}
                  </span>
                </td>

                {/* OBSERVACIÓN */}
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  {estadoData.observacion ? (
                    <p
                      className="mb-0 text-white-50"
                      style={{ fontSize: '0.8rem', lineHeight: '1.5' }}
                    >
                      {estadoData.observacion}
                    </p>
                  ) : (
                    <span className="text-white-50 fst-italic">
                      Sin observación
                    </span>
                  )}
                </td>

                {/* DETALLES */}
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  <div className="d-flex flex-column gap-2">
                    {isBomba && (
                      <>
                        {estadoData.modelo && (
                          <div className="d-flex align-items-center gap-2">
                            <i
                              className="bi bi-tag text-info"
                              style={{ fontSize: '0.75rem' }}
                            ></i>
                            <span
                              className="text-white-50"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Modelo:
                            </span>
                            <span
                              className="text-white fw-semibold"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {estadoData.modelo}
                            </span>
                          </div>
                        )}
                        {estadoData.materiales && (
                          <div className="d-flex align-items-center gap-2">
                            <i
                              className="bi bi-box-seam text-info"
                              style={{ fontSize: '0.75rem' }}
                            ></i>
                            <span
                              className="text-white-50"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Material:
                            </span>
                            <span
                              className="text-white fw-semibold"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {estadoData.materiales}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {isFiltro && (
                      <>
                        {estadoData.color && (
                          <div className="d-flex align-items-center gap-2">
                            <span
                              style={{
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: getColorHex(estadoData.color),
                                border: '2px solid rgba(255,255,255,0.4)',
                                flexShrink: 0,
                              }}
                            ></span>
                            <span
                              className="text-white fw-semibold"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {estadoData.color}
                            </span>
                          </div>
                        )}
                        {estadoData.numero !== '' &&
                          estadoData.numero !== null && (
                            <div className="d-flex align-items-center gap-2">
                              <i
                                className="bi bi-123 text-info"
                                style={{ fontSize: '0.75rem' }}
                              ></i>
                              <span
                                className="text-white-50"
                                style={{ fontSize: '0.75rem' }}
                              >
                                Nº:
                              </span>
                              <span
                                className="text-white fw-bold"
                                style={{
                                  fontSize: '0.75rem',
                                  fontFamily: 'Courier New, monospace',
                                }}
                              >
                                {estadoData.numero}
                              </span>
                            </div>
                          )}
                        {estadoData.presenciaORing && (
                          <span
                            className={`badge ${estadoData.presenciaORing === 'Si' ? 'bg-success' : 'bg-secondary'}`}
                            style={{
                              fontSize: '0.65rem',
                              padding: '0.25rem 0.5rem',
                            }}
                          >
                            <i
                              className={`bi ${estadoData.presenciaORing === 'Si' ? 'bi-check-circle-fill' : 'bi-x-circle'} me-1`}
                            ></i>
                            {estadoData.presenciaORing === 'Si'
                              ? 'Con O-Ring'
                              : 'Sin O-Ring'}
                          </span>
                        )}
                        {estadoData.materiales && (
                          <div className="d-flex align-items-center gap-2">
                            <i
                              className="bi bi-box-seam text-info"
                              style={{ fontSize: '0.75rem' }}
                            ></i>
                            <span
                              className="text-white-50"
                              style={{ fontSize: '0.75rem' }}
                            >
                              Material:
                            </span>
                            <span
                              className="text-white fw-semibold"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {estadoData.materiales}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {!isBomba &&
                      !isFiltro &&
                      !estadoData.modelo &&
                      !estadoData.materiales &&
                      !estadoData.color &&
                      !estadoData.numero &&
                      !estadoData.presenciaORing && (
                        <span className="text-white-50 fst-italic">—</span>
                      )}
                  </div>
                </td>

                {/* RECOMENDACIONES */}
                <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                  {estadoData.recomendaciones?.length > 0 ? (
                    <div className="d-flex flex-column gap-1">
                      {estadoData.recomendaciones.map((rec, idx) => (
                        <div
                          key={rec.id || idx}
                          className="d-flex align-items-start gap-2"
                          style={{
                            background: 'rgba(13,202,240,0.1)',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(13,202,240,0.2)',
                          }}
                        >
                          <i
                            className="bi bi-check-circle-fill"
                            style={{
                              color: '#0dcaf0',
                              fontSize: '0.7rem',
                              marginTop: '2px',
                              flexShrink: 0,
                            }}
                          ></i>
                          <span
                            className="text-white"
                            style={{ fontSize: '0.75rem', lineHeight: '1.4' }}
                          >
                            {rec.texto}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-white-50 fst-italic">
                      Sin recomendaciones
                    </span>
                  )}
                </td>

                {/* ARCHIVO */}
                <td
                  style={{
                    padding: '1rem',
                    verticalAlign: 'top',
                    textAlign: 'center',
                  }}
                >
                  <BtnArchivo
                    archivo={{
                      path: estadoData.path,
                      nombreArchivo: estadoData.nombreArchivo,
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ── Render principal ───────────────────────────────────────────────────────
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container cal-modal-detalle"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90%', maxHeight: '95vh', overflowY: 'auto' }}
      >
        {/* HEADER */}
        <div className="modal-header">
          <div className="d-flex align-items-center gap-3">
            <div className="modal-icon">
              <i className="bi bi-clipboard2-check"></i>
            </div>
            <div>
              <h3 className="modal-title mb-1">Calibración #{index + 1}</h3>
              <p className="modal-subtitle mb-0">
                {fechaFormateada}
                {ingResponsable?.nombre && ` · ${ingResponsable.nombre}`}
              </p>
            </div>
            {cal.estado === 'CERRADO' && (
              <span className="badge bg-danger ms-2">CERRADO</span>
            )}
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* IMAGEN DEL INFORME */}
          {cal.imagen && (
            <div className="mb-4">
              <p
                className="mb-2 fw-semibold text-white-50"
                style={{
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <i className="bi bi-image-fill me-2 text-info"></i>
                Imagen del Informe
              </p>
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/${cal.imagen}`}
                alt="Imagen del informe"
                className="rounded"
                style={{
                  maxHeight: '200px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
            </div>
          )}

          {/* TABLA COMPONENTES */}
          {renderTablaComponentes()}

          {/* SECCIONES */}
          {renderSecciones()}

          {/* PRESIONES */}
          {renderPresiones()}
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCalibracion;
