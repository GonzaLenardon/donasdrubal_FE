import instance from './axios'; // 👈 Importar la instancia configurada

export const allMaquinas = async (cliente) => {
  console.log('first,', cliente);
  const res = await instance.get(`/cliente/${cliente}/maquinas`);
  return res.data;
};

export const addMaquinas = async (maquina) => {
  console.log('first', maquina);

  const { cliente_id, ...newMaquina } = maquina;
  /*  newMaquina.marca ='-';
  newMaquina.modelo ='-'; */
  const res = await instance.post(
    `/cliente/${cliente_id}/maquinas`,
    newMaquina,
  );
  return res.data;
};

export const updateMaquina = async (maquina) => {
  const { cliente_id, id, ...upMaquina } = maquina;

  const res = await instance.put(
    `/cliente/${cliente_id}/maquinas/${id}`,
    upMaquina,
  );
  return res.data;
};

export const getMaquina = async (maquina) => {
  const res = await instance.get(`/maquina/${maquina}`);
  return res.data;
};

export const delMaquina = async (id) => {
  const res = await instance.delete(`/maquinas/${id}`);
  return res.data;
};
