import { useState, useEffect } from 'react';
import { allProviders, addProvider, upProvider, delProvider } from '../api/proveedores';
import Spinner from './Spinner';
import ModalProveedores from './ModalProveedores';
import ModalEliminar from './ModalEliminar';
import { useIsMobile } from '../hooks/useIsMobile';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [onlyView, setOnlyView] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    getProveedores();
  }, []);

  const getProveedores = async () => {
    try {
      setLoading(true);
      const res = await allProviders();
      setProveedores(res.data);
    } catch (error) {
      console.error('Error al traer proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (proveedor) => {
    try {
      if (proveedor.id) {
        await upProvider(proveedor);
      } else {
        await addProvider(proveedor);
      }
      setIsOpen(false);
      setProveedorSeleccionado(null);
      await getProveedores();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      throw error;
    }
  };

  const handleEliminar = async () => {
    try {
      await delProvider(proveedorAEliminar.id);
      setShowConfirmarDelete(false);
      setProveedorAEliminar(null);
      await getProveedores();
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
    }
  };

  const proveedoresFiltrados = proveedores.filter(
    (p) =>
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cuit?.includes(searchTerm),
  );

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ fontWeight: 600, color: '#1a1a2e' }}>
            Proveedores
          </h2>
          <p className="text-muted mb-0">{proveedores.length} proveedores registrados</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setProveedorSeleccionado(null);
            setOnlyView(false);
            setIsOpen(true);
          }}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
          {!isMobile && 'Nuevo Proveedor'}
        </button>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre o CUIT..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {proveedoresFiltrados.map((proveedor) => (
            <div
              key={proveedor.id}
              className="card p-3"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setProveedorSeleccionado(proveedor);
                setOnlyView(true);
                setIsOpen(true);
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1" style={{ fontWeight: 600 }}>
                    {proveedor.nombre}
                  </h6>
                  {proveedor.cuit && (
                    <small className="text-muted">CUIT: {proveedor.cuit}</small>
                  )}
                  {proveedor.email && (
                    <div>
                      <small className="text-muted">{proveedor.email}</small>
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProveedorSeleccionado(proveedor);
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
                      setProveedorAEliminar(proveedor);
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
                <th>CUIT</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.map((proveedor) => (
                <tr
                  key={proveedor.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setProveedorSeleccionado(proveedor);
                    setOnlyView(true);
                    setIsOpen(true);
                  }}
                >
                  <td>{proveedor.nombre}</td>
                  <td>{proveedor.cuit || '—'}</td>
                  <td>{proveedor.email || '—'}</td>
                  <td>{proveedor.telefono || '—'}</td>
                  <td>
                    <span
                      className={`badge ${proveedor.activo ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {proveedor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProveedorSeleccionado(proveedor);
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
                        setProveedorAEliminar(proveedor);
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
        <ModalProveedores
          proveedor={proveedorSeleccionado}
          onlyView={onlyView}
          onClose={() => {
            setIsOpen(false);
            setProveedorSeleccionado(null);
          }}
          onSave={handleGuardar}
        />
      )}

      {showConfirmarDelete && (
        <ModalEliminar
          onConfirm={handleEliminar}
          onCancel={() => {
            setShowConfirmarDelete(false);
            setProveedorAEliminar(null);
          }}
          nombre={proveedorAEliminar?.nombre}
        />
      )}
    </div>
  );
};

export default Proveedores;
