import instance from './axios.js';

const getData = (response) => {
  if (!Array.isArray(response.data?.data)) {
    throw new Error('El servidor devolvió una lista de ubicaciones inválida.');
  }
  return response.data.data;
};

export const allPaises = async () => {
  const response = await instance.get('/paises');
  return getData(response);
};

export const provinciasPorPais = async (paisId) => {
  const response = await instance.get(`/paises/${paisId}/provincias`);
  return getData(response);
};

export const ciudadesPorProvincia = async (provinciaId) => {
  const response = await instance.get(`/provincias/${provinciaId}/ciudades`);
  return getData(response);
};
