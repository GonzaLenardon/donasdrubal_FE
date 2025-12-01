import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Verificar si existe token en las cookies
  const hasToken = document.cookie.includes('Token=');

  // Si no hay token, redirigir al login
  if (!hasToken) {
    console.log('❌ No hay token - Redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Si hay token, mostrar el contenido
  return children;
};

export default ProtectedRoute;
