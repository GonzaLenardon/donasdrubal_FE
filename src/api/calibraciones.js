import axios from 'axios';
const url = import.meta.env.VITE_APP_API_URL;

export const Calibraciones = async (maquina) => {
  const res = await axios.get(`${url}/calibraciones/${maquina}`);
  console.log('data', res);
  return res.data;
};
