import instance from './axios';

export const allRankings = async () => {
  const res = await instance.get('/stock/rankings');
  return res;
};

export const getFullRankings = async () => {
  const res = await instance.get('/stock/rankings/full');
  return res;
};

export const addRanking = async (data) => {
  const res = await instance.post('/stock/rankings', data);
  return res;
};

export const updateRanking = async (id, data) => {
  const res = await instance.put(`/stock/rankings/${id}`, data);
  return res;
};

export const deleteRanking = async (id) => {
  const res = await instance.delete(`/stock/rankings/${id}`);
  return res;
};

export const getRankingByProduct = async (productId) => {
  const res = await instance.get(`/stock/rankings/product/${productId}`);
  return res;
};
