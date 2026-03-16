import instance from './axios';

export const pozoMultiInformes = async (cliente_id, pozos_ids, filename) => {

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
  a.download = filename || 'informe_muestras_agua.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();

};

export const calibracionInforme = async (cliente_id, calibracion_id, filename) => {

  // console.log('Llamando ... ', cliente_id, pozos_ids);

  const res = await instance.post(
    '/informes/calibracion',
    {
      cliente_id,
      calibracion_id
    },
    {
      responseType: 'blob'   //  IMPORTANTE para PDFs
    }
  );
  console.log('Respuesta ... ', res.headers);

  const url = window.URL.createObjectURL(new Blob([res.data]));

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'informe_calibracion.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();

};
