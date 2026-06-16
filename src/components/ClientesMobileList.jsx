// src/components/ClientesMobileList.jsx

const Pill = ({ value, type }) => {
  if (!value) return null;

  const styles = {
    check: { background: '#eaf3de', color: '#3b6d11' },
    clock: { background: '#faeeda', color: '#854f0b' },
    circle: {
      background: '#f3f4f6',
      color: '#6b7280',
      border: '1px solid #e5e7eb',
    },
  };

  const icons = {
    check: '✔',
    clock: '⏳',
    circle: '○',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        fontSize: 11,
        fontWeight: 500,
        padding: '1px 7px',
        borderRadius: 999,
        ...styles[type],
      }}
    >
      <span style={{ fontSize: 10 }}>{icons[type]}</span>
      {value}
    </span>
  );
};

const StatRow = ({ label, cerradas, proceso, pendientes, meta }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <span
      style={{
        fontSize: 10,
        fontWeight: 500,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        width: 58,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      <Pill value={cerradas} type="check" />
      <Pill value={proceso} type="clock" />
      <Pill value={pendientes} type="circle" />
      {!cerradas && !proceso && !pendientes && (
        <span style={{ fontSize: 11, color: '#9ca3af' }}>—</span>
      )}
    </div>
    {meta && (
      <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 'auto' }}>
        {meta}
      </span>
    )}
  </div>
);

const ClientesMobileList = ({
  rows,
  hasActiveFilters,
  visibleServices,
  onSelect,
}) => {
  if (rows.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: '#9ca3af', padding: '1.5rem 0' }}>
        {hasActiveFilters
          ? 'No se encontraron clientes'
          : 'Sin clientes registrados'}
      </p>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '4px 2px',
      }}
    >
      {rows.map((row) => (
        <div
          key={row.id}
          onClick={() => onSelect(row)}
          style={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '10px 12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Header: nombre + litros */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingBottom: 8,
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: 13,
                  color: '#111827',
                  lineHeight: 1.3,
                }}
              >
                {row.razon_social}
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>
                {row.ciudad}, {row.provincia}
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                color: '#6b7280',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 6,
                padding: '1px 7px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              {row.litros_estimados
                ? `${row.litros_estimados.toLocaleString('es-AR')} L`
                : '— L'}
            </span>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {visibleServices.maquinas && (
              <StatRow
                label="Cal."
                cerradas={row.calCerradas}
                proceso={row.calProceso}
                pendientes={row.calPendientes}
                meta={`${row.totalMaquinas} máq.`}
              />
            )}
            {visibleServices.muestras && (
              <StatRow
                label="Muestras"
                cerradas={row.aguaCerradas}
                proceso={row.aguaProceso}
                pendientes={row.aguaPendientes}
                meta={`${row.totalPozos} poz.`}
              />
            )}
            {visibleServices.jornadas && (
              <StatRow
                label="Jornadas"
                cerradas={row.jorCerradas}
                proceso={row.jorProceso}
                pendientes={row.jorPendientes}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientesMobileList;
