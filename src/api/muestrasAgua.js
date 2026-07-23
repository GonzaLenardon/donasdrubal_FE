import instance from './axios';

export const muestraAguaPozoCliente = async (cliente, pozo) => {
  const res = await instance.get(
    `/clientes/${cliente}/pozos/${pozo}/muestras_agua`,
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

export const openMuestra = async (id) => {
  const res = await instance.put(`/muestras_agua/open/${id}`);
  return res.data;
};

export const delMuestras = async (ids) => {
  const res = await instance.delete('/muestras_agua', {
    data: { ids }, // 👈 importante
  });
  return res.data;
};
