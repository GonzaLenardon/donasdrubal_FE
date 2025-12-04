import React, { use, useEffect, useState } from 'react';
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

  const modalUpCliente = (cliente) => {
    SetNewCliente(cliente);
    setIsUpdate(true);
    setModal(true);
  };

  const modalNewCliente = () => {
    SetNewCliente({
      categoria: '',
      razon_social: '',
      direccion_fiscal: '',
      cuil_cuit: '',
      iva_id: '',
      telefono: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      pais: '',
      estado: '',
      modo_ingreso: '',
      notas: '',
    });
    setIsUpdate(false);
    setModal(true);
  };

  useEffect(() => {
    console.log('first', newCliente);
  }, [newCliente]);

  const handleCliente = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    SetNewCliente((prev) => ({ ...prev, [name]: value }));
  };

  const modalClose = () => {
    setModal(false);
    SetNewCliente({});
  };

  const excluir = [
    'categoria',
    'direccion',
    'modo_ingreso',
    ' notas',
    'user_email',
    'user_nombre',
    'user_password',
    'notas',
  ]; // por ejemplo

  const validarCampos = () => {
    for (const [key, value] of Object.entries(newCliente)) {
      if (!excluir.includes(key)) {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          console.log('key', key);
          toast.error(`Completar el campo: ${key}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleVer = async (cliente) => {
    /* navigate(`/cliente/${cliente.id}/detalles`, { state: { cliente } }); */
    navigate(`/cliente/${cliente.id}/detalles`, {
      state: { cliente: cliente },
    });
  };

  useEffect(() => {
    console.log('New Cliente', newCliente);
  }, [newCliente]);

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
                <th>Domicilio</th>
                <th>email</th>
                <th>Telefono</th>
                <th>Estado</th>
                <th className="d-flex  justify-content-center">Categoria</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {clienteList.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.razon_social}</td>
                  <td>{cliente.direccion_fiscal}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefono}</td>
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
        {/* <div className="py-1 fw-bold">
          <label>Nombre</label>
          <input
            className="form-control rounded"
            name="user_nombre"
            type="text"
            value={newCliente?.user_nombre || ''}
            onChange={handleCliente}
          />
        </div>
        <div className="py-1 fw-bold">
          <label>Email</label>
          <input
            className="form-control rounded"
            name="user_email"
            type="text"
            value={newCliente?.user_email || ''}
            onChange={handleCliente}
          />
        </div> */}
        <div className="py-1 fw-bold">
          <label>Razón Social</label>
          <input
            className="form-control rounded"
            name="razon_social"
            type="text"
            value={newCliente?.razon_social || ''}
            onChange={handleCliente}
          />
        </div>
        <div className="py-1 fw-bold">
          <label>Domicilio Fiscal</label>
          <input
            className="form-control rounded"
            name="direccion_fiscal"
            type="text"
            value={newCliente?.direccion_fiscal || ''}
            onChange={handleCliente}
          />
        </div>
        <div className="py-1 fw-bold">
          <label>CUIL / CUIT</label>
          <input
            className="form-control rounded"
            name="cuil_cuit"
            type="text"
            value={newCliente?.cuil_cuit || ''}
            onChange={handleCliente}
          />
        </div>

        {/*  <div className="py-1 fw-bold">
          <label>Condición IVA</label>
          <input
            className="form-control rounded"
            name="iva_id"
            type="text"
            value={newCliente?.iva_id || ''}
            onChange={handleCliente}
          />
        </div> */}

        <div className="py-1 fw-bold">
          <label>Condición IVA</label>
          <select
            className="form-select w-50"
            name="iva_id"
            value={newCliente?.iva_id || ''}
            onChange={handleCliente}
          >
            <option value="" disabled>
              Tipo Impositivo
            </option>
            <option value="1">Responsable Inscripto</option>
            <option value="2">Consumidor Final</option>
            <option value="3">Exento</option>
            <option value="4">Autonomo</option>
          </select>
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
          <label>Ciudad</label>
          <input
            className="form-control rounded"
            name="ciudad"
            type="text"
            value={newCliente?.ciudad || ''}
            onChange={handleCliente}
          />
        </div>
        <div className="py-1 fw-bold">
          <label>Provincia</label>
          <input
            className="form-control rounded"
            name="provincia"
            type="text"
            value={newCliente?.provincia || ''}
            onChange={handleCliente}
          />
        </div>
        <div className="py-1 fw-bold">
          <label>Pais</label>
          <input
            className="form-control rounded"
            name="pais"
            type="text"
            value={newCliente?.pais || ''}
            onChange={handleCliente}
          />
        </div>
        <div className="py-1 fw-bold">
          <label>Estado cliente</label>
          <input
            className="form-control rounded"
            name="estado"
            type="text"
            value={newCliente?.estado || ''}
            onChange={handleCliente}
          />
        </div>
        <div className="py-1 fw-bold">
          <label>Notas</label>
          <input
            className="form-control rounded"
            name="notas"
            type="text"
            value={newCliente?.notas || ''}
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
