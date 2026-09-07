import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { addRemito } from '../api/remitos';

const ModalRemitos = ({ depositos, productos, clientes, onClose, onSave }) => {
  const [form, setForm] = useState({
    type: 'OFICIAL',
    origin_warehouse_id: '',
    destination_client_id: '',
    notes: '',
    items: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
      if (!item.quantity_requested || parseFloat(item.quantity_requested) <= 0)
        newErrors[`item_${i}_quantity`] = 'Cantidad inválida';
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
          product_presentation_id: item.product_presentation_id
            ? parseInt(item.product_presentation_id)
            : null,
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
                onChange={(e) => setForm({ ...form, origin_warehouse_id: e.target.value })}
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
            <Button variant="outline-primary" size="sm" onClick={addItem}>
              <i className="bi bi-plus-lg me-1"></i>Agregar producto
            </Button>
          </div>

          {errors.items && (
            <div className="text-danger mb-2" style={{ fontSize: 12 }}>{errors.items}</div>
          )}

          {form.items.map((item, i) => (
            <div key={i} className="card p-3 mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>Ítem {i + 1}</strong>
                <Button variant="outline-danger" size="sm" onClick={() => removeItem(i)}>
                  <i className="bi bi-trash"></i>
                </Button>
              </div>
              <div className="row">
                <div className="col-md-5 mb-2">
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
                  <Form.Label>Cantidad solicitada *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={item.quantity_requested}
                    onChange={(e) => updateItem(i, 'quantity_requested', e.target.value)}
                    isInvalid={!!errors[`item_${i}_quantity`]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`item_${i}_quantity`]}
                  </Form.Control.Feedback>
                </div>
                <div className="col-md-3 mb-2">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
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
