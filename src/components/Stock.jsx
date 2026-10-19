import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { getAllStock } from '../api/stock';
import { allWarehouses } from '../api/depositos';
import { getFullVariants } from '../api/productVariants';
import Spinner from './Spinner';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const Stock = () => {
  const [stock, setStock] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDeposito, setFiltroDeposito] = useState('');
  const [filtroVariante, setFiltroVariante] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [stockRes, depositosRes, variantesRes] = await Promise.all([
        getAllStock(),
        allWarehouses(),
        getFullVariants(),
      ]);
      setStock(stockRes.data);
      setDepositos(depositosRes.data);
      setVariantes(variantesRes.data);
    } catch (error) {
      console.error('Error al cargar stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const stockFiltrado = stock.filter((s) => {
    if (filtroDeposito && s.warehouse_id !== parseInt(filtroDeposito)) return false;
    if (filtroVariante && s.lote?.product_variant_id !== parseInt(filtroVariante)) return false;
    return true;
  });

  const getNombreDeposito = (id) => {
    const d = depositos.find((dep) => dep.id === id);
    return d ? `${d.nombre} (${d.codigo})` : `Depósito #${id}`;
  };

  const getVariante = (id) => variantes.find((v) => v.id === id);

  const formatLoteInfo = (item) => {
    const qty = parseFloat(item.quantity);
    const variante = item.lote?.variante;
    const presentacion = variante?.presentacion;
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

  // Agrupar stock por variante
  const stockPorVariante = stockFiltrado.reduce((acc, item) => {
    const vid = item.lote?.product_variant_id;
    if (!vid) return acc;

    if (!acc[vid]) {
      const variante = getVariante(vid);
      acc[vid] = {
        variante: variante || { id: vid, codigo: `Variante #${vid}` },
        totalBase: 0,
        depositos: {},
      };
    }
    const qty = parseFloat(item.quantity);
    acc[vid].totalBase += qty;

    // Agrupar también por depósito
    const wid = item.warehouse_id;
    if (!acc[vid].depositos[wid]) {
      acc[vid].depositos[wid] = { deposito: getNombreDeposito(wid), total: 0, lotes: [] };
    }
    acc[vid].depositos[wid].total += qty;
    acc[vid].depositos[wid].lotes.push(item);

    return acc;
  }, {});

  // Obtener unidad base del primer lote con presentación
  const getUnidadBase = (varianteData) => {
    for (const dep of Object.values(varianteData.depositos)) {
      for (const lote of dep.lotes) {
        const unidadBase = lote.lote?.variante?.presentacion?.unidadBase?.nombre;
        if (unidadBase) return unidadBase;
      }
    }
    return '';
  };

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-header__title">
            <Package size={22} className="page-header__icon" />
            Stock
          </h2>
          <p className="page-header__subtitle">
            {Object.keys(stockPorVariante).length} variantes con stock
          </p>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <select
            className="form-select"
            value={filtroDeposito}
            onChange={(e) => setFiltroDeposito(e.target.value)}
          >
            <option value="">Todos los depósitos</option>
            {depositos.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre} ({d.codigo})</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filtroVariante}
            onChange={(e) => setFiltroVariante(e.target.value)}
          >
            <option value="">Todas las variantes</option>
            {variantes.map((v) => (
              <option key={v.id} value={v.id}>{v.codigo} - {v.presentacion?.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {Object.entries(stockPorVariante).map(([vid, data]) => {
            const unidadBase = getUnidadBase(data);
            return (
              <div key={vid} className="card p-3">
                <h6 className="mb-1" style={{ fontWeight: 600 }}>
                  {data.variante.producto?.nombre || data.variante.codigo}
                </h6>
                <small className="text-muted">
                  {data.variante.codigo} - {data.variante.presentacion?.nombre || 'Sin presentación'}
                </small>
                <div className="mt-2">
                  <strong>
                    {data.totalBase.toFixed(2)} {unidadBase}
                  </strong>
                </div>
                {Object.entries(data.depositos).map(([wid, dep]) => (
                  <div key={wid} className="mt-1">
                    <small className="text-muted">{dep.deposito}: {dep.total.toFixed(2)}</small>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Variante</th>
                <th>Presentación</th>
                <th>Depósito</th>
                <th className="text-end">Stock</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stockPorVariante).map(([vid, data]) => {
                const unidadBase = getUnidadBase(data);
                const depEntries = Object.entries(data.depositos);
                return depEntries.map(([wid, dep], idx) => (
                  <tr key={`${vid}_${wid}`}>
                    {idx === 0 && (
                      <>
                        <td rowSpan={depEntries.length}>
                          <strong>{data.variante.producto?.nombre || data.variante.codigo}</strong>
                          <br />
                          <small className="text-muted">{data.variante.codigo}</small>
                        </td>
                        <td rowSpan={depEntries.length}>
                          {data.variante.presentacion?.nombre || '-'}
                        </td>
                      </>
                    )}
                    <td>{dep.deposito}</td>
                    <td className="text-end">
                      {dep.total.toFixed(2)} {unidadBase}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}

      {Object.keys(stockPorVariante).length === 0 && (
        <p className="text-center text-muted py-4">No hay stock disponible</p>
      )}
    </div>
  );
};

export default Stock;