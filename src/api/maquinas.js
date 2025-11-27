import instance from './axios'; // 👈 Importar la instancia configurada

export const allMaquinas = async (user) => {
  const res = await instance.get(`/maquinas/${user}`);
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
