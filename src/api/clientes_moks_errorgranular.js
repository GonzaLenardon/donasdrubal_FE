// ============================================
// API MOCK - CON SOPORTE PARA ERRORES PARCIALES
// src/api/clientesMock.js
// ============================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== MODO DE PRUEBA ====================
// Cambia estos valores para simular diferentes escenarios de error

const MODO_PRUEBA = {
  stats: 'success',           // 'success' | 'error' | 'slow'
  servicesChart: 'success',   // 'success' | 'error' | 'slow'
  machinesChart: 'slow',   // 'success' | 'error' | 'slow'
  upcomingServices: 'success' // 'success' | 'error' | 'slow'
};

// ==================== CONFIGURACIÓN DE DELAYS ====================
const DELAYS = {
  normal: 800,
  slow: 3000,
};

// ==================== GET CLIENTE STATS ====================
export const getClienteStats = async (clienteId) => {
  const mode = MODO_PRUEBA.stats;
  
  // Simular delay
  await delay(mode === 'slow' ? DELAYS.slow : DELAYS.normal);
  
  console.log('📊 Obteniendo stats para cliente:', clienteId);
  
  // Simular error si está configurado
  if (mode === 'error') {
    throw new Error('Error al obtener estadísticas del servidor');
  }
  
  return {
    pozos: {
      total: 8,
      nuevos: 2,
      periodo: 'este año'
    },
    maquinas: {
      total: 5,
      calibradas: 5,
      porcentaje: 100
    },
    serviciosPendientes: {
      total: 3,
      proximos15dias: 2
    },
    jornadas: {
      total: 12,
      personasCapacitadas: 45
    }
  };
};

// ==================== GET SERVICES CHART ====================
export const getClienteServicesChart = async (clienteId) => {
  const mode = MODO_PRUEBA.servicesChart;
  
  await delay(mode === 'slow' ? DELAYS.slow : DELAYS.normal);
  
  console.log('📈 Obteniendo gráfico de servicios para cliente:', clienteId);
  
  if (mode === 'error') {
    throw new Error('No se pudo cargar el gráfico de servicios');
  }
  
  return {
    data: [
      { name: 'Calibración', value: 8, color: '#3b82f6' },
      { name: 'Análisis Agua', value: 6, color: '#f59e0b' },
      { name: 'Capacitación', value: 4, color: '#10b981' }
    ],
    total: 18
  };
};

// ==================== GET MACHINES CHART ====================
export const getClienteMachinesChart = async (clienteId) => {
  const mode = MODO_PRUEBA.machinesChart;
  
  await delay(mode === 'slow' ? DELAYS.slow : DELAYS.normal);
  
  console.log('🚜 Obteniendo gráfico de máquinas para cliente:', clienteId);
  
  if (mode === 'error') {
    throw new Error('Error de conexión al obtener datos de máquinas');
  }
  
  return {
    data: [
      { name: 'Al día', value: 4, color: '#10b981' },
      { name: 'Próximo', value: 1, color: '#f59e0b' },
      { name: 'Vencido', value: 0, color: '#ef4444' }
    ],
    total: 5
  };
};

// ==================== GET UPCOMING SERVICES ====================
export const getClienteUpcomingServices = async (clienteId) => {
  const mode = MODO_PRUEBA.upcomingServices;
  
  await delay(mode === 'slow' ? DELAYS.slow : DELAYS.normal);
  
  console.log('📅 Obteniendo servicios próximos para cliente:', clienteId);
  
  if (mode === 'error') {
    throw new Error('Tiempo de espera agotado al obtener servicios');
  }
  
  return {
    calibracion: [
      {
        id: 1,
        maquina: 'Pulverizadora Jacto PJ-600',
        tipo: 'Calibración anual programada',
        fecha: '2024-07-25',
        estado: 'Confirmado',
        tipoMaquina: 'Autopropulsada'
      },
      {
        id: 2,
        maquina: 'Pulverizadora Montana X-12',
        tipo: 'Recalibración por cambio de picos',
        fecha: '2024-08-02',
        estado: 'Pendiente',
        tipoMaquina: 'Arrastre'
      },
      {
        id: 3,
        maquina: 'Equipo de Mochila Stihl',
        tipo: 'Calibración de presión',
        fecha: '2024-06-15',
        estado: 'Realizado',
        tipoMaquina: 'Mochila'
      }
    ],
    otros: [
      {
        id: 4,
        nombre: 'Pozo Norte - Lote 42',
        tipo: 'Análisis fisicoquímico completo',
        fecha: '2024-07-28',
        estado: 'Confirmado',
        categoria: 'analisis'
      },
      {
        id: 5,
        nombre: 'Jornada: Aplicación Eficiente',
        tipo: 'Capacitación de 8 operarios',
        fecha: '2024-08-05',
        estado: 'Pendiente',
        categoria: 'capacitacion'
      },
      {
        id: 6,
        nombre: 'Pozo Sur - Lote 18',
        tipo: 'Análisis de pH y dureza',
        fecha: '2024-06-10',
        estado: 'Realizado',
        categoria: 'analisis'
      }
    ]
  };
};

// ==================== ESCENARIOS DE PRUEBA PREDEFINIDOS ====================

/*
PARA PROBAR DIFERENTES ESCENARIOS, CAMBIA EL OBJETO MODO_PRUEBA ARRIBA:

// ========== Escenario 1: TODO FUNCIONA ==========
const MODO_PRUEBA = {
  stats: 'success',
  servicesChart: 'success',
  machinesChart: 'success',
  upcomingServices: 'success'
};

// ========== Escenario 2: SOLO STATS FALLA ==========
const MODO_PRUEBA = {
  stats: 'error',              // ❌ Falla
  servicesChart: 'success',     // ✅ Funciona
  machinesChart: 'success',     // ✅ Funciona
  upcomingServices: 'success'   // ✅ Funciona
};

// ========== Escenario 3: GRÁFICOS FALLAN ==========
const MODO_PRUEBA = {
  stats: 'success',             // ✅ Funciona
  servicesChart: 'error',       // ❌ Falla
  machinesChart: 'error',       // ❌ Falla
  upcomingServices: 'success'   // ✅ Funciona
};

// ========== Escenario 4: SOLO SERVICIOS FUNCIONA ==========
const MODO_PRUEBA = {
  stats: 'error',               // ❌ Falla
  servicesChart: 'error',       // ❌ Falla
  machinesChart: 'error',       // ❌ Falla
  upcomingServices: 'success'   // ✅ Funciona
};

// ========== Escenario 5: TODO FALLA ==========
const MODO_PRUEBA = {
  stats: 'error',
  servicesChart: 'error',
  machinesChart: 'error',
  upcomingServices: 'error'
};

// ========== Escenario 6: ALGUNOS LENTOS ==========
const MODO_PRUEBA = {
  stats: 'slow',                // 🐌 Tarda 3 segundos
  servicesChart: 'success',
  machinesChart: 'success',
  upcomingServices: 'slow'      // 🐌 Tarda 3 segundos
};

// ========== Escenario 7: MIXTO ==========
const MODO_PRUEBA = {
  stats: 'success',
  servicesChart: 'error',       // ❌ Falla
  machinesChart: 'slow',        // 🐌 Lento
  upcomingServices: 'success'
};
*/

export default {
  getClienteStats,
  getClienteServicesChart,
  getClienteMachinesChart,
  getClienteUpcomingServices,
};