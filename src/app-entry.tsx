import { StrictMode } from 'react'
import type { Root } from 'react-dom/client'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import { createRobustAuthStorage, shouldHandleOAuthCode } from '@/lib/authStorage'
import '@fontsource-variable/outfit'
import '@fontsource-variable/fraunces'
import './boot.css'
import './index.css'
import App from './App.tsx'

export async function mountApp(root: Root): Promise<void> {
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

  root.render(
    <StrictMode>
      {convex ? (
        <ConvexAuthProvider
          client={convex}
          storage={createRobustAuthStorage()}
          shouldHandleCode={shouldHandleOAuthCode}
        >
          <App />
        </ConvexAuthProvider>
      ) : (
        <App />
      )}
    </StrictMode>
  )
}
