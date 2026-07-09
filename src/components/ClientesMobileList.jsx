import EstadoServicio from './EstadoServicio';

const FilaEstado = ({
  label,
  cerradas,
  proceso,
  pendientes,
  total,
  unitLabel,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
    <EstadoServicio
      cerradas={cerradas}
      proceso={proceso}
      pendientes={pendientes}
      total={total}
      unitLabel={unitLabel}
    />
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
            gap: 10,
          }}
        >
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleServices.maquinas && (
              <FilaEstado
                label="Cal."
                cerradas={row.calCerradas}
                proceso={row.calProceso}
                pendientes={row.calPendientes}
                total={row.totalCal}
                unitLabel="máq."
              />
            )}
            {visibleServices.muestras && (
              <FilaEstado
                label="Muestras"
                cerradas={row.aguaCerradas}
                proceso={row.aguaProceso}
                pendientes={row.aguaPendientes}
                total={row.totalAgua}
                unitLabel="poz."
              />
            )}
            {visibleServices.jornadas && (
              <FilaEstado
                label="Jornadas"
                cerradas={row.jorCerradas}
                proceso={row.jorProceso}
                pendientes={row.jorPendientes}
                total={row.totalJornada}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientesMobileList;
