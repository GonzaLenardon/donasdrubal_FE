import instance from './axios';

export const alertasNuevaCampaña = async (fechas) => {
  console.log('Fechitassssssss', fechas);
  const resp = await instance.post('/alertaservicios', fechas);
  return resp.data;
};
