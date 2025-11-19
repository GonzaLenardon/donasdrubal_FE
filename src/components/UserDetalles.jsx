import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { allMaquinas } from '../api/maquinas';
import { ModalMaquinas } from './ModalMaquinas.jsx';
import { getUser } from '../api/users.js';

const UserDetalles = () => {
  const { id_User } = useParams();
  const navigate = useNavigate();
  const [maquinas, setMaquinas] = useState([]);
  const [modal, setModal] = useState(false);
  const [maquinaEdit, setMaquinaEdit] = useState({});
  const [usuario, setUsuario] = useState();

  useEffect(() => {
    Maquinas();
    user();
  }, []);

  const Maquinas = async () => {
    try {
      console.log('paso x aca');
      const res = await allMaquinas(id_User);
      setMaquinas(res);
    } catch (error) {
      console.log(error.message);
    }
  };

  const user = async () => {
    try {
      console.log('paso x aca');
      const res = await getUser(id_User);
      setUsuario(res);
      console.log('usuario', res);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="container-view ">
        {usuario && (
          <div className="container-datos">
            <div className="datos-user">
              <div className="user-name">{usuario.nombre}</div>
              <span>{usuario.datosImpositivos}</span>
              <span>{usuario.telefono}</span>
            </div>
          </div>
        )}

        <div className="container-sm ">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Máquinas</h5>
            <button
              className="btn btn-primary"
              onClick={() => {
                setMaquinaEdit({});
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
                            `/user/${id_User}/detalles/maquina/${maq.id}/calibraciones`
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

export default UserDetalles;
