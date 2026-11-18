import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import {
  addProductBrand,
  allProductBrands,
  delProductBrand,
  upProductBrand,
} from '../api/productBrands';
import Spinner from './Spinner';
import ModalEliminar from './ModalEliminar';
import ModalMarcas from './ModalMarcas';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const Marcas = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(null);
  const [marcaAEliminar, setMarcaAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    cargarMarcas();
  }, []);

  const cargarMarcas = async () => {
    try {
      setLoading(true);
      const res = await allProductBrands();
      setMarcas(res.data || []);
    } catch (error) {
      console.error('Error al traer marcas de productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async (marca) => {
    try {
      if (marca.id) {
        await upProductBrand(marca);
      } else {
        await addProductBrand(marca);
      }
      setIsOpen(false);
      setMarcaSeleccionada(null);
      await cargarMarcas();
    } catch (error) {
      console.error('Error al guardar marca:', error);
      throw error;
    }
  };

  const handleEliminar = async () => {
    try {
      await delProductBrand(marcaAEliminar.id);
      setShowConfirmarDelete(false);
      setMarcaAEliminar(null);
      await cargarMarcas();
    } catch (error) {
      console.error('Error al desactivar marca:', error);
    }
  };

  const handleToggleActivo = async (marca) => {
    try {
      await upProductBrand({ ...marca, activo: !marca.activo });
      await cargarMarcas();
    } catch (error) {
      console.error('Error al cambiar estado de marca:', error);
    }
  };

  const marcasFiltradas = marcas.filter((marca) =>
    marca.nombre?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-header__title">
            <Tag size={22} className="page-header__icon" />
            Marcas de productos
          </h2>
          <p className="page-header__subtitle">
            {marcas.length} marcas registradas
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setMarcaSeleccionada(null);
            setIsOpen(true);
          }}
        >
          <i className="bi bi-plus-lg"></i>
          {!isMobile && 'Nueva Marca'}
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
          {marcasFiltradas.length === 0 ? (
            <p className="text-center text-muted py-4">Sin marcas registradas</p>
          ) : (
            marcasFiltradas.map((marca) => (
              <div key={marca.id} className="card p-3">
                <div className="d-flex justify-content-between align-items-center gap-2">
                  <span>{marca.nombre}</span>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={marca.activo}
                        onChange={() => handleToggleActivo(marca)}
                      />
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      aria-label={`Editar ${marca.nombre}`}
                      onClick={() => {
                        setMarcaSeleccionada(marca);
                        setIsOpen(true);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      aria-label={`Desactivar ${marca.nombre}`}
                      onClick={() => {
                        setMarcaAEliminar(marca);
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
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted py-4">
                    Sin marcas registradas
                  </td>
                </tr>
              ) : (
                marcasFiltradas.map((marca) => (
                  <tr key={marca.id}>
                    <td>{marca.nombre}</td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={marca.activo}
                          onChange={() => handleToggleActivo(marca)}
                        />
                      </div>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setMarcaSeleccionada(marca);
                          setIsOpen(true);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setMarcaAEliminar(marca);
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
        <ModalMarcas
          marca={marcaSeleccionada}
          onClose={() => {
            setIsOpen(false);
            setMarcaSeleccionada(null);
          }}
          onSave={handleGuardar}
        />
      )}

      {showConfirmarDelete && (
        <ModalEliminar
          onConfirm={handleEliminar}
          onCancel={() => {
            setShowConfirmarDelete(false);
            setMarcaAEliminar(null);
          }}
          nombre={marcaAEliminar?.nombre}
        />
      )}
    </div>
  );
};

export default Marcas;
