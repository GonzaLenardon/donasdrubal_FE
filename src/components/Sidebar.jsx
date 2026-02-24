import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { logout } from '../api/users';
import { useCliente } from '../context/UserContext';

const Sidebar = ({ isMobileOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [showCliente, setShowCliente] = useState(false);
  const { selectedCliente } = useCliente();

  const basicSelectores = [
    { title: 'Clientes', path: '/cliente', icon: 'bi-person-fill' },
    {
      title: 'Configuración',
      icon: 'bi-gear-fill',
      children: [
        { title: 'Usuarios', path: '/user', icon: 'bi-person-fill' },
        {
          title: 'Tipos Máquinas',
          path: '/maquinasTipos',
          icon: 'bi-layers-fill',
        },

        { title: 'Campañas', path: '/campañas', icon: 'bi bi-flower1' },
      ],
    },
    // { title: 'Máquinas', path: '/maquinas', icon: 'bi-gear-fill' },
    // { title: 'Calibraciones', path: '/calibraciones', icon: 'bi-tools' },
  ];

  useEffect(() => {
    console.log('daaaaaaaaa', selectedCliente);
  }, [selectedCliente]);

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
    localStorage.removeItem('Cliente');

    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-link" onClick={closeSidebar}>
            <span className="material-symbols-outlined sidebar-logo">
              Don Asdrúbal
            </span>
          </Link>
          <h2>AgroServicios</h2>
        </div>

        {/* Cliente */}

        {selectedCliente && (
          <div className={`sidebar-cliente ${!showCliente ? 'collapsed' : ''}`}>
            <p
              className="btn-sidebar"
              onClick={() => setShowCliente(!showCliente)}
            >
              {showCliente ? (
                <i className="bi bi-chevron-double-up"></i>
              ) : (
                <i className="bi bi-chevron-double-down"></i>
              )}
            </p>

            <div
              className={`sidebar-avatar-cliente ${!showCliente ? 'collapsed' : ''}`}
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvJRZmA9x_QrC6m3FzsZPI_7ZMm5m8qSwHOhkvJuuyLB-30FaOQYY-mD5kQD35W_c06GThpQNqwxsI3_dDzCUJJqonce3itp432LphqDtLM1ThWn02UkXDOQUSv27AwFspClWTQAf1l4xfUgRE05jy2V7Kg30MpGtd_prZwS2DUSJyNcVglxWifzdJDApieDTCtaDLYoqxpTHnmkUHIcODhMdAj63L1bQwswMq3MoVsntT9TmhngfgABweUXxY_EkIu9UUeEbayVM")',
              }}
            />

            <div className="cliente-info">
              <p className="cliente">{selectedCliente.razon_social}</p>

              {/* TELEFONO SIEMPRE VISIBLE */}
              <p className="telefono">{selectedCliente.telefono}</p>

              {/* ESTOS SOLO CUANDO ESTA EXPANDIDO */}
              {showCliente && (
                <>
                  <p className="domicilio">
                    {selectedCliente.direccion}, {selectedCliente.ciudad}
                  </p>
                  <p className="cuit">CUIT: {selectedCliente.cuil_cuit}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Menú */}
        <ul className="sidebar-menu">
          {basicSelectores.map((item, index) => (
            <li key={index}>
              {/* Ítem con submenú */}
              {item.children ? (
                <>
                  <button
                    className="sidebar-link sidebar-link-parent"
                    onClick={() => setOpenConfig(!openConfig)}
                  >
                    <i className={`bi ${item.icon} sidebar-icon`} />
                    {item.title}
                    <i
                      className={`bi bi-chevron-${
                        openConfig ? 'down' : 'right'
                      } sidebar-arrow`}
                    />
                  </button>

                  {openConfig && (
                    <ul className="sidebar-submenu">
                      {item.children.map((child, i) => (
                        <li key={i}>
                          <Link
                            to={child.path}
                            className="sidebar-link sidebar-sublink"
                            onClick={closeSidebar}
                          >
                            <i className={`bi ${child.icon} sidebar-icon`} />
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                /* Ítem normal */
                <Link
                  to={item.path}
                  className="sidebar-link"
                  onClick={closeSidebar}
                >
                  <i className={`bi ${item.icon} sidebar-icon`} />
                  {item.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="sidebar-user">
          <div
            className="sidebar-avatar"
            /*   style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/...")',
            }} */
          />
          <div>
            <p className="sidebar-username">{user?.email}</p>
            <span className="sidebar-role">{user?.rol}</span>
          </div>
        </div>
        {/* Footer */}
        <div className="sidebar-bottom">
          {/* <button className="sidebar-button">Nuevo Servicio</button> */}

          <ul className="sidebar-menu">
            <li>
              {/* <button
                className="sidebar-link"
                onClick={() => console.log('config')}
              >
                <span className="material-symbols-outlined sidebar-icon">
                  settings
                </span>
                Configuración
              </button> */}
            </li>

            <li>
              <button className="sidebar-link" onClick={handleLogoutClick}>
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
