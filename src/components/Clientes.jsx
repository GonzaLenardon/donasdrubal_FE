import React, { useEffect, useState } from 'react';
import { addCliente, allCliente, upCliente } from '../api/clientes.js';
import Spinner from './Spinner.jsx';
import { useNavigate } from 'react-router-dom';
import { allIngenieros } from '../api/users.js';
import { allTipoClientes } from '../api/tipoClientes.js';
import { Radius } from 'lucide-react';
import { useCliente } from '../context/UserContext.jsx';

const Clientes = () => {
  const [clienteList, setClienteList] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [tipoClientes, setTipoClientes] = useState([]);
  const [ingenierosSeleccionados, setIngenierosSeleccionados] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [ingenieroPlrincipal, setIngenieroPlrincipal] = useState(null);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [modalValidacion, setModalValidacion] = useState(false);
  const [newCliente, SetNewCliente] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onlyView, setOnlyView] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const { setSelectedCliente } = useCliente();

  useEffect(() => {
    const all = async () => {
      getAllCliente();
      getAllIngenieros();
      getAllTipoClientes();
    };

    all();
    setSelectedCliente();
  }, []);

  const getAllCliente = async () => {
    try {
      const resp = await allCliente();
      console.log('clientes', resp.data);
      setClienteList(resp.data);
    } catch (error) {
      console.error('Error al traer usuarios:', error.data);
    }
  };

  const getAllIngenieros = async () => {
    try {
      const resp = await allIngenieros();
      console.log('Ingeniero', resp.data);
      setIngenieros(resp.data);
    } catch (error) {
      console.error('Error al traer Ingenieros:', error.data);
    }
  };

  const getAllTipoClientes = async () => {
    try {
      const resp = await allTipoClientes();
      console.log('Ingeniero', resp.data);
      setTipoClientes(resp.data);
    } catch (error) {
      console.error('Error al traer Tipo Clientes:', error.data);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!newCliente.razon_social?.trim()) {
      newErrors.razon_social = 'La razón social es requerida';
    }

    if (!newCliente.direccion_fiscal?.trim()) {
      newErrors.direccion_fiscal = 'El domicilio fiscal es requerido';
    }

    if (!newCliente.cuil_cuit?.trim()) {
      newErrors.cuil_cuit = 'El CUIL/CUIT es requerido';
    } else if (!/^\d{2}-\d{8}-\d{1}$/.test(newCliente.cuil_cuit)) {
      newErrors.cuil_cuit = 'Formato inválido (XX-XXXXXXXX-X)';
    }

    if (!newCliente.iva_id) {
      newErrors.iva_id = 'Debe seleccionar una condición de IVA';
    }

    if (!newCliente.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    if (!newCliente.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCliente.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!newCliente.ciudad?.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
    }

    if (!newCliente.provincia?.trim()) {
      newErrors.provincia = 'La provincia es requerida';
    }

    if (!newCliente.pais?.trim()) {
      newErrors.pais = 'El país es requerido';
    }

    if (!newCliente.estado) {
      newErrors.estado = 'Debe seleccionar un estado';
    }

    if (ingenierosSeleccionados.length === 0) {
      newErrors.ingenieros = 'Debe asignar al menos un ingeniero';
    }

    if (ingenierosSeleccionados.length > 1 && !ingenieroPlrincipal) {
      newErrors.ingeniero_principal = 'Debe seleccionar un ingeniero principal';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setModalValidacion(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      const dataToSend = {
        ...newCliente,
        ingenieros: ingenierosSeleccionados.map((userId) => ({
          user_id: parseInt(userId),
          es_principal:
            ingenierosSeleccionados.length === 1
              ? true
              : parseInt(userId) === parseInt(ingenieroPlrincipal),
        })),
      };

      delete dataToSend.ingeniero_id;

      console.log('📤 Datos a enviar:', dataToSend);

      let resp;
      if (newCliente?.id) {
        resp = await upCliente(dataToSend);
      } else {
        resp = await addCliente(dataToSend);
      }

      setMsg(resp.mensaje);
      getAllCliente();

      await new Promise((resolve) => setTimeout(resolve, 2000));
      modalClose();
    } catch (error) {
      setMsg(error.mensaje);
      setErrors({ submit: error.mensaje });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      setMsg('');
    }
  };

  const modalUpCliente = (cliente) => {
    console.log('cliente a editar', cliente);
    SetNewCliente(cliente);

    if (cliente.ingenieros?.length > 0) {
      const ingenierosIds = cliente.ingenieros.map((ing) =>
        ing.user_id.toString(),
      );
      setIngenierosSeleccionados(ingenierosIds);

      const principal = cliente.ingenieros.find((ing) => ing.es_principal);
      if (principal) {
        setIngenieroPlrincipal(principal.user_id.toString());
      }
    } else {
      setIngenierosSeleccionados([]);
      setIngenieroPlrincipal(null);
    }

    setErrors({});
    setModal(true);
  };

  const handleCliente = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    SetNewCliente((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    console.log('Nuevo Cliente', newCliente);
  }, [newCliente]);

  const handleIngenierosCheckbox = (ingenieroId) => {
    const idStr = ingenieroId.toString();

    if (ingenierosSeleccionados.includes(idStr)) {
      const nuevosSeleccionados = ingenierosSeleccionados.filter(
        (id) => id !== idStr,
      );
      setIngenierosSeleccionados(nuevosSeleccionados);

      if (ingenieroPlrincipal === idStr) {
        setIngenieroPlrincipal(
          nuevosSeleccionados.length === 1 ? nuevosSeleccionados[0] : null,
        );
      }
    } else {
      const nuevosSeleccionados = [...ingenierosSeleccionados, idStr];
      setIngenierosSeleccionados(nuevosSeleccionados);

      if (nuevosSeleccionados.length === 1) {
        setIngenieroPlrincipal(idStr);
      }
    }

    if (errors.ingenieros) {
      setErrors((prev) => ({ ...prev, ingenieros: '' }));
    }
  };

  const handleIngenioPrincipalRadio = (ingenieroId) => {
    setIngenieroPlrincipal(ingenieroId.toString());

    if (errors.ingeniero_principal) {
      setErrors((prev) => ({ ...prev, ingeniero_principal: '' }));
    }
  };

  const modalClose = () => {
    setModal(false);
    SetNewCliente({});
    setIngenierosSeleccionados([]);
    setIngenieroPlrincipal(null);
    setOnlyView(false);
    setErrors({});
  };

  const handleVer = (cliente) => {
    console.log('Clientes', cliente);

    setSelectedCliente(cliente);
    navigate(`/cliente/${cliente.id}/detalles`);
  };

  const cantidadErrores = Object.keys(errors).length;

  const handleCuilCuit = (e) => {
    // Extraemos solo dígitos
    const soloDigitos = e.target.value.replace(/\D/g, '').slice(0, 11);

    // Formateamos progresivamente según longitud
    let formateado = soloDigitos;
    if (soloDigitos.length > 2 && soloDigitos.length <= 10) {
      formateado = `${soloDigitos.slice(0, 2)}-${soloDigitos.slice(2)}`;
    } else if (soloDigitos.length > 10) {
      formateado = `${soloDigitos.slice(0, 2)}-${soloDigitos.slice(2, 10)}-${soloDigitos.slice(10)}`;
    }

    SetNewCliente((prev) => ({ ...prev, cuil_cuit: formateado }));

    if (errors.cuil_cuit) {
      setErrors((prev) => ({ ...prev, cuil_cuit: '' }));
    }
  };

  const filteredClientes = clienteList.filter((cliente) => {
    const term = searchTerm.toLowerCase();

    return (
      cliente.razon_social?.toLowerCase().includes(term) ||
      cliente.cuil_cuit?.toLowerCase().includes(term) ||
      cliente.email?.toLowerCase().includes(term) ||
      cliente.telefono?.toLowerCase().includes(term) ||
      cliente.direccion_fiscal?.toLowerCase().includes(term) ||
      cliente.estado?.toLowerCase().includes(term) ||
      cliente.tipoCliente?.tipoClientes?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <div className="container_seccion">
        <div style={{ margin: '0 auto' }}>
          {/* HEADER */}
          <div className="header">
            <div>
              <h2 className="title">Clientes</h2>
              <p className="subtitle">
                {clienteList.length} Clientes registrados
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={() => {
                SetNewCliente({});
                setIngenierosSeleccionados([]);
                setIngenieroPlrincipal(null);
                setErrors({});
                setModal(true);
              }}
            >
              <i className="bi bi-plus-lg"></i>
              Nuevo Cliente
            </button>
          </div>

          {/* TABLA */}
          <div className="container-table rounded shadow-lg">
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* TABLA */}
          <div className="container-table rounded shadow-lg">
            <table
              className="table mb-0"
              style={{ tableLayout: 'fixed', width: '100%' }}
            >
              <thead>
                <tr>
                  <th style={{ width: '12%' }}>
                    <i className="bi bi-person-badge me-1"></i>Nombre
                  </th>
                  <th style={{ width: '10%' }}>
                    <i className="bi bi-person-badge me-1"></i>Cuit
                  </th>
                  {/*  <th style={{ width: '15%' }}>
                    <i className="bi bi-geo-alt me-1"></i>Domicilio
                  </th> */}
                  <th style={{ width: '15%' }}>
                    <i className="bi bi-envelope-at me-1"></i>Email
                  </th>
                  <th style={{ width: '10%' }}>
                    <i className="bi bi-telephone me-1"></i>Teléfono
                  </th>
                  <th style={{ width: '15%' }}>
                    <i className="bi bi-people me-1"></i>Ingenieros
                  </th>
                  <th style={{ width: '4%' }}>Tipo</th>
                  <th style={{ width: '6%' }}>Estado</th>
                  <th className="text-center" style={{ width: '5%' }}>
                    <i className="bi bi-gear"></i>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      modalUpCliente(cliente);
                      setOnlyView(true);
                    }}
                  >
                    <td className="td-truncate">
                      <span className="table-text">{cliente.razon_social}</span>
                    </td>

                    <td>
                      <span className="table-text">{cliente.cuil_cuit}</span>
                    </td>
                    {/* 
                    <td className="td-truncate">
                      <span className="table-text">
                        {cliente.direccion_fiscal}
                      </span>
                    </td>
 */}
                    <td className="td-truncate">
                      <span className="table-text">{cliente.email}</span>
                    </td>

                    <td>
                      <span className="table-text">{cliente.telefono}</span>
                    </td>

                    <td>
                      {cliente.ingenieros && cliente.ingenieros.length > 0 ? (
                        <div className="table-badges-container">
                          {cliente.ingenieros.map((ing) => (
                            <span
                              key={ing.user_id}
                              className={
                                ing.es_principal
                                  ? 'table-badge-principal'
                                  : 'table-badge-secondary'
                              }
                            >
                              {ing.es_principal && (
                                <i className="bi bi-star-fill"></i>
                              )}
                              {ing.nombre}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="table-text-muted">Sin asignar</span>
                      )}
                    </td>

                    <td className="text-center">
                      <span className="table-text">
                        {cliente.tipoCliente?.tipoClientes}
                      </span>
                    </td>

                    <td className="">
                      <span className="table-text">{cliente.estado}</span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          className="table-btn table-btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            modalUpCliente(cliente);
                            setOnlyView(false);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="table-btn table-btn-view"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVer(cliente);
                          }}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL PRINCIPAL - FORMULARIO */}
      {/* ============================================================ */}
      {modal && (
        <div className="modal-overlay">
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '1200px',
              width: '95%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div className="modal-header">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div>
                  <h3 className="modal-title mb-1">
                    {newCliente?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </h3>
                  <p className="modal-subtitle mb-0">
                    {newCliente?.id
                      ? 'Modifica la información del cliente'
                      : 'Completa los datos del nuevo cliente'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={modalClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body" style={{ maxHeight: '70vh' }}>
              {errors.submit && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {errors.submit}
                </div>
              )}

              {/* Fila 1: Razón Social, Domicilio Fiscal, Dirección */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="razon_social" className="form-label">
                      <i className="bi bi-building me-2"></i>Razón Social *
                    </label>
                    <input
                      type="text"
                      id="razon_social"
                      name="razon_social"
                      className={`form-control ${errors.razon_social ? 'is-invalid' : ''}`}
                      placeholder="Ingrese razón social"
                      value={newCliente?.razon_social || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.razon_social && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.razon_social}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="direccion_fiscal" className="form-label">
                      <i className="bi bi-geo-alt-fill me-2"></i>Domicilio
                      Fiscal *
                    </label>
                    <input
                      type="text"
                      id="direccion_fiscal"
                      name="direccion_fiscal"
                      className={`form-control ${errors.direccion_fiscal ? 'is-invalid' : ''}`}
                      placeholder="Calle, número, código postal"
                      value={newCliente?.direccion_fiscal || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.direccion_fiscal && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.direccion_fiscal}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="direccion" className="form-label">
                      <i className="bi bi-signpost me-2"></i>Dirección
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      className="form-control"
                      placeholder="Dirección adicional"
                      value={newCliente?.direccion || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Fila 2: Ciudad, Provincia, País */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="ciudad" className="form-label">
                      <i className="bi bi-building-fill-add me-2"></i>Ciudad *
                    </label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      className={`form-control ${errors.ciudad ? 'is-invalid' : ''}`}
                      placeholder="Ej: Paraná"
                      value={newCliente?.ciudad || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.ciudad && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.ciudad}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="provincia" className="form-label">
                      <i className="bi bi-map me-2"></i>Provincia *
                    </label>
                    <input
                      type="text"
                      id="provincia"
                      name="provincia"
                      className={`form-control ${errors.provincia ? 'is-invalid' : ''}`}
                      placeholder="Ej: Entre Ríos"
                      value={newCliente?.provincia || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.provincia && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.provincia}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="pais" className="form-label">
                      <i className="bi bi-globe me-2"></i>País *
                    </label>
                    <input
                      type="text"
                      id="pais"
                      name="pais"
                      className={`form-control ${errors.pais ? 'is-invalid' : ''}`}
                      placeholder="Ej: Argentina"
                      value={newCliente?.pais || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.pais && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.pais}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fila 3: CUIL/CUIT, Condición IVA, Teléfono */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="cuil_cuit" className="form-label">
                      <i className="bi bi-card-text me-2"></i>CUIL / CUIT *
                    </label>

                    <input
                      type="text"
                      id="cuil_cuit"
                      name="cuil_cuit"
                      className={`form-control ${errors.cuil_cuit ? 'is-invalid' : ''}`}
                      placeholder="XX-XXXXXXXX-X"
                      value={newCliente?.cuil_cuit || ''}
                      onChange={handleCuilCuit} // 👈 handler dedicado en lugar de handleCliente
                      disabled={isSubmitting}
                      maxLength={13} // 11 dígitos + 2 guiones
                      inputMode="numeric" // teclado numérico en mobile
                    />

                    {errors.cuil_cuit && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.cuil_cuit}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="iva_id" className="form-label">
                      <i className="bi bi-receipt me-2"></i>Condición IVA *
                    </label>
                    <select
                      id="iva_id"
                      name="iva_id"
                      className={`form-control ${errors.iva_id ? 'is-invalid' : ''}`}
                      value={newCliente?.iva_id || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccione...</option>
                      <option value="1">Responsable Inscripto</option>
                      <option value="2">Monotributo</option>
                      <option value="3">Exento</option>
                    </select>
                    {errors.iva_id && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.iva_id}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="telefono" className="form-label">
                      <i className="bi bi-telephone-fill me-2"></i>Teléfono *
                    </label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                      placeholder="+54 9 11 XXXX-XXXX"
                      value={newCliente?.telefono || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.telefono && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.telefono}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fila 4: Email, Estado, Tipo Cliente */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope-fill me-2"></i>Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="ejemplo@email.com"
                      value={newCliente?.email || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor="estado" className="form-label">
                      <i className="bi bi-toggle-on me-2"></i>Estado *
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      className={`form-control ${errors.estado ? 'is-invalid' : ''}`}
                      value={newCliente?.estado || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccione...</option>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                    {errors.estado && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.estado}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor="tipo_cliente_id" className="form-label">
                      <i className="bi bi-bookmark me-2"></i>Tipo Cliente
                    </label>
                    <select
                      id="tipo_cliente_id"
                      name="tipo_cliente_id"
                      className={`form-control ${errors.tipoClientes ? 'is-invalid' : ''}`}
                      value={newCliente?.tipo_cliente_id || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccione un tipo Cliente</option>
                      {tipoClientes.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.tipoClientes}
                        </option>
                      ))}
                    </select>
                    {errors.tipo_cliente_id && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.tipo_cliente_id}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor="comodato" className="form-label">
                      <i className="bi bi-box-seam me-2"></i>Comodato
                    </label>

                    <div
                      className="d-flex align-items-center gap-3 p-2 rounded"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        minHeight: '38px', // misma altura que los inputs
                      }}
                    >
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="comodato"
                          role="switch"
                          checked={!!newCliente?.comodato}
                          onChange={(e) => {
                            SetNewCliente((prev) => ({
                              ...prev,
                              comodato: e.target.checked,
                            }));
                          }}
                          disabled={isSubmitting}
                          style={{
                            width: '2.5em',
                            height: '1.25em',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          }}
                        />
                        <label
                          className="form-check-label ms-2"
                          htmlFor="comodato"
                          style={{
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          {newCliente?.comodato ? (
                            <span className="text-success">
                              <i className="bi bi-check-circle-fill me-1"></i>Sí
                            </span>
                          ) : (
                            <span className="text-secondary">
                              <i className="bi bi-x-circle me-1"></i>No
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="form-group">
                    <label htmlFor="litros_estimados" className="form-label">
                      <i className="bi bi-droplet-half me-2"></i>Litros
                      Estimados
                    </label>
                    <input
                      type="number"
                      id="litros_estimados"
                      name="litros_estimados"
                      className={`form-control ${errors.litros_estimados ? 'is-invalid' : ''}`}
                      placeholder="Cantidad litros estimados para la campaña"
                      value={newCliente?.litros_estimados || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.litros_estimados}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* SECCIÓN INGENIEROS CON CHECKBOXES */}
              {/* ============================================================ */}
              <div className="row g-3">
                <div className="col-12">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-people-fill me-2"></i>
                      Ingeniero(s) Asignado(s) *
                    </label>

                    <div
                      className={`form-check-container ${errors.ingenieros ? 'border border-danger' : ''}`}
                    >
                      {ingenieros.map((ing) => {
                        const isSelected = ingenierosSeleccionados.includes(
                          ing.id.toString(),
                        );
                        const isPrincipal =
                          ingenieroPlrincipal === ing.id.toString();

                        return (
                          <div
                            key={ing.id}
                            className={`form-check-item ${isSelected ? 'selected' : ''}`}
                          >
                            {/* Checkbox + Nombre */}
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="checkbox"
                                id={`ing-${ing.id}`}
                                checked={isSelected}
                                onChange={() => {}}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIngenierosCheckbox(ing.id);
                                }}
                              />
                              <label
                                htmlFor={`ing-${ing.id}`}
                                className="form-check-label"
                              >
                                {ing.nombre}
                              </label>
                              {isPrincipal && (
                                <span className="badge-primary">
                                  <i className="bi bi-star-fill me-1"></i>
                                  Principal
                                </span>
                              )}
                            </div>

                            {/* Radio para Principal */}
                            {isSelected &&
                              ingenierosSeleccionados.length > 1 && (
                                <div
                                  className="d-flex align-items-center gap-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <small className="text-muted">
                                    ¿Principal?
                                  </small>
                                  <input
                                    type="radio"
                                    name="ingeniero_principal"
                                    checked={isPrincipal}
                                    onChange={() =>
                                      handleIngenioPrincipalRadio(ing.id)
                                    }
                                  />
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>

                    <small className="text-muted mt-2 d-block">
                      <i className="bi bi-info-circle me-1"></i>
                      Selecciona uno o más ingenieros. Si seleccionas varios,
                      marca cuál es el principal.
                    </small>

                    {errors.ingenieros && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.ingenieros}
                      </div>
                    )}

                    {errors.ingeniero_principal && (
                      <div className="invalid-feedback d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.ingeniero_principal}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vista previa de ingenieros seleccionados */}
              {ingenierosSeleccionados.length > 0 && (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle-fill fs-5 mt-1"></i>
                  <div className="flex-grow-1">
                    <strong className="d-block mb-2">
                      {ingenierosSeleccionados.length} Ingeniero
                      {ingenierosSeleccionados.length > 1 ? 's' : ''}{' '}
                      Seleccionado
                      {ingenierosSeleccionados.length > 1 ? 's' : ''}:
                    </strong>
                    <div className="d-flex flex-wrap gap-2">
                      {ingenierosSeleccionados.map((ingId) => {
                        const ing = ingenieros.find(
                          (i) => i.id.toString() === ingId,
                        );
                        const esPrincipal = ingId === ingenieroPlrincipal;
                        return ing ? (
                          <span
                            key={ing.id}
                            className={
                              esPrincipal ? 'badge-primary' : 'badge-secondary'
                            }
                          >
                            {esPrincipal && <i className="bi bi-star-fill"></i>}
                            {ing.nombre}
                            {esPrincipal && (
                              <small className="ms-1">(Principal)</small>
                            )}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Fila 5: Notas */}
              <div className="form-group">
                <label htmlFor="notas" className="form-label">
                  <i className="bi bi-journal-text me-2"></i>Notas
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  className="form-control"
                  rows="2"
                  placeholder="Información adicional del cliente..."
                  value={newCliente?.notas || ''}
                  onChange={handleCliente}
                  disabled={isSubmitting}
                />
              </div>

              {/* Botones */}
              {!onlyView && (
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={modalClose}
                    disabled={isSubmitting}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        {newCliente?.id ? 'Actualizar' : 'Crear Cliente'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE VALIDACIÓN */}
      {/* ============================================================ */}
      {modalValidacion && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '500px',
              width: '90%',
              animation: 'shake 0.5s',
            }}
          >
            {/* Header */}
            <div
              className="modal-header"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="modal-icon"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div>
                  <h3 className="modal-title mb-1">Campos Incompletos</h3>
                  <p className="modal-subtitle mb-0">
                    Por favor, completa todos los campos requeridos
                  </p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setModalValidacion(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              <div className="alert alert-danger mb-3">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-circle-fill fs-4"></i>
                  <div>
                    <strong>
                      Se encontraron {cantidadErrores} error
                      {cantidadErrores > 1 ? 'es' : ''}:
                    </strong>
                  </div>
                </div>

                <ul className="mb-0 ps-4">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="mb-1">
                      <strong>
                        {field === 'razon_social' && 'Razón Social'}
                        {field === 'direccion_fiscal' && 'Domicilio Fiscal'}
                        {field === 'cuil_cuit' && 'CUIL/CUIT'}
                        {field === 'iva_id' && 'Condición IVA'}
                        {field === 'telefono' && 'Teléfono'}
                        {field === 'email' && 'Email'}
                        {field === 'ciudad' && 'Ciudad'}
                        {field === 'provincia' && 'Provincia'}
                        {field === 'pais' && 'País'}
                        {field === 'estado' && 'Estado'}
                        {field === 'ingenieros' && 'Ingenieros'}
                        {field === 'ingeniero_principal' &&
                          'Ingeniero Principal'}
                      </strong>
                      : {error}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center">
                <button
                  className="btn-save"
                  onClick={() => setModalValidacion(false)}
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <i className="bi bi-arrow-left-circle me-2"></i>
                  Volver al Formulario
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

export default Clientes;
