import { useState, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { uploadPhoto } from '../api/remitos';

const UploadRemitoPhoto = ({ remito, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(remito?.photo_path || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo debe ser menor a 10MB');
        return;
      }
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Formato no permitido. Use JPG, PNG o WebP');
        return;
      }
      setFile(selectedFile);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Seleccione una imagen');
      return;
    }
    try {
      setIsUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('photo', file);
      await uploadPhoto(remito.id, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Subir foto del remito firmado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">
          Remito: <strong>{remito?.remito_number}</strong>
        </p>

        {preview && remito?.photo_path && !file && (
          <div className="mb-3">
            <p className="text-muted mb-2">Foto actual:</p>
            <img
              src={remito.photo_path}
              alt="Remito firmado"
              className="img-thumbnail"
              style={{ maxHeight: '200px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div
          className={`border rounded p-4 text-center mb-3 ${file ? 'border-primary' : ''}`}
          style={{
            borderStyle: 'dashed',
            cursor: 'pointer',
            backgroundColor: '#f8f9fa',
          }}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {preview && file ? (
            <div>
              <img
                src={preview}
                alt="Preview"
                style={{ maxHeight: '200px' }}
                className="img-thumbnail mb-2"
              />
              <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                <i className="bi bi-arrow-repeat me-1"></i>
                Haga clic para cambiar la imagen
              </p>
            </div>
          ) : (
            <div>
              <i
                className="bi bi-camera-fill text-secondary"
                style={{ fontSize: '3rem' }}
              ></i>
              <p className="mt-2 mb-0">
                Toque para <strong>tomar foto</strong> o seleccionar de galería
              </p>
              <small className="text-muted">
                JPG, PNG, WebP (máx 10MB)
              </small>
            </div>
          )}
        </div>

        {error && <div className="text-danger">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? 'Subiendo...' : 'Subir foto'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadRemitoPhoto;
