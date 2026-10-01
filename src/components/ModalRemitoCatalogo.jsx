import { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { addRemito, getCatalogo } from '../api/remitos';

const ModalRemitoCatalogo = ({ depositos, clientes, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: 'OFICIAL',
    origin_warehouse_id: '',
    destination_client_id: '',
    notes: '',
  });
  const [catalogo, setCatalogo] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (form.origin_warehouse_id) {
      cargarCatalogo();
    }
  }, [form.origin_warehouse_id]);

  const cargarCatalogo = async () => {
    try {
      setLoadingCatalogo(true);
      const res = await getCatalogo(form.origin_warehouse_id);
      setCatalogo(res.data || []);
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
    } finally {
      setLoadingCatalogo(false);
    }
  };

  const favoritos = catalogo.filter((item) => item.ranking === 5);
  const otros = catalogo.filter((item) => item.ranking < 5 && item.ranking > 0);
  const sinClasificar = catalogo.filter((item) => item.ranking === 0);

  const agregarAlCarrito = (item, cantidad) => {
    const existe = carrito.find(
      (c) => c.product_id === item.product_id && c.product_presentation_id === item.presentation_id,
    );
    if (existe) {
      setCarrito(
        carrito.map((c) =>
          c.product_id === item.product_id && c.product_presentation_id === item.presentation_id
            ? { ...c, quantity_requested: cantidad }
            : c,
        ),
      );
    } else {
      setCarrito([
        ...carrito,
        {
          product_id: item.product_id,
          product_presentation_id: item.presentation_id,
          product_name: item.product_name,
          product_code: item.product_code,
          presentation_name: item.presentation_name,
          cantidad_base: item.cantidad_base,
          unidad_base: item.unidad_base,
          quantity_requested: cantidad,
          stock_en_presentacion: item.stock_en_presentacion,
          stock_base: item.stock_base,
        },
      ]);
    }
  };

  const actualizarCantidad = (index, cantidad) => {
    const newCarrito = [...carrito];
    newCarrito[index].quantity_requested = cantidad;
    setCarrito(newCarrito);
  };

  const quitarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.origin_warehouse_id) newErrors.origin_warehouse_id = 'Seleccione un depósito';
    if (carrito.length === 0) newErrors.carrito = 'Seleccione al menos un producto';
    carrito.forEach((item, i) => {
      if (item.quantity_requested <= 0) {
        newErrors[`item_${i}_qty`] = 'Cantidad debe ser mayor a 0';
      } else if (item.quantity_requested > item.stock_en_presentacion) {
        newErrors[`item_${i}_qty`] = `Máximo: ${item.stock_en_presentacion.toFixed(2)}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!form.destination_client_id) newErrors.destination_client_id = 'Seleccione un cliente';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const items = carrito.map((item) => ({
        product_id: item.product_id,
        product_presentation_id: item.product_presentation_id,
        quantity_requested: item.quantity_requested,
      }));
      await addRemito({
        ...form,
        origin_warehouse_id: parseInt(form.origin_warehouse_id),
        destination_client_id: parseInt(form.destination_client_id),
        created_by: user?.id,
        items,
      });
      onSave();
    } catch (error) {
      console.error('Error al crear remito:', error);
      alert(error.response?.data?.message || 'Error al crear remito');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalItems = carrito.reduce((sum, item) => sum + item.quantity_requested * item.cantidad_base, 0);

  return (
    <Modal show onHide={onClose} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Remito</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="d-flex gap-2 mb-3">
            <Badge bg={step >= 1 ? 'primary' : 'secondary'}>1. Seleccionar Productos</Badge>
            <Badge bg={step >= 2 ? 'primary' : 'secondary'}>2. Confirmar</Badge>
          </div>

          {step === 1 && (
            <>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Label>Tipo *</Form.Label>
                  <Form.Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="OFICIAL">Oficial</option>
                    <option value="NO_OFICIAL">No Oficial</option>
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label>Depósito origen *</Form.Label>
                  <Form.Select
                    value={form.origin_warehouse_id}
                    onChange={(e) => {
                      setForm({ ...form, origin_warehouse_id: e.target.value, items: [] });
                      setCarrito([]);
                    }}
                    isInvalid={!!errors.origin_warehouse_id}
                  >
                    <option value="">Seleccionar</option>
                    {depositos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre} ({d.codigo})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.origin_warehouse_id}</Form.Control.Feedback>
                </Col>
              </Row>

              {!form.origin_warehouse_id && (
                <p className="text-muted text-center py-4">Seleccione un depósito para ver el catálogo</p>
              )}

              {form.origin_warehouse_id && loadingCatalogo && (
                <p className="text-muted text-center py-4">Cargando catálogo...</p>
              )}

              {form.origin_warehouse_id && !loadingCatalogo && catalogo.length === 0 && (
                <p className="text-muted text-center py-4">No hay productos con stock en este depósito</p>
              )}

              {form.origin_warehouse_id && !loadingCatalogo && catalogo.length > 0 && (
                <>
                  {favoritos.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-primary mb-3">
                        <i className="bi bi-star-fill me-1"></i> Favoritos (Ranking 5)
                      </h6>
                      <Row>
                        {favoritos.map((item) => (
                          <CatalogoItem
                            key={`${item.product_id}_${item.presentation_id}`}
                            item={item}
                            onAdd={agregarAlCarrito}
                            enCarrito={carrito.find(
                              (c) =>
                                c.product_id === item.product_id &&
                                c.product_presentation_id === item.presentation_id,
                            )}
                          />
                        ))}
                      </Row>
                    </div>
                  )}

                  {otros.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-secondary mb-3">Otros productos (ordenados por ranking)</h6>
                      <Row>
                        {otros.map((item) => (
                          <CatalogoItem
                            key={`${item.product_id}_${item.presentation_id}`}
                            item={item}
                            onAdd={agregarAlCarrito}
                            enCarrito={carrito.find(
                              (c) =>
                                c.product_id === item.product_id &&
                                c.product_presentation_id === item.presentation_id,
                            )}
                          />
                        ))}
                      </Row>
                    </div>
                  )}

                  {sinClasificar.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">Sin clasificar</h6>
                      <Row>
                        {sinClasificar.map((item) => (
                          <CatalogoItem
                            key={`${item.product_id}_${item.presentation_id}`}
                            item={item}
                            onAdd={agregarAlCarrito}
                            enCarrito={carrito.find(
                              (c) =>
                                c.product_id === item.product_id &&
                                c.product_presentation_id === item.presentation_id,
                            )}
                          />
                        ))}
                      </Row>
                    </div>
                  )}
                </>
              )}

              {carrito.length > 0 && (
                <div className="border-top pt-3 mt-3">
                  <h6>Carrito ({carrito.length} productos)</h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Presentación</th>
                          <th>Cantidad</th>
                          <th>Stock</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {carrito.map((item, i) => (
                          <tr key={i}>
                            <td>
                              <strong>{item.product_name}</strong>
                              <br />
                              <small className="text-muted">{item.product_code}</small>
                            </td>
                            <td>{item.presentation_name}</td>
                            <td style={{ width: '120px' }}>
                              <Form.Control
                                type="number"
                                size="sm"
                                step="0.01"
                                min="0"
                                max={item.stock_en_presentacion}
                                value={item.quantity_requested}
                                onChange={(e) => actualizarCantidad(i, parseFloat(e.target.value) || 0)}
                                isInvalid={!!errors[`item_${i}_qty`]}
                              />
                            </td>
                            <td>{item.stock_en_presentacion.toFixed(2)}</td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => quitarDelCarrito(i)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-end">
                    <strong>Total: {totalItems.toFixed(2)} unidades base</strong>
                  </div>
                </div>
              )}

              {errors.carrito && <div className="text-danger mt-2">{errors.carrito}</div>}
            </>
          )}

          {step === 2 && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    value={form.destination_client_id}
                    onChange={(e) => setForm({ ...form, destination_client_id: e.target.value })}
                    isInvalid={!!errors.destination_client_id}
                  >
                    <option value="">Seleccionar</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.razon_social}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.destination_client_id}</Form.Control.Feedback>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Form.Group>

              <div className="border-top pt-3">
                <h6>Resumen del Remito</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Presentación</th>
                        <th className="text-end">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carrito.map((item, i) => (
                        <tr key={i}>
                          <td>
                            <strong>{item.product_name}</strong>
                          </td>
                          <td>{item.presentation_name}</td>
                          <td className="text-end">
                            {item.quantity_requested} ({item.cantidad_base * item.quantity_requested}{' '}
                            {item.unidad_base})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={2} className="text-end">
                          <strong>Total:</strong>
                        </td>
                        <td className="text-end">
                          <strong>{totalItems.toFixed(2)} {carrito[0]?.unidad_base}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {step === 1 && (
            <>
              <Button variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleNext} disabled={carrito.length === 0}>
                Siguiente <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="secondary" onClick={handleBack}>
                <i className="bi bi-arrow-left me-1"></i> Volver
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Remito'}
              </Button>
            </>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

const CatalogoItem = ({ item, onAdd, enCarrito }) => {
  const [cantidad, setCantidad] = useState(enCarrito ? enCarrito.quantity_requested : 1);

  const handleAgregar = () => {
    if (cantidad > 0 && cantidad <= item.stock_en_presentacion) {
      onAdd(item, cantidad);
    }
  };

  const rankingStars = (rank) => {
    return [...Array(5)].map((_, i) => (
      <i key={i} className={`bi ${i < rank ? 'bi-star-fill' : 'bi-star'} text-warning`}></i>
    ));
  };

  return (
    <Col md={6} lg={4} xl={3} className="mb-3">
      <div
        className={`card h-100 ${enCarrito ? 'border-primary' : ''}`}
        style={{ cursor: 'pointer' }}
      >
        {item.product_image && (
          <div style={{ height: '100px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}>
            <img
              src={item.product_image}
              alt={item.product_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 className="mb-0" style={{ fontSize: '0.9rem' }}>
                {item.product_name}
              </h6>
              <small className="text-muted">{item.product_code}</small>
            </div>
            {item.ranking > 0 && <div>{rankingStars(item.ranking)}</div>}
          </div>
          <p className="mb-2" style={{ fontSize: '0.85rem' }}>
            <strong>{item.presentation_name}</strong>
          </p>
          <p className="mb-2 text-success" style={{ fontSize: '0.85rem' }}>
            Stock: {item.stock_en_presentacion.toFixed(2)} ({item.unidad_base})
          </p>
          <div className="d-flex gap-2 align-items-center">
            <Form.Control
              type="number"
              size="sm"
              step="0.01"
              min="0.01"
              max={item.stock_en_presentacion}
              value={cantidad}
              onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '80px' }}
            />
            <Button
              variant={enCarrito ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAgregar();
              }}
              disabled={cantidad <= 0 || cantidad > item.stock_en_presentacion}
            >
              {enCarrito ? 'Actualizar' : 'Agregar'}
            </Button>
          </div>
          {enCarrito && (
            <small className="text-primary d-block mt-1">
              <i className="bi bi-check-circle me-1"></i>
              En carrito: {enCarrito.quantity_requested}
            </small>
          )}
        </div>
      </div>
    </Col>
  );
};

export default ModalRemitoCatalogo;
