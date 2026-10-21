import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { uploadProductImage, deleteProductImage } from '../api/productos';
import { allRubros } from '../api/rubros';
import { allSubrubros } from '../api/subrubros';
import { allPresentations } from '../api/productos';
import { upVariant, delVariant, allVariants } from '../api/productVariants';

const ModalProductos = ({ producto, onlyView, onClose, onSave }) => {
  const [form, setForm] = useState({
    nombre: '',
    codigo: '',
    activo: true,
    rubro_id: '',
    subrubro_id: '',
  });
  const [rubros, setRubros] = useState([]);
  const [subrubros, setSubrubros] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState('');
  const [codigoVariante, setCodigoVariante] = useState('');
  const [variantesExistentes, setVariantesExistentes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(producto?.imagen || null);
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (producto?.id) {
      setForm({
        id: producto.id,
        nombre: producto.nombre || '',
        codigo: producto.codigo || '',
        activo: producto.activo ?? true,
        rubro_id: producto.rubro_id || '',
        subrubro_id: producto.subrubro_id || '',
      });
      setImagePreview(producto.imagen || null);
      cargarVariantesExistentes(producto.id);
    }
  }, [producto]);

  useEffect(() => {
    if (form.rubro_id) {
      cargarSubrubrosYSeleccionar(form.rubro_id);
    } else {
      setSubrubros([]);
    }
  }, [form.rubro_id]);

  const cargarDatos = async () => {
    try {
      const [resRubros, resPresentaciones] = await Promise.all([
        allRubros(),
        allPresentations(),
      ]);
      setRubros(resRubros.data || []);
      setPresentaciones(resPresentaciones.data || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const cargarSubrubrosYSeleccionar = async (rubroId) => {
    try {
      const res = await allSubrubros(rubroId);
      setSubrubros(res.data || []);
    } catch (error) {
      console.error('Error al cargar subrubros:', error);
    }
  };

  const cargarVariantesExistentes = async (productoId) => {
    try {
      const res = await allVariants();
      const variantesDelProducto = (res.data || []).filter(
        (v) => v.product_id === productoId
      );
      setVariantesExistentes(variantesDelProducto);
    } catch (error) {
      console.error('Error al cargar variantes:', error);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.nombre?.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!form.codigo?.trim()) newErrors.codigo = 'El código es requerido';
    if (!producto?.id && !presentacionSeleccionada) {
      newErrors.presentaciones = 'Seleccione una presentación';
    }
    if (!producto?.id && !codigoVariante?.trim()) {
      newErrors.codigoVariante = 'El código de la variante es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);

      const payload = { ...form };
      if (!producto?.id && presentacionSeleccionada) {
        payload.presentation_id = parseInt(presentacionSeleccionada);
        payload.codigo_variante = codigoVariante.trim();
      }

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePresentacion = async (varianteId, nuevaPresentacionId) => {
    try {
      const presentacionesActuales = variantesExistentes
        .filter((v) => v.id !== varianteId)
        .map((v) => v.presentation_id);

      if (presentacionesActuales.includes(parseInt(nuevaPresentacionId))) {
        alert('Este producto ya tiene esa presentación');
        return;
      }

      await upVariant({
        id: varianteId,
        presentation_id: parseInt(nuevaPresentacionId),
      });

      await cargarVariantesExistentes(producto.id);
    } catch (error) {
      console.error('Error al cambiar presentación:', error);
      alert(error.response?.data?.message || 'Error al cambiar presentación');
    }
  };

  const handleEliminarVariante = async (varianteId) => {
    try {
      await delVariant(varianteId);
      await cargarVariantesExistentes(producto.id);
    } catch (error) {
      console.error('Error al eliminar variante:', error);
    }
  };

  const handleAgregarVariante = async () => {
    try {
      const presentacionesUsadas = variantesExistentes.map((v) => v.presentation_id);
      const disponibles = presentaciones.filter(
        (p) => p.activo && !presentacionesUsadas.includes(p.id)
      );

      if (disponibles.length === 0) {
        alert('No hay más presentaciones disponibles');
        return;
      }

      await addVariant({
        product_id: producto.id,
        presentation_id: disponibles[0].id,
        activo: true,
        ranking: 0,
      });

      await cargarVariantesExistentes(producto.id);
    } catch (error) {
      console.error('Error al agregar variante:', error);
      alert(error.response?.data?.message || 'Error al agregar variante');
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
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileChange({ target: { files: [droppedFile] } });
    }
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

  const presentacionesUsadas = variantesExistentes.map((v) => v.presentation_id);

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {onlyView ? 'Detalle Producto' : producto?.id ? 'Editar Producto' : 'Nuevo Producto'}
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
                <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
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
                <Form.Control.Feedback type="invalid">{errors.codigo}</Form.Control.Feedback>
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Rubro</Form.Label>
                    <Form.Select
                      value={form.rubro_id}
                      onChange={(e) => {
                        setForm({ ...form, rubro_id: e.target.value, subrubro_id: '' });
                      }}
                      disabled={onlyView}
                    >
                      <option value="">Seleccionar</option>
                      {rubros.filter((r) => r.activo).map((r) => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Subrubro</Form.Label>
                    <Form.Select
                      value={form.subrubro_id}
                      onChange={(e) => setForm({ ...form, subrubro_id: e.target.value })}
                      disabled={onlyView || !form.rubro_id}
                    >
                      <option value="">Seleccionar</option>
                      {subrubros.filter((s) => s.activo).map((s) => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Activo"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  disabled={onlyView}
                />
              </Form.Group>

              {!producto?.id && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Código de variante *</Form.Label>
                    <Form.Control
                      type="text"
                      value={codigoVariante}
                      onChange={(e) => setCodigoVariante(e.target.value)}
                      isInvalid={!!errors.codigoVariante}
                      disabled={onlyView}
                      placeholder="Ej: N20L"
                    />
                    <Form.Control.Feedback type="invalid">{errors.codigoVariante}</Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Presentación *</Form.Label>
                    {errors.presentaciones && (
                      <div className="text-danger mb-2" style={{ fontSize: '0.85rem' }}>
                        {errors.presentaciones}
                      </div>
                    )}
                    <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {presentaciones.filter((p) => p.activo).map((p) => (
                        <Form.Check
                          key={p.id}
                          type="radio"
                          name="presentacion"
                          label={`${p.nombre} (${p.cantidad_base} ${p.unidad_base || ''})`}
                          checked={presentacionSeleccionada === String(p.id)}
                          onChange={() => setPresentacionSeleccionada(String(p.id))}
                          disabled={onlyView}
                          className="mb-1"
                        />
                      ))}
                    </div>
                  </Form.Group>
                </>
              )}

              {producto?.id && variantesExistentes.length > 0 && (
                <Form.Group className="mb-3">
                  <Form.Label>Variantes actuales</Form.Label>
                  <div className="border rounded p-2">
                    {variantesExistentes.map((v) => (
                      <div key={v.id} className="d-flex align-items-center gap-2 mb-2">
                        <Form.Control
                          size="sm"
                          type="text"
                          value={v.codigo}
                          disabled
                          style={{ maxWidth: '120px' }}
                          className="bg-light"
                        />
                        <Form.Select
                          size="sm"
                          value={v.presentation_id}
                          onChange={(e) => handleChangePresentacion(v.id, e.target.value)}
                          disabled={onlyView}
                          style={{ maxWidth: '250px' }}
                        >
                          {presentaciones.filter((p) => p.activo).map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} ({p.cantidad_base} {p.unidad_base || ''})
                            </option>
                          ))}
                        </Form.Select>
                        {!onlyView && variantesExistentes.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleEliminarVariante(v.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        )}
                      </div>
                    ))}
                    {!onlyView && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="mt-1"
                        onClick={handleAgregarVariante}
                      >
                        <i className="bi bi-plus-lg me-1"></i>Agregar presentación
                      </Button>
                    )}
                  </div>
                </Form.Group>
              )}
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
                  onDragOver={(e) => e.preventDefault()}
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
                        src={imagePreview}
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
                            onClick={(e) => { e.stopPropagation(); handleUploadImage(); }}
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
                            onClick={(e) => { e.stopPropagation(); handleDeleteImage(); }}
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