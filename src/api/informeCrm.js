import instance from './axios.js';

export const generarInformeCrm = async (filtros) => {
  const response = await instance.post('/reportes-crm/informe', filtros);
  return response.data.data;
};
