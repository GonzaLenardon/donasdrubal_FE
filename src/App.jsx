import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Users from './components/Users.jsx';
import Clientes from './components/Clientes.jsx';
import Maquinas from './components/Maquinas.jsx';

import Dashboard from './components/Dashboard.jsx';
import UserDetalles from './components/UserDetalles.jsx';
import ClienteDetalles from './components/ClienteDetalle.jsx';
import { Calibraciones } from './components/Calibraciones.jsx';
import { Varios } from './components/Varios.jsx';
import { Login } from './components/Login.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================
            RUTAS PÚBLICAS (sin autenticación)
            ============================================ */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* ============================================
            RUTAS PROTEGIDAS (requieren autenticación)
            ============================================ */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Ruta por defecto */}
          <Route index element={<Users />} />

          {/* Secciones */}
          <Route path="user" element={<Users />} />
          <Route path="maquinas" element={<Maquinas />} />
          <Route path="varios" element={<Varios />} />
          <Route path="cliente" element={<Clientes />} />

          {/* Detalles */}
          <Route
            path="cliente/:cliente_id/detalles"
            element={<UserDetalles />}
          />
          <Route
            path="cliente/:id_cliente/detalles"
            element={<ClienteDetalles />}
          />

          {/* Calibraciones */}
          <Route
            path="cliente/:cliente_id/detalles/maquinas/:maquina_id/calibraciones"
            element={<Calibraciones />}
          />

          {/* Página no encontrada (dentro del dashboard) */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Página no encontrada */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// 🔥 Definimos el componente NotFound directamente aquí (opcional)
function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>404 - Página no encontrada</h2>
      <p>La página que estás buscando no existe.</p>
    </div>
  );
}
