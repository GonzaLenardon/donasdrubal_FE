import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { allPresentations } from '../api/productos';

const ModalProductos = ({ producto, onlyView, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    product_presentation_id: '',
    activo: true,
  });
  const [presentaciones, setPresentaciones] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    cargarPresentaciones();
  }, []);

  useEffect(() => {
    if (producto) {
      setForm({
        id: producto.id,
        nombre: producto.nombre || '',
        codigo: producto.codigo || '',
        product_presentation_id: producto.product_presentation_id || '',
        activo: producto.activo ?? true,
      });
    }
  }, [producto]);

  const cargarPresentaciones = async () => {
    try {
      const res = await allPresentations();
      setPresentaciones(res.data);
    } catch (error) {
      console.error('Error al cargar presentaciones:', error);
    }
  };

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
      const dataToSend = {
        ...form,
        product_presentation_id: form.product_presentation_id
          ? parseInt(form.product_presentation_id)
          : null,
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPresentacionLabel = (p) => {
    if (p.unidadBase) {
      return `${p.nombre} (${p.cantidad_base} ${p.unidadBase.nombre})`;
    }
    return p.nombre;
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {onlyView
            ? 'Detalle Producto'
            : producto?.id
              ? 'Editar Producto'
              : 'Nuevo Producto'}
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
            <Form.Label>Presentación</Form.Label>
            <Form.Select
              value={form.product_presentation_id}
              onChange={(e) =>
                setForm({ ...form, product_presentation_id: e.target.value })
              }
              disabled={onlyView}
            >
              <option value="">Sin presentación</option>
              {presentaciones.map((p) => (
                <option key={p.id} value={p.id}>
                  {getPresentacionLabel(p)}
                </option>
              ))}
            </Form.Select>
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

export default ModalProductos;
