import React from 'react';

// ─── Íconos SVG por acción ─────────────────────────────────────────────────────

const IconoFinalizar = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const IconoReabrir = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

// ─── Config por acción ─────────────────────────────────────────────────────────

const getConfig = (accion, servicio, esPlural) => {
  const s = esPlural ? `${servicio}s` : servicio;
  const art = esPlural ? 'estas' : 'esta';

  switch (accion) {
    case 'finalizar':
      return {
        icono: <IconoFinalizar />,
        titulo: `¿Finalizar ${art} ${s}?`,
        mensaje: (
          <>
            Una vez finalizado{esPlural ? 's' : ''},{' '}
            {esPlural
              ? `los ${s} no podrán ser modificados`
              : `el ${servicio} no podrá ser modificado`}
            . Asegurate de que toda la información esté correcta antes de
            confirmar.
          </>
        ),
      };

    case 'reabrir':
      return {
        icono: <IconoReabrir />,
        titulo: `¿Reabrir ${art} ${s}?`,
        mensaje: (
          <>
            {esPlural
              ? `Los ${s} volverán a estar disponibles para edición`
              : `La ${servicio} volverá a estar disponible para edición`}
            . Podrás modificar los datos hasta que{' '}
            {esPlural ? 'los finalices' : 'lo finalices'} nuevamente.
          </>
        ),
      };

    default:
      return {
        icono: null,
        titulo: 'Confirmar acción',
        mensaje: '¿Deseas continuar con esta acción?',
      };
  }
};

// ─── Componente ────────────────────────────────────────────────────────────────

const ModalFinalizarServicios = ({
  handleFinalizar,
  servicio,
  setShowFinalizar,
  accion,
  cantidad = 1,
}) => {
  // Normalizar cantidad a número (evita bugs cuando llega como string "1")
  const cantidadNum = parseInt(cantidad, 10) || 1;
  const esPlural = cantidadNum > 1;

  const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

  const { icono, titulo, mensaje } = getConfig(accion, servicio, esPlural);

  return (
    <div className="modal-overlay-logout">
      <div className="modal-card-logout" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-logout">{icono}</div>

        <h3 className="modal-title-logout">{titulo}</h3>

        <p className="modal-text-logout">{mensaje}</p>

        <div className="modal-buttons-logout">
          <button className="btn-logout-cancel" onClick={setShowFinalizar}>
            Cancelar
          </button>
          <button className="btn-logout-confirm" onClick={handleFinalizar}>
            {capitalizar(accion)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFinalizarServicios;
