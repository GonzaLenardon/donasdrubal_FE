import instance from './axios';

export const allTipoClientes = async () => {
  const resp = await instance.get(`/tipoclientes`);

  return resp.data;
};
