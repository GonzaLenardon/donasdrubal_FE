import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

const ModalPresentaciones = ({
  presentacion,
  presentaciones,
  onlyView,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState({
    nombre: '',
    unidad_base_id: '',
    cantidad_base: '',
    activo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (presentacion) {
      setForm({
        id: presentacion.id,
        nombre: presentacion.nombre || '',
        unidad_base_id: presentacion.unidad_base_id || '',
        cantidad_base: presentacion.cantidad_base || '',
        activo: presentacion.activo ?? true,
      });
    }
  }, [presentacion]);

  const validate = () => {
    const newErrors = {};
    if (!form.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (form.unidad_base_id && (!form.cantidad_base || parseFloat(form.cantidad_base) <= 0)) {
      newErrors.cantidad_base = 'Si define unidad base, la cantidad es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      const dataToSend = {
        ...form,
        unidad_base_id: form.unidad_base_id
          ? parseInt(form.unidad_base_id)
          : null,
        cantidad_base: form.cantidad_base
          ? parseFloat(form.cantidad_base)
          : null,
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Solo mostrar presentaciones que sean base (sin unidad_base_id)
  const unidadesBase = presentaciones.filter(
    (p) => p.id !== form.id && !p.unidad_base_id,
  );

  const unidadBaseSeleccionada = presentaciones.find(
    (p) => p.id === parseInt(form.unidad_base_id),
  );

  const showPreview =
    form.nombre?.trim() && form.unidad_base_id && form.cantidad_base > 0;

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {onlyView
            ? 'Detalle Presentación'
            : presentacion?.id
              ? 'Editar Presentación'
              : 'Nueva Presentación'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: litros, kilos, pack, bidón..."
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
            <Form.Label>¿Esta presentación equivale a otra?</Form.Label>
            <Form.Select
              value={form.unidad_base_id}
              onChange={(e) =>
                setForm({ ...form, unidad_base_id: e.target.value, cantidad_base: '' })
              }
              disabled={onlyView}
            >
              <option value="">NO — Es una unidad base</option>
              {unidadesBase.map((p) => (
                <option key={p.id} value={p.id}>
                  Sí — Equivale a {p.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Si es una unidad base (litros, kilos, unidad), dejá en "NO".
              <br />
              Si es derivada (pack, bidón), seleccioná a qué equivale.
            </Form.Text>
          </Form.Group>

          {form.unidad_base_id && (
            <Form.Group className="mb-3">
              <Form.Label>Cuántas unidades base equivalen a 1 de esta presentación *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ej: 20"
                value={form.cantidad_base}
                onChange={(e) =>
                  setForm({ ...form, cantidad_base: e.target.value })
                }
                isInvalid={!!errors.cantidad_base}
                disabled={onlyView}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cantidad_base}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {showPreview && (
            <Alert variant="success" className="mb-0" style={{ fontSize: 13 }}>
              <strong>Vista previa:</strong> 1 {form.nombre.trim()} = {form.cantidad_base} {unidadBaseSeleccionada?.nombre}
            </Alert>
          )}
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

export default ModalPresentaciones;
