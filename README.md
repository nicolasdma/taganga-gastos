# Gastos

App de gastos compartidos para 2 personas. Captura rápida, memoria de gastos en COP.

**Stack:** Vite + React 19 + TypeScript + Tailwind + Convex + Vercel

## Desarrollo

```bash
npm install
npm run dev:convex   # terminal 1 — backend Convex
npm run dev          # terminal 2 — frontend Vite
```

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
