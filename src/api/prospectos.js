import instance from './axios.js';

export const allProspectos = async () => {
  const response = await instance.get('/prospectos');
  return response.data;
};

export const getProspecto = async (id) => {
  const response = await instance.get('/prospectos/' + id);
  return response.data;
};

export const upProspecto = async (id, datos) => {
  const response = await instance.put('/prospectos/' + id, datos);
  return response.data;
};

export const convertirProspecto = async (id) => {
  const response = await instance.post('/prospectos/' + id + '/convertir');
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
