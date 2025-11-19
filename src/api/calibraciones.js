import axios from 'axios';
const url = import.meta.env.VITE_APP_API_URL;

export const calibracionesMaquina = async (maquina) => {
  const res = await axios.get(`${url}/calibraciones/${maquina}`);

  return res.data;
};
