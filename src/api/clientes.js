import instance from './axios';

export const addCliente = async (cliente) => {
  const res = await instance.post(`/cliente`, cliente, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return res.data;
};

export const allCliente = async () => {
  const resp = await instance.get(`/cliente`);

  return resp.data;
};

export const upCliente = async (cliente) => {
  const res = await instance.put(`/cliente`, cliente, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return res.data;
};

export const getCliente = async (id) => {
  const resp = await instance.get(`/cliente/${id}`);
  return resp.data;
};
