import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { AmountKeypad } from '@/components/AmountKeypad'
import { BottomSheet } from '@/components/BottomSheet'
import { CategoryPicker } from '@/components/CategoryPicker'
import { getCategory } from '@/lib/categories'
import { excludedNoticeClass, excludedRowClass } from '@/lib/expenseExcluded'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import type { EditableExpense } from '@/lib/expenseTypes'
import { hapticSave } from '@/lib/haptics'
import { pushRecentCategory } from '@/lib/preferences'
import { cn } from '@/lib/utils'

interface ExpenseEditSheetProps {
  expense: EditableExpense | null
  onClose: () => void
  onUpdated: () => void
}

type Step = 'edit' | 'category'

function normalizeFields(expense: EditableExpense, amount: number, categoryId: string) {
  const sameCategory = categoryId === expense.categoryId
  const isSuper = categoryId === 'supermarket'

  return {
    amount,
    categoryId,
    itemId: sameCategory ? expense.itemId : undefined,
    itemEmoji: sameCategory ? expense.itemEmoji : undefined,
    itemLabel: sameCategory ? expense.itemLabel : undefined,
    sessionId: sameCategory && isSuper ? expense.sessionId : undefined,
    store: sameCategory && isSuper ? expense.store : undefined,
    note: expense.note,
  }
}

interface ExpenseEditContentProps {
  expense: EditableExpense
  onClose: () => void
  onUpdated: () => void
}

function ExpenseEditContent({ expense, onClose, onUpdated }: ExpenseEditContentProps) {
  const updateExpense = useMutation(api.expenses.updateExpense)
  const setExpenseExcluded = useMutation(api.expenses.setExpenseExcluded)

  const [step, setStep] = useState<Step>('edit')
  const [amount, setAmount] = useState(expense.amount)
  const [categoryId, setCategoryId] = useState(expense.categoryId)
  const [excluded, setExcluded] = useState(expense.excluded === true)
  const [saving, setSaving] = useState(false)

  const display = formatExpenseLabel(expense)
  const category = getCategory(categoryId)

  const handleSave = async () => {
    if (amount <= 0) return
    setSaving(true)
    await updateExpense({
      id: expense._id,
      ...normalizeFields(expense, amount, categoryId),
    })
    if (excluded !== (expense.excluded === true)) {
      await setExpenseExcluded({ id: expense._id, excluded })
    }
    pushRecentCategory(categoryId)
    hapticSave()
    setSaving(false)
    onUpdated()
    onClose()
  }

  const toggleExcluded = async () => {
    const next = !excluded
    setSaving(true)
    await setExpenseExcluded({ id: expense._id, excluded: next })
    setExcluded(next)
    hapticSave()
    setSaving(false)
    onUpdated()
    if (next) onClose()
  }

  if (step === 'category') {
    return (
      <CategoryPicker
        showDetail={false}
        hideDetailToggle
        onToggleDetail={() => {}}
        onSelect={(catId) => {
          setCategoryId(catId)
          setStep('edit')
        }}
      />
    )
  }

  return (
    <div className="pb-2">
      {excluded && (
        <p className={cn('mb-3', excludedNoticeClass())}>
          No cuenta en totales · sigue en el historial
        </p>
      )}

      <button
        type="button"
        onClick={() => setStep('category')}
        className={cn(
          'w-full mb-4 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5',
          'border text-left active:opacity-80',
          excludedRowClass(excluded) || 'bg-muted/40 border-border/60 active:bg-muted/60'
        )}
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Categoría
        </span>
        <span className="text-sm font-bold">
          {category ? `${category.emoji} ${category.label}` : categoryId}
        </span>
      </button>

      <AmountKeypad
        title={`${display.emoji} ${display.label}`}
        subtitle={excluded ? 'Editar · no cuenta' : 'Editar monto'}
        value={amount}
        onChange={setAmount}
        onSave={handleSave}
        onCancel={onClose}
        saving={saving}
        primaryLabel="Guardar"
      />

      <button
        type="button"
        onClick={toggleExcluded}
        disabled={saving}
        className={cn(
          'w-full mt-3 py-3 text-sm font-bold rounded-2xl border-2 transition-all',
          excluded
            ? 'text-emerald-700 border-emerald-500/30 bg-emerald-500/10'
            : 'text-red-600/90 border-red-500/20 bg-red-500/[0.06] active:bg-red-500/10'
        )}
      >
        {excluded ? 'Volver a contar' : 'No contar en totales'}
      </button>
    </div>
  )
}

export function ExpenseEditSheet({ expense, onClose, onUpdated }: ExpenseEditSheetProps) {
  return (
    <BottomSheet open={expense !== null} onClose={onClose}>
      {expense && (
        <ExpenseEditContent
          key={`${expense._id}:${expense.excluded}`}
          expense={expense}
          onClose={onClose}
          onUpdated={onUpdated}
        />
      )}
    </BottomSheet>
  )
}
