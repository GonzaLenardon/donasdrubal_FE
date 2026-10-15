import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { Form } from 'react-bootstrap';
import {
  allProducts,
  addProduct,
  upProduct,
  delProduct,
} from '../api/productos';
import { getFullRankings, addRanking, deleteRanking } from '../api/rankings';
import Spinner from './Spinner';
import ModalProductos from './ModalProductos';
import ModalEliminar from './ModalEliminar';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [onlyView, setOnlyView] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [showConfirmarDelete, setShowConfirmarDelete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    getDatos();
  }, []);

  const getDatos = async () => {
    try {
      setLoading(true);
      const [productosRes, rankingsRes] = await Promise.all([
        allProducts(),
        getFullRankings(),
      ]);
      setProductos(productosRes.data);
      setRankings(rankingsRes.data);
    } catch (error) {
      console.error('Error al traer datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductoActivo = (productId) => {
    const producto = productos.find(
      (p) => p.id === productId || p.id === Number(productId) || String(p.id) === String(productId),
    );
    return producto?.activo ?? true;
  };

  const toggleFavorito = async (
    productId,
    presentationId,
    currentRanking,
    rankingId,
  ) => {
    try {
      setSaving(true);
      if (currentRanking === 5) {
        if (rankingId) {
          await deleteRanking(rankingId);
        }
      } else {
        await addRanking({
          product_id: productId,
          product_presentation_id: presentationId,
          ranking: 5,
        });
      }
      const res = await getFullRankings();
      setRankings(res.data);
    } catch (error) {
      console.error('Error al togglear favorito:', error);
    } finally {
      setSaving(false);
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
      await getDatos();
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
      await getDatos();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const rankingsFiltrados = rankings.filter(
    (r) =>
      r.product_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product_codigo?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const groupedRankings = rankingsFiltrados.reduce((acc, item) => {
    if (!acc[item.product_id]) {
      acc[item.product_id] = {
        product_id: item.product_id,
        product_nombre: item.product_nombre,
        product_codigo: item.product_codigo,
        product_imagen: item.product_imagen,
        activo: getProductoActivo(item.product_id),
        presentations: [],
      };
    }
    acc[item.product_id].presentations.push(item);
    return acc;
  }, {});

  const groupedList = Object.values(groupedRankings);

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <style>{`
        .fav-switch.form-check-input:checked {
          background-color: #d4a000 !important;
          border-color: #d4a000 !important;
        }
        .fav-switch.form-check-input:focus {
          box-shadow: 0 0 0 0.25rem rgba(212, 160, 0, 0.25);
        }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="page-header__title">
            <Package size={22} className="page-header__icon" />
            Productos
          </h2>
          <p className="page-header__subtitle">
            {productos.length} productos registrados
          </p>
        </div>
        <div>
          <button
            className="btn-primary"
            onClick={() => {
              setProductoSeleccionado(null);
              setOnlyView(false);
              setIsOpen(true);
            }}
          >
            <i className="bi bi-plus-lg"></i>
            {!isMobile && 'Nuevo Producto'}
          </button>
        </div>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre o código..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {saving && (
        <div className="alert alert-info py-2 mb-3">Guardando favorito...</div>
      )}

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {groupedList.map((producto) =>
            producto.presentations.map((pres) => {
              const isFavorite = pres.ranking === 5;
              const hasPresentations = producto.presentations.length > 0;
              return (
                <div
                  key={`${producto.product_id}-${pres.presentation_id}`}
                  className="card p-3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setProductoSeleccionado({
                      id: producto.product_id,
                      nombre: producto.product_nombre,
                      codigo: producto.product_codigo,
                      imagen: producto.product_imagen,
                      activo: producto.activo,
                    });
                    setOnlyView(true);
                    setIsOpen(true);
                  }}
                >
                  <div className="d-flex gap-3 align-items-start">
                    {producto.product_imagen ? (
                      <img
                        src={producto.product_imagen}
                        alt={producto.product_nombre}
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
                      <h6 className="mb-1" style={{ fontWeight: 600 }}>
                        {producto.product_nombre}
                      </h6>
                      <small className="text-muted d-block">
                        {pres.presentation_nombre}
                      </small>
                      <small className="text-muted">
                        {producto.product_codigo}
                      </small>
                    </div>
                    {hasPresentations && (
                      <div
                        className="d-flex flex-column align-items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i
                          className={`bi ${isFavorite ? 'bi-star-fill' : 'bi-star'} text-warning`}
                          style={{ fontSize: '1.2rem' }}
                        ></i>
                        <Form.Check
                          type="switch"
                          className="fav-switch"
                          checked={isFavorite}
                          onChange={() =>
                            toggleFavorito(
                              producto.product_id,
                              pres.presentation_id,
                              pres.ranking || 0,
                              pres.ranking_id,
                            )
                          }
                          disabled={saving}
                          label=""
                          id={`fav-mobile-${producto.product_id}-${pres.presentation_id}`}
                          style={{ transform: 'scale(0.8)' }}
                        />
                      </div>
                    )}
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductoSeleccionado({
                            id: producto.product_id,
                            nombre: producto.product_nombre,
                            codigo: producto.product_codigo,
                            imagen: producto.product_imagen,
                            activo: producto.activo,
                          });
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
                          setProductoAEliminar({
                            id: producto.product_id,
                            nombre: producto.product_nombre,
                          });
                          setShowConfirmarDelete(true);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }),
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Imagen</th>
                <th>Producto</th>
                <th>Presentación</th>
                <th>Código</th>
                <th>Estado</th>
                <th style={{ width: '80px' }}>Favorito</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {groupedList.map((producto) =>
                producto.presentations.map((pres, idx) => {
                  const isFavorite = pres.ranking === 5;
                  const hasPresentations = producto.presentations.length > 0;
                  const isFirstPresentation = idx === 0;
                  const rowSpan = producto.presentations.length;

                  return (
                    <tr
                      key={`${producto.product_id}-${pres.presentation_id}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setProductoSeleccionado({
                          id: producto.product_id,
                          nombre: producto.product_nombre,
                          codigo: producto.product_codigo,
                          imagen: producto.product_imagen,
                          activo: producto.activo,
                        });
                        setOnlyView(true);
                        setIsOpen(true);
                      }}
                    >
                      {isFirstPresentation && (
                        <>
                          <td rowSpan={rowSpan}>
                            {producto.product_imagen ? (
                              <img
                                src={producto.product_imagen}
                                alt={producto.product_nombre}
                                style={{
                                  width: '40px',
                                  height: '40px',
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
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '4px',
                                }}
                              >
                                <i className="bi bi-image text-muted"></i>
                              </div>
                            )}
                          </td>
                          <td rowSpan={rowSpan}>{producto.product_nombre}</td>
                        </>
                      )}
                      <td>{pres.presentation_nombre}</td>
                      <td>{producto.product_codigo}</td>
                      <td>
                        <span
                          className={`badge ${producto.activo ? 'bg-success' : 'bg-danger'}`}
                        >
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hasPresentations ? (
                          <Form.Check
                            type="switch"
                            className="fav-switch"
                            checked={isFavorite}
                            onChange={() =>
                              toggleFavorito(
                                producto.product_id,
                                pres.presentation_id,
                                pres.ranking || 0,
                                pres.ranking_id,
                              )
                            }
                            disabled={saving}
                            label=""
                            id={`fav-table-${producto.product_id}-${pres.presentation_id}`}
                          />
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      {isFirstPresentation && (
                        <td rowSpan={rowSpan} className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductoSeleccionado({
                                id: producto.product_id,
                                nombre: producto.product_nombre,
                                codigo: producto.product_codigo,
                                imagen: producto.product_imagen,
                                activo: producto.activo,
                              });
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
                              setProductoAEliminar({
                                id: producto.product_id,
                                nombre: producto.product_nombre,
                              });
                              setShowConfirmarDelete(true);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                }),
              )}
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
