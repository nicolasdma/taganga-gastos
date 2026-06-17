import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { prefetchStatsScreen } from '@/lib/prefetchStats'

export type TabId = 'home' | 'calendar' | 'stats'

interface BottomNavProps {
  active: TabId
  onChange: (tab: TabId) => void
}

const TABS: Array<{ id: TabId; emoji: string; label: string }> = [
  { id: 'home', emoji: '🏠', label: 'Inicio' },
  { id: 'calendar', emoji: '📅', label: 'Calendario' },
  { id: 'stats', emoji: '🏡', label: 'Casa' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => prefetchStatsScreen())
      return () => window.cancelIdleCallback(id)
    }
    const timer = setTimeout(() => prefetchStatsScreen(), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <nav className="nav-float pb-safe" aria-label="Navegación principal">
      <div className="flex items-center justify-between gap-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onPointerEnter={() => {
                if (tab.id === 'stats') prefetchStatsScreen()
              }}
              onFocus={() => {
                if (tab.id === 'stats') prefetchStatsScreen()
              }}
              onClick={() => onChange(tab.id)}
              className={cn(
                'nav-float__button flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] py-3 rounded-full transition-all duration-300',
                isActive
                  ? 'nav-float__button--active bg-cobalt-deep text-porcelain-cream shadow-cobalt scale-[1.02]'
                  : 'text-muted-foreground active:scale-95'
              )}
            >
              <span className={cn('text-lg transition-transform', isActive && 'scale-110')}>
                {tab.emoji}
              </span>
              <span className="text-[9px] font-bold font-display tracking-wide">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
