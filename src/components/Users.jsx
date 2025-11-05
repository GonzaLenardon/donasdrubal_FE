import React, { useEffect, useState } from 'react';
import { addUser, getUsers, upUser } from '../api/users.js';
import Modal from '../components/Modal.jsx'; // ✅ import del nuevo modal
import Spinner from './Spinner.jsx';
import { ToastContainer, Slide, toast } from 'react-toastify';
import { Button } from 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Users = () => {
  const [userList, setUserList] = useState([]);
  const [modal, setModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [newUser, SetNewUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getAllUser();
  }, []);

  const getAllUser = async () => {
    try {
      const resp = await getUsers();
      setUserList(resp);
    } catch (error) {
      console.error('Error al traer usuarios:', error);
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
    const { id_usuario, rol, nombre, datosImpositivos, cuit, domicilio } = item;
    SetNewUser({
      id_usuario,
      rol,
      nombre,
      datosImpositivos,
      cuit,
      domicilio,
    });
    setIsUpdate(true);
    setModal(true);
  };

  const modalNewUser = () => {
    SetNewUser({
      nombre: '',
      rol: '',
      datosImpositivos: '',
      cuit: '',
      domicilio: '',
    });
    setIsUpdate(false);
    setModal(true);
  };

  const handleUser = (e) => {
    const { name, value } = e.target;
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

  return (
    <>
      <div>
        <h2>Usuarios</h2>
        <button
          type="button"
          className="btn btn-warning ms-5"
          onClick={modalNewUser}
        >
          Nuevo
        </button>

        <div className="container-sm">
          <table className="table table-hover fs-5">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Cuit</th>
                <th>Domicilio</th>
                <th>Datos Impositivos</th>

                <th>Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr key={user.id_usuario}>
                  <td>{user.nombre}</td>
                  <td>{user.rol}</td>
                  <td>{user.cuit}</td>
                  <td>{user.domicilio}</td>
                  <td>{user.datosImpositivos}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      style={{ width: '80px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        modalUpUser(user);
                      }}
                    >
                      Actualizar
                    </button>
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
          <button
            className="btn btn-success w-50"
            onClick={isUpdate ? updateUser : insertUser}
          >
            {isUpdate ? 'Actualizar ✅' : 'Aceptar ✅'}
          </button>
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
              Tipo Empleado
            </option>
            <option value="supervisor">Supervisor</option>
            <option value="operador">Operador</option>
          </select>
        </div>

        <div className="py-1 fw-bold">
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
        </div>

        <div className="py-1 fw-bold">
          <label>Cuit</label>
          <input
            className="form-control rounded"
            name="cuit"
            type="text"
            value={newUser?.cuit || ''}
            onChange={handleUser}
          />
        </div>

        <div className="py-1 fw-bold">
          <label>Domicilio</label>
          <input
            className="form-control rounded"
            name="domicilio"
            type="text"
            value={newUser?.domicilio || ''}
            onChange={handleUser}
          />
        </div>
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
