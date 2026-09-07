import instance from './axios';

export const allProducts = async () => {
  const res = await instance.get('/stock/products');
  return res;
};

export const addProduct = async (product) => {
  const res = await instance.post('/stock/products', product);
  return res;
};

export const upProduct = async (product) => {
  const { id, ...datos } = product;
  const res = await instance.put(`/stock/products/${id}`, datos);
  return res;
};

export const delProduct = async (id) => {
  const res = await instance.delete(`/stock/products/${id}`);
  return res;
};

export const allPresentations = async () => {
  const res = await instance.get('/stock/presentations');
  return res;
};

export const addPresentation = async (presentation) => {
  const res = await instance.post('/stock/presentations', presentation);
  return res;
};

export const upPresentation = async (presentation) => {
  const { id, ...datos } = presentation;
  const res = await instance.put(`/stock/presentations/${id}`, datos);
  return res;
};

export const delPresentation = async (id) => {
  const res = await instance.delete(`/stock/presentations/${id}`);
  return res;
};
