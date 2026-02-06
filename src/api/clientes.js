import instance from './axios';

export const addCliente = async (cliente) => {
  const res = await instance.post(`/cliente`, cliente, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return res.data;
};

export const allCliente = async () => {
  const resp = await instance.get(`/cliente`);

  return resp.data;
};

// ✅ MEJOR PRÁCTICA
export const upCliente = async (cliente) => {
  const { id, ...datosActualizar } = cliente;
  const res = await instance.put(`/cliente/${id}`, datosActualizar);
  return res.data;
};

export const getCliente = async (cliente_id) => {
  const resp = await instance.get(`/cliente/${cliente_id}`);
  return resp.data;
};


export const getClienteStats = async (cliente_id) => {
  const resp = await instance.get(`/cliente/${cliente_id}/stats`);
   if (!resp.ok) throw new Error('Error al obtener estadísticas');
  return resp.data;
};

export const getClienteServicesChart = async (cliente_id) => {
  const resp = await instance.get(`/cliente/${cliente_id}/services-chart`);
  return resp.data;
};

export const getClienteMachinesChart = async (cliente_id) => {
  const resp = await instance.get(`/cliente/${cliente_id}/machines-chart`);
  return resp.data;
};

export const getClienteUpcomingServices = async (cliente_id) => {
  const resp = await instance.get(`/cliente/${cliente_id}/upcoming-services`);
  return resp.data;
};




