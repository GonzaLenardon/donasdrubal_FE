import React from 'react';

const ModalCalibraciones = () => {
  return (
    <div className="modal-overlay">
      <div
        className="custom-modal"
        onClick={(e) => e.stopPropagation()} // Evita cierre al hacer clic dentro
      >
        <div className="modal-header">
          <h5>CALIBRACIONES</h5>

          <button className="btn btnClose" /* onClick={onClose} */>X</button>
        </div>

        {/*   {footer && <div className="modal-footer">{footer}</div>} */}
      </div>
    </div>
  );
};

export default ModalCalibraciones;
