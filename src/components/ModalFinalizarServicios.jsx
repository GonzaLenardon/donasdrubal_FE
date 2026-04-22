const ModalFinalizarServicios = ({
  handleFinalizar,
  servicio,
  setShowFinalizar,
  isReabrir,
}) => {
  const accion = isReabrir ? 'Reabrir' : 'Finalizar';
  const accionTexto = isReabrir ? 'reabrir' : 'finalizar';

  return (
    <div className="modal-overlay-logout">
      <div className="modal-card-logout" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-logout">
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </div>

        <h3 className="modal-title-logout">
          ¿Deseas {accionTexto} {servicio}?
        </h3>

        <p className="modal-text-logout">
          Estás a punto de {accionTexto} <strong>{servicio}</strong>.{' '}
          {isReabrir
            ? `La ${servicio} volverá a estar disponible para edición.`
            : 'Asegúrate de haber guardado toda la información antes de continuar.'}
        </p>

        <div className="modal-buttons-logout">
          <button className="btn-logout-cancel" onClick={setShowFinalizar}>
            Cancelar
          </button>
          <button className="btn-logout-confirm" onClick={handleFinalizar}>
            {accion}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFinalizarServicios;
