const generarPDF = (blob, filename, mode = 'preview') => {

  console.log('PDF recibido en frontend:', {
    type: blob?.type,
    size: blob?.size,
    filename,
  });

  const url = URL.createObjectURL(blob);

  // console.log('URL creada:', url);

  if (mode === 'download') {

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

  } else {

    window.open(url, '_blank');
  }

  // Por ahora NO revocar la URL
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

export default generarPDF;
