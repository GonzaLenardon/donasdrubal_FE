import { Outlet, Link, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Diccionario para mostrar nombres legibles en el breadcrumb
  const breadcrumbNames = {
    user: 'Usuarios',
    maquinas: 'Máquinas',
    calibraciones: 'Calibraciones',
    dashboard: 'Dashboard',
    clientes: 'Clientes',
    reportes: 'Reportes',
  };

  const basicSelectores = [
    { title: 'Usuarios', path: '/user', icon: 'bi-person-fill' },
    { title: 'Clientes', path: '/clientes', icon: 'bi-person-fill' },
    { title: 'Máquinas', path: '/maquinas', icon: 'bi-gear-fill' },
    { title: 'Calibraciones', path: '/calibraciones', icon: 'bi-tools' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Don Asdrúbal</h2>
        <ul>
          {basicSelectores.map((selector, i) => (
            <li key={i}>
              <Link to={selector.path} className="nav-link">
                <i className={`bi ${selector.icon}`}></i>
                <span>{selector.title}</span>
              </Link>
            </li>
          ))}
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
