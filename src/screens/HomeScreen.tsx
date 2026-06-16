import { useCallback, useEffect, useRef } from 'react'
import { InsightHighlight } from '@/components/InsightHighlight'
import { RecentExpenses } from '@/components/RecentExpenses'
import { BentoQuickAccess } from '@/components/editorial/BentoQuickAccess'
import { EditorialStage } from '@/components/editorial/EditorialStage'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { SectionLabel } from '@/components/craft/SectionLabel'
import type { SaveExpenseResult, SheetIntent } from '@/components/ExpenseSheet'
import { useExpenseView } from '@/hooks/useExpenseView'
import { useTabScroll } from '@/components/editorial/AppBrandmarkDock'
import type { EditableExpense } from '@/lib/expenseTypes'

interface HomeScreenProps {
  pulseKey: number
  onOpenSheet: (intent: SheetIntent) => void
  onOpenStats: () => void
  onSaved: (result: SaveExpenseResult) => void
  onEditExpense: (expense: EditableExpense) => void
  onPendingRemoved: () => void
}

export function HomeScreen({
  pulseKey,
  onOpenSheet,
  onOpenStats,
  onSaved,
  onEditExpense,
  onPendingRemoved,
}: HomeScreenProps) {
  const { view } = useExpenseView()
  const { reportScroll } = useTabScroll()
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollYRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const y = el.scrollTop
      if (Math.abs(y - scrollYRef.current) < 2) return
      scrollYRef.current = y
      reportScroll('home', y)
      el.style.setProperty('--hero-scroll', String(y))
      el.dataset.scrolled = y > 48 ? 'true' : 'false'
      el.dataset.compact = y > 100 ? 'true' : 'false'
    })
  }, [reportScroll])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    reportScroll('home', el.scrollTop)
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [handleScroll, reportScroll])

  return (
    <div
      ref={scrollRef}
      className="tab-scroll home-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none"
    >
      <EditorialStage view={view} pulseKey={pulseKey} />

      <div className="tab-content px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] space-y-7">
        <MotionReveal step={4}>
          <InsightHighlight
            view={view}
            pulseKey={pulseKey}
            onOpenStats={onOpenStats}
          />
        </MotionReveal>

        <section>
          <MotionReveal step={5}>
            <SectionLabel overPhoto>Acceso rápido</SectionLabel>
          </MotionReveal>
          <BentoQuickAccess
            view={view}
            onOpenSheet={onOpenSheet}
            onSaved={onSaved}
          />
        </section>

        <section>
          <MotionReveal step={6}>
            <SectionLabel overPhoto className="mb-2">
              Recientes
            </SectionLabel>
          </MotionReveal>
          <MotionReveal step={7}>
            <RecentExpenses
              view={view}
              onEdit={onEditExpense}
              onPendingRemoved={onPendingRemoved}
            />
          </MotionReveal>
        </section>
      </div>
    </div>
  )
}
