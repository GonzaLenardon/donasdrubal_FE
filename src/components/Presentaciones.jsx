import { useState, useEffect } from 'react';
import {
  allPresentations,
  addPresentation,
  upPresentation,
  delPresentation,
} from '../api/productos';
import Spinner from './Spinner';
import ModalPresentaciones from './ModalPresentaciones';
import ModalEliminar from './ModalEliminar';
import { useIsMobile } from '../hooks/useIsMobile';

const Presentaciones = () => {
  const [presentaciones, setPresentaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);
  const [onlyView, setOnlyView] = useState(false);
  const [presentacionAEliminar, setPresentacionAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    getPresentaciones();
  }, []);

  const getPresentaciones = async () => {
    try {
      setLoading(true);
      const res = await allPresentations();
      setPresentaciones(res.data);
    } catch (error) {
      console.error('Error al traer presentaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (presentacion) => {
    try {
      if (presentacion.id) {
        await upPresentation(presentacion);
      } else {
        await addPresentation(presentacion);
      }
      setIsOpen(false);
      setPresentacionSeleccionada(null);
      await getPresentaciones();
    } catch (error) {
      console.error('Error al guardar presentación:', error);
      throw error;
    }
  };

  const handleEliminar = async () => {
    try {
      await delPresentation(presentacionAEliminar.id);
      setShowConfirmarDelete(false);
      setPresentacionAEliminar(null);
      await getPresentaciones();
    } catch (error) {
      console.error('Error al eliminar presentación:', error);
    }
  };

  const getPresentacionLabel = (p) => {
    if (p.unidadBase) {
      return `${p.nombre} (${p.cantidad_base} ${p.unidadBase.nombre})`;
    }
    return p.nombre;
  };

  const presentacionesFiltradas = presentaciones.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ fontWeight: 600, color: '#1a1a2e' }}>
            Presentaciones
          </h2>
          <p className="text-muted mb-0">
            {presentaciones.length} presentaciones registradas
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => {
            setPresentacionSeleccionada(null);
            setOnlyView(false);
            setIsOpen(true);
          }}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
          {!isMobile && 'Nueva Presentación'}
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
          {presentacionesFiltradas.length === 0 ? (
            <p className="text-center text-muted py-4">
              Sin presentaciones registradas
            </p>
          ) : (
            presentacionesFiltradas.map((presentacion) => (
              <div
                key={presentacion.id}
                className="card p-3"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setPresentacionSeleccionada(presentacion);
                  setOnlyView(true);
                  setIsOpen(true);
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1" style={{ fontWeight: 600 }}>
                      {presentacion.nombre}
                    </h6>
                    {presentacion.unidadBase && (
                      <small className="text-muted">
                        Equivale a {presentacion.cantidad_base}{' '}
                        {presentacion.unidadBase.nombre}
                      </small>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPresentacionSeleccionada(presentacion);
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
                        setPresentacionAEliminar(presentacion);
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
                <th>Unidad Base</th>
                <th>Cantidad Base</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {presentacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    Sin presentaciones registradas
                  </td>
                </tr>
              ) : (
                presentacionesFiltradas.map((presentacion) => (
                  <tr
                    key={presentacion.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setPresentacionSeleccionada(presentacion);
                      setOnlyView(true);
                      setIsOpen(true);
                    }}
                  >
                    <td>{presentacion.nombre}</td>
                    <td>{presentacion.unidadBase?.nombre || '—'}</td>
                    <td>{presentacion.cantidad_base || '—'}</td>
                    <td>
                      <span
                        className={`badge ${presentacion.activo ? 'bg-success' : 'bg-secondary'}`}
                      >
                        {presentacion.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPresentacionSeleccionada(presentacion);
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
                          setPresentacionAEliminar(presentacion);
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
        <ModalPresentaciones
          presentacion={presentacionSeleccionada}
          presentaciones={presentaciones}
          onlyView={onlyView}
          onClose={() => {
            setIsOpen(false);
            setPresentacionSeleccionada(null);
          }}
          onSave={handleGuardar}
        />
      )}

      {showConfirmarDelete && (
        <ModalEliminar
          onConfirm={handleEliminar}
          onCancel={() => {
            setShowConfirmarDelete(false);
            setPresentacionAEliminar(null);
          }}
          nombre={presentacionAEliminar?.nombre}
        />
      )}
    </div>
  );
};

export default Presentaciones;
