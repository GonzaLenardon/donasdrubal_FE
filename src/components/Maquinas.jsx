import { React, useEffect, useState } from 'react';

import { allMaquinas } from '../api/maquinas';
import { allUsers } from '../api/users';

const Maquinas = () => {
  const [userList, setUserList] = useState();
  const [user, setUser] = useState({});
  const [maquinas, setMaquinas] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getAllUser();
  }, []);

  const getAllUser = async () => {
    try {
      const resp = await allUsers();
      setUserList(resp.data);
    } catch (error) {
      console.error('Error al traer usuarios:', error);
    }
  };

  const getMaquinas = async () => {
    try {
      setLoading(true);
      /*    setModal(false); */

      const res = await allMaquinas(user.user);
      console.log('dadadadada', res);
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

  useEffect(() => {
    console.log('ddddddddddddd', user);
  }, [user]);

  const handleUser = (e) => {
    const { value, name } = e.target;
    console.log('first', value, name);

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className=" bg-info py-4">
      <div className="row justify-content-center align-items-center ">
        <div className="d-flex justify-content-center gap-5">
          <div className="col-12 col-md-5">
            <div className="form-floating">
              <select
                className="form-select"
                id="floatingSelectGrid"
                name="user"
                value={user?.user || ''}
                onChange={handleUser}
              >
                <option value="" disabled>
                  Seleccione un Cliente
                </option>
                {userList?.map((u) => (
                  <option value={u.id} key={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
              <label htmlFor="floatingSelectGrid">Seleccione un Cliente</label>
            </div>
          </div>
          <button
            type="button"
            className="btn btn btn-success"
            onClick={getMaquinas}
          >
            Buscar Maquinas
          </button>
        </div>
      </div>
      <h2>User {user.user}</h2>
    </div>
  );
};

export default Maquinas;
