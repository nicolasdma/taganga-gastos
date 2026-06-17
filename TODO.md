# TODO — Gatonomía (Taganga)

Estado al **2026-06-16**. Repo al día con auth, ítems flat, custom items, mobile PWA y vista Nosotros/Míos en la mayoría de pantallas.

---

## ✅ Completado

### Core
- [x] Auth Google + hogares + scope shared/personal (server-enforced)
- [x] Eliminar categorías → catálogo flat (`src/lib/items.ts`)
- [x] Custom items: crear desde card + buscador, promoción personal → shared al gastar en Nosotros
- [x] Vista Nosotros/Míos persistida (`useExpenseView`) en Home, Calendario, Stats, insights, chips frecuentes, ItemPicker
- [x] `vercel.json` rewrite SPA para `/join/:code`
- [x] Parche manual prod: Ana unida al hogar `SYX3SAXJ` (`adminMoveUserToHousehold`)

### Mobile PWA
- [x] iOS input zoom fix (`font-size: max(16px, 1em)`)
- [x] `interactive-widget=resizes-content` + hooks visual viewport / teclado
- [x] Ocultar FAB, nav, toast con teclado abierto
- [x] Auth offline con token local, `requestStoragePersistence`
- [x] SW: no cachear Convex/auth
- [x] Banners: PWA update, Android install, iOS add-to-home guide
- [x] `inputMode` / `enterKeyHint`, tap targets nav, splash iOS

---

## P0 — Crítico: emparejamiento en login

El bug que les pasó a Nicolás/Ana **sigue sin fix de producto**.

### Auto-crear hogar silenciosamente
**Archivo:** `src/App.tsx` (`AuthenticatedApp`)

- [ ] No llamar `ensureUserReady()` automáticamente sin consentimiento
- [ ] Mostrar `OnboardingScreen` cuando `household === null`
- [ ] Si invite en URL falla → **error visible**, no hogar alternativo
- [ ] Primer usuario: flujo explícito “Crear hogar”
- [ ] Segundo usuario: “Unirme” con código o `/join/CODE`

### `joinHousehold` bloquea si ya tenés hogar
- [ ] Opción A (recomendada): no auto-crear hogar → join funciona en primer login
- [ ] Opción B: `leaveAndJoin` / `switchHousehold` con confirmación
- [ ] Opción C: abandonar hogar vacío antes de unirse

### UI compartir invite
- [ ] Sheet o pantalla: “Invitá a tu pareja”
- [ ] Copiar código + link `https://taganga-gastos.vercel.app/join/CODE`
- [ ] (Opcional) `navigator.share` o QR

### Verificar invite en prod
- [x] `vercel.json` rewrite
- [ ] Probar cold open de `/join/CODE` en dispositivo real

---

## P1 — Producto / coherencia

### Defaults scope y vista
Hoy default sigue **Míos / personal** (`src/lib/expenseScope.ts`, outbox, BE `resolveScope`).

- [ ] Decidir default producto (pareja → probablemente **Nosotros / shared**)
- [ ] Unificar `DEFAULT_EXPENSE_SCOPE`, `DEFAULT_EXPENSE_VIEW`, `resolveScope()`, outbox
- [ ] Legacy sin `scope`: unificar lectura con `expenseScope()` en BE

### Pantallas / edge cases
- [x] Calendario + Stats con filtro view
- [ ] Verificar `DayDetailSheet` alineado con view global
- [ ] Tickets escaneados: toggle scope (hoy default personal vía outbox)

---

## P2 — UX y features

### Auth / cuenta
- [ ] Botón **Cerrar sesión**
- [ ] Error visible si bootstrap de hogar falla (no spinner infinito)

### Gastos
- [ ] Editar `scope` en gasto existente (`updateExpense` + `ExpenseEditSheet`)
- [ ] Recordar último scope usado (preferencia en `userPreferences`?)

### Custom items
- [x] Crear desde card + buscador
- [ ] Editar / eliminar custom items
- [ ] Offline: documentar o soportar create offline

### Hogar
- [ ] Ver nombre del hogar y miembros
- [ ] Límite 2 miembros en `joinHousehold`
- [ ] Restringir `adminMoveUserToHousehold` (solo admin/soporte)

### Futuro (sin categorías)
- [ ] **Compras conjuntas** — agrupación explícita de ítems/sesiones (no reintroducir categorías)

---

## P2 — Datos legacy

- [ ] Documentar: primer hogar creado absorbe gastos sin `householdId` como `shared`
- [ ] Backfill `createdBy` en gastos pre-auth
- [ ] Quitar `categoryId` del schema (fase narrow migración)

---

## P3 — Seguridad / infra

- [ ] `receiptScan` action sin auth → rate limit o require auth
- [ ] Confirmar deploy prod Convex + Vercel con últimos commits
- [ ] Variables Convex prod: `SITE_URL`, Google OAuth, JWT keys
- [ ] Probar OAuth Google en **PWA iOS real** (Safari tab ≠ PWA storage)

---

## Limitaciones iOS (documentadas, no fix solo FE)

- Safari pestaña vs PWA instalada = storage separado
- iOS puede evictar datos tras ~7 días sin uso
- OAuth en PWA iOS requiere prueba en dispositivo con mismo origin `/`

---

## Test plan manual (2 cuentas Google)

1. **Happy path pareja** — crear hogar, invite, gastos shared/personal
2. **Anti-patterns** — sin invite primero, invite inválido, ya en hogar + invite
3. **Offline** — gasto shared offline → sync → visible pareja
4. **Mobile** — teclado en ItemPicker, custom items, PWA install
5. **Vista** — Nosotros/Míos consistente Home vs Calendario vs Stats

---

## Orden sugerido

1. Onboarding hogar + invite UI (P0)
2. Defaults `shared` (P1)
3. Sign out + edit scope (P2)
4. Custom items edit/delete (P2)
5. Hardening receiptScan (P3)
6. Compras conjuntas (futuro)

---

## Referencia archivos

| Área | Archivos |
|------|----------|
| Login / bootstrap | `src/App.tsx`, `LoginScreen.tsx`, `OnboardingScreen.tsx` |
| Invite | `useInviteCodeFromPath.ts`, `vercel.json` |
| Hogar BE | `convex/households.ts`, `convex/lib/households.ts` |
| Custom items | `convex/customItems.ts`, `CreateCustomItemSheet.tsx`, `mergeCatalog.ts` |
| Scope / vista | `expenseScope.ts`, `useExpenseView.ts`, `ExpenseScopeToggle.tsx` |
| Mobile | `useVisualViewportHeight.ts`, `useKeyboardOpen.ts`, `BottomSheet.tsx` |
| Ítems | `src/lib/items.ts`, `ItemPicker.tsx` |

**Prod:** `befitting-cormorant-30` · `https://taganga-gastos.vercel.app/`
