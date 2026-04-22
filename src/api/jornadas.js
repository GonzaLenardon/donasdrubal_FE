import instance from './axios'; // 👈 Importar la instancia configurada

export const clienteJornadas = async (cliente) => {
  console.log('first,', cliente);
  const res = await instance.get(`/cliente/${cliente}/jornadas`);
  return res.data;
};

export const upJornadas = async (jornada) => {
  const { id, cliente_id, ...jornadaAcutalizar } = jornada;
  const res = await instance.put(
    `/cliente/${cliente_id}/jornadas/${id}`,
    jornadaAcutalizar,
  );
  return res.data;
};

export const addJornadas = async (jornada) => {
  const { cliente_id, ...newJornada } = jornada;

  const res = await instance.post(
    `/cliente/${cliente_id}/jornadas`,
    newJornada,
  );
  return res.data;
};

export const closeJornada = async (id) => {
  const res = await instance.put(`/jornadas/close/${id}`);
  return res.data;
};

export const openJornada = async (id) => {
  const res = await instance.put(`/jornadas/open/${id}`);
  return res.data;
};
