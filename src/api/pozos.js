import instance from './axios'; // 👈 Importar la instancia configurada

export const clientePozos = async (cliente) => {
  console.log('first,', cliente);
  const res = await instance.get(`/cliente/${cliente}/pozos`);
  return res.data;
};
