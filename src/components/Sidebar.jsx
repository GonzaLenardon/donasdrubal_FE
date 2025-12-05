import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { logout } from '../api/users';

const Sidebar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const basicSelectores = [
    { title: 'Usuarios', path: '/user', icon: 'bi-person-fill' },
    { title: 'Clientes', path: '/cliente', icon: 'bi-person-fill' },
    { title: 'Máquinas', path: '/maquinas', icon: 'bi-gear-fill' },
    { title: 'Calibraciones', path: '/calibraciones', icon: 'bi-tools' },
    { title: 'Tipos Máquinas', path: '/maquinas_tipos', icon: 'bi-layers-fill' },
  ];

  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-link">
            <span className="material-symbols-outlined sidebar-logo">
              Don Asdrubal
            </span>
          </Link>
          <h2>AgroServicios</h2>
        </div>

        {/* Usuario */}
        <div className="sidebar-user">
          <div
            className="sidebar-avatar"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/...")',
            }}
          />
          <div>
            <p className="sidebar-username">{user?.email}</p>
            <span className="sidebar-role">{user?.rol}</span>
          </div>
        </div>

        {/* Menú */}
        <ul className="sidebar-menu">
          {basicSelectores.map((item, index) => (
            <li key={index}>
              <Link to={item.path} className="sidebar-link">
                <i className={`bi ${item.icon} sidebar-icon`} />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="sidebar-bottom">
          <button className="sidebar-button">Nuevo Servicio</button>

          <ul className="sidebar-menu">
            <li>
              <button
                className="sidebar-link"
                onClick={() => console.log('config')}
              >
                <span className="material-symbols-outlined sidebar-icon">
                  settings
                </span>
                Configuración
              </button>
            </li>

            <li>
              <button className="sidebar-link" onClick={handleLogoutClick}>
                <span className="material-symbols-outlined sidebar-icon">
                  logout
                </span>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* Modal Minimalista y Elegante */}
      {showLogoutModal && (
        <div className="modal-overlay-logout" onClick={handleCancelLogout}>
          <div
            className="modal-card-logout"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon-logout">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>

            <h3 className="modal-title-logout">¿Cerrar sesión?</h3>

            <p className="modal-text-logout">
              Estás a punto de cerrar tu sesión
            </p>

            <div className="modal-buttons-logout">
              <button
                className="btn-logout-cancel"
                onClick={handleCancelLogout}
                disabled={isLoggingOut}
              >
                Cancelar
              </button>
              <button
                className="btn-logout-confirm"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className="spinner-logout"></span>
                    Cerrando...
                  </>
                ) : (
                  'Cerrar sesión'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
