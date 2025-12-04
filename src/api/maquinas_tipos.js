import instance from './axios'; // 👈 Importar la instancia configurada

export const allMaquinaTipo = async () => {
  console.log('allMaquinaTipo:,');
  const res = await instance.get(`/maquinas_tipos`);
  return res.data;
};

export const addMaquinaTipo = async (maquina_tipo) => {
  console.log('addMaquinaTipo:', maquina_tipo);

  const res = await instance.post(
    `/maquina_tipo`,
    maquina_tipo
  );
  return res.data;
};

export const updateMaquinaTipo = async (maquina_tipo) => {
  const {maquina_tipo_id, ...upMaquinaTipo } = maquina_tipo;

  const res = await instance.put(
    `/maquina_tipo/${maquina_tipo_id}`,
    upMaquinaTipo
  );
  return res.data;
};

export const getMaquina = async (maquina_tipo_id) => {
  const res = await instance.get(`/maquina_tipo/${maquina_tipo_id}`);
  return res.data;
};
