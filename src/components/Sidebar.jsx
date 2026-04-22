import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { logout } from '../api/users';
import { useCliente } from '../context/UserContext';
import Spinner from './Spinner';

const Sidebar = ({ isMobileOpen, closeSidebar }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [showCliente, setShowCliente] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedCliente } = useCliente();

  const user = JSON.parse(localStorage.getItem('user'));

  /* ===================== MENÚ CON ROLES ===================== */

  const basicSelectores = [
    { title: 'Clientes', path: '/cliente', icon: 'bi-person-fill' },
    {
      title: 'Notificaciones',
      path: '/notificaciones',
      icon: 'bi-bell-fill',
    },
    {
      title: 'Configuración',
      icon: 'bi-gear-fill',
      children: [
        {
          title: 'Usuarios',
          path: '/user',
          icon: 'bi-person-fill',
          roles: ['Administrador'], // 🔐 Solo admin
        },
        {
          title: 'Tipos Máquinas',
          path: '/maquinasTipos',
          icon: 'bi-layers-fill',
        },
        {
          title: 'Campañas',
          path: '/campañas',
          icon: 'bi bi-flower1',
          roles: ['Administrador'], // 🔐 Solo admin
        },
      ],
    },
  ];

  /* ===================== FUNCIÓN DE ACCESO ===================== */

  const hasAccess = (item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.rol);
  };

  useEffect(() => {
    console.log('daaaaaaaaa', selectedCliente);
  }, [selectedCliente]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);

    try {
      setLoading(true);
      await logout();
      setMsg('Cerrando Sesión');
      await new Promise((r) => setTimeout(r, 3000));
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('Cliente');
      setLoading(false);
      setMsg('');
      navigate('/login');
    }
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
              className={`sidebar-avatar-cliente ${
                !showCliente ? 'collapsed' : ''
              }`}
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvJRZmA9x_QrC6m3FzsZPI_7ZMm5m8qSwHOhkvJuuyLB-30FaOQYY-mD5kQD35W_c06GThpQNqwxsI3_dDzCUJJqonce3itp432LphqDtLM1ThWn02UkXDOQUSv27AwFspClWTQAf1l4xfUgRE05jy2V7Kg30MpGtd_prZwS2DUSJyNcVglxWifzdJDApieDTCtaDLYoqxpTHnmkUHIcODhMdAj63L1bQwswMq3MoVsntT9TmhngfgABweUXxY_EkIu9UUeEbayVM")',
              }}
            />

            <div className="cliente-info">
              <p className="cliente">{selectedCliente.razon_social}</p>
              <p className="telefono">{selectedCliente.telefono}</p>

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

        {/* ================= MENÚ ================= */}
        <ul className="sidebar-menu">
          {basicSelectores.map((item, index) => {
            if (!hasAccess(item)) return null;

            if (item.children) {
              const filteredChildren = item.children.filter(hasAccess);
              if (!filteredChildren.length) return null;

              return (
                <li key={index}>
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
                      {filteredChildren.map((child, i) => (
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
                </li>
              );
            }

            return (
              <li key={index}>
                <Link
                  to={item.path}
                  className="sidebar-link"
                  onClick={closeSidebar}
                >
                  <i className={`bi ${item.icon} sidebar-icon`} />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-user">
          <div className="sidebar-avatar" />
          <div className="d-flex flex-column">
            <span className="sidebar-username">{user?.email}</span>
            <span className="sidebar-role">{user?.rol}</span>
          </div>
        </div>

        <div className="sidebar-bottom">
          <ul className="sidebar-menu">
            <li>
              <button className="sidebar-link" onClick={handleLogoutClick}>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {showLogoutModal && (
        <div className="modal-overlay-logout" onClick={handleCancelLogout}>
          <div
            className="modal-card-logout"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon-logout">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
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
                {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Spinner msg={msg} loading={loading} />
    </>
  );
};

export default Sidebar;
