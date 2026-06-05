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
  RefreshCw,
} from 'lucide-react';

// Importar funciones API
import {
  getClienteStats,
  // getClienteServicesChart,
  getClienteMachinesChart,
  getClienteJornadasChart,
  getClienteCalibracionesChart,
  getClienteAnalisisChart,
  getClienteUpcomingServices,
  getClienteNotas,
} from '../api/clientes.js';
// import {
//   // getClienteStats,
//   // getClienteServicesChart,
//   // getClienteCalibracionesChart,
//   getClienteUpcomingServices,
// } from '../api/clientes_moks.js';

// ==================== STATS CARD ====================
const StatCard = ({ title, value, trendLabel, isPositive, icon: Icon, color }) => {
  const iconColors = {
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div
      className="
        flex items-center gap-3
        rounded-lg
        px-3 py-2
        bg-card-light dark:bg-card-dark
        border border-border-light dark:border-border-dark
        shadow-sm
        hover:shadow-md
        transition-all
      "
    >
      {/* ICONO */}
      <div
        className={`
          w-10 h-10
          rounded-xl
          flex items-center justify-center
          flex-shrink-0
          ${iconColors[color]}
        `}
      >
        <Icon size={22} />
      </div>

      {/* CONTENIDO */}
      <div className="flex flex-col justify-center min-w-0 flex-1">

        {/* TITULO + VALOR */}
        <div className="flex items-baseline gap-2 leading-none">
          <p className="text-xs text-gray-500 truncate">
            {title}
          </p>

          <p className="text-2xl font-bold text-text-light dark:text-text-dark">
            {value}
          </p>
        </div>

        {/* TREND */}
        <p
          className={`mt-0.5 text-xs flex items-center gap-2 leading-none ${isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
            }`}
        >
          {isPositive
            ? <TrendingUp size={11} />
            : <TrendingDown size={11} />
          }

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

// ==================== ERROR CARD (para secciones individuales) ====================
const ErrorCard = ({ title, error, onRetry, icon: Icon }) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="text-red-600 dark:text-red-400" size={24} />}
        <h3 className="text-red-800 dark:text-red-300 font-bold text-lg">
          {title}
        </h3>
      </div>

      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">
            {error || 'No se pudo cargar la información'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <RefreshCw size={16} />
              Reintentar
            </button>
          )}
        </div>
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
const NotaItem = ({ fecha, comentario }) => {
  return (
    <div className="
      p-3
      rounded-lg
      bg-card-light dark:bg-card-dark
      border border-border-light dark:border-border-dark
      shadow-sm
    ">
      <div className="text-xs text-gray-500 mb-2">
        {new Date(fecha).toLocaleDateString('es-AR')}
      </div>

      <p className="text-sm text-text-light dark:text-text-dark whitespace-pre-wrap">
        {comentario}
      </p>
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================
const ClienteDashboard = ({ cliente }) => {
  // Estados separados para cada sección
  const [loading, setLoading] = useState({
    stats: true,
    servicesChart: true,
    calibracionChart: true,
    analisisChart: true,
    jornadasChart: true,
    machinesChart: true,
    upcomingServices: true,
    notas: true,
  });

  const [errors, setErrors] = useState({
    stats: null,
    servicesChart: null,
    calibracionChart: null,
    analisisChart: null,
    jornadasChart: null,
    machinesChart: null,
    upcomingServices: null,
    notas: null,
  });

  const [data, setData] = useState({
    stats: null,
    servicesChart: null,
    calibracionChart: null,
    calibracionChart: null,
    analisisChart: null,
    jornadasChart: null,
    machinesChart: null,
    upcomingServices: null,
    notas: [],
  });

  // ==================== FETCH INDIVIDUAL CON MANEJO DE ERRORES ====================

  const fetchStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setErrors(prev => ({ ...prev, stats: null }));

      const stats = await getClienteStats(cliente.id);
      setData(prev => ({ ...prev, stats }));
    } catch (err) {
      console.error('Error fetching stats:', err);
      setErrors(prev => ({ ...prev, stats: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // const fetchServicesChart = async () => {
  //   try {
  //     setLoading(prev => ({ ...prev, servicesChart: true }));
  //     setErrors(prev => ({ ...prev, servicesChart: null }));

  //     const servicesChart = await getClienteServicesChart(cliente.id);
  //     setData(prev => ({ ...prev, servicesChart }));
  //   } catch (err) {
  //     console.error('Error fetching services chart:', err);
  //     setErrors(prev => ({ ...prev, servicesChart: err.message }));
  //   } finally {
  //     setLoading(prev => ({ ...prev, servicesChart: false }));
  //   }
  // };


  const fetchAnalisisChart = async () => {
    try {
      setLoading(p => ({ ...p, analisisChart: true }));
      setErrors(p => ({ ...p, analisisChart: null }));

      const res = await getClienteAnalisisChart(cliente.id);
      setData(p => ({ ...p, analisisChart: res }));
    } catch (err) {
      setErrors(p => ({ ...p, analisisChart: err.message }));
    } finally {
      setLoading(p => ({ ...p, analisisChart: false }));
    }
  };

  const fetchCalibracionChart = async () => {
    try {
      setLoading(prev => ({ ...prev, calibracionChart: true }));
      setErrors(prev => ({ ...prev, calibracionChart: null }));

      const calibracionChart = await getClienteCalibracionesChart(cliente.id);
      setData(prev => ({ ...prev, calibracionChart }));
    } catch (err) {
      console.error('Error fetching calibracion chart:', err);
      setErrors(prev => ({ ...prev, calibracionChart: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, calibracionChart: false }));
    }
  };

  const fetchJornadasChart = async () => {
    try {
      setLoading(p => ({ ...p, jornadasChart: true }));
      setErrors(p => ({ ...p, jornadasChart: null }));

      const res = await getClienteJornadasChart(cliente.id);
      setData(p => ({ ...p, jornadasChart: res }));
    } catch (err) {
      setErrors(p => ({ ...p, jornadasChart: err.message }));
    } finally {
      setLoading(p => ({ ...p, jornadasChart: false }));
    }
  };
  //   const fetchMachinesChart = async () => {
  //   try {
  //     setLoading(p => ({ ...p, machinesChart: true }));
  //     setErrors(p => ({ ...p, machinesChart: null }));

  //     const res = await getClienteMachinesChart(cliente.id);
  //     setData(p => ({ ...p, machinesChart: res }));
  //   } catch (err) {
  //     setErrors(p => ({ ...p, machinesChart: err.message }));
  //   } finally {
  //     setLoading(p => ({ ...p, machinesChart: false }));
  //   }
  // };


  const fetchUpcomingServices = async () => {
    try {
      setLoading(prev => ({ ...prev, upcomingServices: true }));
      setErrors(prev => ({ ...prev, upcomingServices: null }));

      const upcomingServices = await getClienteUpcomingServices(cliente.id);
      setData(prev => ({ ...prev, upcomingServices }));
    } catch (err) {
      console.error('Error fetching upcoming services:', err);
      setErrors(prev => ({ ...prev, upcomingServices: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, upcomingServices: false }));
    }
  };
  const fetchNotas = async () => {
    try {
      setLoading(prev => ({
        ...prev,
        notas: true,
      }));

      setErrors(prev => ({
        ...prev,
        notas: null,
      }));

      const notas = await getClienteNotas(cliente.id);

      setData(prev => ({
        ...prev,
        notas,
      }));
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        notas: err.message,
      }));
    } finally {
      setLoading(prev => ({
        ...prev,
        notas: false,
      }));
    }
  };
  // Cargar todas las secciones de forma independiente
  const fetchAllData = () => {
    fetchStats();
    // fetchServicesChart();
    fetchAnalisisChart();
    fetchCalibracionChart();
    fetchJornadasChart();
    // fetchMachinesChart();    
    fetchUpcomingServices();
    fetchNotas();
  };

  useEffect(() => {
    if (cliente?.id) {
      fetchAllData();
    }
  }, [cliente?.id]);

  // ==================== TRANSFORM DATA ====================

  // Stats Cards
  const statsData = data.stats ? [
    {
      title: 'Pozos Registrados',
      value: data.stats?.pozos?.total?.toString() || '0',
      trendLabel: `${data.stats?.pozos?.nuevos || 0} nuevos ${data.stats?.pozos?.periodo || 'este año'}`,
      isPositive: (data.stats?.pozos?.nuevos || 0) > 0,
      icon: Droplets,
      color: 'green',
    },
    {
      title: 'Máquinas Pulverizadoras',
      value: data.stats?.maquinas?.total?.toString() || '0',
      trendLabel: `${data.stats?.maquinas?.porcentaje || 0}% calibradas`,
      isPositive: (data.stats?.maquinas?.porcentaje || 0) >= 80,
      icon: Tractor,
      color: 'blue',
    },
    {
      title: 'Jornadas Realizadas',
      value: data.stats?.jornadas?.total?.toString() || '0',
      trendLabel: `${data.stats?.jornadas?.nuevos || 0} nuevos ${data.stats?.jornadas?.periodo || 'este año'}`,
      isPositive: (data.stats?.jornadas?.nuevos || 0) > 0,
      icon: GraduationCap,
      color: 'purple',
    },
    {
      title: 'Servicios Pendientes',
      value: data.stats?.serviciosPendientes?.total?.toString() || '0',
      trendLabel: `${data.stats?.serviciosPendientes?.proximos15dias || 0} próximos 15 días`,
      isPositive: false,
      icon: Calendar,
      color: 'amber',
    },
  ] : [];

  const servicesChartData = data.servicesChart?.data || [];
  const servicesChartTotal = data.servicesChart?.total || 0;

  const analisisChartData = data.analisisChart?.data || [];
  const analisisChartTotal = data.analisisChart?.total || 0;

  const calibracionChartData = data.calibracionChart?.data || [];
  const calibracionChartTotal = data.calibracionChart?.total || 0;

  const jornadasChartData = data.jornadasChart?.data || [];
  const jornadasChartTotal = data.jornadasChart?.total || 0;

  const calibracionServices = (data.upcomingServices?.calibracion || []).map(service => ({
    title: service.title || 'Sin definir',
    subtitle: service.subtitle || 'Sin descripción',
    date: service.date ? new Date(service.date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : 'Sin fecha',
    status: service.status || 'Pendiente',
    icon: service.icon == 'calibracion' ? '🔧' : '🚜',
  }));

  const muestrasServices = (data.upcomingServices?.muestras_agua || []).map(service => ({
    title: service.title || 'Sin definir',
    subtitle: service.subtitle || 'Sin descripción',
    date: service.date ? new Date(service.date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : 'Sin fecha',
    status: service.status || 'Pendiente',
    icon: service.icon === 'analisis' ? '💧' : '🎓',
  }));

  const jornadasServices = (data.upcomingServices?.jornadas || []).map(service => ({
    title: service.title || 'Sin definir',
    subtitle: service.subtitle || 'Sin descripción',
    date: service.date ? new Date(service.date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }) : 'Sin fecha',
    status: service.status || 'Pendiente',
    icon: service.icon === 'jornadas' ? '💧' : '🎓',
  }));
  const otrosServices = [...muestrasServices, ...jornadasServices].sort((a, b) => new Date(a.date) - new Date(b.date));
  const pendingServices = [
    ...calibracionServices,
    ...muestrasServices,
    ...jornadasServices,
  ].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
  // ==================== RENDER DASHBOARD ====================
  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* ==================== STATS ROW ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading.stats ? (
          // Skeleton mientras carga
          <>
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </>
        ) : errors.stats ? (
          // Error en toda la sección de stats
          <div className="col-span-full">
            <ErrorCard
              title="Estadísticas"
              error={errors.stats}
              onRetry={fetchStats}
              icon={AlertCircle}
            />
          </div>
        ) : (
          // Datos cargados correctamente
          statsData.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col gap-4">

          {/* ================= CHARTS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* CHART 1 */}
            <div className="flex flex-col gap-2 rounded-lg p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">

              <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">
                Analisis de Agua
              </h3>

              <div className="flex-grow">
                <DonutChart
                  data={analisisChartData}
                  totalValue={analisisChartTotal.toString()}
                // totalLabel="Total"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {analisisChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>

                    <span>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART 2 */}
            <div className="flex flex-col gap-2 rounded-lg p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">

              <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">
                Calibraciones
              </h3>

              <div className="flex-grow">
                <DonutChart
                  data={calibracionChartData}
                  totalValue={calibracionChartTotal.toString()}
                // totalLabel="Calibraciones"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {calibracionChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>

                    <span>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CHART 3 */}
            <div className="flex flex-col gap-2 rounded-lg p-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">

              <h3 className="text-sm font-semibold text-text-light dark:text-text-dark">
                Jornadas
              </h3>

              <div className="flex-grow">
                <DonutChart
                  data={jornadasChartData}
                  totalValue={jornadasChartTotal.toString()}
                // totalLabel="Jornadas"
                />
              </div>

              <div className="flex flex-wrap justify-center gap-2 text-xs">
                {jornadasChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></span>

                    <span>
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="flex flex-col gap-6">

          {/* ================= SERVICIOS CALIBRACION ================= */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="text-[#4a7c1f]" size={20} />

              <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
                Servicios Pendientes
              </h2>
            </div>

            {loading.upcomingServices ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <ServiceItemSkeleton key={i} />
                ))}
              </div>

            ) : errors.upcomingServices ? (

              <ErrorCard
                title=""
                error={errors.upcomingServices}
                onRetry={fetchUpcomingServices}
              />

            ) : calibracionServices.length > 0 ? (

              <div className="flex flex-col gap-3">
                {pendingServices.map((service, idx) => (
                  <ServiceItem key={idx} {...service} />
                ))}
              </div>

            ) : (

              <div className="text-center py-6 text-sm text-gray-400 bg-card-light dark:bg-card-dark rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                No hay servicios de calibración programados
              </div>
            )}
          </div>

          {/* ================= OTROS SERVICIOS ================= */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Droplets className="text-[#4a7c1f]" size={20} />

              <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
                ANotas del Cliente
              </h2>
            </div>

            {loading.notas ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <ServiceItemSkeleton key={i} />
                ))}
              </div>

            ) : errors.notas ? (

              <ErrorCard
                title=""
                error={errors.notas}
                onRetry={fetchNotas}
              />

            ) : data.notas?.length > 0 ? (

              <div className="flex flex-col gap-3">
                {data.notas.map((nota) => (
                  <NotaItem
                    key={nota.id}
                    fecha={nota.fecha}
                    comentario={nota.comentario}
                  />
                ))}
              </div>

            ) : (

              <div className="
    text-center
    py-6
    text-sm
    text-gray-400
    bg-card-light
    dark:bg-card-dark
    rounded-lg
    border
    border-dashed
    border-gray-300
    dark:border-gray-600
  ">
                No hay notas registradas
              </div>

            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ClienteDashboard;