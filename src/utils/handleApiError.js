// utils/handleApiError.js

export const handleApiError = (error) => {
  const status = error.response?.status;

  if (error.code === 'ERR_NETWORK') {
    return 'Sin conexión al servidor';
  }

  if (status === 400) {
    return error.response?.data?.mensaje || 'Datos inválidos';
  }

  if (status === 401) {
    return error.response?.data?.mensaje || 'No autorizado';
  }

  if (status === 403) {
    return 'No tienes permisos para esta acción';
  }

  if (status === 404) {
    return 'Recurso no encontrado';
  }

  if (status === 500) {
    return 'Error interno del servidor';
  }

  return 'Error inesperado';
};
