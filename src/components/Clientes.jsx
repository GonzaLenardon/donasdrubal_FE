import React, { useEffect, useState } from 'react';
import { addCliente, allCliente, upCliente } from '../api/clientes.js';
import Spinner from './Spinner.jsx';

import { useNavigate } from 'react-router-dom';
import { allIngenieros } from '../api/users.js';

const Clientes = () => {
  const [clienteList, setClienteList] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [newCliente, SetNewCliente] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const all = async () => {
      getAllCliente();
      getAllIngenieros();
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

  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
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

    if (!newCliente.ingeniero_id) {
      newErrors.ingeniero_id = 'Debe asignar un ingeniero';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      let resp;
      if (newCliente?.id) {
        resp = await upCliente(newCliente);
      } else {
        resp = await addCliente(newCliente);
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
    setErrors({});
    setModal(true);
  };

  const handleCliente = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    SetNewCliente((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const modalClose = () => {
    setModal(false);
    SetNewCliente({});
    setErrors({});
  };

  /*   const handleVer = async (cliente) => {
    navigate(`/cliente/${cliente.id}/detalles`, {
      state: { cliente: cliente },
    });
  }; */

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

  useEffect(() => {
    console.log('New Cliente', newCliente);
  }, [newCliente]);

  return (
    <>
      <div
        style={{
          /*  minHeight: '100vh', */
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '15px',
        }}
      >
        <div style={{ margin: '0 auto' }}>
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-white mb-1">Clientes</h2>
              <p className="text-white-50 mb-0">
                {clienteList.length} Clientes registrados
              </p>
            </div>

            <button
              className="btn text-white d-flex align-items-center gap-2 shadow-lg pozos-btn-nuevo"
              onClick={() => {
                SetNewCliente({});
                setErrors({});
                setModal(true);
              }}
            >
              <i className="bi bi-plus-lg"></i>
              Nuevo Cliente
            </button>
          </div>

          <div
            className="rounded shadow-lg"
            style={{
              background: 'linear-gradient(145deg, #4a5d7c 0%, #3d4d69 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table
                className="table table-hover mb-0"
                style={{
                  '--bs-table-bg': 'transparent',
                  '--bs-table-accent-bg': 'transparent',
                  '--bs-table-striped-bg': 'transparent',
                  '--bs-table-hover-bg': 'rgba(102, 126, 234, 0.1)',
                  '--bs-table-color': '#ffffff',
                  '--bs-table-border-color': 'rgba(255,255,255,0.15)',
                }}
              >
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
                      <i className="bi bi-person-badge me-2"></i>
                      Nombre
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-geo-alt me-2"></i>
                      Domicilio
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-envelope-at me-2"></i>
                      Email
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-telephone me-2"></i>
                      Teléfono
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-toggle-on me-2"></i>
                      Estado
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3 text-center"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-tags me-2"></i>
                      Categoría
                    </th>
                    <th
                      className="text-white fw-semibold py-2 px-3 text-center"
                      style={{ fontSize: '0.875rem' }}
                    >
                      <i className="bi bi-gear me-2"></i>
                      Acciones
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'rgba(102, 126, 234, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
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
                      <td className="py-2 px-3 text-center">
                        <span
                          className="fw-semibold text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {cliente.estado}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className="fw-semibold text-white"
                          style={{ fontSize: '0.85rem' }}
                        >
                          {cliente.categoria}
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

          <Spinner loading={loading} msg={msg} />
        </div>
      </div>
      {/* Modal con diseño optimizado y ancho aumentado */}
      {modal && (
        <div className="modal-overlay">
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '1200px', width: '95%', height: '100%' }}
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
                      <i className="bi bi-building me-2"></i>Razón Social
                    </label>
                    <input
                      type="text"
                      id="razon_social"
                      name="razon_social"
                      className={`form-control-pozos ${
                        errors.razon_social ? 'is-invalid' : ''
                      }`}
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
                      Fiscal
                    </label>
                    <input
                      type="text"
                      id="direccion_fiscal"
                      name="direccion_fiscal"
                      className={`form-control-pozos ${
                        errors.direccion_fiscal ? 'is-invalid' : ''
                      }`}
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
                      <i className="bi bi-building-fill-add me-2"></i>Ciudad
                    </label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      className={`form-control-pozos ${
                        errors.ciudad ? 'is-invalid' : ''
                      }`}
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
                      <i className="bi bi-map me-2"></i>Provincia
                    </label>
                    <input
                      type="text"
                      id="provincia"
                      name="provincia"
                      className={`form-control-pozos ${
                        errors.provincia ? 'is-invalid' : ''
                      }`}
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
                      <i className="bi bi-globe me-2"></i>País
                    </label>
                    <input
                      type="text"
                      id="pais"
                      name="pais"
                      className={`form-control-pozos ${
                        errors.pais ? 'is-invalid' : ''
                      }`}
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

              {/* Fila 3: CUIL/CUIT, Condición IVA */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="cuil_cuit" className="form-label-pozos">
                      <i className="bi bi-card-text me-2"></i>CUIL / CUIT
                    </label>
                    <input
                      type="text"
                      id="cuil_cuit"
                      name="cuil_cuit"
                      className={`form-control-pozos ${
                        errors.cuil_cuit ? 'is-invalid' : ''
                      }`}
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
                      <i className="bi bi-receipt me-2"></i>Condición IVA
                    </label>
                    <select
                      id="iva_id"
                      name="iva_id"
                      className={`form-control-pozos ${
                        errors.iva_id ? 'is-invalid' : ''
                      }`}
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
                      <i className="bi bi-telephone-fill me-2"></i>Teléfono
                    </label>
                    <input
                      type="text"
                      id="telefono"
                      name="telefono"
                      className={`form-control-pozos ${
                        errors.telefono ? 'is-invalid' : ''
                      }`}
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

              {/* Fila 4: Teléfono, Email */}
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="form-group-pozos">
                    <label htmlFor="email" className="form-label-pozos">
                      <i className="bi bi-envelope-fill me-2"></i>Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control-pozos ${
                        errors.email ? 'is-invalid' : ''
                      }`}
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
                      <i className="bi bi-toggle-on me-2"></i>Estado
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      className={`form-control-pozos ${
                        errors.estado ? 'is-invalid' : ''
                      }`}
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
                    <label htmlFor="ingeniero_id" className="form-label-pozos">
                      <i className="bi bi-person-badge-fill me-2"></i>Ingeniero
                      Asignado
                    </label>
                    <select
                      id="ingeniero_id"
                      name="ingeniero_id"
                      className={`form-control-pozos ${
                        errors.ingeniero_id ? 'is-invalid' : ''
                      }`}
                      value={newCliente?.ingeniero_id || ''}
                      onChange={handleCliente}
                      disabled={isSubmitting}
                    >
                      <option value="">Seleccione...</option>
                      {ingenieros.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.ingeniero_id && (
                      <div className="invalid-feedback-pozos">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        {errors.ingeniero_id}
                      </div>
                    )}
                  </div>
                </div>
              </div>

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

      <Spinner loading={loading} msg={msg} />
    </>
  );
};

export default Clientes;
