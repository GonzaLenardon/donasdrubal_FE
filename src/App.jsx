import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Users from './components/Users.jsx';
import Maquinas from './components/Maquinas.jsx';

import Dashboard from './components/Dashboard.jsx';
import UserDetalles from './components/UserDetalles.jsx';
import { Calibraciones } from './components/Calibraciones.jsx';
import { Varios } from './components/Varios.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout principal */}
        <Route path="/" element={<Dashboard />}>
          {/* Ruta por defecto al entrar a "/" */}
          <Route index element={<Users />} />

          {/* Secciones */}
          <Route path="user" element={<Users />} />
          <Route path="maquinas" element={<Maquinas />} />
          <Route path="user/:id_User/detalles/" element={<UserDetalles />} />
          <Route
            path="user/:id_user/detalles/maquina/:id_maquina/calibraciones"
            element={<Calibraciones />}
          />

          <Route path="user/:id_User/detalles" element={<UserDetalles />} />

          <Route path="varios" element={<Varios />} />

          {/* Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Route>
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
