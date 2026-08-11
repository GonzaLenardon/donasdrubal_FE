# AGENTS.md - Don Asdrubal

## Tipo de proyecto
SPA React (Vite + React 19) — CRM agrícola para gestión de clientes,
máquinas pulverizadoras, calibraciones, pozos, muestras de agua,
jornadas, alertas e informes PDF.

## Comandos
- `npm run lint` — ESLint (plugins React hooks + React Refresh)
- `npm run dev` — Servidor de desarrollo Vite (usa `VITE_API_URL` de `.env`)
- `npm run build` — Build de producción
- **No existen comandos de test, typecheck ni formateo**

## Arquitectura
- **Solo frontend** — API backend en `VITE_API_URL` (por defecto: `http://localhost:3000`)
- **Auth**: Basada en cookies (cookie `Token`), verificada vía `GET /auth/verify`.
  El interceptor de Axios redirige a `/login` en 401.
- **Estado**: React Context (`src/context/UserContext.jsx`) para cliente/máquina/pozo/tab seleccionado
- **Enrutamiento**: React Router v7 con rutas anidadas. Todas las rutas excepto `/login`
  están protegidas por `ProtectedRoute`.
- **Estilos**: Bootstrap 5 + Tailwind CSS (CDN en `index.html`) + CSS custom en `src/css/`
- **Capa API**: Centralizada en `src/api/axios.js`. Todas las llamadas usan esta instancia.

## Jerarquía de entidades
```
Clientes
├── Máquinas → Calibraciones (abrir/cerrar)
├── Pozos → Muestras de Agua (abrir/cerrar)
└── Jornadas (abrir/cerrar)
```
- Clientes, Máquinas, Pozos: CRUD completo
- Calibraciones, Muestras, Jornadas: CRUD + cambio de estado (open/close)
- Alertas/Notificaciones: sistema de campañas con estados propios
- Informes PDF: generados en backend, devueltos como blob

## Estados de negocio
| Entidad | Estados |
|---------|---------|
| Calibraciones, Jornadas, Muestras | `PENDIENTE`, `EN PROCESO`, `CERRADO` |
| Notificaciones | `PENDIENTE`, `ACTIVA`, `ALERTADO`, `EN PROCESO`, `VENCIDO` |

Colores en `src/utils/colors.js`: PENDIENTE=#E24B4A, EN PROCESO=#EF9F27, CERRADO=#146c43.

## Directorios clave
- `src/components/` — ~50 componentes JSX (páginas, modales, gráficos, layouts)
- `src/api/` — Módulos API por entidad (clientes, pozos, máquinas, etc.)
- `src/css/` — 10 archivos CSS personalizados (uno por área funcional)
- `src/context/` — Único provider UserContext
- `src/utils/` — Helpers (generación PDF, formato de fechas, manejo de errores, colores)

## Convenciones de nombres
- **API fields**: snake_case (`cliente_id`, `razon_social`, `fecha_vencimiento`)
- **JS variables**: camelCase (`clienteList`, `newCliente`, `setLoading`)
- **Componentes**: PascalCase (`Calibraciones`, `DashboardUser`)
- **Funciones API**: prefijos `all`, `add`, `up`, `get`, `del`, `close`/`open`
- **Modales**: prefijo `Modal` (`ModalCalibraciones`, `ModalJornadas`)
- **Archivos JSX**: PascalCase. **Archivos JS**: camelCase
- **Constantes**: UPPER_SNAKE_CASE (`INITIAL_STATUS_FILTERS`, `STATUS_CLASS_MAP`)

## Estilo de código
- `const` arrow functions (excepto `App.jsx` y contextos que usan `function`)
- `async/await` con `try/catch/finally` (no `.then()` chain)
- Optional chaining (`?.`) y nullish coalescing (`??`) — uso extenso
- Early returns para loading/error states
- `Promise.all` para requests paralelos
- Imports: React → API → Router → Componentes → Context → Libs → Utils
- Idioma: comentarios, variables y UI en **español**
- Archivos: `.jsx`, no `.tsx` (no hay TypeScript)

## API: patrones de endpoints
- CRUD: `GET /entidades`, `POST /entidades`, `PUT /entidades/:id`, `DELETE /entidades/:id`
- Estado: `PUT /entidades/close/:id`, `PUT /entidades/open/:id`
- Dashboard: `GET /dashboard/user/servicesToClients`, `GET /dashboard/services/totales`
- PDF: `POST /informes/calibracion`, `POST /informes/pozos`, etc. (devuelven blob)
- Uploads: vía `fetch()` raw con FormData (no Axios): `/calibraciones/upload`, `/jornadas/upload`

## Código muerto conocido
- `Varios.jsx` — stub sin funcionalidad
- `Dash.jsx` — comentado en el router
- `Borrar_UserDetalles.jsx` — backup deprecado
- `JornadasCards_old.jsx` — versión anterior de JornadasTable

## Puntos a tener en cuenta
- Tailwind CSS se carga vía CDN (no PostCSS), config inline en `index.html`
- El interceptor de Axios tiene lógica de exclusión para requests de login — no romper `isLoginRequest`
- `ProtectedRoute` hace `GET /auth/verify` en cada montaje — breve estado de carga
- `.env` contiene URLs de producción comentadas — no descomentar sin verificación
- ESLint `no-unused-vars` ignora variables con patrón `^[A-Z_]`
- `import React` aparece en archivos viejos pero React 19 no lo requiere
- Typo existente: `ingenieroPlrincipal` en Clientes.jsx (no corregir sin contexto)

## Workflow de tareas
Al completar cada tarea, agregar una línea al final de `CHANGELOG.md` con formato:
`YYYY-MM-DD - HH:MM - [Descripción breve de lo hecho]`
No pedir confirmación para esto, ejecutarlo automáticamente.
