import type { ExpenseScope } from '@/lib/expenseScope'
import { cn } from '@/lib/utils'

interface ExpenseScopeToggleProps {
  value: ExpenseScope
  onChange: (value: ExpenseScope) => void
  className?: string
}

export function ExpenseScopeToggle({ value, onChange, className }: ExpenseScopeToggleProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      <button
        type="button"
        onClick={() => onChange('shared')}
        className={cn(
          'h-11 rounded-xl text-sm font-bold transition-all active:translate-y-px',
          value === 'shared' ? 'btn-cobalt active:shadow-none' : 'chip-tile'
        )}
      >
        👫 Compartido
      </button>
      <button
        type="button"
        onClick={() => onChange('personal')}
        className={cn(
          'h-11 rounded-xl text-sm font-bold transition-all active:translate-y-px',
          value === 'personal' ? 'btn-cobalt active:shadow-none' : 'chip-tile'
        )}
      >
        👤 Personal
      </button>
    </div>
  )
}

interface ExpenseViewFilterProps {
  value: ExpenseScope
  onChange: (value: ExpenseScope) => void
  className?: string
}

export function ExpenseViewFilter({ value, onChange, className }: ExpenseViewFilterProps) {
  return (
    <div className={cn('inline-flex rounded-2xl p-1 chip-tile', className)}>
      <button
        type="button"
        onClick={() => onChange('shared')}
        className={cn(
          'rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
          value === 'shared' ? 'bg-white shadow-sm text-ink' : 'text-muted-foreground'
        )}
      >
        Nosotros
      </button>
      <button
        type="button"
        onClick={() => onChange('personal')}
        className={cn(
          'rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
          value === 'personal' ? 'bg-white shadow-sm text-ink' : 'text-muted-foreground'
        )}
      >
        Míos
      </button>
    </div>
  )
}
