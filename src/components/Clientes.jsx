import React, { useEffect, useState } from 'react';
import { addCliente, allCliente, upCliente } from '../api/clientes.js';
import Spinner from './Spinner.jsx';
import { useNavigate } from 'react-router-dom';
import { allIngenieros } from '../api/users.js';
import { allTipoClientes } from '../api/tipoClientes.js';

const Clientes = () => {
  const [clienteList, setClienteList] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [tipoClientes, setTipoClientes] = useState([]);
  const [ingenierosSeleccionados, setIngenierosSeleccionados] = useState([]);
  const [ingenieroPlrincipal, setIngenieroPlrincipal] = useState(null);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [modalValidacion, setModalValidacion] = useState(false); // ✅ NUEVO
  const [newCliente, SetNewCliente] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const all = async () => {
      getAllCliente();
      getAllIngenieros();
      getAllTipoClientes();
    };
    all();
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
      setModalValidacion(true); // ✅ Mostrar modal de validación
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

  // ✅ Manejar checkbox de ingeniero
  const handleIngenierosCheckbox = (ingenieroId) => {
    const idStr = ingenieroId.toString();

    if (ingenierosSeleccionados.includes(idStr)) {
      // Deseleccionar
      const nuevosSeleccionados = ingenierosSeleccionados.filter(
        (id) => id !== idStr,
      );
      setIngenierosSeleccionados(nuevosSeleccionados);

      // Si era el principal, limpiar
      if (ingenieroPlrincipal === idStr) {
        setIngenieroPlrincipal(
          nuevosSeleccionados.length === 1 ? nuevosSeleccionados[0] : null,
        );
      }
    } else {
      // Seleccionar
      const nuevosSeleccionados = [...ingenierosSeleccionados, idStr];
      setIngenierosSeleccionados(nuevosSeleccionados);

      // Si es el primero, hacerlo principal automáticamente
      if (nuevosSeleccionados.length === 1) {
        setIngenieroPlrincipal(idStr);
      }
    }

    if (errors.ingenieros) {
      setErrors((prev) => ({ ...prev, ingenieros: '' }));
    }
  };

  // ✅ Manejar radio de ingeniero principal
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
    setErrors({});
  };

  const handleVer = (cliente) => {
    localStorage.setItem(
      'Cliente',
      JSON.stringify({
        id: cliente.id,
        nombre: cliente.razon_social,
      }),
    );

    navigate(`/cliente/${cliente.id}/detalles`);
  };

  // ✅ Contar errores para el modal
  const cantidadErrores = Object.keys(errors).length;

  return (
    <>
      <div className="clientes-wrapper" >
        <div style={{ margin: '0 auto' }}>
          {/* HEADER */}
          <div className="page-header">
            <div>
              <h2 className="page-title">Clientes</h2>
              <p className="page-subtitle">
                {clienteList.length} Clientes registrados
              </p>
            </div>

            <button
              className="btn text-white d-flex align-items-center gap-2 shadow-lg pozo-btn-nuevo"
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
          <div className="table-system rounded shadow-lg">
           
            <div style={{ overflowX: 'auto' }}>
              <table className="table table-hover mb-0" >
                <thead>
                  <tr
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                      borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-person-badge me-2"></i>Nombre
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-geo-alt me-2"></i>Domicilio
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-envelope-at me-2"></i>Email
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-telephone me-2"></i>Teléfono
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-people me-2"></i>Ingenieros
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-toggle-on me-2"></i>Estado
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3 text-center"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-gear me-2"></i>Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {clienteList.map((cliente) => (
                    <tr
                      key={cliente.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <td className="py-2 px-3">
                        <span
                          className="fw-semibold text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {cliente.razon_social}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className="fw-semibold text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {cliente.direccion_fiscal}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className="fw-semibold text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {cliente.email}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className="fw-semibold text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {cliente.telefono}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {cliente.ingenieros && cliente.ingenieros.length > 0 ? (
                          <div className="d-flex flex-column gap-1">
                            {cliente.ingenieros.map((ing) => (
                              <span
                                key={ing.user_id}
                                className="badge"
                                style={{
                                  background: ing.es_principal
                                    ? 'rgba(34, 197, 94, 0.2)'
                                    : 'rgba(102, 126, 234, 0.2)',
                                  color: ing.es_principal
                                    ? '#4ade80'
                                    : '#93c5fd',
                                  border: `1px solid ${ing.es_principal ? 'rgba(34, 197, 94, 0.3)' : 'rgba(102, 126, 234, 0.3)'}`,
                                  fontSize: '0.75rem',
                                }}
                              >
                                {ing.es_principal && (
                                  <i className="bi bi-star-fill me-1"></i>
                                )}
                                {ing.nombre}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span
                            className="text-white-50"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className="fw-semibold text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {cliente.estado}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="d-flex gap-2 justify-content-center">
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(102, 126, 234, 0.2)',
                              color: '#93c5fd',
                              border: '1px solid rgba(102, 126, 234, 0.3)',
                              padding: '0.3rem 0.8rem',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              modalUpCliente(cliente);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#fbbf24',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              padding: '0.3rem 0.8rem',
                            }}
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
            <div className="modal-header-pozos">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon-container">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div>
                  <h3 className="modal-title-pozos mb-1">
                    {newCliente?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
                  </h3>
                  <p className="modal-subtitle-pozos mb-0">
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
            <div className="modal-body-pozos" style={{ maxHeight: '70vh' }}>
              {errors.submit && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {errors.submit}
                </div>
              )}

              {/* Fila 1: Razón Social, Domicilio Fiscal, Dirección */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="razon_social" className="form-label-pozos">
                      <i className="bi bi-building me-2"></i>Razón Social *
                    </label>
                    <input
                      type="text"
                      id="razon_social"
                      name="razon_social"
                      className={`form-control-pozos ${errors.razon_social ? 'is-invalid' : ''}`}
                      placeholder="Ingrese razón social"
                      value={newCliente?.razon_social || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.razon_social && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.razon_social}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label
                      htmlFor="direccion_fiscal"
                      className="form-label-pozos"
                    >
                      <i className="bi bi-geo-alt-fill me-2"></i>Domicilio
                      Fiscal *
                    </label>
                    <input
                      type="text"
                      id="direccion_fiscal"
                      name="direccion_fiscal"
                      className={`form-control-pozos ${errors.direccion_fiscal ? 'is-invalid' : ''}`}
                      placeholder="Calle, número, código postal"
                      value={newCliente?.direccion_fiscal || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.direccion_fiscal && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.direccion_fiscal}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="direccion" className="form-label-pozos">
                      <i className="bi bi-signpost me-2"></i>Dirección
                    </label>
                    <input
                      type="text"
                      id="direccion"
                      name="direccion"
                      className="form-control-pozos"
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
                  <div className="form-group-pozos">
                    <label htmlFor="ciudad" className="form-label-pozos">
                      <i className="bi bi-building-fill-add me-2"></i>Ciudad *
                    </label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      className={`form-control-pozos ${errors.ciudad ? 'is-invalid' : ''}`}
                      placeholder="Ej: Paraná"
                      value={newCliente?.ciudad || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.ciudad && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.ciudad}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="provincia" className="form-label-pozos">
                      <i className="bi bi-map me-2"></i>Provincia *
                    </label>
                    <input
                      type="text"
                      id="provincia"
                      name="provincia"
                      className={`form-control-pozos ${errors.provincia ? 'is-invalid' : ''}`}
                      placeholder="Ej: Entre Ríos"
                      value={newCliente?.provincia || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.provincia && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.provincia}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="pais" className="form-label-pozos">
                      <i className="bi bi-globe me-2"></i>País *
                    </label>
                    <input
                      type="text"
                      id="pais"
                      name="pais"
                      className={`form-control-pozos ${errors.pais ? 'is-invalid' : ''}`}
                      placeholder="Ej: Argentina"
                      value={newCliente?.pais || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.pais && (
                      <div className="invalid-feedback-pozos">
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
                  <div className="form-group-pozos">
                    <label htmlFor="cuil_cuit" className="form-label-pozos">
                      <i className="bi bi-card-text me-2"></i>CUIL / CUIT *
                    </label>
                    <input
                      type="text"
                      id="cuil_cuit"
                      name="cuil_cuit"
                      className={`form-control-pozos ${errors.cuil_cuit ? 'is-invalid' : ''}`}
                      placeholder="XX-XXXXXXXX-X"
                      value={newCliente?.cuil_cuit || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.cuil_cuit && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.cuil_cuit}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="iva_id" className="form-label-pozos">
                      <i className="bi bi-receipt me-2"></i>Condición IVA *
                    </label>
                    <select
                      id="iva_id"
                      name="iva_id"
                      className={`form-control-pozos ${errors.iva_id ? 'is-invalid' : ''}`}
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
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.iva_id}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="telefono" className="form-label-pozos">
                      <i className="bi bi-telephone-fill me-2"></i>Teléfono *
                    </label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      className={`form-control-pozos ${errors.telefono ? 'is-invalid' : ''}`}
                      placeholder="+54 9 11 XXXX-XXXX"
                      value={newCliente?.telefono || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.telefono && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.telefono}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fila 4: Email, Estado */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="email" className="form-label-pozos">
                      <i className="bi bi-envelope-fill me-2"></i>Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control-pozos ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="ejemplo@email.com"
                      value={newCliente?.email || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="estado" className="form-label-pozos">
                      <i className="bi bi-toggle-on me-2"></i>Estado *
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      className={`form-control-pozos ${errors.estado ? 'is-invalid' : ''}`}
                      value={newCliente?.estado || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccione...</option>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                    {errors.estado && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.estado}
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="estado" className="form-label-pozos">
                      <i className="bi bi-toggle-on me-2"></i>Tipo Cliente
                    </label>
                    <select
                      id="tipo_cliente_id"
                      name="tipo_cliente_id"
                      className={`form-control-pozos ${errors.tipoClientes ? 'is-invalid' : ''}`}
                      value={newCliente?.tipo_cliente_id || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    >
                      <option value="" disabled>
                        Seleccione un tipo Cliente
                      </option>
                      {tipoClientes.map((tipo) => {
                        return (
                          <option value={tipo.id}>{tipo.tipoClientes}</option>
                        );
                      })}
                    </select>
                    {errors.tipo_cliente_id && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.tipo_cliente_id}
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
                  <div className="form-group-pozos">
                    <label className="form-label-pozos">
                      <i className="bi bi-people-fill me-2"></i>
                      Ingeniero(s) Asignado(s) *
                    </label>

                    <div
                      className={`p-3 rounded ${errors.ingenieros ? 'border border-danger' : ''}`}
                      style={{
                        background: 'rgba(102, 126, 234, 0.05)',
                        border: '1px solid rgba(102, 126, 234, 0.2)',
                        maxHeight: '250px',
                        overflowY: 'auto',
                      }}
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
                            className="d-flex align-items-center justify-content-between p-2 mb-2 rounded"
                            style={{
                              background: isSelected
                                ? 'rgba(102, 126, 234, 0.15)'
                                : 'transparent',
                              border: `1px solid ${isSelected ? 'rgba(102, 126, 234, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleIngenierosCheckbox(ing.id)}
                          >
                            {/* Checkbox + Nombre */}
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="checkbox"
                                id={`ing-${ing.id}`}
                                checked={isSelected}
                                onChange={() => {}}
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  cursor: 'pointer',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <label
                                htmlFor={`ing-${ing.id}`}
                                style={{
                                  cursor: 'pointer',
                                  marginBottom: 0,
                                  fontWeight: isSelected ? 600 : 400,
                                }}
                              >
                                {ing.nombre}
                              </label>
                              {isPrincipal && (
                                <span
                                  className="badge"
                                  style={{
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    color: '#22c55e',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  <i className="bi bi-star-fill me-1"></i>
                                  Principal
                                </span>
                              )}
                            </div>

                            {/* Radio para Principal (solo si está seleccionado y hay más de 1) */}
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
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      cursor: 'pointer',
                                    }}
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
                      <div className="invalid-feedback-pozos d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.ingenieros}
                      </div>
                    )}

                    {errors.ingeniero_principal && (
                      <div className="invalid-feedback-pozos d-block">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.ingeniero_principal}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ Vista previa de ingenieros seleccionados */}
              {ingenierosSeleccionados.length > 0 && (
                <div className="alert alert-success d-flex align-items-start gap-2 mb-3">
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
                            className="badge d-flex align-items-center gap-1"
                            style={{
                              background: esPrincipal
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)',
                              color: esPrincipal ? '#22c55e' : '#3b82f6',
                              border: `1px solid ${esPrincipal ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.875rem',
                            }}
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
              <div className="form-group-pozos">
                <label htmlFor="notas" className="form-label-pozos">
                  <i className="bi bi-journal-text me-2"></i>Notas
                </label>
                <textarea
                  id="notas"
                  name="notas"
                  className="form-control-pozos"
                  rows="2"
                  placeholder="Información adicional del cliente..."
                  value={newCliente?.notas || ''}
                  onChange={handleCliente}
                  disabled={isSubmitting}
                />
              </div>

              {/* Botones */}
              <div className="modal-footer-pozos">
                <button
                  type="button"
                  className="btn-cancelar-pozos"
                  onClick={modalClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-guardar-pozos"
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
              className="modal-header-pozos"
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="modal-icon-container"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div>
                  <h3 className="modal-title-pozos mb-1">Campos Incompletos</h3>
                  <p className="modal-subtitle-pozos mb-0">
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
            <div className="modal-body-pozos">
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
                  className="btn-guardar-pozos"
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

      {/* ============================================================ */}
      {/* ESTILOS PARA LA ANIMACIÓN */}
      {/* ============================================================ */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
      `}</style>
    </>
  );
};

export default Clientes;
