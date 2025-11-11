import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Users from './components/Users.jsx';
import Maquinas from './components/Maquinas.jsx';
import UserDetalles from './components/UserDetalles.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/user" element={<Users />} />
        <Route path="/maquinas" element={<Maquinas />} />

        <Route path="/userdetalles" element={<UserDetalles />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
