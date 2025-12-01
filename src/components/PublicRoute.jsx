import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  // Verificar si ya hay token
  const hasToken = document.cookie.includes('Token=');

  // Si ya está autenticado, redirigir al dashboard
  if (hasToken) {
    console.log('✅ Ya tiene token - Redirigiendo a dashboard');
    return <Navigate to="/" replace />;
  }

  // Si no está autenticado, mostrar el login
  return children;
};

export default PublicRoute;
