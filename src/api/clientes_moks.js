// ============================================
// API MOCK - DATOS DE PRUEBA HARDCODEADOS
// src/api/clientesMock.js
// ============================================

/*
Este archivo contiene funciones mock que devuelven datos hardcodeados
para probar el ClienteDashboard sin necesidad de tener el backend funcionando.

USO:
1. Importa estas funciones en ClienteDashboard.jsx
2. Reemplaza las llamadas reales a la API con estas funciones mock
3. Una vez que tu backend esté listo, cambia los imports por las funciones reales
*/

// Simular delay de red (opcional, para hacer más realista)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== GET CLIENTE STATS ====================
export const getClienteStats = async (clienteId) => {
  // Simular delay de red (opcional)
  await delay(800);
  
  console.log('📊 Obteniendo stats para cliente:', clienteId);
  
  return {
    pozos: {
      total: 8,
      nuevos: 4,
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
  await delay(600);
  
  console.log('📈 Obteniendo gráfico de servicios para cliente:', clienteId);
  
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
  await delay(700);
  
  console.log('🚜 Obteniendo gráfico de máquinas para cliente:', clienteId);
  
  return {
    data: [
      { name: 'Al día', value: 4, color: '#10b981' },
      { name: 'Próximo', value: 1, color: '#f59e0b' },
      { name: 'Vencido', value: 0, color: '#ef4444' }
    ],
    total: 5
  };
};

// ==================== GET ANALISIS AGUA CHART ====================
export const getClienteAnalisisChart = async (clienteId) => {
  await delay(700);
  
  console.log('🚜 Obteniendo gráfico de análisis de agua para cliente:', clienteId);
  
  return {
    data: [
      { name: 'Realizadas', value: 1, color: '#10b981' },
      { name: 'En Proceso', value: 0, color: '#f59e0b' },
      { name: 'Pendientes', value: 3, color: '#ef4444' }
    ],
    total: 3
  };
};


// ==================== GET CALIBRATION CHART ====================
export const getClienteCalibracionesChart = async (clienteId) => {
  await delay(700);
  
  console.log('🚜 Obteniendo gráfico de calibración para cliente:', clienteId);
  
  return {
    data: [
      { name: 'Realizadas', value: 4, color: '#10b981' },
      { name: 'En Proceso', value: 1, color: '#f59e0b' },
      { name: 'Pendientes', value: 1, color: '#ef4444' }
    ],
    total: 6
  };
};


// ==================== GET JORNADAS CHART ====================
export const getClienteJornadasChart = async (clienteId) => {
  await delay(700);
  
  console.log('🚜 Obteniendo gráfico de jornadas para cliente:', clienteId);
  
  return {
    data: [
      { name: 'Realizadas', value: 4, color: '#10b981' },
      { name: 'En Proceso', value: 1, color: '#f59e0b' },
      { name: 'Pendientes', value: 1, color: '#ef4444' }
    ],
    total: 6
  };
};

// ==================== GET UPCOMING SERVICES ====================
export const getClienteUpcomingServices = async (clienteId) => {
  await delay(900);
  
  console.log('📅 Obteniendo servicios próximos para cliente:', clienteId);
  
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

// ==================== DATOS ALTERNATIVOS (para diferentes escenarios) ====================

// Escenario con MUCHOS datos
export const getClienteStatsHighVolume = async (clienteId) => {
  await delay(800);
  
  return {
    pozos: {
      total: 24,
      nuevos: 8,
      periodo: 'este año'
    },
    maquinas: {
      total: 18,
      calibradas: 15,
      porcentaje: 83
    },
    serviciosPendientes: {
      total: 12,
      proximos15dias: 7
    },
    jornadas: {
      total: 35,
      personasCapacitadas: 156
    }
  };
};

// Escenario con POCOS datos (cliente nuevo)
export const getClienteStatsLowVolume = async (clienteId) => {
  await delay(800);
  
  return {
    pozos: {
      total: 2,
      nuevos: 2,
      periodo: 'este mes'
    },
    maquinas: {
      total: 1,
      calibradas: 1,
      porcentaje: 100
    },
    serviciosPendientes: {
      total: 1,
      proximos15dias: 1
    },
    jornadas: {
      total: 0,
      personasCapacitadas: 0
    }
  };
};

// Escenario con ALERTAS (cliente con problemas)
export const getClienteStatsWithAlerts = async (clienteId) => {
  await delay(800);
  
  return {
    pozos: {
      total: 10,
      nuevos: 0,
      periodo: 'este año'
    },
    maquinas: {
      total: 8,
      calibradas: 3,
      porcentaje: 38
    },
    serviciosPendientes: {
      total: 15,
      proximos15dias: 12
    },
    jornadas: {
      total: 5,
      personasCapacitadas: 18
    }
  };
};

// Escenario SIN datos
export const getClienteStatsEmpty = async (clienteId) => {
  await delay(800);
  
  return {
    pozos: {
      total: 0,
      nuevos: 0,
      periodo: 'este año'
    },
    maquinas: {
      total: 0,
      calibradas: 0,
      porcentaje: 0
    },
    serviciosPendientes: {
      total: 0,
      proximos15dias: 0
    },
    jornadas: {
      total: 0,
      personasCapacitadas: 0
    }
  };
};

// Servicios vacíos
export const getClienteUpcomingServicesEmpty = async (clienteId) => {
  await delay(900);
  
  return {
    calibracion: [],
    otros: []
  };
};

// ==================== SIMULAR ERRORES ====================

// Simular error de red
export const getClienteStatsError = async (clienteId) => {
  await delay(1000);
  throw new Error('No se pudo conectar con el servidor');
};

// Simular error 404
export const getClienteStatsNotFound = async (clienteId) => {
  await delay(1000);
  throw new Error('Cliente no encontrado');
};

// Simular error 500
export const getClienteStatsServerError = async (clienteId) => {
  await delay(1000);
  throw new Error('Error interno del servidor');
};

// ==================== EXPORTACIÓN POR DEFECTO ====================

// Exporta un objeto con todas las funciones mock
export default {
  // Funciones principales
  getClienteStats,
  getClienteServicesChart,
  getClienteMachinesChart,
  getClienteUpcomingServices,
  
  // Escenarios alternativos
  getClienteStatsHighVolume,
  getClienteStatsLowVolume,
  getClienteStatsWithAlerts,
  getClienteStatsEmpty,
  getClienteUpcomingServicesEmpty,
  
  // Escenarios de error
  getClienteStatsError,
  getClienteStatsNotFound,
  getClienteStatsServerError,
};