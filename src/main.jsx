import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // si querés JS (modals, dropdowns)

/* import './index.css';
 */ import App from './App.jsx';
import Users from './components/Users.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Users />
    {/* <App /> */}
  </StrictMode>
);
