export const stateColors = {
  COLOR_CERRADAS: '#146c43',
  COLOR_PROCESO: '#EF9F27',
  COLOR_PENDIENTES: '#E24B4A',
};

export const getEstadoColor = (estado) => {
  switch (estado) {
    case 'CERRADO':
      return stateColors.COLOR_CERRADAS;

    case 'EN PROCESO':
      return stateColors.COLOR_PROCESO;

    case 'PENDIENTE':
      return stateColors.COLOR_PENDIENTES;

    default:
      return '#BDBDBD'; // sin calibraciones
  }
};
