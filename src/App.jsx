import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Users from './components/Users.jsx';
import Clientes from './components/Clientes.jsx';
import Maquinas from './components/Maquinas.jsx';

import ClienteDetalles from './components/ClienteDetalle.jsx';
import { Calibraciones } from './components/Calibraciones.jsx';
import { Varios } from './components/Varios.jsx';
import { Login } from './components/Login.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MaquinaTipo from './components/MaquinasTipos.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Dash from './components/Dash.jsx';
import MuestrasPozos from './components/MuestrasPozos.jsx';
import Alertas from './components/Alertas.jsx';
import DashboardUser from './components/DashboardUser.jsx';
import Notifications from './components/Notifications.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLICAS */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* PROTEGIDAS */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Ruta por defecto */}
          {/*  <Route index element={<Dash />} /> */}

          <Route index element={<DashboardUser />} />

          {/* Secciones */}
          <Route path="user" element={<Users />} />
          <Route path="maquinas" element={<Maquinas />} />
          <Route path="varios" element={<Varios />} />
          <Route path="cliente" element={<Clientes />} />
          <Route path="notificaciones" element={<Notifications />} />
          <Route path="campañas" element={<Alertas />} />

          {/* Detalles */}

          <Route
            path="cliente/:cliente_id/detalles"
            element={<ClienteDetalles />}
          >
            <Route
              path="maquinas/:maquina_id/calibraciones"
              element={<Calibraciones />}
            />
            <Route
              path="pozos/:pozos_id/muestras"
              element={<MuestrasPozos />}
            />
          </Route>

          {/* Tipo de Maquinas */}
          <Route path="maquinasTipos" element={<MaquinaTipo />} />

          {/* Página no encontrada (dentro del dashboard) */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* No encontrada afuera */}
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
