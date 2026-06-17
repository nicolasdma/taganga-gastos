import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { CraftLoading } from '@/components/craft/CraftLoading'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { CreateCustomItemSheet } from '@/components/CreateCustomItemSheet'
import { formatCOP } from '@/lib/currency'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
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
      <div className={cn('quick-actions-panel', dimStale && 'expense-view-stale')}>
        <div className="quick-actions-panel__header">
          <p className="quick-actions-panel__title">
            <span aria-hidden>🐾</span>
            Agregar rápido
          </p>
          <button
            type="button"
            onClick={() => setCreateItemOpen(true)}
            className="quick-actions-panel__custom-link"
          >
            Nuevo ítem
          </button>
        </div>

        {lastExpense && lastDisplay && (
          <MotionReveal step={4}>
            <button
              type="button"
              onClick={handleRepeat}
              aria-label={`Repetir ${lastDisplay.label} por ${formatCOP(lastExpense.amount)}`}
              className={cn(
                'quick-action-card quick-action-card--repeat quick-action-card--wide text-left',
                'active:translate-y-1 active:shadow-none transition-transform'
              )}
            >
              <span className="quick-action-card__emoji" aria-hidden>
                {lastDisplay.emoji}
              </span>
              <span className="quick-action-card__body">
                <span className="quick-action-card__label">Repetir</span>
                <span className="quick-action-card__title">{lastDisplay.label}</span>
              </span>
              <span className="quick-action-card__amount">{formatCOP(lastExpense.amount)}</span>
            </button>
          </MotionReveal>
        )}

        <div className="quick-actions-panel__grid">
          {showQuickSkeleton ? (
            <CraftLoading variant="skeleton-tile" count={3} />
          ) : (
            quickButtons?.slice(0, 3).map((btn, i) => (
                <MotionReveal key={btn.key} step={Math.min(7, 6 + i)} className="quick-action-cell">
                  <button
                    type="button"
                    onClick={() => onOpenSheet(btn.intent)}
                    aria-label={`Agregar ${btn.label}`}
                    className={cn(
                      'quick-action-card quick-action-card--item',
                      'active:translate-y-1 active:shadow-none transition-transform'
                    )}
                  >
                    <span className="quick-action-card__emoji" aria-hidden>
                      {btn.emoji}
                    </span>
                    <span className="quick-action-card__title">{btn.label}</span>
                  </button>
                </MotionReveal>
              ))
            )}

          <MotionReveal step={8} className="quick-action-cell">
            <button
              type="button"
              onClick={() => onOpenSheet({ type: 'add' })}
              aria-label="Agregar otro gasto"
              className={cn(
                'quick-action-card quick-action-card--other',
                'active:translate-y-1 active:shadow-none transition-transform'
              )}
            >
              <span className="quick-action-card__plus" aria-hidden>
                +
              </span>
              <span className="quick-action-card__title">Otro</span>
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
