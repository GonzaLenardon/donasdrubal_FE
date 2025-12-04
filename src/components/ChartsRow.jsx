import React from 'react';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ----- Donut Chart Component -----
const DonutChart = ({ data, totalValue, totalLabel, height = 200 }) => {
  return (
    <div className="relative h-full flex flex-col justify-center items-center">
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: '#1a3825',
                borderColor: '#2a543d',
                color: '#f6f8f6',
              }}
              itemStyle={{ color: '#f6f8f6' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {totalValue !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-text-light dark:text-text-dark mt-[-10px]">
            {totalValue}
          </span>
          {totalLabel && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {totalLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const ChartsRow = () => {
  // Chart 1 - Services

  const servicesData = [
    { name: 'Calibración', value: 8, color: '#3b82f6' }, // blue-500

    { name: 'Análisis', value: 5, color: '#f59e0b' }, // amber-500
    { name: 'Capacitación', value: 2, color: '#10b981' }, // emerald-500
  ];

  // Chart 2 - Clients
  const clientsData = [
    { name: 'Región A', value: 74, color: '#4f46e5' },
    { name: 'Región B', value: 31, color: '#d946ef' },
    { name: 'Región C', value: 19, color: '#0ea5e9' },
  ];

  // Chart 3 - Machines
  const machinesData = [
    { name: 'Tipo X', value: 43, color: '#84cc16' },
    { name: 'Tipo Y', value: 30, color: '#eab308' },
    { name: 'Tipo Z', value: 13, color: '#f97316' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Chart 1 */}
      <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
        <h3 className="text-text-light dark:text-text-dark text-lg font-bold">
          Servicios Pendientes por Tipos
        </h3>

        <div className="flex-grow">
          <DonutChart
            data={servicesData}
            totalValue="15"
            totalLabel="Servicios"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-sm mt-2">
          {servicesData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="text-text-light dark:text-text-dark">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts 2 & 3 */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clients Chart */}
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-text-light dark:text-text-dark text-lg font-bold">
            Distribución de Clientes
          </h3>

          <div className="flex-grow">
            <DonutChart data={clientsData} height={150} />
          </div>

          <div className="flex flex-col gap-2 text-sm mt-2">
            {clientsData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-text-light dark:text-text-dark">
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold text-text-light dark:text-text-dark">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Machines Chart */}
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-text-light dark:text-text-dark text-lg font-bold">
            Tipos de Máquinas
          </h3>

          <div className="flex-grow">
            <DonutChart data={machinesData} height={150} />
          </div>

          <div className="flex flex-col gap-2 text-sm mt-2">
            {machinesData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-text-light dark:text-text-dark">
                    {item.name}
                  </span>
                </div>
                <span className="font-semibold text-text-light dark:text-text-dark">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartsRow;
