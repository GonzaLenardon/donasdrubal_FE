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
  const res = await instance.get(`/cliente`);

  return res.data;
};

// ✅ MEJOR PRÁCTICA
export const upCliente = async (cliente) => {
  const { id, ...datosActualizar } = cliente;
  const res = await instance.put(`/cliente/${id}`, datosActualizar);
  return res.data;
};

export const getCliente = async (cliente_id) => {
  const res = await instance.get(`/cliente/${cliente_id}`);
  return res.data;
};

/// DASHBORAD
/** Devuelve los cuatro estados -pozos-maquinas-jornadas-pendientes */
export const getClienteStats = async (cliente_id) => {
  const res = await instance.get(`/cliente/${cliente_id}/stats`);
  console.log('Respuesta de stats:', res);
  return res.data.payload;
};

// export const getClienteServicesChart = async (cliente_id) => {
//   const res = await instance.get(`/cliente/${cliente_id}/services-chart`);
//   return res.data.payload;
// };
/** Devuelve los datos para el gráfico de torta de analisis de agua */
export const getClienteAnalisisChart = async (cliente_id) => {
  const res = await instance.get(`/cliente/${cliente_id}/analisis-chart`);
  return res.data.payload;
};
/** Devuelve los datos para el gráfico de torta de calibraciones */
export const getClienteCalibracionesChart = async (cliente_id) => {
  const res = await instance.get(`/cliente/${cliente_id}/calibraciones-chart`);
  return res.data.payload;
};
/** Devuelve los datos para el gráfico de torta de jornadas */
export const getClienteJornadasChart = async (cliente_id) => {
  const res = await instance.get(`/cliente/${cliente_id}/jornadas-chart`);
  return res.data.payload;
};

export const getClienteMachinesChart = async (cliente_id) => {
  const res = await instance.get(`/cliente/${cliente_id}/machines-chart`);
  return res.data.payload;
};

export const getClienteUpcomingServices = async (cliente_id) => {
  const res = await instance.get(`/cliente/${cliente_id}/upcoming-services`);
  return res.data.payload;
};

export const getClienteNotas = async (clienteId) => {
  const response = await instance.get(`/clientes/${clienteId}/notas`);

  return response.data.data;
};




