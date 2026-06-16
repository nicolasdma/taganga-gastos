import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { AmountKeypad } from '@/components/AmountKeypad'
import { BottomSheet } from '@/components/BottomSheet'
import { CreateCustomItemForm } from '@/components/CreateCustomItemSheet'
import {
  ItemPicker,
  itemPickerSubtitle,
  itemPickerTitle,
  type SelectedItem,
} from '@/components/ItemPicker'
import { excludedNoticeClass, excludedRowClass } from '@/lib/expenseExcluded'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import type { EditableExpense } from '@/lib/expenseTypes'

export type { EditableExpense }
import { hapticSave } from '@/lib/haptics'
import { pushRecentItem } from '@/lib/preferences'
import { cn } from '@/lib/utils'

interface ExpenseEditSheetProps {
  expense: EditableExpense | null
  onClose: () => void
  onUpdated: () => void
}

type Step = 'edit' | 'item' | 'create-item'

interface ExpenseEditContentProps {
  expense: EditableExpense
  step: Step
  createQuery: string
  onClose: () => void
  onUpdated: () => void
  onStepChange: (step: Step) => void
  onRequestCreate: (query: string) => void
}

function ExpenseEditContent({
  expense,
  step,
  createQuery,
  onClose,
  onUpdated,
  onStepChange,
  onRequestCreate,
}: ExpenseEditContentProps) {
  const updateExpense = useMutation(api.expenses.updateExpense)
  const setExpenseExcluded = useMutation(api.expenses.setExpenseExcluded)

  const [amount, setAmount] = useState(expense.amount)
  const [selectedItem, setSelectedItem] = useState<SelectedItem>({
    itemId: expense.itemId ?? 'other',
    itemEmoji: expense.itemEmoji ?? '💸',
    itemLabel: expense.itemLabel ?? 'Gasto',
  })
  const [excluded, setExcluded] = useState(expense.excluded === true)
  const [saving, setSaving] = useState(false)

  const display = formatExpenseLabel({ ...expense, ...selectedItem })

  const handleSave = async () => {
    if (amount <= 0) return
    setSaving(true)
    await updateExpense({
      id: expense._id,
      amount,
      itemId: selectedItem.itemId,
      itemEmoji: selectedItem.itemEmoji,
      itemLabel: selectedItem.itemLabel,
      sessionId: expense.sessionId,
      store: expense.store,
      note: expense.note,
    })
    if (excluded !== (expense.excluded === true)) {
      await setExpenseExcluded({ id: expense._id, excluded })
    }
    pushRecentItem(selectedItem.itemId)
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

  if (step === 'item') {
    return (
      <ItemPicker
        onSelect={(item) => {
          setSelectedItem(item)
          onStepChange('edit')
        }}
        onRequestCreate={onRequestCreate}
      />
    )
  }

  if (step === 'create-item') {
    return (
      <CreateCustomItemForm
        initialLabel={createQuery}
        onCreated={(item) => {
          setSelectedItem(item)
          onStepChange('edit')
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
        onClick={() => onStepChange('item')}
        className={cn(
          'w-full mb-4 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5',
          'border text-left active:opacity-80',
          excludedRowClass(excluded) || 'bg-muted/40 border-border/60 active:bg-muted/60'
        )}
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Ítem
        </span>
        <span className="text-sm font-bold">
          {display.emoji} {display.label}
        </span>
      </button>

      <AmountKeypad
        hideNav
        value={amount}
        onChange={setAmount}
        onSave={handleSave}
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
  const [step, setStep] = useState<Step>('edit')
  const [createQuery, setCreateQuery] = useState('')

  useEffect(() => {
    if (expense) {
      setStep('edit')
      setCreateQuery('')
    }
  }, [expense?._id])

  const handleBack = () => {
    if (step === 'item' || step === 'create-item') {
      setStep('edit')
      return
    }
    onClose()
  }

  const sheetTitle = (() => {
    if (step === 'item') return itemPickerTitle()
    if (step === 'create-item') return '✏️ Nuevo ítem'
    if (expense) {
      const display = formatExpenseLabel(expense)
      return `${display.emoji} ${display.label}`
    }
    return 'Editar gasto'
  })()

  const sheetSubtitle = (() => {
    if (step === 'item') return itemPickerSubtitle()
    if (step === 'create-item') return undefined
    if (expense?.excluded) return 'Editar · no cuenta en totales'
    return 'Editar monto'
  })()

  const headerAction = step === 'edit' ? 'cancel' : 'back'

  return (
    <BottomSheet
      open={expense !== null}
      onClose={onClose}
      height="standard"
      title={sheetTitle}
      subtitle={sheetSubtitle}
      headerAction={headerAction}
      onBack={handleBack}
      scrollKey={step}
    >
      {expense && (
        <ExpenseEditContent
          key={`${expense._id}:${expense.excluded}`}
          expense={expense}
          step={step}
          createQuery={createQuery}
          onClose={onClose}
          onUpdated={onUpdated}
          onStepChange={setStep}
          onRequestCreate={(query) => {
            setCreateQuery(query)
            setStep('create-item')
          }}
        />
      )}
    </BottomSheet>
  )
}
