import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CraftBootScreen } from '@/components/craft/CraftBootScreen'
import '@/boot.css'

const root = createRoot(document.getElementById('root')!)

// Paint boot gate immediately — before Convex, fonts, or full app chunk.
root.render(
  <StrictMode>
    <CraftBootScreen />
  </StrictMode>
)

void import('@/app-entry').then(({ mountApp }) => mountApp(root))
