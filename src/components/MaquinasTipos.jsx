import React, { use, useEffect, useState } from 'react';
import {
  addMaquinaTipo,
  allMaquinaTipo,
  updateMaquinaTipo,
} from '../api/maquinas_tipos.js';
import Modal from '../components/Modal.jsx'; // ✅ import del nuevo modal
import Spinner from './Spinner.jsx';
import { ToastContainer, Slide, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const MaquinaTipo = () => {
  const [maquinaTipoList, setMaquinaTipoList] = useState([]);
  const [modal, setModal] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [newMaquinaTipo, SetNewMaquinaTipo] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getAllMaquinaTipo();
  }, []);

  const getAllMaquinaTipo = async () => {
    try {
      const resp = await allMaquinaTipo();
      console.log('MaquinaEstado', resp.data);
      setMaquinaTipoList(resp.data);
    } catch (error) {
      console.error('Error al traer usuarios:', error.data);
    }
  };

  const updateMaquinaTipo = async () => {
    try {
      if (!validarCampos()) return;

      setLoading(true);
      setModal(false);
      const resp = await updateMaquinaTipo(newMaquinaTipo);
      setMsg(resp.message);
    } catch (error) {
      setMsg(error.message);
    } finally {
      getAllMaquinaTipo();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const insertMaquinaTipo = async () => {
    try {
      if (!validarCampos()) return;

      setLoading(true);
      setModal(false);
      const resp = await addMaquinaTipo(newMaquinaTipo);
      setMsg(resp.message);
    } catch (error) {
      setMsg(error.message);
    } finally {
      getAllMaquinaTipo();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const modalUpMaquinaTipo = (maquina_tipo) => {
    SetNewMaquinaTipo(maquina_tipo);
    setIsUpdate(true);
    setModal(true);
  };

  const modalNewMaquinaTipo = () => {
    SetNewMaquinaTipo({
      tipo: '',
      marca: '',
      modelo: '',
      fecha_fabricacion: '',
    });
    setIsUpdate(false);
    setModal(true);
  };

  useEffect(() => {
    console.log('first', newMaquinaTipo);
  }, [newMaquinaTipo]);

  const handleCliente = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    SetNewMaquinaTipo((prev) => ({ ...prev, [name]: value }));
  };

  const modalClose = () => {
    setModal(false);
    SetNewMaquinaTipo({});
  };

  const excluir = []; // por ejemplo

  const validarCampos = () => {
    for (const [key, value] of Object.entries(newMaquinaTipo)) {
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
    console.log('newMaquinaTipo:', newMaquinaTipo);
  }, [newMaquinaTipo]);

  return (
    <>
      <div className="container-sm ">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Tipos de Maquinas</h5>

          <button
            type="button"
            className="btn btn-primary"
            onClick={modalNewMaquinaTipo}
          >
            +
          </button>
        </div>

        <div className="container-sm">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Fecha Fabricación</th>
              </tr>
            </thead>
            <tbody>
              {maquinaTipoList.map((maquina_tipo) => (
                <tr key={maquina_tipo.id}>
                  <td>{maquina_tipo.tipo}</td>
                  <td>{maquina_tipo.marca}</td>
                  <td>{maquina_tipo.modelo}</td>
                  <td>{maquina_tipo.fecha_fabricacion}</td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center ">
                      {/* <button
                        className="btn btn-sm btn-primary btn-editver"
                        onClick={(e) => {
                          e.stopPropagation();
                          modalUpMaquinaTipo(maquina_tipo);
                        }}
                      >
                        Editar
                      </button> */}

                      {/*  <button
                        className="btn btn-sm btn-warning btn-editver"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVer(maquina_tipo);
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
        title={isUpdate ? 'Actualizar Tipo Maquina' : 'Nuevo Tipo de Maquina'}
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
              onClick={isUpdate ? updateMaquinaTipo : insertMaquinaTipo}
            >
              {isUpdate ? 'Actualizar ' : 'Aceptar '}
            </button>
          </>
        }
      >
        <div className="py-1 fw-bold">
          <label>Tipo</label>
          <select
            className="form-select w-50"
            name="tipo"
            value={newMaquinaTipo?.tipo || ''}
            onChange={handleCliente}
          >
            <option value="" disabled>
              Tipo de maquina
            </option>
            <option value="1">Autopropulsada</option>
            <option value="2">Suspendida</option>
            <option value="3">Remolque</option>
            <option value="4">Fija</option>
          </select>
        </div>
        <div className="py-1 fw-bold">
          <label>Marca</label>
          <input
            className="form-control rounded"
            name="marca"
            type="text"
            value={newMaquinaTipo?.marca || ''}
            onChange={handleCliente}
          />
        </div>
        <div className="py-1 fw-bold">
          <label>Modelo</label>
          <input
            className="form-control rounded"
            name="modelo"
            type="text"
            value={newMaquinaTipo?.modelo || ''}
            onChange={handleCliente}
          />
        </div>

        <div className="py-1 fw-bold">
          <label>Fecha de Fabricación</label>
          <input
            className="form-control rounded"
            name="fecha_fabricacion"
            type="text"
            value={newMaquinaTipo?.fecha_fabricacion || ''}
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

export default MaquinaTipo;
