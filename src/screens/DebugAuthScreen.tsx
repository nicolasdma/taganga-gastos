import { useMemo } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { useConvexAuth } from 'convex/react'
import { getLocalAuthStoragePresence, getStorageAvailability } from '@/lib/authStorage'

function escapeNamespace(url: string) {
  return url.replace(/[^a-zA-Z0-9]/g, '')
}

function getSessionAuthStoragePresence(convexUrl?: string) {
  if (typeof window === 'undefined' || !convexUrl) {
    return { hasJwt: false, hasRefresh: false }
  }

  const ns = escapeNamespace(convexUrl)
  return {
    hasJwt: Boolean(sessionStorage.getItem(`__convexAuthJWT_${ns}`)),
    hasRefresh: Boolean(sessionStorage.getItem(`__convexAuthRefreshToken_${ns}`)),
  }
}

function listConvexAuthKeys(storage: Storage | undefined) {
  if (!storage) return []
  const keys: string[] = []
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i)
    if (key && key.startsWith('__convexAuth')) {
      keys.push(key)
    }
  }
  return keys.sort()
}

export function DebugAuthScreen() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  const { signIn, signOut } = useAuthActions()
  const { isLoading, isAuthenticated, isRefreshing } = useConvexAuth()
  const localStoragePresence = useMemo(() => getLocalAuthStoragePresence(convexUrl), [convexUrl])
  const sessionStoragePresence = useMemo(() => getSessionAuthStoragePresence(convexUrl), [convexUrl])
  const storageAvailability = getStorageAvailability()
  const localAuthKeys = listConvexAuthKeys(
    typeof window !== 'undefined' ? window.localStorage : undefined
  )
  const sessionAuthKeys = listConvexAuthKeys(
    typeof window !== 'undefined' ? window.sessionStorage : undefined
  )
  const namespace = convexUrl ? escapeNamespace(convexUrl) : '(missing-convex-url)'
  const expectedJwtKey = `__convexAuthJWT_${namespace}`
  const expectedRefreshKey = `__convexAuthRefreshToken_${namespace}`
  const displayMode =
    typeof window === 'undefined'
      ? 'unknown'
      : window.matchMedia('(display-mode: standalone)').matches
        ? 'standalone'
        : 'browser-tab'

  return (
    <main className="app-shell p-4 flex justify-center overflow-y-auto">
      <section className="w-full max-w-md my-4 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-white/20 bg-black/30 p-5 text-white backdrop-blur">
        <h1 className="text-xl font-bold mb-4">Debug Auth Storage</h1>
        <p className="text-sm text-white/80 mb-4">
          Esta pantalla solo muestra presencia de keys, nunca tokens.
        </p>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">isLoading</dt>
            <dd className="font-mono">{String(isLoading)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">isAuthenticated</dt>
            <dd className="font-mono">{String(isAuthenticated)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">isRefreshing</dt>
            <dd className="font-mono">{String(isRefreshing)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">local.hasJwt</dt>
            <dd className="font-mono">{String(localStoragePresence.hasJwt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">local.hasRefresh</dt>
            <dd className="font-mono">{String(localStoragePresence.hasRefresh)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">session.hasJwt</dt>
            <dd className="font-mono">{String(sessionStoragePresence.hasJwt)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">session.hasRefresh</dt>
            <dd className="font-mono">{String(sessionStoragePresence.hasRefresh)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">displayMode</dt>
            <dd className="font-mono">{displayMode}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">path</dt>
            <dd className="font-mono">/debug-auth</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">localWritable</dt>
            <dd className="font-mono">{String(storageAvailability.localWritable)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/70">sessionWritable</dt>
            <dd className="font-mono">{String(storageAvailability.sessionWritable)}</dd>
          </div>
        </dl>
        <div className="mt-4 text-xs text-white/80">
          <p className="mb-1 font-semibold">local __convexAuth keys</p>
          <pre className="whitespace-pre-wrap break-all font-mono text-[11px] bg-black/20 rounded p-2">
            {localAuthKeys.length ? localAuthKeys.join('\n') : '(none)'}
          </pre>
        </div>
        <div className="mt-3 text-xs text-white/80">
          <p className="mb-1 font-semibold">session __convexAuth keys</p>
          <pre className="whitespace-pre-wrap break-all font-mono text-[11px] bg-black/20 rounded p-2">
            {sessionAuthKeys.length ? sessionAuthKeys.join('\n') : '(none)'}
          </pre>
        </div>
        <div className="mt-3 text-xs text-white/80">
          <p className="mb-1 font-semibold">expected keys (namespace)</p>
          <pre className="whitespace-pre-wrap break-all font-mono text-[11px] bg-black/20 rounded p-2">
            {expectedJwtKey}
            {'\n'}
            {expectedRefreshKey}
          </pre>
        </div>
        <button
          className="mt-5 w-full rounded-xl bg-white text-black py-2 text-sm font-semibold"
          onClick={() => window.location.reload()}
        >
          Reload esta página
        </button>
        <button
          className="mt-3 w-full rounded-xl bg-white/80 text-black py-2 text-sm font-semibold"
          onClick={() => void signIn('google')}
        >
          Login Google desde debug
        </button>
        <button
          className="mt-3 w-full rounded-xl bg-white/20 text-white py-2 text-sm font-semibold"
          onClick={() => void signOut()}
        >
          Logout
        </button>
        <button
          className="mt-3 w-full rounded-xl bg-transparent border border-white/40 text-white py-2 text-sm font-semibold"
          onClick={() => {
            window.location.href = '/'
          }}
        >
          Ir a la app (/)
        </button>
      </section>
    </main>
  )
}
