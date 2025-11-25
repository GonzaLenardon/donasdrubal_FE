import React, { useEffect, useState } from 'react';
import { addCliente, allCliente, upCliente } from '../api/clientes.js';
import Modal from '../components/Modal.jsx'; // ✅ import del nuevo modal
import Spinner from './Spinner.jsx';
import { ToastContainer, Slide, toast } from 'react-toastify';
// import { Button } from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from 'react-router-dom';

const Clientes = () => {
  const [clienteList, setClienteList] = useState([]);
  const [modal, setModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [newCliente, SetNewCliente] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllCliente();
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

  const updateCliente = async () => {
    try {
      if (!validarCampos()) return;

      setLoading(true);
      setModal(false);
      const resp = await upCliente(newCliente);
      setMsg(resp.message);
    } catch (error) {
      setMsg(error.message);
    } finally {
      getAllCliente();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const insertCliente = async () => {
    try {
      if (!validarCampos()) return;

      setLoading(true);
      setModal(false);
      const resp = await addCliente(newCliente);
      setMsg(resp.message);
    } catch (error) {
      setMsg(error.message);
    } finally {
      getAllCliente();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const modalUpCliente = (item) => {
    const {
      id,
      rol,
      nombre,
      email,
      telefono,
      datosImpositivos,
      cuit,
      domicilio,
    } = item;
    SetNewCliente({
      id,
      rol,
      nombre,
      email,
      telefono,
      datosImpositivos,
      cuit,
      domicilio,
    });
    setIsUpdate(true);
    setModal(true);
  };

  const modalNewCliente = () => {
    SetNewCliente({
      nombre: '',
      rol: '',
      email: '',
      telefono: '',
      datosImpositivos: '',
      cuit: '',
      domicilio: '',
    });
    setIsUpdate(false);
    setModal(true);
  };

  const handleCliente = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    SetNewCliente((prev) => ({ ...prev, [name]: value }));
  };

  const modalClose = () => {
    setModal(false);
    SetNewCliente({});
  };

  const validarCampos = () => {
    console.log('que valido', newCliente);
    for (const campo of Object.values(newCliente)) {
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

  const handleVer = async (cliente) => {
    /* navigate(`/cliente/${cliente.id}/detalles`, { state: { cliente } }); */
    navigate(`/cliente/${cliente.id}/detalles`, { state: { cliente: cliente } });
  };

  return (
    <>
      <div className="container-sm ">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Clientes</h5>

          <button
            type="button"
            className="btn btn-primary"
            onClick={modalNewCliente}
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
                <th>Cuit</th>
                <th>email</th>
                <th>Telefono</th>
                <th>Domicilio</th>
                <th>Datos Impositivos</th>
                <th className="d-flex  justify-content-center">Actualizar</th>
              </tr>
            </thead>
            <tbody>
              {clienteList.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.razon_social}</td>
                  <td>{cliente.iva_id}</td>
                  <td>{cliente.direccion}</td>
                  <td>{cliente.user.email}</td>
                  <td>{cliente.user.telefono}</td>
                  <td>{cliente.estado}</td>
                  <td>{cliente.categoria}</td>

                  <td>
                    <div className="d-flex gap-2 justify-content-center ">
                      <button
                        className="btn btn-sm btn-primary btn-editver"
                        onClick={(e) => {
                          e.stopPropagation();
                          modalUpCliente(cliente);
                        }}
                      >
                        Editar
                      </button>

                      <button
                        className="btn btn-sm btn-warning btn-editver"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVer(cliente);
                        }}
                      >
                        Ver
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

      {/* 🔹 Usamos el nuevo modal */}

      <Modal
        show={modal}
        title={isUpdate ? 'Actualizar Cliente' : 'Nuevo Cliente'}
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
              onClick={isUpdate ? updateCliente : insertCliente}
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
            value={newCliente?.nombre || ''}
            onChange={handleCliente}
          />
        </div>

        <div className="py-1 fw-bold">
          <label>Rol</label>
          <select
            className="form-select w-50"
            name="rol"
            value={newCliente?.rol || ''}
            onChange={handleCliente}
          >
            <option value="" disabled>
              Tipo Empleado
            </option>
            <option value="supervisor">Supervisor</option>
            <option value="operador">Operador</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>

        <div className="py-1 fw-bold">
          <label>Datos Impositivo</label>
          <select
            className="form-select w-50"
            name="datosImpositivos"
            value={newCliente?.datosImpositivos || ''}
            onChange={handleCliente}
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
            value={newCliente?.cuit || ''}
            onChange={handleCliente}
          />
        </div>

        <div className="py-1 fw-bold">
          <label>Email</label>
          <input
            className="form-control rounded"
            name="email"
            type="text"
            value={newCliente?.email || ''}
            onChange={handleCliente}
          />
        </div>

        <div className="py-1 fw-bold">
          <label>Telefono</label>
          <input
            className="form-control rounded"
            name="telefono"
            type="text"
            value={newCliente?.telefono || ''}
            onChange={handleCliente}
          />
        </div>

        <div className="py-1 fw-bold">
          <label>Domicilio</label>
          <input
            className="form-control rounded"
            name="domicilio"
            type="text"
            value={newCliente?.domicilio || ''}
            onChange={handleCliente}
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

export default Clientes;
