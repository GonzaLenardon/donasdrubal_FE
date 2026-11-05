import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const ModalMarcas = ({ marca, onClose, onSave }) => {
  const [nombre, setNombre] = useState(marca?.nombre || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setNombre(marca?.nombre || '');
  }, [marca]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({ ...(marca?.id ? { id: marca.id } : {}), nombre: nombre.trim() });
    } catch (saveError) {
      console.error('Error al guardar marca:', saveError);
      setError('No se pudo guardar la marca');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{marca?.id ? 'Editar Marca' : 'Nueva Marca'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              isInvalid={!!error}
              placeholder="Ej: Marca del producto"
            />
            <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
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

export default ModalMarcas;
