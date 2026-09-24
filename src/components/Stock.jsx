import { useState, useEffect } from 'react';
import { getAllStock } from '../api/stock';
import { allWarehouses } from '../api/depositos';
import { allProducts } from '../api/productos';
import Spinner from './Spinner';
import { useIsMobile } from '../hooks/useIsMobile';

const Stock = () => {
  const [stock, setStock] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDeposito, setFiltroDeposito] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [stockRes, depositosRes, productosRes] = await Promise.all([
        getAllStock(),
        allWarehouses(),
        allProducts(),
      ]);
      setStock(stockRes.data);
      setDepositos(depositosRes.data);
      setProductos(productosRes.data);
    } catch (error) {
      console.error('Error al cargar stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const stockFiltrado = stock.filter((s) => {
    if (filtroDeposito && s.warehouse_id !== parseInt(filtroDeposito)) return false;
    if (filtroProducto && s.product_id !== parseInt(filtroProducto)) return false;
    return true;
  });

  const getNombreDeposito = (id) => {
    const d = depositos.find((dep) => dep.id === id);
    return d ? `${d.nombre} (${d.codigo})` : `Depósito #${id}`;
  };

  const getProducto = (id) => productos.find((p) => p.id === id);

  const getNombreProducto = (id) => {
    const p = getProducto(id);
    return p ? p.nombre : `Producto #${id}`;
  };

  const formatLoteInfo = (item) => {
    const qty = parseFloat(item.quantity);
    const presentacion = item.lote?.presentacion;
    const unidadBase = presentacion?.unidadBase;
    const lotNumber = item.lote?.lot_number || `#${item.product_lot_id}`;
    const vencimiento = item.lote?.expiration_date
      ? `Vence: ${item.lote.expiration_date}`
      : '';

    if (presentacion && unidadBase && presentacion.cantidad_base) {
      const cantBase = parseFloat(presentacion.cantidad_base);
      const qtyPresentacion = qty / cantBase;
      return {
        stock: `${qtyPresentacion.toFixed(2)} ${presentacion.nombre}`,
        equivalencia: `= ${qty.toFixed(2)} ${unidadBase.nombre}`,
        lote: lotNumber,
        vencimiento,
      };
    }

    if (presentacion) {
      return {
        stock: `${qty.toFixed(2)} ${presentacion.nombre}`,
        equivalencia: null,
        lote: lotNumber,
        vencimiento,
      };
    }

    return {
      stock: qty.toFixed(2),
      equivalencia: null,
      lote: lotNumber,
      vencimiento,
    };
  };

  // Agrupar stock por producto
  const stockPorProducto = stockFiltrado.reduce((acc, item) => {
    const pid = item.product_id;
    if (!acc[pid]) {
      acc[pid] = {
        producto: getProducto(pid) || { id: pid, nombre: getNombreProducto(pid) },
        totalBase: 0,
        depositos: {},
      };
    }
    const qty = parseFloat(item.quantity);
    acc[pid].totalBase += qty;

    // Agrupar también por depósito
    const wid = item.warehouse_id;
    if (!acc[pid].depositos[wid]) {
      acc[pid].depositos[wid] = { deposito: getNombreDeposito(wid), total: 0, lotes: [] };
    }
    acc[pid].depositos[wid].total += qty;
    acc[pid].depositos[wid].lotes.push(item);

    return acc;
  }, {});

  // Obtener unidad base del primer lote con presentación
  const getUnidadBase = (producto) => {
    const p = producto;
    if (p?.presentacion?.unidadBase) return p.presentacion.unidadBase.nombre;
    // Buscar en el stock agrupado
    return null;
  };

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h2 className="mb-0" style={{ fontWeight: 600, color: '#1a1a2e' }}>
          Stock
        </h2>
        <p className="text-muted mb-0">Saldos por depósito, producto y lote</p>
      </div>

      <div className="row mb-3">
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={filtroDeposito}
            onChange={(e) => setFiltroDeposito(e.target.value)}
          >
            <option value="">Todos los depósitos</option>
            {depositos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} ({d.codigo})
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={filtroProducto}
            onChange={(e) => setFiltroProducto(e.target.value)}
          >
            <option value="">Todos los productos</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {Object.keys(stockPorProducto).length === 0 ? (
        <p className="text-center text-muted py-4">Sin stock registrado</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {Object.entries(stockPorProducto).map(([pid, data]) => {
            const unidadBase = getUnidadBase(data.producto);
            return (
              <div key={pid} className="card">
                <div
                  className="card-header d-flex justify-content-between align-items-center"
                  style={{ background: '#f8f9fa' }}
                >
                  <div>
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>
                      {data.producto.nombre}
                    </h6>
                    <small className="text-muted">{data.producto.codigo}</small>
                  </div>
                  <span className="badge bg-primary" style={{ fontSize: 14, padding: '6px 14px' }}>
                    Total: {data.totalBase.toFixed(2)} {unidadBase || 'unidades'}
                  </span>
                </div>
                <div className="card-body p-0">
                  {Object.entries(data.depositos).map(([wid, dep]) => (
                    <div key={wid} className="border-bottom p-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong style={{ fontSize: 13 }}>
                          <i className="bi bi-building me-1"></i>
                          {dep.deposito}
                        </strong>
                        <small className="text-muted">
                          Subtotal: {dep.total.toFixed(2)} {unidadBase || 'unidades'}
                        </small>
                      </div>
                      {isMobile ? (
                        <div className="d-flex flex-column gap-2">
                          {dep.lotes.map((item) => {
                            const info = formatLoteInfo(item);
                            return (
                              <div key={item.id} className="d-flex justify-content-between align-items-start p-2" style={{ background: '#fafafa', borderRadius: 6 }}>
                                <div>
                                  <small className="text-muted">Lote: {info.lote}</small>
                                  {info.vencimiento && (
                                    <div><small className="text-muted">{info.vencimiento}</small></div>
                                  )}
                                </div>
                                <div className="text-end">
                                  <strong style={{ fontSize: 14 }}>{info.stock}</strong>
                                  {info.equivalencia && (
                                    <div><small className="text-muted">{info.equivalencia}</small></div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Lote</th>
                              <th>Vencimiento</th>
                              <th className="text-end">Stock</th>
                              <th className="text-end">Equivalencia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dep.lotes.map((item) => {
                              const info = formatLoteInfo(item);
                              return (
                                <tr key={item.id}>
                                  <td>{info.lote}</td>
                                  <td className="text-muted">{info.vencimiento || '—'}</td>
                                  <td className="text-end">
                                    <strong>{info.stock}</strong>
                                  </td>
                                  <td className="text-end text-muted">
                                    {info.equivalencia || '—'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Stock;
