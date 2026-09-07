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

export const dispatchRemito = async (id) => {
  const res = await instance.put(`/stock/remitos/${id}/dispatch`);
  return res;
};

export const receiveRemito = async (id, received_by) => {
  const res = await instance.put(`/stock/remitos/${id}/receive`, { received_by });
  return res;
};

export const cancelRemito = async (id) => {
  const res = await instance.put(`/stock/remitos/${id}/cancel`);
  return res;
};
