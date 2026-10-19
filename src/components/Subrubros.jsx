import { useState, useEffect } from 'react';
import { Tags } from 'lucide-react';
import { allSubrubros, addSubrubro, upSubrubro, delSubrubro } from '../api/subrubros';
import { allRubros } from '../api/rubros';
import Spinner from './Spinner';
import ModalSubrubros from './ModalSubrubros';
import ModalEliminar from './ModalEliminar';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const Subrubros = () => {
  const [subrubros, setSubrubros] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [subrubroSeleccionado, setSubrubroSeleccionado] = useState(null);
  const [subrubroAEliminar, setSubrubroAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRubro, setFiltroRubro] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resSubrubros, resRubros] = await Promise.all([
        allSubrubros(),
        allRubros(),
      ]);
      setSubrubros(resSubrubros.data || []);
      setRubros(resRubros.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (subrubro) => {
    try {
      if (subrubro.id) {
        await upSubrubro(subrubro);
      } else {
        await addSubrubro(subrubro);
      }
      setIsOpen(false);
      setSubrubroSeleccionado(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar subrubro:', error);
      throw error;
    }
  };

  const handleEliminar = async () => {
    try {
      await delSubrubro(subrubroAEliminar.id);
      setShowConfirmarDelete(false);
      setSubrubroAEliminar(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar subrubro:', error);
    }
  };

  const handleToggleActivo = async (subrubro) => {
    try {
      await upSubrubro({ ...subrubro, activo: !subrubro.activo });
      await cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const subrubrosFiltrados = subrubros.filter((s) => {
    const matchSearch = s.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRubro = !filtroRubro || String(s.rubro_id) === filtroRubro;
    return matchSearch && matchRubro;
  });

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-header__title">
            <Tags size={22} className="page-header__icon" />
            Subrubros
          </h2>
          <p className="page-header__subtitle">
            {subrubros.length} subrubros registrados
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setSubrubroSeleccionado(null);
            setIsOpen(true);
          }}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
          {!isMobile && 'Nuevo Subrubro'}
        </button>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={filtroRubro}
            onChange={(e) => setFiltroRubro(e.target.value)}
          >
            <option value="">Todos los rubros</option>
            {rubros.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {subrubrosFiltrados.length === 0 ? (
            <p className="text-center text-muted py-4">Sin subrubros registrados</p>
          ) : (
            subrubrosFiltrados.map((subrubro) => (
              <div key={subrubro.id} className="card p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-0" style={{ fontWeight: 600 }}>{subrubro.nombre}</h6>
                    <small className="text-muted">{subrubro.rubro?.nombre || '-'}</small>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={subrubro.activo}
                        onChange={() => handleToggleActivo(subrubro)}
                      />
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setSubrubroSeleccionado(subrubro);
                        setIsOpen(true);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSubrubroAEliminar(subrubro);
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
                <th>Rubro</th>
                <th className="text-center">Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {subrubrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">Sin subrubros registrados</td>
                </tr>
              ) : (
                subrubrosFiltrados.map((subrubro) => (
                  <tr key={subrubro.id}>
                    <td>{subrubro.nombre}</td>
                    <td><small className="text-muted">{subrubro.rubro?.nombre || '-'}</small></td>
                    <td className="text-center">
                      <div className="form-check form-switch d-flex justify-content-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={subrubro.activo}
                          onChange={() => handleToggleActivo(subrubro)}
                        />
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setSubrubroSeleccionado(subrubro);
                          setIsOpen(true);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSubrubroAEliminar(subrubro);
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
        <ModalSubrubros
          subrubro={subrubroSeleccionado}
          rubros={rubros}
          onClose={() => {
            setIsOpen(false);
            setSubrubroSeleccionado(null);
          }}
          onSave={handleGuardar}
        />
      )}

      {showConfirmarDelete && (
        <ModalEliminar
          onConfirm={handleEliminar}
          onCancel={() => {
            setShowConfirmarDelete(false);
            setSubrubroAEliminar(null);
          }}
          nombre={subrubroAEliminar?.nombre}
        />
      )}
    </div>
  );
};

export default Subrubros;