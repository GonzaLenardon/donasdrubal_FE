// src/utils/statusMap.js

export const STATUS_CLASS_MAP = {
  activo: 'status-active',
  completado: 'status-success',
  pendiente: 'status-pending',
  mantenimiento: 'status-pending',
  inactivo: 'status-inactive',
  error: 'status-error',
};

export const getStatusClass = (estado) => {
  if (!estado || typeof estado !== 'string') {
    return 'status-unknown';
  }

  return STATUS_CLASS_MAP[estado.toLowerCase()] || 'status-unknown';
};
