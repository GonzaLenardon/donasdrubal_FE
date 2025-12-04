import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [openConfig, setOpenConfig] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Diccionario para mostrar nombres legibles en el breadcrumb
  const breadcrumbNames = {
    user: 'Usuarios',
    maquinas: 'Máquinas',
    maquinas_tipos: 'Tipos de Máquinas',
    calibraciones: 'Calibraciones',
    detalles: 'Detalles',
    clientes: 'Clientes',
    reportes: 'Reportes',
  };

  const basicSelectores = [
    
    { title: 'Clientes', path: '/cliente', icon: 'bi-person-fill' },
    { title: 'Calibraciones', path: '/calibraciones', icon: 'bi-tools' },
    { title: 'Usuarios', path: '/user', icon: 'bi-person-fill' },
    {
    title: 'Configuración',
    icon: 'bi-gear-fill',
    children: [
      { title: 'Máquinas', path: '/maquinas', icon: 'bi-kanban-fill' },
      { title: 'Tipos de Maquina', path: '/maquinas_tipos', icon: 'bi-layers-fill' },
    ],
  },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Don Asdrubal</h2>

        <ul>
          {basicSelectores.map((selector, i) => {
            const hasChildren = selector.children && selector.children.length > 0;

            return (
              <li key={i}>
                {/* --- ITEM SIN HIJOS --- */}
                {!hasChildren ? (
                  <Link to={selector.path} className="nav-link">
                    <i className={`bi ${selector.icon}`}></i>
                    <span>{selector.title}</span>
                  </Link>
                ) : (
                  <>
                    {/* --- ITEM PADRE (click para abrir/cerrar) --- */}
                    <div
                      className="nav-link dropdown-toggle"
                      onClick={() =>
                        setOpenMenus((prev) => ({
                          ...prev,
                          [selector.title]: !prev[selector.title],
                        }))
                      }
                    >
                      <i className={`bi ${selector.icon}`}></i>
                      <span>{selector.title}</span>
                    </div>

                    {/* --- SUBMENÚ --- */}
                    {openMenus[selector.title] && (
                      <ul className="submenu">
                        {selector.children.map((child, j) => (
                          <li key={j}>
                            <Link to={child.path} className="nav-link">
                              <i className={`bi ${child.icon}`}></i>
                              <span>{child.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </aside>
      {/* Contenido dinámico */}
      <main className="main-content">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-home">
            Home
          </Link>

          {pathnames.map((name, index) => {
            // Si es un ID numérico, lo omitimos
            if (!isNaN(name)) return null;

            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const label = breadcrumbNames[name] || decodeURIComponent(name);

            return isLast ? (
              <span key={index} className="breadcrumb-current">
                {' > '} {label}
              </span>
            ) : (
              <span key={index}>
                {' > '}
                <Link to={routeTo} className="breadcrumb-link">
                  {label}
                </Link>
              </span>
            );
          })}
        </nav>

        {/* Render dinámico */}
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
