import instance from './axios'; // 👈 Importar la instancia configurada

export const clientePozos = async (cliente) => {
  const res = await instance.get(`/cliente/${cliente}/pozos`);
  return res.data;
};

export const upPozos = async (pozo) => {
  const { id, cliente_id, ...pozoAcutalizar } = pozo;

  console.log('Que envio endpoint', pozoAcutalizar);

  const res = await instance.put(
    `/cliente/${cliente_id}/pozos/${id}`,
    pozoAcutalizar,
  );
  return res.data;
};

export const addPozos = async (pozo) => {
  const { cliente_id, ...newPozo } = pozo;

  const res = await instance.post(`/cliente/${cliente_id}/pozos`, {
    newPozo,
  });
  return res.data;
};

export const delPozo = async (id) => {
  const res = await instance.delete(`/pozos/${id}`);
  return res.data;
};
