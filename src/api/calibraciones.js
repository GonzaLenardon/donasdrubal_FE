import instance from './axios';

export const calibracionesMaquina = async (maquina) => {
  const res = await instance.get(`/calibraciones/${maquina}`);

  return res.data;
};

export const addCalibraciones = async (maquina) => {
  const res = await instance.post(`/calibraciones`, maquina);

  return res.data;
};

export const upCalibraciones = async (id, maquina) => {
  const res = await instance.put(`/calibraciones/${id}`, maquina);

  return res.data;
};
