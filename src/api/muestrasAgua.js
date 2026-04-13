import instance from './axios';

export const muestraAguaPozoCliente = async (cliente, pozo) => {
  console.log('first,', cliente);
  const res = await instance.get(
    `/cliente/${cliente}/pozos/${pozo}/muestras_agua`,
  );
  return res.data;
};

export const addMuestraPozo = async (muestraPozo) => {
  const res = await instance.post(`/muestras_agua`, muestraPozo);
  return res.data;
};

export const upMuestraPozo = async (muestraPozo) => {
  const { id, ...upMuestra } = muestraPozo;
  const res = await instance.put(`/muestras_agua/${id}`, upMuestra);
  return res.data;
};

export const closeMuestra = async (id) => {
  const res = await instance.put(`/muestras_agua/close/${id}`);
  return res.data;
};
