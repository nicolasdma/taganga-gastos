# TODO — Billetera grupal (auth + hogar compartido)

Estado al **2026-06-15**. Auth con Google y privacidad server-side ya están implementados. Lo que falta es principalmente **onboarding de pareja en login** y **consistencia de defaults/vistas**.

---

## Contexto: qué funciona hoy

- Login con Google (`ConvexAuthProvider` + `LoginScreen`)
- Gastos con `scope`: `shared` (👫 ambos) / `personal` (👤 solo creador)
- Reglas en servidor: `canViewExpense`, `canModifyExpense`, `matchesView`
- Hogares (`households`) + miembros (`householdMembers`) + invite codes
- Toggle 👫/👤 al **crear** gasto (`ExpenseSheet` → `AmountKeypad`)
- Filtro **Nosotros / Míos** en Home, persistido en `userPreferences`
- Outbox offline propaga `scope` al sincronizar
- Ruta `/join/:code` detectada por `useInviteCodeFromPath`

### Incidente real (ya parcheado a mano)

Ana entró sin invite → la app le creó un hogar nuevo → no veía los gastos compartidos de Nicolás.

**Fix manual aplicado en prod:** `internal.households.adminMoveUserToHousehold` movió a Ana al hogar `SYX3SAXJ`. No es solución de producto; es parche operativo.

---

## P0 — Crítico: emparejamiento en login

Estos son los bugs que rompen la “billetera grupal” para parejas.

### 1. Auto-crear hogar silenciosamente

**Archivo:** `src/App.tsx` (`AuthenticatedApp`)

Hoy, si el usuario no tiene hogar:
- Con `/join/CODE` → intenta `joinHousehold`
- Sin invite → `ensureUserReady()` **crea hogar nuevo automáticamente**
- Si `joinHousehold` falla → fallback silencioso a `ensureUserReady()` → **hogar separado sin avisar**

**Problema:** la pareja termina en dos hogares distintos (caso Ana/Nicolás).

**Arreglar:**
- [ ] No llamar `ensureUserReady()` automáticamente sin consentimiento del usuario
- [ ] Mostrar `OnboardingScreen` cuando `household === null` (ya existe, no está enrutado)
- [ ] Si hay invite en URL y falla el join → **mostrar error**, no crear hogar alternativo
- [ ] Primer usuario: flujo explícito “Crear hogar” (con nombre opcional)
- [ ] Segundo usuario: flujo explícito “Unirme con código” o link `/join/CODE`

### 2. `joinHousehold` bloquea si ya tenés hogar

**Archivo:** `convex/households.ts`

`joinHousehold` lanza `Already in a household` si el usuario ya fue auto-provisionado.

**Arreglar (elegir una estrategia):**
- [ ] **Opción A (recomendada):** evitar auto-crear hogar → el join funciona en primer login
- [ ] **Opción B:** mutation `switchHousehold` / `leaveAndJoin` que mueva membresía (similar a `adminMoveUserToHousehold` pero con auth + confirmación)
- [ ] **Opción C:** permitir “abandonar hogar vacío” antes de unirse

### 3. UI para compartir invite

**Archivos:** `OnboardingScreen.tsx`, `App.tsx`, nuevo componente de settings

Hoy `getMyHousehold` devuelve `inviteCode` pero **no hay UI** para copiarlo o compartir link.

**Arreglar:**
- [ ] Pantalla o sheet post-crear hogar: “Invitá a tu pareja”
- [ ] Botón copiar código (`SYX3SAXJ`)
- [ ] Botón copiar link `https://taganga-gastos.vercel.app/join/SYX3SAXJ`
- [ ] (Opcional) QR o share nativo (`navigator.share`)

### 4. Routing SPA para `/join/:code`

**Archivo:** `src/hooks/useInviteCodeFromPath.ts`

Lee el path al montar, pero Vercel debe servir `index.html` en esa ruta.

**Verificar:**
- [ ] `vercel.json` con rewrite `/* → /index.html` (si no existe, agregar)
- [ ] Probar link de invite en prod (cold open, no solo navegación interna)

---

## P1 — Defaults de scope y vista (producto inconsistente)

