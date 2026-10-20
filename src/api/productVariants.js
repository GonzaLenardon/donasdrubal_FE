import instance from './axios';

export const allVariants = async () => {
  const res = await instance.get('/stock/product-variants');
  return res;
};

export const getFullVariants = async () => {
  const res = await instance.get('/stock/product-variants/full');
  return res;
};

export const addVariant = async (variant) => {
  const res = await instance.post('/stock/product-variants', variant);
  return res;
};

export const upVariant = async (variant) => {
  const { id, ...datos } = variant;
  const res = await instance.put(`/stock/product-variants/${id}`, datos);
  return res;
};

export const delVariant = async (id) => {
  const res = await instance.delete(`/stock/product-variants/${id}`);
  return res;
};

export const setRanking = async (id, ranking) => {
  const res = await instance.put(`/stock/product-variants/${id}/ranking`, { ranking });
  return res;
};

export const toggleActivo = async (id) => {
  const res = await instance.put(`/stock/product-variants/${id}/activo`);
  return res;
};