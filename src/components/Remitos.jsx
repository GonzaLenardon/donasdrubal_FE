import { useState, useEffect } from 'react';
import { allRemitos, dispatchRemito, receiveRemito, cancelRemito } from '../api/remitos';
import { allWarehouses } from '../api/depositos';
import { allProducts } from '../api/productos';
import { allCliente } from '../api/clientes';
import Spinner from './Spinner';
import ModalRemitos from './ModalRemitos';
import ModalVerRemito from './ModalVerRemito';
import { useIsMobile } from '../hooks/useIsMobile';

const STATUS_COLORS = {
  PENDIENTE: '#EF9F27',
  DESPACHADO: '#3b82f6',
  RECIBIDO: '#146c43',
  ANULADO: '#dc3545',
};

const Remitos = () => {
  const [remitos, setRemitos] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [verRemito, setVerRemito] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [remitosRes, depositosRes, productosRes, clientesRes] =
        await Promise.all([
          allRemitos(),
          allWarehouses(),
          allProducts(),
          allCliente(),
        ]);
      setRemitos(remitosRes.data);
      setDepositos(depositosRes.data);
      setProductos(productosRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDespachar = async (id) => {
    try {
      await dispatchRemito(id);
      await cargarDatos();
    } catch (error) {
      console.error('Error al despachar:', error);
    }
  };

  const handleRecibir = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await receiveRemito(id, user?.id);
      await cargarDatos();
    } catch (error) {
      console.error('Error al recibir:', error);
    }
  };

  const handleAnular = async (id) => {
    if (!window.confirm('¿Está seguro de anular este remito? Se revertirá el stock.')) return;
    try {
      await cancelRemito(id);
      await cargarDatos();
    } catch (error) {
      console.error('Error al anular:', error);
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

  const remitosFiltrados = filtroEstado
    ? remitos.filter((r) => r.status === filtroEstado)
    : remitos;

  if (loading) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ fontWeight: 600, color: '#1a1a2e' }}>
            Remitos
          </h2>
          <p className="text-muted mb-0">{remitos.length} remitos registrados</p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setIsOpen(true)}
        >
          <i className="bi bi-plus-lg" style={{ fontSize: 13 }}></i>
          {!isMobile && 'Nuevo Remito'}
        </button>
      </div>

      <div className="d-flex gap-2 mb-3 flex-wrap">
        {['', 'PENDIENTE', 'DESPACHADO', 'RECIBIDO', 'ANULADO'].map((estado) => (
          <button
            key={estado}
            className={`btn btn-sm ${filtroEstado === estado ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setFiltroEstado(estado)}
          >
            {estado || 'Todos'}
          </button>
        ))}
      </div>

      {isMobile ? (
        <div className="d-flex flex-column gap-2">
          {remitosFiltrados.length === 0 ? (
            <p className="text-center text-muted py-4">Sin remitos registrados</p>
          ) : (
            remitosFiltrados.map((remito) => (
              <div
                key={remito.id}
                className="card p-3"
                style={{ cursor: 'pointer', borderLeft: `4px solid ${STATUS_COLORS[remito.status]}` }}
                onClick={() => setVerRemito(remito)}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1" style={{ fontWeight: 600 }}>
                      {remito.remito_number}
                    </h6>
                    <small className="text-muted">
                      {remito.type === 'OFICIAL' ? 'Oficial' : 'No Oficial'} |{' '}
                      {getNombreDeposito(remito.origin_warehouse_id)}
                    </small>
                    <div>
                      <small className="text-muted">
                        Cliente: {getNombreCliente(remito.destination_client_id)}
                      </small>
                    </div>
                    <div>
                      <small className="text-muted">{formatDate(remito.issued_at)}</small>
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <span
                      className="badge"
                      style={{ backgroundColor: STATUS_COLORS[remito.status] }}
                    >
                      {remito.status}
                    </span>
                    <div className="d-flex gap-1">
                      {remito.status === 'PENDIENTE' && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Despachar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDespachar(remito.id);
                            }}
                          >
                            <i className="bi bi-truck"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Anular"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnular(remito.id);
                            }}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      )}
                      {remito.status === 'DESPACHADO' && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          title="Recibir"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecibir(remito.id);
                          }}
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Depósito Origen</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {remitosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    Sin remitos registrados
                  </td>
                </tr>
              ) : (
                remitosFiltrados.map((remito) => (
                  <tr
                    key={remito.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setVerRemito(remito)}
                  >
                    <td><strong>{remito.remito_number}</strong></td>
                    <td>{remito.type === 'OFICIAL' ? 'Oficial' : 'No Oficial'}</td>
                    <td>{getNombreDeposito(remito.origin_warehouse_id)}</td>
                    <td>{getNombreCliente(remito.destination_client_id)}</td>
                    <td>{formatDate(remito.issued_at)}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: STATUS_COLORS[remito.status] }}
                      >
                        {remito.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {remito.status === 'PENDIENTE' && (
                        <>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            title="Despachar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDespachar(remito.id);
                            }}
                          >
                            <i className="bi bi-truck"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Anular"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnular(remito.id);
                            }}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      )}
                      {remito.status === 'DESPACHADO' && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          title="Recibir"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecibir(remito.id);
                          }}
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isOpen && (
        <ModalRemitos
          depositos={depositos}
          productos={productos}
          clientes={clientes}
          onClose={() => setIsOpen(false)}
          onSave={async () => {
            setIsOpen(false);
            await cargarDatos();
          }}
        />
      )}

      {verRemito && (
        <ModalVerRemito
          remito={verRemito}
          depositos={depositos}
          clientes={clientes}
          onClose={() => setVerRemito(null)}
        />
      )}
    </div>
  );
};

export default Remitos;
