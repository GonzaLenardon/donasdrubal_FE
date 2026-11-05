import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  ClipboardList,
  Search,
  Info,
  Calendar,
  User,
  Warehouse,
  Pencil,
  X,
} from 'lucide-react';
import { allPurchases, addPurchase } from '../api/compras';
import { allProviders } from '../api/proveedores';
import { allWarehouses } from '../api/depositos';
import { getFullVariants } from '../api/productVariants';
import Spinner from './Spinner';
import ModalCompras from './ModalCompras';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const STATUS_ACCENT = '#1d5fb8';

const normalizar = (str) =>
  (str ?? '')
    .toString()
    .normalize('NFD')
    .split('')
    .filter((c) => c.charCodeAt(0) < 0x0300 || c.charCodeAt(0) > 0x036f)
    .join('')
    .toLowerCase();

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filtroId, setFiltroId] = useState('');
  const [filtroProveedor, setFiltroProveedor] = useState('');
  const [filtroDeposito, setFiltroDeposito] = useState('');
  const [inputProducto, setInputProducto] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const [selectedCompraId, setSelectedCompraId] = useState(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setBusquedaProducto(inputProducto), 300);
    return () => clearTimeout(timer);
  }, [inputProducto]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [
        comprasRes,
        proveedoresRes,
        depositosRes,
        variantesRes,
      ] = await Promise.all([
        allPurchases(),
        allProviders(),
        allWarehouses(),
        getFullVariants(),
      ]);
      setCompras(comprasRes.data);
      setProveedores(proveedoresRes.data);
      setDepositos(depositosRes.data);
      setVariantes(variantesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (compra) => {
    try {
      await addPurchase(compra);
      setIsOpen(false);
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar compra:', error);
      throw error;
    }
  };

  const getNombreProveedor = (id) => {
    const p = proveedores.find((pr) => pr.id === id);
    return p ? p.nombre : `Proveedor #${id}`;
  };

  const getNombreDeposito = (id) => {
    const d = depositos.find((dep) => dep.id === id);
    return d ? `${d.nombre} (${d.codigo})` : `Depósito #${id}`;
  };

  const getVariante = (id) => variantes.find((v) => v.id === id);

  const getNombreVariante = (id) => {
    const v = getVariante(id);
    if (!v) return `Variante #${id}`;
    return v.producto?.nombre || `Variante #${id}`;
  };

  const getDestinosResumen = (items) => {
    if (!items || items.length === 0) return '—';
    const destinos = [];
    items.forEach((item) => {
      item.destinos?.forEach((d) => {
        const nombre = getNombreDeposito(d.warehouse_id);
        if (!destinos.includes(nombre)) destinos.push(nombre);
      });
    });
    return destinos.length > 0 ? destinos.join(', ') : '—';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR');
  };

  const hayFiltros = Boolean(
    filtroId ||
      filtroProveedor ||
      filtroDeposito ||
      busquedaProducto ||
      filtroDesde ||
      filtroHasta,
  );

  const limpiarFiltros = () => {
    setFiltroId('');
    setFiltroProveedor('');
    setFiltroDeposito('');
    setInputProducto('');
    setBusquedaProducto('');
    setFiltroDesde('');
    setFiltroHasta('');
  };

  const comprasFiltradas = useMemo(() => {
    const queryProducto = normalizar(busquedaProducto.trim());
    const queryId = normalizar(filtroId.trim());
    const findVariante = (id) => variantes.find((v) => v.id === id);

    return compras.filter((compra) => {
      if (queryId && !normalizar(compra.id).includes(queryId)) return false;

      if (filtroProveedor && compra.provider_id !== Number(filtroProveedor))
        return false;

      if (filtroDeposito) {
        const depId = Number(filtroDeposito);
        const coincideDefault = compra.warehouse_id === depId;
        const coincideDestino = (compra.items || []).some((item) =>
          item.destinos?.some((d) => d.warehouse_id === depId),
        );
        if (!coincideDefault && !coincideDestino) return false;
      }

      if (queryProducto) {
        const coincideProducto = (compra.items || []).some((item) => {
          const variante = findVariante(item.product_variant_id);
          return (
            normalizar(variante?.producto?.nombre).includes(queryProducto) ||
            normalizar(variante?.codigo).includes(queryProducto) ||
            normalizar(variante?.presentacion?.nombre).includes(queryProducto)
          );
        });
        if (!coincideProducto) return false;
      }

      if (filtroDesde || filtroHasta) {
        const fecha = new Date(compra.purchase_date);
        if (filtroDesde && fecha < new Date(`${filtroDesde}T00:00:00`))
          return false;
        if (filtroHasta && fecha > new Date(`${filtroHasta}T23:59:59`))
          return false;
      }

      return true;
    });
  }, [
    compras,
    variantes,
    filtroId,
    filtroProveedor,
    filtroDeposito,
    busquedaProducto,
    filtroDesde,
    filtroHasta,
  ]);

  useEffect(() => {
    if (
      selectedCompraId &&
      !comprasFiltradas.some((c) => c.id === selectedCompraId)
    ) {
      setSelectedCompraId(null);
    }
  }, [comprasFiltradas, selectedCompraId]);

  const compraSeleccionada = compras.find((c) => c.id === selectedCompraId);

  const totalCantidad = (compraSeleccionada?.items || []).reduce(
    (acc, item) => acc + (parseFloat(item.quantity) || 0),
    0,
  );

  if (loading) return <Spinner />;

  const renderCompraDatos = () => (
    <div className="lista-box__body">
      <dl className="lista-kv">
        <dt>Proveedor</dt>
        <dd>{getNombreProveedor(compraSeleccionada.provider_id)}</dd>
        <dt>Fecha</dt>
        <dd>{formatDate(compraSeleccionada.purchase_date)}</dd>
        <dt>Depósito</dt>
        <dd>
          {compraSeleccionada.warehouse_id
            ? getNombreDeposito(compraSeleccionada.warehouse_id)
            : '—'}
        </dd>
      </dl>

      {compraSeleccionada.notes && (
        <div className="lista-note lista-note--warning">
          <Info size={14} />
          <span>{compraSeleccionada.notes}</span>
        </div>
      )}

      <table className="lista-items">
        <thead>
          <tr>
            <th>Artículo</th>
            <th>Lote</th>
            <th>Vencimiento</th>
            <th className="text-end">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {compraSeleccionada.items?.length > 0 ? (
            compraSeleccionada.items.map((item, idx) => {
              const variante = getVariante(item.product_variant_id);
              const lote = item.lotes?.[0];
              return (
                <tr key={item.id ?? idx}>
                  <td>
                    <span className="lista-items__nombre">
                      {getNombreVariante(item.product_variant_id)}
                    </span>
                    {variante?.presentacion && (
                      <span className="lista-badge lista-badge--neutral ms-2">
                        {variante.presentacion.nombre}
                      </span>
                    )}
                    {item.destinos?.length > 0 && (
                      <div className="lista-items__lotes">
                        {item.destinos
                          .map(
                            (d) =>
                              `${getNombreDeposito(d.warehouse_id)}: ${parseFloat(
                                d.quantity || 0,
                              ).toFixed(2)}`,
                          )
                          .join(' · ')}
                      </div>
                    )}
                  </td>
                  <td>{lote?.lot_number || '—'}</td>
                  <td>{lote?.expiration_date ? formatDate(lote.expiration_date) : '—'}</td>
                  <td className="text-end lista-items__cantidad">
                    {parseFloat(item.quantity || 0).toFixed(2)}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="lista-vacio">
                Sin ítems
              </td>
            </tr>
          )}
        </tbody>
        {compraSeleccionada.items?.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={3}>Total</td>
              <td className="text-end">{totalCantidad.toFixed(2)}</td>
            </tr>
          </tfoot>
        )}
      </table>

      <div className="lista-box__acciones">
        <button
          className="lista-btn lista-btn--primary"
          disabled
          title="Próximamente"
        >
          <Pencil size={14} /> Editar
        </button>
        <button
          className="lista-btn lista-btn--danger"
          disabled
          title="Próximamente"
        >
          <X size={14} /> Anular
        </button>
      </div>
    </div>
  );

  return (
    <div className="lista py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="page-header__title">
            <ShoppingCart size={22} className="page-header__icon" />
            Compras
          </h2>
          <p className="page-header__subtitle">
            {hayFiltros
              ? `${comprasFiltradas.length} de ${compras.length} compras`
              : `${compras.length} compras registradas`}
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsOpen(true)}>
          <i className="bi bi-plus-lg"></i>
          {!isMobile && 'Nueva Compra'}
        </button>
      </div>

      <div className="lista-surface">
        <div className="lista-surface__header">
          <h3 className="lista-surface__title">
            <ClipboardList size={16} />
            Registros
          </h3>
        </div>

        <div className="lista-filtros">
          <div className="lista-filtros__group">
            <label className="lista-filtros__label">ID</label>
            <input
              type="text"
              className="lista-filtros__input lista-filtros__input--numero"
              placeholder="0001"
              value={filtroId}
              onChange={(e) => setFiltroId(e.target.value)}
            />
          </div>

          <div className="lista-filtros__group lista-filtros__group--grow">
            <label className="lista-filtros__label">Producto</label>
            <div className="lista-filtros__search">
              <Search size={14} />
              <input
                type="text"
                className="lista-filtros__input"
                placeholder="Buscar por producto..."
                value={inputProducto}
                onChange={(e) => setInputProducto(e.target.value)}
              />
            </div>
          </div>

          <div className="lista-filtros__group">
            <label className="lista-filtros__label">Proveedor</label>
            <select
              className="lista-filtros__input"
              value={filtroProveedor}
              onChange={(e) => setFiltroProveedor(e.target.value)}
            >
              <option value="">Todos</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="lista-filtros__group">
            <label className="lista-filtros__label">Depósito</label>
            <select
              className="lista-filtros__input"
              value={filtroDeposito}
              onChange={(e) => setFiltroDeposito(e.target.value)}
            >
              <option value="">Todos</option>
              {depositos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} ({d.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="lista-filtros__group">
            <label className="lista-filtros__label">Desde</label>
            <input
              type="date"
              className="lista-filtros__input lista-filtros__input--fecha"
              value={filtroDesde}
              onChange={(e) => setFiltroDesde(e.target.value)}
            />
          </div>

          <div className="lista-filtros__group">
            <label className="lista-filtros__label">Hasta</label>
            <input
              type="date"
              className="lista-filtros__input lista-filtros__input--fecha"
              value={filtroHasta}
              onChange={(e) => setFiltroHasta(e.target.value)}
            />
          </div>

          <button
            className="lista-filtros__limpiar"
            onClick={limpiarFiltros}
            disabled={!hayFiltros}
          >
            Limpiar filtros
          </button>
        </div>

        {isMobile ? (
          <div className="lista-scroll">
            <div className="d-flex flex-column gap-2">
              {comprasFiltradas.length === 0 ? (
                <p className="lista-vacio">
                  {hayFiltros
                    ? 'Sin resultados para los filtros aplicados'
                    : 'Sin compras registradas'}
                </p>
              ) : (
                comprasFiltradas.map((compra) => (
                  <div
                    key={compra.id}
                    className={`lista-card ${
                      selectedCompraId === compra.id ? 'lista-card--selected' : ''
                    }`}
                    style={{ '--lista-status': STATUS_ACCENT }}
                    onClick={() => setSelectedCompraId(compra.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="lista-card__numero">
                            Compra #{compra.id}
                          </h6>
                        </div>
                        <small className="lista-card__dato">
                          <User size={12} />
                          {getNombreProveedor(compra.provider_id)}
                        </small>
                        <small className="lista-card__dato">
                          <Warehouse size={12} />
                          {getDestinosResumen(compra.items)}
                        </small>
                        <small className="lista-card__dato">
                          <Calendar size={12} />
                          {formatDate(compra.purchase_date)}
                        </small>
                        <small className="lista-card__dato">
                          {compra.items?.length || 0} ítem
                          {(compra.items?.length || 0) !== 1 ? 's' : ''}
                        </small>
                      </div>
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
                    <th>ID</th>
                    <th>Proveedor</th>
                    <th>Fecha</th>
                    <th>Ítems</th>
                    <th>Destinos</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="lista-vacio">
                        {hayFiltros
                          ? 'Sin resultados para los filtros aplicados'
                          : 'Sin compras registradas'}
                      </td>
                    </tr>
                  ) : (
                    comprasFiltradas.map((compra) => (
                      <tr
                        key={compra.id}
                        className={`lista-table__row ${
                          selectedCompraId === compra.id
                            ? 'lista-table__row--selected'
                            : ''
                        }`}
                        style={{ '--lista-status': STATUS_ACCENT }}
                        onClick={() => setSelectedCompraId(compra.id)}
                      >
                        <td className="lista-table__numero">#{compra.id}</td>
                        <td>{getNombreProveedor(compra.provider_id)}</td>
                        <td>{formatDate(compra.purchase_date)}</td>
                        <td>{compra.items?.length || 0}</td>
                        <td>{getDestinosResumen(compra.items)}</td>
                        <td>{compra.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedCompraId && compraSeleccionada ? (
          <div className="row g-2 lista-detalle">
            <div className="col-12">
              <div className="lista-box lista-box--fill">
                <div className="lista-box__header">
                  <h4 className="lista-box__title">
                    <ShoppingCart size={16} />
                    Compra #{compraSeleccionada.id}
                  </h4>
                  <button
                    className="lista-cerrar"
                    title="Cerrar detalle"
                    onClick={() => setSelectedCompraId(null)}
                  >
                    <X size={14} />
                  </button>
                </div>
                {renderCompraDatos()}
              </div>
            </div>
          </div>
        ) : (
          <div className="lista-box lista-placeholder">
            Seleccioná una compra para ver su detalle.
          </div>
        )}
      </div>

      {isOpen && (
        <ModalCompras
          proveedores={proveedores}
          depositos={depositos}
          variantes={variantes}
          onClose={() => setIsOpen(false)}
          onSave={handleGuardar}
        />
      )}
    </div>
  );
};

export default Compras;
