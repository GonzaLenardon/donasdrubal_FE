import instance from './axios';

export const allSubrubros = async (rubroId) => {
  const params = rubroId ? `?rubro_id=${rubroId}` : '';
  const res = await instance.get(`/stock/subrubros${params}`);
  return res;
};

export const addSubrubro = async (subrubro) => {
  const res = await instance.post('/stock/subrubros', subrubro);
  return res;
};

export const upSubrubro = async (subrubro) => {
  const { id, ...datos } = subrubro;
  const res = await instance.put(`/stock/subrubros/${id}`, datos);
  return res;
};

export const delSubrubro = async (id) => {
  const res = await instance.delete(`/stock/subrubros/${id}`);
  return res;
};