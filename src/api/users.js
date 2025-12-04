import instance from './axios'; // 👈 Importar la instancia configurada

export const addUser = async (user) => {
  const res = await instance.post(`/user`, user, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return res.data;
};

export const allUsers = async () => {
  const resp = await instance.get(`/user`);

  return resp.data;
};

export const upUser = async (user) => {
  const res = await instance.put(`/user`, user);

  return res.data;
};

export const getUser = async (id) => {
  const resp = await instance.get(`/user/${id}`);
  return resp.data;
};

export const login = async (data) => {
  const resp = await instance.post(`/login`, data);
  return resp.data;
};

export const logout = async () => {
  const res = await instance.post(`/user/logout`);
  return res.data;
};
