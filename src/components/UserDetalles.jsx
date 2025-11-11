import { React, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { allMaquinas } from '../api/maquinas';
import { Calibraciones } from '../api/calibraciones';
import { Spinner } from 'react-bootstrap';

const UserDetalles = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const [maquinas, setMaquinas] = useState();
  const [calibraciones, setCalibraciones] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getMaquinas();
  }, []);

  const getMaquinas = async () => {
    try {
      setLoading(true);
      /*    setModal(false); */

      const res = await allMaquinas(user.id);
      console.log('dadadadada', res);
      setMsg(res.mensaje);
      setMaquinas(res);
    } catch (error) {
      setMsg(error.message);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  const getCalibracion = async (maquina) => {
    try {
      setLoading(true);
      const resp = await Calibraciones(maquina);
      setMsg(resp.message);
      setCalibraciones(resp.data);
      console.log(resp);
    } catch (error) {
      setMsg(error.message);
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setLoading(false);
      setMsg('');
    }
  };

  return (
    <>
      <div className="container-view">
        <div className="container-datos-user">
          <h2 className="name">{user.nombre}</h2>

          <div className="d-flex  justify-content-around">
            <p>
              <strong>Localidad :</strong>
              {user.localidad}
            </p>
            <p>
              <strong>Condicion IVA :</strong>
              {user.datosImpositivos}
            </p>
            <p>
              <strong>Telefono :</strong>
              {user.telefono}
            </p>
          </div>
        </div>
        {user ? (
          <>
            <div className="container-sm">
              <h2 className="d-inline-block me-3">Maquinas</h2>
              <button type="button" className="btn btn-warning">
                {' '}
                +{' '}
              </button>
              <table className="table table-hover fs-5">
                <thead>
                  <tr>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Tipo</th>
                    <th>Responsable</th>
                    <th>Servicios</th>
                  </tr>
                </thead>
                <tbody>
                  {maquinas?.map((maq) => (
                    <tr key={maq.id}>
                      <td>{maq.marca}</td>
                      <td>{maq.modelo}</td>
                      <td>{maq.tipo_maquina}</td>
                      <td>{maq.responsable}</td>

                      <td>
                        <button
                          className="btn btn-sm btn-success"
                          style={{ width: '80px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            getCalibracion(maq.id);
                          }}
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>No se recibió usuario</p>
        )}
      </div>

      {/*  <Spinner loading={loading} msg={msg} /> */}
    </>
  );
};

export default UserDetalles;
