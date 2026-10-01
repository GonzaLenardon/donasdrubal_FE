import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { uploadProductImage, deleteProductImage } from '../api/productos';

const ModalProductos = ({ producto, onlyView, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    activo: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(producto?.imagen || null);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (producto) {
      setForm({
        id: producto.id,
        nombre: producto.nombre || '',
        codigo: producto.codigo || '',
        activo: producto.activo ?? true,
      });
      setImagePreview(producto.imagen || null);
    }
  }, [producto]);

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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setImageError('El archivo debe ser menor a 10MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setImageError('Formato no permitido. Use JPG, PNG, WebP o SVG');
        return;
      }
      setImageFile(selectedFile);
      setImageError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUploadImage = async () => {
    if (!imageFile || !producto?.id) return;
    try {
      setIsUploading(true);
      setImageError('');
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await uploadProductImage(producto.id, formData);
      setImagePreview(res.data.imagen);
      setImageFile(null);
    } catch (error) {
      setImageError(error.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!producto?.id) return;
    try {
      setIsUploading(true);
      await deleteProductImage(producto.id);
      setImagePreview(null);
      setImageFile(null);
    } catch (error) {
      setImageError(error.response?.data?.message || 'Error al eliminar la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
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
          <div className="row">
            <div className="col-md-8">
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
                <Form.Check
                  type="checkbox"
                  label="Activo"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  disabled={onlyView}
                />
              </Form.Group>
            </div>

            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Imagen ilustrativa</Form.Label>
                <div
                  className={`border rounded p-3 text-center ${imageFile ? 'border-primary' : ''}`}
                  style={{
                    borderStyle: 'dashed',
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => !onlyView && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,.svg"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={onlyView}
                  />
                  {imagePreview || imageFile ? (
                    <div>
                      <img
                        src={imageFile ? imagePreview : imagePreview}
                        alt="Preview"
                        style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }}
                        className="mb-2"
                      />
                      {imageFile && !onlyView && (
                        <div>
                          <small className="text-muted d-block mb-2">{imageFile.name}</small>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUploadImage();
                            }}
                            disabled={isUploading}
                          >
                            {isUploading ? 'Subiendo...' : 'Confirmar'}
                          </Button>
                        </div>
                      )}
                      {!onlyView && !imageFile && (
                        <div className="d-flex gap-2 justify-content-center mt-2">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage();
                            }}
                            disabled={isUploading}
                          >
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <i className="bi bi-image text-secondary" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-2 mb-0">
                        {!onlyView && <strong>Haga clic para agregar</strong>}
                        {onlyView && <span className="text-muted">Sin imagen</span>}
                      </p>
                      <small className="text-muted">JPG, PNG o WebP (máx 10MB)</small>
                    </div>
                  )}
                </div>
                {imageError && <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{imageError}</div>}
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            {onlyView ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!onlyView && (
            <Button type="submit" variant="primary" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalProductos;
