export const COLOR_CERRADAS = '#639922';
export const COLOR_PROCESO = '#EF9F27';
export const COLOR_PENDIENTES = '#E24B4A';

/**
 * @param {number} [size] — diámetro en px. Default chico (8) para uso en
 *   listas compactas (ej: Pill de ClientesMobileList). EstadoServicio
 *   (desktop) pide un tamaño mayor explícitamente.
 */
export const Dot = ({ color, size = 8 }) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      display: 'inline-block',
      flexShrink: 0,
    }}
  />
);

/**
 * Indicador compacto de estado de servicio: total fijo (ej: "7 máq.") +
 * conteo con punto de color + barra de progreso fina + porcentaje.
 * Tooltip nativo (title) con el detalle completo al pasar el mouse.
 *
 * @param {string} [unitLabel] — unidad del total (ej: "máq.", "poz.").
 *   Si no se pasa, no se muestra el bloque de total (útil para Jornadas,
 *   que no tiene una "unidad" propia distinta del conteo de servicios).
 */
const EstadoServicio = ({
  cerradas = 0,
  proceso = 0,
  pendientes = 0,
  total = 0,
  unitLabel = null,
}) => {
  if (!total) {
    return <span style={{ fontSize: 13, color: '#9ca3af' }}>—</span>;
  }

  const pct = Math.round((cerradas / total) * 100);
  const wCerradas = Math.round((cerradas / total) * 100);
  const wProceso = Math.round((proceso / total) * 100);
  const wPendientes = 100 - wCerradas - wProceso;

  const tooltip = `${cerradas} cerradas, ${proceso} en proceso, ${pendientes} pendientes de ${total} en total (${pct}% completado)`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: 10,
        boxShadow: '2px 1px 5px rgba(0, 0, 0, 0.79)',
        padding: '4px 8px',
        borderRadius: 8,
      }}
    >
      {unitLabel && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#15361a',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {total} {unitLabel}
        </span>
      )}

      <div title={tooltip} style={{ cursor: 'default', flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Dot color={COLOR_CERRADAS} size={20} />
            {cerradas}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Dot color={COLOR_PROCESO} size={20} />
            {proceso}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Dot color={COLOR_PENDIENTES} size={20} />
            {pendientes}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            height: 4,
            borderRadius: 2,
            overflow: 'hidden',
            background: '#eef0f2',
            marginBottom: 3,
          }}
        >
          <div style={{ width: `${wCerradas}%`, background: COLOR_CERRADAS }} />
          <div style={{ width: `${wProceso}%`, background: COLOR_PROCESO }} />
          <div
            style={{ width: `${wPendientes}%`, background: COLOR_PENDIENTES }}
          />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#414e64' }}>
          {pct}% completado
        </span>
      </div>
    </div>
  );
};

export const LeyendaEstados = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
      fontSize: 12,
      color: '#6b7280',
      padding: '2px 2px 10px',
    }}
  >
    <span style={{ color: '#9ca3af' }}>Referencia</span>
    <span
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      title="Servicios cerrados / completados"
    >
      <Dot color={COLOR_CERRADAS} /> Cerradas
    </span>
    <span
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      title="Servicios en proceso, todavía sin cerrar"
    >
      <Dot color={COLOR_PROCESO} /> En proceso
    </span>
    <span
      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      title="Servicios pendientes, sin iniciar"
    >
      <Dot color={COLOR_PENDIENTES} /> Pendientes
    </span>
  </div>
);

export default EstadoServicio;
