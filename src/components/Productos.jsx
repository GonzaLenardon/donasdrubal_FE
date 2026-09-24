import { useState, useEffect } from 'react';
import { allProducts, addProduct, upProduct, delProduct } from '../api/productos';
import Spinner from './Spinner';
import ModalProductos from './ModalProductos';
import ModalEliminar from './ModalEliminar';
import { useIsMobile } from '../hooks/useIsMobile';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [onlyView, setOnlyView] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    getProductos();
  }, []);

  const getProductos = async () => {
    try {
      setLoading(true);
      const res = await allProducts();
      setProductos(res.data);
    } catch (error) {
      console.error('Error al traer productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (producto) => {
    try {
      if (producto.id) {
        await upProduct(producto);
      } else {
        await addProduct(producto);
      }
      setIsOpen(false);
      setProductoSeleccionado(null);
      await getProductos();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error;
    }
  };

  const handleEliminar = async () => {
    try {
      await delProduct(productoAEliminar.id);
      setShowConfirmarDelete(false);
      setProductoAEliminar(null);
      await getProductos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ fontWeight: 600, color: '#1a1a2e' }}>
            Productos
          </h2>
          <p className="text-muted mb-0">{productos.length} productos registrados</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setProductoSeleccionado(null);
            setOnlyView(false);
            setIsOpen(true);
          }}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
          {!isMobile && 'Nuevo Producto'}
        </button>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre o código..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {productosFiltrados.map((producto) => (
            <div
              key={producto.id}
              className="card p-3"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setProductoSeleccionado(producto);
                setOnlyView(true);
                setIsOpen(true);
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1" style={{ fontWeight: 600 }}>
                    {producto.nombre}
                  </h6>
                  <small className="text-muted">{producto.codigo}</small>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductoSeleccionado(producto);
                      setOnlyView(false);
                      setIsOpen(true);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductoAEliminar(producto);
                      setShowConfirmarDelete(true);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <tr
                  key={producto.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setProductoSeleccionado(producto);
                    setOnlyView(true);
                    setIsOpen(true);
                  }}
                >
                  <td>{producto.nombre}</td>
                  <td>{producto.codigo}</td>
                  <td>
                    <span
                      className={`badge ${producto.activo ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {producto.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductoSeleccionado(producto);
                        setOnlyView(false);
                        setIsOpen(true);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProductoAEliminar(producto);
                        setShowConfirmarDelete(true);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <ModalProductos
          producto={productoSeleccionado}
          onlyView={onlyView}
          onClose={() => {
            setIsOpen(false);
            setProductoSeleccionado(null);
          }}
          onSave={handleGuardar}
        />
      )}

      {showConfirmarDelete && (
        <ModalEliminar
          onConfirm={handleEliminar}
          onCancel={() => {
            setShowConfirmarDelete(false);
            setProductoAEliminar(null);
          }}
          nombre={productoAEliminar?.nombre}
        />
      )}
    </div>
  );
};

export default Productos;
