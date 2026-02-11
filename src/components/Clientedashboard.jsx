import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Droplets,
  Tractor,
  Calendar,
  GraduationCap,
  Wrench,
  Loader,
  AlertCircle,
} from 'lucide-react';

import { 

  getClienteStatsWithAlerts as getClienteStats,
  getClienteServicesChart, 
  getClienteMachinesChart, 
  getClienteUpcomingServices 
} from '../api/clientes.js';

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

// ==================== SKELETON LOADING ====================
const StatCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border-2 border-border-light dark:border-border-dark animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-gray-300 dark:bg-gray-600"></div>
      <div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
      </div>
    </div>
  );
};

const ChartCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border-2 border-border-light dark:border-border-dark animate-pulse">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
      <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="flex gap-4 mt-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
      </div>
    </div>
  );
};

const ServiceItemSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-card-light dark:bg-card-dark border-2 border-border-light dark:border-border-dark animate-pulse">
      <div className="flex justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
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

// ==================== ERROR COMPONENT ====================
const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
        <h3 className="text-red-800 dark:text-red-300 font-bold text-xl mb-2">
          Error al cargar el dashboard
        </h3>
        <p className="text-red-600 dark:text-red-400 text-sm mb-6">
          {error || 'Ocurrió un error al obtener los datos. Por favor, intenta nuevamente.'}
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
};

// ==================== EMPTY STATE ====================
const EmptyState = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Droplets className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          Sin datos disponibles
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No hay información para mostrar en este momento.
        </p>
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================
const ClienteDashboard = ({ cliente }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    servicesChart: null,
    machinesChart: null,
    upcomingServices: null,
  });

  // // Importar funciones de API (ajusta la ruta según tu estructura)
  // const getClienteStats = async (clienteId) => {
  //   const response = await fetch(`/api/clientes/${clienteId}/stats`);
  //   if (!response.ok) throw new Error('Error al obtener estadísticas');
  //   return response.json();
  // };

  // const getClienteServicesChart = async (clienteId) => {
  //   const response = await fetch(`/api/clientes/${clienteId}/services-chart`);
  //   if (!response.ok) throw new Error('Error al obtener gráfico de servicios');
  //   return response.json();
  // };

  // const getClienteMachinesChart = async (clienteId) => {
  //   const response = await fetch(`/api/clientes/${clienteId}/machines-chart`);
  //   if (!response.ok) throw new Error('Error al obtener gráfico de máquinas');
  //   return response.json();
  // };

  // const getClienteUpcomingServices = async (clienteId) => {
  //   const response = await fetch(`/api/clientes/${clienteId}/upcoming-services`);
  //   if (!response.ok) throw new Error('Error al obtener servicios próximos');
  //   return response.json();
  // };

  // Fetch de datos
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [stats, servicesChart, machinesChart, upcomingServices] = 
        await Promise.all([
          getClienteStats(cliente.id),
          getClienteServicesChart(cliente.id),
          getClienteMachinesChart(cliente.id),
          getClienteUpcomingServices(cliente.id),
        ]);

      setDashboardData({
        stats,
        servicesChart,
        machinesChart,
        upcomingServices,
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cliente?.id) {
      fetchDashboardData();
    }
  }, [cliente?.id]);

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="flex flex-col gap-8 pb-8">
        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <ChartCardSkeleton key={i} />
          ))}
        </div>

        {/* Services Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((col) => (
            <div key={col}>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-2/3 mb-4 animate-pulse"></div>
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <ServiceItemSkeleton key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchDashboardData} />;
  }

  // ==================== EMPTY STATE ====================
  if (!dashboardData.stats) {
    return <EmptyState />;
  }

  // ==================== TRANSFORM API DATA ====================
  // Transformar datos de stats
  const statsData = [
    {
      title: 'Pozos Registrados',
      value: dashboardData.stats?.pozos?.total?.toString() || '0',
      trendLabel: `${dashboardData.stats?.pozos?.nuevos || 0} nuevos ${dashboardData.stats?.pozos?.periodo || 'este año'}`,
      isPositive: (dashboardData.stats?.pozos?.nuevos || 0) > 0,
      icon: Droplets,
      color: 'green',
    },
    {
      title: 'Máquinas Pulverizadoras',
      value: dashboardData.stats?.maquinas?.total?.toString() || '0',
      trendLabel: `${dashboardData.stats?.maquinas?.porcentaje || 0}% calibradas`,
      isPositive: (dashboardData.stats?.maquinas?.porcentaje || 0) >= 80,
      icon: Tractor,
      color: 'blue',
    },
    {
      title: 'Servicios Pendientes',
      value: dashboardData.stats?.serviciosPendientes?.total?.toString() || '0',
      trendLabel: `${dashboardData.stats?.serviciosPendientes?.proximos15dias || 0} próximos 15 días`,
      isPositive: false,
      icon: Calendar,
      color: 'amber',
    },
    {
      title: 'Jornadas Realizadas',
      value: dashboardData.stats?.jornadas?.total?.toString() || '0',
      trendLabel: `${dashboardData.stats?.jornadas?.personasCapacitadas || 0} personas capacitadas`,
      isPositive: true,
      icon: GraduationCap,
      color: 'purple',
    },
  ];

  // Datos de gráficos
  const servicesChartData = dashboardData.servicesChart?.data || [];
  const servicesChartTotal = dashboardData.servicesChart?.total || 0;

  const machinesChartData = dashboardData.machinesChart?.data || [];
  const machinesChartTotal = dashboardData.machinesChart?.total || 0;

  // Transformar servicios de calibración
  const calibracionServices = (dashboardData.upcomingServices?.calibracion || []).map(service => ({
    title: service.maquina || service.nombre,
    subtitle: service.tipo || service.descripcion,
    date: service.fecha ? new Date(service.fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : 'Sin fecha',
    status: service.estado || 'Pendiente',
    badge: service.tipoMaquina,
    icon: '🚜',
  }));

  // Transformar otros servicios
  const otrosServices = (dashboardData.upcomingServices?.otros || []).map(service => ({
    title: service.nombre || service.titulo,
    subtitle: service.tipo || service.descripcion,
    date: service.fecha ? new Date(service.fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : 'Sin fecha',
    status: service.estado || 'Pendiente',
    icon: service.categoria === 'analisis' ? '💧' : '🎓',
  }));

  // ==================== RENDER DASHBOARD ====================
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
          {servicesChartData.length > 0 ? (
            <>
              <div className="flex-grow">
                <DonutChart
                  data={servicesChartData}
                  totalValue={servicesChartTotal.toString()}
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
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Sin datos de servicios
            </div>
          )}
        </div>

        {/* Chart 2 - Estado de Máquinas */}
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-card-light dark:bg-card-dark border-2 border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-text-light dark:text-text-dark text-lg font-bold">
            Estado de Máquinas
          </h3>
          {machinesChartData.length > 0 ? (
            <>
              <div className="flex-grow">
                <DonutChart
                  data={machinesChartData}
                  totalValue={machinesChartTotal.toString()}
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
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Sin datos de máquinas
            </div>
          )}
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
            {calibracionServices.length > 0 ? (
              calibracionServices.map((service, idx) => (
                <ServiceItem key={idx} {...service} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No hay servicios de calibración programados
              </div>
            )}
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
            {otrosServices.length > 0 ? (
              otrosServices.map((service, idx) => (
                <ServiceItem key={idx} {...service} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No hay servicios programados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDashboard;