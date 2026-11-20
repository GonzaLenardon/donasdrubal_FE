# Facturación parcial y reserva de remitos

**Session ID:** ses_e0c002d8effen9LUD5E28wkVVA
**Created:** 19/11/2026, 10:29:51 a.m.
**Updated:** 19/11/2026, 11:06:21 a.m.

---

## User

Analicemos Remitos y Facturacion. Actualmente el flujo esta ok pero se deberia poder facturar parcialmente un producto de un remito.Ej un remito detalla producto A 100 unidades, producto B 50 unidades y producto C 350 litros. A la hora de facturar total o parcialmente quiero facturar solo 20 unidades del producto A y 150 litros producto C por lo que en facturacion al seleccionar el remito deberia tener la posibilidad de seleccionar los productos y cantidad de los productos que quiero factuar. Y la otra funcionalidad y nueva que quieo que analicemos es desde remito seleccinando n remitos y armar una especie de cotizacion o pre-factura y ya dejarla lista para facturar y no tener que volver a calcular todo para facturar. Ej.Uncliente tiene 10 remitos pendientes de facturar y me dice que tiene 25000 dlls para que le facutre algunos de estos remitos entonces  selecciono remito3, remito9 y remito8 y el total de esto seria 25000 dlls. entocnes como ya seleecione los remitos que llegan a ese monto ya me gustaria dejarlo en un estado como ya reservado para una facturacion y evitar que venga otra persona y seleccione alguno de estos remitos y lo facture individualemente desconociendo el analisis y reserva previa.

---

## Assistant (Plan · MiniMax M3.1 Flash · 269.8s)

I'll explore the codebase to understand the current Remitos and Facturación flows before proposing a plan.

**Tool: task**

**Input:**
```json
{
  "description": "Explore Remitos flow",
  "prompt": "Explore the \"Remitos\" (delivery notes / remitos) feature in this React SPA at C:\\Job\\Don Asdrubal\\donAsdrubal. I need a VERY THOROUGH understanding.\n\nFind and report:\n1. All files (components, api modules, utils, css) related to Remitos - list absolute paths.\n2. The full API layer for remitos: endpoints (list, create, update, delete, state changes), what fields a remito has (remito number, cliente, products/items, units, liters, amounts, dates, estado, etc.). Include the exact request/response shapes you can infer from the code.\n3. The Remitos UI components: table/columns, modals for create/edit, how line items (producto, cantidad, precio) are captured, how totals are computed, whether there is any notion of \"facturado\" (billed) amount vs remito amount, any estado enums.\n4. Any existing relationship between remitos and facturacion (invoices) - e.g. fields like factura_id, remito_id on invoices, invoice items referencing remito items.\n5. Any existing \"reserva\" / \"reservado\" / \"cotizacion\" / \"pre-factura\" concept anywhere in the codebase.\n\nReport with file:line references and quote relevant code snippets (keep them concise but complete enough to understand data structures). Do NOT modify anything.",
  "subagent_type": "explore"
}
```

**Output:**
```
<task id="ses_e0c000a30ffe0tW8jUV6Lpf3Yk" state="completed">
<task_result>
I explored the Remitos feature exhaustively — the SPA plus the sibling backend repo (`C:\Job\Don Asdrubal\backend`), which I read read-only to confirm exact request/response shapes. Nothing was modified.

---

# 1. Files related to Remitos

## Frontend (SPA — `C:\Job\Don Asdrubal\donAsdrubal`)

| Path | Role |
|---|---|
| `C:\Job\Don Asdrubal\donAsdrubal\src\api\remitos.js` | API layer for remitos (85 lines) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\api\facturas.js` | API layer for facturación (31 lines) — **untracked/new** |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\Remitos.jsx` | Main page: table, filters, detail panel (1345 lines) — **modified** |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalRemitoCatalogo.jsx` | Create remito → cliente (421 lines) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalRemitoInterno.jsx` | Create remito interno (transferencia entre depósitos) (546 lines) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\UploadRemitoPhoto.jsx` | Upload/list/delete attached files (207 lines) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\RemitosFaltantesPanel.jsx` | Panel "saltos de numeración" (409 lines) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\InformeRemitosFaltantes.jsx` | Standalone report page (56 lines) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\Facturacion.jsx` | Facturación page + "Remitos pendientes de facturar" (766 lines) — **untracked/new** |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalFactura.jsx` | Create factura / select remitos (385 lines) — **untracked/new** |
| `C:\Job\Don Asdrubal\donAsdrubal\src\css\remitosFaltantes.css` | Styles for faltantes panel (222 lines) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\css\page-header.css` | Shared "lista" design system; sections `/* Remito digital */` (L525) and `/* Remito físico */` (L618) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\App.jsx` | Routes `stock/remitos` (L109), `stock/facturacion` (L110), `reportes/remitos-faltantes` (L77) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\Sidebar.jsx` | Menu: Operaciones → Remitos (L73-77), Facturación (L78-82); Informes → Faltantes de Remitos (L106-111) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\DashboardLayout.jsx` | Breadcrumb label `remitos: 'Remitos'` (L30) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\hooks\useIsMobile.js` | Responsive switch used by `Remitos.jsx` |
| `C:\Job\Don Asdrubal\donAsdrubal\plan-modulo-remitos.txt` | Original planning doc (data model, endpoints, FIFO) |
| `C:\Job\Don Asdrubal\donAsdrubal\informe-cliente.md` | Client-facing summary of the module |

**No remito-specific utils.** `src/utils/colors.js` and `src/utils/statusMap.js` only cover calibraciones/servicios. `src/api/stock.js`, `depositos.js`, `productVariants.js` are consumed by Remitos but not remito-specific.

## Backend (sibling repo — read-only reference)

`C:\Job\Don Asdrubal\backend\src\controllers\remitos.js` (774), `...\controllers\remitoArchivos.js` (99), `...\controllers\facturas.js` (433), `...\services\facturacionService.js` (100), `...\services\reportes\remitosFaltantesService.js` (316), `...\models\remitos.js`, `remitoItems.js`, `remitoItemLots.js`, `remitoArchivos.js`, `remitoFacturas.js`, `facturas.js`, `...\routes\index.js` (L652-681), `...\middlewares\uploadRemitos.js`, `...\docs\remitos-internos.md`, migrations `20260904000001-create-stock-module`, `20260930000001-remitos-v2-rankings`, `20261019000001-create-remito-archivos`, `20261103000001-add-internal-remitos`, `20261106000001-create-facturas`.

---

# 2. Full API layer for remitos

## 2.1 Frontend API module — `src\api\remitos.js`

```js
// src\api\remitos.js:3-36
export const allRemitos = async () => instance.get('/stock/remitos');
export const getRemito = async (id) => instance.get(`/stock/remitos/${id}`);
export const addRemito = async (remito) => instance.post('/stock/remitos', remito);
export const addRemitoInterno = async (remito) => instance.post('/stock/remitos/internos', remito);
export const cancelRemito = async (id, cancelled_by) =>
  instance.put(`/stock/remitos/${id}/cancel`, { cancelled_by });
export const confirmRemito = async (id, confirmed_by) =>
  instance.put(`/stock/remitos/${id}/confirm`, { confirmed_by });
export const getCatalogo = async (warehouseId) => instance.get(`/stock/remitos/catalogo/${warehouseId}`);
```

```js
// src\api\remitos.js:38-57  — faltantes: builds /faltantes | /faltantes/deposito/:id | /faltantes/ingeniero/:id  (+ '/agrupados')
export const getRemitosFaltantes = async ({ depositoId = null, ingenieroId = null, agrupar = false } = {}) => {...}
```

```js
// src\api\remitos.js:59-85
export const uploadPhoto    = (id, formData) => instance.put(`/stock/remitos/${id}/photo`, formData, {headers:{'Content-Type':'multipart/form-data'}});
export const getArchivos    = (remitoId) => instance.get(`/stock/remitos/${remitoId}/archivos`);
export const uploadArchivos = (remitoId, formData) => instance.post(`/stock/remitos/${remitoId}/archivos`, formData, {headers:{...}});
export const deleteArchivo  = (remitoId, archivoId) => instance.delete(`/stock/remitos/${remitoId}/archivos/${archivoId}`);
```

> **Note:** `uploadPhoto` (single `photo` field) is **dead code** — the UI uses `uploadArchivos` (`archivos` array). There is **no update/edit endpoint** in the frontend API: `PUT /stock/remitos/:id` exists only for `cancel`/`confirm`/`photo`.

## 2.2 Backend route table (`backend\src\routes\index.js:652-681`)

| Method | Path | Controller |
|---|---|---|
| GET | `/stock/remitos` | `allRemitos` |
| GET | `/stock/remitos/catalogo/:warehouse_id` | `getCatalogo` |
| GET | `/stock/remitos/faltantes` | `getRemitosFaltantes` (ADMIN/INGENIERO) |
| GET | `/stock/remitos/faltantes/agrupados` | `getRemitosFaltantesAgrupados` |
| GET | `/stock/remitos/faltantes/deposito/:deposito_id[/agrupados]` | idem |
| GET | `/stock/remitos/faltantes/ingeniero/:ingeniero_id[/agrupados]` | idem |
| GET | `/stock/remitos/:id` | `getRemitoById` |
| POST | `/stock/remitos` | `addRemito` |
| POST | `/stock/remitos/internos` | `addRemitoInterno` |
| PUT | `/stock/remitos/:id/photo` | `uploadRemitoPhoto` (multer `photo`) |
| PUT | `/stock/remitos/:id/confirm` | `confirmRemito` |
| PUT | `/stock/remitos/:id/cancel` | `cancelRemito` |
| GET | `/stock/remitos/:remitoId/archivos` | `getArchivosByRemito` |
| POST | `/stock/remitos/:remitoId/archivos` | `addArchivo` (multer `archivos`, max 10) |
| DELETE | `/stock/remitos/:remitoId/archivos/:archivoId` | `deleteArchivo` |
| GET | `/stock/facturas` | `allFacturas` |
| GET | `/stock/facturas/remitos-disponibles` | `remitosDisponibles` |
| GET | `/stock/facturas/:id` | `getFacturaById` |
| POST | `/stock/facturas` | `addFactura` (ADMIN) |
| PUT | `/stock/facturas/:id/anular` | `anularFactura` (ADMIN) |

There is **no** `proximo-numero` endpoint (it appears only in `plan-modulo-remitos.txt:348`); the remito number is typed manually.

## 2.3 Remito entity (DB truth) — `backend\src\models\remitos.js:18-78`

```js
remito_number:        STRING(20)   NOT NULL,   // "00000315" (cliente) | "TR-00000042" (interno)
type:                 ENUM('OFICIAL','NO_OFICIAL') NOT NULL,
status:               ENUM('PENDIENTE','REVISION','COMPLETADO','ANULADO') NOT NULL DEFAULT 'PENDIENTE',
origin_warehouse_id:  INTEGER NOT NULL,
destination_client_id:INTEGER NULL,             // NULL en remitos internos
destination_warehouse_id: INTEGER NULL,         // presente => remito INTERNO
issued_at:            DATE, created_by: INTEGER, notes: TEXT,
photo_path:           STRING(500), photo_uploaded_at: DATE,
confirmed_at: DATE, confirmed_by: INTEGER,
cancelled_at: DATE, cancelled_by: INTEGER,
company_id: INTEGER DEFAULT 1, createdAt/updatedAt
```

Related tables:
- `remito_items` (`models\remitoItems.js:13-32`): `id, remito_id, product_variant_id, quantity_requested DECIMAL(15,4), quantity_dispatched DECIMAL(15,4), description`
- `remito_item_lots`: `remito_item_id, product_lot_id, quantity_dispatched` (FIFO lots)
- `remito_archivos` (`models\remitoArchivos.js`): `remito_id, path, mime_type, original_name, size, uploaded_by, uploaded_at` (soft delete)
- `remito_facturas` (`models\remitoFacturas.js:14-29`): `factura_id, remito_id, cantidad_facturada DECIMAL(15,4)`

## 2.4 Request shapes

**Create remito to cliente** — `ModalRemitoCatalogo.jsx:113-124`
```js
const items = carrito.map((item) => ({
  product_variant_id: item.product_variant_id,
  quantity_requested: item.quantity_requested,   // en PRESENTACIÓN, no en litros
}));
await addRemito({
  ...form,                       // type, origin_warehouse_id, destination_client_id, remito_number, notes
  origin_warehouse_id: parseInt(form.origin_warehouse_id),
  destination_client_id: parseInt(form.destination_client_id),
  remito_number: form.remito_number.padStart(8, '0'),
  created_by: user?.id,
  items,
});
```
Backend converts to base units and deducts stock FIFO (`controllers\remitos.js:137-206`):
```js
const cantidadBase = variante?.presentacion?.cantidad_base ? parseFloat(variante.presentacion.cantidad_base) : 1;
const qtyBase = parseFloat(item.quantity_requested) * cantidadBase;
...
remitoItem.quantity_dispatched = qtyBase;   // stock ya descontado al crear
```
Validation: `remito_number` must match `/^\d{1,8}$/`, padded to 8; unique per `(company_id, origin_warehouse_id, remito_number)` → 409 otherwise (`controllers\remitos.js:91-111`).

**Create remito interno** — `ModalRemitoInterno.jsx:175-185`
```js
await addRemitoInterno({
  origin_warehouse_id: Number(origenId),
  destination_warehouse_id: Number(destinoId),
  issued_at: fecha,                       // 'YYYY-MM-DD'
  notes: notas.trim() || null,
  created_by: user?.id,
  items: carrito.map((item) => ({
    product_variant_id: item.product_variant_id,
    quantity_requested: item.quantity_requested,
  })),
});
```
Backend creates it `status: 'COMPLETADO'`, `type: 'NO_OFICIAL'`, `destination_client_id: null`, and renumbers it `TR-{id.padStart(8,'0')}` (`controllers\remitos.js:257-273, 385-386`).

**State changes**
- `PUT /stock/remitos/:id/confirm` body `{ confirmed_by }` → only from `REVISION` → `COMPLETADO` (`controllers\remitos.js:522-546`)
- `PUT /stock/remitos/:id/cancel` body `{ cancelled_by }` → `ANULADO` + stock revert; blocked if `COMPLETADO` and not interno (`controllers\remitos.js:395-520`)
- `POST /stock/remitos/:id/archivos` multipart: field `archivos` (files) + `uploaded_by`; flips `PENDIENTE → REVISION` and sets `photo_path` (`controllers\remitoArchivos.js:37-55`)
- `DELETE /stock/remitos/:remitoId/archivos/:archivoId` → if last file removed and status was `REVISION`, back to `PENDIENTE` (`controllers\remitoArchivos.js:83-93`)

## 2.5 Response shapes

**GET /stock/remitos** (list) — `controllers\remitos.js:28-74`
```js
{
  id, company_id, remito_number, type, status,
  origin_warehouse_id, destination_client_id, destination_warehouse_id,
  issued_at, created_by, notes, photo_path, photo_uploaded_at,
  confirmed_at, confirmed_by, cancelled_at, cancelled_by, createdAt, updatedAt,
  depositoOrigen: {...}, depositoDestino: {...}, cliente: {...},
  creadoPor: {id,nombre,email}, confirmadoPor: {...}, canceladoPor: {...},
  items: [{
    id, product_variant_id, quantity_dispatched,
    variante: { id, codigo,
      producto: {id, nombre, codigo},
      presentacion: {id, nombre} }
  }],
  // DERIVED (not DB columns) — appended after the query:
  total_remitido, facturado, saldo_facturacion, estado_facturacion
}
```
```js
// controllers\remitos.js:68-71
remito.dataValues.total_remitido   = saldo.total;      // SUM(items.quantity_dispatched) → litros
remito.dataValues.facturado        = saldo.facturado;  // SUM(remito_facturas.cantidad_facturada)
remito.dataValues.saldo_facturacion= saldo.saldo;      // MAX(total - facturado, 0)
remito.dataValues.estado_facturacion= saldo.estado;    // NO_FACTURADO | PARCIAL | FACTURADO
```

**GET /stock/remitos/:id** (detail) — `controllers\remitos.js:666-726` adds:
```js
items: [{ id, product_variant_id, quantity_requested, quantity_dispatched, description,
          variante: { id, codigo, producto: {...full}, presentacion: {...full} },
          lotes: [{ id, remito_item_id, product_lot_id, quantity_dispatched,
                    lote: { id, lot_number, manufacturing_date, expiration_date, ... } }] }],
facturaciones: [{ id, cantidad_facturada, factura_id, createdAt,
                  factura: { id, numero, fecha, tipo, estado } }],   // sólo facturas != ANULADA
```
> The `items[].variant` in list is **restricted** (`attributes: ['id','codigo']`), in detail it is **full** — that's why the detail panel can show `item.variante.presentacion.nombre` (`Remitos.jsx:527`) while the list filter only uses `codigo`/`producto.nombre`/`presentacion.nombre` (`Remitos.jsx:277-282`).

**GET /stock/remitos/catalogo/:warehouse_id** — `controllers\remitos.js:630-658`
```js
{
  product_variant_id, product_id, product_name, product_code,
  presentation_name, cantidad_base, unidad_base,
  stock_base,                 // litros totales
  stock_en_presentacion,      // = stock_base / cantidad_base  (redondeado a 2)
  ranking                     // 0..5 (5 = favorito)
}
```
> ⚠️ The frontend renders `item.product_image` (`ModalRemitoCatalogo.jsx:364`, `ModalRemitoInterno.jsx:333`) but `getCatalogo` **never returns `product_image`** (grep for `product_image` in backend → no matches). Those image blocks are currently dead.

**GET /stock/remitos/faltantes[/deposito/:id|/ingeniero/:id][/agrupados]** — `services\reportes\remitosFaltantesService.js:236-315`
```js
{ ok: true,
  scope: 'COMPLETO' | 'PARCIAL',
  modo: 'detalle' | 'agrupados',
  umbral_agrupacion: number | null,
  filtros: { deposito_id, ingeniero_id },
  resumen: { total_remitos, total_faltantes, depositos_con_faltantes, total_depositos },
  grupos: [{
    deposito_id, deposito: {id,nombre,codigo},
    total_remitos, total_faltantes, truncado,
    numeracion_min, numeracion_max, siguiente_numero, ancho,
    faltantes: [{ desde, hasta, cantidad, agrupado, desde_texto, hasta_texto }],
    remitos: [{ id, remito_number, type, status, createdAt, cliente_id, cliente }],
    filas: [ {tipo:'faltante',...} | {tipo:'remito', id, numero, remito_number, type, status, createdAt, cliente_id, cliente} ]
  }] }
```

---

# 3. Remitos UI

## 3.1 Main page `src\components\Remitos.jsx`

**Desktop table columns** (`Remitos.jsx:1123-1135`):
```jsx
<th>Número</th><th>Tipo</th><th>Depósito Origen</th><th>Destino</th>
<th>Fecha</th><th>Estado</th><th>Facturación</th><th className="text-end">Acciones</th>
```
Mobile renders the same data as `lista-card`s (`Remitos.jsx:1062-1117`).

**Filter bar** (`Remitos.jsx:931-1050`): Producto (debounced 300 ms, `L126-129`), N° Remito, Cliente, Depósito, **Facturación** (`NO_FACTURADO`/`PARCIAL`/`FACTURADO`), Desde, Hasta, Ingeniero/Empleado (admin only). All filtering is **client-side** in `remitosBase` (`L259-324`); `filtroTipo` splits `'' | 'clientes' | 'internos'` where *interno* ⇔ `destination_warehouse_id` truthy (`L326-332`).

**Estado enum + colors** (`Remitos.jsx:38-63`):
```js
const STATUS_COLORS = { PENDIENTE:'#EF9F27', REVISION:'#3b82f6', COMPLETADO:'#146c43', ANULADO:'#dc3545' };
const FACTURACION_COLORS = { NO_FACTURADO:'#6c757d', PARCIAL:'#EF9F27', FACTURADO:'#146c43' };
const FACTURACION_LABELS = { NO_FACTURADO:'Sin facturar', PARCIAL:'Parcial', FACTURADO:'Facturado' };
```

**Detail panel** (`renderRemitoDatos`, `Remitos.jsx:451-706`): shows Tipo (Oficial/No Oficial), Traslado or Cliente+Depósito, fecha, notas, the items table, the facturación note, the `facturaciones` table, confirmation/cancellation audit notes, and action buttons.

**Item table** (`Remitos.jsx:510-565`): columns `Artículo | Cantidad`, with the lot breakdown:
```jsx
{item.lotes?.length > 0 && (
  <div className="lista-items__lotes">
    {item.lotes.map((loteItem) =>
      `Lote ${loteItem.lote?.lot_number || `#${loteItem.product_lot_id}`}: ${parseFloat(loteItem.quantity_dispatched).toFixed(2)}`
    ).join(' · ')}
  </div>
)}
```
**Total computation** (`Remitos.jsx:363-366`):
```js
const totalItems = (remitoDetalle?.items || []).reduce(
  (acc, item) => acc + parseFloat(item.quantity_dispatched || 0), 0);
```
→ rendered as `{totalItems.toFixed(2)} ud` (L561). **This is a quantity of base units (litros), not money.**

**"Facturado" vs "total remitido" note** (`Remitos.jsx:567-584`):
```jsx
Facturación: {Number(remitoSeleccionado.facturado ?? 0).toFixed(2)} de {Number(remitoSeleccionado.total_remitido ?? 0).toFixed(2)} (
  {renderBadgeFacturacion(remitoSeleccionado.estado_facturacion)})
```

**Facturaciones table on the remito** (`Remitos.jsx:586-614`): `Factura | Fecha | Cantidad facturada`, sourced from `remitoDetalle.facturaciones[]` (`fact.factura.numero`, `fact.factura.tipo`, `fact.factura.fecha`, `fact.cantidad_facturada`).

**Row actions** (`renderAccionesFila`, `Remitos.jsx:389-449`): Facturar (icon `Receipt`), Subir archivo (camera, only when `PENDIENTE` and not interno), Confirmar (check, only when `REVISION` and not interno), Anular (X).

**Gating rule for "Facturar"** (`Remitos.jsx:383-387`):
```js
const puedeFacturarRemito = (remito) =>
  isAdmin && !remito.destination_warehouse_id &&
  remito.status === 'COMPLETADO' && Number(remito.saldo_facturacion ?? 0) > 0;
```

## 3.2 Create remito (to cliente) — `ModalRemitoCatalogo.jsx`

- Form state (`L6-12`): `{ type:'OFICIAL', origin_warehouse_id, destination_client_id, remito_number, notes }`
- Choosing a warehouse loads the catalog (`L19-35` → `getCatalogo`), split into **Favoritos (ranking 5)** / **Otros (0<ranking<5)** / **Sin clasificar (ranking 0)** (`L37-39`)
- "Carrito" = line items (`L41-78`); each line keeps: `product_variant_id, product_name, product_code, presentation_name, cantidad_base, unidad_base, quantity_requested, stock_en_presentacion`
- Validation (`L86-105`): deposit required, client required, `remito_number` numeric ≤8 digits, ≥1 product, `0 < quantity_requested ≤ stock_en_presentacion`
- Cart table columns: `Producto | Presentación | Cantidad | Stock | (delete)` (`L283-323`)
- **Total** (`L134`): `carrito.reduce((sum,item) => sum + item.quantity_requested * item.cantidad_base, 0)` → displayed as `Total: {totalItems.toFixed(2)} unidades base` (`L326`)
- **No price, no amount, no unit price is ever captured** — only product + quantity. (`plan-modulo-remitos.txt:465`: *"No se manejan tarifas ni precios en esta fase"*.)

## 3.3 Create remito interno — `ModalRemitoInterno.jsx`

3-step layout: (1) origin/destination warehouses, (2) product picker (react-select + "Favoritos Ranking 5" cards) + quantity, (3) fecha + notas. Same line-item model (`product_variant_id` + `quantity_requested`), no prices. Submitted as `NO_OFICIAL` with `destination_warehouse_id` and `issued_at`.

## 3.4 Files/photos — `UploadRemitoPhoto.jsx`

Accepts JPG/PNG/WebP/PDF, max 10 MB each (`L27-28`), multipart field `archivos` + `uploaded_by` (`L69-72`).

---

# 4. Relationship between remitos and facturación

**Data model:** `facturas` (1) ──< `remito_facturas` >── (1) `remitos`.

```js
// backend\src\models\remitoFacturas.js:14-29
factura_id:  INTEGER NOT NULL,
remito_id:   INTEGER NOT NULL,
// Cantidad facturada de este remito en esta factura, en unidades
// base (litros). Permite facturación parcial: <= total del remito.
cantidad_facturada: DECIMAL(15,4) NOT NULL,
```

**Invoice entity** (`backend\src\models\facturas.js`):
```js
cliente_id, tipo: ENUM('FACTURA','ANTICIPO'), fecha: DATEONLY,
numero: STRING(20) NULL,
estado: ENUM('SIMULADA','EMITIDA','ANULADA') DEFAULT 'SIMULADA',
notas, created_by, company_id
```
The comment at `models\facturas.js:44-46` is explicit: *SIMULADA = etapa actual (marca remitos como facturados); EMITIDA = etapa futura de facturación real; ANULADA = libera los remitos asociados.*

**Derived "billing state"** — `backend\src\services\facturacionService.js:15-21`
```js
export const calcularEstadoFacturacion = (total, facturado) => {
  if (facturadoNum <= 0) return 'NO_FACTURADO';
  if (facturadoNum >= totalNum) return 'FACTURADO';
  return 'PARCIAL';
};
```
`total` = `SUM(remito_items.quantity_dispatched)`; `facturado` = `SUM(remito_facturas.cantidad_facturada)` over facturas `estado != 'ANULADA'`.

**Frontend wiring**
- `Remitos.jsx` opens `ModalFactura` with `remitoInicial={remito}` (`Remitos.jsx:1313-1326`), and "Ir a Facturación" navigates to `/stock/facturacion?cliente=<id>&fecha=<hoy>` (`Remitos.jsx:662-674` and `L823-839`).
- `Facturacion.jsx` reads `?cliente` & `?fecha` (`L65-67`, `L91-94`), loads pending remitos via `remitosDisponibles(filtroCliente, true)` and renders the panel **Remitos pendientes de facturar** with columns `N° Remito | Fecha | Estado | Total | Facturado | Saldo | Facturación | Acción` (`L395-455`), using `remito.total_remitido`, `remito.facturado`, `remito.saldo_facturacion ?? remito.saldo`, `remito.estado_facturacion`, `remito.facturable`, `remito.motivo_bloqueo`.
- Invoice detail lists its remitos: `factura.remitos[].remito.remito_number`, `item.cantidad_facturada` (`Facturacion.jsx:311-340`); invoice total = `sum(cantidad_facturada)` (`L140-144`).

**Creating an invoice from remitos** — `ModalFactura.jsx:141-153`
```js
await addFactura({
  cliente_id: Number(form.cliente_id),
  tipo: form.tipo,            // 'FACTURA' | 'ANTICIPO'
  fecha: form.fecha,          // 'YYYY-MM-DD'
  numero: form.numero.trim() || null,
  notas: form.notas.trim() || null,
  remitos: esFactura
    ? marcados.map((remito) => ({
        remito_id: remito.id,
        cantidad_facturada: Number(seleccion[remito.id].cantidad),
      }))
    : [],
});
```
The "A facturar" column defaults to `remito.saldo` and is capped by it (`ModalFactura.jsx:58`, `L99-107`, `L314-332`); `ANTICIPO` invoices carry **no** remitos (`ModalFactura.jsx:361-366`).

**Server-side rules for the link** (`backend\src\controllers\facturas.js`):
- `remitos-disponibles` returns remitos `COMPLETADO` (or `PENDIENTE|REVISION|COMPLETADO` when `incluir_no_facturables=1`) with `destination_client_id = X`, `destination_warehouse_id = null`, each decorated with `total_remitido, facturado, saldo, saldo_facturacion, estado_facturacion, facturable, motivo_bloqueo` (`facturas.js:204-226`)
- `MOTIVO_BLOQUEO` = `'Falta subir el remito firmado'` / `'Falta confirmar el remito'` / `'El remito no tiene cantidades para facturar'` / `'Sin saldo pendiente (ya facturado)'` (`facturas.js:124-137`)
- `addFactura` rejects: remito not `COMPLETADO`, remito interno, remito de otro cliente, `cantidad > saldo` (`facturas.js:321-342`); `numero` unique among non-anulled invoices → 409 (`facturas.js:280-288`)
- `anularFactura` sets `estado='ANULADA'` and thereby frees the remitos' saldo (`facturas.js:399-432`)

**Important semantic note:** the "billing amount" is **not money**. `cantidad_facturada` is in **litros / base units**, exactly the same unit as `quantity_dispatched`. There is no `precio`, `costo`, `importe`, `subtotal` or `total` monetary field anywhere in the remito or factura models. "Facturado vs total remitido" is a **quantity** ratio used as a proxy for billing progress.

---

# 5. "Reserva" / "reservado" / "cotización" / "pre-factura"

**None exists.** Exhaustive searches over the whole repo:

- `reservad` → only `DrawerNotasUsuario.jsx:296` ("usuario original **preservado**") and `:273` — false positives.
- `reserva` → only `preservar`/`preservado` in the same file.
- `cotizacion` / `cotización` / `Cotizacion` → **0 matches** (frontend and backend).
- `prefactura` / `pre-factura` / `pre_factura` / `preFactura` → **0 matches**.
- `presupuest*` → **0 matches**.

The only adjacent concept is the **anticipo** (`Facturas.tipo = 'ANTICIPO'`), which is an invoice *without* remitos that records a customer advance (`ModalFactura.jsx:361-366`); there is no "reservation" entity, no stock hold/reserve flag, and no pre-invoice draft. `plan-modulo-remitos.txt:42` explicitly defers *"Cuenta corriente de litros"* and *"Tarifas de productos o transporte"* to a later phase.

---

# 6. Notable gaps / observations

1. **No editing of remitos from the UI** — no `PUT /stock/remitos/:id` update route; `plan-modulo-remitos.txt:344` planned "editar (solo PENDIENTE)" but it was never implemented.
2. **No `proximo-numero` endpoint** — the user types the remito number manually (max 8 digits, padded). Internal transfers get `TR-00000042` auto-assigned.
3. **`uploadPhoto` in `src\api\remitos.js:59` is dead code**; the UI uses the multi-file `archivos` endpoints.
4. **`product_image` is requested by the UI but never returned** by `/stock/remitos/catalogo/:warehouse_id` → product photos never render in the remito modals.
5. **List endpoint's `items[].variante` is attribute-restricted** (`['id','codigo']`) while detail's is full — the product filter in `Remitos.jsx:276-284` therefore searches `item.variante.producto.nombre` / `codigo` / `presentacion.nombre` against list data where `presentacion` is present but `producto` has no `nombre` in some paths (it does include `['id','nombre','codigo']`, so it works).
6. **`saldo_facturacion` vs `saldo`** — `allRemitos` returns `saldo_facturacion` only; `remitos-disponibles` returns **both** `saldo` and `saldo_facturacion`. `Facturacion.jsx:432-434` defensively reads `remito.saldo_facturacion ?? remito.saldo ?? 0`.
7. **`remitos` scope for non-admins** — `allRemitos` restricts to clients linked to the user via `ClienteIngenieros` plus own internal transfers (`controllers\remitos.js:17-26`); `Remitos.jsx` additionally filters by `cliente.ingenieros[].user_id` or `remito.creadoPor.id` (`L294-303`).
8. **Facturación is admin-only for writes** (`POST /stock/facturas`, `PUT /:id/anular` → `verifyRole([ADMIN])`); `Remitos.jsx` gates all billing actions with `isAdmin` (`rol === 'Administrador'` read from `localStorage.user`).
</task_result>
</task>
```

**Tool: task**

**Input:**
```json
{
  "description": "Explore Facturacion flow",
  "prompt": "Explore the \"Facturación\" / \"Facturacion\" (invoicing) feature in this React SPA at C:\\Job\\Don Asdrubal\\donAsdrubal. I need a VERY THOROUGH understanding.\n\nFind and report:\n1. All files (components, api modules, utils, css) related to Facturacion - list absolute paths.\n2. The full API layer for facturas/invoices: endpoints (list, create, update, delete, state changes), the exact request/response payload shapes (header fields + line items), how totals/importes are computed.\n3. The Facturacion UI flow step by step: is it a multi-step wizard? How does the user currently select a remito? How are products/cantities currently chosen (all at once? fixed?) How is the final invoice built and saved?\n4. How the invoice links back to remitos (remito_id? line-level remito item ids?). Are remitos marked as billed after invoicing?\n5. Any existing partial amounts / \"facturado\" tracking fields on remitos.\n6. Existing UI patterns for multi-select lists, quantity inputs, modals, tables.\n\nReport with file:line references and quote relevant code snippets (concise but complete enough to understand data structures and the flow). Do NOT modify anything.",
  "subagent_type": "explore"
}
```

**Output:**
```
<task id="ses_e0c0009fdffeV16qOReD74v8wh" state="completed">
<task_result>
I now have a complete picture. Here is the thorough report.

---

# FACTURACIÓN — Complete Analysis

**Context:** This is "Etapa 1 (simulada)" — an uncommitted work-in-progress feature. `git status` shows:
```
 M src/App.jsx
 M src/components/DashboardLayout.jsx
 M src/components/Remitos.jsx
 M src/components/Sidebar.jsx
?? src/api/facturas.js
?? src/components/Facturacion.jsx
?? src/components/ModalFactura.jsx
```
The backend lives in a sibling repo `C:\Job\Don Asdrubal\backend` (Node/Express 5 + Sequelize 6 + MariaDB). I read it too, because the "exact payload shapes" and "how totals are computed" live there.

---

## 1. All related files

### Frontend — `C:\Job\Don Asdrubal\donAsdrubal`

| Path | Role |
|---|---|
| `C:\Job\Don Asdrubal\donAsdrubal\src\api\facturas.js` | **API layer** (5 functions, 31 lines) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\Facturacion.jsx` | **Main page** (766 lines) — list + filters + pendientes panel + detail |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalFactura.jsx` | **Create-invoice modal** (385 lines) — the whole "wizard" |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\Remitos.jsx` | Integration host — badge, filter, "Facturar" button, "Ir a Facturación" |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\Sidebar.jsx` | Menu entry (lines 78–82) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\components\DashboardLayout.jsx` | Breadcrumb label `facturacion: 'Facturación'` (line 31) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\App.jsx` | Route `stock/facturacion` (lines 27, 110) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\css\page-header.css` | **Shared design system** — all `lista-*` classes (736 lines). No dedicated facturación CSS exists. |
| `C:\Job\Don Asdrubal\donAsdrubal\src\api\remitos.js` | Remitos API (used by Remitos.jsx, not by facturación directly) |
| `C:\Job\Don Asdrubal\donAsdrubal\src\api\axios.js` | Shared axios instance |
| `C:\Job\Don Asdrubal\donAsdrubal\CHANGELOG.md` | Entry line 70 describing Etapa 1 |
| `C:\Job\Don Asdrubal\donAsdrubal\informe-avance-2026-10-13_2026-11-05.md` | Lines 117–122: "Facturación — Etapa 1" as *Trabajo en curso* |

**No utils file exists for facturación.** `src/utils/` contains only `colors.js`, `formatFecha.js`, `generarPdf.js`, `handleApiError.js`, `statusMap.js` — none referenced by the facturación feature.

### Backend — `C:\Job\Don Asdrubal\backend`

| Path | Role |
|---|---|
| `src\controllers\facturas.js` | 4 endpoints (433 lines) |
| `src\services\facturacionService.js` | **Saldo/total computation** (100 lines) |
| `src\models\facturas.js` | `Facturas` model / `facturas` table |
| `src\models\remitoFacturas.js` | `RemitoFacturas` model / `remito_facturas` join table |
| `src\models\index.js` | Associations (lines 652–682) |
| `src\controllers\remitos.js` | Injects derived facturación state (lines 57–72, 695–724) |
| `src\routes\index.js` | Routes (lines 676–681) |
| `src\migrations\20261106000001-create-facturas.cjs` | Schema + `numero_activo` generated column |

---

## 2. The full API layer

### 2.1 Frontend wrapper — `src\api\facturas.js` (complete file)

```js
import instance from './axios';

export const allFacturas = async () => {
  const res = await instance.get('/stock/facturas');          // :4
  return res;
};

export const getFactura = async (id) => {
  const res = await instance.get(`/stock/facturas/${id}`);      // :9   ← DEAD CODE (unused)
  return res;
};

export const remitosDisponibles = async (clienteId, incluirNoFacturables = false) => {
  const res = await instance.get('/stock/facturas/remitos-disponibles', {  // :14
    params: {
      cliente_id: clienteId,
      ...(incluirNoFacturables ? { incluir_no_facturables: 1 } : {}),
    },
  });
  return res;
};

export const addFactura = async (factura) => {
  const res = await instance.post('/stock/facturas', factura);  // :24
  return res;
};

export const anularFactura = async (id) => {
  const res = await instance.put(`/stock/facturas/${id}/anular`); // :29
  return res;
};
```

**There is NO update (PUT) and NO delete (DELETE) endpoint for facturas.** The only lifecycle mutation is `anular` (void). `getFactura` is exported but never imported anywhere (verified by grep across `src/`).

### 2.2 Endpoints (backend `src\routes\index.js:676-681`)

```js
router.get('/stock/facturas',                          facturasController.allFacturas);
router.get('/stock/facturas/remitos-disponibles',     facturasController.remitosDisponibles);
router.get('/stock/facturas/:id',                      facturasController.getFacturaById);
router.post('/stock/facturas',                         verifyRole([ROLES.ADMIN]), facturasController.addFactura);
router.put('/stock/facturas/:id/anular',               verifyRole([ROLES.ADMIN]), facturasController.anularFactura);
```

`POST` and `PUT /anular` are **admin-only** (`verifyRole([ROLES.ADMIN])`). `GET` endpoints are scoped for non-admins to clients linked via `ClienteIngenieros` (`controllers\facturas.js:37-43, 77-80`).

> Route ordering note: `/stock/facturas/remitos-disponibles` is declared **before** `/stock/facturas/:id` (`controllers\facturas.js:145` comment: *"Debe declararse antes de /:id"*).

### 2.3 Request payload — `POST /stock/facturas`

Built in `src\components\ModalFactura.jsx:141-153`:

```js
await addFactura({
  cliente_id: Number(form.cliente_id),
  tipo: form.tipo,                       // 'FACTURA' | 'ANTICIPO'
  fecha: form.fecha,                     // 'YYYY-MM-DD'
  numero: form.numero.trim() || null,    // max 20 chars
  notas: form.notas.trim() || null,
  remitos: esFactura
    ? marcados.map((remito) => ({
        remito_id: remito.id,
        cantidad_facturada: Number(seleccion[remito.id].cantidad),
      }))
    : [],                                // ANTICIPO => empty array
});
```

Backend validation (`controllers\facturas.js:242-301`):
- `cliente_id` must be a positive safe integer
- `tipo` ∈ `['FACTURA','ANTICIPO']`
- `fecha` must match `/^\d{4}-\d{2}-\d{2}$/`
- `numero` ≤ 20 chars; unique per company among non-ANULADA (409 on conflict)
- `FACTURA` ⇒ ≥1 remito; `ANTICIPO` ⇒ must have **0** remitos
- No duplicate `remito_id` in the array
- Each remito must be `status === 'COMPLETADO'`, must **not** be an internal transfer (`destination_warehouse_id` null), must belong to `cliente_id`
- `cantidad_facturada` must be finite, > 0, and ≤ `saldo + 0.0001`

### 2.4 Response payload — factura object

`Facturas` table columns (`backend\src\models\facturas.js` + migration):

```js
{
  id: INTEGER PK,
  company_id: INTEGER (default 1),
  cliente_id: INTEGER NOT NULL,
  tipo: ENUM('FACTURA','ANTICIPO') default 'FACTURA',
  fecha: DATEONLY NOT NULL,
  numero: STRING(20) nullable,
  estado: ENUM('SIMULADA','EMITIDA','ANULADA') default 'SIMULADA',
  notas: TEXT nullable,
  created_by: INTEGER nullable,
  createdAt, updatedAt
}
```

`numero_activo` is a **generated STORED column** = `CASE WHEN estado <> 'ANULADA' THEN numero ELSE NULL END`, with `UNIQUE INDEX facturas_numero_activo_unique (company_id, numero_activo)` (`migrations\20261106000001-create-facturas.cjs:80-91`). So a voided invoice's number can be reused.

Eager-loaded shape (`controllers\facturas.js:45-68`):

```js
{
  id, company_id, cliente_id, tipo, fecha, numero, estado, notas, created_by,
  createdAt, updatedAt,
  cliente:    { id, razon_social, cuil_cuit },
  creadoPor:  { id, nombre, email },
  remitos: [                      // RemitoFacturas[] — alias 'remitos'
    {
      id, factura_id, remito_id,
      cantidad_facturada,          // DECIMAL(15,4) — LITERS
      createdAt, updatedAt,
      remito: {
        id, remito_number, status, issued_at, createdAt,
        origin_warehouse_id, destination_client_id, destination_warehouse_id
      }
    }
  ]
}
```

### 2.5 Response payload — `GET /stock/facturas/remitos-disponibles`

`controllers\facturas.js:204-227` — each remito is `remito.toJSON()` **plus** computed fields:

```js
{
  ...remito.toJSON(),              // full remito incl. items[] → variante → producto/presentacion
  total_remitido: saldo.total,
  facturado:      saldo.facturado,
  saldo:          saldo.saldo,
  saldo_facturacion: saldo.saldo,  // alias
  estado_facturacion: saldo.estado, // NO_FACTURADO | PARCIAL | FACTURADO
  facturable: remito.status === 'COMPLETADO' && saldo.total > 0 && saldo.saldo > 0,
  motivo_bloqueo: facturable ? null : motivoBloqueoFacturacion(remito, saldo),
}
```

`motivo_bloqueo` strings (`controllers\facturas.js:124-137`):
```js
PENDIENTE:     'Falta subir el remito firmado'
REVISION:      'Falta confirmar el remito'
SIN_CANTIDADES:'El remito no tiene cantidades para facturar'
SIN_SALDO:     'Sin saldo pendiente (ya facturado)'
```

### 2.6 **How totals/importes are computed** ⚠️ THE KEY FINDING

> **There are NO prices, NO importes, NO currency anywhere in this feature.** A "factura total" is a **quantity of liters (base units)**, not money. There is no `precio`, `importe`, `tarifa`, `monto`, `valor_unitario` or `unit_price` field anywhere in the codebase (verified by grep over all `src/**/*.js{,x}`).

All computation lives in `backend\src\services\facturacionService.js`:

```js
// :59-75  — total remitido = SUM of quantity_dispatched of remito_items
export const sumarTotalRemitos = async (remitoIds, { transaction } = {}) => {
  const filas = await RemitoItems.findAll({
    attributes: ['remito_id', [fn('SUM', col('quantity_dispatched')), 'total']],
    where: { remito_id: { [Op.in]: remitoIds } },
    group: ['remito_id'], raw: true, transaction,
  });
  ...
};

// :28-53 — facturado = SUM of cantidad_facturada across NON-VOID facturas only
export const sumarFacturadoPorRemito = async (remitoIds, { transaction } = {}) => {
  const filas = await RemitoFacturas.findAll({
    attributes: ['remito_id', [fn('SUM', col('cantidad_facturada')), 'total']],
    include: [{
      model: Facturas, as: 'factura', attributes: [],
      where: { estado: { [Op.ne]: 'ANULADA' } }, required: true,
    }],
    where: { remito_id: { [Op.in]: remitoIds } },
    group: ['remito_id'], raw: true, transaction,
  });
  ...
};

// :81-99 — the master function
export const calcularSaldosFacturacion = async (remitoIds, { transaction } = {}) => {
  const ids = Array.isArray(remitoIds) ? [...new Set(remitoIds)] : [];
  const [totales, facturados] = await Promise.all([
    sumarTotalRemitos(ids, { transaction }),
    sumarFacturadoPorRemito(ids, { transaction }),
  ]);
  const saldos = {};
  for (const id of ids) {
    const total = totales[id] || 0;
    const facturado = facturados[id] || 0;
    saldos[id] = {
      total, facturado,
      saldo: Math.max(total - facturado, 0),
      estado: calcularEstadoFacturacion(total, facturado),
    };
  }
  return saldos;
};
```

Derived estado (`facturacionService.js:15-21`):
```js
export const calcularEstadoFacturacion = (total, facturado) => {
  const totalNum = parseFloat(total) || 0;
  const facturadoNum = parseFloat(facturado) || 0;
  if (facturadoNum <= 0) return 'NO_FACTURADO';
  if (facturadoNum >= totalNum) return 'FACTURADO';
  return 'PARCIAL';
};
```

**Frontend "total" of an invoice** (`src\components\Facturacion.jsx:140-144`):
```js
const totalFacturado = (factura) =>
  (factura.remitos || []).reduce(
    (acc, item) => acc + parseFloat(item.cantidad_facturada || 0),
    0,
  );
```
Displayed as `"289.50 (en 3 remitos)"` — i.e. **liters**, labelled "Total facturado".

---

## 3. The Facturación UI flow, step by step

### Is it a multi-step wizard?

**No.** It is a single-page list + a single Bootstrap modal (`ModalFactura`, `size="lg"`) containing one form with a header row and one remito-selection table. There is no step state, no `step` variable, no progress indicator, no per-step validation.

The closest thing to a wizard is the *implicit* dependency chain: pick client → remitos load → check remitos → type quantities → submit.

### 3.1 Page load — `Facturacion.jsx:96-110`

```js
const [facturasRes, clientesRes] = await Promise.all([
  allFacturas(),
  allCliente(),
]);
setFacturas(facturasRes.data);
setClientes(clientesRes.data);
```

### 3.2 Deep-link entry — `Facturacion.jsx:65-94`

```js
const [searchParams] = useSearchParams();
const clienteParam = searchParams.get('cliente') || '';
const fechaParam   = searchParams.get('fecha')   || '';
...
useEffect(() => {
  if (clienteParam) setFiltroCliente(clienteParam);
  if (fechaParam)   setFechaInicial(fechaParam);
}, [clienteParam, fechaParam]);
```

Reached from `Remitos.jsx:662-670`:
```js
onClick={() =>
  navigate(`/stock/facturacion?cliente=${remitoSeleccionado.destination_client_id}&fecha=${fechaHoy()}`)
}
```
> ⚠️ **Gap:** `fechaInicial` has **no visible UI control** on the Facturación page. It's only settable via the `?fecha=` query param, otherwise it defaults to today (`Facturacion.jsx:48-53, 74`). It's only surfaced in the subtitle text (line 473) and passed into the modal as `fechaInicial` (line 754).

### 3.3 "Remitos pendientes de facturar" panel — `Facturacion.jsx:114-138, 357-459`

Selecting a client in the filter triggers:
```js
const res = await remitosDisponibles(filtroCliente, true);   // :124  incluir_no_facturables=1
if (!cancelado) setRemitosPendientes(res.data || []);
```

The `true` flag is deliberate (comment at :112-113): *"incluidos los que todavía no son facturables (para poder ver por qué quedan pendientes)"*.

Table columns (`:396-406`):
```
N° Remito | Fecha | Estado | Total | Facturado | Saldo | Facturación | Acción
```
- `Total` → `remito.total_remitido`
- `Facturado` → `remito.facturado`
- `Saldo` → `remito.saldo_facturacion ?? remito.saldo ?? 0`
- `Facturación` → badge from `remito.estado_facturacion`
- `Acción` → if `remito.facturable && isAdmin` → **"Facturar"** button; else shows `remito.motivo_bloqueo || '—'` (`:438-450`)

A "Ver también los facturados" checkbox (`:364-373`) toggles whether `FACTURADO` remitos are shown (`:170-177`).

### 3.4 Opening the modal — `Facturacion.jsx:250-256`

```js
const abrirFactura = (remito = null) => {
  setModalFactura({
    remito,
    clienteId: remito?.destination_client_id || filtroCliente,
    fecha: fechaInicial,
  });
};
```
Two entry points:
- Per-row **"Facturar"** → `abrirFactura(remito)` (remito preselected)
- Header **"Nueva Factura"** (admin only, `:482-487`) → `abrirFactura()` (client = current filter, no remito)

### 3.5 Inside `ModalFactura.jsx`

**Header form** (`:22-30`, rendered `:172-238`) — one `Row` of 5 `Col`s:

| Field | Col | Type | Notes |
|---|---|---|---|
| `cliente_id` | md=4 | `Form.Select` | required; from `clientes` prop |
| `tipo` | md=2 | `Form.Select` | `FACTURA` / `ANTICIPO` |
| `fecha` | md=2 | `Form.Control type="date"` | required |
| `numero` | md=2 | `Form.Control type="text"` | `maxLength={20}`, optional |
| `notas` | md=2 | `Form.Control type="text"` | optional |

**Remito list load** (`:38-78`):
```js
useEffect(() => {
  if (form.tipo !== 'FACTURA' || !form.cliente_id) {
    setDisponibles([]); setSeleccion({}); return undefined;
  }
  ...
  const res = await remitosDisponibles(form.cliente_id);   // :49 — NO incluir_no_facturables
  const lista = res.data || [];
  const inicial = remitoInicialRef.current;
  const nuevaSeleccion = {};
  for (const remito of lista) {
    const premarcado = Boolean(inicial && inicial.id === remito.id);
    nuevaSeleccion[remito.id] = {
      marcado: premarcado,
      cantidad: Number(remito.saldo) || 0,
    };
  }
  setDisponibles(lista);
  setSeleccion(nuevaSeleccion);
}, [form.cliente_id, form.tipo]);
```

Key points:
- Without `incluir_no_facturables`, the backend filters to `facturable === true` only (`controllers\facturas.js:225`). So **the modal only lists facturable remitos**.
- `remitoInicialRef` is captured once via `useRef` (`:20`) so the premark survives re-fetches.
- Every remito's `cantidad` is pre-seeded to its **full `saldo`** — even unmarked ones.

**Selection state shape** (`:33-34`):
```js
// { [remito_id]: { marcado, cantidad } }
const [seleccion, setSeleccion] = useState({});
```

**Checkbox toggle resets quantity to full saldo** (`:89-97`):
```js
const toggleRemito = (remito) => {
  setSeleccion((prev) => ({
    ...prev,
    [remito.id]: {
      marcado: !prev[remito.id]?.marcado,
      cantidad: Number(remito.saldo) || 0,   // ← always full saldo
    },
  }));
};
```

**Quantity change** (`:99-107`):
```js
const cambiarCantidad = (remito, valor) => {
  setSeleccion((prev) => ({
    ...prev,
    [remito.id]: { ...prev[remito.id], cantidad: valor },
  }));
};
```

**Totals** (`:82-87`):
```js
const marcados = disponibles.filter((r) => seleccion[r.id]?.marcado);
const totalAFacturar = marcados.reduce(
  (sum, r) => sum + (Number(seleccion[r.id]?.cantidad) || 0), 0,
);
```

**Validation** (`:109-134`):
```js
if (esFactura) {
  if (marcados.length === 0) newErrors.remitos = 'Seleccione al menos un remito para facturar';
  marcados.forEach((remito) => {
    const cantidad = Number(seleccion[remito.id]?.cantidad);
    const saldo = Number(remito.saldo) || 0;
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      newErrors[`remito_${remito.id}`] = 'Cantidad debe ser mayor a 0';
    } else if (cantidad > saldo + 0.0001) {
      newErrors[`remito_${remito.id}`] = `Máximo: ${saldo.toFixed(2)}`;
    }
  });
}
```

**Remito table in the modal** (`:264-345`) — columns:
```
[✓] | Remito | Fecha | Total | Ya facturado | Saldo | A facturar
```
The "A facturar" cell (`:314-338`):
```jsx
<Form.Control
  type="number" size="sm" step="0.01" min="0.01" max={remito.saldo}
  disabled={!sel.marcado}
  value={sel.cantidad ?? ''}
  onChange={(e) => cambiarCantidad(remito,
    e.target.value === '' ? '' : parseFloat(e.target.value))}
  isInvalid={!!errors[`remito_${remito.id}`]}
/>
```

**Submit** (`:136-163`) → `addFactura(...)` → `onSave()` → parent reloads (`Facturacion.jsx:756-759`):
```js
onSave={async () => { setModalFactura(null); await cargarDatos(); }}
```

### 3.6 How products/cantities are chosen today

**Answer: NOT per product. Only per remito, and the quantity is a single scalar in liters.**

- The modal never lists products. There is no `producto`/`variante` column, no line items.
- Each remito's `items[]` (product variants with `quantity_dispatched`) is aggregated server-side into `total_remitido`.
- The user picks a **number** for the whole remito (liters), capped at the remito's `saldo`.
- Default is **100 % of the remito** (`cantidad: Number(remito.saldo) || 0`).
- Therefore **partial invoicing is at remito granularity only** — you cannot bill e.g. 100 L of product A and 50 L of product B out of a remito that contains 300 L of A and 200 L of B.
- `ANTICIPO` type completely hides the remito section (`:240` `esFactura &&`, `:361-366` explanatory text).

### 3.7 List view + detail (desktop / mobile)

- Desktop table (`Facturacion.jsx:648-736`): `N° Factura | Tipo | Cliente | Fecha | Remitos | Total | Estado | Acciones`, row click selects.
- Mobile cards (`:588-647`) via `useIsMobile()`.
- Detail panel `renderDetalle()` (`:258-355`): `lista-kv` definition list (Cliente / Fecha / Total facturado / Notas / Creada + `creadoPor`) + `lista-items` table of remitos (`Remito | Fecha | Cantidad facturada`) + tfoot Total + "Anular factura" button (admin, only if `estado !== 'ANULADA'`).
- Filters (`:546-584`): `N° Factura` search (accent-insensitive via `normalizar`, `:55-62`), `Cliente` select, `Limpiar filtros`.
- Pills (`:496-543`): by `tipo` (Todos/Facturas/Anticipos) and by `estado` (Todos/Simulada/Emitida/Anulada) with live counts.

### 3.8 Anular (void)

`Facturacion.jsx:207-224`:
```js
const confirmMessage = factura.tipo === 'ANTICIPO'
  ? '¿Está seguro de anular este anticipo?'
  : `¿Está seguro de anular la factura ${factura.numero || `#${factura.id}`}? Los remitos asociados liberarán su saldo pendiente.`;
if (!window.confirm(confirmMessage)) return;
await anularFactura(factura.id);
await cargarDatos();
```
Backend (`controllers\facturas.js:399-433`): sets `estado='ANULADA'`; refuses if already ANULADA (400) or EMITIDA (400). The `remito_facturas` rows **remain** but stop counting toward saldos (because `sumarFacturadoPorRemito` filters `estado != 'ANULADA'`).

---

## 4. How the invoice links back to remitos

### Join table `remito_facturas` (`backend\src\models\remitoFacturas.js` + migration :129-171)

```js
{
  id: INTEGER PK,
  factura_id: INTEGER NOT NULL,   // FK → facturas  ON DELETE CASCADE
  remito_id:  INTEGER NOT NULL,   // FK → remitos   ON DELETE RESTRICT
  cantidad_facturada: DECIMAL(15,4) NOT NULL,   // "en unidades base (litros). Permite facturación parcial: <= total del remito."
  createdAt, updatedAt
}
```
Indexes: `UNIQUE (factura_id, remito_id)` (`remito_facturas_unico`) and `INDEX (remito_id)`.

### Answers

- **Link granularity = REMITO, not remito line item.** The payload is `{ remito_id, cantidad_facturada }` (`ModalFactura.jsx:148-151`). There is **no `remito_item_id`** anywhere — `remito_items` IDs are never referenced by the facturación feature. The backend even *deliberately strips* item-level data when returning a remito for facturación: `attributes: ['id', 'product_variant_id', 'quantity_dispatched']` (`controllers\facturas.js:177`).
- **N:1 both ways.** One factura → N remitos; one remito → N facturas (partial invoicing spread across invoices). Associations at `backend\src\models\index.js:664-682`:
  ```js
  Facturas.hasMany(RemitoFacturas, { foreignKey: 'factura_id', as: 'remitos' });
  Remitos.hasMany(RemitoFacturas,  { foreignKey: 'remito_id',  as: 'facturaciones' });
  ```
- **Remitos are NOT "marked as billed" with a boolean/status column.** There is no `facturado` flag on the `remitos` table. Billing status is **derived at read time** by `calcularSaldosFacturacion`. Remitos.jsx:586-614 renders the reverse link — the `facturaciones` include (`controllers\remitos.js:695-709`) — showing each invoice that touched the remito:
  ```jsx
  {remitoDetalle.facturaciones.map((fact) => (
    <tr key={fact.id}>
      <td>{fact.factura?.numero || `#${fact.factura_id}`}
        <span className="lista-badge lista-badge--neutral ms-2">
          {fact.factura?.tipo === 'ANTICIPO' ? 'Anticipo' : 'Factura'}
        </span>
      </td>
      <td>{formatDate(fact.factura?.fecha)}</td>
      <td className="text-end lista-items__cantidad">
        {parseFloat(fact.cantidad_facturada || 0).toFixed(2)}
      </td>
    </tr>
  ))}
  ```

---

## 5. Existing partial-amount / "facturado" tracking

### 5.1 Storage
Only one persisted partial-amount column exists: **`remito_facturas.cantidad_facturada`** (DECIMAL 15,4). Everything else is computed.

### 5.2 Derived fields injected onto remito responses

Backend `controllers\remitos.js:57-72` (`allRemitos`) and `:714-724` (`getRemitoById`):
```js
const saldos = await calcularSaldosFacturacion(remitos.map((r) => r.id));
for (const remito of remitos) {
  const saldo = saldos[remito.id] || { total: 0, facturado: 0, saldo: 0, estado: 'NO_FACTURADO' };
  remito.dataValues.total_remitido     = saldo.total;
  remito.dataValues.facturado          = saldo.facturado;
  remito.dataValues.saldo_facturacion  = saldo.saldo;
  remito.dataValues.estado_facturacion = saldo.estado;
}
```
And in `controllers\facturas.js:214-223` the same values are spread onto the remito plus the `saldo` alias, `facturable` and `motivo_bloqueo`.

### 5.3 Frontend consumers

| Location | Usage |
|---|---|
| `src\components\Facturacion.jsx:426-436` | Total / Facturado / Saldo columns + badge |
| `src\components\Facturacion.jsx:170-177` | "Ver también los facturados" filter |
| `src\components\Facturacion.jsx:235-248` | `renderBadgeFacturacion` |
| `src\components\ModalFactura.jsx:305-313` | Total / Ya facturado / Saldo columns |
| `src\components\Remitos.jsx:305-309` | `filtroFacturacion` filter (NO_FACTURADO / PARCIAL / FACTURADO) |
| `src\components\Remitos.jsx:383-387` | `puedeFacturarRemito()` gate |
| `src\components\Remitos.jsx:567-584` | `lista-note` "Facturación: X de Y (badge)" |
| `src\components\Remitos.jsx:1193-1199`, `1231-1235` | Facturación badge in list/detail |

### 5.4 Colour/label maps (duplicated in two files)

`Facturacion.jsx:24-34` and `Remitos.jsx:45-55` (identical):
```js
const FACTURACION_COLORS = {
  NO_FACTURADO: '#6c757d',   // Sin facturar
  PARCIAL:      '#EF9F27',   // Parcial
  FACTURADO:    '#146c43',   // Facturado
};
const FACTURACION_LABELS = {
  NO_FACTURADO: 'Sin facturar',
  PARCIAL: 'Parcial',
  FACTURADO: 'Facturado',
};
```
> Note: these are **duplicated constants**, not in `src\utils\colors.js`.

### 5.5 Remito status vs. facturación status (independent axes)

`remito.status`: `PENDIENTE → REVISION → COMPLETADO | ANULADO` (remitos lifecycle).
`remito.estado_facturacion`: `NO_FACTURADO | PARCIAL | FACTURADO` (billing coverage).
A remito must be `COMPLETADO` to be billable (`controllers\facturas.js:212-213, 321-323`).

---

## 6. Existing UI patterns to reuse

### 6.1 Multi-select list

**(a) Checkbox + per-row quantity table** — exactly what `ModalFactura` uses (`ModalFactura.jsx:264-345`). This is the *only* existing checkbox-multi-select in the codebase.

**(b) "Carrito" pattern (pick-from-grid, then edit a table)** — used by:
- `ModalRemitoCatalogo.jsx:41-78` (`agregarAlCarrito` / `actualizarCantidad` / `quitarDelCarrito`) — grid of product cards grouped by ranking (Favoritos / Otros / Sin clasificar) + a `carrito` table with a `type="number"` input and a trash button.
- `ModalRemitoInterno.jsx:101-140` — same idea with a `react-select` search + card grid + detail table.

**(c) `react-select` searchable picker** — `ModalRemitoInterno.jsx:270-295`:
```jsx
<Select
  classNamePrefix="react-select"
  placeholder="Escribí el nombre, presentación o código"
  options={opcionesProductos}
  value={opcionesProductos.find((o) => o.value === productoId) || null}
  styles={{ menu: (base) => ({ ...base, zIndex: 1060 }) }}
  inputValue={busqueda}
  onInputChange={...}
  onChange={...}
  isClearable
/>
```

### 6.2 Quantity input (the canonical pattern)

`ModalRemitoCatalogo.jsx:302-313`:
```jsx
<Form.Control
  type="number" size="sm" step="0.01" min="0"
  max={item.stock_en_presentacion}
  value={item.quantity_requested}
  onChange={(e) => actualizarCantidad(i, parseFloat(e.target.value) || 0)}
  isInvalid={!!errors[`item_${i}_qty`]}
/>
```
`ModalFactura.jsx:314-338` is the same but with `min="0.01"`, `disabled={!sel.marcado}` and an explicit `invalid-feedback d-block` block below the input.

### 6.3 Modal pattern (react-bootstrap)

`ModalRemitoCatalogo.jsx:137-341` / `ModalFactura.jsx:166-381`:
```jsx
<Modal show onHide={onClose} centered size="lg">   {/* size="xl" for wide ones */}
  <Modal.Header closeButton><Modal.Title>...</Modal.Title></Modal.Header>
  <Form onSubmit={handleSubmit}>
    <Modal.Body>...</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onClose}>Cancelar</Button>
      <Button type="submit" variant="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Creando...' : 'Crear Factura'}
      </Button>
    </Modal.Footer>
  </Form>
</Modal>
```
`ModalRemitoInterno.jsx:199` adds `backdrop={isSubmitting ? 'static' : true}` and disables the close button while submitting.

Error surfacing is **inconsistent** across the codebase — `ModalFactura` uses `window.alert(error.response?.data?.message)` (`:155-159`), while `ModalRemitoInterno` uses an inline `<Alert variant="danger" dismissible>` (`:210`).

### 6.4 Table patterns

**Page-level list** (`lista-*` design system, `src\css\page-header.css`):
```jsx
<div className="lista-scroll">            {/* max-height: 30vh; overflow: auto */}
  <table className="lista-table">          {/* sticky thead, 0.85rem, --lista-th bg */}
    <thead><tr><th className="text-end">…</th></tr></thead>
    <tbody>
      <tr className="lista-table__row lista-table__row--selected"
          style={{ '--lista-status': ESTADO_COLORS[factura.estado] }}>
```
Selected-row highlight uses a CSS custom property `box-shadow: inset 3px 0 0 var(--lista-status)` (`page-header.css:370-374`).

**Detail sub-table** — `.lista-items` (`page-header.css:544-587`), with `tfoot` for totals and `.lista-items__cantidad` for the right-aligned bold quantity.

**Inside modals** — plain Bootstrap: `<table className="table table-sm table-hover align-middle">` wrapped in `<div className="table-responsive">`.

**Mobile** — the `isMobile ? <cards> : <table>` fork, e.g. `Facturacion.jsx:588` / `Remitos.jsx`. Cards use `.lista-card` with a `--lista-status` left border.

**"Detalle" panel below the list** — `Facturacion.jsx:738-746` / `Compras.jsx:543-562` / `Remitos.jsx:1212-1258`: `.lista-box` → `.lista-box__header` (`.lista-box__title` + badges + `.lista-cerrar`) → `.lista-box__body` → `.lista-box__acciones`.

### 6.5 Role gating

Consistent idiom across the codebase (e.g. `Facturacion.jsx:83-84`, `Remitos.jsx:112`):
```js
const isAdmin = JSON.parse(localStorage.getItem('user'))?.rol === 'Administrador';
```

### 6.6 Other reusable pieces
- `Spinner` (`src\components\Spinner.jsx`) — used for both page-level and in-panel loading.
- `src\hooks\useIsMobile.js` — responsive fork.
- Accent-insensitive search: `normalizar()` — duplicated in `Facturacion.jsx:55-62`, `Remitos.jsx:65-72` (and `ModalRemitoInterno.jsx:6-11` uses a `.replace()` variant).

---

## 7. Notable observations / gaps

1. **No prices.** "Facturar" currently means "mark liters as billed". Formal invoicing (Etapa 2, `estado: 'EMITIDA'`) is explicitly planned but unimplemented — see the comment at `backend\src\controllers\facturas.js:18-23`:
   > *"en esta etapa las facturas son 'simuladas' … La etapa futura de facturación real agrega columnas de comprobante a la misma tabla sin tocar remito_facturas."*

2. **No line-item granularity.** Invoice ↔ remito is 1 remito = 1 scalar quantity. Product-level partial billing is impossible with the current schema.

3. **`getFactura` is dead code** (`src\api\facturas.js:8-11`) — exported, never imported.

4. **No update/edit endpoint.** Only create + list + detail + void.

5. **`fechaInicial` has no UI control** on the Facturación page — invoice date is only reachable via `?fecha=` URL param (default today).

6. **Latent bug in `src\api\axios.js:102`**: `isLoginRequest` is referenced but **never defined** in the file (only `isLoginOrVerifyRequest` at :98 is computed). Any 401 response will throw `ReferenceError: isLoginRequest is not defined` inside the interceptor instead of redirecting. AGENTS.md warns about `isLoginRequest`, but the current file has lost that binding.

7. **Duplicated constants**: `FACTURACION_COLORS` / `FACTURACION_LABELS` / `normalizar()` exist in both `Facturacion.jsx` and `Remitos.jsx`.

8. **No dedicated CSS file** for facturación — everything borrows `src\css\page-header.css`. `src\css\compras.css:2` mentions *"MODAL COMPRAS — Diseño tipo factura comercial"*, but `ModalFactura` does **not** use `compras.css`; it uses raw Bootstrap tables.

9. **Anti-pattern check**: `ModalFactura.jsx:289-293` — `<Form.Check type="checkbox">` inside a table cell, and `ModalFactura.jsx:331-337` uses `isInvalid` + a separate `invalid-feedback d-block` div (not Bootstrap's `Form.Control.Feedback`), because a `Form.Control` inside a table can't easily host the feedback element.

10. **Data flow on save**: `ModalFactura` calls `onSave()` (no args); the parent (`Facturacion.jsx:756-759`) closes the modal and calls `cargarDatos()` which re-fetches `allFacturas()` + `allCliente()` — but **does not** re-fetch `remitosPendientes`. The pendientes panel only refreshes when `filtroCliente` changes (effect dependency `[filtroCliente]`, `Facturacion.jsx:138`). So after creating a facture from the Facturación page, the "Remitos pendientes" table shows **stale** data until the client filter is re-selected.
</task_result>
</task>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 6.4s)

_Thinking:_

Now I have a very thorough understanding. Let me look at the key files myself to confirm critical details, particularly the backend schemas since the plan will need backend changes.

Key findings:
- Backend exists at `C:\Job\Don Asdrubal\backend` (sibling repo) - Node/Express + Sequelize + MariaDB
- Frontend: `remito_facturas` join table with `cantidad_facturada` in liters
- No prices anywhere - "billing amount" = liters
- Partial invoicing is per-remito granularity only (scalar liters)

The user's request:
1. **Partial invoicing at product/item level**: When selecting a remito for invoicing, allow selecting which products and quantities to bill (e.g. 20 units of product A, 150 liters of product C from a remito with A=100u, B=50u, C=350L).
2. **Pre-invoice / quote / reservation**: From Remitos, select multiple remitos, build a "cotización" or pre-factura with a target amount (e.g. 25000 USD), leave it in a "reserved" state so another person doesn't bill those remitos individually.

Important open questions:
- The "25000 dlls" — the system has NO prices. So how does one compute a monetary total? This is a huge gap. The user says "el total de esto seria 25000 dlls". Do they have prices somewhere? Let me check the backend for any pricing/producto model with `precio`.
- Also note: the user's mention of "20 unidades del producto A" vs "150 litros producto C" — units differ. The remito items store `quantity_requested` (in presentation units) and `quantity_dispatched` (base units, liters). So partial billing at item level needs care about which unit to bill.

Let me check the backend for pricing models, and check whether there's a "producto" table with price. Let me search.

Also need to check: does the repo `C:\Job\Don Asdrubal\backend` actually exist and is it part of the workspace? The working directory is `C:\Job\Don Asdrubal\donAsdrubal`. The backend is a sibling repo. AGENTS.md says "Solo frontend". So the plan will need to touch the backend too — that's an important scoping question for the user.

Let me do some targeted searches in the backend for prices/precios, and read key files.

Let me also verify the frontend files mentioned so my plan references the right lines.

Let me run several parallel searches.

Excellent context. Now let me verify key details myself — especially around pricing (the "25000 dlls" figure) and the backend repo scope.

**Tool: bash**

**Input:**
```json
{
  "command": "Test-Path \"C:\\Job\\Don Asdrubal\\backend\"; Get-ChildItem \"C:\\Job\\Don Asdrubal\" -Directory | Select-Object -ExpandProperty Name"
}
```

**Output:**
```
True
backend
backend.worktrees
donAsdrubal
Informes

```

**Tool: bash**

**Input:**
```json
{
  "command": "git -C \"C:\\Job\\Don Asdrubal\\donAsdrubal\" status --short; git -C \"C:\\Job\\Don Asdrubal\\donAsdrubal\" branch --show-current; git -C \"C:\\Job\\Don Asdrubal\\donAsdrubal\" log --oneline -5"
}
```

**Output:**
```
 M src/App.jsx
 M src/components/DashboardLayout.jsx
 M src/components/Remitos.jsx
 M src/components/Sidebar.jsx
?? src/api/facturas.js
?? src/components/Facturacion.jsx
?? src/components/ModalFactura.jsx
main
4c6d54f Merge pull request #135 from GonzaLenardon/detallescompra
5297007 se aplica estilos a Compras
c029e4e Merge pull request #134 from GonzaLenardon/mov-depositos
1cbe62f mod-boton-mov-depositos
2300e59 nods-modal-mov-depositos

```

---

## Assistant (Plan · MiniMax M3.1 Flash · 356.3s)

_Thinking:_

Let me look for pricing in the backend - are there product prices anywhere? The user mentioned "25000 dlls".

**Tool: bash**

**Input:**
```json
{
  "command": "git -C \"C:\\Job\\Don Asdrubal\\backend\" branch --show-current; git -C \"C:\\Job\\Don Asdrubal\\backend\" status --short | Select-Object -First 30"
}
```

**Output:**
```
main
 M src/controllers/remitos.js
 M src/models/index.js
 M src/routes/index.js
?? src/controllers/facturas.js
?? src/migrations/20261106000001-create-facturas.cjs
?? src/models/facturas.js
?? src/models/remitoFacturas.js
?? src/services/facturacionService.js

```

**Tool: grep**

**Input:**
```json
{
  "pattern": "precio|precio_unitario|unit_price|valor_unitario|tarifa|importe|costo_unitario",
  "path": "C:\\Job\\Don Asdrubal\\backend\\src",
  "include": "*.js"
}
```

**Output:**
```
Found 3 matches
C:\Job\Don Asdrubal\backend\src\scripts\importClientesFromCsv.js:
  Line 61:     let importedCount = 0;

  Line 209:         importedCount += 1;

  Line 213:     console.log(`\nImportación finalizada: ${importedCount} clientes importados, ${skippedCount} filas omitidas.`);

```

---

## Assistant (Plan · MiniMax M3.1 Flash · 7.6s)

_Thinking:_

Confirmed: **no pricing anywhere in the backend**. The "25000 dlls" concept has no representation in the data model.

This is a critical gap. The user's scenario: "Un cliente tiene 10 remitos pendientes de facturar y me dice que tiene 25000 dlls para que le facture algunos de estos remitos entonces selecciono remito3, remito9 y remito8 y el total de esto seria 25000 dlls."

So the user wants a monetary amount. But currently the system works in liters. Options:
1. Add prices to products/variants → then compute monetary totals.
2. Treat "importe" as a manual/user-entered value at the invoice level (the customer says "I have 25000 USD, bill me up to that").

Let me check the product / product_variants / presentacion models to see what's there, and whether there's any "unidad_base" concept.

Also check the compras module in the frontend — maybe there's pricing there that could be a reference for how prices are handled in the system.

Let me search for existing price-like fields across the whole backend models

**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem \"C:\\Job\\Don Asdrubal\\backend\\src\\models\" -Filter *.js | Select-Object -ExpandProperty Name"
}
```

**Output:**
```
alertas.js
auditLogs.js
calibraciones.js
ciudades.js
clienteInvitaciones.js
clientes.js
clientesIngenieros.js
facturas.js
index.js
jornada.js
maquinas.js
maquina_tipo.js
muestra_agua.js
notas.js
paises.js
permissions.js
pozo.js
productLots.js
productPresentations.js
products.js
productVariants.js
providers.js
provincias.js
purchaseItemDestinations.js
purchaseItemLots.js
purchaseItems.js
purchases.js
remitoArchivos.js
remitoFacturas.js
remitoItemLots.js
remitoItems.js
remitos.js
roles.js
role_permissions.js
rubros.js
stockMovements.js
subrubros.js
tipoClientes.js
tiposServicios.js
users.js
user_roles.js
warehouses.js
warehouseStock.js

```

**Tool: grep**

**Input:**
```json
{
  "include": "*.js",
  "path": "C:\\Job\\Don Asdrubal\\backend\\src\\models",
  "pattern": "DECIMAL|FLOAT|DOUBLE"
}
```

**Output:**
```
Found 23 matches
C:\Job\Don Asdrubal\backend\src\models\calibraciones.js:
  Line 118:     // 👇 CAMBIO: de FLOAT a JSON para soportar { valor, nombreArchivo }


C:\Job\Don Asdrubal\backend\src\models\clientes.js:
  Line 103:       type: DataTypes.FLOAT,


C:\Job\Don Asdrubal\backend\src\models\pozo.js:
  Line 22:       type: DataTypes.DECIMAL(10, 8), // de -90.00000000 a 90.00000000

  Line 26:       type: DataTypes.DECIMAL(11, 8), // de -180.00000000 a 180.00000000


C:\Job\Don Asdrubal\backend\src\models\muestra_agua.js:
  Line 14:       type: DataTypes.FLOAT,

  Line 18:       type: DataTypes.FLOAT,

  Line 22:       type: DataTypes.FLOAT,

  Line 26:       type: DataTypes.FLOAT,

  Line 30:       type: DataTypes.FLOAT,

  Line 34:       type: DataTypes.FLOAT,


C:\Job\Don Asdrubal\backend\src\models\maquinas.js:
  Line 19:       type: DataTypes.FLOAT,

  Line 24:       type: DataTypes.DECIMAL(5, 2),


C:\Job\Don Asdrubal\backend\src\models\productPresentations.js:
  Line 22:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\purchaseItems.js:
  Line 22:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\productLots.js:
  Line 30:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\purchaseItemDestinations.js:
  Line 22:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\purchaseItemLots.js:
  Line 22:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\remitoFacturas.js:
  Line 27:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\remitoItemLots.js:
  Line 22:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\remitoItems.js:
  Line 22:       type: DataTypes.DECIMAL(15, 4),

  Line 26:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\stockMovements.js:
  Line 31:       type: DataTypes.DECIMAL(15, 4),


C:\Job\Don Asdrubal\backend\src\models\warehouseStock.js:
  Line 22:       type: DataTypes.DECIMAL(15, 4),

```

_Thinking:_

.

---

## Assistant (Plan · MiniMax M3.1 Flash · 4.4s)

_Thinking:_

Confirmed: absolutely no monetary fields anywhere in the models. The `purchases` model has no price either. So the whole system is quantity-based (liters).

This is the crux of the analysis. The user's "25000 dlls" scenario requires a monetary concept that doesn't exist.

Let me read the key backend files to fully understand the data model, and check the frontend files too.

Let me read:
- backend/src/models/remitoItems.js, remitoFacturas.js, facturas.js, productVariants.js, productPresentations.js, products.js
- backend/src/controllers/facturas.js
- backend/src/services/facturacionService.js
- backend/src/migrations/20261106000001-create-facturas.cjs

And the frontend files: ModalFactura.jsx, Facturacion.jsx.

Let me read the crucial

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\controllers\\facturas.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\controllers\facturas.js</path>
<type>file</type>
<content>
1: import { Op } from 'sequelize';
2: import {
3:   Facturas,
4:   RemitoFacturas,
5:   Remitos,
6:   RemitoItems,
7:   ProductVariants,
8:   Products,
9:   ProductPresentations,
10:   Clientes,
11:   Users,
12:   ClienteIngenieros,
13: } from '../models/index.js';
14: import { ROLES } from '../config/constants/roles.js';
15: import db from '../config/database.js';
16: import { calcularSaldosFacturacion } from '../services/facturacionService.js';
17: 
18: // ============================================================================
19: // FACTURACIÓN — en esta etapa las facturas son "simuladas": sirven para marcar
20: // remitos como facturados (total o parcialmente) y para registrar anticipos
21: // sin remitos. La etapa futura de facturación real agrega columnas de
22: // comprobante a la misma tabla sin tocar remito_facturas.
23: // ============================================================================
24: 
25: const TIPOS_VALIDOS = ['FACTURA', 'ANTICIPO'];
26: const ESTADOS_NO_ANULADOS = { [Op.ne]: 'ANULADA' };
27: 
28: const fallo = (status, message) => {
29:   const error = new Error(message);
30:   error.status = status;
31:   return error;
32: };
33: 
34: const esAdmin = (req) => req.user?.rol === ROLES.ADMIN;
35: 
36: /** Clientes vinculados al usuario (mismo scoping que allRemitos). */
37: const clientesDelUsuario = async (userId) => {
38:   const vinculos = await ClienteIngenieros.findAll({
39:     where: { user_id: userId },
40:     attributes: ['cliente_id'],
41:   });
42:   return vinculos.map((v) => v.cliente_id);
43: };
44: 
45: const incluirClienteYRemitos = [
46:   { model: Clientes, as: 'cliente', attributes: ['id', 'razon_social', 'cuil_cuit'] },
47:   { model: Users, as: 'creadoPor', attributes: ['id', 'nombre', 'email'] },
48:   {
49:     model: RemitoFacturas,
50:     as: 'remitos',
51:     include: [
52:       {
53:         model: Remitos,
54:         as: 'remito',
55:         attributes: [
56:           'id',
57:           'remito_number',
58:           'status',
59:           'issued_at',
60:           'createdAt',
61:           'origin_warehouse_id',
62:           'destination_client_id',
63:           'destination_warehouse_id',
64:         ],
65:       },
66:     ],
67:   },
68: ];
69: 
70: // ----------------------------------------------------------------------------
71: // GET /stock/facturas
72: // ----------------------------------------------------------------------------
73: export const allFacturas = async (req, res) => {
74:   try {
75:     const where = {};
76: 
77:     if (!esAdmin(req)) {
78:       const clientes = await clientesDelUsuario(req.user.id);
79:       where.cliente_id = { [Op.in]: clientes };
80:     }
81: 
82:     const facturas = await Facturas.findAll({
83:       where,
84:       include: incluirClienteYRemitos,
85:       order: [['createdAt', 'DESC']],
86:     });
87: 
88:     res.json(facturas);
89:   } catch (error) {
90:     res.status(500).json({ message: error.message });
91:   }
92: };
93: 
94: // ----------------------------------------------------------------------------
95: // GET /stock/facturas/:id
96: // ----------------------------------------------------------------------------
97: export const getFacturaById = async (req, res) => {
98:   try {
99:     const factura = await Facturas.findByPk(req.params.id, {
100:       include: incluirClienteYRemitos,
101:     });
102: 
103:     if (!factura) {
104:       return res.status(404).json({ message: 'Factura no encontrada' });
105:     }
106: 
107:     if (!esAdmin(req)) {
108:       const clientes = await clientesDelUsuario(req.user.id);
109:       if (!clientes.includes(factura.cliente_id)) {
110:         return res.status(403).json({ message: 'No tiene acceso a esta factura' });
111:       }
112:     }
113: 
114:     res.json(factura);
115:   } catch (error) {
116:     res.status(500).json({ message: error.message });
117:   }
118: };
119: 
120: // ----------------------------------------------------------------------------
121: // Motivo por el que un remito no puede facturarse todavía.
122: // Sirve para explicar en la UI por qué un remito pendiente no es facturable.
123: // ----------------------------------------------------------------------------
124: const MOTIVO_BLOQUEO = {
125:   PENDIENTE: 'Falta subir el remito firmado',
126:   REVISION: 'Falta confirmar el remito',
127:   SIN_CANTIDADES: 'El remito no tiene cantidades para facturar',
128:   SIN_SALDO: 'Sin saldo pendiente (ya facturado)',
129: };
130: 
131: const motivoBloqueoFacturacion = (remito, saldo) => {
132:   if (remito.status === 'PENDIENTE') return MOTIVO_BLOQUEO.PENDIENTE;
133:   if (remito.status === 'REVISION') return MOTIVO_BLOQUEO.REVISION;
134:   if (saldo.total <= 0) return MOTIVO_BLOQUEO.SIN_CANTIDADES;
135:   if (saldo.saldo <= 0) return MOTIVO_BLOQUEO.SIN_SALDO;
136:   return null;
137: };
138: 
139: // ----------------------------------------------------------------------------
140: // GET /stock/facturas/remitos-disponibles?cliente_id=&incluir_no_facturables=
141: //   Remitos COMPLETADO a cliente con saldo pendiente de facturar.
142: //   Con incluir_no_facturables=1 devuelve también los remitos PENDIENTE y
143: //   REVISION (y los que ya no tienen saldo), para poder listar los pendientes
144: //   de facturación de un cliente aunque todavía no sean facturables.
145: //   (Debe declararse antes de /:id)
146: // ----------------------------------------------------------------------------
147: export const remitosDisponibles = async (req, res) => {
148:   try {
149:     const clienteId = Number(req.query.cliente_id);
150:     if (!Number.isSafeInteger(clienteId) || clienteId <= 0) {
151:       return res.status(400).json({ message: 'cliente_id inválido' });
152:     }
153: 
154:     if (!esAdmin(req)) {
155:       const clientes = await clientesDelUsuario(req.user.id);
156:       if (!clientes.includes(clienteId)) {
157:         return res.status(403).json({ message: 'No tiene acceso a este cliente' });
158:       }
159:     }
160: 
161:     const incluirNoFacturables = ['1', 'true'].includes(
162:       String(req.query.incluir_no_facturables ?? ''),
163:     );
164: 
165:     const remitos = await Remitos.findAll({
166:       where: {
167:         destination_client_id: clienteId,
168:         destination_warehouse_id: null,
169:         status: incluirNoFacturables
170:           ? { [Op.in]: ['PENDIENTE', 'REVISION', 'COMPLETADO'] }
171:           : 'COMPLETADO',
172:       },
173:       include: [
174:         {
175:           model: RemitoItems,
176:           as: 'items',
177:           attributes: ['id', 'product_variant_id', 'quantity_dispatched'],
178:           include: [
179:             {
180:               model: ProductVariants,
181:               as: 'variante',
182:               attributes: ['id', 'codigo'],
183:               include: [
184:                 { model: Products, as: 'producto', attributes: ['id', 'nombre'] },
185:                 {
186:                   model: ProductPresentations,
187:                   as: 'presentacion',
188:                   attributes: ['id', 'nombre'],
189:                   include: [{ model: ProductPresentations, as: 'unidadBase', attributes: ['id', 'nombre'] }],
190:                 },
191:               ],
192:             },
193:           ],
194:         },
195:       ],
196:       order: [
197:         ['issued_at', 'ASC'],
198:         ['createdAt', 'ASC'],
199:       ],
200:     });
201: 
202:     const saldos = await calcularSaldosFacturacion(remitos.map((r) => r.id));
203: 
204:     const disponibles = remitos
205:       .map((remito) => {
206:         const saldo = saldos[remito.id] || {
207:           total: 0,
208:           facturado: 0,
209:           saldo: 0,
210:           estado: 'NO_FACTURADO',
211:         };
212:         const facturable =
213:           remito.status === 'COMPLETADO' && saldo.total > 0 && saldo.saldo > 0;
214:         return {
215:           ...remito.toJSON(),
216:           total_remitido: saldo.total,
217:           facturado: saldo.facturado,
218:           saldo: saldo.saldo,
219:           saldo_facturacion: saldo.saldo,
220:           estado_facturacion: saldo.estado,
221:           facturable,
222:           motivo_bloqueo: facturable ? null : motivoBloqueoFacturacion(remito, saldo),
223:         };
224:       })
225:       .filter((remito) => (incluirNoFacturables ? true : remito.facturable));
226: 
227:     res.json(disponibles);
228:   } catch (error) {
229:     res.status(500).json({ message: error.message });
230:   }
231: };
232: 
233: // ----------------------------------------------------------------------------
234: // POST /stock/facturas  (solo Administrador)
235: //   Body: { cliente_id, tipo, fecha, numero?, notas?, remitos: [{remito_id, cantidad_facturada}] }
236: // ----------------------------------------------------------------------------
237: export const addFactura = async (req, res) => {
238:   const transaction = await db.transaction();
239:   let confirmada = false;
240: 
241:   try {
242:     const { cliente_id, tipo, fecha, numero, notas, remitos } = req.body;
243: 
244:     // ---------- validaciones de cabecera ----------
245:     const clienteId = Number(cliente_id);
246:     if (!Number.isSafeInteger(clienteId) || clienteId <= 0) {
247:       throw fallo(400, 'cliente_id inválido');
248:     }
249: 
250:     const tipoFinal = (tipo || 'FACTURA').toUpperCase();
251:     if (!TIPOS_VALIDOS.includes(tipoFinal)) {
252:       throw fallo(400, `Tipo de comprobante inválido: ${tipo}`);
253:     }
254: 
255:     if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) {
256:       throw fallo(400, 'La fecha es obligatoria (formato YYYY-MM-DD)');
257:     }
258: 
259:     const numeroLimpio = numero != null && String(numero).trim() !== ''
260:       ? String(numero).trim()
261:       : null;
262:     if (numeroLimpio && numeroLimpio.length > 20) {
263:       throw fallo(400, 'El número de factura no puede superar los 20 caracteres');
264:     }
265: 
266:     const listaRemitos = Array.isArray(remitos) ? remitos : [];
267:     if (tipoFinal === 'FACTURA' && listaRemitos.length === 0) {
268:       throw fallo(400, 'Una factura debe incluir al menos un remito');
269:     }
270:     if (tipoFinal === 'ANTICIPO' && listaRemitos.length > 0) {
271:       throw fallo(400, 'Un anticipo no tiene remitos asociados');
272:     }
273: 
274:     const cliente = await Clientes.findByPk(clienteId, { transaction });
275:     if (!cliente) {
276:       throw fallo(404, 'Cliente no encontrado');
277:     }
278: 
279:     // ---------- unicidad del número de factura (entre no anuladas) ----------
280:     if (numeroLimpio) {
281:       const enUso = await Facturas.findOne({
282:         where: { company_id: 1, numero: numeroLimpio, estado: ESTADOS_NO_ANULADOS },
283:         transaction,
284:       });
285:       if (enUso) {
286:         throw fallo(409, `El número de factura ${numeroLimpio} ya está en uso`);
287:       }
288:     }
289: 
290:     // ---------- validación de remitos (con lock) ----------
291:     const ids = [];
292:     for (const item of listaRemitos) {
293:       const id = Number(item?.remito_id);
294:       if (!Number.isSafeInteger(id) || id <= 0) {
295:         throw fallo(400, 'remito_id inválido en el detalle');
296:       }
297:       if (ids.includes(id)) {
298:         throw fallo(400, 'Hay un remito repetido en la factura');
299:       }
300:       ids.push(id);
301:     }
302: 
303:     const filasDetalle = [];
304: 
305:     if (ids.length > 0) {
306:       const remitosBD = await Remitos.findAll({
307:         where: { id: { [Op.in]: ids } },
308:         lock: transaction.LOCK.UPDATE,
309:         transaction,
310:       });
311:       const porId = new Map(remitosBD.map((r) => [r.id, r]));
312:       const saldos = await calcularSaldosFacturacion(ids, { transaction });
313: 
314:       for (const item of listaRemitos) {
315:         const id = Number(item.remito_id);
316:         const remito = porId.get(id);
317: 
318:         if (!remito) {
319:           throw fallo(404, `Remito #${id} no encontrado`);
320:         }
321:         if (remito.status !== 'COMPLETADO') {
322:           throw fallo(400, `El remito ${remito.remito_number} debe estar completado para facturarlo (estado actual: ${remito.status})`);
323:         }
324:         if (remito.destination_warehouse_id) {
325:           throw fallo(400, `El remito ${remito.remito_number} es una transferencia interna y no se factura`);
326:         }
327:         if (Number(remito.destination_client_id) !== clienteId) {
328:           throw fallo(400, `El remito ${remito.remito_number} pertenece a otro cliente`);
329:         }
330: 
331:         const cantidad = parseFloat(item.cantidad_facturada);
332:         if (!Number.isFinite(cantidad) || cantidad <= 0) {
333:           throw fallo(400, `Cantidad facturada inválida para el remito ${remito.remito_number}`);
334:         }
335: 
336:         const saldo = saldos[id]?.saldo ?? 0;
337:         if (cantidad > saldo + 0.0001) {
338:           throw fallo(
339:             400,
340:             `El remito ${remito.remito_number} tiene un saldo de ${saldo} disponibles y se intentan facturar ${cantidad}`,
341:           );
342:         }
343: 
344:         filasDetalle.push({
345:           remito_id: id,
346:           cantidad_facturada: cantidad,
347:         });
348:       }
349:     }
350: 
351:     // ---------- alta de la factura ----------
352:     const factura = await Facturas.create(
353:       {
354:         company_id: 1,
355:         cliente_id: clienteId,
356:         tipo: tipoFinal,
357:         fecha,
358:         numero: numeroLimpio,
359:         estado: 'SIMULADA',
360:         notas: notas || null,
361:         created_by: req.user?.id ?? null,
362:       },
363:       { transaction },
364:     );
365: 
366:     if (filasDetalle.length > 0) {
367:       await RemitoFacturas.bulkCreate(
368:         filasDetalle.map((fila) => ({ ...fila, factura_id: factura.id })),
369:         { transaction },
370:       );
371:     }
372: 
373:     await transaction.commit();
374:     confirmada = true;
375: 
376:     const completa = await Facturas.findByPk(factura.id, {
377:       include: incluirClienteYRemitos,
378:     });
379:     return res.status(201).json(completa);
380:   } catch (error) {
381:     if (!confirmada) {
382:       await transaction.rollback();
383:     }
384:     if (error.status) {
385:       return res.status(error.status).json({ message: error.message });
386:     }
387:     if (error.name === 'SequelizeUniqueConstraintError') {
388:       return res.status(409).json({ message: 'El número de factura ya está en uso' });
389:     }
390:     return res.status(400).json({ message: error.message });
391:   }
392: };
393: 
394: // ----------------------------------------------------------------------------
395: // PUT /stock/facturas/:id/anular  (solo Administrador)
396: //   Pasa la factura a ANULADA y libera sus remitos (las filas de
397: //   remito_facturas quedan, pero dejan de contar para los saldos).
398: // ----------------------------------------------------------------------------
399: export const anularFactura = async (req, res) => {
400:   const transaction = await db.transaction();
401:   try {
402:     const factura = await Facturas.findByPk(req.params.id, {
403:       transaction,
404:       lock: transaction.LOCK.UPDATE,
405:     });
406: 
407:     if (!factura) {
408:       await transaction.rollback();
409:       return res.status(404).json({ message: 'Factura no encontrada' });
410:     }
411:     if (factura.estado === 'ANULADA') {
412:       await transaction.rollback();
413:       return res.status(400).json({ message: 'La factura ya está anulada' });
414:     }
415:     if (factura.estado === 'EMITIDA') {
416:       await transaction.rollback();
417:       return res.status(400).json({ message: 'No se puede anular una factura emitida' });
418:     }
419: 
420:     factura.estado = 'ANULADA';
421:     await factura.save({ transaction });
422: 
423:     await transaction.commit();
424: 
425:     const completa = await Facturas.findByPk(factura.id, {
426:       include: incluirClienteYRemitos,
427:     });
428:     res.json(completa);
429:   } catch (error) {
430:     await transaction.rollback();
431:     res.status(500).json({ message: error.message });
432:   }
433: };

(End of file - total 433 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\services\\facturacionService.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\services\facturacionService.js</path>
<type>file</type>
<content>
1: import { Op, fn, col } from 'sequelize';
2: import { Facturas, RemitoFacturas, RemitoItems } from '../models/index.js';
3: 
4: // ============================================================================
5: // FACTURACIÓN — lógica de cálculo compartida entre el controller de facturas
6: // y el controller de remitos (estado de facturación de cada remito).
7: // ============================================================================
8: 
9: /**
10:  * Estado de facturación DERIVADO de un remito (no es una columna nueva):
11:  *  - NO_FACTURADO: no tiene ninguna cantidad facturada
12:  *  - PARCIAL:      facturó parte del total (ej. 100 L de 300 L)
13:  *  - FACTURADO:    cubrió el total remitido
14:  */
15: export const calcularEstadoFacturacion = (total, facturado) => {
16:   const totalNum = parseFloat(total) || 0;
17:   const facturadoNum = parseFloat(facturado) || 0;
18:   if (facturadoNum <= 0) return 'NO_FACTURADO';
19:   if (facturadoNum >= totalNum) return 'FACTURADO';
20:   return 'PARCIAL';
21: };
22: 
23: /**
24:  * Suma de cantidades facturadas por remito, considerando solo facturas
25:  * no anuladas. Devuelve { [remito_id]: total }.
26:  * Acepta `transaction` para usar dentro de transacciones con lock.
27:  */
28: export const sumarFacturadoPorRemito = async (remitoIds, { transaction } = {}) => {
29:   const resultado = {};
30:   if (!Array.isArray(remitoIds) || remitoIds.length === 0) return resultado;
31: 
32:   const filas = await RemitoFacturas.findAll({
33:     attributes: ['remito_id', [fn('SUM', col('cantidad_facturada')), 'total']],
34:     include: [
35:       {
36:         model: Facturas,
37:         as: 'factura',
38:         attributes: [],
39:         where: { estado: { [Op.ne]: 'ANULADA' } },
40:         required: true,
41:       },
42:     ],
43:     where: { remito_id: { [Op.in]: remitoIds } },
44:     group: ['remito_id'],
45:     raw: true,
46:     transaction,
47:   });
48: 
49:   for (const fila of filas) {
50:     resultado[fila.remito_id] = parseFloat(fila.total) || 0;
51:   }
52:   return resultado;
53: };
54: 
55: /**
56:  * Total remitido por remito (suma de quantity_dispatched de sus ítems,
57:  * en unidades base / litros). Devuelve { [remito_id]: total }.
58:  */
59: export const sumarTotalRemitos = async (remitoIds, { transaction } = {}) => {
60:   const resultado = {};
61:   if (!Array.isArray(remitoIds) || remitoIds.length === 0) return resultado;
62: 
63:   const filas = await RemitoItems.findAll({
64:     attributes: ['remito_id', [fn('SUM', col('quantity_dispatched')), 'total']],
65:     where: { remito_id: { [Op.in]: remitoIds } },
66:     group: ['remito_id'],
67:     raw: true,
68:     transaction,
69:   });
70: 
71:   for (const fila of filas) {
72:     resultado[fila.remito_id] = parseFloat(fila.total) || 0;
73:   }
74:   return resultado;
75: };
76: 
77: /**
78:  * Calcula total, facturado, saldo y estado de facturación para una lista
79:  * de remitos, en una sola pasada. Devuelve { [remito_id]: { total, facturado, saldo, estado } }.
80:  */
81: export const calcularSaldosFacturacion = async (remitoIds, { transaction } = {}) => {
82:   const ids = Array.isArray(remitoIds) ? [...new Set(remitoIds)] : [];
83:   const [totales, facturados] = await Promise.all([
84:     sumarTotalRemitos(ids, { transaction }),
85:     sumarFacturadoPorRemito(ids, { transaction }),
86:   ]);
87: 
88:   const saldos = {};
89:   for (const id of ids) {
90:     const total = totales[id] || 0;
91:     const facturado = facturados[id] || 0;
92:     saldos[id] = {
93:       total,
94:       facturado,
95:       saldo: Math.max(total - facturado, 0),
96:       estado: calcularEstadoFacturacion(total, facturado),
97:     };
98:   }
99:   return saldos;
100: };

(End of file - total 100 lines)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 8.6s)

_Thinking:_

Now let me read the models for remitoItems, productVariants, productPresentations, and the migration for facturas.

Key question for item-level partial billing: `remito_items` has `product_variant_id`, `quantity_requested` (in presentation units), `quantity_dispatched` (base units). For partial billing at item level, we'd need to know how much of each item was already billed. Currently `remito_facturas.cantidad_facturada` is a scalar per remito with no item breakdown. So to support item-level partial billing, we need a new join table `remito_factura_items` (factura_id, remito_id, remito_item_id, cantidad_facturada) — or migrate `remito_facturas` to include `remito_item_id`.

Let me read those models +

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\models\\remitoItems.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\models\remitoItems.js</path>
<type>file</type>
<content>
1: import { Model, DataTypes } from 'sequelize';
2: import db from '../config/database.js';
3: 
4: class RemitoItems extends Model {}
5: 
6: RemitoItems.init(
7:   {
8:     id: {
9:       type: DataTypes.INTEGER,
10:       primaryKey: true,
11:       autoIncrement: true,
12:     },
13:     remito_id: {
14:       type: DataTypes.INTEGER,
15:       allowNull: false,
16:     },
17:     product_variant_id: {
18:       type: DataTypes.INTEGER,
19:       allowNull: false,
20:     },
21:     quantity_requested: {
22:       type: DataTypes.DECIMAL(15, 4),
23:       allowNull: true,
24:     },
25:     quantity_dispatched: {
26:       type: DataTypes.DECIMAL(15, 4),
27:       allowNull: true,
28:     },
29:     description: {
30:       type: DataTypes.STRING(255),
31:       allowNull: true,
32:     },
33:   },
34:   {
35:     sequelize: db,
36:     modelName: 'RemitoItems',
37:     tableName: 'remito_items',
38:     timestamps: true,
39:     paranoid: false,
40:   },
41: );
42: 
43: export default RemitoItems;

(End of file - total 43 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\models\\remitoFacturas.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\models\remitoFacturas.js</path>
<type>file</type>
<content>
1: import { Model, DataTypes } from 'sequelize';
2: import db from '../config/database.js';
3: 
4: class RemitoFacturas extends Model {}
5: 
6: RemitoFacturas.init(
7:   {
8:     id: {
9:       type: DataTypes.INTEGER,
10:       primaryKey: true,
11:       autoIncrement: true,
12:     },
13: 
14:     factura_id: {
15:       type: DataTypes.INTEGER,
16:       allowNull: false,
17:     },
18: 
19:     remito_id: {
20:       type: DataTypes.INTEGER,
21:       allowNull: false,
22:     },
23: 
24:     // Cantidad facturada de este remito en esta factura, en unidades
25:     // base (litros). Permite facturación parcial: <= total del remito.
26:     cantidad_facturada: {
27:       type: DataTypes.DECIMAL(15, 4),
28:       allowNull: false,
29:     },
30:   },
31:   {
32:     sequelize: db,
33:     modelName: 'RemitoFacturas',
34:     tableName: 'remito_facturas',
35:     timestamps: true,
36:     paranoid: false,
37:   },
38: );
39: 
40: export default RemitoFacturas;

(End of file - total 40 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\models\\productVariants.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\models\productVariants.js</path>
<type>file</type>
<content>
1: import { Model, DataTypes } from 'sequelize';
2: import db from '../config/database.js';
3: 
4: class ProductVariants extends Model {}
5: 
6: ProductVariants.init(
7:   {
8:     id: {
9:       type: DataTypes.INTEGER,
10:       primaryKey: true,
11:       autoIncrement: true,
12:     },
13:     product_id: {
14:       type: DataTypes.INTEGER,
15:       allowNull: false,
16:     },
17:     presentation_id: {
18:       type: DataTypes.INTEGER,
19:       allowNull: false,
20:     },
21:     codigo: {
22:       type: DataTypes.STRING(255),
23:       allowNull: false,
24:       unique: true,
25:     },
26:     activo: {
27:       type: DataTypes.BOOLEAN,
28:       allowNull: false,
29:       defaultValue: true,
30:     },
31:     ranking: {
32:       type: DataTypes.INTEGER,
33:       allowNull: false,
34:       defaultValue: 0,
35:       validate: {
36:         min: 0,
37:         max: 5,
38:       },
39:     },
40:   },
41:   {
42:     sequelize: db,
43:     modelName: 'ProductVariants',
44:     tableName: 'product_variants',
45:     timestamps: true,
46:     paranoid: true,
47:     deletedAt: 'deleted_at',
48:     indexes: [
49:       {
50:         unique: true,
51:         fields: ['product_id', 'presentation_id'],
52:         name: 'product_variants_unique',
53:       },
54:     ],
55:   },
56: );
57: 
58: export default ProductVariants;

(End of file - total 58 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\models\\productPresentations.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\models\productPresentations.js</path>
<type>file</type>
<content>
1: import { Model, DataTypes } from 'sequelize';
2: import db from '../config/database.js';
3: 
4: class ProductPresentations extends Model {}
5: 
6: ProductPresentations.init(
7:   {
8:     id: {
9:       type: DataTypes.INTEGER,
10:       primaryKey: true,
11:       autoIncrement: true,
12:     },
13:     nombre: {
14:       type: DataTypes.STRING(255),
15:       allowNull: false,
16:     },
17:     unidad_base_id: {
18:       type: DataTypes.INTEGER,
19:       allowNull: true,
20:     },
21:     cantidad_base: {
22:       type: DataTypes.DECIMAL(15, 4),
23:       allowNull: true,
24:     },
25:     activo: {
26:       type: DataTypes.BOOLEAN,
27:       allowNull: false,
28:       defaultValue: true,
29:     },
30:   },
31:   {
32:     sequelize: db,
33:     modelName: 'ProductPresentations',
34:     tableName: 'product_presentations',
35:     timestamps: true,
36:     paranoid: true,
37:     deletedAt: 'deleted_at',
38:   },
39: );
40: 
41: export default ProductPresentations;

(End of file - total 41 lines)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 2.9s)

_Thinking:_

Now I have a very complete picture of the data model. Let me read the frontend ModalFactura.jsx and Facturacion.jsx to understand the UI patterns I'd extend, and Remitos.jsx relevant parts.

Let me read ModalFactura.jsx fully (385 lines) and skim Facturacion.jsx.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components\\ModalFactura.jsx"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalFactura.jsx</path>
<type>file</type>
<content>
1: import { useState, useEffect, useRef } from 'react';
2: import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
3: import { remitosDisponibles, addFactura } from '../api/facturas';
4: 
5: const fechaHoy = () => {
6:   const d = new Date();
7:   const mes = String(d.getMonth() + 1).padStart(2, '0');
8:   const dia = String(d.getDate()).padStart(2, '0');
9:   return `${d.getFullYear()}-${mes}-${dia}`;
10: };
11: 
12: const ModalFactura = ({
13:   clientes,
14:   remitoInicial = null,
15:   clienteInicial = null,
16:   fechaInicial = null,
17:   onClose,
18:   onSave,
19: }) => {
20:   const remitoInicialRef = useRef(remitoInicial);
21: 
22:   const [form, setForm] = useState({
23:     cliente_id: String(
24:       remitoInicial?.destination_client_id || clienteInicial || '',
25:     ),
26:     tipo: 'FACTURA',
27:     fecha: fechaInicial || fechaHoy(),
28:     numero: '',
29:     notas: '',
30:   });
31:   const [disponibles, setDisponibles] = useState([]);
32:   const [cargandoRemitos, setCargandoRemitos] = useState(false);
33:   // { [remito_id]: { marcado, cantidad } }
34:   const [seleccion, setSeleccion] = useState({});
35:   const [errors, setErrors] = useState({});
36:   const [isSubmitting, setIsSubmitting] = useState(false);
37: 
38:   useEffect(() => {
39:     if (form.tipo !== 'FACTURA' || !form.cliente_id) {
40:       setDisponibles([]);
41:       setSeleccion({});
42:       return undefined;
43:     }
44: 
45:     let cancelado = false;
46:     const cargar = async () => {
47:       try {
48:         setCargandoRemitos(true);
49:         const res = await remitosDisponibles(form.cliente_id);
50:         if (cancelado) return;
51:         const lista = res.data || [];
52:         const inicial = remitoInicialRef.current;
53:         const nuevaSeleccion = {};
54:         for (const remito of lista) {
55:           const premarcado = Boolean(inicial && inicial.id === remito.id);
56:           nuevaSeleccion[remito.id] = {
57:             marcado: premarcado,
58:             cantidad: Number(remito.saldo) || 0,
59:           };
60:         }
61:         setDisponibles(lista);
62:         setSeleccion(nuevaSeleccion);
63:       } catch (error) {
64:         console.error('Error al cargar remitos disponibles:', error);
65:         if (!cancelado) {
66:           setDisponibles([]);
67:           setSeleccion({});
68:         }
69:       } finally {
70:         if (!cancelado) setCargandoRemitos(false);
71:       }
72:     };
73: 
74:     cargar();
75:     return () => {
76:       cancelado = true;
77:     };
78:   }, [form.cliente_id, form.tipo]);
79: 
80:   const esFactura = form.tipo === 'FACTURA';
81: 
82:   const marcados = disponibles.filter((r) => seleccion[r.id]?.marcado);
83: 
84:   const totalAFacturar = marcados.reduce(
85:     (sum, r) => sum + (Number(seleccion[r.id]?.cantidad) || 0),
86:     0,
87:   );
88: 
89:   const toggleRemito = (remito) => {
90:     setSeleccion((prev) => ({
91:       ...prev,
92:       [remito.id]: {
93:         marcado: !prev[remito.id]?.marcado,
94:         cantidad: Number(remito.saldo) || 0,
95:       },
96:     }));
97:   };
98: 
99:   const cambiarCantidad = (remito, valor) => {
100:     setSeleccion((prev) => ({
101:       ...prev,
102:       [remito.id]: {
103:         ...prev[remito.id],
104:         cantidad: valor,
105:       },
106:     }));
107:   };
108: 
109:   const validate = () => {
110:     const newErrors = {};
111:     if (!form.cliente_id) newErrors.cliente_id = 'Seleccione un cliente';
112:     if (!form.fecha) newErrors.fecha = 'Ingrese la fecha';
113:     if (form.numero && form.numero.trim().length > 20) {
114:       newErrors.numero = 'Máximo 20 caracteres';
115:     }
116: 
117:     if (esFactura) {
118:       if (marcados.length === 0) {
119:         newErrors.remitos = 'Seleccione al menos un remito para facturar';
120:       }
121:       marcados.forEach((remito) => {
122:         const cantidad = Number(seleccion[remito.id]?.cantidad);
123:         const saldo = Number(remito.saldo) || 0;
124:         if (!Number.isFinite(cantidad) || cantidad <= 0) {
125:           newErrors[`remito_${remito.id}`] = 'Cantidad debe ser mayor a 0';
126:         } else if (cantidad > saldo + 0.0001) {
127:           newErrors[`remito_${remito.id}`] = `Máximo: ${saldo.toFixed(2)}`;
128:         }
129:       });
130:     }
131: 
132:     setErrors(newErrors);
133:     return Object.keys(newErrors).length === 0;
134:   };
135: 
136:   const handleSubmit = async (e) => {
137:     e.preventDefault();
138:     if (!validate()) return;
139:     try {
140:       setIsSubmitting(true);
141:       await addFactura({
142:         cliente_id: Number(form.cliente_id),
143:         tipo: form.tipo,
144:         fecha: form.fecha,
145:         numero: form.numero.trim() || null,
146:         notas: form.notas.trim() || null,
147:         remitos: esFactura
148:           ? marcados.map((remito) => ({
149:               remito_id: remito.id,
150:               cantidad_facturada: Number(seleccion[remito.id].cantidad),
151:             }))
152:           : [],
153:       });
154:       onSave();
155:     } catch (error) {
156:       console.error('Error al crear factura:', error);
157:       window.alert(
158:         error.response?.data?.message || 'No se pudo crear la factura',
159:       );
160:     } finally {
161:       setIsSubmitting(false);
162:     }
163:   };
164: 
165:   return (
166:     <Modal show onHide={onClose} centered size="lg">
167:       <Modal.Header closeButton>
168:         <Modal.Title>Nueva Factura</Modal.Title>
169:       </Modal.Header>
170:       <Form onSubmit={handleSubmit}>
171:         <Modal.Body>
172:           <Row className="mb-3">
173:             <Col md={4}>
174:               <Form.Label>Cliente *</Form.Label>
175:               <Form.Select
176:                 value={form.cliente_id}
177:                 onChange={(e) =>
178:                   setForm({ ...form, cliente_id: e.target.value })
179:                 }
180:                 isInvalid={!!errors.cliente_id}
181:               >
182:                 <option value="">Seleccionar</option>
183:                 {clientes.map((c) => (
184:                   <option key={c.id} value={c.id}>
185:                     {c.razon_social}
186:                   </option>
187:                 ))}
188:               </Form.Select>
189:               <Form.Control.Feedback type="invalid">
190:                 {errors.cliente_id}
191:               </Form.Control.Feedback>
192:             </Col>
193:             <Col md={2}>
194:               <Form.Label>Tipo *</Form.Label>
195:               <Form.Select
196:                 value={form.tipo}
197:                 onChange={(e) => setForm({ ...form, tipo: e.target.value })}
198:               >
199:                 <option value="FACTURA">Factura</option>
200:                 <option value="ANTICIPO">Anticipo</option>
201:               </Form.Select>
202:             </Col>
203:             <Col md={2}>
204:               <Form.Label>Fecha *</Form.Label>
205:               <Form.Control
206:                 type="date"
207:                 value={form.fecha}
208:                 onChange={(e) => setForm({ ...form, fecha: e.target.value })}
209:                 isInvalid={!!errors.fecha}
210:               />
211:               <Form.Control.Feedback type="invalid">
212:                 {errors.fecha}
213:               </Form.Control.Feedback>
214:             </Col>
215:             <Col md={2}>
216:               <Form.Label>N° Factura</Form.Label>
217:               <Form.Control
218:                 type="text"
219:                 maxLength={20}
220:                 placeholder="Opcional"
221:                 value={form.numero}
222:                 onChange={(e) => setForm({ ...form, numero: e.target.value })}
223:                 isInvalid={!!errors.numero}
224:               />
225:               <Form.Control.Feedback type="invalid">
226:                 {errors.numero}
227:               </Form.Control.Feedback>
228:             </Col>
229:             <Col md={2}>
230:               <Form.Label>Notas</Form.Label>
231:               <Form.Control
232:                 type="text"
233:                 placeholder="Opcional"
234:                 value={form.notas}
235:                 onChange={(e) => setForm({ ...form, notas: e.target.value })}
236:               />
237:             </Col>
238:           </Row>
239: 
240:           {esFactura && (
241:             <>
242:               <h6 className="mb-3">Remitos a facturar</h6>
243: 
244:               {!form.cliente_id && (
245:                 <p className="text-muted text-center py-3">
246:                   Seleccione un cliente para ver sus remitos disponibles
247:                 </p>
248:               )}
249: 
250:               {form.cliente_id && cargandoRemitos && (
251:                 <p className="text-muted text-center py-3">
252:                   <Spinner animation="border" size="sm" className="me-2" />
253:                   Cargando remitos disponibles...
254:                 </p>
255:               )}
256: 
257:               {form.cliente_id && !cargandoRemitos && disponibles.length === 0 && (
258:                 <p className="text-muted text-center py-3">
259:                   No hay remitos listos para facturar de este cliente. Podés
260:                   revisar los pendientes en el panel de Facturación.
261:                 </p>
262:               )}
263: 
264:               {!cargandoRemitos && disponibles.length > 0 && (
265:                 <div className="table-responsive">
266:                   <table className="table table-sm table-hover align-middle">
267:                     <thead>
268:                       <tr>
269:                         <th style={{ width: '40px' }}></th>
270:                         <th>Remito</th>
271:                         <th>Fecha</th>
272:                         <th className="text-end">Total</th>
273:                         <th className="text-end">Ya facturado</th>
274:                         <th className="text-end">Saldo</th>
275:                         <th style={{ width: '130px' }}>A facturar</th>
276:                       </tr>
277:                     </thead>
278:                     <tbody>
279:                       {disponibles.map((remito) => {
280:                         const sel = seleccion[remito.id] || {};
281:                         const fechaRemito =
282:                           remito.issued_at || remito.createdAt;
283:                         return (
284:                           <tr
285:                             key={remito.id}
286:                             className={sel.marcado ? 'table-light' : ''}
287:                           >
288:                             <td>
289:                               <Form.Check
290:                                 type="checkbox"
291:                                 checked={Boolean(sel.marcado)}
292:                                 onChange={() => toggleRemito(remito)}
293:                               />
294:                             </td>
295:                             <td>
296:                               <strong>{remito.remito_number}</strong>
297:                             </td>
298:                             <td>
299:                               {fechaRemito
300:                                 ? new Date(fechaRemito).toLocaleDateString(
301:                                     'es-AR',
302:                                   )
303:                                 : '—'}
304:                             </td>
305:                             <td className="text-end">
306:                               {Number(remito.total_remitido || 0).toFixed(2)}
307:                             </td>
308:                             <td className="text-end">
309:                               {Number(remito.facturado || 0).toFixed(2)}
310:                             </td>
311:                             <td className="text-end">
312:                               <strong>{Number(remito.saldo || 0).toFixed(2)}</strong>
313:                             </td>
314:                             <td>
315:                               <Form.Control
316:                                 type="number"
317:                                 size="sm"
318:                                 step="0.01"
319:                                 min="0.01"
320:                                 max={remito.saldo}
321:                                 disabled={!sel.marcado}
322:                                 value={sel.cantidad ?? ''}
323:                                 onChange={(e) =>
324:                                   cambiarCantidad(
325:                                     remito,
326:                                     e.target.value === ''
327:                                       ? ''
328:                                       : parseFloat(e.target.value),
329:                                   )
330:                                 }
331:                                 isInvalid={!!errors[`remito_${remito.id}`]}
332:                               />
333:                               {errors[`remito_${remito.id}`] && (
334:                                 <div className="invalid-feedback d-block">
335:                                   {errors[`remito_${remito.id}`]}
336:                                 </div>
337:                               )}
338:                             </td>
339:                           </tr>
340:                         );
341:                       })}
342:                     </tbody>
343:                   </table>
344:                 </div>
345:               )}
346: 
347:               {errors.remitos && (
348:                 <div className="text-danger mt-2">{errors.remitos}</div>
349:               )}
350: 
351:               {marcados.length > 0 && (
352:                 <div className="text-end mt-2">
353:                   <strong>
354:                     Total a facturar: {totalAFacturar.toFixed(2)}
355:                   </strong>
356:                 </div>
357:               )}
358:             </>
359:           )}
360: 
361:           {!esFactura && (
362:             <p className="text-muted">
363:               Un anticipo no tiene remitos asociados: solo registra el importe
364:               recibido del cliente.
365:             </p>
366:           )}
367:         </Modal.Body>
368:         <Modal.Footer>
369:           <Button variant="secondary" onClick={onClose}>
370:             Cancelar
371:           </Button>
372:           <Button
373:             type="submit"
374:             variant="primary"
375:             disabled={isSubmitting}
376:           >
377:             {isSubmitting ? 'Creando...' : 'Crear Factura'}
378:           </Button>
379:         </Modal.Footer>
380:       </Form>
381:     </Modal>
382:   );
383: };
384: 
385: export default ModalFactura;

(End of file - total 385 lines)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 6.3s)

_Thinking:_

Now let me look at Facturacion.jsx (main page) and the relevant parts of Remitos.jsx to understand the multi-select patterns needed. Also, I want to check the "Compras" module since it seems to have a "factura comercial" design with prices — that could be a reference for the monetary approach.

Let me check compras in backend — purchases.js model and controller — to see if there's a

**Tool: bash**

**Input:**
```json
{
  "command": "Get-Content \"C:\\Job\\Don Asdrubal\\backend\\src\\models\\purchases.js\"; Write-Output \"=== PURCHASE ITEMS ===\"; Get-Content \"C:\\Job\\Don Asdrubal\\backend\\src\\models\\purchaseItems.js\""
}
```

**Output:**
```
import { Model, DataTypes } from 'sequelize';
import db from '../config/database.js';

class Purchases extends Model {}

Purchases.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    provider_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    warehouse_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: 'Purchases',
    tableName: 'purchases',
    timestamps: true,
    paranoid: false,
  },
);

export default Purchases;
=== PURCHASE ITEMS ===
import { Model, DataTypes } from 'sequelize';
import db from '../config/database.js';

class PurchaseItems extends Model {}

PurchaseItems.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    purchase_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: 'PurchaseItems',
    tableName: 'purchase_items',
    timestamps: true,
    paranoid: false,
  },
);

export default PurchaseItems;

```

**Tool: grep**

**Input:**
```json
{
  "include": "*.jsx",
  "path": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components",
  "pattern": "total|importe|\\$|USD"
}
```

**Output:**
```
Found 100 matches (more matches available)
C:\Job\Don Asdrubal\donAsdrubal\src\components\CalibracionesMobileList.jsx:
  Line 78:             className={`calificacion-card ${isSelected ? 'calificacion-card--selected' : ''}`}

  Line 117:                       border: `2px solid ${estadoMaqColor.border}`,


C:\Job\Don Asdrubal\donAsdrubal\src\components\ClienteDetalle.jsx:
  Line 77:   const clientBasePath = `/clientes/${cliente_id}`;

  Line 84:         : `${clientBasePath}/${tab}`;

  Line 96:           className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}

  Line 104:           className={`tab-button ${activeTab === 'pozos' ? 'active' : ''}`}

  Line 112:           className={`tab-button ${activeTab === 'maquinas' ? 'active' : ''}`}

  Line 120:           className={`tab-button ${activeTab === 'jornadas' ? 'active' : ''}`}

  Line 128:           className={`tab-button ${activeTab === 'notas' ? 'active' : ''}`}


C:\Job\Don Asdrubal\donAsdrubal\src\components\ClientesMobileList.jsx:
  Line 143:                 ? `${row.litros_estimados.toLocaleString('es-AR')} L`

  Line 162:                 meta={`${row.totalMaquinas} máq.`}

  Line 171:                 meta={`${row.totalPozos} poz.`}


C:\Job\Don Asdrubal\donAsdrubal\src\components\Clientedashboard.jsx:
  Line 63:           ${iconColors[color]}

  Line 85:           className={`mt-0.5 text-xs flex items-center gap-2 leading-none ${isPositive

  Line 178: const DonutChart = ({ data, totalValue, totalLabel, height = 120 }) => {

  Line 194:                 <Cell key={`cell-${index}`} fill={entry.color} />

  Line 210:       {totalValue !== undefined && (

  Line 213:             {totalValue}

  Line 215:           {totalLabel && (

  Line 217:               {totalLabel}

  Line 246:           className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${statusStyles[status]}`}

  Line 480:       value: data.stats?.pozos?.total?.toString() || '0',

  Line 481:       trendLabel: `${data.stats?.pozos?.nuevos || 0} nuevos ${data.stats?.pozos?.periodo || 'este año'}`,

  Line 488:       value: data.stats?.maquinas?.total?.toString() || '0',

  Line 489:       trendLabel: `${data.stats?.maquinas?.porcentaje || 0}% calibradas`,

  Line 496:       value: data.stats?.jornadas?.total?.toString() || '0',

  Line 497:       trendLabel: `${data.stats?.jornadas?.nuevos || 0} nuevos ${data.stats?.jornadas?.periodo || 'este año'}`,

  Line 504:       value: data.stats?.serviciosPendientes?.total?.toString() || '0',

  Line 505:       trendLabel: `${data.stats?.serviciosPendientes?.proximos15dias || 0} próximos 15 días`,

  Line 513:   const servicesChartTotal = data.servicesChart?.total || 0;

  Line 516:   const analisisChartTotal = data.analisisChart?.total || 0;

  Line 519:   const calibracionChartTotal = data.calibracionChart?.total || 0;

  Line 522:   const jornadasChartTotal = data.jornadasChart?.total || 0;

  Line 665:                   totalValue={analisisChartTotal.toString()}

  Line 666:                 // totalLabel="Total"

  Line 696:                   totalValue={calibracionChartTotal.toString()}

  Line 697:                 // totalLabel="Calibraciones"

  Line 727:                   totalValue={jornadasChartTotal.toString()}

  Line 728:                 // totalLabel="Jornadas"

  Line 785:                       ?? (nota.usuario_id ? `Usuario ${nota.usuario_id}` : 'Usuario no identificado')


C:\Job\Don Asdrubal\donAsdrubal\src\components\Clientes.jsx:
  Line 288:     } else if (!/^\d{2}-\d{8}-\d{1}$/.test(newCliente.cuil_cuit)) {

  Line 302:     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCliente.email)) {

  Line 488:     navigate(`/clientes/${cliente.id}`);

  Line 537:       formateado = `${soloDigitos.slice(0, 2)}-${soloDigitos.slice(2)}`;

  Line 539:       formateado = `${soloDigitos.slice(0, 2)}-${soloDigitos.slice(2, 10)}-${soloDigitos.slice(10)}`;

  Line 835:                       className={`form-control ${errors.razon_social ? 'is-invalid' : ''}`}

  Line 860:                       className={`form-control ${errors.direccion_fiscal ? 'is-invalid' : ''}`}

  Line 904:                       className={`form-select ${errors.pais ? 'is-invalid' : ''}`}

  Line 939:                       className={`form-select ${errors.provincia ? 'is-invalid' : ''}`}

  Line 974:                       className={`form-select ${errors.ciudad ? 'is-invalid' : ''}`}

  Line 1021:                       className={`form-control ${errors.cuil_cuit ? 'is-invalid' : ''}`}

  Line 1047:                       className={`form-control ${errors.iva_id ? 'is-invalid' : ''}`}

  Line 1075:                       className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}

  Line 1102:                       className={`form-control ${errors.email ? 'is-invalid' : ''}`}

  Line 1125:                       className={`form-control ${errors.estado ? 'is-invalid' : ''}`}

  Line 1151:                       className={`form-control ${errors.tipoClientes ? 'is-invalid' : ''}`}

  Line 1239:                       className={`form-control ${errors.litros_estimados ? 'is-invalid' : ''}`}

  Line 1267:                       className={`form-check-container ${errors.ingenieros ? 'border border-danger' : ''}`}

  Line 1279:                             className={`form-check-item ${isSelected ? 'selected' : ''}`}

  Line 1285:                                 id={`ing-${ing.id}`}

  Line 1294:                                 htmlFor={`ing-${ing.id}`}


C:\Job\Don Asdrubal\donAsdrubal\src\components\ChartsRow.jsx:
  Line 6: const DonutChart = ({ data, totalValue, totalLabel, height = 200 }) => {

  Line 22:                 <Cell key={`cell-${index}`} fill={entry.color} />

  Line 38:       {totalValue !== undefined && (

  Line 41:             {totalValue}

  Line 43:           {totalLabel && (

  Line 45:               {totalLabel}

  Line 89:             totalValue="15"

  Line 90:             totalLabel="Servicios"


C:\Job\Don Asdrubal\donAsdrubal\src\components\Compras.jsx:
  Line 97:     return p ? p.nombre : `Proveedor #${id}`;

  Line 102:     return d ? `${d.nombre} (${d.codigo})` : `Depósito #${id}`;

  Line 109:     if (!v) return `Variante #${id}`;

  Line 110:     return v.producto?.nombre || `Variante #${id}`;

  Line 183:         if (filtroDesde && fecha < new Date(`${filtroDesde}T00:00:00`))

  Line 185:         if (filtroHasta && fecha > new Date(`${filtroHasta}T23:59:59`))

  Line 213:   const totalCantidad = (compraSeleccionada?.items || []).reduce(

  Line 272:                               `${getNombreDeposito(d.warehouse_id)}: ${parseFloat(

  Line 300:               <td className="text-end">{totalCantidad.toFixed(2)}</td>

  Line 335:               ? `${comprasFiltradas.length} de ${compras.length} compras`

  Line 336:               : `${compras.length} compras registradas`}

  Line 454:                     className={`lista-card ${

  Line 517:                         className={`lista-table__row ${


C:\Job\Don Asdrubal\donAsdrubal\src\components\CalibracionesActual.jsx:
  Line 74:     let path = `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${calibracion_id}/`;

  Line 243:         href={`${import.meta.env.VITE_API_URL}/uploads/calibraciones/${nombreArchivo}`}

  Line 263:           // setViewerUrl(`/uploads/calibraciones/${nombreArchivo}`);

  Line 264:           setViewerUrl(`${archivo.path}/${archivo.nombreArchivo}`);

  Line 323:       // link.download = `calibracion-${id}.pdf`;

  Line 453:                                 border: `2px solid ${getEstadoColor(estadoMaquinaData.estado).border}`,

  Line 579:                               className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}

  Line 612:                                 src={`${import.meta.env.VITE_API_URL}/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/${cal.imagen}`}

  Line 769:                                             className={`${getComponentIcon(formateo[key])} text-info`}

  Line 792:                                             border: `1px solid ${getEstadoColor(estadoData.estado).border}`,

  Line 955:                                                     className={`badge ${estadoData.presenciaORing === 'Si' ? 'bg-success' : 'bg-secondary'}`}

  Line 962:                                                       className={`bi ${estadoData.presenciaORing === 'Si' ? 'bi-check-circle-fill' : 'bi-x-circle'} me-1`}

  Line 1308:                                             path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,

  Line 1346:                                             path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,

  Line 1384:                                             path: `/uploads/clientes/${cliente_id}/maquinas/${maquina_id}/calibraciones/${cal.id}/`,


C:\Job\Don Asdrubal\donAsdrubal\src\components\Alertas.jsx:
  Line 166:               <strong>{success.total_clientes || 0}</strong>

  Line 169:               Servicios creados: <strong>{success.total_servicios || 0}</strong>

  Line 172:               Alertas generadas: <strong>{success.total_alertas || 0}</strong>


(Results truncated. Consider using a more specific path or pattern.)
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 2.7s)

_Thinking:_

Confirmed: no monetary values anywhere in the system. Purchases also have no prices.

Now let me read Facturacion.jsx to understand the page structure, and Remitos.jsx relevant sections. Let me read Fact

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components\\Facturacion.jsx"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\donAsdrubal\src\components\Facturacion.jsx</path>
<type>file</type>
<content>
1: import { useState, useEffect, useMemo } from 'react';
2: import { useSearchParams } from 'react-router-dom';
3: import { Receipt, Plus, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
4: import { allFacturas, anularFactura, remitosDisponibles } from '../api/facturas';
5: import { allCliente } from '../api/clientes';
6: import Spinner from './Spinner';
7: import ModalFactura from './ModalFactura';
8: import { useIsMobile } from '../hooks/useIsMobile';
9: import '../css/page-header.css';
10: 
11: const ESTADO_COLORS = {
12:   SIMULADA: '#3b82f6',
13:   EMITIDA: '#146c43',
14:   ANULADA: '#dc3545',
15: };
16: 
17: const STATUS_COLORS = {
18:   PENDIENTE: '#EF9F27',
19:   REVISION: '#3b82f6',
20:   COMPLETADO: '#146c43',
21:   ANULADO: '#dc3545',
22: };
23: 
24: const FACTURACION_COLORS = {
25:   NO_FACTURADO: '#6c757d',
26:   PARCIAL: '#EF9F27',
27:   FACTURADO: '#146c43',
28: };
29: 
30: const FACTURACION_LABELS = {
31:   NO_FACTURADO: 'Sin facturar',
32:   PARCIAL: 'Parcial',
33:   FACTURADO: 'Facturado',
34: };
35: 
36: const TIPO_LABELS = {
37:   FACTURA: 'Factura',
38:   ANTICIPO: 'Anticipo',
39: };
40: 
41: const FILTROS_ESTADO = [
42:   { value: '', label: 'Todos', dot: null },
43:   { value: 'SIMULADA', label: 'Simulada', dot: ESTADO_COLORS.SIMULADA },
44:   { value: 'EMITIDA', label: 'Emitida', dot: ESTADO_COLORS.EMITIDA },
45:   { value: 'ANULADA', label: 'Anulada', dot: ESTADO_COLORS.ANULADA },
46: ];
47: 
48: const fechaHoy = () => {
49:   const d = new Date();
50:   const mes = String(d.getMonth() + 1).padStart(2, '0');
51:   const dia = String(d.getDate()).padStart(2, '0');
52:   return `${d.getFullYear()}-${mes}-${dia}`;
53: };
54: 
55: const normalizar = (str) =>
56:   (str ?? '')
57:     .toString()
58:     .normalize('NFD')
59:     .split('')
60:     .filter((c) => c.charCodeAt(0) < 0x0300 || c.charCodeAt(0) > 0x036f)
61:     .join('')
62:     .toLowerCase();
63: 
64: const Facturacion = () => {
65:   const [searchParams] = useSearchParams();
66:   const clienteParam = searchParams.get('cliente') || '';
67:   const fechaParam = searchParams.get('fecha') || '';
68: 
69:   const [facturas, setFacturas] = useState([]);
70:   const [clientes, setClientes] = useState([]);
71:   const [remitosPendientes, setRemitosPendientes] = useState([]);
72:   const [cargandoPendientes, setCargandoPendientes] = useState(false);
73:   const [mostrarFacturados, setMostrarFacturados] = useState(false);
74:   const [fechaInicial, setFechaInicial] = useState(fechaHoy());
75:   const [loading, setLoading] = useState(true);
76:   const [filtroCliente, setFiltroCliente] = useState('');
77:   const [filtroTipo, setFiltroTipo] = useState('');
78:   const [filtroEstado, setFiltroEstado] = useState('');
79:   const [busquedaNumero, setBusquedaNumero] = useState('');
80:   const [selectedFacturaId, setSelectedFacturaId] = useState(null);
81:   const [modalFactura, setModalFactura] = useState(null);
82:   const isMobile = useIsMobile();
83:   const isAdmin =
84:     JSON.parse(localStorage.getItem('user'))?.rol === 'Administrador';
85: 
86:   useEffect(() => {
87:     cargarDatos();
88:   }, []);
89: 
90:   // Permite llegar desde Remitos con el cliente y la fecha ya seteados
91:   useEffect(() => {
92:     if (clienteParam) setFiltroCliente(clienteParam);
93:     if (fechaParam) setFechaInicial(fechaParam);
94:   }, [clienteParam, fechaParam]);
95: 
96:   const cargarDatos = async () => {
97:     try {
98:       setLoading(true);
99:       const [facturasRes, clientesRes] = await Promise.all([
100:         allFacturas(),
101:         allCliente(),
102:       ]);
103:       setFacturas(facturasRes.data);
104:       setClientes(clientesRes.data);
105:     } catch (error) {
106:       console.error('Error al cargar datos:', error);
107:     } finally {
108:       setLoading(false);
109:     }
110:   };
111: 
112:   // Remitos del cliente seleccionado, incluidos los que todavía no son
113:   // facturables (para poder ver por qué quedan pendientes).
114:   useEffect(() => {
115:     if (!filtroCliente) {
116:       setRemitosPendientes([]);
117:       return undefined;
118:     }
119: 
120:     let cancelado = false;
121:     const cargar = async () => {
122:       try {
123:         setCargandoPendientes(true);
124:         const res = await remitosDisponibles(filtroCliente, true);
125:         if (!cancelado) setRemitosPendientes(res.data || []);
126:       } catch (error) {
127:         console.error('Error al cargar remitos pendientes:', error);
128:         if (!cancelado) setRemitosPendientes([]);
129:       } finally {
130:         if (!cancelado) setCargandoPendientes(false);
131:       }
132:     };
133: 
134:     cargar();
135:     return () => {
136:       cancelado = true;
137:     };
138:   }, [filtroCliente]);
139: 
140:   const totalFacturado = (factura) =>
141:     (factura.remitos || []).reduce(
142:       (acc, item) => acc + parseFloat(item.cantidad_facturada || 0),
143:       0,
144:     );
145: 
146:   const hayFiltros = Boolean(
147:     filtroCliente || filtroTipo || filtroEstado || busquedaNumero,
148:   );
149: 
150:   const limpiarFiltros = () => {
151:     setFiltroCliente('');
152:     setFiltroTipo('');
153:     setFiltroEstado('');
154:     setBusquedaNumero('');
155:   };
156: 
157:   const facturasFiltradas = useMemo(() => {
158:     const query = normalizar(busquedaNumero.trim());
159:     return facturas.filter((factura) => {
160:       if (filtroCliente && factura.cliente_id !== Number(filtroCliente))
161:         return false;
162:       if (filtroTipo && factura.tipo !== filtroTipo) return false;
163:       if (filtroEstado && factura.estado !== filtroEstado) return false;
164:       if (query && !normalizar(factura.numero || `#${factura.id}`).includes(query))
165:         return false;
166:       return true;
167:     });
168:   }, [facturas, filtroCliente, filtroTipo, filtroEstado, busquedaNumero]);
169: 
170:   const pendientesVisibles = useMemo(
171:     () =>
172:       remitosPendientes.filter(
173:         (remito) =>
174:           mostrarFacturados || remito.estado_facturacion !== 'FACTURADO',
175:       ),
176:     [remitosPendientes, mostrarFacturados],
177:   );
178: 
179:   useEffect(() => {
180:     if (
181:       selectedFacturaId &&
182:       !facturasFiltradas.some((f) => f.id === selectedFacturaId)
183:     ) {
184:       setSelectedFacturaId(null);
185:     }
186:   }, [facturasFiltradas, selectedFacturaId]);
187: 
188:   const facturaSeleccionada = facturas.find(
189:     (f) => f.id === selectedFacturaId,
190:   );
191: 
192:   const getNombreCliente = (id) => {
193:     const c = clientes.find((cl) => cl.id === id);
194:     return c ? c.razon_social : `Cliente #${id}`;
195:   };
196: 
197:   const formatDate = (dateStr) => {
198:     if (!dateStr) return '—';
199:     return new Date(dateStr).toLocaleDateString('es-AR');
200:   };
201: 
202:   const formatDateTime = (dateStr) => {
203:     if (!dateStr) return '—';
204:     return new Date(dateStr).toLocaleString('es-AR');
205:   };
206: 
207:   const handleAnular = async (factura) => {
208:     const confirmMessage =
209:       factura.tipo === 'ANTICIPO'
210:         ? '¿Está seguro de anular este anticipo?'
211:         : `¿Está seguro de anular la factura ${
212:             factura.numero || `#${factura.id}`
213:           }? Los remitos asociados liberarán su saldo pendiente.`;
214:     if (!window.confirm(confirmMessage)) return;
215:     try {
216:       await anularFactura(factura.id);
217:       await cargarDatos();
218:     } catch (error) {
219:       console.error('Error al anular:', error);
220:       window.alert(
221:         error.response?.data?.message || 'No se pudo anular la factura.',
222:       );
223:     }
224:   };
225: 
226:   const renderBadge = (estado) => (
227:     <span
228:       className="lista-badge"
229:       style={{ backgroundColor: ESTADO_COLORS[estado] || '#6c757d' }}
230:     >
231:       {estado}
232:     </span>
233:   );
234: 
235:   const renderBadgeFacturacion = (estadoFact) => {
236:     const estado = estadoFact || 'NO_FACTURADO';
237:     return (
238:       <span
239:         className="lista-badge"
240:         style={{
241:           backgroundColor: FACTURACION_COLORS[estado] || '#6c757d',
242:         }}
243:         title="Estado de facturación"
244:       >
245:         {FACTURACION_LABELS[estado] || estado}
246:       </span>
247:     );
248:   };
249: 
250:   const abrirFactura = (remito = null) => {
251:     setModalFactura({
252:       remito,
253:       clienteId: remito?.destination_client_id || filtroCliente,
254:       fecha: fechaInicial,
255:     });
256:   };
257: 
258:   const renderDetalle = () => {
259:     const factura = facturaSeleccionada;
260:     const total = totalFacturado(factura);
261: 
262:     return (
263:       <div className="lista-box lista-detalle__box">
264:         <div className="lista-box__header">
265:           <h4 className="lista-box__title">
266:             <Receipt size={16} />
267:             Factura {factura.numero || `#${factura.id}`}
268:           </h4>
269:           <div className="d-flex align-items-center gap-2">
270:             <span className="lista-badge lista-badge--pill">
271:               {TIPO_LABELS[factura.tipo] || factura.tipo}
272:             </span>
273:             {renderBadge(factura.estado)}
274:             <button
275:               className="lista-cerrar"
276:               title="Cerrar detalle"
277:               onClick={() => setSelectedFacturaId(null)}
278:             >
279:               <X size={14} />
280:             </button>
281:           </div>
282:         </div>
283:         <div className="lista-box__body">
284:           <dl className="lista-kv">
285:             <dt>Cliente</dt>
286:             <dd>{getNombreCliente(factura.cliente_id)}</dd>
287:             <dt>Fecha</dt>
288:             <dd>{formatDate(factura.fecha)}</dd>
289:             <dt>Total facturado</dt>
290:             <dd>
291:               {factura.tipo === 'ANTICIPO'
292:                 ? '—'
293:                 : `${total.toFixed(2)} (en ${factura.remitos?.length || 0} remito${
294:                     (factura.remitos?.length || 0) !== 1 ? 's' : ''
295:                   })`}
296:             </dd>
297:             {factura.notas && (
298:               <>
299:                 <dt>Notas</dt>
300:                 <dd>{factura.notas}</dd>
301:               </>
302:             )}
303:             <dt>Creada</dt>
304:             <dd>
305:               {formatDateTime(factura.createdAt)}
306:               {factura.creadoPor &&
307:                 ` por ${factura.creadoPor.nombre || factura.creadoPor.email}`}
308:             </dd>
309:           </dl>
310: 
311:           {(factura.remitos || []).length > 0 && (
312:             <table className="lista-items">
313:               <thead>
314:                 <tr>
315:                   <th>Remito</th>
316:                   <th>Fecha</th>
317:                   <th className="text-end">Cantidad facturada</th>
318:                 </tr>
319:               </thead>
320:               <tbody>
321:                 {factura.remitos.map((item) => (
322:                   <tr key={item.id}>
323:                     <td>{item.remito?.remito_number || `#${item.remito_id}`}</td>
324:                     <td>
325:                       {formatDate(item.remito?.issued_at || item.remito?.createdAt)}
326:                     </td>
327:                     <td className="text-end lista-items__cantidad">
328:                       {parseFloat(item.cantidad_facturada || 0).toFixed(2)}
329:                     </td>
330:                   </tr>
331:                 ))}
332:               </tbody>
333:               <tfoot>
334:                 <tr>
335:                   <td colSpan={2}>Total</td>
336:                   <td className="text-end">{total.toFixed(2)}</td>
337:                 </tr>
338:               </tfoot>
339:             </table>
340:           )}
341: 
342:           {factura.estado !== 'ANULADA' && isAdmin && (
343:             <div className="lista-box__acciones">
344:               <button
345:                 className="lista-btn lista-btn--danger"
346:                 onClick={() => handleAnular(factura)}
347:               >
348:                 <X size={14} /> Anular factura
349:               </button>
350:             </div>
351:           )}
352:         </div>
353:       </div>
354:     );
355:   };
356: 
357:   const renderPendientes = () => (
358:     <div className="lista-box mb-3">
359:       <div className="lista-box__header">
360:         <h4 className="lista-box__title">
361:           <Receipt size={16} />
362:           Remitos pendientes de facturar
363:         </h4>
364:         {filtroCliente && (
365:           <label className="d-flex align-items-center gap-2 small text-muted">
366:             <input
367:               type="checkbox"
368:               checked={mostrarFacturados}
369:               onChange={(e) => setMostrarFacturados(e.target.checked)}
370:             />
371:             Ver también los facturados
372:           </label>
373:         )}
374:       </div>
375: 
376:       {!filtroCliente ? (
377:         <div className="lista-box__body">
378:           <p className="lista-vacio mb-0">
379:             Seleccioná un cliente para ver sus remitos pendientes de
380:             facturación.
381:           </p>
382:         </div>
383:       ) : cargandoPendientes ? (
384:         <div className="lista-box__body justify-content-center align-items-center">
385:           <Spinner />
386:         </div>
387:       ) : pendientesVisibles.length === 0 ? (
388:         <div className="lista-box__body">
389:           <p className="lista-vacio mb-0">
390:             Este cliente no tiene remitos pendientes de facturación.
391:           </p>
392:         </div>
393:       ) : (
394:         <div className="lista-scroll">
395:           <table className="lista-table">
396:             <thead>
397:               <tr>
398:                 <th>N° Remito</th>
399:                 <th>Fecha</th>
400:                 <th>Estado</th>
401:                 <th className="text-end">Total</th>
402:                 <th className="text-end">Facturado</th>
403:                 <th className="text-end">Saldo</th>
404:                 <th>Facturación</th>
405:                 <th className="text-end">Acción</th>
406:               </tr>
407:             </thead>
408:             <tbody>
409:               {pendientesVisibles.map((remito) => (
410:                 <tr key={remito.id} className="lista-table__row">
411:                   <td className="lista-table__numero">
412:                     {remito.remito_number}
413:                   </td>
414:                   <td>{formatDate(remito.issued_at || remito.createdAt)}</td>
415:                   <td>
416:                     <span
417:                       className="lista-badge"
418:                       style={{
419:                         backgroundColor: STATUS_COLORS[remito.status] || '#6c757d',
420:                       }}
421:                     >
422:                       {remito.status}
423:                     </span>
424:                   </td>
425:                   <td className="text-end">
426:                     {Number(remito.total_remitido || 0).toFixed(2)}
427:                   </td>
428:                   <td className="text-end">
429:                     {Number(remito.facturado || 0).toFixed(2)}
430:                   </td>
431:                   <td className="text-end">
432:                     {Number(
433:                       remito.saldo_facturacion ?? remito.saldo ?? 0,
434:                     ).toFixed(2)}
435:                   </td>
436:                   <td>{renderBadgeFacturacion(remito.estado_facturacion)}</td>
437:                   <td className="text-end">
438:                     {remito.facturable && isAdmin ? (
439:                       <button
440:                         className="lista-btn lista-btn--primary"
441:                         title="Facturar este remito"
442:                         onClick={() => abrirFactura(remito)}
443:                       >
444:                         <Receipt size={14} /> Facturar
445:                       </button>
446:                     ) : (
447:                       <small className="text-muted">
448:                         {remito.motivo_bloqueo || '—'}
449:                       </small>
450:                     )}
451:                   </td>
452:                 </tr>
453:               ))}
454:             </tbody>
455:           </table>
456:         </div>
457:       )}
458:     </div>
459:   );
460: 
461:   if (loading) return <Spinner />;
462: 
463:   return (
464:     <div className="lista py-4">
465:       <div className="d-flex justify-content-between align-items-center mb-3">
466:         <div>
467:           <h2 className="page-header__title">
468:             <Receipt size={22} className="page-header__icon" />
469:             Facturación
470:           </h2>
471:           <p className="page-header__subtitle">
472:             {filtroCliente
473:               ? `Facturando a ${getNombreCliente(Number(filtroCliente))} · fecha ${formatDate(fechaInicial)}`
474:               : hayFiltros
475:                 ? `${facturasFiltradas.length} de ${facturas.length} facturas`
476:                 : `${facturas.length} factura${
477:                     facturas.length !== 1 ? 's' : ''
478:                   } registrada${facturas.length !== 1 ? 's' : ''}`}
479:           </p>
480:         </div>
481: 
482:         {isAdmin && (
483:           <button className="btn-primary" onClick={() => abrirFactura()}>
484:             <Plus size={16} className={isMobile ? '' : 'me-2'} />
485:             {!isMobile && 'Nueva Factura'}
486:           </button>
487:         )}
488:       </div>
489: 
490:       <div className="lista-surface">
491:         <div className="lista-surface__header">
492:           <h3 className="lista-surface__title">
493:             <Receipt size={16} />
494:             Registros
495:           </h3>
496:           <div className="lista-pills">
497:             {[
498:               { value: '', label: 'Todos' },
499:               { value: 'FACTURA', label: 'Facturas' },
500:               { value: 'ANTICIPO', label: 'Anticipos' },
501:             ].map((filtro) => (
502:               <button
503:                 key={filtro.value || 'todos'}
504:                 className={`lista-pill ${
505:                   filtroTipo === filtro.value ? 'lista-pill--active' : ''
506:                 }`}
507:                 onClick={() => setFiltroTipo(filtro.value)}
508:               >
509:                 {filtro.label} (
510:                 {
511:                   facturas.filter(
512:                     (f) => !filtro.value || f.tipo === filtro.value,
513:                   ).length
514:                 }
515:                 )
516:               </button>
517:             ))}
518:           </div>
519:           <div className="lista-pills">
520:             {FILTROS_ESTADO.map((filtro) => (
521:               <button
522:                 key={filtro.value}
523:                 className={`lista-pill ${
524:                   filtroEstado === filtro.value ? 'lista-pill--active' : ''
525:                 }`}
526:                 onClick={() => setFiltroEstado(filtro.value)}
527:               >
528:                 {filtro.dot && (
529:                   <span
530:                     className="lista-pill__dot"
531:                     style={{ backgroundColor: filtro.dot }}
532:                   />
533:                 )}
534:                 {filtro.label} (
535:                 {
536:                   facturas.filter(
537:                     (f) => !filtro.value || f.estado === filtro.value,
538:                   ).length
539:                 }
540:                 )
541:               </button>
542:             ))}
543:           </div>
544:         </div>
545: 
546:         <div className="lista-filtros">
547:           <div className="lista-filtros__group lista-filtros__group--grow">
548:             <label className="lista-filtros__label">N° Factura</label>
549:             <div className="lista-filtros__search">
550:               <Search size={14} />
551:               <input
552:                 type="text"
553:                 className="lista-filtros__input"
554:                 placeholder="Buscar por número..."
555:                 value={busquedaNumero}
556:                 onChange={(e) => setBusquedaNumero(e.target.value)}
557:               />
558:             </div>
559:           </div>
560: 
561:           <div className="lista-filtros__group">
562:             <label className="lista-filtros__label">Cliente</label>
563:             <select
564:               className="lista-filtros__input"
565:               value={filtroCliente}
566:               onChange={(e) => setFiltroCliente(e.target.value)}
567:             >
568:               <option value="">Todos</option>
569:               {clientes.map((cliente) => (
570:                 <option key={cliente.id} value={cliente.id}>
571:                   {cliente.razon_social}
572:                 </option>
573:               ))}
574:             </select>
575:           </div>
576: 
577:           <button
578:             className="lista-filtros__limpiar"
579:             onClick={limpiarFiltros}
580:             disabled={!hayFiltros}
581:           >
582:             Limpiar filtros
583:           </button>
584:         </div>
585: 
586:         {renderPendientes()}
587: 
588:         {isMobile ? (
589:           <div className="lista-scroll">
590:             <div className="d-flex flex-column gap-2">
591:               {facturasFiltradas.length === 0 ? (
592:                 <p className="lista-vacio">
593:                   {hayFiltros
594:                     ? 'Sin resultados para los filtros aplicados'
595:                     : 'Sin facturas registradas'}
596:                 </p>
597:               ) : (
598:                 facturasFiltradas.map((factura) => (
599:                   <div
600:                     key={factura.id}
601:                     className={`lista-card ${
602:                       selectedFacturaId === factura.id
603:                         ? 'lista-card--selected'
604:                         : ''
605:                     }`}
606:                     style={{
607:                       '--lista-status':
608:                         ESTADO_COLORS[factura.estado] || '#6c757d',
609:                     }}
610:                     onClick={() =>
611:                       setSelectedFacturaId(
612:                         selectedFacturaId === factura.id ? null : factura.id,
613:                       )
614:                     }
615:                   >
616:                     <div className="d-flex justify-content-between align-items-start">
617:                       <div className="flex-grow-1">
618:                         <div className="d-flex align-items-center gap-2 mb-1">
619:                           <h6 className="lista-card__numero">
620:                             {factura.numero || `#${factura.id}`}
621:                           </h6>
622:                           {renderBadge(factura.estado)}
623:                         </div>
624:                         <small className="lista-card__dato">
625:                           {TIPO_LABELS[factura.tipo] || factura.tipo}
626:                           {' · '}
627:                           {getNombreCliente(factura.cliente_id)}
628:                         </small>
629:                         <small className="lista-card__dato">
630:                           {formatDate(factura.fecha)}
631:                           {' · '}
632:                           {factura.tipo === 'ANTICIPO'
633:                             ? 'Anticipo'
634:                             : `${(factura.remitos || []).length} remito(s)`}
635:                         </small>
636:                       </div>
637:                       {selectedFacturaId === factura.id ? (
638:                         <ChevronUp size={16} />
639:                       ) : (
640:                         <ChevronDown size={16} />
641:                       )}
642:                     </div>
643:                   </div>
644:                 ))
645:               )}
646:             </div>
647:           </div>
648:         ) : (
649:           <div className="lista-box">
650:             <div className="lista-scroll">
651:               <table className="lista-table">
652:                 <thead>
653:                   <tr>
654:                     <th>N° Factura</th>
655:                     <th>Tipo</th>
656:                     <th>Cliente</th>
657:                     <th>Fecha</th>
658:                     <th className="text-end">Remitos</th>
659:                     <th className="text-end">Total</th>
660:                     <th>Estado</th>
661:                     <th className="text-end">Acciones</th>
662:                   </tr>
663:                 </thead>
664:                 <tbody>
665:                   {facturasFiltradas.length === 0 ? (
666:                     <tr>
667:                       <td colSpan={8} className="lista-vacio">
668:                         {hayFiltros
669:                           ? 'Sin resultados para los filtros aplicados'
670:                           : 'Sin facturas registradas'}
671:                       </td>
672:                     </tr>
673:                   ) : (
674:                     facturasFiltradas.map((factura) => (
675:                       <tr
676:                         key={factura.id}
677:                         className={`lista-table__row ${
678:                           selectedFacturaId === factura.id
679:                             ? 'lista-table__row--selected'
680:                             : ''
681:                         }`}
682:                         style={{
683:                           '--lista-status':
684:                             ESTADO_COLORS[factura.estado] || '#6c757d',
685:                         }}
686:                         onClick={() =>
687:                           setSelectedFacturaId(
688:                             selectedFacturaId === factura.id ? null : factura.id,
689:                           )
690:                         }
691:                       >
692:                         <td className="lista-table__numero">
693:                           {factura.numero || `#${factura.id}`}
694:                         </td>
695:                         <td>
696:                           <span className="lista-badge lista-badge--neutral">
697:                             {TIPO_LABELS[factura.tipo] || factura.tipo}
698:                           </span>
699:                         </td>
700:                         <td>{getNombreCliente(factura.cliente_id)}</td>
701:                         <td>{formatDate(factura.fecha)}</td>
702:                         <td className="text-end">
703:                           {factura.tipo === 'ANTICIPO'
704:                             ? '—'
705:                             : factura.remitos?.length || 0}
706:                         </td>
707:                         <td className="text-end">
708:                           {factura.tipo === 'ANTICIPO'
709:                             ? '—'
710:                             : totalFacturado(factura).toFixed(2)}
711:                         </td>
712:                         <td>{renderBadge(factura.estado)}</td>
713:                         <td className="text-end">
714:                           <div className="lista-acciones">
715:                             {factura.estado !== 'ANULADA' && isAdmin && (
716:                               <button
717:                                 className="lista-btn lista-btn--icon lista-btn--danger"
718:                                 title="Anular factura"
719:                                 onClick={(e) => {
720:                                   e.stopPropagation();
721:                                   handleAnular(factura);
722:                                 }}
723:                               >
724:                                 <X size={14} />
725:                               </button>
726:                             )}
727:                           </div>
728:                         </td>
729:                       </tr>
730:                     ))
731:                   )}
732:                 </tbody>
733:               </table>
734:             </div>
735:           </div>
736:         )}
737: 
738:         {facturaSeleccionada ? (
739:           <div className="mt-3">{renderDetalle()}</div>
740:         ) : (
741:           facturasFiltradas.length > 0 && (
742:             <div className="lista-box lista-placeholder mt-3">
743:               Seleccioná una factura para ver su detalle.
744:             </div>
745:           )
746:         )}
747:       </div>
748: 
749:       {modalFactura && (
750:         <ModalFactura
751:           clientes={clientes}
752:           clienteInicial={modalFactura.clienteId}
753:           remitoInicial={modalFactura.remito}
754:           fechaInicial={modalFactura.fecha}
755:           onClose={() => setModalFactura(null)}
756:           onSave={async () => {
757:             setModalFactura(null);
758:             await cargarDatos();
759:           }}
760:         />
761:       )}
762:     </div>
763:   );
764: };
765: 
766: export default Facturacion;

(End of file - total 766 lines)
</content>
```

_Thinking:_

uracion.jsx fully.

---

## Assistant (Plan · MiniMax M3.1 Flash · 4.5s)

_Thinking:_

Now let me look at the Remitos.jsx key parts — the multi-select capabilities that don't exist yet, plus the migration file for facturas to understand the migration style.

Let me read the migration and check the Remitos.jsx selection state

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\migrations\\20261106000001-create-facturas.cjs"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\migrations\20261106000001-create-facturas.cjs</path>
<type>file</type>
<content>
1: 'use strict';
2: 
3: module.exports = {
4:   async up(queryInterface, Sequelize) {
5:     // ---------------------------------------------------------------
6:     // Helpers de existencia (idempotentes).
7:     // Ojo: el backend corre con nodemon + db.sync({ alter: false }),
8:     // que puede crear las tablas desde los modelos ANTES de que corra
9:     // esta migración. Por eso cada objeto se verifica por separado:
10:     // tabla, columna, índice y constraint.
11:     // ---------------------------------------------------------------
12:     const tableExists = async (tableName) => {
13:       const [result] = await queryInterface.sequelize.query(
14:         `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
15:          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}' LIMIT 1`
16:       );
17:       return result.length > 0;
18:     };
19: 
20:     const columnaExiste = async (tableName, columnName) => {
21:       const [result] = await queryInterface.sequelize.query(
22:         `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
23:          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${columnName}' LIMIT 1`
24:       );
25:       return result.length > 0;
26:     };
27: 
28:     const indiceExiste = async (tableName, indexName) => {
29:       const [result] = await queryInterface.sequelize.query(
30:         `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS 
31:          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}' AND INDEX_NAME = '${indexName}' LIMIT 1`
32:       );
33:       return result.length > 0;
34:     };
35: 
36:     const fkExiste = async (tableName, columnName) => {
37:       const [result] = await queryInterface.sequelize.query(
38:         `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
39:          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}' 
40:            AND COLUMN_NAME = '${columnName}' AND REFERENCED_TABLE_NAME IS NOT NULL LIMIT 1`
41:       );
42:       return result.length > 0;
43:     };
44: 
45:     // =================================================================
46:     // 1. TABLE facturas
47:     //    Cabecera de facturación (simulada en esta etapa, real en la
48:     //    próxima). Soporta facturas con N remitos, facturación parcial
49:     //    y anticipos sin remitos asociados.
50:     // =================================================================
51:     if (!(await tableExists('facturas'))) {
52:       await queryInterface.createTable('facturas', {
53:         id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
54:         company_id: { allowNull: false, type: Sequelize.INTEGER, defaultValue: 1 },
55:         cliente_id: { allowNull: false, type: Sequelize.INTEGER },
56:         tipo: {
57:           allowNull: false, type: Sequelize.ENUM('FACTURA', 'ANTICIPO'),
58:           defaultValue: 'FACTURA',
59:         },
60:         fecha: { allowNull: false, type: Sequelize.DATEONLY },
61:         numero: { allowNull: true, type: Sequelize.STRING(20) },
62:         estado: {
63:           allowNull: false, type: Sequelize.ENUM('SIMULADA', 'EMITIDA', 'ANULADA'),
64:           defaultValue: 'SIMULADA',
65:         },
66:         notas: { allowNull: true, type: Sequelize.TEXT },
67:         created_by: { allowNull: true, type: Sequelize.INTEGER },
68:         createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
69:         updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
70:       });
71:     }
72: 
73:     // =================================================================
74:     // 2. numero_activo: columna generada que expone `numero` solo
75:     //    cuando la factura NO está anulada. El índice único sobre esta
76:     //    columna garantiza N° de factura único por empresa entre las
77:     //    facturas vigentes, permitiendo reutilizar el número luego de
78:     //    anular (los NULL no colisionan en MySQL/MariaDB).
79:     // =================================================================
80:     if (!(await columnaExiste('facturas', 'numero_activo'))) {
81:       await queryInterface.sequelize.query(
82:         `ALTER TABLE facturas
83:            ADD COLUMN numero_activo VARCHAR(20)
84:              GENERATED ALWAYS AS (CASE WHEN estado <> 'ANULADA' THEN numero ELSE NULL END) STORED`
85:       );
86:     }
87:     if (!(await indiceExiste('facturas', 'facturas_numero_activo_unique'))) {
88:       await queryInterface.sequelize.query(
89:         `ALTER TABLE facturas ADD UNIQUE INDEX facturas_numero_activo_unique (company_id, numero_activo)`
90:       );
91:     }
92: 
93:     if (!(await indiceExiste('facturas', 'facturas_cliente_id'))) {
94:       await queryInterface.addIndex('facturas', ['cliente_id'], { name: 'facturas_cliente_id' });
95:     }
96:     if (!(await indiceExiste('facturas', 'facturas_estado'))) {
97:       await queryInterface.addIndex('facturas', ['estado'], { name: 'facturas_estado' });
98:     }
99: 
100:     // FKs (si la tabla la creó db.sync desde los modelos, puede venir sin ellas)
101:     if (!(await fkExiste('facturas', 'cliente_id'))) {
102:       await queryInterface.addConstraint('facturas', {
103:         fields: ['cliente_id'],
104:         type: 'foreign key',
105:         name: 'facturas_cliente_id_fk',
106:         references: { table: 'clientes', field: 'id' },
107:         onUpdate: 'CASCADE',
108:         onDelete: 'RESTRICT',
109:       });
110:     }
111:     if (!(await fkExiste('facturas', 'created_by'))) {
112:       await queryInterface.addConstraint('facturas', {
113:         fields: ['created_by'],
114:         type: 'foreign key',
115:         name: 'facturas_created_by_fk',
116:         references: { table: 'users', field: 'id' },
117:         onUpdate: 'CASCADE',
118:         onDelete: 'SET NULL',
119:       });
120:     }
121: 
122:     // =================================================================
123:     // 3. TABLE remito_facturas
124:     //    Detalle factura <-> remito. Una factura puede tener N remitos,
125:     //    un remito puede aparecer en N facturas (facturación parcial
126:     //    repartida), y `cantidad_facturada` permite facturar menos del
127:     //    total del remito (unidades base / litros).
128:     // =================================================================
129:     if (!(await tableExists('remito_facturas'))) {
130:       await queryInterface.createTable('remito_facturas', {
131:         id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
132:         factura_id: { allowNull: false, type: Sequelize.INTEGER },
133:         remito_id: { allowNull: false, type: Sequelize.INTEGER },
134:         cantidad_facturada: { allowNull: false, type: Sequelize.DECIMAL(15, 4) },
135:         createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
136:         updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
137:       });
138:     }
139: 
140:     if (!(await indiceExiste('remito_facturas', 'remito_facturas_unico'))) {
141:       await queryInterface.addIndex('remito_facturas', ['factura_id', 'remito_id'], {
142:         name: 'remito_facturas_unico',
143:         unique: true,
144:       });
145:     }
146:     if (!(await indiceExiste('remito_facturas', 'remito_facturas_remito'))) {
147:       await queryInterface.addIndex('remito_facturas', ['remito_id'], {
148:         name: 'remito_facturas_remito',
149:       });
150:     }
151: 
152:     if (!(await fkExiste('remito_facturas', 'factura_id'))) {
153:       await queryInterface.addConstraint('remito_facturas', {
154:         fields: ['factura_id'],
155:         type: 'foreign key',
156:         name: 'remito_facturas_factura_fk',
157:         references: { table: 'facturas', field: 'id' },
158:         onUpdate: 'CASCADE',
159:         onDelete: 'CASCADE',
160:       });
161:     }
162:     if (!(await fkExiste('remito_facturas', 'remito_id'))) {
163:       await queryInterface.addConstraint('remito_facturas', {
164:         fields: ['remito_id'],
165:         type: 'foreign key',
166:         name: 'remito_facturas_remito_fk',
167:         references: { table: 'remitos', field: 'id' },
168:         onUpdate: 'CASCADE',
169:         onDelete: 'RESTRICT',
170:       });
171:     }
172:   },
173: 
174:   async down(queryInterface) {
175:     const tableExists = async (tableName) => {
176:       const [result] = await queryInterface.sequelize.query(
177:         `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
178:          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}' LIMIT 1`
179:       );
180:       return result.length > 0;
181:     };
182: 
183:     if (await tableExists('remito_facturas')) {
184:       await queryInterface.dropTable('remito_facturas');
185:     }
186:     if (await tableExists('facturas')) {
187:       await queryInterface.dropTable('facturas');
188:     }
189:   },
190: };

(End of file - total 190 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components\\Remitos.jsx",
  "offset": 100,
  "limit": 270
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\donAsdrubal\src\components\Remitos.jsx</path>
<type>file</type>
<content>
100:   const [filtroHasta, setFiltroHasta] = useState('');
101:   const [filtroIngeniero, setFiltroIngeniero] = useState('');
102:   const [filtroFacturacion, setFiltroFacturacion] = useState('');
103:   const [facturaModalRemito, setFacturaModalRemito] = useState(null);
104:   const [ingenieros, setIngenieros] = useState([]);
105:   const [selectedRemitoId, setSelectedRemitoId] = useState(null);
106:   const [remitoDetalle, setRemitoDetalle] = useState(null);
107:   const [loadingDetalle, setLoadingDetalle] = useState(false);
108:   const [archivos, setArchivos] = useState([]);
109:   const [selectedArchivoIdx, setSelectedArchivoIdx] = useState(0);
110:   const [vista, setVista] = useState('listado');
111:   const isMobile = useIsMobile();
112:   const isAdmin = JSON.parse(localStorage.getItem('user'))?.rol === 'Administrador';
113: 
114:   useEffect(() => {
115:     cargarDatos();
116:   }, []);
117: 
118:   useEffect(() => {
119:     if (selectedRemitoId) {
120:       cargarDetalleRemito(selectedRemitoId);
121:     } else {
122:       setRemitoDetalle(null);
123:     }
124:   }, [selectedRemitoId]);
125: 
126:   useEffect(() => {
127:     const timer = setTimeout(() => setBusquedaProducto(inputProducto), 300);
128:     return () => clearTimeout(timer);
129:   }, [inputProducto]);
130: 
131:   const cargarDatos = async () => {
132:     try {
133:       setLoading(true);
134:       const [remitosRes, depositosRes, clientesRes, ingenierosRes] =
135:         await Promise.all([
136:           allRemitos(),
137:           allWarehouses(),
138:           allCliente(),
139:           isAdmin ? allIngenieros() : Promise.resolve(null),
140:         ]);
141:       setRemitos(remitosRes.data);
142:       setDepositos(depositosRes.data);
143:       setClientes(clientesRes.data);
144:       setIngenieros(ingenierosRes?.data ?? []);
145:     } catch (error) {
146:       console.error('Error al cargar datos:', error);
147:     } finally {
148:       setLoading(false);
149:     }
150:   };
151: 
152:   const cargarDetalleRemito = async (id) => {
153:     try {
154:       setLoadingDetalle(true);
155:       const [res, resArchivos] = await Promise.all([
156:         getRemito(id),
157:         getArchivos(id),
158:       ]);
159:       setRemitoDetalle(res.data);
160:       setArchivos(resArchivos.data || []);
161:       setSelectedArchivoIdx(0);
162:     } catch (error) {
163:       console.error('Error al cargar detalle:', error);
164:     } finally {
165:       setLoadingDetalle(false);
166:     }
167:   };
168: 
169:   const handleSelectRemito = (remito) => {
170:     setSelectedRemitoId(remito.id);
171:   };
172: 
173:   const handleAnular = async (id) => {
174:     const remito = remitos.find((item) => item.id === id);
175:     const confirmMessage = remito?.destination_warehouse_id
176:       ? `¿Está seguro de anular la transferencia entre ${getNombreDeposito(remito.origin_warehouse_id)} y ${getNombreDeposito(remito.destination_warehouse_id)}? El stock volverá al origen solo si continúa disponible en el destino.`
177:       : '¿Está seguro de anular este remito? Se revertirá el stock.';
178:     if (
179:       !window.confirm(confirmMessage)
180:     )
181:       return;
182:     try {
183:       await cancelRemito(id);
184:       await cargarDatos();
185:       if (selectedRemitoId === id) {
186:         setSelectedRemitoId(null);
187:       }
188:     } catch (error) {
189:       console.error('Error al anular:', error);
190:       window.alert(error.response?.data?.message || 'No se pudo anular el remito.');
191:     }
192:   };
193: 
194:   const handleConfirmar = async (id) => {
195:     try {
196:       const user = JSON.parse(localStorage.getItem('user'));
197:       await confirmRemito(id, user?.id);
198:       await cargarDatos();
199:       if (selectedRemitoId === id) {
200:         cargarDetalleRemito(id);
201:       }
202:     } catch (error) {
203:       console.error('Error al confirmar:', error);
204:     }
205:   };
206: 
207:   const getNombreDeposito = (id) => {
208:     const d = depositos.find((dep) => dep.id === id);
209:     return d ? `${d.nombre} (${d.codigo})` : `Depósito #${id}`;
210:   };
211: 
212:   const getNombreCliente = (id) => {
213:     const c = clientes.find((cl) => cl.id === id);
214:     return c ? c.razon_social : `Cliente #${id}`;
215:   };
216: 
217:   const getDestinoRemito = (remito) =>
218:     remito.destination_warehouse_id
219:       ? getNombreDeposito(remito.destination_warehouse_id)
220:       : getNombreCliente(remito.destination_client_id);
221: 
222:   const formatDate = (dateStr) => {
223:     if (!dateStr) return '—';
224:     return new Date(dateStr).toLocaleDateString('es-AR');
225:   };
226: 
227:   const formatDateTime = (dateStr) => {
228:     if (!dateStr) return '—';
229:     return new Date(dateStr).toLocaleString('es-AR');
230:   };
231: 
232:   const hayFiltros = Boolean(
233:     inputProducto ||
234:       busquedaNumero ||
235:       filtroCliente ||
236:     filtroTipo ||
237:       filtroDeposito ||
238:       filtroDesde ||
239:       filtroHasta ||
240:       filtroIngeniero ||
241:       filtroEstado ||
242:       filtroFacturacion,
243:   );
244: 
245:   const limpiarFiltros = () => {
246:     setInputProducto('');
247:     setBusquedaProducto('');
248:     setBusquedaNumero('');
249:     setFiltroCliente('');
250:     setFiltroTipo('');
251:     setFiltroDeposito('');
252:     setFiltroDesde('');
253:     setFiltroHasta('');
254:     setFiltroIngeniero('');
255:     setFiltroEstado('');
256:     setFiltroFacturacion('');
257:   };
258: 
259:   const remitosBase = useMemo(() => {
260:     const queryProducto = normalizar(busquedaProducto.trim());
261:     const queryNumero = normalizar(busquedaNumero.trim());
262: 
263:     return remitos.filter((remito) => {
264:       if (filtroCliente && remito.destination_client_id !== Number(filtroCliente))
265:         return false;
266:       if (
267:         filtroDeposito &&
268:         remito.origin_warehouse_id !== Number(filtroDeposito) &&
269:         remito.destination_warehouse_id !== Number(filtroDeposito)
270:       )
271:         return false;
272: 
273:       if (queryNumero && !normalizar(remito.remito_number).includes(queryNumero))
274:         return false;
275: 
276:       if (queryProducto) {
277:         const coincideProducto = (remito.items || []).some(
278:           (item) =>
279:             normalizar(item.variante?.producto?.nombre).includes(queryProducto) ||
280:             normalizar(item.variante?.codigo).includes(queryProducto) ||
281:             normalizar(item.variante?.presentacion?.nombre).includes(queryProducto),
282:         );
283:         if (!coincideProducto) return false;
284:       }
285: 
286:       if (filtroDesde || filtroHasta) {
287:         const fecha = new Date(getFechaRemito(remito));
288:         if (filtroDesde && fecha < new Date(`${filtroDesde}T00:00:00`))
289:           return false;
290:         if (filtroHasta && fecha > new Date(`${filtroHasta}T23:59:59`))
291:           return false;
292:       }
293: 
294:       if (filtroIngeniero) {
295:         const ingId = Number(filtroIngeniero);
296:         const cliente = clientes.find(
297:           (c) => c.id === remito.destination_client_id,
298:         );
299:         const asignado = cliente?.ingenieros?.some(
300:           (ing) => ing.user_id === ingId,
301:         );
302:         if (!asignado && remito.creadoPor?.id !== ingId) return false;
303:       }
304: 
305:       if (filtroFacturacion) {
306:         if (remito.destination_warehouse_id) return false;
307:         const estadoFact = remito.estado_facturacion || 'NO_FACTURADO';
308:         if (estadoFact !== filtroFacturacion) return false;
309:       }
310: 
311:       return true;
312:     });
313:   }, [
314:     remitos,
315:     clientes,
316:     busquedaProducto,
317:     busquedaNumero,
318:     filtroCliente,
319:     filtroDeposito,
320:     filtroDesde,
321:     filtroHasta,
322:     filtroIngeniero,
323:     filtroFacturacion,
324:   ]);
325: 
326:   const remitosPorTipo = filtroTipo
327:     ? remitosBase.filter((remito) =>
328:         filtroTipo === 'internos'
329:           ? Boolean(remito.destination_warehouse_id)
330:           : !remito.destination_warehouse_id,
331:       )
332:     : remitosBase;
333: 
334:   const remitosFiltrados = filtroEstado
335:     ? remitosPorTipo.filter((r) => r.status === filtroEstado)
336:     : remitosPorTipo;
337: 
338:   const contarPorEstado = (estado) =>
339:     estado
340:       ? remitosPorTipo.filter((r) => r.status === estado).length
341:       : remitosPorTipo.length;
342: 
343:   const contarPorTipo = (tipo) =>
344:     tipo
345:       ? remitosBase.filter((remito) =>
346:           tipo === 'internos'
347:             ? Boolean(remito.destination_warehouse_id)
348:             : !remito.destination_warehouse_id,
349:         ).length
350:       : remitosBase.length;
351: 
352:   useEffect(() => {
353:     if (
354:       selectedRemitoId &&
355:       !remitosFiltrados.some((r) => r.id === selectedRemitoId)
356:     ) {
357:       setSelectedRemitoId(null);
358:     }
359:   }, [remitosFiltrados, selectedRemitoId]);
360: 
361:   const remitoSeleccionado = remitos.find((r) => r.id === selectedRemitoId);
362: 
363:   const totalItems = (remitoDetalle?.items || []).reduce(
364:     (acc, item) => acc + parseFloat(item.quantity_dispatched || 0),
365:     0,
366:   );
367: 
368:   const renderBadgeFacturacion = (estadoFact, extraClass = '') => {
369:     const estado = estadoFact || 'NO_FACTURADO';

(Showing lines 100-369 of 1345. Use offset=370 to continue.)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 29.7s)

_Thinking:_

Now I have a very solid picture. Let me think about the design.

## Current state summary

**Data model (backend):**
- `remitos` (id, remito_number, type, status[PENDIENTE|REVISION|COMPLETADO|ANULADO], origin_warehouse_id, destination_client_id, destination_warehouse_id, issued_at, ...)
- `remito_items` (id, remito_id, product_variant_id, quantity_requested [presentación], quantity_dispatched [base/litros])
- `remito_item_lots`
- `remito_facturas` (id, factura_id, remito_id, cantidad_facturada [base/litros]) — UNIQUE(factura_id, remito_id)
- `facturas` (id, cliente_id, tipo[FACTURA|ANTICIPO], fecha, numero, estado[SIMULADA|EMITIDA|ANULADA], notas, created_by)

**Key gap for feature #1 (partial product billing):**
- `remito_facturas` links only at remito granularity, one scalar in liters. There is no `remito_item_id`. To bill 20 units of product A and 150 L of product C, we need per-item billing records.
- Options:
  - A) Add `remito_item_id` to `remito_facturas` (nullable for backward compat) + unique(factura_id, remito_id, remito_item_id). Then the remito-level quantity becomes derived (sum of items). But existing rows have no remito_item_id.
  - B) New table `remito_factura_items` (factura_id, remito_id, remito_item_id, cantidad_facturada, precio?) — keeps `remito_facturas` for the remito-level rollup and adds item-level detail. Cleaner, backward compatible, and allows the "facturas" table to hold line items.
  - C) Add `factura_items` table (factura_id, producto/variante, cantidad, precio_unitario, subtotal) — a proper invoice line-item model, plus remito linkage.

**Critical unit issue:** The user says "20 unidades del producto A" (units = presentations) and "150 litros producto C". The remito item stores `quantity_requested` in presentation units and `quantity_dispatched` in base units (litros). The `cantidad_facturada` is in base units. For item-level partial billing, we must decide which unit to bill in. The cleanest: bill in base units (litros) to stay consistent with the existing `cantidad_facturada` semantics, but display in the UI in the presentation unit the user thinks in (the remito was created with "20 bidones" of product A). Actually, better: let the UI work in the same unit the user entered when creating the remito (presentation units), converting to base for storage. Hmm, but `quantity_dispatched` may differ from `quantity_requested * cantidad_base` due to FIFO rounding? Actually no — backend sets `quantity_dispatched = qtyBase` computed from `quantity_requested * cantidad_base`. So they're proportional. But if a product's presentation has `cantidad_base` changed later, ratio breaks. Safer: bill in base units (litros) and show both.

Actually let me reconsider — the simplest and most consistent: **bill in base units (litros)**, consistent with everything else (`cantidad_facturada` is in base units). In the UI, for each remito item show: producto, presentación, cantidad remitida (en base), ya facturado (en base), saldo (en base), and a number input for "a facturar". Optionally also show the presentation-unit equivalent (litros ÷ cantidad_base) as a hint, since users think in "bidones". That's a nice touch: "20 bidones (100 L)".

**Critical gap for feature #2 (pre-invoice / reservation):**
- Need a new entity: `prefacturas` or `cotizaciones` or `reservas`. The user wants:
  - Select multiple remitos (and possibly items) from the Remitos page.
  - Build a "cotización / pre-factura" with a target monetary amount (25000 USD).
  - Leave it in a "reserved" state so another person can't bill those remitos individually.

  **But there's NO money in the system.** No prices on products, no price per liter. So "el total de esto sería 25000 dlls" cannot be computed from data — it must be entered manually OR we need to introduce prices.

This is the central decision point I must ask the user about. Options:

  **Option 1 — Introduce prices (product variants get `precio_unitario` + currency).** Big change: needs a prices admin UI, migration, backfill, and the remito would need to snapshot prices at billing time. Then "25000 USD" becomes computable and the "seleccionar remitos hasta llegar a 25000" flow works naturally. This is the "real invoicing" (Etapa 2) direction.

  **Option 2 — Keep quantity-based; add a manual "importe" to the pre-factura.** The pre-factura has a manually entered `importe_total` (e.g. 25000 USD) and the selection of remitos is done by the user based on their knowledge. The reservation locks those remitos. This is lighter, matches the current "simulada" stage, and directly serves the user's scenario ("el cliente tiene 25000 USD, selecciono remito 3, 9 y 8").

  **Option 3 — Hybrid:** pre-factura has optional per-item price entries. When creating the prefactura, the user can enter prices for the products (a "cotización" has prices!), so the total is computed. This is actually the most faithful to "cotización": a quote has prices. And the pre-factura can carry those prices forward into the real invoice later (Etapa 2).

Given the user calls it "cotización o pre-factura" and mentions a monetary amount, Option 3 is quite elegant: the pre-factura (cotización) holds line items with quantity + unit price → subtotal → total in USD. That's the place where money first enters the system. Then when converting the prefactura into a factura, the quantities flow to `remito_facturas`/`remito_factura_items` and prices could later be stored on `facturas`.

But I should ask the user. Let me formulate the question.

Also important questions:
1. **Scope**: the backend is a separate repo (`C:\Job\Don Asdrubal\backend`) with uncommitted work. Do we implement in both repos? The plan needs to cover both. I should confirm.
2. **Reservation semantics**: Should the reservation block only *this user's* billing, or *everyone's*? The user says "evitar que venga otra persona y seleccione alguno de estos remitos y lo facture individualmente desconociendo el análisis y reserva previa" → so it should block everyone (hard lock), but with an "admin can release/override" escape hatch.
3. **Item-level partial billing in the pre-factura too?** Presumably yes, since the pre-factura should be convertible into a factura without recalculating.
4. **Expiration of the reservation** — should reservations expire? Maybe a state machine: BORRADOR → RESERVADO (confirmada) → FACTURADA / LIBERADA / VENCIDA.

Let me now think about the concrete design so the plan is high-quality.

### Proposed design

#### A. Item-level billing (Feature 1)

**Backend schema changes:**

New table `remito_factura_items`:
```
id, factura_id, remito_id, remito_item_id, product_variant_id,
cantidad_facturada DECIMAL(15,4)   -- en unidades base (litros)
createdAt, updatedAt
UNIQUE(factura_id, remito_item_id)
INDEX(remito_item_id)
```

And `remito_facturas` stays as the remito-level rollup (sum of items) for backward compatibility and cheap per-remito saldo queries. Actually there's a risk of double-source-of-truth divergence. Alternative: drop `cantidad_facturada` from `remito_facturas` and derive it from items. But existing data... Since the facturas feature is brand new and uncommitted (not in production yet — "Etapa 1" is WIP), we could just change the schema freely. But there may be test data.

Hmm. Let me think about which is cleaner for the long term. Given the module is still in WIP (uncommitted), I think the cleanest is:

Option: **Replace `remito_facturas.cantidad_facturada` with a two-level model**:
- `remito_facturas` (factura_id, remito_id) — no quantity, just the link. But then the "quantities" live in items.
- `remito_factura_items` (factura_id, remito_id, remito_item_id, cantidad_facturada).

But then for invoices created without item detail (ANTICIPO) there's nothing.

Risk: existing "scalar" invoices (there might be some created during testing) would need migration to distribute quantities across items — impossible to do faithfully. We could migrate them proportionally... or keep `remito_facturas.cantidad_facturada` as the authoritative "remito-level" amount and add the items table as a detail refinement where `remito_facturas.cantidad_facturada` = SUM of items when items exist.

Simplest robust approach that avoids migration pain and divergence:
- **Keep `remito_facturas`** with `cantidad_facturada` as the authoritative remito-level total (base units). It already exists and works, and the saldo calc stays intact.
- **Add `remito_factura_items`** with the per-item breakdown, and enforce at write time: `remito_facturas.cantidad_facturada == SUM(remito_factura_items.cantidad_facturada)` for the same factura+remito. New facturas always write both. Old facturas (without items) remain valid — they consume saldo at remito level, and item-level saldo computation must account for them.

Item-level saldo computation: for a remito_item, `facturado_item = SUM(remito_factura_items.cantidad_facturada WHERE factura.estado != 'ANULADA') + (legacy remito-level amounts not attributable to any item)`. Legacy amounts would need to be attributed. Simplest: for legacy facturas (no items), distribute the remito-level cantidad across items **proportionally to remaining balance**, computed at read time... that's messy and non-deterministic.

Given the module is WIP and uncommitted, I lean strongly toward: **migrate cleanly — no legacy data to preserve** (or preserve by deleting/regenerating test invoices). Let me check if there's production data... I can't check the DB. But I should ask/flag it.

Actually — let me reconsider once more. Is there a simpler design that avoids the two-table split?

**Alternative: single table `remito_factura_items` replaces `remito_facturas` entirely.** `remito_facturas` becomes a computed/derived thing. For the Facturación list view "Total facturado por remito" we do a SUM over the items table. That works fine, and it is a single source of truth. The `estado_facturacion` per remito derives from SUM(items) vs SUM(remito_items.quantity_dispatched).

I like this: **replace `remito_facturas` with `remito_factura_items`** where each row = (factura_id, remito_id, remito_item_id, cantidad_facturada). The old `remito_facturas` table can be dropped or kept as a compatibility view. Given it's WIP, drop it and migrate.

Hmm, but that ripples into `calcularSaldosFacturacion`, `facturacionService`, controllers, and the frontend's `factura.remitos[]` shape (which would become `factura.items[]`).

Wait. Let's think about what the invoice detail should look like after this change. An invoice should show:
```
Factura #1042 — Cliente X
Remito 000315
 Producto A (Bidón 20L)   20 und   100 L   $X
 Producto C (Tambor 200L)  1 und   150 L   $Y
```
That's a proper invoice with line items. This is much better UX and matches the user's mental model ("facturar solo 20 unidades del producto A y 150 litros producto C").

So the ideal target model:
- `factura_items` (factura_id, remito_id, remito_item_id, product_variant_id, cantidad [base], cantidad_presentacion, descripcion, precio_unitario?, importe?) — snapshot of product data at billing time.

Hmm, but then remito linkage is via remito_item_id, and `remito_facturas` becomes redundant.

Let me design pragmatically:

**Target schema:**

1. `remito_facturas` (MODIFIED): add nullable `remito_item_id`. When `remito_item_id` is NULL → legacy/remito-level allocation (only allowed if the remito has no items, or for migration). When set → item-level.
   - UNIQUE(factura_id, remito_id, remito_item_id) — but MySQL unique with NULLs doesn't enforce (NULLs are distinct), so legacy rows with NULL remito_item_id could duplicate. Need care.

2. Alternative: `factura_items` new table:
   ```
   id, factura_id, remito_id, remito_item_id, product_variant_id,
   cantidad DECIMAL(15,4),        -- unidades base
   cantidad_presentacion DECIMAL(15,4),  -- snapshot de lo que el usuario 输入ó
   descripcion VARCHAR(255),
   precio_unitario DECIMAL(15,4) NULL,   -- opcional, para la etapa de precios
   importe DECIMAL(15,4) NULL,
   createdAt, updatedAt
   UNIQUE(factura_id, remito_item_id)
   ```
   And `remito_facturas` keeps `cantidad_facturada` as a **derived denormalized rollup** (sum of its items) — maintained by the service. This keeps all existing queries working with zero changes and adds the item detail. Divergence risk is handled by computing it in one place (the service that creates invoices).

Actually, if I'm writing the invoice-creation code anyway, keeping `remito_facturas.cantidad_facturada` as a rollup is trivial and safe: on create, group items by remito and write both tables in the same transaction. On anular, the item rows stay but stop counting (same rule as today). Clean, backward compatible, minimal ripple.

**Item-level saldo** for the UI: for each remito item, we need `facturado_item`. Query: SUM over `remito_factura_items` joined to facturas (estado != ANULADA) grouped by remito_item_id. Plus, for legacy invoices that only have remito-level amounts (no items), we must still consume the remito's balance. Legacy consumption needs to be reflected at item level somehow...

Practical resolution: **eliminate legacy remito-level-only invoices.** Since the module is WIP/uncommitted, migrate any existing `remito_facturas` rows into item-level rows by distributing the cantidad proportionally over the remito's items (pro-rata by `quantity_dispatched`), or simply require a manual reset of the test data. I'll present this in the plan and flag it as a decision.

Actually simpler and cleaner: **since the module isn't in production yet, we can just delete the `remito_facturas` table content and the `facturas` table content** (reset Etapa 1 test data) and start with a clean item-level schema. Let me verify with the user whether there's real data.

Hmm — I shouldn't ask too many questions. Let me pick the design and ask 3-4 targeted questions.

#### B. Pre-factura / Cotización / Reserva (Feature 2)

**New entity: `cotizaciones` (o `prefacturas`)** — I'll name it `prefacturas` since the user said "pre-factura", but "cotización" is the business term. Let me propose `cotizaciones` table with tipo/prefactura semantics... Hmm. The user says "armar una especie de cotizacion o pre-factura y ya dejarla lista para facturar". So it's a **draft invoice** that is *reserved*. I'll call it `prefacturas`.

Schema:
```
prefacturas
  id, company_id, cliente_id,
  estado ENUM('BORRADOR','RESERVADA','FACTURADA','LIBERADA','VENCIDA') DEFAULT 'BORRADOR',
  fecha DATEONLY NULL,        -- fecha prevista de facturación
  numero_factura VARCHAR(20) NULL,  -- número preasignado de la factura
  notas TEXT,
  created_by, created_at, updated_at
  reservado_por, reservado_at
  expires_at DATETIME NULL
  factura_id NULL            -- factura generada
```

```
prefactura_items
  id, prefactura_id, remito_id, remito_item_id,
  product_variant_id,
  cantidad DECIMAL(15,4),         -- unidades base
  cantidad_presentacion DECIMAL(15,4),
  descripcion,
  precio_unitario DECIMAL(15,4) NULL,
  importe DECIMAL(15,4) NULL
```

The reservation blocks the remitos (or remito items) from being billed individually by anyone else. Enforcement:
- Backend `addFactura` validation: for each remito/quantity requested, check if there's an active reservation (prefactura in RESERVADA state, not expired) covering that remito. If so → 409/400 "El remito X está reservado por la prefactura #N (usuario, fecha)". Unless the request comes from the prefactura itself (converting it) or the user has admin override.
- The backend `remitos-disponibles` should mark reserved remitos with `reservado: true, reserva_prefactura_id, reserva_usuario` so the UI can show a badge "Reservado" and disable the "Facturar" button.
- Also: should the reservation reserve a *quantity* or the *whole remito*? The user's scenario: "selecciono remito3, remito9 y remito8 y el total de esto seria 25000 dlls" → whole remitos reserved. But with item-level billing, one might reserve partially. Simplest & consistent with the user's scenario: **reserve whole remitos** (the remito is locked for individual billing), with the prefactura carrying the specific item/quantity breakdown for the actual billing later. Hmm, but then if the prefactura bills only part of a remito, the rest of the remito should be released after conversion.

Let me think: reservation granularity. I'll propose: reservation works at **remito granularity** (a remito reserved = cannot be individually billed), but the prefactura stores the **item-level breakdown** that will be billed. On conversion, the billed quantities are consumed; any remaining saldo of that remito returns to "available". That matches the user's mental model exactly ("dejar reservado para que no lo facture otro").

**Flow:**
1. From Remitos page: select N remitos of the same client (multi-select with checkboxes) → "Armar prefactura" button.
2. Opens `ModalPrefactura`: shows the remitos, lets you enter quantity per item (or defaults to full saldo), price per item or a global amount, target amount (25000 USD), notes, expiry date.
3. Save → prefactura in `RESERVADA` state → remitos become reserved.
4. In Facturación page: a new panel "Prefacturas reservadas" listing active reservations. From there: "Convertir en factura" (creates the factura with the stored lines, consumes saldo, marks prefactura FACTURADA) or "Liberar" (frees the remitos).
5. Reserved remitos show a "Reservado" badge in Remitos and Facturación, and their "Facturar" button is disabled with a reason.

**The money question.** The prefactura needs an amount. Options:
(a) Manual single amount on the prefactura header (`importe_total`) — user types 25000 USD.
(b) Per-item `precio_unitario` → computed total.
(c) Both: per-item prices optional; if absent, a manual total.

For "seleccionar remitos hasta llegar a 25000" to be useful, the user needs to SEE the running total while selecting. If prices don't exist per product, the user must know each remito's value. So they'd need per-remito values. Hmm — "el total de esto seria 25000 dlls" implies the user can compute the total of remito 3+9+8. How? Either from prices per product, or the remito has a recorded value.

**Key insight**: maybe the cleanest solution to the whole money problem is to add a **price to the product variant** (`precio_unitario` in USD, per presentation unit) with the ability to override per prefactura line. Then:
- Remitos get a computed "valor estimado" (Σ qty × precio) — useful for the "25000 USD" selection flow.
- Prefactura total = Σ (qty × precio) computed automatically.
- Factura total = same, snapshotted.

This is a substantial but coherent extension, and it unlocks the real invoicing (Etapa 2).

But it's a big scope. I should present this as a decision point with a recommended option.

Let me now also consider: is the user perhaps only asking to ANALYZE ("Analicemos Remitos y Facturacion")? The message says "Analicemos" = "let's analyze". And the system reminder says plan mode. So the deliverable is a **plan** with the analysis, and I should ask clarifying questions before finalizing.

Let me use the Question tool for the key decisions. Good questions:

1. **Precios / dinero**: ¿Cómo modelamos el importe? (a) Precio por variante de producto (recomendado) (b) Importe manual en la prefactura (c) Solo cantidades, la prefactura sin monto
2. **Alcance del repo**: ¿Implementamos también en el backend (`C:\Job\Don Asdrubal\backend`)? (yes, both) — this seems obvious since it's needed. Maybe I don't need to ask; I'll state it in the plan. Actually it's worth confirming because the AGENTS.md says "solo frontend" for this repo, and the user might have a separate workflow. But the feature inherently requires backend changes. I'll state it as a fact and mention it. Better to ask since it affects the plan's structure — let me include it as a question.
3. **Reserva: quién puede liberar/convertir** — hard block for everyone with admin override?
4. **Datos existentes**: ¿hay facturas de prueba en la BD? (for migration strategy)

Let me limit to 3-4 well-chosen questions.

Actually, let me first double check a couple of things to make the plan precise:
- Does `Remitos.jsx` have any multi-select? No — single selection via `selectedRemitoId`.
- What does the detail panel show for items? Let me read lines 370-720 of Remitos.jsx to know the item table and where a "pre-factura" entry point would fit.

Let me also check the `products.js` model for a `precio`-like field (already grepped — none).

Let me read Remitos.jsx 370-720.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components\\Remitos.jsx",
  "offset": 370,
  "limit": 340
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\donAsdrubal\src\components\Remitos.jsx</path>
<type>file</type>
<content>
370:     return (
371:       <span
372:         className={`lista-badge ${extraClass}`}
373:         style={{
374:           backgroundColor: FACTURACION_COLORS[estado] || '#6c757d',
375:         }}
376:         title="Estado de facturación"
377:       >
378:         {FACTURACION_LABELS[estado] || estado}
379:       </span>
380:     );
381:   };
382: 
383:   const puedeFacturarRemito = (remito) =>
384:     isAdmin &&
385:     !remito.destination_warehouse_id &&
386:     remito.status === 'COMPLETADO' &&
387:     Number(remito.saldo_facturacion ?? 0) > 0;
388: 
389:   const renderAccionesFila = (remito, vertical = false) => {
390:     const esInterno = Boolean(remito.destination_warehouse_id);
391:     const puedeOperar = remito.status === 'PENDIENTE' || remito.status === 'REVISION';
392:     const puedeAnularTransferencia = esInterno && remito.status === 'COMPLETADO';
393:     const puedeFacturar = puedeFacturarRemito(remito);
394:     if (!puedeOperar && !puedeAnularTransferencia && !puedeFacturar) {
395:       return null;
396:     }
397:     return (
398:       <div
399:         className={`lista-acciones ${vertical ? 'lista-acciones--col' : ''}`}
400:       >
401:         {puedeFacturar && (
402:           <button
403:             className="lista-btn lista-btn--icon lista-btn--primary"
404:             title="Facturar remito"
405:             onClick={(e) => {
406:               e.stopPropagation();
407:               setFacturaModalRemito(remito);
408:             }}
409:           >
410:             <Receipt size={14} />
411:           </button>
412:         )}
413:         {!esInterno && remito.status === 'PENDIENTE' && (
414:           <button
415:             className="lista-btn lista-btn--icon lista-btn--primary"
416:             title="Subir archivo del remito firmado"
417:             onClick={(e) => {
418:               e.stopPropagation();
419:               setSubirFotoRemito(remito);
420:             }}
421:           >
422:             <Camera size={14} />
423:           </button>
424:         )}
425:         {!esInterno && remito.status === 'REVISION' && (
426:           <button
427:             className="lista-btn lista-btn--icon lista-btn--success"
428:             title="Confirmar remito"
429:             onClick={(e) => {
430:               e.stopPropagation();
431:               handleConfirmar(remito.id);
432:             }}
433:           >
434:             <Check size={14} />
435:           </button>
436:         )}
437:         <button
438:           className="lista-btn lista-btn--icon lista-btn--danger"
439:           title="Anular"
440:           onClick={(e) => {
441:             e.stopPropagation();
442:             handleAnular(remito.id);
443:           }}
444:         >
445:           <X size={14} />
446:         </button>
447:       </div>
448:     );
449:   };
450: 
451:   const renderRemitoDatos = () => (
452:     <div className="lista-box__body">
453:       <dl className="lista-kv">
454:         <dt>Tipo</dt>
455:         <dd>
456:           <span
457:             className={`lista-badge ${
458:               remitoSeleccionado.type === 'OFICIAL'
459:                 ? 'lista-badge--oficial'
460:                 : 'lista-badge--no-oficial'
461:             }`}
462:           >
463:             {remitoSeleccionado.type === 'OFICIAL' ? 'Oficial' : 'No Oficial'}
464:           </span>
465:         </dd>
466:         {remitoSeleccionado.destination_warehouse_id ? (
467:           <>
468:             <dt>Traslado</dt>
469:             <dd>
470:               {getNombreDeposito(remitoSeleccionado.origin_warehouse_id)}
471:               {' → '}
472:               {getNombreDeposito(remitoSeleccionado.destination_warehouse_id)}
473:               <span className="lista-badge lista-badge--neutral ms-2">Interno</span>
474:             </dd>
475:           </>
476:         ) : (
477:           <>
478:             <dt>Cliente</dt>
479:             <dd>{getNombreCliente(remitoSeleccionado.destination_client_id)}</dd>
480:             <dt>Depósito</dt>
481:             <dd>{getNombreDeposito(remitoSeleccionado.origin_warehouse_id)}</dd>
482:           </>
483:         )}
484:         <dt>{remitoSeleccionado.destination_warehouse_id ? 'Fecha del traslado' : 'Creación'}</dt>
485:         <dd>
486:           {remitoSeleccionado.destination_warehouse_id
487:             ? formatDate(getFechaRemito(remitoSeleccionado))
488:             : formatDateTime(remitoSeleccionado.createdAt)}
489:         </dd>
490:       </dl>
491: 
492:       {remitoSeleccionado.notes && (
493:         <div className="lista-note lista-note--warning">
494:           <Info size={14} />
495:           <span>{remitoSeleccionado.notes}</span>
496:         </div>
497:       )}
498: 
499:       {remitoSeleccionado.destination_warehouse_id && (
500:         <div className="lista-note lista-note--ok">
501:           <ArrowLeftRight size={14} />
502:           <span>
503:             Transferencia aplicada entre {getNombreDeposito(remitoSeleccionado.origin_warehouse_id)}
504:             {' y '}{getNombreDeposito(remitoSeleccionado.destination_warehouse_id)}.
505:             La anulación revierte ambos movimientos si hay stock disponible en destino.
506:           </span>
507:         </div>
508:       )}
509: 
510:       <table className="lista-items">
511:         <thead>
512:           <tr>
513:             <th>Artículo</th>
514:             <th className="text-end">Cantidad</th>
515:           </tr>
516:         </thead>
517:         <tbody>
518:           {remitoDetalle?.items?.length > 0 ? (
519:             remitoDetalle.items.map((item) => (
520:               <tr key={item.id}>
521:                 <td>
522:                   <span className="lista-items__nombre">
523:                     {item.variante?.producto?.nombre || `Variante #${item.product_variant_id}`}
524:                   </span>
525:                   {item.variante?.presentacion && (
526:                     <span className="lista-badge lista-badge--neutral ms-2">
527:                       {item.variante.presentacion.nombre}
528:                     </span>
529:                   )}
530:                   {item.lotes?.length > 0 && (
531:                     <div className="lista-items__lotes">
532:                       {item.lotes
533:                         .map(
534:                           (loteItem) =>
535:                             `Lote ${
536:                               loteItem.lote?.lot_number ||
537:                               `#${loteItem.product_lot_id}`
538:                             }: ${parseFloat(loteItem.quantity_dispatched).toFixed(2)}`,
539:                         )
540:                         .join(' · ')}
541:                     </div>
542:                   )}
543:                 </td>
544:                 <td className="text-end lista-items__cantidad">
545:                   {parseFloat(item.quantity_dispatched || 0).toFixed(2)} ud
546:                 </td>
547:               </tr>
548:             ))
549:           ) : (
550:             <tr>
551:               <td colSpan={2} className="lista-vacio">
552:                 Sin ítems
553:               </td>
554:             </tr>
555:           )}
556:         </tbody>
557:         {remitoDetalle?.items?.length > 0 && (
558:           <tfoot>
559:             <tr>
560:               <td>Total</td>
561:               <td className="text-end">{totalItems.toFixed(2)} ud</td>
562:             </tr>
563:           </tfoot>
564:         )}
565:       </table>
566: 
567:       {!remitoSeleccionado.destination_warehouse_id && (
568:         <div
569:           className={`lista-note ${
570:             remitoSeleccionado.estado_facturacion === 'FACTURADO'
571:               ? 'lista-note--ok'
572:               : remitoSeleccionado.estado_facturacion === 'PARCIAL'
573:                 ? 'lista-note--warning'
574:                 : ''
575:           }`}
576:         >
577:           <Receipt size={14} />
578:           <span>
579:             Facturación: {Number(remitoSeleccionado.facturado ?? 0).toFixed(2)}{' '}
580:             de {Number(remitoSeleccionado.total_remitido ?? 0).toFixed(2)} (
581:             {renderBadgeFacturacion(remitoSeleccionado.estado_facturacion)})
582:           </span>
583:         </div>
584:       )}
585: 
586:       {(remitoDetalle?.facturaciones || []).length > 0 && (
587:         <table className="lista-items">
588:           <thead>
589:             <tr>
590:               <th>Factura</th>
591:               <th>Fecha</th>
592:               <th className="text-end">Cantidad facturada</th>
593:             </tr>
594:           </thead>
595:           <tbody>
596:             {remitoDetalle.facturaciones.map((fact) => (
597:               <tr key={fact.id}>
598:                 <td>
599:                   {fact.factura?.numero || `#${fact.factura_id}`}
600:                   <span className="lista-badge lista-badge--neutral ms-2">
601:                     {fact.factura?.tipo === 'ANTICIPO'
602:                       ? 'Anticipo'
603:                       : 'Factura'}
604:                   </span>
605:                 </td>
606:                 <td>{formatDate(fact.factura?.fecha)}</td>
607:                 <td className="text-end lista-items__cantidad">
608:                   {parseFloat(fact.cantidad_facturada || 0).toFixed(2)}
609:                 </td>
610:               </tr>
611:             ))}
612:           </tbody>
613:         </table>
614:       )}
615: 
616:       {(remitoSeleccionado.confirmed_at ||
617:         remitoSeleccionado.confirmadoPor) && (
618:         <div className="lista-note lista-note--ok">
619:           <Check size={14} />
620:           <span>
621:             Confirmado el {formatDateTime(remitoSeleccionado.confirmed_at)}
622:             {remitoSeleccionado.confirmadoPor &&
623:               ` por ${remitoSeleccionado.confirmadoPor.nombre || remitoSeleccionado.confirmadoPor.email}`}
624:           </span>
625:         </div>
626:       )}
627: 
628:       {(remitoSeleccionado.cancelled_at || remitoSeleccionado.canceladoPor) && (
629:         <div className="lista-note lista-note--danger">
630:           <X size={14} />
631:           <span>
632:             Anulado el {formatDateTime(remitoSeleccionado.cancelled_at)}
633:             {remitoSeleccionado.canceladoPor &&
634:               ` por ${remitoSeleccionado.canceladoPor.nombre || remitoSeleccionado.canceladoPor.email}`}
635:           </span>
636:         </div>
637:       )}
638: 
639:       {remitoSeleccionado.status === 'PENDIENTE' && (
640:         <div className="lista-note">
641:           <Info size={14} />
642:           <span>Falta subir el remito firmado.</span>
643:         </div>
644:       )}
645: 
646:       {remitoSeleccionado.status === 'REVISION' && (
647:         <div className="lista-note">
648:           <Info size={14} />
649:           <span>Archivo(s) cargado(s), falta confirmar.</span>
650:         </div>
651:       )}
652: 
653:       <div className="lista-box__acciones">
654:         {puedeFacturarRemito(remitoSeleccionado) && (
655:           <button
656:             className="lista-btn lista-btn--primary"
657:             onClick={() => setFacturaModalRemito(remitoSeleccionado)}
658:           >
659:             <Receipt size={14} /> Facturar
660:           </button>
661:         )}
662:         {isAdmin && !remitoSeleccionado.destination_warehouse_id && (
663:           <button
664:             className="lista-btn"
665:             title="Abrir la facturación de este cliente"
666:             onClick={() =>
667:               navigate(
668:                 `/stock/facturacion?cliente=${remitoSeleccionado.destination_client_id}&fecha=${fechaHoy()}`,
669:               )
670:             }
671:           >
672:             <Receipt size={14} /> Ir a Facturación
673:           </button>
674:         )}
675:         {(!remitoSeleccionado.destination_warehouse_id &&
676:           (remitoSeleccionado.status === 'PENDIENTE' || remitoSeleccionado.status === 'REVISION')) && (
677:           <button
678:             className="lista-btn lista-btn--primary"
679:             onClick={() => setSubirFotoRemito(remitoSeleccionado)}
680:           >
681:             <Camera size={14} /> {archivos.length > 0 ? 'Agregar archivo' : 'Subir archivo'}
682:           </button>
683:         )}
684:         {!remitoSeleccionado.destination_warehouse_id &&
685:           remitoSeleccionado.status === 'REVISION' && (
686:           <button
687:             className="lista-btn lista-btn--success"
688:             onClick={() => handleConfirmar(remitoSeleccionado.id)}
689:           >
690:             <Check size={14} /> Confirmar
691:           </button>
692:         )}
693:         {(remitoSeleccionado.status === 'PENDIENTE' ||
694:           remitoSeleccionado.status === 'REVISION' ||
695:           (remitoSeleccionado.destination_warehouse_id &&
696:             remitoSeleccionado.status === 'COMPLETADO')) && (
697:           <button
698:             className="lista-btn lista-btn--danger"
699:             onClick={() => handleAnular(remitoSeleccionado.id)}
700:           >
701:             <X size={14} /> Anular
702:           </button>
703:         )}
704:       </div>
705:     </div>
706:   );
707: 
708:   const renderRemitoImagen = () => {
709:     if (archivos.length === 0) {

(Showing lines 370-709 of 1345. Use offset=710 to continue.)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 5.8s)

_Thinking:_

I now have everything I need. Let me ask the key clarifying questions.

Key decisions:
1. **El dinero / importe**: no hay precios en el sistema. ¿Cómo modelamos el "25000 dlls"?
2. **Alcance**: ¿backend también?
3. **Reserva**: ¿dureza del bloqueo (bloqueo total vs. aviso)?
4. **Datos de prueba existentes** en BD para facturas (para la estrategia de migración).

Let me ask these 4 questions with the Question tool. Actually, let me be judicious. The most impactful:
- Q1: modelo de precios/dinero (determines a big chunk of the schema)
- Q2: alcance backend
- Q3: dureza de la reserva
- Q4: ¿reset de datos de prueba o migración preservando datos?

Let me phrase them in Spanish since the user writes in Spanish.

For Q1 options:
a) "Precio por variante de producto (recomendado)" — agregar `precio_unitario` + `moneda` a product_variants; el remito/prefactura/factura calculan importe en USD. Habilita "seleccionar remitos hasta llegar a 25000" automáticamente.
b) "Importe manual en la prefactura" — la prefactura tiene un campo `importe_total` que carga el usuario a mano (25000 USD); sin precios por producto. Simple, rápido.
c) "Precio por línea en la prefactura" — la cotizacion captura precio unitario por línea al armarla ( editable ), sin tocar productos. Total calculado de la cotización.

Hmm, (c) is basically "cotización con precios" which is very close to the real business flow: the person quotes a price for those remitos. And then the factura inherits it.

Actually option (a) is the most complete but the most work (needs a products/prices admin UI, which doesn't exist in the SPA at all — let me check if there's a products management UI).

Let me check quickly if there's a Productos

**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem \"C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components\" -Filter *.jsx | Select-Object -ExpandProperty Name"
}
```

**Output:**
```
Alertas.jsx
Borrar_UserDetalles.jsx
Calibraciones.jsx
CalibracionesActual.jsx
CalibracionesMobileList.jsx
ChartsRow.jsx
Clientedashboard-one-row-charts.jsx
Clientedashboard.jsx
ClienteDetalle.jsx
Clientes.jsx
ClientesMobileList.jsx
Compras.jsx
Dash.jsx
Dashboard.jsx
DashboardLayout.jsx
DashboardUser.jsx
Depositos.jsx
DrawerNotasUsuario.jsx
EstadoServicio.jsx
Facturacion.jsx
Herramientas.jsx
InformeCrm.jsx
InformeRemitosFaltantes.jsx
JornadasCards_old.jsx
JornadasMobileList.jsx
JornadasTable.jsx
Login.jsx
Maquinas.jsx
MaquinasMobileList.jsx
MaquinasTipos.jsx
Modal.jsx
ModalCalibraciones.jsx
ModalCompras.jsx
ModalDepositos.jsx
ModalDetalleCalibracion.jsx
ModalEliminar.jsx
ModalFactura.jsx
ModalFinalizarServicios.jsx
ModalImpresion.jsx
ModalInformativo.jsx
ModalJornadas.jsx
ModalMaquinas.jsx
ModalMuestrasPozos.jsx
ModalNotas.jsx
ModalNotasUsuario.jsx
ModalPozos.jsx
ModalPresentaciones.jsx
ModalProductos.jsx
ModalProveedores.jsx
ModalRemitoCatalogo.jsx
ModalRemitoInterno.jsx
ModalRubros.jsx
ModalSubrubros.jsx
MuestrasMobileList.jsx
MuestrasPozos.jsx
NotasClientes.jsx
Notifications.jsx
Pozos.jsx
Presentaciones.jsx
Productos.jsx
Prospectos.jsx
ProtectedRoute.jsx
Proveedores.jsx
PublicRoute.jsx
RegistroProspecto.jsx
Remitos.jsx
RemitosFaltantesPanel.jsx
ReporteSemanal.jsx
Rubros.jsx
ServiceRow.jsx
Sidebar.jsx
Spinner.jsx
StatsRow.jsx
Stock.jsx
Subrubros.jsx
UploadRemitoPhoto.jsx
Users.jsx
Varios.jsx

```

**Tool: grep**

**Input:**
```json
{
  "include": "*.jsx",
  "path": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components",
  "pattern": "productVariants|product_variants|getCatalogo|Productos"
}
```

**Output:**
```
Found 21 matches
C:\Job\Don Asdrubal\donAsdrubal\src\components\DashboardLayout.jsx:
  Line 24:   productos: 'Productos',


C:\Job\Don Asdrubal\donAsdrubal\src\components\Compras.jsx:
  Line 16: import { getFullVariants } from '../api/productVariants';


C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalRemitoCatalogo.jsx:
  Line 3: import { addRemito, getCatalogo } from '../api/remitos';

  Line 28:       const res = await getCatalogo(form.origin_warehouse_id);


C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalProductos.jsx:
  Line 7: import { upVariant, delVariant, allVariants } from '../api/productVariants';

  Line 9: const ModalProductos = ({ producto, onlyView, onClose, onSave }) => {

  Line 511: export default ModalProductos;

C:\Job\Don Asdrubal\donAsdrubal\src\components\Productos.jsx:
  Line 7: } from '../api/productVariants';

  Line 12: import ModalProductos from './ModalProductos';

  Line 19: const Productos = () => {

  Line 177:             Productos

  Line 462:         <ModalProductos

  Line 510: export default Productos;


C:\Job\Don Asdrubal\donAsdrubal\src\components\Sidebar.jsx:
  Line 51:         { title: 'Productos', path: '/stock/productos', icon: 'bi-tag-fill' },


C:\Job\Don Asdrubal\donAsdrubal\src\components\Stock.jsx:
  Line 5: import { getFullVariants } from '../api/productVariants';


C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalRemitoInterno.jsx:
  Line 4: import { addRemitoInterno, getCatalogo } from '../api/remitos';

  Line 42:         const res = await getCatalogo(origenId);

  Line 83:   const opcionesProductos = useMemo(

  Line 256:             <h6 className="mb-3">2. Productos y cantidades</h6>

  Line 276:                   options={opcionesProductos}

  Line 277:                   value={opcionesProductos.find((opcion) => opcion.value === productoId) || null}

```

---

## Assistant (Plan · MiniMax M3.1 Flash · 3.2s)

_Thinking:_

There IS a Productos UI with `ModalProductos` that manages variants (`upVariant`, `delVariant`, `allVariants`). So adding a `precio_unitario` to `product_variants` would have a natural home in `ModalProductos.jsx`.

Let me quickly peek at ModalProductos.jsx to see the variant form structure — that will tell me how feasible adding a price field is.

Let me read a portion.

**Tool: grep**

**Input:**
```json
{
  "include": "*.jsx",
  "path": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components",
  "pattern": "ranking|cantidad_base|unidad_base"
}
```

**Output:**
```
Found 57 matches
C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalCompras.jsx:
  Line 204:     if (!variant?.presentacion?.cantidad_base) return null;

  Line 207:     return `= ${(qty * parseFloat(variant.presentacion.cantidad_base)).toFixed(2)} ${unidad}`;


C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalPresentaciones.jsx:
  Line 13:     unidad_base_id: '',

  Line 14:     cantidad_base: '',

  Line 25:         unidad_base_id: presentacion.unidad_base_id || '',

  Line 26:         cantidad_base: presentacion.cantidad_base || '',

  Line 35:     if (form.unidad_base_id && (!form.cantidad_base || parseFloat(form.cantidad_base) <= 0)) {

  Line 36:       newErrors.cantidad_base = 'Si define unidad base, la cantidad es requerida';

  Line 49:         unidad_base_id: form.unidad_base_id

  Line 50:           ? parseInt(form.unidad_base_id)

  Line 52:         cantidad_base: form.cantidad_base

  Line 53:           ? parseFloat(form.cantidad_base)

  Line 64:   // Solo mostrar presentaciones que sean base (sin unidad_base_id)

  Line 66:     (p) => p.id !== form.id && !p.unidad_base_id,

  Line 70:     (p) => p.id === parseInt(form.unidad_base_id),

  Line 74:     form.nombre?.trim() && form.unidad_base_id && form.cantidad_base > 0;

  Line 107:               value={form.unidad_base_id}

  Line 109:                 setForm({ ...form, unidad_base_id: e.target.value, cantidad_base: '' })

  Line 127:           {form.unidad_base_id && (

  Line 135:                 value={form.cantidad_base}

  Line 137:                   setForm({ ...form, cantidad_base: e.target.value })

  Line 139:                 isInvalid={!!errors.cantidad_base}

  Line 143:                 {errors.cantidad_base}

  Line 150:               <strong>Vista previa:</strong> 1 {form.nombre.trim()} = {form.cantidad_base} {unidadBaseSeleccionada?.nombre}


C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalProductos.jsx:
  Line 175:         ranking: 0,

  Line 354:                           label={`${p.nombre} (${p.cantidad_base} ${p.unidad_base || ''})`}

  Line 389:                               {p.nombre} ({p.cantidad_base} {p.unidad_base || ''})


C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalRemitoCatalogo.jsx:
  Line 37:   const favoritos = catalogo.filter((item) => item.ranking === 5);

  Line 38:   const otros = catalogo.filter((item) => item.ranking < 5 && item.ranking > 0);

  Line 39:   const sinClasificar = catalogo.filter((item) => item.ranking === 0);

  Line 61:           cantidad_base: item.cantidad_base,

  Line 62:           unidad_base: item.unidad_base,

  Line 134:   const totalItems = carrito.reduce((sum, item) => sum + item.quantity_requested * item.cantidad_base, 0);

  Line 247:                   <h6 className="text-secondary mb-3">Otros productos (ordenados por ranking)</h6>

  Line 355:   const rankingStars = (rank) => {

  Line 380:             {item.ranking > 0 && <div>{rankingStars(item.ranking)}</div>}

  Line 386:             Stock: {item.stock_en_presentacion.toFixed(2)} ({item.unidad_base})


C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalRemitoInterno.jsx:
  Line 62:     const favoritos = catalogo.filter((producto) => Number(producto.ranking) === 5);

  Line 79:     () => catalogo.filter((producto) => Number(producto.ranking) === 5).length,

  Line 360:                                   {producto.unidad_base})

  Line 451:                           {item.unidad_base && (

  Line 453:                               Unidad base: {item.unidad_base}


C:\Job\Don Asdrubal\donAsdrubal\src\components\Presentaciones.jsx:
  Line 80:       return `${p.nombre} (${p.cantidad_base} ${p.unidadBase.nombre})`;

  Line 149:                         Equivale a {presentacion.cantidad_base}{' '}

  Line 225:                     <td>{presentacion.cantidad_base || '—'}</td>


C:\Job\Don Asdrubal\donAsdrubal\src\components\Productos.jsx:
  Line 120:   const handleToggleRanking = async (id, rankingActual) => {

  Line 122:       const nuevoRanking = rankingActual === 5 ? 0 : 5;

  Line 125:         prev.map((v) => (v.id === id ? { ...v, ranking: nuevoRanking } : v)),

  Line 128:       console.error('Error al cambiar ranking:', error);

  Line 159:   const renderStars = (ranking) => {

  Line 163:         className={`bi ${i < ranking ? 'bi-star-fill' : 'bi-star'} text-warning`}

  Line 315:                     onClick={() => handleToggleRanking(v.id, v.ranking)}

  Line 317:                     {renderStars(v.ranking)}

  Line 412:                       onClick={() => handleToggleRanking(v.id, v.ranking)}

  Line 414:                       {renderStars(v.ranking)}


C:\Job\Don Asdrubal\donAsdrubal\src\components\Stock.jsx:
  Line 64:     if (presentacion && unidadBase && presentacion.cantidad_base) {

  Line 65:       const cantBase = parseFloat(presentacion.cantidad_base);

```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\api\\productVariants.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\donAsdrubal\src\api\productVariants.js</path>
<type>file</type>
<content>
1: import instance from './axios';
2: 
3: export const allVariants = async () => {
4:   const res = await instance.get('/stock/product-variants');
5:   return res;
6: };
7: 
8: export const getFullVariants = async () => {
9:   const res = await instance.get('/stock/product-variants/full');
10:   return res;
11: };
12: 
13: export const addVariant = async (variant) => {
14:   const res = await instance.post('/stock/product-variants', variant);
15:   return res;
16: };
17: 
18: export const upVariant = async (variant) => {
19:   const { id, ...datos } = variant;
20:   const res = await instance.put(`/stock/product-variants/${id}`, datos);
21:   return res;
22: };
23: 
24: export const delVariant = async (id) => {
25:   const res = await instance.delete(`/stock/product-variants/${id}`);
26:   return res;
27: };
28: 
29: export const setRanking = async (id, ranking) => {
30:   const res = await instance.put(`/stock/product-variants/${id}/ranking`, { ranking });
31:   return res;
32: };
33: 
34: export const toggleActivo = async (id) => {
35:   const res = await instance.put(`/stock/product-variants/${id}/activo`);
36:   return res;
37: };

(End of file - total 37 lines)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 131.9s)

_Thinking:_

I have a complete picture. Now let me ask the clarifying questions.

I'll ask 4 questions:

1. **Modelo de dinero** (the biggest one)
2. **Alcance de implementación** (backend + frontend)
3. **Dureza de la reserva**
4. **Datos existentes de facturas en BD** (migration strategy)

Let me write them in Spanish with good options.

Ya tengo el panorama completo. Antes de armar el plan necesito resolver 4 decisiones que definen la arquitectura.

**Tool: question**

**Input:**
```json
{
  "questions": [
    {
      "question": "El sistema hoy NO tiene ningún campo monetario: no hay precios en productos, ni importes en remitos ni en facturas. `cantidad_facturada` está en LITROS (unidades base), y la \"factura\" solo marca litros facturados. Tu escenario de \"25000 dlls\" no es representable hoy. ¿Cómo modelamos el dinero?",
      "header": "Modelo de dinero",
      "options": [
        {
          "label": "Precio por producto/variante (Recomendado)",
          "description": "Agregar `precio_unitario` + `moneda` (USD) a product_variants, editable desde ModalProductos.jsx. El remito/prefactura/factura calculan importe = Σ cantidad × precio. Permite seleccionar remitos \"hasta llegar a 25000\" automáticamente. Es la base de la facturación real (Etapa 2)."
        },
        {
          "label": "Precio por línea al armar la cotización",
          "description": "El precio se captura al armar la prefactura (cotización), sin tocar el catálogo de productos. El total de la prefactura se calcula de esas líneas. La factura hereda el precio al convertir."
        },
        {
          "label": "Importe manual en la prefactura",
          "description": "La prefactura tiene un único campo `importe_total` que carga el usuario a mano (ej. 25000 USD). Sin precios por producto. Es lo más rápido, pero no hay control automático ni validación contra el total de la selección."
        },
        {
          "label": "Sin dinero, solo cantidades",
          "description": "La prefactura/reserva se queda en el mundo de los litros; el monto de 25000 USD se maneja fuera del sistema. Se implementa solo la reserva de remitos + facturación parcial por producto."
        }
      ]
    },
    {
      "question": "El backend vive en un repo hermano (`C:\\Job\\Don Asdrubal\\backend`, con la Etapa 1 de Facturación sin commitear). AGENTS.md dice \"solo frontend\", pero estas dos features requieren cambios de esquema y endpoints nuevos.",
      "header": "Alcance",
      "options": [
        {
          "label": "Backend + Frontend (Recomendado)",
          "description": "Plan coordinado: migraciones Sequelize nuevas, endpoints en controllers/facturas.js y un service nuevo de reservas, más la UI en el SPA. Se implementa en los dos repos."
        },
        {
          "label": "Solo el plan del frontend",
          "description": "El backend lo implementa otro (o en otro momento); el plan documenta solo la UI asumiendo un contrato de API que se define."
        }
      ]
    },
    {
      "question": "La reserva debe evitar que \"venga otra persona y facture individualmente\". ¿Qué tan duro es el bloqueo?",
      "header": "Dureza de la reserva",
      "options": [
        {
          "label": "Bloqueo total, con override de admin (Recomendado)",
          "description": "Nadie puede facturar un remito reservado (ni total ni parcialmente). Solo un Administrador puede liberar la reserva o forzar la facturación, y queda auditado quién y cuándo."
        },
        {
          "label": "Bloqueo total, sin escape",
          "description": "Nadie puede facturar un remito reservado. La única salida es liberar la prefactura desde la propia pantalla de prefacturas."
        },
        {
          "label": "Solo aviso (no bloquea)",
          "description": "El remito reservado muestra un badge y un aviso al intentar facturarlo, pero el backend permite igual. Menos seguro, más simple."
        }
      ]
    },
    {
      "question": "La Etapa 1 (Facturación) está sin commitear. ¿Hay facturas/remitos reales ya cargados en la base, o son datos de prueba?",
      "header": "Datos existentes",
      "options": [
        {
          "label": "Datos de prueba, se puede resetear",
          "description": "Permite limpiar facturas y remito_facturas y empezar con el esquema nuevo (por ítem) sin migración de datos."
        },
        {
          "label": "Hay datos reales, hay que migrar",
          "description": "Hay que escribir una migración que reparta los montos a nivel de ítem de forma proporcional, o mantener compatibilidad hacia atrás con facturas viejas."
        },
        {
          "label": "No estoy seguro",
          "description": "El plan debe incluir un paso de verificación/consulta a la BD antes de decidir la estrategia de migración."
        }
      ]
    }
  ]
}
```

**Output:**
```
User has answered your questions: "El sistema hoy NO tiene ningún campo monetario: no hay precios en productos, ni importes en remitos ni en facturas. `cantidad_facturada` está en LITROS (unidades base), y la "factura" solo marca litros facturados. Tu escenario de "25000 dlls" no es representable hoy. ¿Cómo modelamos el dinero?"="Precio por producto/variante (Recomendado)", "El backend vive en un repo hermano (`C:\Job\Don Asdrubal\backend`, con la Etapa 1 de Facturación sin commitear). AGENTS.md dice "solo frontend", pero estas dos features requieren cambios de esquema y endpoints nuevos."="Backend + Frontend (Recomendado)", "La reserva debe evitar que "venga otra persona y facture individualmente". ¿Qué tan duro es el bloqueo?"="Bloqueo total, con override de admin (Recomendado)", "La Etapa 1 (Facturación) está sin commitear. ¿Hay facturas/remitos reales ya cargados en la base, o son datos de prueba?"="Datos de prueba, se puede resetear". You can now continue with the user's answers in mind.
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 5.7s)

_Thinking:_

All decisions made:
1. **Precio por producto/variante** (`precio_unitario` + moneda USD en product_variants)
2. **Backend + Frontend** (coordinated)
3. **Bloqueo total con override de admin**
4. **Datos de prueba, se puede resetear** → schema limpio, podemos reemplazar `remito_facturas` por item-level

Now let me design the full plan carefully.

Let me verify a few more details needed for the plan:
- The `product_variants` controller (backend) to know how to add the price field & the `full` variant include.
- The `Stock.jsx`/`Productos.jsx` variant model shape (frontend).
- The remitos controller `addRemito` to know how items are stored (already known).
- `getCatalogo` to know where to expose the price (the catalog endpoint is used by the remito creation modals — good place to show price).

Let me check the backend productVariants controller.

Also need to check: `product_variants` `upVariant` payload shape in ModalProductos.jsx to add the price input.

Let me read the backend productVariants controller and the frontend ModalProductos variant form section.

Let me also double check the `remitos` controller `addRemito` for how it stores items and whether there's a `precio` snapshot opportunity. Since the remito doesn't store price, the price used at billing time is the current price of the variant. Should the remito snapshot the price at creation? For a remito created today and billed in 3 months, the price might have changed. Best practice: snapshot the price at billing time (invoice line), which is what matters legally. For the "valor estimado" of a remito, use the current price. I'll note this.

Let me read the backend controllers for

**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem \"C:\\Job\\Don Asdrubal\\backend\\src\\controllers\" -Filter *.js | Select-Object -ExpandProperty Name"
}
```

**Output:**
```
alertas.js
auditLogs.js
borrador.js
calibraciones.js
clienteDashboard.js
clients.js
facturas.js
informeCrm.js
informesPdf.js
jornadas.js
maquinas.js
maquinas_tipos.js
muestras_agua.js
notas.js
permissions.js
pozos.js
productLots.js
productPresentations.js
products.js
productVariants.js
prospectos.js
providers.js
purchases.js
remitoArchivos.js
remitos.js
resumenCrmPdf.js
resumenSemanalPdf.js
roles.js
role_permissions.js
rubros.js
stockMovements.js
subrubros.js
tipoClientes.js
tipoServicios.js
ubicaciones.js
userDashboard.js
users.js
user_roles.js
warehouses.js
warehouseStock.js

```

**Tool: grep**

**Input:**
```json
{
  "include": "*.js",
  "path": "C:\\Job\\Don Asdrubal\\backend\\src\\controllers",
  "pattern": "product-variants"
}
```

**Output:**
```
No files found
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 2.6s)

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\controllers\\productVariants.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\controllers\productVariants.js</path>
<type>file</type>
<content>
1: import { ProductVariants, Products, ProductPresentations, Rubros, Subrubros, ProductLots, StockMovements } from '../models/index.js';
2: 
3: export const allVariants = async (req, res) => {
4:   try {
5:     const variants = await ProductVariants.findAll({
6:       include: [
7:         { model: Products, as: 'producto', include: [
8:           { model: Rubros, as: 'rubro' },
9:           { model: Subrubros, as: 'subrubro' },
10:         ]},
11:         { model: ProductPresentations, as: 'presentacion' },
12:       ],
13:       order: [[{ model: Products, as: 'producto' }, 'nombre', 'ASC']],
14:     });
15:     res.json(variants);
16:   } catch (error) {
17:     res.status(500).json({ message: error.message });
18:   }
19: };
20: 
21: export const getFullVariants = async (req, res) => {
22:   try {
23:     const variants = await ProductVariants.findAll({
24:       include: [
25:         { model: Products, as: 'producto', include: [
26:           { model: Rubros, as: 'rubro' },
27:           { model: Subrubros, as: 'subrubro' },
28:         ]},
29:         { model: ProductPresentations, as: 'presentacion' },
30:       ],
31:       order: [
32:         ['ranking', 'DESC'],
33:         [{ model: Products, as: 'producto' }, 'nombre', 'ASC'],
34:       ],
35:     });
36:     res.json(variants);
37:   } catch (error) {
38:     res.status(500).json({ message: error.message });
39:   }
40: };
41: 
42: export const addVariant = async (req, res) => {
43:   try {
44:     const { product_id, presentation_id, codigo } = req.body;
45: 
46:     // Validar que el producto exista y esté activo
47:     const product = await Products.findByPk(product_id);
48:     if (!product) {
49:       return res.status(404).json({ message: 'Producto no encontrado' });
50:     }
51:     if (!product.activo) {
52:       return res.status(400).json({ message: 'No se puede agregar una variante a un producto inactivo' });
53:     }
54: 
55:     // Validar unicidad de (product_id, presentation_id)
56:     const existingCombo = await ProductVariants.findOne({
57:       where: { product_id, presentation_id },
58:       paranoid: false,
59:     });
60:     if (existingCombo) {
61:       return res.status(409).json({ message: 'Este producto ya tiene esa presentación' });
62:     }
63: 
64:     // Validar unicidad de código
65:     const existingCodigo = await ProductVariants.findOne({
66:       where: { codigo },
67:       paranoid: false,
68:     });
69:     if (existingCodigo) {
70:       return res.status(409).json({ message: 'Ya existe una variante con ese código' });
71:     }
72: 
73:     const variant = await ProductVariants.create(req.body);
74:     res.status(201).json(variant);
75:   } catch (error) {
76:     res.status(400).json({ message: error.message });
77:   }
78: };
79: 
80: export const updateVariant = async (req, res) => {
81:   try {
82:     const variant = await ProductVariants.findByPk(req.params.id);
83:     if (!variant) return res.status(404).json({ message: 'Variante no encontrada' });
84: 
85:     // Si cambia la presentación, validar que no tenga lotes ni movimientos
86:     if (req.body.presentation_id && req.body.presentation_id !== variant.presentation_id) {
87:       const hasLots = await ProductLots.findOne({
88:         where: { product_variant_id: variant.id },
89:       });
90:       if (hasLots) {
91:         return res.status(400).json({ message: 'No se puede cambiar la presentación de una variante con lotes asociados' });
92:       }
93: 
94:       // Validar unicidad de (product_id, presentation_id)
95:       const existingCombo = await ProductVariants.findOne({
96:         where: {
97:           product_id: variant.product_id,
98:           presentation_id: req.body.presentation_id,
99:         },
100:         paranoid: false,
101:       });
102:       if (existingCombo) {
103:         return res.status(409).json({ message: 'Este producto ya tiene esa presentación' });
104:       }
105:     }
106: 
107:     // Validar unicidad de código si cambió
108:     if (req.body.codigo && req.body.codigo !== variant.codigo) {
109:       const existingCodigo = await ProductVariants.findOne({
110:         where: { codigo: req.body.codigo },
111:         paranoid: false,
112:       });
113:       if (existingCodigo) {
114:         return res.status(409).json({ message: 'Ya existe una variante con ese código' });
115:       }
116:     }
117: 
118:     await variant.update(req.body);
119:     res.json(variant);
120:   } catch (error) {
121:     res.status(400).json({ message: error.message });
122:   }
123: };
124: 
125: export const deleteVariant = async (req, res) => {
126:   try {
127:     const variant = await ProductVariants.findByPk(req.params.id);
128:     if (!variant) return res.status(404).json({ message: 'Variante no encontrada' });
129: 
130:     // Verificar si tiene lotes
131:     const hasLots = await ProductLots.findOne({
132:       where: { product_variant_id: variant.id },
133:     });
134:     if (hasLots) {
135:       return res.status(400).json({ message: 'No se puede eliminar una variante con lotes asociados' });
136:     }
137: 
138:     // Soft delete
139:     await variant.destroy();
140:     res.json({ message: 'Variante eliminada' });
141:   } catch (error) {
142:     res.status(400).json({ message: error.message });
143:   }
144: };
145: 
146: export const setRanking = async (req, res) => {
147:   try {
148:     const { ranking } = req.body;
149:     if (ranking < 0 || ranking > 5) {
150:       return res.status(400).json({ message: 'El ranking debe ser entre 0 y 5' });
151:     }
152:     const variant = await ProductVariants.findByPk(req.params.id);
153:     if (!variant) return res.status(404).json({ message: 'Variante no encontrada' });
154:     variant.ranking = ranking;
155:     await variant.save();
156:     res.json(variant);
157:   } catch (error) {
158:     res.status(400).json({ message: error.message });
159:   }
160: };
161: 
162: export const toggleActivo = async (req, res) => {
163:   try {
164:     const variant = await ProductVariants.findByPk(req.params.id);
165:     if (!variant) return res.status(404).json({ message: 'Variante no encontrada' });
166:     variant.activo = !variant.activo;
167:     await variant.save();
168:     res.json(variant);
169:   } catch (error) {
170:     res.status(400).json({ message: error.message });
171:   }
172: };

(End of file - total 172 lines)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 4.0s)

_Thinking:_

Good — `updateVariant` does `variant.update(req.body)`, so adding `precio_unitario` to the model means the API accepts it without controller changes.

Now let me check the frontend ModalProductos.jsx variant form to know where to add the price input.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components\\ModalProductos.jsx",
  "limit": 130,
  "offset": 160
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalProductos.jsx</path>
<type>file</type>
<content>
160:     try {
161:       const presentacionesUsadas = variantesExistentes.map((v) => v.presentation_id);
162:       const disponibles = presentaciones.filter(
163:         (p) => p.activo && !presentacionesUsadas.includes(p.id)
164:       );
165: 
166:       if (disponibles.length === 0) {
167:         alert('No hay más presentaciones disponibles');
168:         return;
169:       }
170: 
171:       await addVariant({
172:         product_id: producto.id,
173:         presentation_id: disponibles[0].id,
174:         activo: true,
175:         ranking: 0,
176:       });
177: 
178:       await cargarVariantesExistentes(producto.id);
179:     } catch (error) {
180:       console.error('Error al agregar variante:', error);
181:       alert(error.response?.data?.message || 'Error al agregar variante');
182:     }
183:   };
184: 
185:   const handleFileChange = (e) => {
186:     const selectedFile = e.target.files[0];
187:     if (selectedFile) {
188:       if (selectedFile.size > 10 * 1024 * 1024) {
189:         setImageError('El archivo debe ser menor a 10MB');
190:         return;
191:       }
192:       const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
193:       if (!allowedTypes.includes(selectedFile.type)) {
194:         setImageError('Formato no permitido. Use JPG, PNG, WebP o SVG');
195:         return;
196:       }
197:       setImageFile(selectedFile);
198:       setImageError('');
199:       const reader = new FileReader();
200:       reader.onloadend = () => setImagePreview(reader.result);
201:       reader.readAsDataURL(selectedFile);
202:     }
203:   };
204: 
205:   const handleDrop = (e) => {
206:     e.preventDefault();
207:     const droppedFile = e.dataTransfer.files[0];
208:     if (droppedFile && droppedFile.type.startsWith('image/')) {
209:       handleFileChange({ target: { files: [droppedFile] } });
210:     }
211:   };
212: 
213:   const handleUploadImage = async () => {
214:     if (!imageFile || !producto?.id) return;
215:     try {
216:       setIsUploading(true);
217:       setImageError('');
218:       const formData = new FormData();
219:       formData.append('image', imageFile);
220:       const res = await uploadProductImage(producto.id, formData);
221:       setImagePreview(res.data.imagen);
222:       setImageFile(null);
223:     } catch (error) {
224:       setImageError(error.response?.data?.message || 'Error al subir la imagen');
225:     } finally {
226:       setIsUploading(false);
227:     }
228:   };
229: 
230:   const handleDeleteImage = async () => {
231:     if (!producto?.id) return;
232:     try {
233:       setIsUploading(true);
234:       await deleteProductImage(producto.id);
235:       setImagePreview(null);
236:       setImageFile(null);
237:     } catch (error) {
238:       setImageError(error.response?.data?.message || 'Error al eliminar la imagen');
239:     } finally {
240:       setIsUploading(false);
241:     }
242:   };
243: 
244:   const presentacionesUsadas = variantesExistentes.map((v) => v.presentation_id);
245: 
246:   return (
247:     <Modal show onHide={onClose} centered size="lg">
248:       <Modal.Header closeButton>
249:         <Modal.Title>
250:           {onlyView ? 'Detalle Producto' : producto?.id ? 'Editar Producto' : 'Nuevo Producto'}
251:         </Modal.Title>
252:       </Modal.Header>
253:       <Form onSubmit={handleSubmit}>
254:         <Modal.Body>
255:           <div className="row">
256:             <div className="col-md-8">
257:               <Form.Group className="mb-3">
258:                 <Form.Label>Nombre *</Form.Label>
259:                 <Form.Control
260:                   type="text"
261:                   value={form.nombre}
262:                   onChange={(e) => setForm({ ...form, nombre: e.target.value })}
263:                   isInvalid={!!errors.nombre}
264:                   disabled={onlyView}
265:                 />
266:                 <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
267:               </Form.Group>
268: 
269:               <Form.Group className="mb-3">
270:                 <Form.Label>Código *</Form.Label>
271:                 <Form.Control
272:                   type="text"
273:                   value={form.codigo}
274:                   onChange={(e) => setForm({ ...form, codigo: e.target.value })}
275:                   isInvalid={!!errors.codigo}
276:                   disabled={onlyView}
277:                 />
278:                 <Form.Control.Feedback type="invalid">{errors.codigo}</Form.Control.Feedback>
279:               </Form.Group>
280: 
281:               <div className="row">
282:                 <div className="col-md-6">
283:                   <Form.Group className="mb-3">
284:                     <Form.Label>Rubro</Form.Label>
285:                     <Form.Select
286:                       value={form.rubro_id}
287:                       onChange={(e) => {
288:                         setForm({ ...form, rubro_id: e.target.value, subrubro_id: '' });
289:                       }}

(Showing lines 160-289 of 511. Use offset=290 to continue.)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\donAsdrubal\\src\\components\\ModalProductos.jsx",
  "limit": 150,
  "offset": 360
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\donAsdrubal\src\components\ModalProductos.jsx</path>
<type>file</type>
<content>
360:                       ))}
361:                     </div>
362:                   </Form.Group>
363:                 </>
364:               )}
365: 
366:               {producto?.id && variantesExistentes.length > 0 && (
367:                 <Form.Group className="mb-3">
368:                   <Form.Label>Variantes actuales</Form.Label>
369:                   <div className="border rounded p-2">
370:                     {variantesExistentes.map((v) => (
371:                       <div key={v.id} className="d-flex align-items-center gap-2 mb-2">
372:                         <Form.Control
373:                           size="sm"
374:                           type="text"
375:                           value={v.codigo}
376:                           disabled
377:                           style={{ maxWidth: '120px' }}
378:                           className="bg-light"
379:                         />
380:                         <Form.Select
381:                           size="sm"
382:                           value={v.presentation_id}
383:                           onChange={(e) => handleChangePresentacion(v.id, e.target.value)}
384:                           disabled={onlyView}
385:                           style={{ maxWidth: '250px' }}
386:                         >
387:                           {presentaciones.filter((p) => p.activo).map((p) => (
388:                             <option key={p.id} value={p.id}>
389:                               {p.nombre} ({p.cantidad_base} {p.unidad_base || ''})
390:                             </option>
391:                           ))}
392:                         </Form.Select>
393:                         {!onlyView && variantesExistentes.length > 1 && (
394:                           <Button
395:                             variant="outline-danger"
396:                             size="sm"
397:                             onClick={() => handleEliminarVariante(v.id)}
398:                           >
399:                             <i className="bi bi-trash"></i>
400:                           </Button>
401:                         )}
402:                       </div>
403:                     ))}
404:                     {!onlyView && (
405:                       <Button
406:                         variant="outline-success"
407:                         size="sm"
408:                         className="mt-1"
409:                         onClick={handleAgregarVariante}
410:                       >
411:                         <i className="bi bi-plus-lg me-1"></i>Agregar presentación
412:                       </Button>
413:                     )}
414:                   </div>
415:                 </Form.Group>
416:               )}
417:             </div>
418: 
419:             <div className="col-md-4">
420:               <Form.Group className="mb-3">
421:                 <Form.Label>Imagen ilustrativa</Form.Label>
422:                 <div
423:                   className={`border rounded p-3 text-center ${imageFile ? 'border-primary' : ''}`}
424:                   style={{
425:                     borderStyle: 'dashed',
426:                     cursor: 'pointer',
427:                     backgroundColor: '#f8f9fa',
428:                     minHeight: '180px',
429:                     display: 'flex',
430:                     flexDirection: 'column',
431:                     alignItems: 'center',
432:                     justifyContent: 'center',
433:                   }}
434:                   onClick={() => !onlyView && fileInputRef.current?.click()}
435:                   onDrop={handleDrop}
436:                   onDragOver={(e) => e.preventDefault()}
437:                 >
438:                   <input
439:                     ref={fileInputRef}
440:                     type="file"
441:                     accept="image/jpeg,image/png,image/webp,.svg"
442:                     onChange={handleFileChange}
443:                     style={{ display: 'none' }}
444:                     disabled={onlyView}
445:                   />
446:                   {imagePreview || imageFile ? (
447:                     <div>
448:                       <img
449:                         src={imagePreview}
450:                         alt="Preview"
451:                         style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }}
452:                         className="mb-2"
453:                       />
454:                       {imageFile && !onlyView && (
455:                         <div>
456:                           <small className="text-muted d-block mb-2">{imageFile.name}</small>
457:                           <Button
458:                             variant="primary"
459:                             size="sm"
460:                             onClick={(e) => { e.stopPropagation(); handleUploadImage(); }}
461:                             disabled={isUploading}
462:                           >
463:                             {isUploading ? 'Subiendo...' : 'Confirmar'}
464:                           </Button>
465:                         </div>
466:                       )}
467:                       {!onlyView && !imageFile && (
468:                         <div className="d-flex gap-2 justify-content-center mt-2">
469:                           <Button
470:                             variant="outline-danger"
471:                             size="sm"
472:                             onClick={(e) => { e.stopPropagation(); handleDeleteImage(); }}
473:                             disabled={isUploading}
474:                           >
475:                             Eliminar
476:                           </Button>
477:                         </div>
478:                       )}
479:                     </div>
480:                   ) : (
481:                     <div>
482:                       <i className="bi bi-image text-secondary" style={{ fontSize: '3rem' }}></i>
483:                       <p className="mt-2 mb-0">
484:                         {!onlyView && <strong>Haga clic para agregar</strong>}
485:                         {onlyView && <span className="text-muted">Sin imagen</span>}
486:                       </p>
487:                       <small className="text-muted">JPG, PNG o WebP (máx 10MB)</small>
488:                     </div>
489:                   )}
490:                 </div>
491:                 {imageError && <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>{imageError}</div>}
492:               </Form.Group>
493:             </div>
494:           </div>
495:         </Modal.Body>
496:         <Modal.Footer>
497:           <Button variant="secondary" onClick={onClose}>
498:             {onlyView ? 'Cerrar' : 'Cancelar'}
499:           </Button>
500:           {!onlyView && (
501:             <Button type="submit" variant="primary" disabled={isSubmitting || isUploading}>
502:               {isSubmitting ? 'Guardando...' : 'Guardar'}
503:             </Button>
504:           )}
505:         </Modal.Footer>
506:       </Form>
507:     </Modal>
508:   );
509: };

(Showing lines 360-509 of 511. Use offset=510 to continue.)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 42.5s)

_Thinking:_

I now know where the variant list is in ModalProductos (line 366-416) — a price input per variant fits perfectly there.

Let me check `handleChangePresentacion` and how variant updates happen in the frontend, so I can plan the price input correctly.

Let me grep for handleChangePresentacion.

Also I should double-check the `product_variants` full model + whether `precio_unitario` should be per presentation (unit) or per base unit (liter). Decision: **precio por unidad de presentación** (e.g., "bidón 20L = USD 35") is how salespeople think. But the billing is computed in base units (liters). Hmm.

Two options:
(a) `precio_unitario` on `product_variants` = price per PRESENTATION unit (e.g. per bidón). Then remito's `quantity_requested` (presentations) × precio = importe. But the remito stores `quantity_dispatched` in base units, and the billed quantity would be in base units... we'd need `cantidad_presentacion` tracked too.
(b) `precio_unitario` = price per BASE unit (per liter). Then importe = base_quantity × precio. Simple, single source of truth, works with item-level billing in base units.

I think (b) is technically cleaner but business-wise awkward (price per liter like $2.50/L is actually very normal in agrochemical distribution! e.g., "litro de herbicida X = USD 12,50").

Hmm, actually for agricultural inputs, prices are commonly quoted per liter or per kg of active. And "unidades base" are liters or kg. So price per base unit is natural. But sales people quote per bidón/tambor...

Best solution: store `precio_unitario` on `product_variants` **per presentation unit** (matching how the catalog is organized and how the user talks: "producto A 100 unidades"), and ALSO keep the base-unit price derived. Hmm, this doubles complexity.

Let me simplify: store the price on `product_variants` as **`precio_unitario` + `moneda`**, interpreted as **price per base unit** (the same unit as `quantity_dispatched` / `cantidad_facturada`). Rationale:
- Single unit of account across remitos, prefacturas and facturas → no conversion bugs.
- The UI can display the presentation equivalent: "USD 2,50/L → USD 50,00 por bidón de 20L" using `cantidad_base`.
- Item-level billing is in base units → importe = cantidad × precio. Exact.

Actually wait. Let's reconsider once more. The user says "producto A 100 unidades, producto B 50 unidades y producto C 350 litros". So the user themselves thinks in mixed units! Product C is measured in liters directly (its presentation IS liters: "Litro" as a presentation, cantidad_base=1). Products A and B are in "unidades" (bidones/tambores). So presentations already cover both cases: a product whose presentation is "Litro" has cantidad_base=1.

Hmm, but then "350 litros" for product C means the presentation is probably "Litro" or "Bidón 20L" with 350 units? If presentation = "Bidón 20 L" and the remito says 350, then 350 bidones = 7000 L. The user says "350 litros", so likely product C's presentation is a liter-based one, OR the user is describing the base quantity.

Given `quantity_requested` is in presentation units and `quantity_dispatched` in base units, and the current UI shows totals in base units ("ud" suffix, which is a bug-ish label — it says "ud" but it's liters), I need to decide what the user types when billing.

**Decision**: In the billing UI, the quantity input is in **base units** (the same unit as `quantity_dispatched`, currently displayed as the item's "Cantidad" in the remito detail), with a secondary display of the presentation equivalent. This keeps one unit of account and matches the existing `cantidad_facturada` semantics. I'll note this in the plan and flag that the "ud" label is misleading (it actually shows liters).

Hmm, wait. Actually let me reconsider. If the user says "facturar 20 unidades del producto A" where producto A's presentation is a bidón of 20L, and the remito detail shows "Cantidad: 2000.00 ud" (base units), then the user would have to enter 400 (liters) to bill 20 bidones. That's confusing.

Better UX: **let the user enter in the unit they're thinking in**, and convert. I'll store the billing quantity in base units (canonical), but the input shows the presentation unit by default with a toggle, OR show both: input in presentation units + derived base units.

Cleanest: the input is in **presentation units** (matching `quantity_requested`, the number the user originally entered when creating the remito), and we convert to base units with `cantidad_base` for storage. The remito detail table already shows base units; I'll make it show BOTH: "20 und (400 L)". Then the billing table shows "A facturar: [20] und = 400.00 L".

Hmm, but there's a subtlety: `quantity_dispatched` (base) may differ from `quantity_requested × cantidad_base` if the backend's FIFO rounding produced a different number. Let me check the backend's addRemito: `qtyBase = parseFloat(item.quantity_requested) * cantidadBase; ... remitoItem.quantity_dispatched = qtyBase;` — exact. But also there's `remito_item_lots` with `quantity_dispatched` split across lots, which might have rounding. The item-level total should be the item's `quantity_dispatched`.

To be safe: **the billing input is in base units by default** (canonical, always correct), and next to it we show the presentation equivalent in parentheses (e.g. `400.00 L (20 bidones de 20 L)`). This avoids conversion drift entirely. I'll go with base units + presentation hint. Simple, robust, and I'll show the hint prominently since the user's example is in "unidades".

Hmm, let me reconsider one final time... Actually, I'll do BOTH in the input: a number input in base units, and a small text showing the equivalent in presentation units that updates live. That's the "20 bidones = 400 L" hint. The user can type either base or, if I add a toggle, presentation. I'll keep it simple: base units input + live presentation equivalent hint. Decision made.

Now, `precio_unitario`: per base unit or per presentation? Since amounts are computed from base quantities, `precio_unitario` should be **per base unit** for exactness. But business-wise, the price list is per presentation...

Resolution: store `precio_unitario` on `product_variants` **per presentation unit** (e.g. bidón = USD 50) because that's how the catalog/variants are organized and how the business thinks, and derive the per-base-unit price as `precio_unitario / cantidad_base`. Then importe = cantidad_base × (precio_unitario / cantidad_base) = (cantidad_base / cantidad_base) × precio_unitario = cantidad_presentacion × precio_unitario. Exact as long as `cantidad_base` doesn't change.

Risk: `cantidad_base` could change later → historical amounts would shift. But we SNAPSHOT the price on the invoice line (`precio_unitario` + `unidad_base` + `cantidad_base` snapshot), so history is safe. And the remito's "valor estimado" uses the current price.

Hmm, but for the remito's estimated value we compute `quantity_requested × precio_unitario` — but `quantity_requested` is what the client asked for, and `quantity_dispatched` is what was actually shipped. Use `quantity_dispatched / cantidad_base × precio_unitario` ≈ same thing.

OK. I'm now confident in the design. Let me also decide: **snapshot fields on the invoice/prefactura line**:
- `cantidad` (base), `cantidad_presentacion`, `unidad_base`, `precio_unitario`, `precio_unitario_base`?, `importe`.

Simplify: snapshot `cantidad` (base units, canonical), `precio_unitario_base` (per base unit, computed at snapshot time), `importe` = cantidad × precio_unitario_base. Plus `descripcion` (texto libre con producto + presentación) and `cantidad_presentacion` + `presentacion_nombre` for display. That's clean and robust — one price unit (base), snapshotted.

But then `product_variants.precio_unitario` — per what? If everything downstream is per base unit, then storing it per base unit in the catalog is most consistent: `product_variants.precio_unitario` = price per base unit (per liter/kg). Then the UI shows "USD 2,50 /L" and also "= USD 50,00 por bidón de 20 L" (derived). Simple, one unit, no ambiguity, snapshot-safe.

Hmm, but is "precio por litro" realistic for the business? For agrochemicals/herbicides sold in 20L bidones at, say, USD 400/bidón → USD 20/L. Yes, per-liter pricing is totally standard and even easier to compare across presentations. And since a variant = producto+presentación, the price per base unit differs between presentations of the same product automatically (more liters per unit = higher per-liter price typically). Hmm, that means you must set the price per variant (per presentation) to reflect commercial reality — e.g. "Bidón 20L: USD 400" → USD 20/L; "Tambor 200L: USD 3.400" → USD 17/L. Setting the base price per variant is fine — the admin enters the price they want for that presentation.

**Final decision**: `product_variants.precio_unitario DECIMAL(15,4) NULL` + `product_variants.moneda VARCHAR(3) DEFAULT 'USD'`, interpreted as **price per presentation unit** (the natural commercial unit for a variant), and the billing computes in base units via `precio_base = precio_unitario / cantidad_base` (snapshotted on the line as `precio_unitario_base`).

Hmm, I keep flip-flopping. Let me settle definitively with a tiebreaker: which one makes the UI code simplest and least error-prone?

Scenario: remito has producto A "Bidón 20L", `quantity_requested = 20` (bidones), `quantity_dispatched = 400` (L). Variant `precio_unitario = 500` (per bidón). User bills 5 bidones = 100 L.
- Per-presentation: importe = 5 × 500 = 2500. Need to convert 100 L → 5 bidones (÷20). Requires `cantidad_base` division.
- Per-base: `precio_unitario = 25` (per L). importe = 100 × 25 = 2500. No division.

Per-base is simpler, no division, no rounding. And the conversion to presentation units is only for *display*.

**DECISION (final): `precio_unitario` = precio por unidad base (por litro/kg), con `moneda`.** The UI in Productos will show a helper "Equivale a USD X por bidón de 20 L". For products whose presentation IS the base unit (cantidad_base = 1), it's just the price per unit.

This is clean. Locked.

Now let me write the plan.

---

# PLAN

## Parte 0 — Contexto y hallazgos (análisis)

State the current architecture + the 3 gaps.

## Parte 1 — Modelo de datos (backend)

### 1.1 Precios en el catálogo
`product_variants`:
- `precio_unitario DECIMAL(15,4) NULL` — precio por unidad base (litro/kg) de la variante
- `moneda VARCHAR(3) NOT NULL DEFAULT 'USD'`
- `precio_vigente_desde DATE NULL` (opcional, skip)

Migration `2026xxxx-create-precios-y-facturacion-items.cjs` (idempotent, following the style of the facturas migration with helpers tableExists/columnaExiste/indiceExiste/fkExiste).

### 1.2 Facturación a nivel de ítem (reemplaza `remito_facturas`)

Since we can reset test data, **replace** `remito_facturas` with:

`factura_items`:
```
id, factura_id, remito_id, remito_item_id, product_variant_id,
cantidad DECIMAL(15,4)          -- unidades base facturadas
cantidad_presentacion DECIMAL(15,4)  -- snapshot de lo pedido por el usuario
unidad_base VARCHAR(30) NULL    -- snapshot ('L','kg')
descripcion VARCHAR(255)        -- snapshot "Producto A - Bidón 20L"
precio_unitario DECIMAL(15,4)   -- snapshot precio por unidad base
importe DECIMAL(15,4)           -- = cantidad * precio_unitario
moneda VARCHAR(3) DEFAULT 'USD'
createdAt, updatedAt
UNIQUE(factura_id, remito_item_id)
INDEX(remito_item_id), INDEX(remito_id)
FKs → facturas (CASCADE), remitos (RESTRICT), remito_items (RESTRICT), product_variants (RESTRICT)
```

And `facturas` gains:
```
moneda VARCHAR(3) NOT NULL DEFAULT 'USD'
total DECIMAL(15,4) NOT NULL DEFAULT 0     -- importe total en moneda
observaciones...
```
Actually `total` can be derived (SUM of items), but storing it denormalized is convenient for list queries. I'll store it and recompute on write. Also `numero` uniqueness already handled.

Drop `remito_facturas` table (after reset of test data).

Wait — is dropping OK? `remito_facturas` is used in `facturacionService.js` and `controllers/facturas.js` and `controllers/remitos.js`. All will be rewritten. And `models/index.js` associations. Fine.

Hmm, but one thing: with only `factura_items`, the "facturado por remito" = SUM(cantidad) of items of that remito. Works. And "facturado por ítem de remito" = SUM per remito_item_id. Works.

### 1.3 Prefactura / reserva

`prefacturas`:
```
id, company_id DEFAULT 1, cliente_id NOT NULL,
estado ENUM('BORRADOR','RESERVADA','FACTURADA','LIBERADA','ANULADA') DEFAULT 'BORRADOR',
fecha DATEONLY NULL,          -- fecha prevista
numero VARCHAR(20) NULL,      -- nº de factura preasignado
moneda VARCHAR(3) DEFAULT 'USD',
total DECIMAL(15,4) DEFAULT 0,
notas TEXT NULL,
created_by, created_at, updated_at,
reservado_por, reservado_at,
vence_at DATETIME NULL,
factura_id NULL,              -- factura generada (factura_id → facturas.id)
anulado_por, anulado_at
```
`estado` values: BORRADOR ( editable, no bloquea), RESERVADA (bloquea remitos), FACTURADA (convertida), LIBERADA (reserva liberada sin facturar), VENCIDA.

Hmm, do I need BORRADOR and LIBERADA and VENCIDA separately? Let's simplify the state machine:
- `BORRADOR` — se está armando, NO bloquea (editable freely)
- `RESERVADA` — bloquea los remitos seleccionados
- `FACTURADA` — convertida (tiene factura_id)
- `LIBERADA` — reserva cancelada/liberada (remitos libres)
- `VENCIDA` — pasó `vence_at` sin facturar (remitos libres; se puede renovar)

`prefactura_items`:
```
id, prefactura_id, remito_id, remito_item_id, product_variant_id,
cantidad DECIMAL(15,4)         -- base
cantidad_presentacion DECIMAL(15,4)
unidad_base VARCHAR(30), descripcion VARCHAR(255),
precio_unitario DECIMAL(15,4)  -- snapshot (editable en la prefactura)
importe DECIMAL(15,4)
moneda VARCHAR(3) DEFAULT 'USD'
createdAt, updatedAt
UNIQUE(prefactura_id, remito_item_id)
```

### 1.4 Reserva a nivel de remito

The user wants whole remitos reserved. But the prefactura may only bill part of a remito. Two sub-decisions:
- **Bloqueo**: while RESERVADA, the *remito* is blocked for individual billing by anyone (full remito, not just the reserved portion). This matches the user's ask literally ("selecciono remito3, remito9 y remito8... evitar que venga otra persona y seleccione alguno de estos remitos y lo facture individualmente").

  Implementation: a helper `obtenerReservasActivas(remitoIds)` → map remito_id → prefactura. `addFactura` rejects if the remito is reserved by a prefactura other than the one being converted, unless `override=true` + admin.

- **Al liberar/convertir**: after conversion, the billed quantities are consumed from the item saldos, and the rest of the remito's saldo becomes free again (the remito is no longer reserved). Good.

## Parte 2 — Backend API

### 2.1 Servicios nuevos

`backend/src/services/facturacionService.js` (reescribir):
- `calcularSaldosPorItem(remitoIds)` → `{ [remito_item_id]: { facturado, saldo } }`
- `calcularEstadoFacturacion` (se mantiene)
- `calcularSaldosFacturacion(remitoIds)` (se mantiene, ahora suma factura_items)
- `calcularTotalesFactura(facturaId)` → total importe
- `valorRemito(remito)` → valor estimado en USD (Σ cantidad × precio actual)

`backend/src/services/reservasService.js` (nuevo):
- `obtenerReservasActivas(remitoIds, {transaction})` → `{ [remito_id]: { prefactura_id, estado, usuario,created_at, vence_at } }` (ignora prefacturas VENCIDAS — se auto-vencen)
- `hayReservaActiva(remitoId)` → boolean
- `autoVencerReservas()` → marca VENCIDA las vencidas (lazy en cada lectura + un cron opcional)

### 2.2 Endpoints

**Catálogo/precios:**
- `GET /stock/product-variants/full` → ya existe, ahora incluye `precio_unitario` y `moneda` (automático con el modelo). `updateVariant` acepta los campos nuevos sin cambios (hace `variant.update(req.body)`).
- `GET /stock/remitos/catalogo/:warehouse_id` → agregar `precio_unitario`, `moneda`, `precio_presentacion` (derivado) para poder mostrar el valor en los modales de remito.

**Remitos:**
- `GET /stock/remitos` → cada remito suma: `valor_estimado`, `facturado`, `saldo_facturacion`, `estado_facturacion`, `reservado` (bool), `reserva` ({prefactura_id, usuario, vence_at}), y **por ítem**: `items[].facturado`, `items[].saldo`.
- `GET /stock/remitos/:id` → idem, con el detalle por ítem + `facturaciones[]` ahora con las líneas.

**Facturas (reescritura del controller):**
- `GET /stock/facturas` → facturas + `items[]` (líneas con producto, cantidad, precio, importe) + `total`
- `GET /stock/facturas/:id`
- `GET /stock/facturas/remitos-disponibles?cliente_id=&incluir_no_facturables=` → ahora con `items[]` incluyendo `facturado`/`saldo` por ítem, y `reservado`/`reserva`/`facturable`/`motivo_bloqueo` (nuevo motivo: "Reservado por la prefactura #12")
- `POST /stock/facturas` → **nuevo payload**:
```json
{
  "cliente_id": 1,
  "tipo": "FACTURA",
  "fecha": "2026-11-19",
  "numero": "0001-00000042",
  "notas": "...",
  "moneda": "USD",
  "items": [
    { "remito_id": 10, "remito_item_id": 33, "cantidad": 400, "cantidad_presentacion": 20,
      "precio_unitario": 25, "descripcion": "Producto A - Bidón 20L" }
  ],
  "override_reserva": false
}
```
  Validaciones: cliente existe; items ≥1 para FACTURA, =0 para ANTICIPO; cada item: remito COMPLETADO, del cliente, no interno, cantidad > 0 y ≤ saldo del ítem; no repetir remito_item_id; **reserva activa → 409 salvo `override_reserva` (solo ADMIN, y se audita)**; precio: si viene `precio_unitario` null, se toma el de la variante; el importe = cantidad × precio; total = Σ importes.
- `PUT /stock/facturas/:id/anular` → marca ANULADA (libera saldo y reservas).

**Prefacturas / reservas (nuevo `controllers/prefacturas.js`):**
- `GET /stock/prefacturas?cliente_id=&estado=` → lista con items, total, cliente, creador
- `GET /stock/prefacturas/:id`
- `POST /stock/prefacturas` → crea en BORRADOR o RESERVADA (según el body). Valida: todos los remitos del mismo cliente, COMPLETADO, sin reserva activa ajena, cantidades ≤ saldo del ítem.
- `PUT /stock/prefacturas/:id` → actualiza items/notas/precios (solo BORRADOR o RESERVADA sin conflicto)
- `POST /stock/prefacturas/:id/reservar` → BORRADOR → RESERVADA (toma el lock de los remitos)
- `POST /stock/prefacturas/:id/liberar` → RESERVADA → LIBERADA (libera los remitos)
- `POST /stock/prefacturas/:id/facturar` → **convierte a factura**: crea la `Facturas` con estado SIMULADA + las `FacturaItems` desde `prefactura_items`, marca la prefactura FACTURADA con `factura_id`, libera la reserva. Es el "no tener que volver a calcular todo para facturar".
- `DELETE /stock/prefacturas/:id` → elimina si está en BORRADOR.

**Rutas** (`backend/src/routes/index.js`):
```js
router.get('/stock/prefacturas', prefacturasController.allPrefacturas);
router.get('/stock/prefacturas/:id', prefacturasController.getPrefacturaById);
router.post('/stock/prefacturas', verifyRole([ROLES.ADMIN]), prefacturasController.addPrefactura);
router.put('/stock/prefacturas/:id', verifyRole([ROLES.ADMIN]), prefacturasController.upPrefactura);
router.post('/stock/prefacturas/:id/reservar', verifyRole([ROLES.ADMIN]), ...);
router.post('/stock/prefacturas/:id/liberar', verifyRole([ROLES.ADMIN]), ...);
router.post('/stock/prefacturas/:id/facturar', verifyRole([ROLES.ADMIN]), ...);
router.delete('/stock/prefacturas/:id', verifyRole([ROLES.ADMIN]), ...);
```

Also **audit log**: there's an `auditLogs.js` model. The admin override should be audited. Let me check if there's an audit service. Let me check quickly.

## Parte 3 — Frontend

### 3.1 Nuevos archivos
- `src/api/prefacturas.js` — API layer
- `src/components/ModalPrefactura.jsx` — armar/editar la prefactura (selección de ítems y cantidades + precios + total)
- `src/components/ModalFactura.jsx` — **reescribir**: ahora permite elegir ítems y cantidades por ítem (feature 1)
- `src/components/Facturacion.jsx` — agregar panel "Prefacturas y reservas"
- `src/components/Remitos.jsx` — multi-select + acción "Armar prefactura"
- `src/utils/facturacion.js` — **nuevo**:常量 compartidas (FACTURACION_COLORS, FACTURACION_LABELS, formatMoneda es-AR/USD, normalizar) — elimina la duplicación actual entre Remitos.jsx y Facturacion.jsx.

### 3.2 Facturación parcial por producto (Feature 1) — UX

En `ModalFactura`:
- Tabla de remitos (como hoy) pero al marcar un remito se despliega un **detalle de ítems**:
```
Remito 000315                        [✓]
  ┌──────────────────────────────────────────────────────────────┐
  │ Producto            Presentación   Remitido  Facturado  A facturar │
  │ Herbicida X         Bidón 20 L     400 L     0 L       [  400  ] L  (20 bidones)  │
  │ Fertilizante Y      Litro          350 L     100 L     [  150  ] L                  │
  └──────────────────────────────────────────────────────────────┘
```
- Input en **unidades base (L)**, con helper en vivo que muestra el equivalente en presentación.
- Botones rápidos: "Todo" / "Nada" / "Saldo" por ítem.
- Totales al pie: **Total litros** + **Total USD** (Σ cantidad × precio de la variante).
- Si la variante no tiene precio, se muestra "Sin precio" y el total USD no se calcula (o 0) → se avisa.
- Validación en cliente: cantidad ≤ saldo del ítem; cantidad > 0.
- Envío: `items: [{remito_id, remito_item_id, cantidad, cantidad_presentacion, precio_unitario}]`.

En `Facturacion.jsx`:
- La tabla "Remitos pendientes de facturar" muestra columnas nuevas: **Total**, **Facturado**, **Saldo (L)**, **Valor (USD)**, **Facturación**, **Acción**. Y una columna de items expandible? Mejor: al hacer click en "Facturar" se abre el modal con el remito ya marcado y el detalle de ítems visible.
- El detalle de la factura muestra la tabla de ítems con producto, cantidad, precio, importe, y el remito de origen.
- La columna "Total" de la lista de facturas pasa a mostrar el importe USD (`factura.total`), con los litros como dato secundario.

### 3.3 Prefactura / reserva (Feature 2) — UX

**En Remitos.jsx:**
- Multi-select: checkbox por fila + barra flotante "N remitos seleccionados" con acciones:
  - "Armar prefactura" (si todos son del mismo cliente, COMPLETADO y sin reserva)
  - "Ir a Facturación"
- Al marcar "Armar prefactura" se abre `ModalPrefactura` con:
  - Cliente (derivado, no editable si hay selección)
  - Fecha prevista, N° de factura sugerido, notas, moneda, **vence_at** (opcional, ej. 7 días)
  - Lista de remitos → por cada uno, sus ítems con cantidad a facturar (por defecto = saldo del ítem) y **precio unitario editable** (por defecto = precio de la variante)
  - **Total en USD en vivo** + objetivo "monto del cliente" (25000) con indicador de diferencia ("faltan USD 3.200" / "excede USD 1.100")
  - Botones: "Guardar borrador" y "Reservar"
- Validación: todos los remitos del mismo cliente; sin reservas ajenas; cantidades ≤ saldo.
- Feedback visual: si el usuario marca remitos de clientes distintos → aviso.

**En Facturacion.jsx:**
- Nuevo panel **"Prefacturas y reservas"** (arriba o debajo de "Remitos pendientes"), con:
  - Filtros por cliente y estado
  - Tabla: N° prefactura | Cliente | Fecha | Remitos | Total USD | Estado | Acciones
  - Acciones: "Ver detalle", "Convertir en factura" (→ llama `/facturar`, crea la factura y recarga), "Liberar reserva", "Editar" (si BORRADOR)
- El detalle de la prefactura muestra los ítems con cantidades y precios, y quién la reservó y hasta cuándo.

**Indicador de reserva en todo el sistema:**
- `Remitos.jsx`: badge "Reservado" en la fila + el botón Facturar deshabilitado con tooltip "Reservado por la prefactura #12 (Juan) — venció el 26/11".
- `Facturacion.jsx` panel de pendientes: idem, `motivo_bloqueo` = "Reservado por la prefactura #12".
- En el modal de factura, un remito reservado no aparece en la lista (o aparece bloqueado con el motivo).

**Override de admin:**
- Botón "Facturar de todos modos" con confirmación fuerte ("El remito 000315 está reservado por la prefactura #12 de Juan Pérez. Facturarlo va a consumir saldo que puede no estar disponible. ¿Continuar?"), solo visible para Administrador, y se manda `override_reserva: true`. Queda auditado.

## Parte 4 — Migración de datos (reset)

Dado que son datos de prueba:
1. `DELETE FROM remito_facturas; DELETE FROM facturas;` (reset)
2. Correr la migración nueva (precios + factura_items + prefacturas + drop remito_facturas)
3. Backfill de precios: `product_variants.precio_unitario` queda NULL hasta que el admin cargue los precios. La UI debe manejar "precio no definido" gracefully (el módulo funciona igual en cantidad; el importe queda en blanco/0 con aviso).

## Parte 5 — Orden de implementación (pasos)

Fase 1 — Precios
1. Backend: model + migration + exponer en `allVariants`/`getFullVariants` (automático) + `getCatalogo`.
2. Frontend: `ModalProductos.jsx` → input de precio por variante + columna en `Productos.jsx` + helper "= USD X por bidón".
3. Frontend: `formatMoneda` util.

Fase 2 — Facturación por ítem
4. Backend: model `facturaItems` + `facturas` (total, moneda) + migration + `facturacionService` reescrito + `controllers/facturas.js` reescrito + `controllers/remitos.js` (por ítem) + associations en `models/index.js` + rutas.
5. Frontend: `ModalFactura.jsx` reescrito (detalle de ítems), `Facturacion.jsx` (columnas USD + detalle con ítems), `Remitos.jsx` (detalle del remito con "facturado por ítem").

Fase 3 — Prefactura / reserva
6. Backend: models `prefacturas`/`prefacturaItems` + migration + `reservasService` + `controllers/prefacturas.js` + rutas + bloqueos en `addFactura` + flags `reservado` en las lecturas de remitos.
7. Frontend: `api/prefacturas.js`, `ModalPrefactura.jsx`, multi-select en `Remitos.jsx`, panel de prefacturas en `Facturacion.jsx`, badges de reserva.

Fase 4 — Cierre
8. `npm run lint` en el frontend; revisar que no queden warnings.
9. CHANGELOG.md en ambos repos (el backend también tiene CHANGELOG? let me check).

Let me check: does the backend have a CHANGELOG.md and AGENTS.md?

Let me verify a few remaining things:
- backend CHANGELOG / AGENTS
- auditLogs service (for the override audit)
- `models/index.js` associations for facturas

Let me run those

**Tool: bash**

**Input:**
```json
{
  "command": "Get-ChildItem \"C:\\Job\\Don Asdrubal\\backend\" -File | Select-Object -ExpandProperty Name; Write-Output \"=== services ===\"; Get-ChildItem \"C:\\Job\\Don Asdrubal\\backend\\src\\services\" -Recurse -File | Select-Object -ExpandProperty FullName"
}
```

**Output:**
```
.env
.gitignore
.sequelizerc
donasdrubal_BE.code-workspace
env.prod
package-lock.json
package.json
README.md
reporte-debug.json
server.js
skills-lock.json
test_agrupado.js
=== services ===
C:\Job\Don Asdrubal\backend\src\services\auditContext.js
C:\Job\Don Asdrubal\backend\src\services\AuditLogService.js
C:\Job\Don Asdrubal\backend\src\services\AuditLogService.test.js
C:\Job\Don Asdrubal\backend\src\services\facturacionService.js
C:\Job\Don Asdrubal\backend\src\services\modelAuditHooks.js
C:\Job\Don Asdrubal\backend\src\services\email\emailService.js
C:\Job\Don Asdrubal\backend\src\services\model\userService.js
C:\Job\Don Asdrubal\backend\src\services\pdf\OldpdfResumenService.js
C:\Job\Don Asdrubal\backend\src\services\pdf\pdfCalibracionesService.js
C:\Job\Don Asdrubal\backend\src\services\pdf\pdfInformeCrmService.js
C:\Job\Don Asdrubal\backend\src\services\pdf\pdfMuestraAguaService.js
C:\Job\Don Asdrubal\backend\src\services\pdf\pdfResumenCrmService.js
C:\Job\Don Asdrubal\backend\src\services\reportes\informeCrmService.js
C:\Job\Don Asdrubal\backend\src\services\reportes\remitosFaltantesService.js
C:\Job\Don Asdrubal\backend\src\services\reportes\remitosFaltantesService.test.js
C:\Job\Don Asdrubal\backend\src\services\reportes\reporteSemanalService.js
C:\Job\Don Asdrubal\backend\src\services\reportes\resumenCrmService.js

```

**Tool: grep**

**Input:**
```json
{
  "include": "index.js",
  "path": "C:\\Job\\Don Asdrubal\\backend\\src\\models",
  "pattern": "Facturas|RemitoFacturas|RemitoItems"
}
```

**Output:**
```
Found 24 matches
C:\Job\Don Asdrubal\backend\src\models\index.js:
  Line 34: import RemitoItems from './remitoItems.js';

  Line 42: import Facturas from './facturas.js';

  Line 43: import RemitoFacturas from './remitoFacturas.js';

  Line 626: // Remitos → RemitoItems

  Line 627: Remitos.hasMany(RemitoItems, {

  Line 631: RemitoItems.belongsTo(Remitos, {

  Line 652: // Facturas → Clientes (facturación / anticipo de un cliente)

  Line 653: Facturas.belongsTo(Clientes, {

  Line 658: // Facturas → Users (created_by)

  Line 659: Facturas.belongsTo(Users, {

  Line 664: // Facturas → RemitoFacturas (1 factura → N remitos)

  Line 665: Facturas.hasMany(RemitoFacturas, {

  Line 669: RemitoFacturas.belongsTo(Facturas, {

  Line 674: // Remitos → RemitoFacturas (1 remito → N facturas parciales)

  Line 675: Remitos.hasMany(RemitoFacturas, {

  Line 679: RemitoFacturas.belongsTo(Remitos, {

  Line 684: // RemitoItems → ProductVariants

  Line 685: RemitoItems.belongsTo(ProductVariants, {

  Line 690: // RemitoItems → RemitoItemLots

  Line 691: RemitoItems.hasMany(RemitoItemLots, {

  Line 695: RemitoItemLots.belongsTo(RemitoItems, {

  Line 773:   RemitoItems,

  Line 776:   Facturas,

  Line 777:   RemitoFacturas,

```

---

## Assistant (Plan · MiniMax M3.1 Flash · 5.4s)

_Thinking:_

Good. There's an `AuditLogService`. Let me check its API quickly to plan the audit of the override.

Let me check the AuditLogService export signature

**Tool: grep**

**Input:**
```json
{
  "include": "AuditLogService.js",
  "path": "C:\\Job\\Don Asdrubal\\backend\\src\\services",
  "pattern": "export const|export async function|export function"
}
```

**Output:**
```
Found 2 matches
C:\Job\Don Asdrubal\backend\src\services\AuditLogService.js:
  Line 6: export const sanitizeAuditValues = (value, depth = 0) => {

  Line 22: export const diffAuditValues = (oldValues, newValues) => {

```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\models\\index.js",
  "limit": 60,
  "offset": 645
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\models\index.js</path>
<type>file</type>
<content>
645: 
646: // RemitoArchivos → Users (uploaded_by)
647: RemitoArchivos.belongsTo(Users, {
648:   foreignKey: 'uploaded_by',
649:   as: 'subidoPor',
650: });
651: 
652: // Facturas → Clientes (facturación / anticipo de un cliente)
653: Facturas.belongsTo(Clientes, {
654:   foreignKey: 'cliente_id',
655:   as: 'cliente',
656: });
657: 
658: // Facturas → Users (created_by)
659: Facturas.belongsTo(Users, {
660:   foreignKey: 'created_by',
661:   as: 'creadoPor',
662: });
663: 
664: // Facturas → RemitoFacturas (1 factura → N remitos)
665: Facturas.hasMany(RemitoFacturas, {
666:   foreignKey: 'factura_id',
667:   as: 'remitos',
668: });
669: RemitoFacturas.belongsTo(Facturas, {
670:   foreignKey: 'factura_id',
671:   as: 'factura',
672: });
673: 
674: // Remitos → RemitoFacturas (1 remito → N facturas parciales)
675: Remitos.hasMany(RemitoFacturas, {
676:   foreignKey: 'remito_id',
677:   as: 'facturaciones',
678: });
679: RemitoFacturas.belongsTo(Remitos, {
680:   foreignKey: 'remito_id',
681:   as: 'remito',
682: });
683: 
684: // RemitoItems → ProductVariants
685: RemitoItems.belongsTo(ProductVariants, {
686:   foreignKey: 'product_variant_id',
687:   as: 'variante',
688: });
689: 
690: // RemitoItems → RemitoItemLots
691: RemitoItems.hasMany(RemitoItemLots, {
692:   foreignKey: 'remito_item_id',
693:   as: 'lotes',
694: });
695: RemitoItemLots.belongsTo(RemitoItems, {
696:   foreignKey: 'remito_item_id',
697:   as: 'itemRemito',
698: });
699: 
700: // RemitoItemLots → ProductLots
701: RemitoItemLots.belongsTo(ProductLots, {
702:   foreignKey: 'product_lot_id',
703:   as: 'lote',
704: });

(Showing lines 645-704 of 781. Use offset=705 to continue.)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 3.7s)

_Thinking:_

I have everything. Now let me write the plan.

One more consideration: the `auditLogs` model — let me check it briefly to see if it's generic (model + action) so I can log the admin override. Let me quickly check the model fields.

Actually, `modelAuditHooks.js` suggests automatic auditing via hooks on models. Let me check `auditLogs.js` model quickly.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\models\\auditLogs.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\models\auditLogs.js</path>
<type>file</type>
<content>
1: import { DataTypes, Model } from 'sequelize';
2: import db from '../config/database.js';
3: 
4: class AuditLogs extends Model {}
5: 
6: AuditLogs.init({
7:   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
8:   user_id: { type: DataTypes.INTEGER, allowNull: true },
9:   actor_type: { type: DataTypes.STRING(24), allowNull: false, defaultValue: 'system' },
10:   module: { type: DataTypes.STRING(32), allowNull: false },
11:   action: { type: DataTypes.STRING(40), allowNull: false },
12:   entity_type: { type: DataTypes.STRING(100), allowNull: false },
13:   entity_id: { type: DataTypes.STRING(191), allowNull: true },
14:   old_values: { type: DataTypes.JSON, allowNull: true },
15:   new_values: { type: DataTypes.JSON, allowNull: true },
16:   changed_fields: { type: DataTypes.JSON, allowNull: true },
17:   description: { type: DataTypes.STRING(500), allowNull: true },
18:   request_id: { type: DataTypes.STRING(64), allowNull: true },
19:   ip_address: { type: DataTypes.STRING(45), allowNull: true },
20:   user_agent: { type: DataTypes.STRING(500), allowNull: true },
21:   http_method: { type: DataTypes.STRING(10), allowNull: true },
22:   endpoint: { type: DataTypes.STRING(500), allowNull: true },
23:   status: { type: DataTypes.STRING(16), allowNull: false, defaultValue: 'SUCCESS' },
24:   created_at: { type: DataTypes.DATE(3), allowNull: false, defaultValue: DataTypes.NOW },
25: }, {
26:   sequelize: db,
27:   modelName: 'AuditLogs',
28:   tableName: 'audit_logs',
29:   timestamps: false,
30:   indexes: [
31:     { name: 'audit_user_date', fields: ['user_id', 'created_at'] },
32:     { name: 'audit_entity_date', fields: ['entity_type', 'entity_id', 'created_at'] },
33:     { name: 'audit_module_date', fields: ['module', 'created_at'] },
34:     { name: 'audit_action_date', fields: ['action', 'created_at'] },
35:     { name: 'audit_request_id', fields: ['request_id'] },
36:   ],
37: });
38: 
39: export default AuditLogs;

(End of file - total 39 lines)
</content>
```

---

## Assistant (Plan · MiniMax M3.1 Flash · 31.1s)

_Thinking:_

There's a generic audit_logs table with module/action/entity_type/entity_id/description/user_id — perfect for logging the admin override of a reservation.

Now let me write the final plan. It should be comprehensive but readable. I'll write it in Spanish since the user writes in Spanish.

Let me structure it:

# Análisis
- Estado actual (facts with file:line)
- Los 3 huecos

# Plan
## Fase 0 — Decisiones tomadas
## Fase 1 — Modelo de datos (migraciones backend)
## Fase 2 — Backend (services, controllers, routes)
## Fase 3 — Frontend
## Fase 4 — Reset de datos y verificación

Let me include the schema definitions, API contracts, and UI specs concretely.

Let me make sure I reference the actual files/lines.

Key file references:
- `src/api/facturas.js` (nuevo, untracked)
- `src/components/Facturacion.jsx` (nuevo, untracked) — 766 líneas
- `src/components/ModalFactura.jsx` (nuevo, untracked) — 385 líneas
- `src/components/Remitos.jsx:383-387` — `puedeFacturarRemito`
- `src/components/Remitos.jsx:510-565` — tabla de ítems
- `src/components/Remitos.jsx:567-584` — nota de facturación
- `backend/src/services/facturacionService.js`
- `backend/src/controllers/facturas.js`
- `backend/src/models/remitoFacturas.js`
- `backend/src/models/productVariants.js`
- `backend/src/components/ModalProductos.jsx:366-416` — variantes
- `backend/src/migrations/20261106000001-create-facturas.cjs` — estilo de migración idempotente

Let me write it now. I'll keep it tight but complete.

One more thought on the "20 unidades producto A" — I decided base units with presentation hint. Let me make sure the plan is explicit about the unit decision and the display of both.

Also I should mention the `ud` label bug: `Remitos.jsx:545` shows `{...toFixed(2)} ud` but the value is liters (base units). With the presentation info available, we should show "20 bidones (400 L)".

Let me also handle: `quantity_requested` vs `quantity_dispatched`. When billing, the "saldo" per item = `quantity_dispatched` − facturado. Correct.

One more: the reservation blocks the *remito* (whole), so in `remitos-disponibles` the reserved remitos get `facturable: false` and `motivo_bloqueo: 'Reservado por la prefactura #12'`.

Also I should mention: when the prefactura is converted to a factura, the remitos' remaining saldo (the part not billed) becomes free. And the prefactura's reserved remitos are released.

Also: what if the prefactura reserves remito 3,9,8 and the user later wants to bill remito 5 individually? Allowed (not reserved).

Let me also define what happens when a reserved remito gets cancelled/anulado → the reservation should be released. I'll add that to the plan: in `cancelRemito`, release any active reservation of that remito (mark the prefactura LIBERADA or just drop that remito from it). Simplest: mark the prefactura's `estado` as `LIBERADA` if any of its remitos is anulado? Better: remove the anulado remito's items from the prefactura and recompute the total, keeping it RESERVADA for the rest. I'll specify that.

Now writing the plan.

Let me be careful about length — thorough but not bloated. I'll use tables and code blocks.

Also note the AGENTS.md workflow: add a line to CHANGELOG.md at the end. The backend repo doesn't have a CHANGELOG.md (I saw only README.md). So only the frontend CHANGELOG.md.

Let me verify the frontend CHANGELOG format.

Actually AGENTS.md says: `YYYY-MM-DD - HH:MM - $(git branch --show-current) - [Descripción breve]`. Good, I'll include that as a step.

Let me write the final answer now.

I need to present this as a plan for approval. Let me write it clearly.

Let me double check one thing about the `precio_unitario` semantic decision — I want to present it cleanly:

`product_variants.precio_unitario` = **precio por unidad base** (por litro/kg). Ej: producto "Herbicida X" en "Bidón 20 L" → precio_unitario = 25 USD/L → el bidón cuesta 500 USD.

Helper en la UI: "USD 25,00 /L — Equivale a USD 500,00 por Bidón 20 L".

Importe de una línea = cantidad_base × precio_unitario.

That's consistent everywhere. Locked.

Hmm, but one practical concern: the admin has to think in per-liter prices. For most agro products, per-liter is standard (USD 12,50/L). OK.

But wait — what if a product is sold by kg and the base unit is kg? `unidad_base` handles that. Fine.

Now, also: `precio_unitario` NULL means "no price defined". The UI must handle this: show "Sin precio" and let the prefactura/factura line accept a manual price. Good — this also allows the "cotización con precio propio" flow.

Final structure of the plan. Writing it now.

Let me estimate the files touched:

**Backend** (`C:\Job\Don Asdrubal\backend`):
- `src/models/productVariants.js` — +precio_unitario, +moneda
- `src/models/facturaItems.js` — NUEVO
- `src/models/prefacturas.js` — NUEVO
- `src/models/prefacturaItems.js` — NUEVO
- `src/models/facturas.js` — +moneda, +total
- `src/models/remitoFacturas.js` — ELIMINAR (o dejar vacío)
- `src/models/index.js` — imports + associations
- `src/migrations/20261120000001-precios-facturacion-items-prefacturas.cjs` — NUEVO
- `src/services/facturacionService.js` — reescritura
- `src/services/reservasService.js` — NUEVO
- `src/controllers/facturas.js` — reescritura
- `src/controllers/prefacturas.js` — NUEVO
- `src/controllers/remitos.js` — por ítem + reservado
- `src/controllers/productVariants.js` — exponer precio (ya automático) + validar
- `src/routes/index.js` — rutas prefacturas

**Frontend** (`C:\Job\Don Asdrubal\donAsdrubal`):
- `src/api/prefacturas.js` — NUEVO
- `src/api/facturas.js` — payloads nuevos
- `src/api/productVariants.js` — sin cambios
- `src/utils/facturacion.js` — NUEVO (constantes + formatMoneda)
- `src/utils/moneda.js` — o dentro de facturacion.js. I'll put formatMoneda in `src/utils/facturacion.js`.
- `src/components/ModalFactura.jsx` — reescritura (ítems)
- `src/components/ModalPrefactura.jsx` — NUEVO
- `src/components/Facturacion.jsx` — panel prefacturas + columnas USD + detalle con ítems
- `src/components/Remitos.jsx` — multi-select + "Armar prefactura" + detalle por ítem + badge reservado
- `src/components/ModalProductos.jsx` — input de precio por variante
- `src/components/Productos.jsx` — columna de precio
- `src/css/page-header.css` — estilos nuevos (o un `src/css/facturacion.css` nuevo)
- `CHANGELOG.md`

Good. Let me write.

I'll also add a "Fuera de alcance / decisiones posteriores" section:
- Facturación real (EMITIDA, AFIP/ARCA, PDF) — Etapa 2
- Múltiples monedas (solo USD)
- Reserva por ítem (la reserva es a nivel de remito)
- Notificaciones/avisos al reservar

Let me write it out.

Also the sequence should note that `npm run lint` is the only check.

Now writing.

Tengo todo el panorama. Acá va el análisis y el plan.

---

# ANÁLISIS

## Cómo funciona hoy

El módulo de Facturación (Etapa 1) está **sin commitear** en los dos repos: `src/components/Facturacion.jsx`, `ModalFactura.jsx` y `src/api/facturas.js` son nuevos; en el backend, `controllers/facturas.js`, `models/facturas.js`, `models/remitoFacturas.js`, `services/facturacionService.js` y la migración `20261106000001-create-facturas.cjs` también.

El modelo actual es **todo en cantidad, cero dinero**:

| Concepto | Dónde vive | Unidad |
|---|---|---|
| Remito | `remitos` | — |
| Ítem de remito | `remito_items.quantity_dispatched` | **unidades base (litros)** |
| Enlace factura↔remito | `remito_facturas.cantidad_facturada` | **unidades base** |
| "Total facturado" | `SUM(remito_facturas.cantidad_facturada)` | **unidades base** |
| Saldo | `total − facturado` | **unidades base** |

Verifiqué con grep que **no existe ningún campo monetario en todo el backend**: ni `precio`, ni `importe`, ni `tarifa`, ni `moneda`. Ni siquiera en `purchases`/`purchaseItems`. El precio más cercano en el código es `precio_unitario` de la línea 61 de `importClientesFromCsv.js` — que en realidad es `importedCount`.

## Los 3 huecos que describís

**1. No se puede facturar por producto.** `remito_facturas` enlaza factura↔remito con un escalar y un `UNIQUE(factura_id, remito_id)` (`backend/src/models/remitoFacturas.js:26`). No existe `remito_item_id` en ninguna parte. `ModalFactura.jsx:314-338` expone un input de cantidad **por remito**, y el backend ni siquiera manda los ítems: los borra explícitamente del include (`controllers/facturas.js:177` → `attributes: ['id','product_variant_id','quantity_dispatched']`). Tu ejemplo (20 de A, 150 L de C) es imposible hoy.

**2. No existe "monto del cliente".** El caso de los 25000 USD no es representable: el sistema no sabe cuánto vale nada. Por eso la primera decisión fue modelo de precios.

**3. No hay reservas.** Grep de `reservad|cotizacion|prefactura|presupuest` en ambos repos: **0 coincidencias**. Lo más cercano es `Facturas.tipo = 'ANTICIPO'`, que es una factura *sin* remitos (no bloquea nada). Y `addFactura` (`controllers/facturas.js:314-348`) solo valida saldo y estado del remito: si dos personas facturan el mismo remito a la vez, el `lock: transaction.LOCK.UPDATE` (línea 308) serializa pero no impide la doble facturación parcial.

Dos bugs menores que aparecieron en el camino y que conviene arreglar de paso:
- `src/api/axios.js:102` referencia `isLoginRequest`, que **no está definido** en el archivo → cualquier 401 tira `ReferenceError` en vez de redirigir a `/login`. AGENTS.md loadvertía, pero el binding se perdió.
- `Facturacion.jsx:756-759` recarga `allFacturas()` pero **no** `remitosPendientes` → la tabla de pendientes queda desactualizada después de crear una factura.
- `Remitos.jsx:545` muestra `{toFixed(2)} ud` sobre `quantity_dispatched`, que en realidad son **litros**. La etiqueta "ud" miente.

---

# PLAN

## Decisiones tomadas

| Decisión | Valor |
|---|---|
| Dinero | `precio_unitario` por **unidad base** en `product_variants` + `moneda` (USD) |
| Alcance | Backend (`C:\Job\Don Asdrubal\backend`) + Frontend |
| Reserva | Bloqueo total, con override de Administrador auditado |
| Datos | Reset de las tablas de prueba (no hay datos reales) |

Sobre la unidad del precio: `precio_unitario` se define **por unidad base** (por litro/kg), no por presentación. Así el importe de una línea es `cantidad_base × precio_unitario` sin divisiones ni redondeos. La UI muestra el equivalente en presentación como helper ("USD 25,00/L → USD 500,00 por Bidón 20 L").

---

## FASE 1 — Modelo de datos (migraciones backend)

### 1.1 Precios en el catálogo
`product_variants`:
```
precio_unitario  DECIMAL(15,4) NULL   -- precio por unidad base (L/kg)
moneda           VARCHAR(3) NOT NULL DEFAULT 'USD'
```

### 1.2 Facturación por ítem — se **reemplaza** `remito_facturas`
Como los datos son de prueba, aprovecho para eliminar la tabla y partir de un modelo limpio de una sola fuente de verdad:

**`factura_items`** (NUEVO)
```
id, factura_id, remito_id, remito_item_id, product_variant_id,
cantidad              DECIMAL(15,4)  -- unidades base facturadas
cantidad_presentacion DECIMAL(15,4)  -- snapshot de lo que ingressó el usuario
unidad_base           VARCHAR(30)   -- snapshot ('L', 'kg')
descripcion           VARCHAR(255)   -- snapshot "Herbicida X - Bidón 20 L"
precio_unitario       DECIMAL(15,4)  -- snapshot por unidad base
importe               DECIMAL(15,4)  -- = cantidad × precio_unitario
moneda                VARCHAR(3) DEFAULT 'USD'
UNIQUE(factura_id, remito_item_id)
INDEX(remito_item_id) · INDEX(remito_id)
```

**`facturas`**: `+ moneda VARCHAR(3) DEFAULT 'USD'`, `+ total DECIMAL(15,4) DEFAULT 0`.

Se **elimina** la tabla `remito_facturas` (y su modelo + associations en `models/index.js:664-682`).

### 1.3 Prefactura y reserva
**`prefacturas`** (NUEVO)
```
id, company_id DEFAULT 1, cliente_id,
estado ENUM('BORRADOR','RESERVADA','FACTURADA','LIBERADA','VENCIDA') DEFAULT 'BORRADOR',
fecha DATEONLY NULL,          -- fecha prevista de facturación
numero VARCHAR(20) NULL,      -- nº de factura preasignado
moneda VARCHAR(3) DEFAULT 'USD', total DECIMAL(15,4) DEFAULT 0,
notas TEXT, created_by, created_at, updated_at,
reservado_por, reservado_at, vence_at DATETIME NULL,
factura_id NULL,              -- factura ya generada
anulado_por, anulado_at
```

**`prefactura_items`** (NUEVO) — misma estructura que `factura_items` pero con `prefactura_id`.

### 1.4 Estrategia de migración
Una sola migración nueva, siguiendo el **estilo idempotente** de `20261106000001-create-facturas.cjs` (helpers `tableExists` / `columnaExiste` / `indiceExiste` / `fkExiste`, porque el backend corre `db.sync({ alter: false })` que puede crear las tablas desde los modelos antes de que corra la migración):

`20261120000001-precios-facturacion-items-prefacturas.cjs`

Y antes, el reset de datos de prueba:
```sql
DELETE FROM remito_facturas;  -- se elimina la tabla después
DELETE FROM facturas;
```

---

## FASE 2 — Backend

### 2.1 Servicios

**`src/services/facturacionService.js`** (reescritura)
- `calcularSaldosPorItem(remitoIds)` → `{ [remito_item_id]: { facturado, saldo } }` — el núcleo de la feature 1
- `calcularSaldosFacturacion(remitoIds)` → ahora suma `factura_items` (igual que antes, pero por ítem)
- `calcularTotalFactura(facturaId)` → `SUM(importe)`
- `valorEstimadoRemito(remito)` → `Σ cantidad_dispatched × precio_unitario` (precio actual de la variante)

**`src/services/reservasService.js`** (NUEVO)
- `obtenerReservasActivas(remitoIds, { transaction })` → `{ [remito_id]: { prefactura_id, estado, usuario, vence_at } }`, ignorando prefacturas `VENCIDAS` (auto-vencimiento lazy en cada lectura)
- `autoVencerReservas()` → marca `VENCIDA` las que pasaron su `vence_at`

### 2.2 Endpoints

**Facturación** (`controllers/facturas.js`, reescritura)
```
GET  /stock/facturas                        → + items[] (líneas) + total + moneda
GET  /stock/facturas/:id
GET  /stock/facturas/remitos-disponibles    → items[] con facturado/saldo POR ÍTEM
                                            → + reservado / reserva / facturable / motivo_bloqueo
POST /stock/facturas                        → nuevo payload (abajo)
PUT  /stock/facturas/:id/anular
```

Nuevo payload de `POST /stock/facturas`:
```json
{
  "cliente_id": 1, "tipo": "FACTURA", "fecha": "2026-11-19",
  "numero": "0001-00000042", "notas": "...", "moneda": "USD",
  "items": [
    { "remito_id": 10, "remito_item_id": 33, "cantidad": 400,
      "cantidad_presentacion": 20, "precio_unitario": 25,
      "descripcion": "Herbicida X - Bidón 20 L" }
  ],
  "override_reserva": false
}
```

Validaciones (todas en transacción, con `lock: UPDATE` sobre remitos e ítems):
- cliente existe · `tipo` válido · fecha con formato `YYYY-MM-DD` · `numero` único entre no anuladas
- `FACTURA` ⇒ ≥1 ítem · `ANTICIPO` ⇒ 0 ítems
- por ítem: remito `COMPLETADO`, no interno, del mismo cliente, `cantidad > 0` y `cantidad ≤ saldo del ítem + 0.0001`
- no repetir `remito_item_id`
- **reserva activa ajena ⇒ 409** salvo `override_reserva: true` (solo ADMIN) → se escribe en `audit_logs` (`module: 'facturacion'`, `action: 'OVERRIDE_RESERVA'`)
- `importe = cantidad × precio_unitario` (precio tomado del body o, si es null, de la variante) · `total = Σ importes`

**Prefacturas** (`controllers/prefacturas.js`, NUEVO)
```
GET    /stock/prefacturas?cliente_id=&estado=
GET    /stock/prefacturas/:id
POST   /stock/prefacturas              → BORRADOR o RESERVADA
PUT    /stock/prefacturas/:id          → items/notas/precios (solo si no está FACTURADA)
POST   /stock/prefacturas/:id/reservar → BORRADOR → RESERVADA (toma el lock de los remitos)
POST   /stock/prefacturas/:id/liberar  → RESERVADA → LIBERADA (libera los remitos)
POST   /stock/prefacturas/:id/facturar → convierte en factura (el "no recalcular todo")
DELETE /stock/prefacturas/:id          → solo si está en BORRADOR
```

`POST /facturar` es el corazón de la feature 2: lee `prefactura_items`, crea la `Facturas` + `FacturaItems` con los precios **ya snapshoteados** en la prefactura, marca la prefactura `FACTURADA` con su `factura_id` y libera la reserva. No recalcula nada.

**Remitos** (`controllers/remitos.js`)
- `GET /stock/remitos` y `/stock/remitos/:id` → cada ítem ahora trae `facturado` y `saldo`; el remito trae `valor_estimado`, `reservado`, `reserva` `{ prefactura_id, usuario, vence_at }`.
- `cancelRemito` → si el remito tenía reserva activa, se quitan sus ítems de la prefactura, se recalcula el total y se avisa (la prefactura sigue `RESERVADA` con lo que quede).

**Catálogo** (`controllers/remitos.js:getCatalogo`) → agrega `precio_unitario`, `moneda` y `precio_presentacion` (derivado) para poder mostrar el valor en los modales de remito.

**Rutas** (`src/routes/index.js`) → las de prefacturas, todas con `verifyRole([ROLES.ADMIN])` salvo los GET.

---

## FASE 3 — Frontend

### 3.1 Archivos nuevos
- `src/api/prefacturas.js` — capa API
- `src/components/ModalPrefactura.jsx` — armar/editar la prefactura
- `src/utils/facturacion.js` — **consolida** `FACTURACION_COLORS` / `FACTURACION_LABELS` / `normalizar` (hoy duplicados entre `Remitos.jsx:45-55` y `Facturacion.jsx:24-34`) + `formatMoneda` (es-AR/USD) + helpers de unidades

### 3.2 Feature 1 — Facturación parcial por producto

**`ModalFactura.jsx` (reescritura).** La tabla de remitos queda igual, pero al marcar un remito se despliega el detalle de ítems:

```
Remito 000315                                              [✓]
┌────────────────────────────────────────────────────────────────────────────┐
│ Producto          Presentación   Remitido  Facturado  Saldo   A facturar  │
│ Herbicida X        Bidón 20 L     400 L     0 L       400 L   [ 400 ] L   │
│                                             ↑ (20 bidones)     ↑ total      │
│ Fertilizante Y     Litro          350 L     100 L     250 L   [ 150 ] L   │
└────────────────────────────────────────────────────────────────────────────┘
```

- El input es en **unidades base (L)**, que es la unidad canónica de `cantidad_facturada`. Debajo/alineado se muestra el **equivalente en presentación** en vivo ("20 bidones"), porque tu ejemplo está en unidades y el remito hoy muestra litros con la etiqueta mentirosa "ud" (`Remitos.jsx:545`). Esto lo arreglo: la tabla de ítems pasa a mostrar "20 bidones (400 L)".
- Botones rápidos por ítem: **Todo** / **Nada** / **Saldo**.
- Pie: `Total litros` + `Total USD` (Σ cantidad × precio de la variante). Si la variante no tiene precio, la celda muestra "Sin precio" y el total USD queda en 0 con aviso (el módulo sigue funcionando en cantidad).
- Validación cliente: `0 < cantidad ≤ saldo del ítem`.

**`Facturacion.jsx`**: columnas nuevas en "Remitos pendientes de facturar" → `Total | Facturado | Saldo (L) | Valor USD | Facturación | Acción`. La lista de facturas pasa a mostrar `Total` = importe USD, con los litros como dato secundario. El detalle de la factura muestra la tabla de ítems (producto, presentación, cantidad, precio, importe, remito de origen).

**`Remitos.jsx`**: el detalle del remito pasa a mostrar, por ítem, `Remitido / Facturado / Saldo`; y la tabla de "Facturaciones" pasa a listar las líneas de la factura (producto + cantidad), no solo el total por remito.

### 3.3 Feature 2 — Prefactura y reserva

**`Remitos.jsx`** — multi-select:
- Checkbox por fila + barra flotante: **"N remitos seleccionados"** con acciones **"Armar prefactura"** y **"Ir a Facturación"**.
- Al marcar remitos de **clientes distintos** → aviso en la barra (la prefactura es de un solo cliente).
- Solo se pueden seleccionar remitos `COMPLETADO`, no internos y **sin reserva activa** (los reservados aparecen bloqueados con el motivo).

**`ModalPrefactura.jsx`**:
- Cabecera: cliente (derivado), fecha prevista, nº de factura sugerido, notas, moneda, **vencimiento de la reserva** (opcional, ej. 7 días).
- Cuerpo: por cada remito seleccionado, sus ítems con cantidad a facturar (por defecto = saldo del ítem) y **precio unitario editable** (por defecto = precio de la variante).
- **Total USD en vivo** + un campo **"Monto del cliente"** (25000) que muestra la diferencia: *"Faltan USD 3.200"* / *"Excede USD 1.100"*. Esto es lo que hace útil el flujo "selecciono remito 3, 9 y 8 hasta llegar a 25000".
- Botones: **"Guardar borrador"** y **"Reservar"**.

**`Facturacion.jsx`** — nuevo panel **"Prefacturas y reservas"**:
- Filtros por cliente y estado; tabla `N° | Cliente | Fecha | Remitos | Total USD | Estado | Acciones`.
- Acciones: **Ver detalle**, **Convertir en factura** (llama `/facturar` y recarga todo), **Liberar reserva**, **Editar** (si está en borrador).
- Detalle: ítems con cantidades y precios, quién reservó y hasta cuándo.

**Indicador de reserva en todo el sistema**:
- `Remitos.jsx`: badge **"Reservado"** en la fila + botón Facturar deshabilitado con tooltip *"Reservado por la prefactura #12 (Juan Pérez) — vence el 26/11"*.
- `Facturacion.jsx` panel de pendientes: `motivo_bloqueo` = *"Reservado por la prefactura #12"*.
- `ModalFactura`: un remito reservado no es seleccionable; se muestra con su motivo.

**Override de Administrador**: botón "Facturar de todos modos" con confirmación explícita (*"El remito 000315 está reservado por la prefactura #12 de Juan Pérez. Facturarlo consumirá saldo que puede no estar disponible. ¿Continuar?"*), visible solo para Administrador, envía `override_reserva: true` y queda en `audit_logs`.

### 3.4 Precios (Fase 1 de la UI)
- `ModalProductos.jsx:366-416`: input de **precio unitario** por variante, con helper *"USD 25,00 /L — equivale a USD 500,00 por Bidón 20 L"*.
- `Productos.jsx`: columna de precio en la tabla de variantes.
- `ModalRemitoCatalogo.jsx` / `ModalRemitoInterno.jsx`: mostrar el precio en las cards del catálogo (el backend ya lo manda).

---

## FASE 4 — Verificación y cierre

1. `npm run lint` en el frontend (único check disponible; no hay tests ni typecheck).
2. Correr migraciones en el backend y verificar el reset.
3. Smoke test manual del recorrido completo:
   - Cargar precios en 3 variantes de prueba.
   - Crear un remito con 2 productos (100 und + 350 L).
   - Facturar **parcialmente**: 20 und de A + 150 L de C → verificar que el saldo por ítem queda correcto y que A sigue con saldo.
   - Armar prefactura con 3 remitos hasta llegar a USD 25.000 → reservar → verificar que el 2º usuario **no** puede facturar esos remitos.
   - Convertir la prefactura en factura → verificar que el remito liberado conserva el saldo no facturado.
   - Probar el override de admin y verificar la entrada en `audit_logs`.
4. `CHANGELOG.md` (frontend) con la línea del formato que define AGENTS.md.

## Fuera de alcance (decisiones posteriores)
Facturación real (`estado: EMITIDA`, comprobante AFIP/ARCA, PDF) · multi-moneda · reserva a nivel de ítem (la reserva es a nivel de remito, como planteaste) · notificaciones al reservar.

---

**¿Arranco por la Fase 1 (precios) o preferís que ataque directo con la Fase 2 (facturación por ítem) que es el núcleo del pedido?** Si el precio te parece una decisión fuerte, también puedo arrancar solo con Fase 2 usando precios nulos (el módulo funciona en cantidad) y meter la Fase 1 después.

---

## User

quieo que verifiques nuevamente el primer analisis y plan a ejecutar para ver si esta correcto o habria que contremplar otras situaciones.

---

## Assistant (Plan · GPT-6 Luna · 851.3s)

_Thinking:_

**Re-evaluating the plan**

I need to reassess the plan and identify any errors or missed situations. We're facing uncommitted backend/frontend statuses, so I need to be cautious. 

I should inspect specific model associations, notably the Facturas feature, and analyze big flaws. For instance, replacing remito_facturas could compromise relationships. I need to consider product price semantics too, especially given presentation variants might show differing prices. 

Also, I should ensure correct input in base units to avoid errors and address issues like rounding and item quantity constraints.

_Thinking:_

**Reviewing invoice processes**

I need to clarify what the returns invoice amount entails regarding quantity versus monetary values. It sounds like existing factura totals might not have values assigned. I also need to consider discounts and taxes, especially since invoices use USD and specify pricing details. 

I must ensure that if a price is nullable, we prevent quote reservation or mark it incomplete to avoid issues with target amounts. Additionally, I should look into locking mechanisms for reservations to prevent conflicts, especially with multiple drafts of the same remito. This could lead to serious flaws if not properly managed!

_Thinking:_

**Improving admin overrides**

I need to consider a better approach to admin overrides, ensuring they transition reservation statuses without creating stale prefactura or duplicate conversions. If the override is partial, what happens to the remaining reserved quantities? I'm thinking that the current whole remito lock could consume quantities that might lead to invalid prefactura. 

It’s vital to have a mechanism to terminate or edit reservations while being mindful of the differences between quotes and prefactura statuses. If a preinvoice becomes an invoice, it should release the reservation properly.

_Thinking:_

**Evaluating reservation and invoicing**

I'm thinking about whether URADA shouldn't restore a reservation. Can a remito be canceled after completion? It seems the backend doesn't allow completed customer remitos, which is good. I need to ensure uniqueness for prefactura numbers; they shouldn't hold invoice numbers until conversion. There's a chance of conflicts with simultaneous prefacturas. I'll use a separate reference number for invoices and avoid preassigning invoice numbers. Also, I should enable partial quantities for remitos to meet target amounts and consider tax and currency support.

_Thinking:_

**Clarifying pricing decisions**

I need clarity on whether the user chose USD as the price basis. They might have picked price per product or variant, but we didn't confirm details about base versus presentation. It would be best to verify this plan and ask about any unresolved business choices. I should check the pricing model and cancellation routes, checking remitos.js for pertinent cancel statuses and models. I think I can analyze the relevant backend logic and suggest necessary corrections based on the current context.

Voy a revisar el plan contra los flujos y restricciones reales, poniendo especial atención en concurrencia, saldos por presentación, reservas vencidas/anuladas y qué pasa si se modifica el precio o una prefactura ya reservada. No voy a modificar nada.

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\controllers\\remitos.js",
  "offset": 390,
  "limit": 175
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\controllers\remitos.js</path>
<type>file</type>
<content>
390:     await transaction.rollback();
391:     res.status(400).json({ message: error.message });
392:   }
393: };
394: 
395: export const cancelRemito = async (req, res) => {
396:   const transaction = await db.transaction();
397:   try {
398:     const remito = await Remitos.findByPk(req.params.id, {
399:       transaction,
400:       lock: transaction.LOCK.UPDATE,
401:     });
402:     if (!remito) {
403:       await transaction.rollback();
404:       return res.status(404).json({ message: 'Remito no encontrado' });
405:     }
406: 
407:     const esInterno = Boolean(remito.destination_warehouse_id);
408:     if (remito.status === 'ANULADO' || (remito.status === 'COMPLETADO' && !esInterno)) {
409:       await transaction.rollback();
410:       return res.status(400).json({ message: 'No se puede anular un remito en estado ' + remito.status });
411:     }
412: 
413:     const items = await RemitoItems.findAll({
414:       where: { remito_id: remito.id },
415:       include: [{ model: RemitoItemLots, as: 'lotes' }],
416:       transaction,
417:     });
418: 
419:     for (const item of items) {
420:       for (const lot of item.lotes) {
421:         if (esInterno) {
422:           const destinationStock = await WarehouseStock.findOne({
423:             where: {
424:               warehouse_id: remito.destination_warehouse_id,
425:               product_lot_id: lot.product_lot_id,
426:             },
427:             transaction,
428:             lock: transaction.LOCK.UPDATE,
429:           });
430:           const quantityToReturn = Number(lot.quantity_dispatched);
431:           if (!destinationStock || Number(destinationStock.quantity) < quantityToReturn) {
432:             throw new Error(`No se puede anular: el depósito destino no tiene stock suficiente del lote ${lot.product_lot_id}`);
433:           }
434: 
435:           destinationStock.quantity = Math.round((Number(destinationStock.quantity) - quantityToReturn) * 10000) / 10000;
436:           await destinationStock.save({ transaction });
437: 
438:           const sourceStock = await WarehouseStock.findOrCreate({
439:             where: {
440:               warehouse_id: remito.origin_warehouse_id,
441:               product_lot_id: lot.product_lot_id,
442:             },
443:             defaults: {
444:               warehouse_id: remito.origin_warehouse_id,
445:               product_lot_id: lot.product_lot_id,
446:               quantity: 0,
447:             },
448:             transaction,
449:           });
450:           sourceStock[0].quantity = Math.round((Number(sourceStock[0].quantity) + quantityToReturn) * 10000) / 10000;
451:           await sourceStock[0].save({ transaction });
452: 
453:           for (const movement of [
454:             { warehouse_id: remito.destination_warehouse_id, movement_type: 'SALIDA' },
455:             { warehouse_id: remito.origin_warehouse_id, movement_type: 'ENTRADA' },
456:           ]) {
457:             await StockMovements.create(
458:               {
459:                 company_id: 1,
460:                 ...movement,
461:                 product_lot_id: lot.product_lot_id,
462:                 quantity: quantityToReturn,
463:                 reference_type: 'remito_transfer_cancel',
464:                 reference_id: remito.id,
465:                 remito_id: remito.id,
466:                 created_by: req.user?.id ?? req.body.cancelled_by ?? remito.created_by,
467:               },
468:               { transaction },
469:             );
470:           }
471:           continue;
472:         }
473: 
474:         const stock = await WarehouseStock.findOne({
475:           where: {
476:             warehouse_id: remito.origin_warehouse_id,
477:             product_lot_id: lot.product_lot_id,
478:           },
479:           transaction,
480:           lock: transaction.LOCK.UPDATE,
481:         });
482: 
483:         if (stock) {
484:           stock.quantity = parseFloat(stock.quantity) + parseFloat(lot.quantity_dispatched);
485:           await stock.save({ transaction });
486:         }
487: 
488:         await StockMovements.create(
489:           {
490:             company_id: 1,
491:             warehouse_id: remito.origin_warehouse_id,
492:             product_lot_id: lot.product_lot_id,
493:             movement_type: 'ENTRADA',
494:             quantity: lot.quantity_dispatched,
495:             reference_type: 'remito_cancel',
496:             reference_id: remito.id,
497:             remito_id: remito.id,
498:             created_by: remito.created_by,
499:           },
500:           { transaction },
501:         );
502:       }
503:     }
504: 
505:     await Remitos.update(
506:       {
507:         status: 'ANULADO',
508:         cancelled_at: new Date(),
509:         cancelled_by: req.user?.id ?? req.body.cancelled_by ?? null,
510:       },
511:       { where: { id: remito.id }, transaction },
512:     );
513: 
514:     await transaction.commit();
515:     res.json({ message: 'Remito anulado y stock revertido' });
516:   } catch (error) {
517:     await transaction.rollback();
518:     res.status(400).json({ message: error.message });
519:   }
520: };
521: 
522: export const confirmRemito = async (req, res) => {
523:   try {
524:     const remito = await Remitos.findByPk(req.params.id);
525:     if (!remito) {
526:       return res.status(404).json({ message: 'Remito no encontrado' });
527:     }
528: 
529:     if (remito.status !== 'REVISION') {
530:       return res.status(400).json({ message: 'Solo se pueden confirmar remitos en estado REVISION' });
531:     }
532: 
533:     await Remitos.update(
534:       {
535:         status: 'COMPLETADO',
536:         confirmed_at: new Date(),
537:         confirmed_by: req.body.confirmed_by || null,
538:       },
539:       { where: { id: req.params.id } },
540:     );
541: 
542:     res.json({ message: 'Remito confirmado' });
543:   } catch (error) {
544:     res.status(400).json({ message: error.message });
545:   }
546: };
547: 
548: export const uploadRemitoPhoto = async (req, res) => {
549:   const transaction = await db.transaction();
550:   try {
551:     const remito = await Remitos.findByPk(req.params.id, { transaction });
552: 
553:     if (!remito) {
554:       await transaction.rollback();
555:       return res.status(404).json({ message: 'Remito no encontrado' });
556:     }
557: 
558:     if (remito.status === 'COMPLETADO' || remito.status === 'ANULADO') {
559:       await transaction.rollback();
560:       return res.status(400).json({ message: 'No se puede modificar un remito en estado ' + remito.status });
561:     }
562: 
563:     if (!req.file) {
564:       await transaction.rollback();

(Showing lines 390-564 of 774. Use offset=565 to continue.)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\models\\facturas.js"
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\models\facturas.js</path>
<type>file</type>
<content>
1: import { Model, DataTypes } from 'sequelize';
2: import db from '../config/database.js';
3: 
4: class Facturas extends Model {}
5: 
6: Facturas.init(
7:   {
8:     id: {
9:       type: DataTypes.INTEGER,
10:       primaryKey: true,
11:       autoIncrement: true,
12:     },
13: 
14:     company_id: {
15:       type: DataTypes.INTEGER,
16:       allowNull: false,
17:       defaultValue: 1,
18:     },
19: 
20:     cliente_id: {
21:       type: DataTypes.INTEGER,
22:       allowNull: false,
23:     },
24: 
25:     tipo: {
26:       type: DataTypes.ENUM('FACTURA', 'ANTICIPO'),
27:       allowNull: false,
28:       defaultValue: 'FACTURA',
29:     },
30: 
31:     fecha: {
32:       type: DataTypes.DATEONLY,
33:       allowNull: false,
34:     },
35: 
36:     // Número de factura física. Vacío hasta cargar el comprobante real.
37:     // La unicidad por empresa (solo facturas no anuladas) la garantiza la
38:     // columna generada numero_activo + índice único en la migración.
39:     numero: {
40:       type: DataTypes.STRING(20),
41:       allowNull: true,
42:     },
43: 
44:     // SIMULADA: etapa actual (marca remitos como facturados).
45:     // EMITIDA: etapa futura de facturación real.
46:     // ANULADA: libera los remitos asociados.
47:     estado: {
48:       type: DataTypes.ENUM('SIMULADA', 'EMITIDA', 'ANULADA'),
49:       allowNull: false,
50:       defaultValue: 'SIMULADA',
51:     },
52: 
53:     notas: {
54:       type: DataTypes.TEXT,
55:       allowNull: true,
56:     },
57: 
58:     created_by: {
59:       type: DataTypes.INTEGER,
60:       allowNull: true,
61:     },
62:   },
63:   {
64:     sequelize: db,
65:     modelName: 'Facturas',
66:     tableName: 'facturas',
67:     timestamps: true,
68:     paranoid: false,
69:   },
70: );
71: 
72: export default Facturas;

(End of file - total 72 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "C:\\Job\\Don Asdrubal\\backend\\src\\models\\index.js",
  "offset": 620,
  "limit": 105
}
```

**Output:**
```
<path>C:\Job\Don Asdrubal\backend\src\models\index.js</path>
<type>file</type>
<content>
620: // Remitos → Users (cancelled_by)
621: Remitos.belongsTo(Users, {
622:   foreignKey: 'cancelled_by',
623:   as: 'canceladoPor',
624: });
625: 
626: // Remitos → RemitoItems
627: Remitos.hasMany(RemitoItems, {
628:   foreignKey: 'remito_id',
629:   as: 'items',
630: });
631: RemitoItems.belongsTo(Remitos, {
632:   foreignKey: 'remito_id',
633:   as: 'remito',
634: });
635: 
636: // Remitos → RemitoArchivos
637: Remitos.hasMany(RemitoArchivos, {
638:   foreignKey: 'remito_id',
639:   as: 'archivos',
640: });
641: RemitoArchivos.belongsTo(Remitos, {
642:   foreignKey: 'remito_id',
643:   as: 'remito',
644: });
645: 
646: // RemitoArchivos → Users (uploaded_by)
647: RemitoArchivos.belongsTo(Users, {
648:   foreignKey: 'uploaded_by',
649:   as: 'subidoPor',
650: });
651: 
652: // Facturas → Clientes (facturación / anticipo de un cliente)
653: Facturas.belongsTo(Clientes, {
654:   foreignKey: 'cliente_id',
655:   as: 'cliente',
656: });
657: 
658: // Facturas → Users (created_by)
659: Facturas.belongsTo(Users, {
660:   foreignKey: 'created_by',
661:   as: 'creadoPor',
662: });
663: 
664: // Facturas → RemitoFacturas (1 factura → N remitos)
665: Facturas.hasMany(RemitoFacturas, {
666:   foreignKey: 'factura_id',
667:   as: 'remitos',
668: });
669: RemitoFacturas.belongsTo(Facturas, {
670:   foreignKey: 'factura_id',
671:   as: 'factura',
672: });
673: 
674: // Remitos → RemitoFacturas (1 remito → N facturas parciales)
675: Remitos.hasMany(RemitoFacturas, {
676:   foreignKey: 'remito_id',
677:   as: 'facturaciones',
678: });
679: RemitoFacturas.belongsTo(Remitos, {
680:   foreignKey: 'remito_id',
681:   as: 'remito',
682: });
683: 
684: // RemitoItems → ProductVariants
685: RemitoItems.belongsTo(ProductVariants, {
686:   foreignKey: 'product_variant_id',
687:   as: 'variante',
688: });
689: 
690: // RemitoItems → RemitoItemLots
691: RemitoItems.hasMany(RemitoItemLots, {
692:   foreignKey: 'remito_item_id',
693:   as: 'lotes',
694: });
695: RemitoItemLots.belongsTo(RemitoItems, {
696:   foreignKey: 'remito_item_id',
697:   as: 'itemRemito',
698: });
699: 
700: // RemitoItemLots → ProductLots
701: RemitoItemLots.belongsTo(ProductLots, {
702:   foreignKey: 'product_lot_id',
703:   as: 'lote',
704: });
705: 
706: // StockMovements → Warehouses
707: StockMovements.belongsTo(Warehouses, {
708:   foreignKey: 'warehouse_id',
709:   as: 'deposito',
710: });
711: 
712: // StockMovements → ProductLots
713: StockMovements.belongsTo(ProductLots, {
714:   foreignKey: 'product_lot_id',
715:   as: 'lote',
716: });
717: 
718: // StockMovements → Remitos
719: StockMovements.belongsTo(Remitos, {
720:   foreignKey: 'remito_id',
721:   as: 'remito',
722: });
723: 
724: // StockMovements → Users (created_by)

(Showing lines 620-724 of 781. Use offset=725 to continue.)
</content>
```

**Tool: grep**

**Input:**
```json
{
  "pattern": "AuditLogs.create|logAudit|auditLog|AuditLogService",
  "path": "C:\\Job\\Don Asdrubal\\backend\\src",
  "include": "*.js"
}
```

**Output:**
```
Found 24 matches
C:\Job\Don Asdrubal\backend\src\controllers\auditLogs.js:
  Line 2: import AuditLogs from '../models/auditLogs.js';


C:\Job\Don Asdrubal\backend\src\middlewares\auditContext.js:
  Line 3: import AuditLogService from '../services/AuditLogService.js';

  Line 19:     AuditLogService.recordFailure({


C:\Job\Don Asdrubal\backend\src\routes\index.js:
  Line 101: import { listAuditLogs } from '../controllers/auditLogs.js';


C:\Job\Don Asdrubal\backend\src\services\AuditLogService.test.js:
  Line 3: import { diffAuditValues, sanitizeAuditValues } from './AuditLogService.js';


C:\Job\Don Asdrubal\backend\src\services\AuditLogService.js:
  Line 1: import AuditLogs from '../models/auditLogs.js';

  Line 32: class AuditLogService {

  Line 58:     return AuditLogs.create(this.toRecord(event), { transaction: transaction || undefined });

  Line 73: export default AuditLogService;


C:\Job\Don Asdrubal\backend\src\models\index.js:
  Line 45: import AuditLogs from './auditLogs.js';

  Line 730: Users.hasMany(AuditLogs, { foreignKey: 'user_id', as: 'auditLogs', onDelete: 'SET NULL', onUpdate: 'CASCADE' });


C:\Job\Don Asdrubal\backend\src\services\modelAuditHooks.js:
  Line 1: import AuditLogs from '../models/auditLogs.js';

  Line 2: import AuditLogService, { diffAuditValues, sanitizeAuditValues } from './AuditLogService.js';

  Line 28:     if (model === AuditLogs || model.options?.auditLogDisabled) continue;

  Line 32:       await AuditLogService.record({

  Line 39:       await AuditLogService.recordMany(instances.map((instance) => ({

  Line 51:       await AuditLogService.record({

  Line 64:         await AuditLogService.record({

  Line 70:       await AuditLogService.record({

  Line 94:       await AuditLogService.recordMany(events, options.transaction);

  Line 115:       await AuditLogService.recordMany(events, options.transaction);


C:\Job\Don Asdrubal\backend\src\controllers\users.js:
  Line 5: import AuditLogService from '../services/AuditLogService.js';

  Line 323:     await AuditLogService.record({

  Line 382:     await AuditLogService.record({

```

---

## Assistant (Plan · GPT-6 Luna · 44.0s)

_Thinking:_

**Clarifying data test operations**

The user mentioned that a data test can reset, but it seems like a confirmation or backup is necessary for that operation. Their focus is on confirming if a migration has been applied in the target environment. If it hasn't been applied, I can suggest updating the original migration, and if it has, we could proceed with the new migration. 

There’s also a concern about prices and the potential risks of allowing reservations when prices are missing. I definitely need to address this effectively.

_Thinking:_

**Considering pricing structure**

The user selected prices by variant instead of a unit basis, so I’m thinking that the catalog price should align with the presentation unit. Since a variant combines product and presentation, using price per presentation seems more intuitive. However, the billing UI uses presentation units for item quantity. 

I need to properly store invoice items with base and commercial quantities, calculating the amount from the presentation price. It's important to address fractional units too; the user specified 20 units and liters, so getting those units right is crucial.

_Thinking:_

**Considering reservation management**

I'm thinking about how to handle reservation expiration. It should auto compute as expired and update the status without causing side effects in the service transaction. If a reservation expires, conversion should either fail or allow re-reserving. I'm also noticing issues with stale reservation statuses and the need for atomic conversions to prevent double invoicing. I want to ensure consistent locking and check for duplicate item lines. At the end, I'll summarize corrections and ask targeted questions about the plan.

_Thinking:_

**Addressing invoice issues**

I'm considering the new money fields for `monto` and currency related to "anticipo." There's a bug where the importe field is missing, so I need to include a manual monto for ANTICIPO. The invoice header's total should come from the line items, and there's no need to store a separate total snapshot. It's important to ensure that the `factura.total` is consistent with the line totals. Lastly, I need to be clear about not confusing simulated quotes with fiscal invoices.

_Thinking:_



Sí: el análisis inicial detectó bien las dos necesidades, pero el plan **requiere correcciones antes de ejecutarlo**. Sobre todo, asumía reglas comerciales que todavía no están definidas y dejaba algunos caminos para inconsistencias en reservas y facturación.

## Qué mantendría

- **Facturación parcial por ítem de remito**: la relación actual factura↔remito (`remito_facturas`) no identifica qué producto se facturó. Hace falta guardar el detalle por `remito_item_id`.
- **Precios**: no hay precios ni importes en el sistema actual; sin incorporarlos no se puede calcular ni comprobar un total de USD 25.000.
- **Prefacturas reservables**: hace falta una entidad propia con líneas, estados y operaciones de reservar, liberar y convertir en factura.
- **Cambios coordinados en frontend y backend**: las reglas de saldo y bloqueo deben validarse en el servidor, no solo en la interfaz.
- **Reset de datos de prueba**, con la precaución de verificar qué migraciones ya se aplicaron antes de borrar o reemplazar tablas.

## Correcciones importantes al plan anterior

### 1. Hay que definir en qué unidad se carga el precio y se factura

El plan proponía precio por unidad base —por ejemplo, USD/litro— e ingresar cantidades de facturación también en litros. Eso puede no coincidir con cómo se venden o se describen los productos: “20 bidones” no siempre es una cantidad intuitiva de litros.

Una alternativa más alineada con los datos existentes es:

- Cargar el precio por **presentación/variante comercial** (por ejemplo, por bidón de 20 L).
- Ingresar la cantidad a facturar en esa presentación.
- Guardar también la cantidad base equivalente para calcular saldos y mantener consistencia con `quantity_dispatched`.
- Guardar en la línea de factura una **copia del nombre de producto, presentación, cantidad, precio y moneda** vigentes en el momento de facturar.

Hace falta decidir si se permiten fracciones de presentación —por ejemplo, medio bidón— o si la cantidad debe ser un número entero de envases. Para productos vendidos por litro, el litro podría ser la propia presentación.

### 2. Una línea sin precio no puede valer cero

El plan previo permitía seguir con variantes sin precio y dejaba el importe en cero. Eso podría mostrar una cotización incompleta como si estuviera calculada.

La prefactura debería impedir **reservar y convertir** mientras haya líneas sin precio, salvo que se permita cargar un precio manual en esa cotización. Si se admite precio manual, hay que definir si ese precio es solo una excepción para la cotización o si también actualiza el catálogo.

### 3. Definir qué significa el total de USD 25.000

Con precios se puede calcular un total, pero aún falta decidir si el total es:

- neto o incluye impuestos;
- antes o después de descuentos;
- expresado siempre en USD o si puede haber otras monedas.

El importe objetivo ingresado por el usuario debería funcionar como referencia de selección y mostrar diferencia contra el total calculado; no debería alterar automáticamente las cantidades ni los precios.

### 4. El anticipo también necesita un importe

La factura `ANTICIPO` no tiene remitos, pero el código actual tampoco persiste el importe recibido: solo muestra un texto que dice que lo registra (`ModalFactura.jsx`). Si se incorpora dinero al módulo, el anticipo necesita monto y moneda explícitos, aunque el total de una factura normal se calcule desde sus líneas.

### 5. No permitir editar una reserva activa sin volver a validar todo

El plan anterior permitía actualizar una prefactura reservada. Eso puede cambiar remitos o cantidades mientras la reserva está activa.

Regla más segura:

- `BORRADOR`: editable, sin bloquear remitos.
- `RESERVADA`: no editable.
- Para cambiarla: liberar, editar y reservar de nuevo; la nueva reserva debe verificar disponibilidad y saldos.
- `FACTURADA`, `LIBERADA` y `VENCIDA`: estados terminales o con acciones muy acotadas.

### 6. El override de Administrador debe resolver la reserva, no solo saltársela

Si un admin factura un remito reservado y la prefactura sigue `RESERVADA`, alguien podría intentar convertirla después con datos ya inválidos.

El override debe, en una misma transacción, **resolver la reserva afectada** —por ejemplo, liberarla o dejarla marcada como interrumpida— y registrar quién, cuándo y qué remitos fueron afectados. El sistema debe impedir que esa prefactura se convierta después sin revisarla y volver a reservarla.

El backend ya cuenta con `AuditLogService`; conviene usar su interfaz para el registro, no insertar directamente en la tabla de auditoría.

### 7. La reserva necesita bloqueo transaccional común a todas las operaciones

No alcanza con consultar si existe una prefactura reservada. Dos usuarios podrían intentar reservar los mismos remitos casi simultáneamente.

La creación/reserva de prefactura, la facturación individual, el override y la conversión deben:

1. Bloquear las filas de remito involucradas en una transacción, en un orden consistente.
2. Verificar estado, cliente, reserva y saldo por ítem.
3. Guardar los cambios dentro de esa misma transacción.

Así se evita que una reserva y una factura se aprueben a la vez sobre los mismos remitos.

### 8. La reserva por remito debe ser claramente distinta del saldo reservado

El bloqueo total de los remitos elegidos coincide con lo que describiste: mientras están reservados no se pueden facturar individualmente. La prefactura, en cambio, puede contener cantidades parciales por producto.

Al convertirla, se factura solo lo que figura en sus líneas y se libera la reserva completa; el saldo no facturado queda disponible. Si se factura con override, hay que recalcular o invalidar la prefactura afectada.

### 9. No preasignar el número fiscal en la prefactura

El plan proponía guardar un número de factura en la prefactura. Eso podría producir colisiones entre varias prefacturas y confundir un borrador con un comprobante.

Conviene que la prefactura tenga su propio identificador o número de cotización. El número de factura se asigna o confirma al convertirla en factura, conservando la validación de unicidad existente.

### 10. No borrar ni reemplazar migraciones sin comprobar si ya corrieron

`facturas` y `remito_facturas` están en cambios locales sin commitear en ambos repos. Antes de decidir si se modifica la migración existente o se crea una nueva hay que comprobar el estado de la base donde se ejecutará:

- Si la migración aún no se aplicó, puede ajustarse el esquema inicial.
- Si ya se aplicó en algún entorno, debe hacerse una migración posterior y compatible.
- El reset de datos debe eliminar primero los registros dependientes y confirmar que se trata de datos descartables.

No ejecutaría el `DELETE` propuesto de forma automática ni asumiría que el estado del repositorio indica el estado de la base.

## Plan revisado

1. **Cerrar reglas comerciales**: unidad de precio, fracciones de presentación, impuestos/descuentos y tratamiento de precios faltantes.
2. **Verificar estado de migraciones y datos** en los entornos donde se desplegará.
3. **Diseñar el modelo**:
   - líneas de factura ligadas a `remito_item_id`, con cantidad base y cantidad comercial;
   - precio, moneda, descripción y presentación como snapshots;
   - prefacturas y sus líneas;
   - monto/moneda de anticipos;
   - estados de reserva definidos y auditables.
4. **Implementar servicios backend transaccionales** para saldo por ítem, reserva, liberación, vencimiento, override y conversión.
5. **Implementar primero los endpoints y validaciones**, incluyendo conflicto HTTP cuando un remito está reservado y controles para evitar duplicar cantidades.
6. **Implementar la UI**:
   - facturación parcial por producto;
   - selección de remitos de un solo cliente;
   - total monetario y comparación con el monto objetivo;
   - prefactura/reserva y estados visibles en Remitos y Facturación.
7. **Verificar escenarios**: dos usuarios reservando a la vez; facturación intentando tomar un remito reservado; vencimiento; liberación; override; conversión; anulación de factura; y saldo restante después de una factura parcial.
8. Ejecutar los checks disponibles y agregar la línea requerida al `CHANGELOG.md` del frontend.

## Decisiones todavía abiertas

Para que el plan no vuelva a asumir reglas del negocio, faltan estas definiciones:

1. ¿El precio se carga **por presentación comercial** —por ejemplo, por bidón— y se factura en esa unidad, o prefieren manejarlo por litro/kg?
2. ¿Se pueden facturar fracciones de una presentación?
3. ¿El precio incluye impuestos o se cotiza neto? ¿Habrá descuentos?
4. ¿Se permite reservar si falta el precio de algún producto, cargando un precio manual en la prefactura, o debe completarse el precio del catálogo primero?
5. ¿La reserva debe vencer automáticamente después de un plazo, y cuál sería ese plazo por defecto?

Mi recomendación es resolver esas reglas primero; después se puede ajustar el diseño de datos y los endpoints sin riesgo de construir la UI sobre supuestos equivocados.

---

