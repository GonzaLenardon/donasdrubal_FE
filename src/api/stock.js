import instance from './axios';

export const getAllStock = async () => {
  const res = await instance.get('/stock/all');
  return res;
};

export const getStockByWarehouse = async (warehouse_id) => {
  const res = await instance.get(`/stock/warehouse/${warehouse_id}`);
  return res;
};

export const getStockMovements = async () => {
  const res = await instance.get('/stock/movements');
  return res;
};

export const getMovementsByWarehouse = async (warehouse_id) => {
  const res = await instance.get(`/stock/movements/warehouse/${warehouse_id}`);
  return res;
};
