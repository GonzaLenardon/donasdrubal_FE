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
  const [searchTerm, setSearchTerm] = useState('');

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
    const { id, roles, nombre, email, telefono, password } = item;
    console.log('first', item);
    SetNewUser({
      id,
      role_id: parseInt(roles[0].id, 10),
      nombre,
      email,
      telefono,
      password,
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
      password: '',
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

  const filteredUsers = userList.filter(
    (user) =>
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <div className="container_seccion">
        <div style={{ margin: '0 auto' }}>
          {/* HEADER */}
          <div className="header">
            <div>
              <h2 className="title">Usuarios</h2>
              <p className="subtitle">{userList.length} Usuarios registrados</p>
            </div>
            <button className="btn-primary" onClick={modalNewUser}>
              <i className="bi bi-plus-lg"></i>
              Nuevo Usuario
            </button>
          </div>

          {/* BUSCADOR */}
          <div
            className="container-table rounded shadow-lg mb-2"
            style={{ background: '#1c4f1b36' }}
          >
            <div>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Buscar usuario..."
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
                  <th style={{ width: '25%' }}>
                    <i className="bi bi-person-fill me-1"></i>Nombre
                  </th>
                  <th style={{ width: '15%' }}>
                    <i className="bi bi-shield-check me-1"></i>Rol
                  </th>
                  <th style={{ width: '30%' }}>
                    <i className="bi bi-envelope-at me-1"></i>Email
                  </th>
                  <th style={{ width: '20%' }}>
                    <i className="bi bi-telephone me-1"></i>Teléfono
                  </th>
                  <th className="text-center" style={{ width: '10%' }}>
                    <i className="bi bi-gear"></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Sin usuarios registrados
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="td-truncate">
                        <span className="table-text">{user.nombre}</span>
                      </td>
                      <td>
                        <span className="table-badge-secondary">
                          {user.roles[0]?.nombre}
                        </span>
                      </td>
                      <td className="td-truncate">
                        <span className="table-text">{user.email}</span>
                      </td>
                      <td>
                        <span className="table-text">{user.telefono}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-btn table-btn-edit"
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL FORMULARIO */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <div className="d-flex align-items-center gap-3">
                <div className="modal-icon">
                  <i className="bi bi-person-circle"></i>
                </div>
                <div>
                  <h3 className="modal-title mb-1">
                    {isUpdate ? 'Actualizar Usuario' : 'Nuevo Usuario'}
                  </h3>
                  <p className="modal-subtitle mb-0">
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
            <div className="modal-user">
              {errors.submit && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  {errors.submit}
                </div>
              )}

              {/* Nombre */}
              <div className="form-section">
                <label htmlFor="nombre" className="form-label">
                  <i className="bi bi-person-fill me-2"></i>Nombre
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
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
              <div className="form-section">
                <label htmlFor="role_id" className="form-label">
                  <i className="bi bi-shield-check me-2"></i>Rol
                </label>
                <select
                  id="role_id"
                  name="role_id"
                  className={`form-control ${errors.role_id ? 'is-invalid' : ''}`}
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
              <div className="form-section">
                <label htmlFor="email" className="form-label">
                  <i className="bi bi-envelope-fill me-2"></i>Email
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
              <div className="form-section">
                <label htmlFor="telefono" className="form-label">
                  <i className="bi bi-telephone-fill me-2"></i>Teléfono
                </label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
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

              <div className="form-section">
                <label htmlFor="password" className="form-label">
                  <i className="bi bi-password-fill me-2"></i>Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="*********"
                  value={newUser?.password || ''}
                  onChange={handleUser}
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    <i className="bi bi-exclamation-circle me-1"></i>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Footer */}
            </div>
            <div className="modal-footer modal-footer--full">
              <button
                type="button"
                className="btn-cancel"
                onClick={modalClose}
                disabled={isSubmitting}
              >
                <i className="bi bi-x-circle me-2"></i>Cancelar
              </button>
              <button
                type="button"
                className="btn-save"
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
      )}

      <Spinner loading={loading} msg={msg} />

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
