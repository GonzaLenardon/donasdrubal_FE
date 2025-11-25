import axios from 'axios';
const url = import.meta.env.VITE_APP_API_URL;

export const addCliente = async (cliente) => {
  const res = await axios.post(`${url}/cliente`, cliente, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return res.data;
};

export const allCliente = async () => {
  const resp = await axios.get(`${url}/cliente`);

  return resp.data;
};

export const upCliente = async (cliente) => {
  const res = await axios.put(`${url}/cliente`, cliente, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return res.data;
};

export const getCliente = async (id) => {
  const resp = await axios.get(`${url}/cliente/${id}`);
  return resp.data;
};
