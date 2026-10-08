import instance from './axios.js';

export const allProspectos = async () => {
  const response = await instance.get('/prospectos');
  return response.data;
};

export const addProspecto = async (datos) => {
  const response = await instance.post('/prospectos', datos);
  return response.data;
};

export const crearInvitacionProspecto = async (prospectoId) => {
  const response = await instance.post(`/prospectos/${prospectoId}/invitacion`);
  return response.data;
};
