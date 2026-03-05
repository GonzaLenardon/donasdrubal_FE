import instance from './axios';

export const multiInformes = async (pozos) => {
  console.log('Llamando ... ', pozos);
  const res = await instance.post(`/informes/pozos`, pozos);

  return res.data;
};
