import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  ClipboardList,
  Image as ImageIcon,
  Camera,
  Check,
  X,
  Info,
  User,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  allRemitos,
  cancelRemito,
  confirmRemito,
  getRemito,
} from '../api/remitos';
import { allWarehouses } from '../api/depositos';
import { allCliente } from '../api/clientes';
import Spinner from './Spinner';
import ModalRemitoCatalogo from './ModalRemitoCatalogo';
import UploadRemitoPhoto from './UploadRemitoPhoto';
import { useIsMobile } from '../hooks/useIsMobile';
import '../css/page-header.css';

const STATUS_COLORS = {
  PENDIENTE: '#EF9F27',
  REVISION: '#3b82f6',
  COMPLETADO: '#146c43',
  ANULADO: '#dc3545',
};

const FILTROS_ESTADO = [
  { value: '', label: 'Todos', dot: null },
  { value: 'PENDIENTE', label: 'Pendiente', dot: '#EF9F27' },
  { value: 'REVISION', label: 'Revisión', dot: '#3b82f6' },
  { value: 'COMPLETADO', label: 'Completado', dot: '#5DCAA5' },
  { value: 'ANULADO', label: 'Anulado', dot: '#F09595' },
];

const Remitos = () => {
  const [remitos, setRemitos] = useState([]);
  const [depositos, setDepositos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [subirFotoRemito, setSubirFotoRemito] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [selectedRemitoId, setSelectedRemitoId] = useState(null);
  const [remitoDetalle, setRemitoDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (selectedRemitoId) {
      cargarDetalleRemito(selectedRemitoId);
    } else {
      setRemitoDetalle(null);
    }
  }, [selectedRemitoId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [remitosRes, depositosRes, clientesRes] = await Promise.all([
        allRemitos(),
        allWarehouses(),
        allCliente(),
      ]);
      setRemitos(remitosRes.data);
      setDepositos(depositosRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleRemito = async (id) => {
    try {
      setLoadingDetalle(true);
      const res = await getRemito(id);
      setRemitoDetalle(res.data);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleSelectRemito = (remito) => {
    setSelectedRemitoId(remito.id);
  };

  const handleAnular = async (id) => {
    if (
      !window.confirm(
        '¿Está seguro de anular este remito? Se revertirá el stock.',
      )
    )
      return;
    try {
      await cancelRemito(id);
      await cargarDatos();
      if (selectedRemitoId === id) {
        setSelectedRemitoId(null);
      }
    } catch (error) {
      console.error('Error al anular:', error);
    }
  };

  const handleConfirmar = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await confirmRemito(id, user?.id);
      await cargarDatos();
      if (selectedRemitoId === id) {
        cargarDetalleRemito(id);
      }
    } catch (error) {
      console.error('Error al confirmar:', error);
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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('es-AR');
  };

  const contarPorEstado = (estado) =>
    estado ? remitos.filter((r) => r.status === estado).length : remitos.length;

  const remitosFiltrados = filtroEstado
    ? remitos.filter((r) => r.status === filtroEstado)
    : remitos;

  const remitoSeleccionado = remitos.find((r) => r.id === selectedRemitoId);

  const totalItems = (remitoDetalle?.items || []).reduce(
    (acc, item) => acc + parseFloat(item.quantity_dispatched || 0),
    0,
  );

  const renderAccionesFila = (remito, vertical = false) => {
    if (remito.status !== 'PENDIENTE' && remito.status !== 'REVISION') {
      return null;
    }
    return (
      <div
        className={`remitos-acciones ${vertical ? 'remitos-acciones--col' : ''}`}
      >
        {remito.status === 'PENDIENTE' && (
          <button
            className="remitos-btn remitos-btn--icon remitos-btn--primary"
            title="Subir foto del remito firmado"
            onClick={(e) => {
              e.stopPropagation();
              setSubirFotoRemito(remito);
            }}
          >
            <Camera size={14} />
          </button>
        )}
        {remito.status === 'REVISION' && (
          <button
            className="remitos-btn remitos-btn--icon remitos-btn--success"
            title="Confirmar remito"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmar(remito.id);
            }}
          >
            <Check size={14} />
          </button>
        )}
        <button
          className="remitos-btn remitos-btn--icon remitos-btn--danger"
          title="Anular"
          onClick={(e) => {
            e.stopPropagation();
            handleAnular(remito.id);
          }}
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  const renderRemitoDatos = () => (
    <div className="remitos-box__body">
      <dl className="remitos-kv">
        <dt>Tipo</dt>
        <dd>
          <span
            className={`remitos-badge ${
              remitoSeleccionado.type === 'OFICIAL'
                ? 'remitos-badge--oficial'
                : 'remitos-badge--no-oficial'
            }`}
          >
            {remitoSeleccionado.type === 'OFICIAL' ? 'Oficial' : 'No Oficial'}
          </span>
        </dd>
        <dt>Cliente</dt>
        <dd>{getNombreCliente(remitoSeleccionado.destination_client_id)}</dd>
        <dt>Depósito</dt>
        <dd>{getNombreDeposito(remitoSeleccionado.origin_warehouse_id)}</dd>
        <dt>Creación</dt>
        <dd>{formatDateTime(remitoSeleccionado.createdAt)}</dd>
      </dl>

      {remitoSeleccionado.notes && (
        <div className="remitos-note remitos-note--warning">
          <Info size={14} />
          <span>{remitoSeleccionado.notes}</span>
        </div>
      )}

      <table className="remitos-items">
        <thead>
          <tr>
            <th>Artículo</th>
            <th className="text-end">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {remitoDetalle?.items?.length > 0 ? (
            remitoDetalle.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="remitos-items__nombre">
                    {item.producto?.nombre || `#${item.product_id}`}
                  </span>
                  {item.presentacion && (
                    <span className="remitos-badge remitos-badge--neutral ms-2">
                      {item.presentacion.nombre}
                    </span>
                  )}
                  {item.lotes?.length > 0 && (
                    <div className="remitos-items__lotes">
                      {item.lotes
                        .map(
                          (loteItem) =>
                            `Lote ${
                              loteItem.lote?.lot_number ||
                              `#${loteItem.product_lot_id}`
                            }: ${parseFloat(loteItem.quantity_dispatched).toFixed(2)}`,
                        )
                        .join(' · ')}
                    </div>
                  )}
                </td>
                <td className="text-end remitos-items__cantidad">
                  {parseFloat(item.quantity_dispatched || 0).toFixed(2)} ud
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="remitos-vacio">
                Sin ítems
              </td>
            </tr>
          )}
        </tbody>
        {remitoDetalle?.items?.length > 0 && (
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="text-end">{totalItems.toFixed(2)} ud</td>
            </tr>
          </tfoot>
        )}
      </table>

      {(remitoSeleccionado.confirmed_at ||
        remitoSeleccionado.confirmadoPor) && (
        <div className="remitos-note remitos-note--ok">
          <Check size={14} />
          <span>
            Confirmado el {formatDateTime(remitoSeleccionado.confirmed_at)}
            {remitoSeleccionado.confirmadoPor &&
              ` por ${remitoSeleccionado.confirmadoPor.nombre || remitoSeleccionado.confirmadoPor.email}`}
          </span>
        </div>
      )}

      {(remitoSeleccionado.cancelled_at || remitoSeleccionado.canceladoPor) && (
        <div className="remitos-note remitos-note--danger">
          <X size={14} />
          <span>
            Anulado el {formatDateTime(remitoSeleccionado.cancelled_at)}
            {remitoSeleccionado.canceladoPor &&
              ` por ${remitoSeleccionado.canceladoPor.nombre || remitoSeleccionado.canceladoPor.email}`}
          </span>
        </div>
      )}

      {remitoSeleccionado.status === 'PENDIENTE' && (
        <div className="remitos-note">
          <Info size={14} />
          <span>Falta subir la foto del remito firmado.</span>
        </div>
      )}

      {remitoSeleccionado.status === 'REVISION' && (
        <div className="remitos-note">
          <Info size={14} />
          <span>Foto cargada, falta confirmar.</span>
        </div>
      )}

      <div className="remitos-box__acciones">
        {remitoSeleccionado.status === 'PENDIENTE' && (
          <button
            className="remitos-btn remitos-btn--primary"
            onClick={() => setSubirFotoRemito(remitoSeleccionado)}
          >
            <Camera size={14} /> Subir foto
          </button>
        )}
        {remitoSeleccionado.status === 'REVISION' && (
          <>
            <button
              className="remitos-btn remitos-btn--primary"
              onClick={() => setSubirFotoRemito(remitoSeleccionado)}
            >
              <Camera size={14} /> Reemplazar foto
            </button>
            <button
              className="remitos-btn remitos-btn--success"
              onClick={() => handleConfirmar(remitoSeleccionado.id)}
            >
              <Check size={14} /> Confirmar
            </button>
          </>
        )}
        {(remitoSeleccionado.status === 'PENDIENTE' ||
          remitoSeleccionado.status === 'REVISION') && (
          <button
            className="remitos-btn remitos-btn--danger"
            onClick={() => handleAnular(remitoSeleccionado.id)}
          >
            <X size={14} /> Anular
          </button>
        )}
      </div>
    </div>
  );

  const renderRemitoImagen = () =>
    remitoSeleccionado?.photo_path ? (
      <>
        <img
          src={`${import.meta.env.VITE_API_URL}${remitoSeleccionado.photo_path}`}
          alt="Remito físico"
          className="remitos-visor__img"
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_URL}${remitoSeleccionado.photo_path}`,
              '_blank',
            )
          }
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="remitos-visor__empty" style={{ display: 'none' }}>
          <ImageIcon size={44} />
          <p>No se pudo cargar la imagen</p>
        </div>
      </>
    ) : (
      <div className="remitos-visor__empty">
        <ImageIcon size={44} />
        <p>Sin imagen del remito físico</p>
        {remitoSeleccionado?.status === 'PENDIENTE' && (
          <button
            className="remitos-btn remitos-btn--primary"
            onClick={() => setSubirFotoRemito(remitoSeleccionado)}
          >
            <Camera size={14} /> Subir foto
          </button>
        )}
      </div>
    );

  if (loading) return <Spinner />;

  return (
    <div className="remitos py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="page-header__title">
            <FileText size={22} className="page-header__icon" />
            Remitos
          </h2>
          <p className="page-header__subtitle">
            {remitos.length} remitos registrados
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsOpen(true)}>
          <i className="bi bi-plus-lg"></i>

          {!isMobile && 'Nuevo Remito'}
        </button>
      </div>

      <div className="remitos-surface">
        <div className="remitos-surface__header">
          <h3 className="remitos-surface__title">
            <ClipboardList size={16} />
            Registros
          </h3>
          <div className="remitos-pills">
            {FILTROS_ESTADO.map((filtro) => (
              <button
                key={filtro.value}
                className={`remitos-pill ${
                  filtroEstado === filtro.value ? 'remitos-pill--active' : ''
                }`}
                onClick={() => setFiltroEstado(filtro.value)}
              >
                {filtro.dot && (
                  <span
                    className="remitos-pill__dot"
                    style={{ backgroundColor: filtro.dot }}
                  />
                )}
                {filtro.label} ({contarPorEstado(filtro.value)})
              </button>
            ))}
          </div>
        </div>

        {isMobile ? (
          <div className="remitos-scroll">
            <div className="d-flex flex-column gap-2">
              {remitosFiltrados.length === 0 ? (
                <p className="remitos-vacio">Sin remitos registrados</p>
              ) : (
                remitosFiltrados.map((remito) => (
                  <div
                    key={remito.id}
                    className={`remitos-card ${
                      selectedRemitoId === remito.id
                        ? 'remitos-card--selected'
                        : ''
                    }`}
                    style={{ '--remito-status': STATUS_COLORS[remito.status] }}
                    onClick={() => handleSelectRemito(remito)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="remitos-card__numero">
                            {remito.remito_number}
                          </h6>
                          <span
                            className={`remitos-badge remitos-badge--${remito.status.toLowerCase()}`}
                            style={{
                              backgroundColor: STATUS_COLORS[remito.status],
                            }}
                          >
                            {remito.status}
                          </span>
                        </div>
                        <small className="remitos-card__dato">
                          {remito.type === 'OFICIAL' ? 'Oficial' : 'No Oficial'}{' '}
                          · {getNombreDeposito(remito.origin_warehouse_id)}
                        </small>
                        <small className="remitos-card__dato">
                          <User size={12} />
                          {getNombreCliente(remito.destination_client_id)}
                        </small>
                        <small className="remitos-card__dato">
                          <Calendar size={12} />
                          {formatDate(remito.createdAt)}
                        </small>
                      </div>
                      {renderAccionesFila(remito, true)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="remitos-box">
            <div className="remitos-scroll">
              <table className="remitos-table">
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
                      <td colSpan={7} className="remitos-vacio">
                        Sin remitos registrados
                      </td>
                    </tr>
                  ) : (
                    remitosFiltrados.map((remito) => (
                      <tr
                        key={remito.id}
                        className={`remitos-table__row ${
                          selectedRemitoId === remito.id
                            ? 'remitos-table__row--selected'
                            : ''
                        }`}
                        style={{
                          '--remito-status': STATUS_COLORS[remito.status],
                        }}
                        onClick={() => handleSelectRemito(remito)}
                      >
                        <td className="remitos-table__numero">
                          {remito.remito_number}
                        </td>
                        <td>
                          <span
                            className={`remitos-badge ${
                              remito.type === 'OFICIAL'
                                ? 'remitos-badge--oficial'
                                : 'remitos-badge--no-oficial'
                            }`}
                          >
                            {remito.type === 'OFICIAL'
                              ? 'Oficial'
                              : 'No Oficial'}
                          </span>
                        </td>
                        <td>{getNombreDeposito(remito.origin_warehouse_id)}</td>
                        <td>
                          {getNombreCliente(remito.destination_client_id)}
                        </td>
                        <td>{formatDate(remito.createdAt)}</td>
                        <td>
                          <span
                            className={`remitos-badge remitos-badge--${remito.status.toLowerCase()}`}
                            style={{
                              backgroundColor: STATUS_COLORS[remito.status],
                            }}
                          >
                            {remito.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {renderAccionesFila(remito)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedRemitoId && remitoSeleccionado ? (
          <div className="row g-2 remitos-detalle">
            <div className="col-12 col-md-7">
              <div className="remitos-box remitos-box--fill">
                <div className="remitos-box__header">
                  <h4 className="remitos-box__title">
                    <FileText size={16} />
                    Remito digital {remitoSeleccionado.remito_number}
                  </h4>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className={`remitos-badge remitos-badge--pill remitos-badge--${remitoSeleccionado.status.toLowerCase()}`}
                      style={{
                        backgroundColor:
                          STATUS_COLORS[remitoSeleccionado.status],
                      }}
                    >
                      {remitoSeleccionado.status}
                    </span>
                    <button
                      className="remitos-cerrar"
                      title="Cerrar detalle"
                      onClick={() => setSelectedRemitoId(null)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                {loadingDetalle ? (
                  <div className="remitos-box__body justify-content-center align-items-center">
                    <Spinner />
                  </div>
                ) : remitoDetalle ? (
                  renderRemitoDatos()
                ) : (
                  <div className="remitos-box__body">
                    <p className="remitos-vacio">
                      No se pudo cargar el detalle
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 col-md-5">
              <div className="remitos-box remitos-box--fill">
                <div className="remitos-box__header">
                  <h4 className="remitos-box__title">
                    <ImageIcon size={16} />
                    Remito físico
                  </h4>
                  <span className="remitos-box__meta">
                    {remitoSeleccionado.remito_number}
                  </span>
                </div>
                <div className="remitos-visor">{renderRemitoImagen()}</div>
                {remitoSeleccionado.photo_uploaded_at && (
                  <div className="remitos-box__footer">
                    <Clock size={12} />
                    Subida el{' '}
                    {formatDateTime(remitoSeleccionado.photo_uploaded_at)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="remitos-box remitos-placeholder">
            Seleccioná un remito para ver su detalle y la foto firmada.
          </div>
        )}
      </div>

      {isOpen && (
        <ModalRemitoCatalogo
          depositos={depositos}
          clientes={clientes}
          onClose={() => setIsOpen(false)}
          onSave={async () => {
            setIsOpen(false);
            await cargarDatos();
          }}
        />
      )}

      {subirFotoRemito && (
        <UploadRemitoPhoto
          remito={subirFotoRemito}
          onClose={() => setSubirFotoRemito(null)}
          onSuccess={() => {
            setSubirFotoRemito(null);
            cargarDatos();
            if (selectedRemitoId) {
              cargarDetalleRemito(selectedRemitoId);
            }
          }}
        />
      )}
    </div>
  );
};

export default Remitos;
