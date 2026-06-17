# Gatonomía

App de gastos compartidos para 2 personas. Captura rápida, memoria de gastos en COP y una identidad editorial con gatos.

**Stack:** Vite + React 19 + TypeScript + Tailwind + Convex + Vercel

## Auth y privacidad (Convex Auth + Google)

1. Instalar dependencias (ya en `package.json`):
   ```bash
   npm install @convex-dev/auth @auth/core@0.41.1
   ```
2. Generar claves JWT (solo una vez por deployment):
   ```bash
   node scripts/generateKeys.mjs
   ```
   Copiá `JWT_PRIVATE_KEY` y `JWKS` al dashboard de Convex → Environment Variables.
3. Variables en el deployment Convex:
   ```bash
   npx convex env set SITE_URL http://localhost:5173
   npx convex env set AUTH_GOOGLE_ID <client-id>
   npx convex env set AUTH_GOOGLE_SECRET <client-secret>
   ```
   Callback OAuth: `https://<deployment>.convex.site/api/auth/callback/google`
4. Levantar backend + frontend:
   ```bash
   npm run dev:convex
   npm run dev
   ```

### Hogar compartido

- Primer usuario: **Crear hogar** (migra gastos legacy como `shared`).
- Pareja: compartir link `/join/<CODIGO>` o pegar el código en onboarding.
- Gastos **Compartido** 👫 → visibles para ambos. **Personal** 👤 → solo quien lo creó.


Crea `.env.local` con:

```
VITE_CONVEX_URL=https://<tu-deployment>.convex.cloud
```

## Deploy

### Convex (producción)

```bash
npx convex login      # primera vez
npx convex deploy
```

Copia la URL de producción del dashboard de Convex.

### Vercel

1. Importa el repo en Vercel
2. Framework preset: **Vite**
3. Variable de entorno: `VITE_CONVEX_URL` = URL de Convex prod
4. Deploy

El `vercel.json` incluye fallback SPA para client-side routing.

## PWA

La app es instalable en iOS/Android (Agregar a pantalla de inicio). El service worker cachea assets estáticos vía `vite-plugin-pwa`.

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `VITE_CONVEX_URL` | Sí | URL del deployment Convex (dev o prod) |
