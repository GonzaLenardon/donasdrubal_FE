import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { allMaquinas } from '../api/maquinas';
import { ModalMaquinas } from './ModalMaquinas.jsx';
import { getCliente } from '../api/clientes.js';
import { clientePozos } from '../api/pozos.js';
import Pozos from './Pozos.jsx';

const UserDetalles = () => {
  const { cliente_id } = useParams();
  const navigate = useNavigate();
  const [maquinas, setMaquinas] = useState([]);
  const [modal, setModal] = useState(false);
  const [maquinaEdit, setMaquinaEdit] = useState({});
  const [pozos, setPozos] = useState([]);
  const [cliente, setCliente] = useState();

  console.log('UserDetalles', cliente_id);

  useEffect(() => {
    Maquinas();
    dataCliente();
    getPozos();
  }, []);

  const Maquinas = async () => {
    try {
      console.log('paso x aca');
      const res = await allMaquinas(cliente_id);
      setMaquinas(res.data);
      console.log('todas las maquins', res.data);
    } catch (error) {
      console.log(error.data.message);
    }
  };

  const getPozos = async () => {
    try {
      console.log('paso x aca POZOS');
      const res = await clientePozos(cliente_id);
      setPozos(res.data);
      console.log('todas los POZOS', res.data);
    } catch (error) {
      console.log(error.data.message);
    }
  };

  const dataCliente = async () => {
    try {
      console.log('paso x aca');
      const res = await getCliente(cliente_id);
      setCliente(res.data);
      console.log('cliente', res);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="container-view">
        {cliente && (
          <div className="container-datos">
            <div className="datos-user">
              <div className="user-name">{cliente.razon_social}</div>
              <span>{cliente.email}</span>
              <span>{cliente.telefono}</span>
            </div>
          </div>
        )}

        <div className="container-sm ">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Máquinas</h5>
            <button
              className="btn btn-primary"
              onClick={() => {
                setMaquinaEdit({ cliente_id: cliente_id });
                setModal(true);
              }}
            >
              +
            </button>
          </div>

          <table className="table table-hover">
            <thead>
              <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Tipo</th>
                <th>Responsable</th>
                <th className="d-flex justify-content-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maquinas.map((maq) => (
                <tr key={maq.id}>
                  <td>{maq.tipo.marca}</td>
                  <td>{maq.tipo.modelo}</td>
                  <td>{maq.tipo.tipo}</td>
                  <td>{maq.responsable}</td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center">
                      <button
                        className="btn btn-sm btn-primary btn-editver"
                        onClick={() => {
                          setMaquinaEdit(maq);
                          setModal(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-sm btn-warning btn-editver"
                        onClick={() =>
                          navigate(
                            `/cliente/${cliente_id}/detalles/maquinas/${maq.id}/calibraciones`
                          )
                        }
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

      {modal && (
        <ModalMaquinas
          onClose={() => {
            setModal(false);
            setMaquinaEdit(null);
          }}
          onSaved={() => Maquinas()} // 🔥 recarga lista
          maquina={maquinaEdit}
          setMaquinaEdit={setMaquinaEdit}
        />
      )}

      <Pozos pozos={pozos} />
    </>
  );
};

export default UserDetalles;
