import React, { useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

/* ============================
   Labels del breadcrumb
============================ */
const breadcrumbNames = {
  user: 'Usuarios',
  maquinas: 'Máquinas',
  calibraciones: 'Calibraciones',
  detalles: 'Detalles',
  cliente: 'Clientes',
  clientes: 'Clientes',
  pozos: 'Pozos',
  jornadas: 'Jornadas',
  reportes: 'Reportes',
};

/* ============================
   Segmentos NO navegables
============================ */
const NON_CLICKABLE_SEGMENTS = ['maquinas', 'pozos', 'jornadas'];

/* ============================
   Detecta IDs numéricos
============================ */
const isIdSegment = (seg) => /^\d+$/.test(seg);

/* ============================
   Lee cliente activo (SAFE)
============================ */
const getClienteActivo = () => {
  try {
    const raw = localStorage.getItem('Cliente');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const DashboardLayout = () => {
  const location = useLocation();
  const cliente = getClienteActivo();

    const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  
    const openSidebar = () => setIsMobileOpen(true);
    const closeSidebar = () => setIsMobileOpen(false);

  /* ============================
     Construcción del breadcrumb
  ============================ */
  const breadcrumbItems = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const items = [];
    items.push({
      label: 'Dashboard',
      to: '/',
      clickable: true,
    });

    let lastValidTo = '/';

    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];

      /* ===== CASO: /cliente/:id ===== */
      if (seg === 'cliente' && parts[i + 1] && isIdSegment(parts[i + 1])) {
        // Clientes
        items.push({
          label: 'Clientes',
          to: '/cliente',
          clickable: true,
        });

        // Nombre del cliente (visual)
        if (cliente?.nombre) {
          items.push({
            label: cliente.nombre,
            to: `/cliente/${parts[i + 1]}/detalles`,
            clickable: false,
          });
        }

        lastValidTo = `/cliente/${parts[i + 1]}/detalles`;
        continue;
      }

      /* ===== Saltar IDs ===== */
      if (isIdSegment(seg)) continue;

      const label = breadcrumbNames[seg] || decodeURIComponent(seg);
      const to = '/' + parts.slice(0, i + 1).join('/');
      const clickable = !NON_CLICKABLE_SEGMENTS.includes(seg);

      items.push({
        label,
        to: clickable ? to : lastValidTo,
        clickable,
      });

      if (clickable) lastValidTo = to;
    }

    return items;
  }, [location.pathname, cliente]);

  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
<button className="hamburger-btn" onClick={openSidebar}>
  <span />
  <span />
  <span />
</button>
{isMobileOpen && (
  <div className="sidebar-overlay" onClick={closeSidebar} />
)}
<Sidebar
  isMobileOpen={isMobileOpen}
  closeSidebar={closeSidebar}
/>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="container-fluid">
          {/* ============================
              Breadcrumb
          ============================ */}
          <nav className="app-breadcrumb">
            {breadcrumbItems.length === 0 ? (
              <span className="crumb current">Dashboard</span>
            ) : (
              breadcrumbItems.map((item, idx) => {
                const isLast = idx === breadcrumbItems.length - 1;

                return (
                  <span key={idx} className="crumb-wrapper">
                    {item.clickable && !isLast ? (
                      <Link to={item.to} className="crumb link">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="crumb current">{item.label}</span>
                    )}
                    {!isLast && <span className="separator">{'>'}</span>}
                  </span>
                );
              })
            )}
          </nav>

          {/* ============================
              Contenido
          ============================ */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
