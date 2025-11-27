import axios from 'axios';
const url = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/api';

const instance = axios.create({
  baseURL: url,
  withCredentials: true, // ✅ Cookies
  timeout: 10000, // ✅ 10 segundos timeout
  headers: {
    'Content-Type': 'application/json', // ✅ JSON
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Solo log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} - ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Token expirado o inválido
    if (error.response?.status === 401) {
      console.log('🔒 Sesión expirada - Redirigiendo...');
      localStorage.clear();
      window.location.href = '/login';
    }

    // Sin conexión
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Sin conexión al servidor');
      // Opcional: mostrar toast/notificación
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ La petición tardó demasiado');
    }

    return Promise.reject(error);
  }
);

export default instance;
export { url };
