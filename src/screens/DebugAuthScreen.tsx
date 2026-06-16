import { useMemo } from 'react'
import { getLocalAuthStoragePresence } from '@/lib/authStorage'

export function DebugAuthScreen() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  const storage = useMemo(() => getLocalAuthStoragePresence(convexUrl), [convexUrl])
  const displayMode =
    typeof window === 'undefined'
      ? 'unknown'
      : window.matchMedia('(display-mode: standalone)').matches
        ? 'standalone'
        : 'browser-tab'

  return (
    <main className="app-shell p-6 flex items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-white/20 bg-black/30 p-5 text-white backdrop-blur">
        <h1 className="text-xl font-bold mb-4">Debug Auth Storage</h1>
        <p className="text-sm text-white/80 mb-4">
          Esta pantalla solo muestra presencia de keys, nunca tokens.
        </p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">hasJwt</dt>
            <dd className="font-mono">{String(storage.hasJwt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">hasRefresh</dt>
            <dd className="font-mono">{String(storage.hasRefresh)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">displayMode</dt>
            <dd className="font-mono">{displayMode}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">path</dt>
            <dd className="font-mono">/debug-auth</dd>
          </div>
        </dl>
        <button
          className="mt-5 w-full rounded-xl bg-white text-black py-2 text-sm font-semibold"
          onClick={() => window.location.reload()}
        >
          Reload esta página
        </button>
      </section>
    </main>
  )
}