Hay **tres defaults distintos** en el código:

| Lugar | Default actual |
|-------|----------------|
| `src/lib/expenseScope.ts` | `personal` (scope + vista) |
| `convex/expenses.ts` `resolveScope()` | `personal` en writes |
| `convex/lib/auth.ts` `expenseScope()` | `shared` en reads de legacy sin scope |
| `src/lib/outbox.ts` | `personal` si no se pasa scope |

Para una app de pareja, lo esperable suele ser:
- **Al agregar gasto:** default `shared` (Compartido)
- **Vista Home:** default `shared` (Nosotros)

**Arreglar:**
- [ ] Definir una sola fuente de verdad (idealmente `src/lib/expenseScope.ts` + mismo valor en BE)
- [ ] Cambiar `DEFAULT_EXPENSE_SCOPE` → `'shared'`
- [ ] Cambiar `DEFAULT_EXPENSE_VIEW` → `'shared'`
- [ ] Alinear `resolveScope()` en `convex/expenses.ts`
- [ ] Alinear fallback de outbox (`outbox.ts` líneas ~69 y ~112)
- [ ] Alinear fallbacks en `RecentExpenses` / `usePeriodTotals` (usan `DEFAULT_EXPENSE_SCOPE`)
- [ ] Decidir qué hacer con gastos legacy sin `scope`: ¿siempre `shared`? Documentar y unificar con `expenseScope()` del BE

---

## P1 — Vista Nosotros/Míos desalineada entre pantallas

| Pantalla | ¿Usa filtro view? | Comportamiento actual |
|----------|-------------------|------------------------|
| Home | ✅ Sí (`useExpenseView`) | Filtro + preferencia persistida |
| Calendario | ❌ No | Backend default `personal` |
| Stats | ❌ No | Backend default `personal` |
| DayDetailSheet | ❌ No | Sin `view` → muestra todo lo visible (shared + personal propio) |
| Insights | — | Hardcoded `shared` en `convex/expenses.ts` |
| QuickAccess | ❌ Parcial | Hardcode `DEFAULT_EXPENSE_VIEW` |

**Arreglar:**
- [ ] Pasar `view` desde un hook global (`useExpenseView`) a Calendar, Stats, DayDetail
- [ ] O decidir explícitamente: Calendario/Stats = siempre “Nosotros” (y quitar filtro ahí)
- [ ] Unificar `DayDetailSheet` con la misma regla que Calendario
- [ ] Actualizar `QuickAccess.tsx` para usar la vista del usuario, no constante hardcodeada

---

## P2 — UX y features faltantes

### Auth / cuenta
- [ ] Botón **Cerrar sesión** (`signOut` de `@convex-dev/auth/react`)
- [ ] Estado de error visible si bootstrap de hogar falla (hoy solo spinner infinito en edge cases)

### Crear / editar gastos
- [ ] `updateExpense` no permite cambiar `scope` → agregar en BE + `ExpenseEditSheet`
- [ ] Tickets escaneados (`ReceiptReviewSheet`) no tienen toggle de scope → quedan `personal` por outbox
- [ ] Recordar último scope usado por usuario (preferencia en `userPreferences`?)

### Hogar
- [ ] Ver nombre del hogar y quién más está (2 miembros max?)
- [ ] No permitir más de 2 miembros (validación en `joinHousehold`) — producto es pareja
- [ ] Eliminar o restringir `adminMoveUserToHousehold` a entorno admin (no dejar como backdoor permanente sin guard)

### Onboarding
- [ ] Integrar `OnboardingScreen` en flujo post-login (reemplaza auto-bootstrap)
- [ ] Si usuario entra por `/join/CODE`, pre-llenar código y modo “Unirme”

---

## P2 — Migración de datos legacy

**Archivo:** `convex/lib/households.ts` → `migrateOrphanExpenses`

Al crear el **primer** hogar, todos los gastos sin `householdId` se asignan a ese hogar como `shared`.

