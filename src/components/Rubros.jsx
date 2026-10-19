import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { allRubros, addRubro, upRubro, delRubro } from '../api/rubros';
import Spinner from './Spinner';
import ModalRubros from './ModalRubros';
import ModalEliminar from './ModalEliminar';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const Rubros = () => {
  const [rubros, setRubros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);
  const [rubroAEliminar, setRubroAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    getRubros();
  }, []);

  const getRubros = async () => {
    try {
      setLoading(true);
      const res = await allRubros();
      setRubros(res.data);
    } catch (error) {
      console.error('Error al traer rubros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (rubro) => {
    try {
      if (rubro.id) {
        await upRubro(rubro);
      } else {
        await addRubro(rubro);
      }
      setIsOpen(false);
      setRubroSeleccionado(null);
      await getRubros();
    } catch (error) {
      console.error('Error al guardar rubro:', error);
      throw error;
    }
  };

  const handleEliminar = async () => {
    try {
      await delRubro(rubroAEliminar.id);
      setShowConfirmarDelete(false);
      setRubroAEliminar(null);
      await getRubros();
    } catch (error) {
      console.error('Error al eliminar rubro:', error);
    }
  };

  const handleToggleActivo = async (rubro) => {
    try {
      await upRubro({ ...rubro, activo: !rubro.activo });
      await getRubros();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const rubrosFiltrados = rubros.filter((r) =>
    r.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-header__title">
            <Tag size={22} className="page-header__icon" />
            Rubros
          </h2>
          <p className="page-header__subtitle">
            {rubros.length} rubros registrados
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setRubroSeleccionado(null);
            setIsOpen(true);
          }}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
          {!isMobile && 'Nuevo Rubro'}
        </button>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {rubrosFiltrados.length === 0 ? (
            <p className="text-center text-muted py-4">Sin rubros registrados</p>
          ) : (
            rubrosFiltrados.map((rubro) => (
              <div key={rubro.id} className="card p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>{rubro.nombre}</h6>
                    <small className="text-muted">{rubro.subrubros?.length || 0} subrubros</small>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={rubro.activo}
                        onChange={() => handleToggleActivo(rubro)}
                      />
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setRubroSeleccionado(rubro);
                        setIsOpen(true);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setRubroAEliminar(rubro);
                        setShowConfirmarDelete(true);
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
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
                <th>Nombre</th>
                <th>Subrubros</th>
                <th className="text-center">Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rubrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">Sin rubros registrados</td>
                </tr>
              ) : (
                rubrosFiltrados.map((rubro) => (
                  <tr key={rubro.id}>
                    <td>{rubro.nombre}</td>
                    <td><small className="text-muted">{rubro.subrubros?.length || 0}</small></td>
                    <td className="text-center">
                      <div className="form-check form-switch d-flex justify-content-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={rubro.activo}
                          onChange={() => handleToggleActivo(rubro)}
                        />
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setRubroSeleccionado(rubro);
                          setIsOpen(true);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setRubroAEliminar(rubro);
                          setShowConfirmarDelete(true);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <ModalRubros
          rubro={rubroSeleccionado}
          onClose={() => {
            setIsOpen(false);
            setRubroSeleccionado(null);
          }}
          onSave={handleGuardar}
        />
      )}

      {showConfirmarDelete && (
        <ModalEliminar
          onConfirm={handleEliminar}
          onCancel={() => {
            setShowConfirmarDelete(false);
            setRubroAEliminar(null);
          }}
          nombre={rubroAEliminar?.nombre}
        />
      )}
    </div>
  );
};

export default Rubros;