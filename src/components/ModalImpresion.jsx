const ModalImpresion = ({ viewerUrl, setShowViewer }) => {
  console.log('LLego aca ', viewerUrl);

  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('urlMeta', apiUrl);

  // Imprimir
  /*   const handlePrint = () => {
    const printWindow = window.open(viewerUrl, '_blank');
    if (!printWindow) return;

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }; */

  return (
    <div className="modal-overlay">
      <div
        className="modal-container"
        style={{ maxWidth: '1000px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h5 className="fw-bold text-white mb-0">Vista previa del informe</h5>
          <button className="btn btn-sm" onClick={() => setShowViewer(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="p-3" style={{ maxHeight: '75vh', overflow: 'auto' }}>
          {viewerUrl?.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={apiUrl + viewerUrl}
              title="PDF Viewer"
              style={{
                width: '100%',
                height: '75vh',
                border: 'none',
                borderRadius: '8px',
              }}
            />
          ) : (
            <img
              src={apiUrl + viewerUrl}
              alt="Informe"
              style={{
                maxWidth: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
              }}
            />
          )}
        </div>

        {/*   <div className="modalx-footer">
          <button
            className="btnx-cancelar"
            onClick={() => setShowViewer(false)}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cerrar
          </button>

          <button className="btnx-guardar" onClick={handlePrint}>
            <i className="bi bi-printer me-2"></i>
            Imprimir
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ModalImpresion;
