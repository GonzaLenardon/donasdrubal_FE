import instance from './axios';

export const allProductBrands = async () => {
  const res = await instance.get('/stock/product-brands');
  return res;
};

export const addProductBrand = async (brand) => {
  const res = await instance.post('/stock/product-brands', brand);
  return res;
};

export const upProductBrand = async (brand) => {
  const { id, ...datos } = brand;
  const res = await instance.put(`/stock/product-brands/${id}`, datos);
  return res;
};

export const delProductBrand = async (id) => {
  const res = await instance.delete(`/stock/product-brands/${id}`);
  return res;
};
