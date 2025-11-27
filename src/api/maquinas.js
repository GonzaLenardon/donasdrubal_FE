import instance from './axios'; // 👈 Importar la instancia configurada

export const allMaquinas = async (cliente_id) => {
  // const res = await instance.get(`/maquinas/${cliente_id}`);
  const res = await instance.get(`/cliente/${cliente_id}/maquinas/`);
  return res.data;
};

export const addMaquinas = async (maquina) => {
  const res = await instance.post(`/maquinas`, maquina);
  return res.data;
};

export const updateMaquina = async (maquina) => {
  const res = await instance.put(`/maquinas`, maquina);
  return res.data;
};

export const getMaquina = async (maquina) => {
  const res = await instance.get(`/maquina/${maquina}`);
  return res.data;
};
