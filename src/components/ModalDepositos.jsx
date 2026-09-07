import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalDepositos = ({ deposito, onlyView, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    direccion: '',
    activo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (deposito) {
      setForm({
        id: deposito.id,
        nombre: deposito.nombre || '',
        codigo: deposito.codigo || '',
        direccion: deposito.direccion || '',
        activo: deposito.activo ?? true,
      });
    }
  }, [deposito]);

  const validate = () => {
    const newErrors = {};
    if (!form.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.codigo?.trim()) newErrors.codigo = 'El código es requerido';
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
            ? 'Detalle Depósito'
            : deposito?.id
              ? 'Editar Depósito'
              : 'Nuevo Depósito'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
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
            <Form.Label>Código *</Form.Label>
            <Form.Control
              type="text"
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              isInvalid={!!errors.codigo}
              disabled={onlyView}
            />
            <Form.Control.Feedback type="invalid">
              {errors.codigo}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
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

export default ModalDepositos;
