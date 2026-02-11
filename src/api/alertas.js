import instance from './axios';

export const alertasNuevaCampaña = async (fechas) => {
  console.log('Fechitassssssss', fechas);
  const resp = await instance.post('/alertas', fechas);
  return resp.data;
};
