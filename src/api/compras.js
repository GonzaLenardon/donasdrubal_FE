import instance from './axios';

export const allPurchases = async () => {
  const res = await instance.get('/stock/purchases');
  return res;
};

export const addPurchase = async (purchase) => {
  const res = await instance.post('/stock/purchases', purchase);
  return res;
};
