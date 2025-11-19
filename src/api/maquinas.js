import axios from 'axios';
const url = import.meta.env.VITE_APP_API_URL;

export const allMaquinas = async (user) => {
  const res = await axios.get(`${url}/maquinas/${user}`);
  return res.data;
};

export const addMaquinas = async (maquina) => {
  const res = await axios.post(`${url}/maquinas`, maquina);
  return res.data;
};

export const updateMaquina = async (maquina) => {
  const res = await axios.put(`${url}/maquinas`, maquina);
  return res.data;
};

export const getMaquina = async (maquina) => {
  const res = await axios.get(`${url}/maquina/${maquina}`);
  return res.data;
};
