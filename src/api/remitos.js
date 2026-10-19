import instance from './axios';

export const allRemitos = async () => {
  const res = await instance.get('/stock/remitos');
  return res;
};

export const getRemito = async (id) => {
  const res = await instance.get(`/stock/remitos/${id}`);
  return res;
};

export const addRemito = async (remito) => {
  const res = await instance.post('/stock/remitos', remito);
  return res;
};

export const cancelRemito = async (id, cancelled_by) => {
  const res = await instance.put(`/stock/remitos/${id}/cancel`, { cancelled_by });
  return res;
};

export const confirmRemito = async (id, confirmed_by) => {
  const res = await instance.put(`/stock/remitos/${id}/confirm`, { confirmed_by });
  return res;
};

export const getCatalogo = async (warehouseId) => {
  const res = await instance.get(`/stock/remitos/catalogo/${warehouseId}`);
  return res;
};

export const uploadPhoto = async (id, formData) => {
  const res = await instance.put(`/stock/remitos/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res;
};
