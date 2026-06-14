/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module '@fontsource-variable/outfit'
declare module '@fontsource-variable/fraunces'

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL?: string
  readonly VITE_CONVEX_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
