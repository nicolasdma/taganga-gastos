import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { MotionReveal } from '@/components/editorial/MotionReveal'
import { formatCOP } from '@/lib/currency'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import { FOOD_CATALOG } from '@/lib/foodCatalog'
import { buildQuickButtons } from '@/lib/quickButtons'
import { useExpenseSave } from '@/hooks/useExpenseSave'
import type { SheetIntent } from '@/components/ExpenseSheet'
import { cn } from '@/lib/utils'

interface BentoQuickAccessProps {
  onOpenSheet: (intent: SheetIntent) => void
  onSaved: (result: import('@/hooks/useExpenseSave').SaveExpenseResult) => void
}

const QUICK_VISIBLE = 3

export function BentoQuickAccess({ onOpenSheet, onSaved }: BentoQuickAccessProps) {
  const frequent = useQuery(api.expenses.frequentItems, {
    excludeCategoryId: 'supermarket',
    limit: 6,
  })
  const recent = useQuery(api.expenses.recentExpenses, { limit: 1 })
  const { saveExpense } = useExpenseSave(onSaved)

  const lastExpense = recent?.[0]
  const lastDisplay = lastExpense ? formatExpenseLabel(lastExpense) : null
  const quickButtons = buildQuickButtons(frequent, QUICK_VISIBLE)

  const handleRepeat = async () => {
    if (!lastExpense) return
    await saveExpense({
      amount: lastExpense.amount,
      categoryId: lastExpense.categoryId,
      itemId: lastExpense.itemId,
      itemEmoji: lastExpense.itemEmoji,
      itemLabel: lastExpense.itemLabel,
      store: lastExpense.store,
    })
  }

  return (
    <div className="bento-quick grid gap-2.5">
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
          onClick={() => onOpenSheet({ type: 'supermarket' })}
          className={cn(
            'bento-tile bento-tile--sage bento-tile--wide p-4 text-left',
            'active:translate-y-1 active:shadow-none transition-transform tilt-chip-1'
          )}
        >
          <p className="bento-label">Supermercado</p>
          <p className="text-2xl mt-1">🛒</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            pescado · refresco · huevos · {FOOD_CATALOG.length} ítems
          </p>
        </button>
      </MotionReveal>

      <div className="grid grid-cols-4 gap-2.5">
        {quickButtons.map((btn, i) => (
          <MotionReveal key={btn.key} step={Math.min(8, 6 + i)}>
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
        ))}

        <MotionReveal step={8}>
          <button
            type="button"
            onClick={() => onOpenSheet({ type: 'supermarket' })}
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
  )
}
