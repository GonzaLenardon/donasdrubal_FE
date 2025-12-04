import React from 'react';

const StatCard = ({ title, value, trendLabel, isPositive }) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
      <p className="text-text-light dark:text-text-dark text-base font-medium leading-normal">
        {title}
      </p>

      <p className="text-text-light dark:text-text-dark tracking-light text-4xl font-bold leading-tight">
        {value}
      </p>

      <p
        className={`${
          isPositive
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        } text-sm font-medium leading-normal flex items-center gap-1`}
      >
        <span className="material-symbols-outlined text-base">
          {isPositive ? 'arrow_upward' : 'arrow_downward'}
        </span>
        {trendLabel}
      </p>
    </div>
  );
};

const StatsRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Total de Clientes"
        value="124"
        trendLabel="+2.5%"
        isPositive={true}
      />

      <StatCard
        title="Total de Máquinas Pulverizadoras"
        value="86"
        trendLabel="+1.2%"
        isPositive={true}
      />

      <StatCard
        title="Servicios Pendientes"
        value="15"
        trendLabel="-5.0%"
        isPositive={false}
      />
    </div>
  );
};

export default StatsRow;
