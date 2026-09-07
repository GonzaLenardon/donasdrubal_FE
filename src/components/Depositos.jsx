import { useState, useEffect } from 'react';
import { allWarehouses, addWarehouse, upWarehouse, delWarehouse } from '../api/depositos';
import Spinner from './Spinner';
import ModalDepositos from './ModalDepositos';
import ModalEliminar from './ModalEliminar';
import { useIsMobile } from '../hooks/useIsMobile';

const Depositos = () => {
  const [depositos, setDepositos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [depositoSeleccionado, setDepositoSeleccionado] = useState(null);
  const [onlyView, setOnlyView] = useState(false);
  const [depositoAEliminar, setDepositoAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    getDepositos();
  }, []);

  const getDepositos = async () => {
    try {
      setLoading(true);
      const res = await allWarehouses();
      setDepositos(res.data);
    } catch (error) {
      console.error('Error al traer depósitos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (deposito) => {
    try {
      if (deposito.id) {
        await upWarehouse(deposito);
      } else {
        await addWarehouse(deposito);
      }
      setIsOpen(false);
      setDepositoSeleccionado(null);
      await getDepositos();
    } catch (error) {
      console.error('Error al guardar depósito:', error);
      throw error;
    }
  };

  const handleEliminar = async () => {
    try {
      await delWarehouse(depositoAEliminar.id);
      setShowConfirmarDelete(false);
      setDepositoAEliminar(null);
      await getDepositos();
    } catch (error) {
      console.error('Error al eliminar depósito:', error);
    }
  };

  const depositosFiltrados = depositos.filter(
    (d) =>
      d.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.codigo?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ fontWeight: 600, color: '#1a1a2e' }}>
            Depósitos
          </h2>
          <p className="text-muted mb-0">{depositos.length} depósitos registrados</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setDepositoSeleccionado(null);
            setOnlyView(false);
            setIsOpen(true);
          }}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
          {!isMobile && 'Nuevo Depósito'}
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
          {depositosFiltrados.map((deposito) => (
            <div
              key={deposito.id}
              className="card p-3"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setDepositoSeleccionado(deposito);
                setOnlyView(true);
                setIsOpen(true);
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="mb-1" style={{ fontWeight: 600 }}>
                    {deposito.nombre}
                  </h6>
                  <small className="text-muted">Cód: {deposito.codigo}</small>
                  {deposito.direccion && (
                    <div>
                      <small className="text-muted">{deposito.direccion}</small>
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDepositoSeleccionado(deposito);
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
                      setDepositoAEliminar(deposito);
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
                <th>Dirección</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {depositosFiltrados.map((deposito) => (
                <tr
                  key={deposito.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setDepositoSeleccionado(deposito);
                    setOnlyView(true);
                    setIsOpen(true);
                  }}
                >
                  <td>{deposito.nombre}</td>
                  <td>{deposito.codigo}</td>
                  <td>{deposito.direccion || '—'}</td>
                  <td>
                    <span
                      className={`badge ${deposito.activo ? 'bg-success' : 'bg-secondary'}`}
                    >
                      {deposito.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDepositoSeleccionado(deposito);
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
                        setDepositoAEliminar(deposito);
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
        <ModalDepositos
          deposito={depositoSeleccionado}
          onlyView={onlyView}
          onClose={() => {
            setIsOpen(false);
            setDepositoSeleccionado(null);
          }}
          onSave={handleGuardar}
        />
      )}

      {showConfirmarDelete && (
        <ModalEliminar
          onConfirm={handleEliminar}
          onCancel={() => {
            setShowConfirmarDelete(false);
            setDepositoAEliminar(null);
          }}
          nombre={depositoAEliminar?.nombre}
        />
      )}
    </div>
  );
};

export default Depositos;
