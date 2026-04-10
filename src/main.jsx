import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
/* import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // si querés JS (modals, dropdowns)
 */
import 'bootstrap-icons/font/bootstrap-icons.css';

import { UserProvider } from './context/UserContext.jsx';

/* import './index.css';
 */ import App from './App.jsx';
import './css/style.css';
import './css/newStyle.css';
import './css/clientesStyle.css';
import './css/calibraciones.css';
import './css/login.css';

createRoot(document.getElementById('root')).render(
  <UserProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </UserProvider>,
);
