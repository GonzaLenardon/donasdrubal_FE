import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { getRemito } from '../api/remitos';

const STATUS_COLORS = {
  PENDIENTE: '#EF9F27',
  REVISION: '#3b82f6',
  COMPLETADO: '#146c43',
  ANULADO: '#dc3545',
};

const ModalVerRemito = ({ remito, depositos, clientes, onClose, onAnular, onConfirmar, onSubirFoto }) => {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDetalle();
  }, [remito.id]);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      const res = await getRemito(remito.id);
      setDetalle(res.data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNombreDeposito = (id) => {
    const d = depositos.find((dep) => dep.id === id);
    return d ? `${d.nombre} (${d.codigo})` : `Depósito #${id}`;
  };

  const getNombreCliente = (id) => {
    const c = clientes.find((cl) => cl.id === id);
    return c ? c.razon_social : `Cliente #${id}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('es-AR');
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Detalle Remito {remito.remito_number}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p className="text-center">Cargando...</p>
        ) : (
          <>
            <div className="row mb-3">
              <div className="col-md-6">
                <small className="text-muted">Número</small>
                <div><strong>{remito.remito_number}</strong></div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Estado</small>
                <div>
                  <span
                    className="badge"
                    style={{ backgroundColor: STATUS_COLORS[remito.status] }}
                  >
                    {remito.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <small className="text-muted">Tipo</small>
                <div>{remito.type === 'OFICIAL' ? 'Oficial' : 'No Oficial'}</div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Depósito Origen</small>
                <div>{getNombreDeposito(remito.origin_warehouse_id)}</div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <small className="text-muted">Cliente</small>
                <div>{getNombreCliente(remito.destination_client_id)}</div>
              </div>
              <div className="col-md-6">
                <small className="text-muted">Fecha Creación</small>
                <div>{formatDateTime(remito.createdAt)}</div>
              </div>
            </div>

            {remito.photo_path && (
              <div className="mb-3">
                <small className="text-muted">Foto del remito firmado</small>
                <div className="mt-2">
                  <img
                    src={remito.photo_path}
                    alt="Remito firmado"
                    className="img-thumbnail"
                    style={{ maxHeight: '300px', cursor: 'pointer' }}
                    onClick={() => window.open(remito.photo_path, '_blank')}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="text-muted">
                    No se pudo cargar la imagen
                  </div>
                </div>
                {remito.photo_uploaded_at && (
                  <small className="text-muted">
                    Subida el: {formatDateTime(remito.photo_uploaded_at)}
                  </small>
                )}
              </div>
            )}

            {(remito.confirmed_at || remito.confirmadoPor) && (
              <div className="alert alert-success py-2 mb-3">
                <small>
                  <strong>Confirmado</strong> el {formatDateTime(remito.confirmed_at)}
                  {remito.confirmadoPor && ` por ${remito.confirmadoPor.nombre || remito.confirmadoPor.email}`}
                </small>
              </div>
            )}

            {(remito.cancelled_at || remito.canceladoPor) && (
              <div className="alert alert-danger py-2 mb-3">
                <small>
                  <strong>Anulado</strong> el {formatDateTime(remito.cancelled_at)}
                  {remito.canceladoPor && ` por ${remito.canceladoPor.nombre || remito.canceladoPor.email}`}
                </small>
              </div>
            )}

            {remito.notes && (
              <div className="mb-3">
                <small className="text-muted">Notas</small>
                <div>{remito.notes}</div>
              </div>
            )}

            <hr />
            <h6>Ítems</h6>
            {detalle?.items?.length > 0 ? (
              detalle.items.map((item) => (
                <div key={item.id} className="card mb-2 p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong>{item.producto?.nombre || `#${item.product_id}`}</strong>
                      {item.presentacion && (
                        <small className="text-muted ms-2">({item.presentacion.nombre})</small>
                      )}
                      {item.description && (
                        <small className="text-muted ms-2">({item.description})</small>
                      )}
                    </div>
                    <span className="badge bg-primary">
                      {parseFloat(item.quantity_dispatched || 0).toFixed(2)} unidades base
                    </span>
                  </div>

                  {item.lotes?.length > 0 ? (
                    <div className="ms-3">
                      <small className="text-muted d-block mb-1">Lotes consumidos:</small>
                      <table className="table table-sm mb-0" style={{ fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th>Lote</th>
                            <th>Cantidad despachada</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.lotes.map((loteItem) => (
                            <tr key={loteItem.id}>
                              <td>{loteItem.lote?.lot_number || `#${loteItem.product_lot_id}`}</td>
                              <td>{parseFloat(loteItem.quantity_dispatched).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <small className="text-muted ms-3">Sin detalle de lotes</small>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted">Sin ítems</p>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {remito.status === 'PENDIENTE' && (
          <Button variant="outline-primary" onClick={onSubirFoto}>
            <i className="bi bi-camera me-1"></i> Subir foto
          </Button>
        )}
        {remito.status === 'REVISION' && (
          <>
            <Button variant="outline-primary" onClick={onSubirFoto}>
              <i className="bi bi-camera me-1"></i> Reemplazar foto
            </Button>
            <Button variant="success" onClick={onConfirmar}>
              <i className="bi bi-check-lg me-1"></i> Confirmar
            </Button>
          </>
        )}
        {(remito.status === 'PENDIENTE' || remito.status === 'REVISION') && (
          <Button variant="outline-danger" onClick={onAnular}>
            <i className="bi bi-x-lg me-1"></i> Anular
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalVerRemito;
