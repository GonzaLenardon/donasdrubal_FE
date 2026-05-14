import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Spinner from './Spinner.jsx';
import { allUsers, allIngenieros } from '../api/users.js';
import { allCliente } from '../api/clientes.js';
import {
  createNotificacion,
  getNotificacionesEnviadas,
  getNotificacionesRecibidas,
  updateNotificacion,
} from '../api/notificaciones.js';

const TAB_RECIBIDAS = 'recibidas';
const TAB_ENVIADAS = 'enviadas';

const initialForm = {
  usuario_to_id: '',
  entidad_tipo: 'user',
  entidad_id: '',
  tipo_alerta: 'mensaje_recibido',
  categoria: 'sistema',
  estado: 'PENDIENTE',
  prioridad: 'NORMAL',
  titulo: '',
  mensaje: '',
  fecha_alerta: '',
  fecha_evento: '',
  fecha_vencimiento: '',
  requiere_accion: false,
  accion_texto: '',
  url_accion: '',
};

const getSessionUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch (error) {
    console.error('No se pudo leer el usuario de sesion', error);
    return null;
  }
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.payload)) return value.payload;
  if (Array.isArray(value?.rows)) return value.rows;
  return [];
};

const inferClienteUserId = (cliente) =>
  cliente?.user_id ||
  cliente?.usuario_id ||
  cliente?.usuario?.id ||
  cliente?.usuario_to_id ||
  '';

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const priorityClass = (value) => {
  if (value === 'URGENTE') return 'notif-pill notif-pill-danger';
  if (value === 'ALTA') return 'notif-pill notif-pill-warning';
  if (value === 'NORMAL') return 'notif-pill notif-pill-info';
  return 'notif-pill notif-pill-muted';
};

const stateClass = (value) => {
  if (value === 'RESUELTA' || value === 'COMPLETADO') {
    return 'notif-pill notif-pill-success';
  }
  if (value === 'VENCIDO') return 'notif-pill notif-pill-danger';
  if (value === 'PENDIENTE' || value === 'ACTIVA' || value === 'EN PROCESO') {
    return 'notif-pill notif-pill-warning';
  }
  return 'notif-pill notif-pill-muted';
};

