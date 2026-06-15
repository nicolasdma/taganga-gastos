import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexAuthProvider } from '@convex-dev/auth/react'
import { ConvexReactClient } from 'convex/react'
import '@fontsource-variable/outfit'
import '@fontsource-variable/fraunces'
import './index.css'
import App from './App.tsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convex ? (
      <ConvexAuthProvider client={convex}>
        <App />
      </ConvexAuthProvider>
    ) : (
      <App />
    )}
  </StrictMode>
)
