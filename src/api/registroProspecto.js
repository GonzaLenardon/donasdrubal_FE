import instance from './axios';

export const getRegistroProspecto = async (token) => {
  const response = await instance.get(`/registro-prospecto/${token}`, {
    skipAuthRedirect: true,
  });
  return response.data;
};

export const upRegistroProspecto = async (token, datos) => {
  const response = await instance.put(`/registro-prospecto/${token}`, datos, {
    skipAuthRedirect: true,
  });
  return response.data;
};
