import axios from 'axios';
const url = import.meta.env.VITE_APP_API_URL;

export const calibracionesMaquina = async (maquina) => {
  const res = await axios.get(`${url}/calibraciones/${maquina}`);

  return res.data;
};

export const addCalibraciones = async (maquina) => {
  const res = await axios.post(`${url}/calibraciones`, maquina);

  return res.data;
};

export const upCalibraciones = async (id, maquina) => {
  const res = await axios.put(`${url}/calibraciones/${id}`, maquina);

  return res.data;
};
