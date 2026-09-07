import instance from './axios';

export const allProviders = async () => {
  const res = await instance.get('/stock/providers');
  return res;
};

export const addProvider = async (provider) => {
  const res = await instance.post('/stock/providers', provider);
  return res;
};

export const upProvider = async (provider) => {
  const { id, ...datos } = provider;
  const res = await instance.put(`/stock/providers/${id}`, datos);
  return res;
};

export const delProvider = async (id) => {
  const res = await instance.delete(`/stock/providers/${id}`);
  return res;
};
