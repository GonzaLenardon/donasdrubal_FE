import instance from './axios';

export const notasCliente = async (cliente) => {
  const res = await instance.get(`/clientes/${cliente}/notas`);
  return res.data;
};

export const addNota = async (nota) => {
  const res = await instance.post(`/clientes/${nota.cliente_id}/notas`, nota);
  return res.data;
};

export const upNota = async (notaPozo) => {
  const { id, cliente_id, ...upNota } = notaPozo;
  const res = await instance.put(`/clientes/${cliente_id}/notas/${id}`, upNota);
  return res.data;
};

export const delNotas = async (cliente_id, id) => {
  const res = await instance.delete(`/clientes/${cliente_id}/notas/${id}`);
  return res.data;
};
