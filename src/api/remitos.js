import instance from './axios';

export const allRemitos = async () => {
  const res = await instance.get('/stock/remitos');
  return res;
};

export const getRemito = async (id) => {
  const res = await instance.get(`/stock/remitos/${id}`);
  return res;
};

export const addRemito = async (remito) => {
  const res = await instance.post('/stock/remitos', remito);
  return res;
};

export const cancelRemito = async (id, cancelled_by) => {
  const res = await instance.put(`/stock/remitos/${id}/cancel`, { cancelled_by });
  return res;
};

export const confirmRemito = async (id, confirmed_by) => {
  const res = await instance.put(`/stock/remitos/${id}/confirm`, { confirmed_by });
  return res;
};

export const getCatalogo = async (warehouseId) => {
  const res = await instance.get(`/stock/remitos/catalogo/${warehouseId}`);
  return res;
};

export const getRemitosFaltantes = async ({
  depositoId = null,
  ingenieroId = null,
  agrupar = false,
} = {}) => {
  let url = '/stock/remitos/faltantes';

  if (ingenieroId) {
    url += `/ingeniero/${ingenieroId}`;
  } else if (depositoId) {
    url += `/deposito/${depositoId}`;
  }

  if (agrupar) {
    url += '/agrupados';
  }

  const res = await instance.get(url);
  return res;
};

export const uploadPhoto = async (id, formData) => {
  const res = await instance.put(`/stock/remitos/${id}/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res;
};

export const getArchivos = async (remitoId) => {
  const res = await instance.get(`/stock/remitos/${remitoId}/archivos`);
  return res;
};

export const uploadArchivos = async (remitoId, formData) => {
  const res = await instance.post(`/stock/remitos/${remitoId}/archivos`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res;
};

export const deleteArchivo = async (remitoId, archivoId) => {
  const res = await instance.delete(`/stock/remitos/${remitoId}/archivos/${archivoId}`);
  return res;
};
