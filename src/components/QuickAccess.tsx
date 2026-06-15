import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ExpenseChip } from '@/components/ExpenseChip'
import { formatCOP } from '@/lib/currency'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import { buildCategoryQuickButtons } from '@/lib/quickButtons'
import { useExpenseSave } from '@/hooks/useExpenseSave'
import type { SheetIntent } from '@/components/ExpenseSheet'
import { cn } from '@/lib/utils'

interface QuickAccessProps {
  onOpenSheet: (intent: SheetIntent) => void
  onSaved: (result: import('@/hooks/useExpenseSave').SaveExpenseResult) => void
}

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
  const recent = useQuery(api.expenses.recentExpenses, { limit: 1 })
  const { saveExpense } = useExpenseSave(onSaved)

  const lastExpense = recent?.[0]
  const lastDisplay = lastExpense ? formatExpenseLabel(lastExpense) : null
  const quickButtons = buildCategoryQuickButtons()

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
        emoji="🛒"
        title="Supermercado"
        subtitle="Huevos, leche, pan…"
        variant="emerald"
        onClick={() => onOpenSheet({ type: 'supermarket' })}
      />

      <div className="grid grid-cols-3 gap-2.5">
        {quickButtons.map((btn, i) => (
          <ExpenseChip
            key={btn.key}
            emoji={btn.emoji}
            label={btn.label}
            tiltIndex={i}
            onClick={() => onOpenSheet(btn.intent)}
          />
        ))}
      </div>
    </div>
  )
}
