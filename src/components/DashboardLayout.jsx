import React, { useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useCliente } from '../context/UserContext';
import ClienteDetalles from './ClienteDetalle';

/* ============================
   Labels del breadcrumb
============================ */
const breadcrumbNames = {
  user: 'Usuarios',
  maquinas: 'Máquinas',
  calibraciones: 'Calibraciones',
  detalles: 'Dashborad ggg',
  cliente: 'Clientes',
  clientes: 'Clientes',
  notificaciones: 'Notificaciones',
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

const DashboardLayout = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { selectedMaquina, selectedCliente, selectedPozo, setActiveTab } =
    useCliente();

  const clienteNombre = selectedCliente?.razon_social;
  const maquinaNombre =
    selectedMaquina?.tipo?.marca && selectedMaquina?.tipo?.modelo
      ? `${selectedMaquina.tipo.marca} ${selectedMaquina.tipo.modelo}`
      : null;

  const pozoNombre =
    selectedPozo?.nombre && selectedPozo?.establecimiento
      ? `${selectedPozo.nombre} ${selectedPozo.establecimiento}`
      : null;

  /* ============================
     Construcción del breadcrumb
  ============================ */
  const breadcrumbItems = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const items = [];

    let clienteId = null;
    let lastValidTo = '/';

    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];

      /* ===== CLIENTE ===== */
      if (seg === 'cliente' && parts[i + 1] && isIdSegment(parts[i + 1])) {
        clienteId = parts[i + 1];

        // Cliente (lista)
        items.push({
          label: 'Clientes',
          to: '/cliente',
          clickable: true,
          action: () => setActiveTab('dashboard'),
        });

        // Nombre cliente
        items.push({
          label: clienteNombre,
          to: `/cliente/${clienteId}/detalles`,
          clickable: true,
          action: () => setActiveTab('dashboard'),
        });

        lastValidTo = `/cliente/${clienteId}/detalles`;
        i++;
        continue;
      }

      /* ===== POZOS ===== */
      if (seg === 'pozos') {
        items.push({
          label: 'Pozos',
          to: lastValidTo,
          clickable: true,
          action: () => setActiveTab('pozos'),
        });

        continue;
      }

      /* ===== POZO ID ===== */
      if (seg === 'pozos' && parts[i + 1] && isIdSegment(parts[i + 1])) {
        items.push({
          label: 'Pozo',
          to: lastValidTo,
          clickable: true,
          action: () => setActiveTab('pozos'),
        });

        items.push({
          label: pozoNombre,
          clickable: false,
        });

        i++;
        continue;
      }

      /* ===== Maquinas ===== */
      if (seg === 'maquinas') {
        items.push({
          label: 'Maquinas',
          to: lastValidTo,
          clickable: true,
          action: () => setActiveTab('maquinas'),
        });

        continue;
      }

      if (seg === 'calibraciones') {
        items.push({
          label: 'Calibraciones',
          to: lastValidTo,
          clickable: false,
          action: () => setActiveTab('calibraciones'),
        });

        continue;
      }

      /* ===== MUESTRAS ===== */
      if (seg === 'muestras') {
        items.push({
          label: 'Muestras',
          clickable: false,
        });
        continue;
      }

      /* ===== IGNORAR DETALLES ===== */
      if (seg === 'detalles') continue;

      /* ===== SALTAR IDs ===== */
      if (isIdSegment(seg)) continue;

      /* ===== IGNORAR Maquinas tipos ===== */
      if (seg === 'detalles') continue;

      /* ===== GENERICO ===== */
      const label = breadcrumbNames[seg] || '';

      items.push({
        label,
        to: '/' + parts.slice(0, i + 1).join('/'),
        clickable: true,
      });
    }

    return items;
  }, [location.pathname, clienteNombre, pozoNombre]);

  return (
    <>
      {/* Botón hamburguesa */}
      <div className="topbar-mobile">
        <button
          className="hamburger-btn"
          onClick={() => setIsMobileOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      <Link to="/" className="logoDesktop">
        <div className="logoMobile" />
      </Link>

      <div className="relative flex min-h-screen w-full bg-background-warning dark:bg-background-dark">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          closeSidebar={() => setIsMobileOpen(false)}
        />

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto min-h-screen">
          <div className="container-fluid p-2">
            <nav className="app-breadcrumb">
              {breadcrumbItems.length === 0 ? (
                <span className="crumb current">Dashboard</span>
              ) : (
                breadcrumbItems.map((item, idx) => {
                  const isLast = idx === breadcrumbItems.length - 1;

                  return (
                    <span key={idx} className="crumb-wrapper">
                      {item.clickable && !isLast ? (
                        <Link
                          to={item.to}
                          className="crumb link"
                          onClick={() => item.action?.()}
                        >
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

            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