const normalizeAlertList = (lista, destinatariosMap) =>
  toArray(lista)
    .map((item) => {
      const fromId = String(item.usuario_from_id ?? '');
      const toId = String(item.usuario_to_id ?? '');

      return {
        ...item,
        fromId,
        toId,
        remitente:
          fromId === '0'
            ? 'Sistema'
            : destinatariosMap.get(fromId)?.nombre ||
              item.usuario_from?.nombre ||
              item.usuario_from?.email ||
              `Usuario #${fromId}`,
        destinatario:
          destinatariosMap.get(toId)?.nombre ||
          item.usuario_to?.nombre ||
          item.usuario_to?.email ||
          `Usuario #${toId}`,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.fecha_creacion || b.createdAt || 0) -
        new Date(a.fecha_creacion || a.createdAt || 0),
    );

const prettyValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Sin datos';
  if (typeof value === 'boolean') return value ? 'Si' : 'No';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const Notifications = () => {
  const sessionUser = useMemo(() => getSessionUser(), []);
  const sessionUserId = String(sessionUser?.id || '');

  const [tab, setTab] = useState(TAB_RECIBIDAS);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(initialForm);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [editingNotificationId, setEditingNotificationId] = useState(null);
  const [recibidasApi, setRecibidasApi] = useState([]);
  const [enviadasApi, setEnviadasApi] = useState([]);
  const [users, setUsers] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  // const [clientes, setClientes] = useState([]);

  const destinatarios = useMemo(() => {
    const map = new Map();

    toArray(users).forEach((user) => {
      map.set(String(user.id), {
        id: String(user.id),
        nombre: user.nombre || user.email || `Usuario #${user.id}`,
        tipo: 'Ingeniero/Usuario',
        detalle: user.email || user.telefono || '',
      });
    });

    toArray(ingenieros).forEach((user) => {
      map.set(String(user.id), {
        id: String(user.id),
        nombre: user.nombre || user.email || `Ingeniero #${user.id}`,
        tipo: 'Ingeniero',
        detalle: user.email || user.telefono || '',
      });
    });

    // toArray(clientes).forEach((cliente) => {
    //   const userId = inferClienteUserId(cliente);
    //   if (!userId) return;

    //   map.set(String(userId), {
    //     id: String(userId),
    //     nombre: cliente.razon_social || `Cliente #${cliente.id}`,
    //     tipo: 'Cliente',
    //     detalle: cliente.email || cliente.cuil_cuit || '',
    //   });
    // });

    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [users, ingenieros]);
  // }, [users, ingenieros, clientes]);

  const destinatariosMap = useMemo(
    () => new Map(destinatarios.map((item) => [item.id, item])),
    [destinatarios],
  );

  const recibidas = useMemo(
    () => normalizeAlertList(recibidasApi, destinatariosMap),
    [recibidasApi, destinatariosMap],
  );

  const enviadas = useMemo(
    () => normalizeAlertList(enviadasApi, destinatariosMap),
    [enviadasApi, destinatariosMap],
  );

  const alertasNormalizadas = useMemo(
    () => [...recibidas, ...enviadas],
    [recibidas, enviadas],
  );

  const currentList = tab === TAB_RECIBIDAS ? recibidas : enviadas;

  const filteredList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return currentList;

    return currentList.filter((item) =>
      [
        item.titulo,
        item.mensaje,
        item.tipo_alerta,
        item.categoria,
        item.remitente,
        item.destinatario,
        item.estado,
        item.prioridad,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [currentList, searchTerm]);

  const stats = useMemo(
    () => ({
      recibidas: recibidas.length,
      enviadas: enviadas.length,
      pendientes: recibidas.filter((item) =>
        ['PENDIENTE', 'ACTIVA', 'EN PROCESO'].includes(item.estado),
      ).length,
      urgentes: alertasNormalizadas.filter((item) => item.prioridad === 'URGENTE')
        .length,
    }),
    [recibidas, enviadas, alertasNormalizadas],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});

      if (!sessionUserId) {
        setErrors({ fetch: 'No se encontro el usuario de sesion.' });
        return;
      }

      const [
        recibidasResp,
        enviadasResp,
        usersResp,
        ingenierosResp,
        // clientesResp,
      ] =
        await Promise.all([
          getNotificacionesRecibidas(sessionUserId),
          getNotificacionesEnviadas(sessionUserId),
          allUsers(),
          allIngenieros(),
          // allCliente(),
        ]);

      setRecibidasApi(toArray(recibidasResp));
      setEnviadasApi(toArray(enviadasResp));
      setUsers(usersResp);
      setIngenieros(ingenierosResp);
      // setClientes(clientesResp);
    } catch (error) {
      console.error('Error al cargar notificaciones', error);
      setErrors((prev) => ({
        ...prev,
        fetch:
          error.response?.data?.mensaje ||
          'No se pudieron cargar las notificaciones.',
      }));
    } finally {
      setLoading(false);
    }
  }, [sessionUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openModal = () => {
    const defaultUserId = toArray(users)[0]?.id ? String(toArray(users)[0].id) : '';
    const defaultDestinatarioId = destinatarios[0]?.id || '';

    setEditingNotificationId(null);
    setForm({
      ...initialForm,
      usuario_to_id: defaultDestinatarioId,
      entidad_id: defaultDestinatarioId || defaultUserId,
    });
    setErrors({});
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditingNotificationId(null);
    setForm(initialForm);
    setErrors({});
  };

  const openDetailModal = (notification) => {
    setSelectedNotification(notification);
    setDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedNotification(null);
    setDetailModal(false);
  };

  const toDateTimeLocal = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const openEditModal = (notification) => {
    setEditingNotificationId(notification.id);
    setForm({
      usuario_to_id: notification.toId || '',
      entidad_tipo: notification.entidad_tipo || 'user',
      entidad_id:
        notification.entidad_id !== null && notification.entidad_id !== undefined
          ? String(notification.entidad_id)
          : notification.toId || '',
      tipo_alerta: notification.tipo_alerta || 'mensaje_recibido',
      categoria: notification.categoria || 'sistema',
      estado: notification.estado || 'PENDIENTE',
      prioridad: notification.prioridad || 'NORMAL',
      titulo: notification.titulo || '',
      mensaje: notification.mensaje || '',
      fecha_alerta: toDateTimeLocal(notification.fecha_alerta),
      fecha_evento: toDateTimeLocal(notification.fecha_evento),
      fecha_vencimiento: toDateTimeLocal(notification.fecha_vencimiento),
      requiere_accion: Boolean(notification.requiere_accion),
      accion_texto: notification.accion_texto || '',
      url_accion: notification.url_accion || '',
    });
    setErrors({});
    setModal(true);
  };

  const handleForm = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setForm((prev) => {
      const updated = { ...prev, [name]: nextValue };

      if (name === 'usuario_to_id') {
        updated.entidad_id = value;
      }

      if (name === 'requiere_accion' && !checked) {
        updated.accion_texto = '';
        updated.url_accion = '';
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!sessionUserId) nextErrors.submit = 'No se encontro el usuario de sesion.';
    if (!form.usuario_to_id) nextErrors.usuario_to_id = 'Selecciona un destinatario.';
    if (!form.entidad_tipo) nextErrors.entidad_tipo = 'Selecciona una entidad.';
    if (!form.entidad_id) nextErrors.entidad_id = 'Indica el ID de la entidad.';
    if (!form.titulo.trim()) nextErrors.titulo = 'El titulo es obligatorio.';
    if (!form.mensaje.trim()) nextErrors.mensaje = 'El mensaje es obligatorio.';
    if (form.requiere_accion && !form.accion_texto.trim()) {
      nextErrors.accion_texto = 'Indica el texto de accion.';
    }
    if (form.requiere_accion && !form.url_accion.trim()) {
      nextErrors.url_accion = 'Indica la URL de accion.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveNotification = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setLoading(true);
      setMsg(
        editingNotificationId ? 'Actualizando notificacion...' : 'Creando notificacion...',
      );

      const payload = {
        usuario_from_id: Number(sessionUserId),
        usuario_to_id: Number(form.usuario_to_id),
        entidad_tipo: form.entidad_tipo || 'user',
        entidad_id: Number(form.entidad_id),
        tipo_alerta: form.tipo_alerta || 'mensaje_recibido',
        categoria: form.categoria || 'sistema',
        estado: form.estado || 'PENDIENTE',
        prioridad: form.prioridad,
        titulo: form.titulo.trim(),
        mensaje: form.mensaje.trim(),
        fecha_alerta: form.fecha_alerta || null,
        fecha_evento: form.fecha_evento || null,
        fecha_vencimiento: form.fecha_vencimiento || null,
        requiere_accion: form.requiere_accion,
        accion_texto: form.requiere_accion ? form.accion_texto.trim() : null,
        url_accion: form.requiere_accion ? form.url_accion.trim() : null,
        observaciones: null,
        metadata: null,
      };

      if (editingNotificationId) {
        await updateNotificacion(editingNotificationId, payload);
      } else {
        await createNotificacion(payload);
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error('Error al guardar notificacion', error);
      setErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.mensaje ||
          'No se pudo guardar la notificacion.',
      }));
    } finally {
      setLoading(false);
      setSaving(false);
      setMsg('');
    }
  };

  return (
    <>
      <div className="container_seccion">
        <div style={{ margin: '0 auto', width: '100%' }}>
          <div className="header">
            <div>
              <h2 className="title">Notificaciones</h2>
              <p className="subtitle">
                {stats.recibidas} recibidas, {stats.enviadas} enviadas
              </p>
            </div>

            <button className="btn-primary" onClick={openModal}>
              <i className="bi bi-plus-lg"></i>
              Nueva Notificacion
            </button>
          </div>

          <div className="notifications-kpi-grid">
            <div className="notifications-kpi-card">
              <span className="notifications-kpi-label">Recibidas</span>
              <strong className="notifications-kpi-value">{stats.recibidas}</strong>
            </div>
            <div className="notifications-kpi-card">
              <span className="notifications-kpi-label">Enviadas</span>
              <strong className="notifications-kpi-value">{stats.enviadas}</strong>
            </div>
            <div className="notifications-kpi-card">
              <span className="notifications-kpi-label">Pendientes</span>
              <strong className="notifications-kpi-value">{stats.pendientes}</strong>
            </div>
            <div className="notifications-kpi-card">
              <span className="notifications-kpi-label">Urgentes</span>
              <strong className="notifications-kpi-value">{stats.urgentes}</strong>
            </div>
          </div>

          <div className="container-table rounded shadow-lg">
            <div className="notifications-toolbar">
              <div className="notifications-tabs">
                <button
                  className={`notifications-tab ${tab === TAB_RECIBIDAS ? 'active' : ''}`}
                  onClick={() => setTab(TAB_RECIBIDAS)}
                >
                  Recibidas
                </button>
                <button
                  className={`notifications-tab ${tab === TAB_ENVIADAS ? 'active' : ''}`}
                  onClick={() => setTab(TAB_ENVIADAS)}
                >
                  Enviadas
                </button>
              </div>

              <input
                type="text"
                className="form-control notifications-search-input"
                placeholder="Buscar notificacion..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          {errors.fetch && (
            <div className="alert alert-danger mt-3">{errors.fetch}</div>
          )}

          <div className="container-table rounded shadow-lg">
            <table className="table mb-0" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '18%' }}>Titulo</th>
                  <th style={{ width: '12%' }}>
                    {tab === TAB_RECIBIDAS ? 'Remitente' : 'Destinatario'}
                  </th>
                  <th style={{ width: '12%' }}>Tipo</th>
                  <th style={{ width: '8%' }}>Categoria</th>
                  <th style={{ width: '8%' }}>Prioridad</th>
                  <th style={{ width: '8%' }}>Estado</th>
                  <th style={{ width: '14%' }}>Fecha</th>
                  <th style={{ width: '14%' }}>Mensaje</th>
                  <th style={{ width: '6%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <div className="notifications-empty">
                        No hay notificaciones para mostrar.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-text">{item.titulo}</div>
                        <small className="table-text-muted">
                          {item.entidad_tipo} #{item.entidad_id}
                        </small>
                      </td>
                      <td>
                        <div className="table-text">
                          {tab === TAB_RECIBIDAS ? item.remitente : item.destinatario}
                        </div>
                        <small className="table-text-muted">
                          {tab === TAB_RECIBIDAS ? `ID ${item.fromId}` : `ID ${item.toId}`}
                        </small>
                      </td>
                      <td className="td-truncate">
                        <span className="table-text">{item.tipo_alerta}</span>
                      </td>
                      <td>
                        <span className="table-text">{item.categoria}</span>
                      </td>
                      <td>
                        <span className={priorityClass(item.prioridad)}>
                          {item.prioridad}
                        </span>
                      </td>
                      <td>
                        <span className={stateClass(item.estado)}>{item.estado}</span>
                      </td>
                      <td>
                        <div className="table-text">
                          {formatDate(item.fecha_creacion || item.createdAt)}
                        </div>
                        <small className="table-text-muted">
                          {item.fecha_alerta
                            ? `Alerta: ${formatDate(item.fecha_alerta)}`
                            : 'Sin fecha alerta'}
                        </small>
                      </td>
                      <td className="td-truncate">
                        <div className="notifications-message">{item.mensaje}</div>
                        {item.requiere_accion && (
                          <small className="notifications-action">
                            Accion: {item.accion_texto || 'Ver detalle'}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="table-btn table-btn-edit"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEditModal(item);
                            }}
                            title="Editar notificacion"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            type="button"
                            className="table-btn table-btn-view"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDetailModal(item);
                            }}
                            title="Ver detalle"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-container"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: '1100px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon">
                  <i className="bi bi-bell-fill"></i>
                </div>
                <div>
                  <h3 className="modal-title mb-1">
                    {editingNotificationId ? 'Editar Notificacion' : 'Nueva Notificacion'}
                  </h3>
                  <p className="modal-subtitle mb-0">
                    {editingNotificationId
                      ? 'Actualiza la informacion principal de la notificacion.'
                      : 'Crea una notificacion dirigida a un cliente o a un ingeniero.'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh' }}>
              {errors.submit && <div className="alert alert-danger mb-3">{errors.submit}</div>}

              <div className="alert alert-info">
                Remitente automatico: <strong>{sessionUser?.email || sessionUserId}</strong>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Destinatario *</label>
                  <select
                    name="usuario_to_id"
                    className={`form-control ${errors.usuario_to_id ? 'is-invalid' : ''}`}
                    value={form.usuario_to_id}
                    onChange={handleForm}
                  >
                    <option value="">Seleccione un destinatario</option>
                    {destinatarios.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre} - {item.tipo}
                        {item.detalle ? ` (${item.detalle})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.usuario_to_id && (
                    <div className="invalid-feedback">{errors.usuario_to_id}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Titulo *</label>
                  <input
                    name="titulo"
                    className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
                    value={form.titulo}
                    onChange={handleForm}
                  />
                  {errors.titulo && <div className="invalid-feedback">{errors.titulo}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label">Mensaje *</label>
                  <textarea
                    name="mensaje"
                    rows="4"
                    className={`form-control ${errors.mensaje ? 'is-invalid' : ''}`}
                    value={form.mensaje}
                    onChange={handleForm}
                  />
                  {errors.mensaje && <div className="invalid-feedback">{errors.mensaje}</div>}
                </div>

                <div className="col-md-3">
                  <label className="form-label">Prioridad</label>
                  <select
                    name="prioridad"
                    className="form-control"
                    value={form.prioridad}
                    onChange={handleForm}
                  >
                    <option value="BAJA">BAJA</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="ALTA">ALTA</option>
                    <option value="URGENTE">URGENTE</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Fecha alerta</label>
                  <input
                    type="datetime-local"
                    name="fecha_alerta"
                    className="form-control"
                    value={form.fecha_alerta}
                    onChange={handleForm}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Fecha evento</label>
                  <input
                    type="datetime-local"
                    name="fecha_evento"
                    className="form-control"
                    value={form.fecha_evento}
                    onChange={handleForm}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Fecha vencimiento</label>
                  <input
                    type="datetime-local"
                    name="fecha_vencimiento"
                    className="form-control"
                    value={form.fecha_vencimiento}
                    onChange={handleForm}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label d-block">Accion</label>
                  <div className="notifications-toggle-card">
                    <div className="form-check form-switch mb-0">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="requiere_accion"
                        name="requiere_accion"
                        checked={form.requiere_accion}
                        onChange={handleForm}
                      />
                      <label className="form-check-label ms-2" htmlFor="requiere_accion">
                        Requiere accion del usuario
                      </label>
                    </div>
                  </div>
                </div>

                {form.requiere_accion && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label">Texto accion *</label>
                      <input
                        name="accion_texto"
                        className={`form-control ${errors.accion_texto ? 'is-invalid' : ''}`}
                        value={form.accion_texto}
                        onChange={handleForm}
                      />
                      {errors.accion_texto && (
                        <div className="invalid-feedback">{errors.accion_texto}</div>
                      )}
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">URL accion *</label>
                      <input
                        name="url_accion"
                        className={`form-control ${errors.url_accion ? 'is-invalid' : ''}`}
                        value={form.url_accion}
                        onChange={handleForm}
                      />
                      {errors.url_accion && (
                        <div className="invalid-feedback">{errors.url_accion}</div>
                      )}
                    </div>
                  </>
                )}

              </div>

              <div className="modal-footer mt-4">
                <button className="btn-cancel" onClick={closeModal} disabled={saving}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button className="btn-save" onClick={saveNotification} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      {editingNotificationId ? 'Guardar Cambios' : 'Crear Notificacion'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailModal && selectedNotification && (
        <div className="modal-overlay" onClick={closeDetailModal}>
          <div
            className="modal-container"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: '980px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="modal-header">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon">
                  <i className="bi bi-eye-fill"></i>
                </div>
                <div>
                  <h3 className="modal-title mb-1">Detalle de Notificacion</h3>
                  <p className="modal-subtitle mb-0">
                    Informacion completa relacionada a la alerta seleccionada.
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={closeDetailModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh' }}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Titulo</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.titulo)}
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">ID</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.id)}
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Tipo alerta</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.tipo_alerta)}
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Remitente</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.remitente)}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Destinatario</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.destinatario)}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Entidad</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.entidad_tipo)} / #
                    {prettyValue(selectedNotification.entidad_id)}
                  </div>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Categoria</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.categoria)}
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Prioridad</label>
                  <div className="notifications-detail-value">
                    <span className={priorityClass(selectedNotification.prioridad)}>
                      {prettyValue(selectedNotification.prioridad)}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Estado</label>
                  <div className="notifications-detail-value">
                    <span className={stateClass(selectedNotification.estado)}>
                      {prettyValue(selectedNotification.estado)}
                    </span>
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Requiere accion</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.requiere_accion)}
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Fecha creacion</label>
                  <div className="notifications-detail-value">
                    {formatDate(selectedNotification.fecha_creacion || selectedNotification.createdAt)}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha alerta</label>
                  <div className="notifications-detail-value">
                    {formatDate(selectedNotification.fecha_alerta)}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha evento</label>
                  <div className="notifications-detail-value">
                    {formatDate(selectedNotification.fecha_evento)}
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Fecha vencimiento</label>
                  <div className="notifications-detail-value">
                    {formatDate(selectedNotification.fecha_vencimiento)}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Texto accion</label>
                  <div className="notifications-detail-value">
                    {prettyValue(selectedNotification.accion_texto)}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label">URL accion</label>
                  <div className="notifications-detail-value notifications-detail-break">
                    {prettyValue(selectedNotification.url_accion)}
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label">Mensaje</label>
                  <div className="notifications-detail-value notifications-detail-pre">
                    {prettyValue(selectedNotification.mensaje)}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Observaciones</label>
                  <div className="notifications-detail-value notifications-detail-pre">
                    {prettyValue(selectedNotification.observaciones)}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Metadata</label>
                  <div className="notifications-detail-value notifications-detail-pre">
                    {prettyValue(selectedNotification.metadata)}
                  </div>
                </div>
              </div>

              <div className="modal-footer mt-4">
                <button className="btn-cancel" onClick={closeDetailModal}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default Notifications;
