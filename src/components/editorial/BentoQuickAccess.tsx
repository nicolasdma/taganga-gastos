import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { CraftLoading } from '@/components/craft/CraftLoading'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { CreateCustomItemSheet } from '@/components/CreateCustomItemSheet'
import { formatCOP } from '@/lib/currency'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import { ITEM_CATALOG } from '@/lib/items'
import { buildRecentQuickButtons } from '@/lib/quickButtons'
import { useExpenseSave, type SaveExpenseResult } from '@/hooks/useExpenseSave'
import { useFrequentQuickItems } from '@/hooks/useFrequentQuickItems'
import { useStaleWhileLoading } from '@/hooks/useStaleWhileLoading'
import type { SheetIntent } from '@/components/ExpenseSheet'
import { cn } from '@/lib/utils'

import type { ExpenseView } from '@/lib/expenseScope'

import type { ExpenseViewPanelRole } from '@/components/editorial/expenseViewPanelRole'

interface BentoQuickAccessProps {
  view: ExpenseView
  panelRole?: ExpenseViewPanelRole
  onOpenSheet: (intent: SheetIntent) => void
  onSaved: (result: SaveExpenseResult) => void
}

export function BentoQuickAccess({
  view,
  panelRole = 'active',
  onOpenSheet,
  onSaved,
}: BentoQuickAccessProps) {
  const [createItemOpen, setCreateItemOpen] = useState(false)
  const recentLive = useQuery(api.expenses.recentExpenses, { limit: 1, view })
  const { value: recent, isStale: recentStale } = useStaleWhileLoading(recentLive, view)
  const frequentLive = useFrequentQuickItems(view, 3)
  const { value: frequentQuickItems, isStale: frequentStale, isInitialLoad: frequentInitial } =
    useStaleWhileLoading(frequentLive, view)
  const { saveExpense } = useExpenseSave(onSaved)

  const lastExpense = recent?.[0]
  const lastDisplay = lastExpense ? formatExpenseLabel(lastExpense) : null
  const quickButtons =
    frequentQuickItems === undefined ? undefined : buildRecentQuickButtons(frequentQuickItems)
  const showQuickSkeleton = frequentInitial && quickButtons === undefined
  const dimStale = (recentStale || frequentStale) && panelRole === 'incoming'

  const handleRepeat = async () => {
    if (!lastExpense?.itemId || !lastExpense.itemEmoji || !lastExpense.itemLabel) return
    await saveExpense({
      amount: lastExpense.amount,
      itemId: lastExpense.itemId,
      itemEmoji: lastExpense.itemEmoji,
      itemLabel: lastExpense.itemLabel,
      store: lastExpense.store,
    })
  }

  return (
    <>
      <div className={cn('bento-quick grid gap-2.5', dimStale && 'expense-view-stale')}>
      {lastExpense && lastDisplay && (
        <MotionReveal step={4}>
          <button
            type="button"
            onClick={handleRepeat}
            className={cn(
              'bento-tile bento-tile--coral bento-tile--wide p-4 text-left',
              'flex items-center justify-between gap-3',
              'active:translate-y-1 active:shadow-none transition-transform'
            )}
          >
            <div>
              <p className="bento-label">Repetir</p>
              <p className="text-base font-display font-bold text-ink mt-0.5">
                {lastDisplay.emoji} {lastDisplay.label}
              </p>
            </div>
            <span className="text-lg font-display font-bold font-tabular text-ink shrink-0">
              {formatCOP(lastExpense.amount)}
            </span>
          </button>
        </MotionReveal>
      )}

      <MotionReveal step={5}>
        <button
          type="button"
          onClick={() => setCreateItemOpen(true)}
          className={cn(
            'bento-tile bento-tile--sage bento-tile--wide p-4 text-left',
            'active:translate-y-1 active:shadow-none transition-transform tilt-chip-1'
          )}
        >
          <p className="bento-label">Agregar ítem</p>
          <p className="text-2xl mt-1">✏️</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            pescado · taxi · arriendo · {ITEM_CATALOG.length} ítems
          </p>
        </button>
      </MotionReveal>

      <div className="grid grid-cols-4 gap-2.5">
        {showQuickSkeleton ? (
          <CraftLoading variant="skeleton-tile" count={3} />
        ) : (
          quickButtons?.map((btn, i) => (
              <MotionReveal key={btn.key} step={Math.min(7, 6 + i)}>
                <button
                  type="button"
                  onClick={() => onOpenSheet(btn.intent)}
                  className={cn(
                    'bento-tile bento-tile--cream h-[76px] w-full',
                    'flex flex-col items-center justify-center gap-0.5',
                    'active:translate-y-1 active:shadow-none transition-transform',
                    `tilt-chip-${(i % 6) + 1}`
                  )}
                >
                  <span className="text-2xl">{btn.emoji}</span>
                  <span className="text-[10px] font-bold font-display text-foreground/75 truncate max-w-full px-1">
                    {btn.label}
                  </span>
                </button>
              </MotionReveal>
            ))
        )}

        <MotionReveal step={8}>
          <button
            type="button"
            onClick={() => onOpenSheet({ type: 'add' })}
            className={cn(
              'bento-tile bento-tile--cream h-[76px] w-full',
              'flex flex-col items-center justify-center gap-0.5',
              'active:translate-y-1 active:shadow-none transition-transform tilt-chip-3',
              'border-dashed border-2 border-stitch/60'
            )}
          >
            <span className="text-2xl font-display font-bold text-ink/60">⋯</span>
            <span className="text-[10px] font-bold font-display text-foreground/75">Más</span>
          </button>
        </MotionReveal>
      </div>
      </div>

      {/* Standalone sheet (not ExpenseSheet wizard): portal+elevated escapes bento
          stacking context and sits above FABs without nesting a second expense sheet. */}
      <CreateCustomItemSheet
        open={createItemOpen}
        onClose={() => setCreateItemOpen(false)}
        onCreated={(item) =>
          onOpenSheet({
            type: 'quick',
            itemId: item.itemId,
            itemEmoji: item.itemEmoji,
            itemLabel: item.itemLabel,
          })
        }
      />
    </>
  )
}
