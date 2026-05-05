import axios from 'axios';
const url = import.meta.env.VITE_API_URL || 'https://apis.donasdrubal.com.ar';

const instance = axios.create({
  baseURL: url,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Estado global para el spinner
let isShowingSessionExpired = false;

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
/* instance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.status} - ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Token expirado o inválido
    if (error.response?.status === 401 && !isShowingSessionExpired) {
      isShowingSessionExpired = true;
      console.log('🔒 Sesión expirada - Redirigiendo...', error.response);

      // Crear y mostrar spinner
      const spinnerOverlay = document.createElement('div');
      spinnerOverlay.id = 'session-expired-spinner';
      spinnerOverlay.innerHTML = `
  <div 
    class="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column 
           justify-content-center align-items-center"
    style="background-color: rgba(0,0,0,.9); z-index:9999;"
  >
    <div 
      class="spinner-border text-success"
      role="status"
      style="width:3rem; height:3rem;"
    ></div>

    <span class="text-success fs-3 fw-bold mt-3">
      Datos incorrectos MMMMMM
    </span>
  </div>
`;

      document.body.appendChild(spinnerOverlay);

      // Esperar 4 segundos y redirigir

      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 4000);
    }

    // Sin conexión
    if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Sin conexión al servidor');
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ La petición tardó demasiado');
    }

    return Promise.reject(error);
  },
); */

instance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} - ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config.url.includes('/login');

    // SOLO sesión expirada global
    if (status === 401 && !isLoginRequest) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default instance;
export { url };
