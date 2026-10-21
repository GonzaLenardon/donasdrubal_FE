import instance from './axios';

export const allWarehouses = async () => {
  const res = await instance.get('/stock/warehouses');
  return res;
};

export const addWarehouse = async (warehouse) => {
  const res = await instance.post('/stock/warehouses', warehouse);
  return res;
};

export const upWarehouse = async (warehouse) => {
  const { id, ...datos } = warehouse;
  const res = await instance.put(`/stock/warehouses/${id}`, datos);
  return res;
};

export const delWarehouse = async (id) => {
  const res = await instance.delete(`/stock/warehouses/${id}`);
  return res;
};
