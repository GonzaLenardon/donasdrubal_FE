import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Receipt, Plus, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { allFacturas, anularFactura, remitosDisponibles } from '../api/facturas';
import { allCliente } from '../api/clientes';
import Spinner from './Spinner';
import ModalFactura from './ModalFactura';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const ESTADO_COLORS = {
  SIMULADA: '#3b82f6',
  EMITIDA: '#146c43',
  ANULADA: '#dc3545',
};

const STATUS_COLORS = {
  PENDIENTE: '#EF9F27',
  REVISION: '#3b82f6',
  COMPLETADO: '#146c43',
  ANULADO: '#dc3545',
};

const FACTURACION_COLORS = {
  NO_FACTURADO: '#6c757d',
  PARCIAL: '#EF9F27',
  FACTURADO: '#146c43',
};

const FACTURACION_LABELS = {
  NO_FACTURADO: 'Sin facturar',
  PARCIAL: 'Parcial',
  FACTURADO: 'Facturado',
};

const TIPO_LABELS = {
  FACTURA: 'Factura',
  ANTICIPO: 'Anticipo',
};

const FILTROS_ESTADO = [
  { value: '', label: 'Todos', dot: null },
  { value: 'SIMULADA', label: 'Simulada', dot: ESTADO_COLORS.SIMULADA },
  { value: 'EMITIDA', label: 'Emitida', dot: ESTADO_COLORS.EMITIDA },
  { value: 'ANULADA', label: 'Anulada', dot: ESTADO_COLORS.ANULADA },
];

const fechaHoy = () => {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
};

const normalizar = (str) =>
  (str ?? '')
    .toString()
    .normalize('NFD')
    .split('')
    .filter((c) => c.charCodeAt(0) < 0x0300 || c.charCodeAt(0) > 0x036f)
    .join('')
    .toLowerCase();

