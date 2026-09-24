import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addRemito } from '../api/remitos';

const ModalRemitos = ({ depositos, productos, clientes, stock, onClose, onSave }) => {
  const [form, setForm] = useState({
    type: 'OFICIAL',
    origin_warehouse_id: '',
    destination_client_id: '',
    notes: '',
    items: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Obtener presentaciones disponibles por producto y depósito
  const getPresentacionesDisponibles = (productId) => {
    if (!form.origin_warehouse_id || !productId) return [];

    const stockFiltrado = stock.filter(
      (s) =>
        s.product_id === parseInt(productId) &&
        s.warehouse_id === parseInt(form.origin_warehouse_id),
    );

    // Agrupar por presentación
    const porPresentacion = {};
    for (const s of stockFiltrado) {
      const presId = s.lote?.product_presentation_id;
      if (!presId) continue;
      if (!porPresentacion[presId]) {
        porPresentacion[presId] = {
          id: presId,
          nombre: s.lote?.presentacion?.nombre || `Presentación #${presId}`,
          cantidad_base: s.lote?.presentacion?.cantidad_base
            ? parseFloat(s.lote.presentacion.cantidad_base)
            : 1,
          unidad_base: s.lote?.presentacion?.unidadBase?.nombre || '',
          totalBase: 0,
        };
      }
      porPresentacion[presId].totalBase += parseFloat(s.quantity);
    }

    return Object.values(porPresentacion).map((p) => ({
      ...p,
      totalEnPresentacion: p.totalBase / p.cantidad_base,
    }));
  };

  const getStockDisponible = (productId, presentationId) => {
    if (!form.origin_warehouse_id || !productId || !presentationId) return null;

    const presentaciones = getPresentacionesDisponibles(productId);
    const pres = presentaciones.find((p) => p.id === parseInt(presentationId));
    if (!pres) return null;

    return {
      maxEnPresentacion: pres.totalEnPresentacion,
      totalEnBase: pres.totalBase,
      nombrePresentacion: pres.nombre,
      unidadBase: pres.unidadBase,
      cantidadBase: pres.cantidad_base,
    };
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { product_id: '', product_presentation_id: '', quantity_requested: '', description: '' },
      ],
    });
  };

  const removeItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Reset presentación al cambiar producto
    if (field === 'product_id') {
      newItems[index].product_presentation_id = '';
      newItems[index].quantity_requested = '';
    }
    // Reset cantidad al cambiar presentación
    if (field === 'product_presentation_id') {
      newItems[index].quantity_requested = '';
    }
    setForm({ ...form, items: newItems });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.type) newErrors.type = 'Seleccione el tipo';
    if (!form.origin_warehouse_id) newErrors.origin_warehouse_id = 'Seleccione depósito origen';
    if (!form.destination_client_id) newErrors.destination_client_id = 'Seleccione cliente';
    if (form.items.length === 0) newErrors.items = 'Agregue al menos un ítem';
    form.items.forEach((item, i) => {
      if (!item.product_id) newErrors[`item_${i}_product`] = 'Seleccione un producto';
      if (!item.product_presentation_id)
        newErrors[`item_${i}_presentation`] = 'Seleccione una presentación';
      const qty = parseFloat(item.quantity_requested);
      if (!qty || qty <= 0) {
        newErrors[`item_${i}_quantity`] = 'Cantidad inválida';
      } else {
        const stockInfo = getStockDisponible(item.product_id, item.product_presentation_id);
        if (stockInfo && qty > stockInfo.maxEnPresentacion) {
          newErrors[`item_${i}_quantity`] = `Máximo: ${stockInfo.maxEnPresentacion.toFixed(2)}`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem('user'));
      await addRemito({
        ...form,
        origin_warehouse_id: parseInt(form.origin_warehouse_id),
        destination_client_id: parseInt(form.destination_client_id),
        created_by: user?.id,
        items: form.items.map((item) => ({
          ...item,
          product_id: parseInt(item.product_id),
          product_presentation_id: parseInt(item.product_presentation_id),
          quantity_requested: parseFloat(item.quantity_requested),
        })),
      });
      onSave();
    } catch (error) {
      console.error('Error al guardar remito:', error);
      alert(error.response?.data?.message || 'Error al crear remito');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Remito</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-4 mb-3">
              <Form.Label>Tipo *</Form.Label>
              <Form.Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                isInvalid={!!errors.type}
              >
                <option value="OFICIAL">Oficial</option>
                <option value="NO_OFICIAL">No Oficial</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
            </div>
            <div className="col-md-4 mb-3">
              <Form.Label>Depósito origen *</Form.Label>
              <Form.Select
                value={form.origin_warehouse_id}
                onChange={(e) => {
                  setForm({ ...form, origin_warehouse_id: e.target.value, items: [] });
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
              <Form.Control.Feedback type="invalid">
                {errors.origin_warehouse_id}
              </Form.Control.Feedback>
            </div>
            <div className="col-md-4 mb-3">
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
              <Form.Control.Feedback type="invalid">
                {errors.destination_client_id}
              </Form.Control.Feedback>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Notas</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Form.Group>

          <hr />
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Ítems del remito</h6>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={addItem}
              disabled={!form.origin_warehouse_id}
            >
              <i className="bi bi-plus-lg me-1"></i>Agregar producto
            </Button>
          </div>

          {!form.origin_warehouse_id && form.items.length === 0 && (
            <p className="text-muted text-center" style={{ fontSize: 13 }}>
              Seleccione un depósito origen para agregar ítems
            </p>
          )}

          {errors.items && (
            <div className="text-danger mb-2" style={{ fontSize: 12 }}>{errors.items}</div>
          )}

          {form.items.map((item, i) => {
            const presentaciones = getPresentacionesDisponibles(item.product_id);
            const stockInfo = getStockDisponible(item.product_id, item.product_presentation_id);
            const qty = parseFloat(item.quantity_requested) || 0;
            const conversion =
              stockInfo && qty > 0
                ? `= ${(qty * stockInfo.cantidadBase).toFixed(2)} ${stockInfo.unidadBase}`
                : null;

            return (
              <div key={i} className="card p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Ítem {i + 1}</strong>
                  <Button variant="outline-danger" size="sm" onClick={() => removeItem(i)}>
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
                <div className="row">
                  <div className="col-md-4 mb-2">
                    <Form.Label>Producto *</Form.Label>
                    <Form.Select
                      value={item.product_id}
                      onChange={(e) => updateItem(i, 'product_id', e.target.value)}
                      isInvalid={!!errors[`item_${i}_product`]}
                    >
                      <option value="">Seleccionar</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors[`item_${i}_product`]}
                    </Form.Control.Feedback>
                  </div>
                  <div className="col-md-4 mb-2">
                    <Form.Label>Presentación *</Form.Label>
                    <Form.Select
                      value={item.product_presentation_id}
                      onChange={(e) => updateItem(i, 'product_presentation_id', e.target.value)}
                      isInvalid={!!errors[`item_${i}_presentation`]}
                      disabled={!item.product_id}
                    >
                      <option value="">Seleccionar</option>
                      {presentaciones.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (stock: {p.totalEnPresentacion.toFixed(2)})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors[`item_${i}_presentation`]}
                    </Form.Control.Feedback>
                    {item.product_id && presentaciones.length === 0 && (
                      <small className="text-danger">Sin stock de este producto</small>
                    )}
                  </div>
                  <div className="col-md-4 mb-2">
                    <Form.Label>
                      Cantidad *
                      {stockInfo && (
                        <span className="text-muted ms-1" style={{ fontSize: 11 }}>
                          (max: {stockInfo.maxEnPresentacion.toFixed(2)})
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      max={stockInfo?.maxEnPresentacion || undefined}
                      value={item.quantity_requested}
                      onChange={(e) => updateItem(i, 'quantity_requested', e.target.value)}
                      isInvalid={!!errors[`item_${i}_quantity`]}
                      disabled={!item.product_presentation_id}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors[`item_${i}_quantity`]}
                    </Form.Control.Feedback>
                    {conversion && (
                      <small className="text-muted">{conversion}</small>
                    )}
                  </div>
                  <div className="col-md-12 mb-2">
                    <Form.Label>Descripción</Form.Label>
                    <Form.Control
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(i, 'description', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {form.items.length > 0 && (
            <div className="text-end mt-2">
              <strong>
                Total:{' '}
                {form.items
                  .reduce((sum, item) => {
                    const stockInfo = getStockDisponible(
                      item.product_id,
                      item.product_presentation_id,
                    );
                    const qty = parseFloat(item.quantity_requested) || 0;
                    return sum + (stockInfo ? qty * stockInfo.cantidadBase : 0);
                  }, 0)
                  .toFixed(2)}{' '}
                unidades base
              </strong>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Crear Remito'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalRemitos;
