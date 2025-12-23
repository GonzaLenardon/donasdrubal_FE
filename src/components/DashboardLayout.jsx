// DashboardLayout.jsx
import React, { useMemo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const breadcrumbNames = {
  user: 'Usuarios',
  maquinas: 'Máquinas',
  calibraciones: 'Calibraciones',
  detalles: 'Detalles',
  cliente: 'Clientes',
  clientes: 'Clientes',
  reportes: 'Reportes',
  // agregá más mappings si hace falta
};

// helper: detecta si segment es un id (número) o UUID (hex con guiones)
const isIdSegment = (seg) => {
  if (!seg) return false;
  // números puros: 123, 4567
  if (/^\d+$/.test(seg)) return true;
  // uuid v4-like: 550e8400-e29b-41d4-a716-446655440000
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F-]{27,}$/.test(seg)) return true;
  return false;
};

const DashboardLayout = () => {
  const location = useLocation();

  // construimos breadcrumbItems: [{ name: 'user', label: 'Usuarios', to:'/user' }, ...]
  const breadcrumbItems = useMemo(() => {
    // split & filtrar vacíos
    const parts = location.pathname
      .split('/')
      .filter((p) => p && p.trim() !== '');

    const items = [];
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];

      // saltar ids/uuids
      if (isIdSegment(seg)) continue;

      // si el siguiente segment es un id y el siguiente siguiente es 'detalles',
      // queremos tratar 'detalles' como el crumb final (ej: /cliente/23/detalles -> Clientes > Detalles)
      if (parts[i + 1] && isIdSegment(parts[i + 1]) && parts[i + 2]) {
        // en este caso saltamos el segmento actual si es el 'cliente' (lo mantendremos cuando llegue 'detalles')
        // pero generalmente queremos mantener el segmento actual (ej: /cliente) así que no saltamos aquí.
        // en resumen: solo saltamos ids en general; el label lo decidimos por el propio seg.
      }

      // label por mapping o el mismo segmento (decodificado)
      const label = breadcrumbNames[seg] || decodeURIComponent(seg);

      // ruta a construir (ej: /cliente, /cliente/23/detalles => para 'detalles' path será /cliente/23/detalles)
      // construimos la ruta hasta THIS segment (incluyendo id segments anteriores)
      const pathPartsUpToThis = [];
      // recorrer original parts array hasta index i, pero incluir ids que estén entre medias
      for (let j = 0; j <= i; j++) {
        pathPartsUpToThis.push(parts[j]);
      }
      const to = '/' + pathPartsUpToThis.join('/');

      items.push({ name: seg, label, to });
    }

    return items;
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen ">
        <div className="container-fluid">
          {/* Breadcrumb */}
          <nav
            aria-label="breadcrumb"
            className="breadcrumb-container"
            style={{ marginBottom: 16 }}
          >
            {breadcrumbItems.length === 0 ? (
              <span className="breadcrumb-current">Dashboard</span>
            ) : (
              <ol className="breadcrumb-list">
                {breadcrumbItems.map((item, idx) => {
                  const isLast = idx === breadcrumbItems.length - 1;
                  return (
                    <li key={item.to} className="breadcrumb-item">
                      {!isLast ? (
                        <>
                          <Link to={item.to} className="breadcrumb-link">
                            {item.label}
                          </Link>
                          <span className="breadcrumb-sep"> &gt; </span>
                        </>
                      ) : (
                        <span className="breadcrumb-current">{item.label}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </nav>

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
