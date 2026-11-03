import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { addRemitoInterno, getCatalogo } from '../api/remitos';

const normalizarBusqueda = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();

const ModalRemitoInterno = ({ depositos, onClose, onSave }) => {
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  });
  const [notas, setNotas] = useState('');
  const [catalogo, setCatalogo] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('1');
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarCatalogo = async () => {
      if (!origenId) {
        setCatalogo([]);
        return;
      }

      try {
        setLoadingCatalogo(true);
        setError('');
        const res = await getCatalogo(origenId);
        if (activo) setCatalogo(res.data || []);
      } catch (requestError) {
        console.error('Error al cargar catálogo para transferencia:', requestError);
        if (activo) {
          setCatalogo([]);
          setError(requestError.response?.data?.message || 'No se pudo cargar el stock del depósito origen.');
        }
      } finally {
        if (activo) setLoadingCatalogo(false);
      }
    };

    cargarCatalogo();
    return () => {
      activo = false;
    };
  }, [origenId]);

  const productosFiltrados = useMemo(() => {
    const texto = normalizarBusqueda(busqueda);
    if (!texto) return catalogo;
    return catalogo.filter((producto) => {
      const datosProducto = normalizarBusqueda(
        `${producto.product_name} ${producto.product_code} ${producto.presentation_name}`,
      );
      return datosProducto.includes(texto);
    });
  }, [busqueda, catalogo]);

  const productoSeleccionado = catalogo.find(
    (producto) => producto.product_variant_id === Number(productoId),
  );
  const productoEnCarrito = carrito.find(
    (item) => item.product_variant_id === Number(productoId),
  );
  const stockRestante = productoSeleccionado
    ? productoSeleccionado.stock_en_presentacion - (productoEnCarrito?.quantity_requested || 0)
    : 0;

  const agregarProducto = () => {
    const qty = Number(cantidad);
    if (!productoSeleccionado || !Number.isFinite(qty) || qty <= 0) {
      setError('Seleccione un producto e indique una cantidad mayor a cero.');
      return;
    }

    const actual = carrito.find(
      (item) => item.product_variant_id === productoSeleccionado.product_variant_id,
    );
    const cantidadTotal = qty + (actual?.quantity_requested || 0);
    if (cantidadTotal > productoSeleccionado.stock_en_presentacion) {
      setError(`La cantidad supera el stock disponible (${productoSeleccionado.stock_en_presentacion.toFixed(2)} ${productoSeleccionado.presentation_name}).`);
      return;
    }

    setCarrito((items) => {
      if (actual) {
        return items.map((item) =>
          item.product_variant_id === productoSeleccionado.product_variant_id
            ? { ...item, quantity_requested: cantidadTotal }
            : item,
        );
      }
      return [...items, { ...productoSeleccionado, quantity_requested: qty }];
    });
    setCantidad('1');
    setError('');
  };

  const actualizarCantidad = (variantId, value) => {
    const nextQuantity = Number(value);
    setCarrito((items) =>
      items.map((item) =>
        item.product_variant_id === variantId
          ? { ...item, quantity_requested: Number.isFinite(nextQuantity) ? nextQuantity : 0 }
          : item,
      ),
    );
  };

  const validar = () => {
    if (!origenId || !destinoId) {
      setError('Seleccione los depósitos de origen y destino.');
      return false;
    }
    if (origenId === destinoId) {
      setError('El depósito de origen y destino deben ser distintos.');
      return false;
    }
    if (carrito.length === 0) {
      setError('Agregue al menos un producto a transferir.');
      return false;
    }
    const cantidadInvalida = carrito.some(
      (item) =>
        item.quantity_requested <= 0 ||
        item.quantity_requested > item.stock_en_presentacion,
    );
    if (cantidadInvalida) {
      setError('Revise las cantidades: deben ser mayores a cero y no superar el stock disponible.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validar()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const res = await addRemitoInterno({
        origin_warehouse_id: Number(origenId),
        destination_warehouse_id: Number(destinoId),
        issued_at: fecha,
        notes: notas.trim() || null,
        created_by: user?.id,
        items: carrito.map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity_requested: item.quantity_requested,
        })),
      });
      onSave(res.data);
    } catch (requestError) {
      console.error('Error al crear remito interno:', requestError);
      setError(requestError.response?.data?.message || 'No se pudo crear el remito interno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nombreDeposito = (id) =>
    depositos.find((deposito) => deposito.id === Number(id))?.nombre || '—';

  return (
    <Modal show onHide={onClose} centered size="xl" backdrop={isSubmitting ? 'static' : true}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSubmitting}>
          <div>
            <Modal.Title>Nuevo remito interno</Modal.Title>
            <small className="text-muted">
              Traslado entre depósitos · tipo No Oficial · stock actualizado al confirmar
            </small>
          </div>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <section className="mb-4">
            <h6 className="mb-3">1. Depósitos del traslado</h6>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label>Depósito origen *</Form.Label>
                <Form.Select
                  value={origenId}
                  onChange={(event) => {
                    setOrigenId(event.target.value);
                    setCarrito([]);
                    setProductoId('');
                    setBusqueda('');
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar depósito</option>
                  {depositos.map((deposito) => (
                    <option key={deposito.id} value={deposito.id}>
                      {deposito.nombre} ({deposito.codigo})
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label>Depósito destino *</Form.Label>
                <Form.Select
                  value={destinoId}
                  onChange={(event) => setDestinoId(event.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar depósito</option>
                  {depositos
                    .filter((deposito) => deposito.id !== Number(origenId))
                    .map((deposito) => (
                      <option key={deposito.id} value={deposito.id}>
                        {deposito.nombre} ({deposito.codigo})
                      </option>
                    ))}
                </Form.Select>
              </Col>
            </Row>
          </section>

          <section className="mb-4">
            <h6 className="mb-3">2. Productos y cantidades</h6>
            {!origenId ? (
              <p className="text-muted mb-0">Seleccione el depósito origen para consultar su stock.</p>
            ) : loadingCatalogo ? (
              <div className="d-flex align-items-center gap-2 text-muted">
                <Spinner animation="border" size="sm" /> Consultando stock disponible…
              </div>
            ) : catalogo.length === 0 ? (
              <p className="text-muted mb-0">No hay productos con stock en este depósito.</p>
            ) : (
              <Row className="g-2 align-items-end">
                <Col md={5}>
                  <Form.Label>Buscar producto o código de variante</Form.Label>
                  <Form.Control
                    className="mb-1"
                    placeholder="Escribí el nombre, presentación o código"
                    value={busqueda}
                    onChange={(event) => {
                      setBusqueda(event.target.value);
                      setProductoId('');
                    }}
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                  <Form.Text className="d-block mb-2">
                    Escribí para filtrar y luego elegí una presentación de la lista.
                  </Form.Text>
                  <div
                    className="list-group"
                    role="list"
                    aria-label="Resultados de búsqueda de productos"
                    style={{ maxHeight: 230, overflowY: 'auto' }}
                  >
                    {productosFiltrados.length > 0 ? (
                      productosFiltrados.map((producto) => {
                        const seleccionado =
                          producto.product_variant_id === Number(productoId);
                        return (
                          <button
                            key={producto.product_variant_id}
                            type="button"
                            aria-pressed={seleccionado}
                            className={`list-group-item list-group-item-action text-start ${
                              seleccionado ? 'active' : ''
                            }`}
                            onClick={() => {
                              setProductoId(String(producto.product_variant_id));
                              setCantidad('1');
                              setError('');
                            }}
                            disabled={isSubmitting}
                          >
                            <span className="d-flex justify-content-between align-items-start gap-2">
                              <span>
                                <strong className="d-block">{producto.product_name}</strong>
                                <small>
                                  {producto.presentation_name} · Código {producto.product_code}
                                </small>
                              </span>
                              <small className="text-nowrap">
                                Stock: {producto.stock_en_presentacion.toFixed(2)}
                              </small>
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="list-group-item text-muted">
                        No hay productos que coincidan con “{busqueda}”.
                      </div>
                    )}
                  </div>
                  <Form.Text className="d-block mt-1">
                    {productosFiltrados.length} de {catalogo.length} presentaciones disponibles
                  </Form.Text>
                </Col>
                <Col md={3}>
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={stockRestante}
                    value={cantidad}
                    onChange={(event) => setCantidad(event.target.value)}
                    disabled={isSubmitting || !productoSeleccionado || stockRestante <= 0}
                  />
                </Col>
                <Col md={2}>
                  <div className="small text-muted mb-2">
                    Disponible
                    <strong className="d-block text-dark">
                      {productoSeleccionado
                        ? `${stockRestante.toFixed(2)} ${productoSeleccionado.presentation_name}`
                        : '—'}
                    </strong>
                    {productoEnCarrito && (
                      <small className="d-block">
                        Ya agregado: {productoEnCarrito.quantity_requested.toFixed(2)}
                      </small>
                    )}
                  </div>
                </Col>
                <Col md={2}>
                  <Button
                    type="button"
                    variant="outline-primary"
                    className="w-100"
                    onClick={agregarProducto}
                    disabled={isSubmitting || !productoSeleccionado}
                  >
                    Agregar
                  </Button>
                </Col>
              </Row>
            )}
          </section>

          {carrito.length > 0 && (
            <section className="mb-4">
              <h6 className="mb-2">Detalle de la transferencia</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Producto / variante</th>
                      <th>Presentación</th>
                      <th>Stock disponible</th>
                      <th style={{ width: 140 }}>Cantidad</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map((item) => (
                      <tr key={item.product_variant_id}>
                        <td>
                          <strong>{item.product_name}</strong>
                          <small className="d-block text-muted">{item.product_code}</small>
                        </td>
                        <td>
                          {item.presentation_name}
                          {item.unidad_base && (
                            <small className="d-block text-muted">
                              Unidad base: {item.unidad_base}
                            </small>
                          )}
                        </td>
                        <td>{item.stock_en_presentacion.toFixed(2)}</td>
                        <td>
                          <Form.Control
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={item.stock_en_presentacion}
                            value={item.quantity_requested}
                            onChange={(event) => actualizarCantidad(item.product_variant_id, event.target.value)}
                            isInvalid={
                              item.quantity_requested <= 0 ||
                              item.quantity_requested > item.stock_en_presentacion
                            }
                            disabled={isSubmitting}
                          />
                        </td>
                        <td>
                          <Button
                            type="button"
                            variant="outline-danger"
                            size="sm"
                            aria-label={`Quitar ${item.product_name}`}
                            onClick={() => setCarrito((items) => items.filter(
                              (entry) => entry.product_variant_id !== item.product_variant_id,
                            ))}
                            disabled={isSubmitting}
                          >
                            Quitar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="mb-3">
            <h6 className="mb-2">3. Datos del remito</h6>
            <Row className="g-3">
              <Col md={4}>
                <Form.Label>Fecha *</Form.Label>
                <Form.Control
                  type="date"
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </Col>
              <Col md={8}>
                <Form.Label>Notas</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Información opcional sobre el traslado"
                  value={notas}
                  onChange={(event) => setNotas(event.target.value)}
                  disabled={isSubmitting}
                />
              </Col>
            </Row>
          </section>

          {origenId && destinoId && carrito.length > 0 && (
            <Alert variant="info" className="mb-0">
              <strong>Resumen:</strong> {nombreDeposito(origenId)} → {nombreDeposito(destinoId)}
              {' · '}{carrito.length} producto{carrito.length !== 1 ? 's' : ''}
              <br />
              Fecha del remito: {new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR')}.
              <br />
              Al confirmar, el stock se moverá entre depósitos y el remito quedará registrado como completado.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || carrito.length === 0}>
            {isSubmitting ? 'Procesando traslado…' : 'Confirmar transferencia'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalRemitoInterno;
