import { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { getArchivos, uploadArchivos, deleteArchivo } from '../api/remitos';

const UploadRemitoPhoto = ({ remito, onClose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [archivosExistentes, setArchivosExistentes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    cargarArchivos();
  }, []);

  const cargarArchivos = async () => {
    try {
      const res = await getArchivos(remito.id);
      setArchivosExistentes(res.data || []);
    } catch (err) {
      console.error('Error al cargar archivos:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024;

    const validFiles = selectedFiles.filter((f) => {
      if (!allowedTypes.includes(f.type)) {
        setError(`${f.name}: formato no permitido`);
        return false;
      }
      if (f.size > maxSize) {
        setError(`${f.name}: excede 10MB`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistente = async (archivoId) => {
    try {
      await deleteArchivo(remito.id, archivoId);
      await cargarArchivos();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar archivo');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Seleccione al menos un archivo');
      return;
    }
    try {
      setIsUploading(true);
      setError('');
      const user = JSON.parse(localStorage.getItem('user'));
      const formData = new FormData();
      files.forEach((f) => formData.append('archivos', f));
      formData.append('uploaded_by', user?.id || '');
      await uploadArchivos(remito.id, formData);
      setFiles([]);
      await cargarArchivos();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir archivos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const fakeEvent = { target: { files: droppedFiles } };
    handleFileChange(fakeEvent);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (mime) => mime?.startsWith('image/');
  const isPdf = (mime) => mime === 'application/pdf';

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Archivos del remito {remito?.remito_number}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Archivos existentes */}
        {archivosExistentes.length > 0 && (
          <div className="mb-3">
            <h6 className="text-muted mb-2">Archivos cargados</h6>
            <div className="d-flex flex-column gap-2">
              {archivosExistentes.map((arch) => (
                <div key={arch.id} className="d-flex align-items-center gap-2 p-2 border rounded">
                  {isImage(arch.mime_type) ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${arch.path}`}
                      alt={arch.original_name}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : isPdf(arch.mime_type) ? (
                    <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: '1.5rem' }}></i>
                  ) : (
                    <i className="bi bi-file text-secondary" style={{ fontSize: '1.5rem' }}></i>
                  )}
                  <div className="flex-grow-1">
                    <small className="d-block">{arch.original_name}</small>
                    <small className="text-muted">{formatSize(arch.size)}</small>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteExistente(arch.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zona de carga */}
        <div
          className={`border rounded p-4 text-center mb-3 ${files.length > 0 ? 'border-primary' : ''}`}
          style={{ borderStyle: 'dashed', cursor: 'pointer', backgroundColor: '#f8f9fa' }}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <i className="bi bi-cloud-arrow-up text-secondary" style={{ fontSize: '2.5rem' }}></i>
          <p className="mt-2 mb-0">
            <strong>Haga clic para seleccionar</strong> o arrastre archivos aquí
          </p>
          <small className="text-muted">Imágenes (JPG, PNG, WebP) y PDF - Máx 10MB cada uno</small>
        </div>

        {/* Archivos pendientes de subir */}
        {files.length > 0 && (
          <div className="mb-3">
            <h6 className="text-muted mb-2">Archivos pendientes ({files.length})</h6>
            <div className="d-flex flex-column gap-1">
              {files.map((f, i) => (
                <div key={i} className="d-flex align-items-center gap-2 p-1 px-2 border rounded bg-light">
                  {f.type.startsWith('image/') ? (
                    <i className="bi bi-image text-primary"></i>
                  ) : (
                    <i className="bi bi-file-earmark-pdf text-danger"></i>
                  )}
                  <small className="flex-grow-1 text-truncate">{f.name}</small>
                  <small className="text-muted">{formatSize(f.size)}</small>
                  <button
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="text-danger">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? 'Subiendo...' : `Subir ${files.length > 0 ? `(${files.length})` : ''}`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadRemitoPhoto;