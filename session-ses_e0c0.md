# Facturación parcial y reserva de remitos

**Session ID:** ses_e0c002d8effen9LUD5E28wkVVA
**Created:** 19/11/2026, 10:29:51 a.m.
**Updated:** 19/11/2026, 11:06:21 a.m.

---

## User

Analicemos Remitos y Facturacion. Actualmente el flujo esta ok pero se deberia poder facturar parcialmente un producto de un remito.Ej un remito detalla producto A 100 unidades, producto B 50 unidades y producto C 350 litros. A la hora de facturar total o parcialmente quiero facturar solo 20 unidades del producto A y 150 litros producto C por lo que en facturacion al seleccionar el remito deberia tener la posibilidad de seleccionar los productos y cantidad de los productos que quiero factuar. Y la otra funcionalidad y nueva que quieo que analicemos es desde remito seleccinando n remitos y armar una especie de cotizacion o pre-factura y ya dejarla lista para facturar y no tener que volver a calcular todo para facturar. Ej.Uncliente tiene 10 remitos pendientes de facturar y me dice que tiene 25000 dlls para que le facutre algunos de estos remitos entonces  selecciono remito3, remito9 y remito8 y el total de esto seria 25000 dlls. entocnes como ya seleecione los remitos que llegan a ese monto ya me gustaria dejarlo en un estado como ya reservado para una facturacion y evitar que venga otra persona y seleccione alguno de estos remitos y lo facture individualemente desconociendo el analisis y reserva previa.

---

## Assistant

I'll explore the codebase to understand the current Remitos and Facturación flows before proposing a plan.

**Tool: task**

**Tool: task**

---

## Assistant

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

**Tool: bash**

---

## Assistant

_Thinking:_

Let me look for pricing in the backend - are there product prices anywhere? The user mentioned "25000 dlls".

**Tool: bash**

**Tool: grep**

---

## Assistant

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

**Tool: grep**

_Thinking:_

.

---

## Assistant

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

**Tool: read**

---

## Assistant

_Thinking:_

Now let me read the models for remitoItems, productVariants, productPresentations, and the migration for facturas.

Key question for item-level partial billing: `remito_items` has `product_variant_id`, `quantity_requested` (in presentation units), `quantity_dispatched` (base units). For partial billing at item level, we'd need to know how much of each item was already billed. Currently `remito_facturas.cantidad_facturada` is a scalar per remito with no item breakdown. So to support item-level partial billing, we need a new join table `remito_factura_items` (factura_id, remito_id, remito_item_id, cantidad_facturada) — or migrate `remito_facturas` to include `remito_item_id`.

Let me read those models +

**Tool: read**

**Tool: read**

**Tool: read**

**Tool: read**

---

## Assistant

_Thinking:_

Now I have a very complete picture of the data model. Let me read the frontend ModalFactura.jsx and Facturacion.jsx to understand the UI patterns I'd extend, and Remitos.jsx relevant parts.

Let me read ModalFactura.jsx fully (385 lines) and skim Facturacion.jsx.

**Tool: read**

---

## Assistant

_Thinking:_

Now let me look at Facturacion.jsx (main page) and the relevant parts of Remitos.jsx to understand the multi-select patterns needed. Also, I want to check the "Compras" module since it seems to have a "factura comercial" design with prices — that could be a reference for the monetary approach.

Let me check compras in backend — purchases.js model and controller — to see if there's a

**Tool: bash**

**Tool: grep**

---

## Assistant

_Thinking:_

Confirmed: no monetary values anywhere in the system. Purchases also have no prices.

Now let me read Facturacion.jsx to understand the page structure, and Remitos.jsx relevant sections. Let me read Fact

**Tool: read**

_Thinking:_

uracion.jsx fully.

---

## Assistant

_Thinking:_

Now let me look at the Remitos.jsx key parts — the multi-select capabilities that don't exist yet, plus the migration file for facturas to understand the migration style.

Let me read the migration and check the Remitos.jsx selection state

**Tool: read**

**Tool: read**

---

## Assistant

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

---

## Assistant

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

**Tool: grep**

---

## Assistant

_Thinking:_

There IS a Productos UI with `ModalProductos` that manages variants (`upVariant`, `delVariant`, `allVariants`). So adding a `precio_unitario` to `product_variants` would have a natural home in `ModalProductos.jsx`.

Let me quickly peek at ModalProductos.jsx to see the variant form structure — that will tell me how feasible adding a price field is.

Let me read a portion.

**Tool: grep**

**Tool: read**

---

## Assistant

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

---

## Assistant

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

**Tool: grep**

---

## Assistant

**Tool: read**

---

## Assistant

_Thinking:_

Good — `updateVariant` does `variant.update(req.body)`, so adding `precio_unitario` to the model means the API accepts it without controller changes.

Now let me check the frontend ModalProductos.jsx variant form to know where to add the price input.

**Tool: read**

**Tool: read**

---

## Assistant

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

**Tool: grep**

---

## Assistant

_Thinking:_

Good. There's an `AuditLogService`. Let me check its API quickly to plan the audit of the override.

Let me check the AuditLogService export signature

**Tool: grep**

**Tool: read**

---

## Assistant

_Thinking:_

I have everything. Now let me write the plan.

One more consideration: the `auditLogs` model — let me check it briefly to see if it's generic (model + action) so I can log the admin override. Let me quickly check the model fields.

Actually, `modelAuditHooks.js` suggests automatic auditing via hooks on models. Let me check `auditLogs.js` model quickly.

**Tool: read**

---

## Assistant

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

## Assistant

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

**Tool: read**

**Tool: read**

**Tool: grep**

---

## Assistant

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

