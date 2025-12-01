import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import instance from '../api/axios';

const ProtectedRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    instance
      .get('/auth/verify') // usa la instancia con cookies
      .then(() => {
        setAuth(true);
        console.log('paso x ProtectedRoute');
      })
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) return <h3>Cargando...</h3>;
  return auth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
