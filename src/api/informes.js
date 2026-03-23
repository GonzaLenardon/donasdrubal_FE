import instance from './axios';

/* export const pozoMultiInformes = async (cliente_id, pozos_ids, filename) => {
  // console.log('Llamando ... ', cliente_id, pozos_ids);
  const res = await instance.post(
    '/informes/pozos',
    {
      cliente_id,
      pozos_ids,
    },
    {
      responseType: 'blob', //  IMPORTANTE para PDFs
    },
  );

  const url = window.URL.createObjectURL(new Blob([res.data]));

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'informe_muestras_agua.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
}; */

export const calibracionesPreview = async (id) => {
  const resp = await instance.get(`/calibraciones/${id}/preview-pdf`, {
    responseType: 'blob', // 👈 clave: le decís a Axios que espere datos binarios
  });
  return resp.data; // retorna el Blob directamente
};

export const calibracionInforme = async (
  cliente_id,
  calibracion_id,
  filename,
) => {
  // console.log('Llamando ... ', cliente_id, pozos_ids);

  const res = await instance.post(
    '/informes/calibracion',
    {
      cliente_id,
      calibracion_id,
    },
    {
      responseType: 'blob', //  IMPORTANTE para PDFs
    },
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

export const apiGenerarInformeMultiplePozos = async (cliente_id, pozos_ids) => {
  const resp = await instance.post(
    '/informes/pozos',
    { cliente_id, pozos_ids },
    {
      responseType: 'blob', // importante para recibir PDF
    },
  );
  return resp.data;
};

export const apiGenerarInformeMuestras = async (muestra) => {
  const { id } = muestra;
  const resp = await instance.get(`/informes/muestra/${id}`, {
    responseType: 'blob', // 👈 clave: le decís a Axios que espere datos binarios
  });
  return resp.data; // retorna el Blob directamente
};
