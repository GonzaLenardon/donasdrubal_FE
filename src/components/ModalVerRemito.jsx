import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { getRemito } from '../api/remitos';

const STATUS_COLORS = {
  PENDIENTE: '#EF9F27',
  DESPACHADO: '#3b82f6',
  RECIBIDO: '#146c43',
  ANULADO: '#dc3545',
};

const ModalVerRemito = ({ remito, depositos, clientes, onClose }) => {
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR');
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
                <small className="text-muted">Fecha Emisión</small>
                <div>{formatDate(remito.issued_at)}</div>
              </div>
            </div>

            {remito.notes && (
              <div className="mb-3">
                <small className="text-muted">Notas</small>
                <div>{remito.notes}</div>
              </div>
            )}

            <hr />
            <h6>Ítems</h6>
            {detalle?.items?.length > 0 ? (
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant. Solicitada</th>
                    <th>Cant. Despachada</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {detalle.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.producto?.nombre || `#${item.product_id}`}</td>
                      <td>{parseFloat(item.quantity_requested).toFixed(2)}</td>
                      <td>{parseFloat(item.quantity_dispatched || 0).toFixed(2)}</td>
                      <td>{item.description || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted">Sin ítems</p>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalVerRemito;
