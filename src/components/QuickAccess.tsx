import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ExpenseChip } from '@/components/ExpenseChip'
import { formatCOP } from '@/lib/currency'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import { buildRecentQuickButtons } from '@/lib/quickButtons'
import { useExpenseSave } from '@/hooks/useExpenseSave'
import { useFrequentQuickItems } from '@/hooks/useFrequentQuickItems'
import { useExpenseView } from '@/hooks/useExpenseView'
import type { SheetIntent } from '@/components/ExpenseSheet'
import { cn } from '@/lib/utils'

interface QuickAccessProps {
  onOpenSheet: (intent: SheetIntent) => void
  onSaved: (result: import('@/hooks/useExpenseSave').SaveExpenseResult) => void
}

const QUICK_GRID = 'grid-cols-4'

function ActionRow({
  emoji,
  title,
  subtitle,
  amount,
  variant,
  onClick,
}: {
  emoji: string
  title: string
  subtitle?: string
  amount?: string
  variant: 'coral' | 'emerald'
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left',
        'active:translate-y-0.5 active:shadow-none transition-all',
        variant === 'coral' ? 'action-coral' : 'action-emerald'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xl shrink-0">{emoji}</span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground truncate font-medium">{subtitle}</p>
          )}
        </div>
      </div>
      {amount && (
        <span className="text-sm font-extrabold font-tabular text-ink shrink-0">{amount}</span>
      )}
    </button>
  )
}

export function QuickAccess({ onOpenSheet, onSaved }: QuickAccessProps) {
  const { view } = useExpenseView()
  const recent = useQuery(api.expenses.recentExpenses, { limit: 1, view })
  const frequentQuickItems = useFrequentQuickItems(view, 3)
  const { saveExpense } = useExpenseSave(onSaved)

  const lastExpense = recent?.[0]
  const lastDisplay = lastExpense ? formatExpenseLabel(lastExpense) : null
  const quickButtons =
    frequentQuickItems === undefined ? undefined : buildRecentQuickButtons(frequentQuickItems)

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
    <div className="space-y-3">
      {lastExpense && lastDisplay && (
        <ActionRow
          emoji={lastDisplay.emoji}
          title="Repetir"
          subtitle={lastDisplay.label}
          amount={formatCOP(lastExpense.amount)}
          variant="coral"
          onClick={handleRepeat}
        />
      )}

      <ActionRow
        emoji="✏️"
        title="Agregar ítem"
        subtitle="Elegí del catálogo"
        variant="emerald"
        onClick={() => onOpenSheet({ type: 'add' })}
      />

      <div className={cn('grid gap-2.5', QUICK_GRID)}>
        {quickButtons === undefined
          ? [1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
            ))
          : quickButtons.map((btn, i) => (
              <ExpenseChip
                key={btn.key}
                emoji={btn.emoji}
                label={btn.label}
                tiltIndex={i}
                onClick={() => onOpenSheet(btn.intent)}
              />
            ))}
        <ExpenseChip
          emoji="⋯"
          label="Más"
          tiltIndex={quickButtons?.length ?? 3}
          onClick={() => onOpenSheet({ type: 'add' })}
        />
      </div>
    </div>
  )
}
