const COLOR_CERRADAS = '#639922';
const COLOR_PROCESO = '#EF9F27';
const COLOR_PENDIENTES = '#E24B4A';

export const Dot = ({ color }) => (
  <span
    style={{
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: color,
      display: 'inline-block',
      flexShrink: 0,
    }}
  />
);

/**
 * Indicador compacto de estado de servicio: conteo con punto de color +
 * barra de progreso fina + porcentaje. Tooltip nativo (title) con el
 * detalle completo al pasar el mouse. Reemplaza al donut SVG anterior.
 */
const EstadoServicio = ({
  cerradas = 0,
  proceso = 0,
  pendientes = 0,
  total = 0,
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
    <div title={tooltip} style={{ cursor: 'default' }}>
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
          <Dot color={COLOR_CERRADAS} />
          {cerradas}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Dot color={COLOR_PROCESO} />
          {proceso}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Dot color={COLOR_PENDIENTES} />
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
      <span style={{ fontSize: 11, color: '#9ca3af' }}>{pct}% completado</span>
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
