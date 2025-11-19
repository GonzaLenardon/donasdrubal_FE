import axios from 'axios';
const url = import.meta.env.VITE_APP_API_URL;

export const addUser = async (user) => {
  const res = await axios.post(`${url}/user`, user, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return res.data;
};

export const allUsers = async () => {
  const resp = await axios.get(`${url}/user`);
  return resp.data;
};

export const upUser = async (user) => {
  const res = await axios.put(`${url}/user`, user, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return res.data;
};

export const getUser = async (id) => {
  const resp = await axios.get(`${url}/user/${id}`);
  return resp.data;
};
