import instance from './axios';

export const allRoles = async () => {
  const resp = await instance.get(`/roles`);

  return resp.data;
};
