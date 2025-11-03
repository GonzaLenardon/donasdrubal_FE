const url = import.meta.env.VITE_APP_API_URL;
import axios from 'axios';

const getUsers = async () => {
  const resp = await axios.get(`${url}/user`);
  return resp.data;
};

export default getUsers;
