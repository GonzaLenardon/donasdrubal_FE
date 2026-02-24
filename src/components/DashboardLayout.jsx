import React, { useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useCliente } from '../context/UserContext';

/* ============================
   Labels del breadcrumb
============================ */
const breadcrumbNames = {
  user: 'Usuarios',
  maquinas: 'Máquinas',
  calibraciones: 'Calibraciones',
  detalles: 'Dashborad',
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

const DashboardLayout = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { selectedMaquina, selectedCliente, selectedPozo } = useCliente();

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

    // Siempre agregar Dashboard
    /*  items.push({
      label: 'Dashboard',
      to: '/',
      clickable: true,
    }); */

    let lastValidTo = '/';

    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];

      /* ===== CASO: /cliente/:id ===== */
      if (seg === 'cliente' && parts[i + 1] && isIdSegment(parts[i + 1])) {
        items.push({
          label: 'Cliente',
          /*  to: `/cliente/${parts[i + 1]}/detalles`, */
          to: `/cliente`,

          clickable: true,
        });

        items.push({
          label: clienteNombre,
          /*  to: `/cliente/${parts[i + 1]}/detalles`, */
          to: `/cliente`,

          clickable: false,
        });

        lastValidTo = `/cliente/${parts[i + 1]}/detalles`;
        i++; // Saltar el ID
        continue;
      }

      /* ===== CASO: /maquinas/:id (dentro de cliente) ===== */
      if (seg === 'maquinas' && parts[i + 1] && isIdSegment(parts[i + 1])) {
        // Si hay nombre de máquina, usarlo en lugar  de "Máquinas"

        items.push({
          label: 'Máquinas',
          to: lastValidTo,
          clickable: false,
        });

        items.push({
          label: maquinaNombre,
          to: lastValidTo, // No es clickeable a la máquina individual
          clickable: false,
        });

        i++; // Saltar el ID de la máquina
        continue;
      }

      /* ===== CASO: /pozos/:id (dentro de cliente) ===== */
      if (seg === 'pozos' && parts[i + 1] && isIdSegment(parts[i + 1])) {
        // Similar a máquinas, pero para pozos

        items.push({
          label: 'Pozo ', // O puedes obtener el nombre del pozo del contexto
          to: lastValidTo,
          clickable: false,
        });

        items.push({
          label: pozoNombre, // O puedes obtener el nombre del pozo del contexto
          to: lastValidTo,
          clickable: false,
        });
        i++; // Saltar el ID del pozo
        continue;
      }

      /* ===== Saltar IDs simples ===== */
      if (isIdSegment(seg)) continue;

      /* ===== Segmentos normales ===== */
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
  }, [location.pathname, clienteNombre, maquinaNombre]);

  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      {/* Botón hamburguesa */}
      <div className="topbar-mobile">
        <button className="hamburger-btn" onClick={() => setIsMobileOpen(true)}>
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

      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        closeSidebar={() => setIsMobileOpen(false)}
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
