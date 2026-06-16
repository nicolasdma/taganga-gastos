import { cn } from '@/lib/utils'

export type TabId = 'home' | 'calendar' | 'stats'

interface BottomNavProps {
  active: TabId
  onChange: (tab: TabId) => void
}

const TABS: Array<{ id: TabId; emoji: string; label: string }> = [
  { id: 'home', emoji: '🏠', label: 'Inicio' },
  { id: 'calendar', emoji: '📅', label: 'Días' },
  { id: 'stats', emoji: '📊', label: 'Stats' },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="nav-float pb-safe" aria-label="Navegación principal">
      <div className="flex items-center justify-between gap-1">
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] py-3 rounded-full transition-all duration-300',
                isActive
                  ? 'bg-cobalt-deep text-porcelain-cream shadow-cobalt scale-[1.02]'
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
