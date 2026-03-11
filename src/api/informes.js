import instance from './axios';

export const multiInformes = async (cliente_id, pozos_ids) => {

  // console.log('Llamando ... ', cliente_id, pozos_ids);

  const res = await instance.post(
    '/informes/pozos',
    {
      cliente_id,
      pozos_ids
    },
    {
      responseType: 'blob'   //  IMPORTANTE para PDFs
    }
  );

  const url = window.URL.createObjectURL(new Blob([res.data]));

  const a = document.createElement('a');
  a.href = url;
  a.download = 'informe_agua.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();

};
