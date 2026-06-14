import { useCallback, useRef } from 'react'
import { InsightHighlight } from '@/components/InsightHighlight'
import { RecentExpenses } from '@/components/RecentExpenses'
import { BentoQuickAccess } from '@/components/editorial/BentoQuickAccess'
import { EditorialStage } from '@/components/editorial/EditorialStage'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { SectionLabel } from '@/components/craft/SectionLabel'
import type { SheetIntent } from '@/components/ExpenseSheet'
import type { SaveExpenseResult } from '@/hooks/useExpenseSave'

import type { EditableExpense } from '@/lib/expenseTypes'

interface HomeScreenProps {
  pulseKey: number
  pendingCount: number
  onOpenSheet: (intent: SheetIntent) => void
  onOpenStats: () => void
  onSaved: (result: SaveExpenseResult) => void
  onEditExpense: (expense: EditableExpense) => void
  onPendingRemoved: () => void
}

export function HomeScreen({
  pulseKey,
  pendingCount,
  onOpenSheet,
  onOpenStats,
  onSaved,
  onEditExpense,
  onPendingRemoved,
}: HomeScreenProps) {
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
      el.style.setProperty('--hero-scroll', String(y))
      el.dataset.scrolled = y > 48 ? 'true' : 'false'
      el.dataset.compact = y > 100 ? 'true' : 'false'
    })
  }, [])

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="tab-scroll home-scroll h-full min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none"
    >
      <EditorialStage pulseKey={pulseKey} pendingCount={pendingCount} />

      <div className="tab-content px-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] space-y-7">
        <MotionReveal step={4}>
          <InsightHighlight pulseKey={pulseKey} onOpenStats={onOpenStats} />
        </MotionReveal>

        <section>
          <SectionLabel overPhoto>Acceso rápido</SectionLabel>
          <BentoQuickAccess onOpenSheet={onOpenSheet} onSaved={onSaved} />
        </section>

        <section>
          <SectionLabel overPhoto>Recientes</SectionLabel>
          <MotionReveal step={7}>
            <RecentExpenses onEdit={onEditExpense} onPendingRemoved={onPendingRemoved} />
          </MotionReveal>
        </section>
      </div>
    </div>
  )
}
