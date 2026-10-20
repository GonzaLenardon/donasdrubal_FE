import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import {
  getFullVariants,
  setRanking,
  toggleActivo,
} from '../api/productVariants';
import { allRubros, addRubro, upRubro, delRubro } from '../api/rubros';
import { addProduct, upProduct, delProduct } from '../api/productos';
import { addSubrubro } from '../api/subrubros';
import Spinner from './Spinner';
import ModalProductos from './ModalProductos';
import ModalEliminar from './ModalEliminar';
import ModalRubros from './ModalRubros';
import ModalSubrubros from './ModalSubrubros';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const Productos = () => {
  const [variantes, setVariantes] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRubro, setFiltroRubro] = useState('');
  const [filtroSubrubro, setFiltroSubrubro] = useState('');
  const isMobile = useIsMobile();

  // Modal Producto
  const [isOpenProducto, setIsOpenProducto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [onlyView, setOnlyView] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);

  // Modal Rubro
  const [isOpenRubro, setIsOpenRubro] = useState(false);
  const [rubroSeleccionado, setRubroSeleccionado] = useState(null);

  // Modal Subrubro
  const [isOpenSubrubro, setIsOpenSubrubro] = useState(false);
  const [subrubroSeleccionado, setSubrubroSeleccionado] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resVariantes, resRubros] = await Promise.all([
        getFullVariants(),
        allRubros(),
      ]);
      setVariantes(resVariantes.data || []);
      setRubros(resRubros.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarProducto = async (producto) => {
    try {
      let res;
      if (producto.id) {
        res = await upProduct(producto);
      } else {
        res = await addProduct(producto);
      }
      setIsOpenProducto(false);
      setProductoSeleccionado(null);
      await cargarDatos();
      return res.data;
    } catch (error) {
      console.error('Error al guardar producto:', error);
      throw error;
    }
  };

  const handleEliminarProducto = async () => {
    try {
      await delProduct(productoAEliminar.id);
      setShowConfirmarDelete(false);
      setProductoAEliminar(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleGuardarRubro = async (rubro) => {
    try {
      if (rubro.id) {
        await upRubro(rubro);
      } else {
        await addRubro(rubro);
      }
      setIsOpenRubro(false);
      setRubroSeleccionado(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar rubro:', error);
      throw error;
    }
  };

  const handleGuardarSubrubro = async (subrubro) => {
    try {
      await addSubrubro(subrubro);
      setIsOpenSubrubro(false);
      setSubrubroSeleccionado(null);
      await cargarDatos();
    } catch (error) {
      console.error('Error al guardar subrubro:', error);
      throw error;
    }
  };

  const handleToggleRanking = async (id, rankingActual) => {
    try {
      const nuevoRanking = rankingActual === 5 ? 0 : 5;
      await setRanking(id, nuevoRanking);
      setVariantes((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ranking: nuevoRanking } : v)),
      );
    } catch (error) {
      console.error('Error al cambiar ranking:', error);
    }
  };

  const handleToggleActivo = async (id) => {
    try {
      const res = await toggleActivo(id);
      setVariantes((prev) =>
        prev.map((v) => (v.id === id ? { ...v, activo: res.data.activo } : v)),
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const subrubrosFiltro = filtroRubro
    ? rubros.find((r) => String(r.id) === filtroRubro)?.subrubros || []
    : [];

  const variantesFiltradas = variantes.filter((v) => {
    const matchSearch =
      v.producto?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.producto?.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.presentacion?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRubro =
      !filtroRubro || String(v.producto?.rubro_id) === filtroRubro;
    const matchSubrubro =
      !filtroSubrubro || String(v.producto?.subrubro_id) === filtroSubrubro;
    return matchSearch && matchRubro && matchSubrubro;
  });

  const renderStars = (ranking) => {
    return [...Array(1)].map((_, i) => (
      <i
        key={i}
        className={`bi ${i < ranking ? 'bi-star-fill' : 'bi-star'} text-warning`}
        style={{ fontSize: '1.25rem' }}
      ></i>
    ));
  };

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-header__title">
            <Package size={22} className="page-header__icon" />
            Productos
          </h2>
          <p className="page-header__subtitle">
            {variantesFiltradas.length} variantes
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => {
              setRubroSeleccionado(null);
              setIsOpenRubro(true);
            }}
          >
            <i className="bi bi-tag" style={{ fontSize: 13 }}></i>
            {!isMobile && 'Nuevo Rubro'}
          </button>
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={() => {
              setSubrubroSeleccionado(null);
              setIsOpenSubrubro(true);
            }}
          >
            <i className="bi bi-tags" style={{ fontSize: 13 }}></i>
            {!isMobile && 'Nuevo Subrubro'}
          </button>
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => {
              setProductoSeleccionado(null);
              setOnlyView(false);
              setIsOpenProducto(true);
            }}
          >
            <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
            {!isMobile && 'Nuevo Producto'}
          </button>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filtroRubro}
            onChange={(e) => {
              setFiltroRubro(e.target.value);
              setFiltroSubrubro('');
            }}
          >
            <option value="">Todos los rubros</option>
            {rubros.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filtroSubrubro}
            onChange={(e) => setFiltroSubrubro(e.target.value)}
            disabled={!filtroRubro}
          >
            <option value="">Todos los subrubros</option>
            {subrubrosFiltro.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {variantesFiltradas.map((v) => (
            <div key={v.id} className="card p-3">
              <div className="d-flex gap-3 align-items-start">
                {v.producto?.imagen ? (
                  <img
                    src={v.producto.imagen}
                    alt={v.producto.nombre}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '4px',
                    }}
                  >
                    <i className="bi bi-image text-muted"></i>
                  </div>
                )}
                <div className="flex-grow-1">
                  <h6 className="mb-0" style={{ fontWeight: 600 }}>
                    {v.producto?.nombre}
                  </h6>
                  <small className="text-muted">{v.codigo}</small>
                  <div className="mt-1">
                    <span className="badge bg-info">
                      {v.presentacion?.nombre}
                    </span>
                  </div>
                  {v.producto?.rubro && (
                    <small className="text-muted d-block mt-1">
                      {v.producto.rubro.nombre}
                      {v.producto.subrubro &&
                        ` / ${v.producto.subrubro.nombre}`}
                    </small>
                  )}
                </div>
                <div className="d-flex flex-column align-items-end gap-1">
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleToggleRanking(v.id, v.ranking)}
                  >
                    {renderStars(v.ranking)}
                  </div>
                  <div className="d-flex gap-1 align-items-center">
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={v.activo}
                        onChange={() => handleToggleActivo(v.id)}
                      />
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setProductoSeleccionado({ ...v.producto });
                        setOnlyView(false);
                        setIsOpenProducto(true);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  </div>
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
                <th style={{ width: '50px' }}>Img</th>
                <th>Producto</th>
                <th>Código</th>
                <th>Presentación</th>
                <th>Rubro</th>
                <th>Subrubro</th>
                <th className="text-center">Ranking</th>
                <th className="text-center">Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {variantesFiltradas.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.producto?.imagen ? (
                      <img
                        src={v.producto.imagen}
                        alt={v.producto.nombre}
                        style={{
                          width: '35px',
                          height: '35px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{
                          width: '35px',
                          height: '35px',
                          borderRadius: '4px',
                        }}
                      >
                        <i
                          className="bi bi-image text-muted"
                          style={{ fontSize: '0.8rem' }}
                        ></i>
                      </div>
                    )}
                  </td>
                  <td>{v.producto?.nombre}</td>
                  <td>
                    <small className="text-muted">{v.codigo}</small>
                  </td>
                  <td>
                    <span className="badge bg-info">
                      {v.presentacion?.nombre}
                    </span>
                  </td>
                  <td>
                    <small>{v.producto?.rubro?.nombre || '-'}</small>
                  </td>
                  <td>
                    <small>{v.producto?.subrubro?.nombre || '-'}</small>
                  </td>
                  <td className="text-center">
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleToggleRanking(v.id, v.ranking)}
                    >
                      {renderStars(v.ranking)}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="form-check form-switch d-flex justify-content-center">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={v.activo}
                        onChange={() => handleToggleActivo(v.id)}
                      />
                    </div>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => {
                        setProductoSeleccionado({ ...v.producto });
                        setOnlyView(false);
                        setIsOpenProducto(true);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setProductoAEliminar(v.producto);
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

      {variantesFiltradas.length === 0 && (
        <p className="text-center text-muted py-4">
          No se encontraron variantes
        </p>
      )}

      {isOpenProducto && (
        <ModalProductos
          producto={productoSeleccionado}
          onlyView={onlyView}
          onClose={() => {
            setIsOpenProducto(false);
            setProductoSeleccionado(null);
          }}
          onSave={handleGuardarProducto}
        />
      )}

      {showConfirmarDelete && (
        <ModalEliminar
          onConfirm={handleEliminarProducto}
          onCancel={() => {
            setShowConfirmarDelete(false);
            setProductoAEliminar(null);
          }}
          nombre={productoAEliminar?.nombre}
        />
      )}

      {isOpenRubro && (
        <ModalRubros
          rubro={rubroSeleccionado}
          onClose={() => {
            setIsOpenRubro(false);
            setRubroSeleccionado(null);
          }}
          onSave={handleGuardarRubro}
        />
      )}

      {isOpenSubrubro && (
        <ModalSubrubros
          subrubro={subrubroSeleccionado}
          rubros={rubros}
          onClose={() => {
            setIsOpenSubrubro(false);
            setSubrubroSeleccionado(null);
          }}
          onSave={handleGuardarSubrubro}
        />
      )}
    </div>
  );
};

export default Productos;
