import instance from './axios';

const NOTIFICACIONES_ENDPOINTS = {
  recibidas: (userId) => `/alertas/to_user/${userId}`,
  enviadas: (userId) => `/alertas/from_user/${userId}`,
};

export const getNotificacionesRecibidas = async (userId) => {
  const resp = await instance.get(NOTIFICACIONES_ENDPOINTS.recibidas(userId));
  return resp.data;
};

export const getNotificacionesEnviadas = async (userId) => {
  console.log('Fetching sent notifications for userId:', userId);
  console.log('Endpoint:', NOTIFICACIONES_ENDPOINTS.enviadas(userId));
  const resp = await instance.get(NOTIFICACIONES_ENDPOINTS.enviadas(userId));
  return resp.data;
};

export const createNotificacion = async (payload) => {
  const resp = await instance.post('/alertas', payload);
  return resp.data;
};
