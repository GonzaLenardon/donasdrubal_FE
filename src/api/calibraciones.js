import instance from './axios';

export const calibracionesMaquina = async (maquina_id, cliente_id) => {
  const res = await instance.get(
    `/cliente/${cliente_id}/maquinas/${maquina_id}/calibraciones`,
  );

  return res.data;
};

export const addCalibraciones = async (maquina) => {
  const res = await instance.post(`/calibraciones`, maquina);

  return res.data;
};

export const upCalibraciones = async (id, maquina) => {
  console.log('que envio', maquina);
  const res = await instance.put(`/calibraciones/${id}`, maquina);

  return res.data;
};

export const closeCalibraciones = async (id) => {
  const res = await instance.put(`/calibraciones/close/${id}`);

  return res.data;
};

export const openCalibraciones = async (id) => {
  const res = await instance.put(`/calibraciones/open/${id}`);
  return res.data;
};
