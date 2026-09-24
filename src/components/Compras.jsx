import { useState, useEffect } from 'react';
import { allPurchases, addPurchase } from '../api/compras';
import { allProviders } from '../api/proveedores';
import { allWarehouses } from '../api/depositos';
import { allProducts, allPresentations } from '../api/productos';
import Spinner from './Spinner';
import ModalCompras from './ModalCompras';
import { useIsMobile } from '../hooks/useIsMobile';

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [comprasRes, proveedoresRes, depositosRes, productosRes, presentacionesRes] =
        await Promise.all([
          allPurchases(),
          allProviders(),
          allWarehouses(),
          allProducts(),
          allPresentations(),
        ]);
      setCompras(comprasRes.data);
      setProveedores(proveedoresRes.data);
      setDepositos(depositosRes.data);
      setProductos(productosRes.data);
      setPresentaciones(presentacionesRes.data);
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

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ fontWeight: 600, color: '#1a1a2e' }}>
            Compras
          </h2>
          <p className="text-muted mb-0">{compras.length} compras registradas</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
          {!isMobile && 'Nueva Compra'}
        </button>
      </div>

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {compras.length === 0 ? (
            <p className="text-center text-muted py-4">Sin compras registradas</p>
          ) : (
            compras.map((compra) => (
              <div key={compra.id} className="card p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1" style={{ fontWeight: 600 }}>
                      {getNombreProveedor(compra.provider_id)}
                    </h6>
                    <small className="text-muted">
                      Destinos: {getDestinosResumen(compra.items)}
                    </small>
                    <div>
                      <small className="text-muted">
                        Fecha: {formatDate(compra.purchase_date)}
                      </small>
                    </div>
                    {compra.items && (
                      <div>
                        <small className="text-muted">
                          {compra.items.length} ítem{compra.items.length !== 1 ? 's' : ''}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Proveedor</th>
                <th>Destinos</th>
                <th>Fecha</th>
                <th>Ítems</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {compras.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Sin compras registradas
                  </td>
                </tr>
              ) : (
                compras.map((compra) => (
                  <tr key={compra.id}>
                    <td>#{compra.id}</td>
                    <td>{getNombreProveedor(compra.provider_id)}</td>
                    <td>{getDestinosResumen(compra.items)}</td>
                    <td>{formatDate(compra.purchase_date)}</td>
                    <td>{compra.items?.length || 0}</td>
                    <td>{compra.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <ModalCompras
          proveedores={proveedores}
          depositos={depositos}
          productos={productos}
          presentaciones={presentaciones}
          onClose={() => setIsOpen(false)}
          onSave={handleGuardar}
        />
      )}
    </div>
  );
};

export default Compras;
