const generarPDF = (blob, filename, mode = 'preview') => {
  const url = URL.createObjectURL(blob);

  console.log('Que llega ', mode);

  if (mode === 'download') {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  } else {
    window.open(url, '_blank');
  }

  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export default generarPDF;
