import { ConvexAuthProvider } from '@convex-dev/auth/react'
import type { ConvexReactClient } from 'convex/react'
import { useEffect, useState, type ReactNode } from 'react'
import {
  createResilientTokenStorage,
  refreshAccessTokenIfNeeded,
  requestStoragePersistence,
  restoreAuthFromSessionMirror,
} from '@/lib/authStorage'

function BootstrapLoading() {
  return (
    <div className="app-shell flex items-center justify-center">
      <p className="text-sm font-semibold text-muted-foreground">Cargando…</p>
    </div>
  )
}

export function AuthBootstrap({
  client,
  children,
}: {
  client: ConvexReactClient
  children: ReactNode
}) {
  const [ready, setReady] = useState(false)
  const convexUrl = import.meta.env.VITE_CONVEX_URL

  useEffect(() => {
    void (async () => {
      if (convexUrl) {
        restoreAuthFromSessionMirror(convexUrl)
        await refreshAccessTokenIfNeeded(convexUrl)
        void requestStoragePersistence()
      }
      setReady(true)
    })()
  }, [convexUrl])

  if (!ready) return <BootstrapLoading />

  return (
    <ConvexAuthProvider client={client} storage={createResilientTokenStorage()}>
      {children}
    </ConvexAuthProvider>
  )
}
