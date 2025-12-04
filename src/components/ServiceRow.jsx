import React from 'react';

// ----- Status Styles -----
const statusStyles = {
  Confirmado:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  Pendiente:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Realizado:
    'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

// ----- Service Item -----
const ServiceItem = ({ title, subtitle, date, status }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark gap-2">
      <div>
        <p className="font-semibold text-text-light dark:text-text-dark">
          {title}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
        <p className="font-medium text-text-light dark:text-text-dark">
          {date}
        </p>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};

// ----- Services Row -----
const ServicesRow = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
      {/* Column 1 */}
      <div>
        <h2 className="text-text-light dark:text-text-dark text-xl font-bold leading-tight tracking-tight mb-4">
          Próximos Servicios de Calibración
        </h2>

        <div className="flex flex-col gap-3">
          <ServiceItem
            title="Cliente Finca 'El Girasol'"
            subtitle="Calibración de Pulverizadora Jacto"
            date="25/07/2024"
            status="Confirmado"
          />
          <ServiceItem
            title="Agropecuaria 'La Esperanza'"
            subtitle="Calibración de Equipo Autopropulsado"
            date="28/07/2024"
            status="Pendiente"
          />
          <ServiceItem
            title="Hacienda 'San José'"
            subtitle="Calibración de Bomba de Mochila"
            date="02/08/2024"
            status="Confirmado"
          />
        </div>
      </div>

      {/* Column 2 */}
      <div>
        <h2 className="text-text-light dark:text-text-dark text-xl font-bold leading-tight tracking-tight mb-4">
          Otros Servicios Próximos
        </h2>

        <div className="flex flex-col gap-3">
          <ServiceItem
            title="Cooperativa Agrícola del Sur"
            subtitle="Análisis de Agua de Pozo"
            date="26/07/2024"
            status="Confirmado"
          />
          <ServiceItem
            title="Cliente Finca 'El Girasol'"
            subtitle="Capacitación de Personal"
            date="30/07/2024"
            status="Realizado"
          />
          <ServiceItem
            title="Agroinsumos del Valle"
            subtitle="Análisis Foliar de Cultivo"
            date="05/08/2024"
            status="Pendiente"
          />
        </div>
      </div>
    </div>
  );
};

export default ServicesRow;
