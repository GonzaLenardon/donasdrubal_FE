import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalSubrubros = ({ subrubro, rubros, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre: '',
    rubro_id: '',
    activo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subrubro) {
      setForm({
        id: subrubro.id,
        nombre: subrubro.nombre || '',
        rubro_id: subrubro.rubro_id || '',
        activo: subrubro.activo ?? true,
      });
    }
  }, [subrubro]);

  const validate = () => {
    const newErrors = {};
    if (!form.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.rubro_id) newErrors.rubro_id = 'Seleccione un rubro';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      await onSave({ ...form, rubro_id: parseInt(form.rubro_id) });
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rubrosActivos = rubros.filter((r) => r.activo);

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {subrubro?.id ? 'Editar Subrubro' : 'Nuevo Subrubro'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Rubro *</Form.Label>
            <Form.Select
              value={form.rubro_id}
              onChange={(e) => setForm({ ...form, rubro_id: e.target.value })}
              isInvalid={!!errors.rubro_id}
            >
              <option value="">Seleccionar rubro</option>
              {rubrosActivos.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.rubro_id}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              isInvalid={!!errors.nombre}
              placeholder="Ej: Glifosatos"
            />
            <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Activo"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalSubrubros;