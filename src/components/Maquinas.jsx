import { React, useEffect, useState } from 'react';

import { allMaquinas } from '../api/maquinas';
import { ModalMaquinas } from './ModalMaquinas';
import { useNavigate } from 'react-router-dom';

const Maquinas = ({ cliente_id }) => {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const [modal, setModal] = useState(false);
  const [maquinaEdit, setMaquinaEdit] = useState({});

  useEffect(() => {
    getMaquinas();
  }, []);

  const getMaquinas = async () => {
    try {
      setLoading(true);

      const res = await allMaquinas(cliente_id);
      console.log('dadadadada', res.data);
      setMsg(res.data.mensaje);
      setMaquinas(res.data);
    } catch (error) {
      setMsg(error.data.message);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  return (
    <div className="py-4">
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

      {modal && (
        <ModalMaquinas
          onClose={() => {
            setModal(false);
            setMaquinaEdit(null);
          }}
          onSaved={() => Maquinas()} // 🔥 recarga lista
          maquinaEdit={maquinaEdit}
          setMaquinaEdit={setMaquinaEdit}
        />
      )}
    </div>
  );
};

export default Maquinas;
