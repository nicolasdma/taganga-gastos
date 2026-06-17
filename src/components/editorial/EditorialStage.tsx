import { useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { CollageSticker } from '@/components/editorial/CollageSticker'
import { MarqueeBand } from '@/components/editorial/MarqueeBand'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { KittySprite } from '@/components/craft/KittySprite'
import { useExpenseView } from '@/hooks/useExpenseView'
import { usePeriodTotals } from '@/hooks/usePeriodTotals'
import { useLocalToday } from '@/hooks/useLocalToday'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import { formatCOPEditorial } from '@/lib/currency'
import { isTimestampInPeriod } from '@/lib/dates'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import type { ExpenseView } from '@/lib/expenseScope'
import type { ExpenseViewPanelRole } from '@/components/editorial/expenseViewPanelRole'
import { isExpenseViewPanelVisible } from '@/components/editorial/expenseViewPanelRole'
import { cn } from '@/lib/utils'

interface EditorialStageProps {
  pulseKey?: number
  view?: ExpenseView
  ritualLine?: {
    key: number
    message: string
    ariaLabel?: string
  } | null
  panelRole?: ExpenseViewPanelRole
}

function formatMovementLine(count: number | null): string {
  if (count === null) return 'movimientos de hoy'
  if (count === 1) return '1 movimiento'
  return `${count} movimientos`
}

interface HeroViewToggleProps {
  value: ExpenseView
  onChange: (view: ExpenseView) => void
  interactive: boolean
}

function HeroViewToggle({ value, onChange, interactive }: HeroViewToggleProps) {
  return (
    <div className="home-hero-view-toggle" role="group" aria-label="Cambiar vista de gastos">
      {(['shared', 'personal'] as const).map((option) => {
        const active = value === option
        return (
          <button
            key={option}
            type="button"
            className={cn(
              'home-hero-view-toggle__button',
              active && 'home-hero-view-toggle__button--active'
            )}
            onClick={() => {
              if (!active) onChange(option)
            }}
            aria-pressed={active}
            disabled={!interactive}
          >
            <span className="home-hero-view-toggle__label-full">
              {option === 'shared' ? 'Nosotros' : 'Míos'}
            </span>
            <span className="home-hero-view-toggle__label-short" aria-hidden>
              {option === 'shared' ? 'Nos.' : 'Míos'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

interface HeroCompanionArtPlaceholderProps {
  pulseKey: number
  view: ExpenseView
  onToggle: () => void
  interactive: boolean
}

function HeroCompanionArtPlaceholder({
  pulseKey,
  view,
  onToggle,
  interactive,
}: HeroCompanionArtPlaceholderProps) {
  const nextLabel = view === 'shared' ? 'Cambiar a Míos' : 'Cambiar a Nosotros'

  return (
    <button
      type="button"
      className={cn(
        'hero-companion-placeholder hero-companion-toggle illustration-placeholder',
        view === 'shared' ? 'hero-companion-toggle--shared' : 'hero-companion-toggle--personal'
      )}
      aria-label={nextLabel}
      onClick={onToggle}
      disabled={!interactive}
    >
      <span className="hero-companion-placeholder__kitty-slot hero-companion-placeholder__kitty-slot--lead">
        <KittySprite
          size={86}
          pulseKey={pulseKey}
          playful
          className="hero-companion-placeholder__kitty"
        />
      </span>
      <span
        className="hero-companion-placeholder__kitty-slot hero-companion-placeholder__kitty-slot--mate"
        aria-hidden="true"
      >
        <KittySprite
          size={72}
          pulseKey={pulseKey}
          playful
          flip={false}
          className="hero-companion-placeholder__kitty"
        />
      </span>
      <span className="hero-companion-placeholder__shadow" />
    </button>
  )
}

export function EditorialStage({
  pulseKey = 0,
  view,
  ritualLine,
  panelRole = 'active',
}: EditorialStageProps) {
  const { today, isStale, isInitialLoad } = usePeriodTotals(view)
  const { todayKey, tzOffsetMinutes } = useLocalToday()
  const recentLive = useQuery(api.expenses.recentExpenses, view ? { limit: 12, view } : 'skip')
  const { value: recent } = useStaleWhileLoading(recentLive, view)

  const editorial = today !== undefined ? formatCOPEditorial(today) : null
  const showPlaceholder = isInitialLoad && editorial === null
  const dimStale = isStale && panelRole === 'incoming'
  const { setView } = useExpenseView()
  const interactive = isExpenseViewPanelVisible(panelRole) && view !== undefined
  const toggleHeroView = () => {
    if (!view || !interactive) return
    setView(view === 'shared' ? 'personal' : 'shared')
  }
  const todaysExpenses = useMemo(() => {
    if (!recent) return null
    return recent.filter((expense) =>
      typeof expense.createdAt === 'number'
        ? isTimestampInPeriod(expense.createdAt, 'today', todayKey, tzOffsetMinutes)
        : false
    )
  }, [recent, todayKey, tzOffsetMinutes])
  const topItems = useMemo(() => {
    if (!todaysExpenses) return []

    const seen = new Set<string>()
    return todaysExpenses
      .map((expense) => formatExpenseLabel(expense))
      .filter((item) => {
        const key = `${item.emoji}-${item.label}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 3)
  }, [todaysExpenses])
  const movementLine = formatMovementLine(todaysExpenses?.length ?? null)

  return (
    <section className={cn('editorial-stage relative', dimStale && 'expense-view-stale')}>
      <div className="editorial-stage__head panel-ink relative overflow-hidden">
        <MarqueeBand />
        <div className="px-4 pt-2 pb-5 relative">
          <MotionReveal step={1}>
            <div className="flex items-start justify-between gap-3 editorial-header__title-row">
              <div className="editorial-header__copy min-w-0">
                <p className="editorial-kicker">
                  {view === 'shared' ? 'Nosotros' : 'Tu libreta'}
                </p>
                <h1 className="editorial-stage__title type-editorial-title text-white editorial-text-shadow">
                  Gatonomía
                </h1>
                <p className="editorial-stage__subtitle editorial-text-shadow">
                  Tu libreta de gastos con gatitos ♥
                </p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>

      <div className="editorial-stage__body px-4 pt-1 relative z-10 pb-1">
        <div className="hero-total-sticky">
          <MotionReveal step={2}>
            <div className="home-hero-wrap relative">
              <CollageSticker tone="sage" rotate="right" className="absolute top-1 left-5 z-20">
                Hoy 🐾
              </CollageSticker>
              <div className="home-hero-card torn-sheet">
                {view && (
                  <HeroViewToggle value={view} onChange={setView} interactive={interactive} />
                )}
                <div className="home-hero-card__copy">
                  {editorial ? (
                    <div
                      key={pulseKey}
                      className={cn(
                        'type-display-massive home-hero-total transition-transform duration-300',
                        pulseKey > 0 && 'animate-total-pulse'
                      )}
                    >
                      <span className="type-display-symbol">{editorial.symbol}</span>
                      <span className="type-display-value">{editorial.value}</span>
                    </div>
                  ) : showPlaceholder ? (
                    <p className="type-display-massive text-ink/30">—</p>
                  ) : null}

                  <div className="home-movement-line">
                    <span aria-hidden>﹤</span>
                    <p>{movementLine}</p>
                    <span aria-hidden>﹥</span>
                  </div>

                  <div className="home-hero-chips" aria-label="Ítems destacados de hoy">
                    {topItems.length > 0 ? (
                      topItems.map((item) => (
                        <span key={`${item.emoji}-${item.label}`} className="home-hero-chip">
                          <span aria-hidden>{item.emoji}</span>
                          {item.label}
                        </span>
                      ))
                    ) : (
                      <span className="home-hero-chip home-hero-chip--quiet">libreta tranquila</span>
                    )}
                  </div>

                  <div className="home-ritual-line-slot" aria-live="polite">
                    {ritualLine && (
                      <p
                        key={ritualLine.key}
                        className="home-ritual-line"
                        aria-label={ritualLine.ariaLabel}
                      >
                        {ritualLine.message}
                      </p>
                    )}
                  </div>
                </div>

                {view && (
                  <HeroCompanionArtPlaceholder
                    pulseKey={pulseKey}
                    view={view}
                    onToggle={toggleHeroView}
                    interactive={interactive}
                  />
                )}
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  )
}
