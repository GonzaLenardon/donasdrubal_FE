import React from 'react';

/**
 * Modal de confirmación para acciones destructivas (borrado de registros).
 *
 * Props:
 * @param {Function} handleEliminar  - Callback ejecutado al confirmar
 * @param {Function} onCancelar      - Callback ejecutado al cancelar / cerrar
 * @param {string}   servicio        - Nombre del recurso (ej: "calibración", "máquina")
 * @param {string}   [detalle]       - Info adicional visible del registro (ej: nombre, ID)
 * @param {number}   [cantidad=1]    - Cantidad de registros a eliminar
 */
const ModalEliminar = ({
  handleEliminar,
  onCancelar,
  servicio,
  detalle,
  cantidad = 1,
}) => {
  const cantidadNum = parseInt(cantidad, 10) || 1;
  const esPlural = cantidadNum > 1;

  /* const s = esPlural ? `${servicio}s` : servicio; */
  /*   const s = esPlural ? `${servicio}s` : servicio; */

  const getServicioTexto = (servicio, esPlural) => {
    console.log('first', servicio, esPlural);
    const textos = {
      calibracion: esPlural ? 'calibraciones' : 'calibración',
      muestra: esPlural ? 'muestras' : 'muestra',
      maquina: esPlural ? 'maquinas' : 'maquina',
      pozo: esPlural ? 'pozos' : 'pozo',
      jornada: esPlural ? 'jornadas' : 'jornada',
      notificacion: esPlural ? 'notificaciones' : 'notificacion',
      nota: esPlural ? 'notas' : 'nota',
    };
    return textos[servicio];
  };

  const getArticulo = (servicio, esPlural) => {
    console.log('first', servicio, esPlural);
    const textos = {
      calibracion: esPlural ? 'las' : 'la',
      muestra: esPlural ? 'las' : 'la',
      maquina: esPlural ? 'las' : 'la',
      pozo: esPlural ? 'los' : 'el',
      jornada: esPlural ? 'las' : 'la',
      notificacion: esPlural ? 'las' : 'la',
      nota: esPlural ? 'las' : 'la',
    };
    return textos[servicio];
  };

  const s = getServicioTexto(servicio, esPlural);

  const art = getArticulo(servicio, esPlural);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={onCancelar}
    >
      <div
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
        {/* ── Ícono ── */}
        <div className="text-center mb-3">
          <i
            className="bi bi-trash3-fill"
            style={{ fontSize: '2.5rem', color: '#ef4444' }}
          ></i>
        </div>

        {/* ── Título ── */}
        <h5 className="text-white text-center fw-bold mb-2">
          ¿Eliminar {art} {s}?
        </h5>

        {/* ── Chip detalle del registro ── */}
        {detalle && (
          <div className="d-flex justify-content-center mb-3">
            <span
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.35)',
                color: '#fca5a5',
                borderRadius: '8px',
                padding: '0.25rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <i className="bi bi-tag-fill me-2"></i>
              {detalle}
            </span>
          </div>
        )}

        {/* ── Mensaje ── */}
        <p className="text-white-50 text-center mb-3">
          {esPlural
            ? `${art.charAt(0).toUpperCase() + art.slice(1)} ${cantidadNum} ${s} seleccionadas serán eliminadas`
            : `${art.charAt(0).toUpperCase() + art.slice(1)} ${servicio} será eliminada`}{' '}
          de forma{' '}
          <strong className="text-white">permanente e irreversible</strong>.
        </p>

        {/* ── Aviso ── */}
        <div
          className="mb-4"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '8px',
            padding: '0.6rem 0.9rem',
            fontSize: '0.82rem',
            color: '#fca5a5',
          }}
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          Esta acción <strong>no puede deshacerse</strong>. Confirmá solo si
          estás seguro.
        </div>

        {/* ── Botones ── */}
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-light w-50"
            style={{ fontWeight: 600 }}
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="btn w-50 fw-bold"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              border: 'none',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(220,38,38,0.35)',
            }}
            onClick={handleEliminar}
          >
            <i className="bi bi-trash3 me-2"></i>
            Eliminar{esPlural ? ` (${cantidadNum})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminar;
