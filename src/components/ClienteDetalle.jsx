import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { allMaquinas } from '../api/maquinas';
import { ModalMaquinas } from './ModalMaquinas.jsx';
import { getUser } from '../api/users.js';
import { getCliente } from '../api/clientes.js';

const ClienteDetalles = () => {
  const {cliente_id } = useParams();
  const navigate = useNavigate();
  const [maquinas, setMaquinas] = useState([]);
  const [modal, setModal] = useState(false);
  const [maquinaEdit, setMaquinaEdit] = useState({});
  const [cliente, setCliente] = useState();

  useEffect(() => {
    Maquinas();
    client();
  }, []);

  const Maquinas = async () => {
    try {
      console.log('paso x aca', cliente_id);
      const res = await allMaquinas(cliente_id);
      setMaquinas(res.data);
    } catch (error) {
      console.log(error.data.message);
    }
  };

  const client = async () => {
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
      <div className="container-view ">
        {cliente && (
          <div className="container-datos">
            <div className="datos-cliente">
              <div className="cliente-name">{cliente.razon_social}</div>
              <span>{cliente.direccion_fiscal}</span>
              {/* <span>{cliente.telefono}</span> */}
            </div>
          </div>
        )}

        <div className="container-sm ">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Máquinas</h5>
            <button
              className="btn btn-primary"
              onClick={() => {
                setMaquinaEdit({ cliente_id: cliente.id });
                setModal(true);
              }}
            >
              + Maquina
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
                  <td>{maq.marca}</td>
                  <td>{maq.modelo}</td>
                  <td>{maq.tipo_maquina}</td>
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
                            `/cliente/${cliente_id}/detalles/maquina/${maq.id}/calibraciones`
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
    </>
  );
};

export default ClienteDetalles;
