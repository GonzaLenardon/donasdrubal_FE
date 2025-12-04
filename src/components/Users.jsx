import React, { useEffect, useState } from 'react';
import { addUser, allUsers, upUser } from '../api/users.js';
import Modal from '../components/Modal.jsx'; // ✅ import del nuevo modal
import Spinner from './Spinner.jsx';
import { ToastContainer, Slide, toast } from 'react-toastify';
import { Button } from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [userList, setUserList] = useState([]);
  const [modal, setModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [newUser, SetNewUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllUser();
  }, []);

  useEffect(() => {
    console.log('first', newUser);
  }, [newUser]);

  const getAllUser = async () => {
    try {
      const resp = await allUsers();
      setUserList(resp.data);
    } catch (error) {
      console.error('Error al traer usuarios:', error.data);
    }
  };

  const updateUser = async () => {
    try {
      if (!validarCampos()) return;

      setLoading(true);
      setModal(false);
      const resp = await upUser(newUser);
      setMsg(resp.message);
    } catch (error) {
      setMsg(error.message);
    } finally {
      getAllUser();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const insertUser = async () => {
    try {
      if (!validarCampos()) return;

      setLoading(true);
      setModal(false);
      const resp = await addUser(newUser);
      setMsg(resp.message);
    } catch (error) {
      setMsg(error.message);
    } finally {
      getAllUser();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const modalUpUser = (item) => {
    const { id, rol, nombre, email, telefono } = item;
    SetNewUser({
      id,
      rol,
      nombre,
      email,
      telefono,
    });
    setIsUpdate(true);
    setModal(true);
  };

  const modalNewUser = () => {
    SetNewUser({
      nombre: '',
      rol: '',
      email: '',
      telefono: '',
    });
    setIsUpdate(false);
    setModal(true);
  };

  const handleUser = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    SetNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const modalClose = () => {
    setModal(false);
    SetNewUser({});
  };

  const validarCampos = () => {
    console.log('que valido', newUser);
    for (const campo of Object.values(newUser)) {
      if (
        campo === undefined ||
        campo === null ||
        (typeof campo === 'string' && campo.trim() === '')
      ) {
        toast.error('Completar todos los campos');
        return false;
      }
    }

    return true; // ✅ Agregá esto para asegurar que retorne true si todo está OK
  };

  /*   const handleVer = async (user) => {
    navigate(`/user/${user.id}/detalles`, { state: { user: user } });
  }; */

  return (
    <>
      <div className="container-sm ">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Usuarios</h5>

          <button
            type="button"
            className="btn btn-primary"
            onClick={modalNewUser}
          >
            +
          </button>
        </div>

        <div className="container-sm">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>email</th>
                <th>Telefono</th>
                <th className="d-flex  justify-content-center">Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr key={user.id}>
                  <td>{user.nombre}</td>
                  <td>{user.rol}</td>
                  <td>{user.email}</td>
                  <td>{user.telefono}</td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center ">
                      <button
                        className="btn btn-sm btn-primary btn-editver"
                        onClick={(e) => {
                          e.stopPropagation();
                          modalUpUser(user);
                        }}
                      >
                        Editar
                      </button>

                      {/*    <button
                        className="btn btn-sm btn-warning btn-editver"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVer(user);
                        }}
                      >
                        Ver
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Spinner loading={loading} msg={msg} />

      {/* 🔹 Usamos el nuevo modal */}

      <Modal
        show={modal}
        title={isUpdate ? 'Actualizar Usuario' : 'Nuevo Usuario'}
        onClose={modalClose}
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={modalClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              onClick={isUpdate ? updateUser : insertUser}
            >
              {isUpdate ? 'Actualizar ' : 'Aceptar '}
            </button>
          </>
        }
      >
        <div className="py-1 fw-bold">
          <label>Nombre</label>
          <input
            className="form-control rounded"
            name="nombre"
            type="text"
            value={newUser?.nombre || ''}
            onChange={handleUser}
          />
        </div>

        <div className="py-1 fw-bold">
          <label>Rol</label>
          <select
            className="form-select w-50"
            name="rol"
            value={newUser?.rol || ''}
            onChange={handleUser}
          >
            <option value="" disabled>
              Tipo Usuario
            </option>
            <option value="admin">Administrador</option>
            <option value="supervisor">Supervisor</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>

        {/* <div className="py-1 fw-bold">
          <label>Datos Impositivo</label>
          <select
            className="form-select w-50"
            name="datosImpositivos"
            value={newUser?.datosImpositivos || ''}
            onChange={handleUser}
          >
            <option value="" disabled>
              Tipo Impositivo
            </option>
            <option value="Responsable Inscripto">Responsable Inscripto</option>
            <option value="Consumidor Final">Consumidor Final</option>
            <option value="Exento">Exento</option>
            <option value="Autonomo">Autonomo</option>
          </select>
        </div> */}

        {/*   <div className="py-1 fw-bold">
          <label>Cuit</label>
          <input
            className="form-control rounded"
            name="cuit"
            type="text"
            value={newUser?.cuit || ''}
            onChange={handleUser}
          />
        </div>
 */}
        <div className="py-1 fw-bold">
          <label>Email</label>
          <input
            className="form-control rounded"
            name="email"
            type="text"
            value={newUser?.email || ''}
            onChange={handleUser}
          />
        </div>

        <div className="py-1 fw-bold">
          <label>Telefono</label>
          <input
            className="form-control rounded"
            name="telefono"
            type="text"
            value={newUser?.telefono || ''}
            onChange={handleUser}
          />
        </div>

        {/*  <div className="py-1 fw-bold">
          <label>Domicilio</label>
          <input
            className="form-control rounded"
            name="domicilio"
            type="text"
            value={newUser?.domicilio || ''}
            onChange={handleUser}
          />
        </div> */}
      </Modal>

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
