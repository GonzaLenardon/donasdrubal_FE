import axios from 'axios';
const url = import.meta.env.VITE_APP_API_URL;

export const allMaquinas = async (user) => {
  const res = await axios.get(`${url}/maquinas/${user}`);
  return res.data;
};