const Facturacion = () => {
  const [searchParams] = useSearchParams();
  const clienteParam = searchParams.get('cliente') || '';
  const fechaParam = searchParams.get('fecha') || '';

  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [remitosPendientes, setRemitosPendientes] = useState([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(false);
  const [mostrarFacturados, setMostrarFacturados] = useState(false);
  const [fechaInicial, setFechaInicial] = useState(fechaHoy());
  const [loading, setLoading] = useState(true);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaNumero, setBusquedaNumero] = useState('');
  const [selectedFacturaId, setSelectedFacturaId] = useState(null);
  const [modalFactura, setModalFactura] = useState(null);
  const isMobile = useIsMobile();
  const isAdmin =
    JSON.parse(localStorage.getItem('user'))?.rol === 'Administrador';

  useEffect(() => {
    cargarDatos();
  }, []);

  // Permite llegar desde Remitos con el cliente y la fecha ya seteados
  useEffect(() => {
    if (clienteParam) setFiltroCliente(clienteParam);
    if (fechaParam) setFechaInicial(fechaParam);
  }, [clienteParam, fechaParam]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [facturasRes, clientesRes] = await Promise.all([
        allFacturas(),
        allCliente(),
      ]);
      setFacturas(facturasRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Remitos del cliente seleccionado, incluidos los que todavía no son
  // facturables (para poder ver por qué quedan pendientes).
  useEffect(() => {
    if (!filtroCliente) {
      setRemitosPendientes([]);
      return undefined;
    }

    let cancelado = false;
    const cargar = async () => {
      try {
        setCargandoPendientes(true);
        const res = await remitosDisponibles(filtroCliente, true);
        if (!cancelado) setRemitosPendientes(res.data || []);
      } catch (error) {
        console.error('Error al cargar remitos pendientes:', error);
        if (!cancelado) setRemitosPendientes([]);
      } finally {
        if (!cancelado) setCargandoPendientes(false);
      }
    };

    cargar();
    return () => {
      cancelado = true;
    };
  }, [filtroCliente]);

  const totalFacturado = (factura) =>
    (factura.remitos || []).reduce(
      (acc, item) => acc + parseFloat(item.cantidad_facturada || 0),
      0,
    );

  const hayFiltros = Boolean(
    filtroCliente || filtroTipo || filtroEstado || busquedaNumero,
  );

  const limpiarFiltros = () => {
    setFiltroCliente('');
    setFiltroTipo('');
    setFiltroEstado('');
    setBusquedaNumero('');
  };

  const facturasFiltradas = useMemo(() => {
    const query = normalizar(busquedaNumero.trim());
    return facturas.filter((factura) => {
      if (filtroCliente && factura.cliente_id !== Number(filtroCliente))
        return false;
      if (filtroTipo && factura.tipo !== filtroTipo) return false;
      if (filtroEstado && factura.estado !== filtroEstado) return false;
      if (query && !normalizar(factura.numero || `#${factura.id}`).includes(query))
        return false;
      return true;
    });
  }, [facturas, filtroCliente, filtroTipo, filtroEstado, busquedaNumero]);

  const pendientesVisibles = useMemo(
    () =>
      remitosPendientes.filter(
        (remito) =>
          mostrarFacturados || remito.estado_facturacion !== 'FACTURADO',
      ),
    [remitosPendientes, mostrarFacturados],
  );

  useEffect(() => {
    if (
      selectedFacturaId &&
      !facturasFiltradas.some((f) => f.id === selectedFacturaId)
    ) {
      setSelectedFacturaId(null);
    }
  }, [facturasFiltradas, selectedFacturaId]);

  const facturaSeleccionada = facturas.find(
    (f) => f.id === selectedFacturaId,
  );

  const getNombreCliente = (id) => {
    const c = clientes.find((cl) => cl.id === id);
    return c ? c.razon_social : `Cliente #${id}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('es-AR');
  };

  const handleAnular = async (factura) => {
    const confirmMessage =
      factura.tipo === 'ANTICIPO'
        ? '¿Está seguro de anular este anticipo?'
        : `¿Está seguro de anular la factura ${
            factura.numero || `#${factura.id}`
          }? Los remitos asociados liberarán su saldo pendiente.`;
    if (!window.confirm(confirmMessage)) return;
    try {
      await anularFactura(factura.id);
      await cargarDatos();
    } catch (error) {
      console.error('Error al anular:', error);
      window.alert(
        error.response?.data?.message || 'No se pudo anular la factura.',
      );
    }
  };

  const renderBadge = (estado) => (
    <span
      className="lista-badge"
      style={{ backgroundColor: ESTADO_COLORS[estado] || '#6c757d' }}
    >
      {estado}
    </span>
  );

  const renderBadgeFacturacion = (estadoFact) => {
    const estado = estadoFact || 'NO_FACTURADO';
    return (
      <span
        className="lista-badge"
        style={{
          backgroundColor: FACTURACION_COLORS[estado] || '#6c757d',
        }}
        title="Estado de facturación"
      >
        {FACTURACION_LABELS[estado] || estado}
      </span>
    );
  };

  const abrirFactura = (remito = null) => {
    setModalFactura({
      remito,
      clienteId: remito?.destination_client_id || filtroCliente,
      fecha: fechaInicial,
    });
  };

  const renderDetalle = () => {
    const factura = facturaSeleccionada;
    const total = totalFacturado(factura);

    return (
      <div className="lista-box lista-detalle__box">
        <div className="lista-box__header">
          <h4 className="lista-box__title">
            <Receipt size={16} />
            Factura {factura.numero || `#${factura.id}`}
          </h4>
          <div className="d-flex align-items-center gap-2">
            <span className="lista-badge lista-badge--pill">
              {TIPO_LABELS[factura.tipo] || factura.tipo}
            </span>
            {renderBadge(factura.estado)}
            <button
              className="lista-cerrar"
              title="Cerrar detalle"
              onClick={() => setSelectedFacturaId(null)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="lista-box__body">
          <dl className="lista-kv">
            <dt>Cliente</dt>
            <dd>{getNombreCliente(factura.cliente_id)}</dd>
            <dt>Fecha</dt>
            <dd>{formatDate(factura.fecha)}</dd>
            <dt>Total facturado</dt>
            <dd>
              {factura.tipo === 'ANTICIPO'
                ? '—'
                : `${total.toFixed(2)} (en ${factura.remitos?.length || 0} remito${
                    (factura.remitos?.length || 0) !== 1 ? 's' : ''
                  })`}
            </dd>
            {factura.notas && (
              <>
                <dt>Notas</dt>
                <dd>{factura.notas}</dd>
              </>
            )}
            <dt>Creada</dt>
            <dd>
              {formatDateTime(factura.createdAt)}
              {factura.creadoPor &&
                ` por ${factura.creadoPor.nombre || factura.creadoPor.email}`}
            </dd>
          </dl>

          {(factura.remitos || []).length > 0 && (
            <table className="lista-items">
              <thead>
                <tr>
                  <th>Remito</th>
                  <th>Fecha</th>
                  <th className="text-end">Cantidad facturada</th>
                </tr>
              </thead>
              <tbody>
                {factura.remitos.map((item) => (
                  <tr key={item.id}>
                    <td>{item.remito?.remito_number || `#${item.remito_id}`}</td>
                    <td>
                      {formatDate(item.remito?.issued_at || item.remito?.createdAt)}
                    </td>
                    <td className="text-end lista-items__cantidad">
                      {parseFloat(item.cantidad_facturada || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2}>Total</td>
                  <td className="text-end">{total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {factura.estado !== 'ANULADA' && isAdmin && (
            <div className="lista-box__acciones">
              <button
                className="lista-btn lista-btn--danger"
                onClick={() => handleAnular(factura)}
              >
                <X size={14} /> Anular factura
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPendientes = () => (
    <div className="lista-box mb-3">
      <div className="lista-box__header">
        <h4 className="lista-box__title">
          <Receipt size={16} />
          Remitos pendientes de facturar
        </h4>
        {filtroCliente && (
          <label className="d-flex align-items-center gap-2 small text-muted">
            <input
              type="checkbox"
              checked={mostrarFacturados}
              onChange={(e) => setMostrarFacturados(e.target.checked)}
            />
            Ver también los facturados
          </label>
        )}
      </div>

      {!filtroCliente ? (
        <div className="lista-box__body">
          <p className="lista-vacio mb-0">
            Seleccioná un cliente para ver sus remitos pendientes de
            facturación.
          </p>
        </div>
      ) : cargandoPendientes ? (
        <div className="lista-box__body justify-content-center align-items-center">
          <Spinner />
        </div>
      ) : pendientesVisibles.length === 0 ? (
        <div className="lista-box__body">
          <p className="lista-vacio mb-0">
            Este cliente no tiene remitos pendientes de facturación.
          </p>
        </div>
      ) : (
        <div className="lista-scroll">
          <table className="lista-table">
            <thead>
              <tr>
                <th>N° Remito</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-end">Total</th>
                <th className="text-end">Facturado</th>
                <th className="text-end">Saldo</th>
                <th>Facturación</th>
                <th className="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pendientesVisibles.map((remito) => (
                <tr key={remito.id} className="lista-table__row">
                  <td className="lista-table__numero">
                    {remito.remito_number}
                  </td>
                  <td>{formatDate(remito.issued_at || remito.createdAt)}</td>
                  <td>
                    <span
                      className="lista-badge"
                      style={{
                        backgroundColor: STATUS_COLORS[remito.status] || '#6c757d',
                      }}
                    >
                      {remito.status}
                    </span>
                  </td>
                  <td className="text-end">
                    {Number(remito.total_remitido || 0).toFixed(2)}
                  </td>
                  <td className="text-end">
                    {Number(remito.facturado || 0).toFixed(2)}
                  </td>
                  <td className="text-end">
                    {Number(
                      remito.saldo_facturacion ?? remito.saldo ?? 0,
                    ).toFixed(2)}
                  </td>
                  <td>{renderBadgeFacturacion(remito.estado_facturacion)}</td>
                  <td className="text-end">
                    {remito.facturable && isAdmin ? (
                      <button
                        className="lista-btn lista-btn--primary"
                        title="Facturar este remito"
                        onClick={() => abrirFactura(remito)}
                      >
                        <Receipt size={14} /> Facturar
                      </button>
                    ) : (
                      <small className="text-muted">
                        {remito.motivo_bloqueo || '—'}
                      </small>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) return <Spinner />;

  return (
    <div className="lista py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="page-header__title">
            <Receipt size={22} className="page-header__icon" />
            Facturación
          </h2>
          <p className="page-header__subtitle">
            {filtroCliente
              ? `Facturando a ${getNombreCliente(Number(filtroCliente))} · fecha ${formatDate(fechaInicial)}`
              : hayFiltros
                ? `${facturasFiltradas.length} de ${facturas.length} facturas`
                : `${facturas.length} factura${
                    facturas.length !== 1 ? 's' : ''
                  } registrada${facturas.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {isAdmin && (
          <button className="btn-primary" onClick={() => abrirFactura()}>
            <Plus size={16} className={isMobile ? '' : 'me-2'} />
            {!isMobile && 'Nueva Factura'}
          </button>
        )}
      </div>

      <div className="lista-surface">
        <div className="lista-surface__header">
          <h3 className="lista-surface__title">
            <Receipt size={16} />
            Registros
          </h3>
          <div className="lista-pills">
            {[
              { value: '', label: 'Todos' },
              { value: 'FACTURA', label: 'Facturas' },
              { value: 'ANTICIPO', label: 'Anticipos' },
            ].map((filtro) => (
              <button
                key={filtro.value || 'todos'}
                className={`lista-pill ${
                  filtroTipo === filtro.value ? 'lista-pill--active' : ''
                }`}
                onClick={() => setFiltroTipo(filtro.value)}
              >
                {filtro.label} (
                {
                  facturas.filter(
                    (f) => !filtro.value || f.tipo === filtro.value,
                  ).length
                }
                )
              </button>
            ))}
          </div>
          <div className="lista-pills">
            {FILTROS_ESTADO.map((filtro) => (
              <button
                key={filtro.value}
                className={`lista-pill ${
                  filtroEstado === filtro.value ? 'lista-pill--active' : ''
                }`}
                onClick={() => setFiltroEstado(filtro.value)}
              >
                {filtro.dot && (
                  <span
                    className="lista-pill__dot"
                    style={{ backgroundColor: filtro.dot }}
                  />
                )}
                {filtro.label} (
                {
                  facturas.filter(
                    (f) => !filtro.value || f.estado === filtro.value,
                  ).length
                }
                )
              </button>
            ))}
          </div>
        </div>

        <div className="lista-filtros">
          <div className="lista-filtros__group lista-filtros__group--grow">
            <label className="lista-filtros__label">N° Factura</label>
            <div className="lista-filtros__search">
              <Search size={14} />
              <input
                type="text"
                className="lista-filtros__input"
                placeholder="Buscar por número..."
                value={busquedaNumero}
                onChange={(e) => setBusquedaNumero(e.target.value)}
              />
            </div>
          </div>

          <div className="lista-filtros__group">
            <label className="lista-filtros__label">Cliente</label>
            <select
              className="lista-filtros__input"
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
            >
              <option value="">Todos</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.razon_social}
                </option>
              ))}
            </select>
          </div>

          <button
            className="lista-filtros__limpiar"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        {renderPendientes()}

        {isMobile ? (
          <div className="lista-scroll">
            <div className="d-flex flex-column gap-2">
              {facturasFiltradas.length === 0 ? (
                <p className="lista-vacio">
                  {hayFiltros
                    ? 'Sin resultados para los filtros aplicados'
                    : 'Sin facturas registradas'}
                </p>
              ) : (
                facturasFiltradas.map((factura) => (
                  <div
                    key={factura.id}
                    className={`lista-card ${
                      selectedFacturaId === factura.id
                        ? 'lista-card--selected'
                        : ''
                    }`}
                    style={{
                      '--lista-status':
                        ESTADO_COLORS[factura.estado] || '#6c757d',
                    }}
                    onClick={() =>
                      setSelectedFacturaId(
                        selectedFacturaId === factura.id ? null : factura.id,
                      )
                    }
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="lista-card__numero">
                            {factura.numero || `#${factura.id}`}
                          </h6>
                          {renderBadge(factura.estado)}
                        </div>
                        <small className="lista-card__dato">
                          {TIPO_LABELS[factura.tipo] || factura.tipo}
                          {' · '}
                          {getNombreCliente(factura.cliente_id)}
                        </small>
                        <small className="lista-card__dato">
                          {formatDate(factura.fecha)}
                          {' · '}
                          {factura.tipo === 'ANTICIPO'
                            ? 'Anticipo'
                            : `${(factura.remitos || []).length} remito(s)`}
                        </small>
                      </div>
                      {selectedFacturaId === factura.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="lista-box">
            <div className="lista-scroll">
              <table className="lista-table">
                <thead>
                  <tr>
                    <th>N° Factura</th>
                    <th>Tipo</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th className="text-end">Remitos</th>
                    <th className="text-end">Total</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="lista-vacio">
                        {hayFiltros
                          ? 'Sin resultados para los filtros aplicados'
                          : 'Sin facturas registradas'}
                      </td>
                    </tr>
                  ) : (
                    facturasFiltradas.map((factura) => (
                      <tr
                        key={factura.id}
                        className={`lista-table__row ${
                          selectedFacturaId === factura.id
                            ? 'lista-table__row--selected'
                            : ''
                        }`}
                        style={{
                          '--lista-status':
                            ESTADO_COLORS[factura.estado] || '#6c757d',
                        }}
                        onClick={() =>
                          setSelectedFacturaId(
                            selectedFacturaId === factura.id ? null : factura.id,
                          )
                        }
                      >
                        <td className="lista-table__numero">
                          {factura.numero || `#${factura.id}`}
                        </td>
                        <td>
                          <span className="lista-badge lista-badge--neutral">
                            {TIPO_LABELS[factura.tipo] || factura.tipo}
                          </span>
                        </td>
                        <td>{getNombreCliente(factura.cliente_id)}</td>
                        <td>{formatDate(factura.fecha)}</td>
                        <td className="text-end">
                          {factura.tipo === 'ANTICIPO'
                            ? '—'
                            : factura.remitos?.length || 0}
                        </td>
                        <td className="text-end">
                          {factura.tipo === 'ANTICIPO'
                            ? '—'
                            : totalFacturado(factura).toFixed(2)}
                        </td>
                        <td>{renderBadge(factura.estado)}</td>
                        <td className="text-end">
                          <div className="lista-acciones">
                            {factura.estado !== 'ANULADA' && isAdmin && (
                              <button
                                className="lista-btn lista-btn--icon lista-btn--danger"
                                title="Anular factura"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnular(factura);
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {facturaSeleccionada ? (
          <div className="mt-3">{renderDetalle()}</div>
        ) : (
          facturasFiltradas.length > 0 && (
            <div className="lista-box lista-placeholder mt-3">
              Seleccioná una factura para ver su detalle.
            </div>
          )
        )}
      </div>

      {modalFactura && (
        <ModalFactura
          clientes={clientes}
          clienteInicial={modalFactura.clienteId}
          remitoInicial={modalFactura.remito}
          fechaInicial={modalFactura.fecha}
          onClose={() => setModalFactura(null)}
          onSave={async () => {
            setModalFactura(null);
            await cargarDatos();
          }}
        />
      )}
    </div>
  );
};

export default Facturacion;