**Riesgos / pendientes:**
- [ ] Documentar que el primer login post-auth “absorbe” el historial
- [ ] Backfill de `createdBy` en gastos viejos (hoy muchos tienen `createdBy` vacío → visibilidad personal ambigua)
- [ ] Script one-off para asignar `createdBy` al usuario correcto en gastos pre-auth

---

## P3 — Seguridad y hardening

- [ ] `receiptScan` action sin auth → cualquiera con URL de Convex puede quemar quota Gemini
  - Agregar check de auth en action o rate limit
- [ ] `lookupInvite` es query pública → aceptable para UX de invites; OK dejar
- [ ] Revisar que ninguna query de gastos funcione sin `requireAuthContext` (hoy OK)

---

## P3 — Infra / deploy checklist

Variables Convex (prod):
- [ ] `SITE_URL` = URL de Vercel prod
- [ ] `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- [ ] `JWT_PRIVATE_KEY` / `JWKS` (via `scripts/generateKeys.mjs`)
- [ ] Callback Google: `https://<deployment>.convex.site/api/auth/callback/google`

Deploy:
- [ ] `CONVEX_DEPLOYMENT=prod:befitting-cormorant-30 npx convex deploy`
- [ ] Vercel: `VITE_CONVEX_URL=https://befitting-cormorant-30.convex.cloud`
- [ ] Frontend auth deployado en Vercel (commit pendiente al momento de escribir esto)

---

## Test plan (manual, 2 cuentas Google)

Usar dos browsers / perfiles incógnito.

1. **Happy path pareja**
   - [ ] Usuario A crea hogar → ve invite code
   - [ ] Usuario B entra **solo** por `/join/CODE` (sin abrir app antes)
   - [ ] A crea gasto `shared` → B lo ve en “Nosotros”
   - [ ] A crea gasto `personal` → B **no** lo ve
   - [ ] B crea gasto `shared` → A lo ve

2. **Anti-patterns (bugs actuales)**
   - [ ] B abre app sin invite primero → ¿se crea hogar huérfano? (debe **no** pasar tras fix)
   - [ ] Invite inválido → ¿error claro? (no hogar silencioso)
   - [ ] B ya en hogar propio + invite → ¿puede unirse? (hoy **no**)

3. **Offline**
   - [ ] Gasto offline con scope `shared` → sync → visible para pareja
   - [ ] Gasto offline sin scope → respeta default unificado post-fix

4. **Pantallas**
   - [ ] Home “Nosotros” vs Calendario/Stats muestran mismos totales (post-fix view)
   - [ ] Recargar app → preferencia de vista persiste

---

## Orden sugerido de implementación

1. **Onboarding + no auto-crear hogar** (P0) — desbloquea pareja sin parches manuales
2. **UI compartir invite** (P0) — flujo real de invitación
3. **Defaults `shared`** (P1) — alinear producto
4. **View en Calendario/Stats** (P1) — coherencia
5. **Scope en edición + tickets** (P2)
6. **Sign out + polish** (P2)
7. **Hardening receiptScan** (P3)

---

## Referencia rápida de archivos

| Área | Archivos clave |
|------|----------------|
| Login / bootstrap | `src/App.tsx`, `src/screens/LoginScreen.tsx`, `src/screens/OnboardingScreen.tsx` |
| Invite link | `src/hooks/useInviteCodeFromPath.ts` |
| Hogar BE | `convex/households.ts`, `convex/lib/households.ts` |
| Privacidad BE | `convex/lib/auth.ts`, `convex/expenses.ts` |
| Scope FE | `src/lib/expenseScope.ts`, `src/components/ExpenseScopeToggle.tsx` |
| Vista FE | `src/hooks/useExpenseView.ts`, `convex/userPreferences.ts` |
| Outbox | `src/lib/outbox.ts`, `src/hooks/useOutboxSync.ts` |
| Admin parche | `convex/households.ts` → `adminMoveUserToHousehold` (internal) |

---

## Notas

- `OnboardingScreen` está implementado pero **no conectado** al flujo principal.
- El parche `adminMoveUserToHousehold` quedó deployado en prod; usar solo para soporte hasta tener flujo de producto.
- Prod Convex: `befitting-cormorant-30` · App: `https://taganga-gastos.vercel.app/`
