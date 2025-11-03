import React, { useEffect, useState } from 'react';
import users from '../api/users.js';

const Users = () => {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const resp = await users();
        console.log(resp);
        setUserList(resp);
      } catch (error) {
        console.error('Error al traer usuarios:', error);
      }
    };

    fetchUsers();
  }, []); // [] para que solo se ejecute al montar

  return (
    <div>
      <h2>Users</h2>

      <div className="container-sm">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>

              <th>Actualizar</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user) => (
              <tr
                key={user.id_tipo}
                style={{ cursor: 'pointer' }}
                /*   onClick={() => modalNew(item)} */
              >
                <td>{user.nombre}</td>
                <td>{user.rol}</td>

                <td className="d-none d-md-table-cell">
                  <button
                    className="btn btn-sm btn-primary "
                    style={{ width: '80px' }}
                    /*    onClick={(e) => {
                        e.stopPropagation();
                        modalUpUser(user);
                      }} */
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
  );
};

export default Users;
