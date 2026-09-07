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

  const getStockInfo = (item) => {
    const producto = getProducto(item.product_id);
    const presentacion = producto?.presentacion;
    const unidadBase = presentacion?.unidadBase;
    const quantity = parseFloat(item.quantity);

    if (presentacion && unidadBase) {
      const equivalencia = quantity * parseFloat(presentacion.cantidad_base);
      return {
        stock: `${quantity.toFixed(2)} ${presentacion.nombre}`,
        equivalencia: `= ${equivalencia.toFixed(2)} ${unidadBase.nombre}`,
      };
    }

    if (presentacion) {
      return {
        stock: `${quantity.toFixed(2)} ${presentacion.nombre}`,
        equivalencia: null,
      };
    }

    return {
      stock: quantity.toFixed(2),
      equivalencia: null,
    };
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

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {stockFiltrado.length === 0 ? (
            <p className="text-center text-muted py-4">Sin stock registrado</p>
          ) : (
            stockFiltrado.map((item) => {
              const info = getStockInfo(item);
              return (
                <div key={item.id} className="card p-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1" style={{ fontWeight: 600 }}>
                        {getNombreProducto(item.product_id)}
                      </h6>
                      <small className="text-muted">
                        Depósito: {getNombreDeposito(item.warehouse_id)}
                      </small>
                      <div>
                        <small className="text-muted">
                          Lote: {item.lote?.lot_number || `#${item.product_lot_id}`}
                        </small>
                      </div>
                    </div>
                    <div className="text-end">
                      <span
                        className="badge bg-primary"
                        style={{ fontSize: 14, padding: '6px 12px' }}
                      >
                        {info.stock}
                      </span>
                      {info.equivalencia && (
                        <div>
                          <small className="text-muted">{info.equivalencia}</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Depósito</th>
                <th>Producto</th>
                <th>Lote</th>
                <th className="text-end">Stock</th>
                <th className="text-end">Equivalencia</th>
              </tr>
            </thead>
            <tbody>
              {stockFiltrado.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Sin stock registrado
                  </td>
                </tr>
              ) : (
                stockFiltrado.map((item) => {
                  const info = getStockInfo(item);
                  return (
                    <tr key={item.id}>
                      <td>{getNombreDeposito(item.warehouse_id)}</td>
                      <td>{getNombreProducto(item.product_id)}</td>
                      <td>{item.lote?.lot_number || `#${item.product_lot_id}`}</td>
                      <td className="text-end">
                        <strong>{info.stock}</strong>
                      </td>
                      <td className="text-end text-muted">
                        {info.equivalencia || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Stock;
