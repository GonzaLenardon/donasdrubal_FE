import React from 'react';

const ModalInformativo = ({
  tipo = 'registro',
  dependencias = 'registros asociados',
  onClose,
}) => {
  return (
    <div
      className="modal-overlay-custom"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        className="modal-card-custom"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1f2937',
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          border: '1px solid rgba(239,68,68,0.4)',
        }}
      >
        {/* Icono */}
        <div className="text-center mb-3">
          <i
            className="bi bi-exclamation-triangle-fill"
            style={{ fontSize: '2.5rem', color: '#ef4444' }}
          ></i>
        </div>

        {/* Título */}
        <h5 className="text-white text-center fw-bold mb-3">
          No se pudo completar la eliminación
        </h5>

        {/* Texto */}
        <p className="text-white-50 text-center mb-4">
          No se puede eliminar <strong className="text-white">{tipo}</strong>{' '}
          porque existen <strong className="text-white">{dependencias}</strong>{' '}
          asociadas.
        </p>

        {/* Botón */}
        <div className="d-flex justify-content-center">
          <button className="btn btn-outline-light px-4" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalInformativo;
