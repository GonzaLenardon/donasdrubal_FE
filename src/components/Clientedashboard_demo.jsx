import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Droplets,
  Tractor,
  Calendar,
  GraduationCap,
  Wrench,
} from 'lucide-react';

// ==================== STATS CARD ====================
const StatCard = ({ title, value, trendLabel, isPositive, icon: Icon, color }) => {
  const iconColors = {
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border-2 border-border-light dark:border-border-dark shadow-sm hover:shadow-lg hover:border-[#4a7c1f] transition-all duration-300 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
        <Icon size={24} />
      </div>

      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {title}
        </p>
        <p className="text-4xl font-bold text-text-light dark:text-text-dark mb-2">
          {value}
        </p>
        <p
          className={`text-sm font-semibold flex items-center gap-1 ${
            isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {trendLabel}
        </p>
      </div>
    </div>
  );
};

// ==================== DONUT CHART ====================
const DonutChart = ({ data, totalValue, totalLabel, height = 250 }) => {
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
                borderRadius: '8px',
              }}
              itemStyle={{ color: '#f6f8f6' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {totalValue !== undefined && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-text-light dark:text-text-dark">
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

// ==================== SERVICE ITEM ====================
const statusStyles = {
  Confirmado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  Pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  Realizado: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

const ServiceItem = ({ title, subtitle, date, status, badge, icon }) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-card-light dark:bg-card-dark border-2 border-border-light dark:border-border-dark hover:border-[#4a7c1f] hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-semibold text-text-light dark:text-text-dark mb-1">
            {title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      {badge && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-gray-700 dark:text-gray-300 w-fit">
          {icon} {badge}
        </span>
      )}

      <p className="text-sm font-semibold text-[#4a7c1f] dark:text-[#6fb82f] flex items-center gap-1.5">
        <Calendar size={14} />
        {date}
      </p>
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================
const ClienteDashboard = ({ cliente }) => {
  // Stats data - esto vendría de tu API
  const statsData = [
    {
      title: 'Pozos Registrados',
      value: '8',
      trendLabel: '2 nuevos este año',
      isPositive: true,
      icon: Droplets,
      color: 'green',
    },
    {
      title: 'Máquinas Pulverizadoras',
      value: '5',
      trendLabel: '100% calibradas',
      isPositive: true,
      icon: Tractor,
      color: 'blue',
    },
    {
      title: 'Servicios Pendientes',
      value: '3',
      trendLabel: '2 próximos 15 días',
      isPositive: false,
      icon: Calendar,
      color: 'amber',
    },
    {
      title: 'Jornadas Realizadas',
      value: '12',
      trendLabel: '45 personas capacitadas',
      isPositive: true,
      icon: GraduationCap,
      color: 'purple',
    },
  ];

  // Chart 1 - Servicios por tipo
  const servicesChartData = [
    { name: 'Calibración', value: 8, color: '#3b82f6' },
    { name: 'Análisis Agua', value: 6, color: '#f59e0b' },
    { name: 'Capacitación', value: 4, color: '#10b981' },
  ];

  // Chart 2 - Estado de máquinas
  const machinesChartData = [
    { name: 'Al día', value: 4, color: '#10b981' },
    { name: 'Próximo', value: 1, color: '#f59e0b' },
    { name: 'Vencido', value: 0, color: '#ef4444' },
  ];

  // Servicios de calibración
  const calibracionServices = [
    {
      title: 'Pulverizadora Jacto PJ-600',
      subtitle: 'Calibración anual programada',
      date: '25 Julio 2024',
      status: 'Confirmado',
      badge: 'Autopropulsada',
      icon: '🚜',
    },
    {
      title: 'Pulverizadora Montana X-12',
      subtitle: 'Recalibración por cambio de picos',
      date: '02 Agosto 2024',
      status: 'Pendiente',
      badge: 'Arrastre',
      icon: '🚜',
    },
    {
      title: 'Equipo de Mochila Stihl',
      subtitle: 'Calibración de presión',
      date: '15 Junio 2024',
      status: 'Realizado',
      badge: 'Mochila',
      icon: '🎒',
    },
  ];

  // Otros servicios
  const otrosServices = [
    {
      title: 'Pozo Norte - Lote 42',
      subtitle: 'Análisis fisicoquímico completo',
      date: '28 Julio 2024',
      status: 'Confirmado',
      icon: '💧',
    },
    {
      title: 'Jornada: Aplicación Eficiente',
      subtitle: 'Capacitación de 8 operarios',
      date: '05 Agosto 2024',
      status: 'Pendiente',
      icon: '🎓',
    },
    {
      title: 'Pozo Sur - Lote 18',
      subtitle: 'Análisis de pH y dureza',
      date: '10 Junio 2024',
      status: 'Realizado',
      icon: '💧',
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 - Servicios por Tipo */}
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border-2 border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-text-light dark:text-text-dark text-lg font-bold">
            Servicios por Tipo
          </h3>
          <div className="flex-grow">
            <DonutChart
              data={servicesChartData}
              totalValue="18"
              totalLabel="Total"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-2">
            {servicesChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-text-light dark:text-text-dark">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2 - Estado de Máquinas */}
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border-2 border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-text-light dark:text-text-dark text-lg font-bold">
            Estado de Máquinas
          </h3>
          <div className="flex-grow">
            <DonutChart
              data={machinesChartData}
              totalValue="5"
              totalLabel="Máquinas"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-2">
            {machinesChartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-text-light dark:text-text-dark">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Servicios de Calibración */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="text-[#4a7c1f]" size={24} />
            <h2 className="text-text-light dark:text-text-dark text-xl font-bold">
              Próximos Servicios de Calibración
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {calibracionServices.map((service, idx) => (
              <ServiceItem key={idx} {...service} />
            ))}
          </div>
        </div>

        {/* Análisis de Agua y Capacitaciones */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Droplets className="text-[#4a7c1f]" size={24} />
            <h2 className="text-text-light dark:text-text-dark text-xl font-bold">
              Análisis de Agua y Capacitaciones
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {otrosServices.map((service, idx) => (
              <ServiceItem key={idx} {...service} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;