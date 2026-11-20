import instance from './axios';

export const allFacturas = async () => {
  const res = await instance.get('/stock/facturas');
  return res;
};

export const getFactura = async (id) => {
  const res = await instance.get(`/stock/facturas/${id}`);
  return res;
};

export const remitosDisponibles = async (clienteId, incluirNoFacturables = false) => {
  const res = await instance.get('/stock/facturas/remitos-disponibles', {
    params: {
      cliente_id: clienteId,
      ...(incluirNoFacturables ? { incluir_no_facturables: 1 } : {}),
    },
  });
  return res;
};

export const addFactura = async (factura) => {
  const res = await instance.post('/stock/facturas', factura);
  return res;
};

export const anularFactura = async (id) => {
  const res = await instance.put(`/stock/facturas/${id}/anular`);
  return res;
};
