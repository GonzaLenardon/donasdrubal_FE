import instance from './axios';

export const allRubros = async () => {
  const res = await instance.get('/stock/rubros');
  return res;
};

export const addRubro = async (rubro) => {
  const res = await instance.post('/stock/rubros', rubro);
  return res;
};

export const upRubro = async (rubro) => {
  const { id, ...datos } = rubro;
  const res = await instance.put(`/stock/rubros/${id}`, datos);
  return res;
};

export const delRubro = async (id) => {
  const res = await instance.delete(`/stock/rubros/${id}`);
  return res;
};