import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalProveedores = ({ proveedor, onlyView, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre: '',
    cuit: '',
    email: '',
    telefono: '',
    activo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (proveedor) {
      setForm({
        id: proveedor.id,
        nombre: proveedor.nombre || '',
        cuit: proveedor.cuit || '',
        email: proveedor.email || '',
        telefono: proveedor.telefono || '',
        activo: proveedor.activo ?? true,
      });
    }
  }, [proveedor]);

  const validate = () => {
    const newErrors = {};
    if (!form.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await onSave(form);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {onlyView
            ? 'Detalle Proveedor'
            : proveedor?.id
              ? 'Editar Proveedor'
              : 'Nuevo Proveedor'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre / Razón Social *</Form.Label>
            <Form.Control
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              isInvalid={!!errors.nombre}
              disabled={onlyView}
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>CUIT</Form.Label>
            <Form.Control
              type="text"
              value={form.cuit}
              onChange={(e) => setForm({ ...form, cuit: e.target.value })}
              disabled={onlyView}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={onlyView}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              disabled={onlyView}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Activo"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
              disabled={onlyView}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            {onlyView ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!onlyView && (
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalProveedores;
