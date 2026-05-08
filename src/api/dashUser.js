import instance from './axios';

/* export const serviceToClients = async (clientes_ids) => {
  const resp = await instance.post(`dashboard/user/services`, {
    clientes_ids,
  });
  return resp.data;
};
 */
/* export const machinesToClients = async (clientes_ids) => {
  const resp = await instance.post(`dashboard/user/machines`, { clientes_ids });
  return resp.data;
}; */

/* export const allServices = async (clientes_ids) => {
  const resp = await instance.post(`dashboard/user/all`, { clientes_ids });
  return resp.data;
};
 */

export const allServicesToClients = async () => {
  const resp = await instance.get(`dashboard/user/servicesToClients`);
  return resp.data;
};

export const totalServices = async () => {
  const resp = await instance.get(`dashboard/services/totales`);
  return resp.data;
};
