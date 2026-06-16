import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexReactClient } from 'convex/react'
// Fontsource bundles ship with font-display: swap in @font-face rules.
import '@fontsource-variable/outfit'
import '@fontsource-variable/fraunces'
import { AuthBootstrap } from '@/components/AuthBootstrap'
import './index.css'
import App from './App.tsx'

const convexUrl = import.meta.env.VITE_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convex ? (
      <AuthBootstrap client={convex}>
        <App />
      </AuthBootstrap>
    ) : (
      <App />
    )}
  </StrictMode>
)
