import React from 'react';

const Modal = ({ show, title, onClose, children, footer }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div
        className="custom-modal"
        onClick={(e) => e.stopPropagation()} // Evita cierre al hacer clic dentro
      >
        <div className="modal-header">
          <h5>{title}</h5>

          <button className="btn btnClose" onClick={onClose}>
            X
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
