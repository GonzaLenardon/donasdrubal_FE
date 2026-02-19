import React, { useEffect, useState } from 'react';
import { addUser, allUsers, upUser } from '../api/users.js';
import Spinner from './Spinner.jsx';
import { ToastContainer, Slide, toast } from 'react-toastify';
import { allRoles } from '../api/roles.js';

const Users = () => {
  const [userList, setUserList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [newUser, SetNewUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getUsers();
    getRoles();
  }, []);

  useEffect(() => {
    console.log('first', newUser);
  }, [newUser]);

  const getUsers = async () => {
    try {
      const resp = await allUsers();
      setUserList(resp.data);
    } catch (error) {
      console.error('Error al traer usuarios:', error.data);
    }
  };

  const getRoles = async () => {
    try {
      const resp = await allRoles();
      setRoles(resp.data);
      console.log('Roliii', resp.data);
    } catch (error) {
      console.error('Error al traer usuarios:', error.data);
    }
  };

  const validarCampos = () => {
    const newErrors = {};

    if (!newUser.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!newUser.role_id) {
      newErrors.role_id = 'Debe seleccionar un rol';
    }

    if (!newUser.email?.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!newUser.telefono?.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Por favor completa todos los campos correctamente');
      return false;
    }

    return true;
  };

  const updateUser = async () => {
    if (!validarCampos()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      const resp = await upUser(newUser);
      setMsg(resp.message);
      getUsers();

      await new Promise((resolve) => setTimeout(resolve, 2000));
      modalClose();
    } catch (error) {
      setMsg(error.message);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      setMsg('');
    }
  };

  const insertUser = async () => {
    if (!validarCampos()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      const resp = await addUser(newUser);
      setMsg(resp.message);
      getUsers();

      await new Promise((resolve) => setTimeout(resolve, 2000));
      modalClose();
    } catch (error) {
      setMsg(error.message);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      setMsg('');
    }
  };

  const modalUpUser = (item) => {
    const { id, roles, nombre, email, telefono } = item;
    console.log('first', item);
    SetNewUser({
      id,
      role_id: parseInt(roles[0].id, 10),
      nombre,
      email,
      telefono,
    });
    setErrors({});
    setIsUpdate(true);
    setModal(true);
  };

  const modalNewUser = () => {
    SetNewUser({
      nombre: '',
      role_id: '',
      email: '',
      telefono: '',
    });
    setErrors({});
    setIsUpdate(false);
    setModal(true);
  };

  const handleUser = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    SetNewUser((prev) => ({ ...prev, [name]: value }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const modalClose = () => {
    setModal(false);
    SetNewUser({});
    setErrors({});
  };

  return (
    <>
      <div className="pozos-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2
              className="fw-bold text-success mb-1"
              style={{ fontSize: '2rem' }}
            >
              Usuarios
            </h2>
            <p className="text-white-50 mb-0" style={{ fontSize: '0.875rem' }}>
              {userList.length} Usuarios registrados
            </p>
          </div>

          <button
            className="btn text-white d-flex align-items-center gap-2 shadow-lg pozo-btn-nuevo"
            onClick={modalNewUser}
          >
            <i className="bi bi-plus-lg"></i>
            Nuevo Usuario
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
                    <i className="bi bi-person-fill me-2"></i>
                    Nombre
                  </th>

                  <th
                    className="text-white fw-semibold py-2 px-3"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-shield-check me-2"></i>
                    Rol
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
                    className="text-white fw-semibold py-2 px-3 text-center"
                    style={{ fontSize: '0.875rem' }}
                  >
                    <i className="bi bi-gear me-2"></i>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {userList.map((user) => (
                  <tr
                    key={user.id}
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
                        {user.nombre}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className="badge bg-primary text-white px-2 py-1"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {user.roles[0].nombre}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className="text-white"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {user.email}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span
                        className="text-white"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {user.telefono}
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
                            modalUpUser(user);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
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

      {/* Modal con diseño optimizado */}
      {modal && (
        <div className="modal-overlay" onClick={modalClose}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header-pozos">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon-container">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div>
                  <h3 className="modal-title-pozos mb-1">
                    {isUpdate ? 'Actualizar Usuario' : 'Nuevo Usuario'}
                  </h3>
                  <p className="modal-subtitle-pozos mb-0">
                    {isUpdate
                      ? 'Modifica la información del usuario'
                      : 'Completa los datos del nuevo usuario'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={modalClose}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body-pozos">
              {/* Error general */}
              {errors.submit && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {errors.submit}
                </div>
              )}

              {/* Nombre */}
              <div className="form-group">
                <label htmlFor="nombre" className="form-label">
                  <i className="bi bi-person-fill me-2"></i>
                  Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className={`form-control ${
                    errors.nombre ? 'is-invalid' : ''
                  }`}
                  placeholder="Ingrese nombre completo"
                  value={newUser?.nombre || ''}
                  onChange={handleUser}
                  disabled={isSubmitting}
                />
                {errors.nombre && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.nombre}
                  </div>
                )}
              </div>

              {/* Rol */}
              <div className="form-group">
                <label htmlFor="role_id" className="form-label">
                  <i className="bi bi-shield-check me-2"></i>
                  Rol
                </label>
                <select
                  id="role_id"
                  name="role_id"
                  className={`form-control ${
                    errors.role_id ? 'is-invalid' : ''
                  }`}
                  value={newUser?.role_id || ''}
                  onChange={handleUser}
                  disabled={isSubmitting}
                >
                  <option value="">Seleccione un rol</option>
                  {roles.map((rol) => (
                    <option key={rol.id} value={rol.id}>
                      {rol.nombre}
                    </option>
                  ))}
                </select>
                {errors.role_id && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.role_id}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <i className="bi bi-envelope-fill me-2"></i>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="ejemplo@email.com"
                  value={newUser?.email || ''}
                  onChange={handleUser}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Teléfono */}
              <div className="form-group">
                <label htmlFor="telefono" className="form-label">
                  <i className="bi bi-telephone-fill me-2"></i>
                  Teléfono
                </label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  className={`form-control ${
                    errors.telefono ? 'is-invalid' : ''
                  }`}
                  placeholder="+54 9 11 XXXX-XXXX"
                  value={newUser?.telefono || ''}
                  onChange={handleUser}
                  disabled={isSubmitting}
                />
                {errors.telefono && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.telefono}
                  </div>
                )}
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
                  onClick={isUpdate ? updateUser : insertUser}
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
                      {isUpdate ? 'Actualizar' : 'Crear Usuario'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Slide}
      />
    </>
  );
};

export default Users;
