export const formatFecha = (fecha) => {
  return fecha
    ? new Date(fecha).toLocaleDateString('es-AR', {
        timeZone: 'UTC',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '-';
};
