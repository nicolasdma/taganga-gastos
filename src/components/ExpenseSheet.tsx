import { useState } from 'react'
import { AmountKeypad } from '@/components/AmountKeypad'
import { BottomSheet } from '@/components/BottomSheet'
import { ItemPicker, type SelectedItem } from '@/components/ItemPicker'
import { useExpenseSave, type SaveExpenseResult } from '@/hooks/useExpenseSave'
import { useExpenseView } from '@/hooks/useExpenseView'
import type { ExpenseScope } from '@/lib/expenseScope'

export type SheetIntent =
  | { type: 'add' }
  | {
      type: 'quick'
      itemId: string
      itemEmoji: string
      itemLabel: string
    }

type Step = 'item' | 'amount'

interface ExpenseSheetProps {
  intent: SheetIntent | null
  onClose: () => void
  onSaved: (result: SaveExpenseResult) => void
}

function intentKey(intent: SheetIntent): string {
  if (intent.type === 'quick') {
    return `quick:${intent.itemId}`
  }
  return intent.type
}

function resolveInitialState(intent: SheetIntent): {
  step: Step
  selectedItem: SelectedItem | null
} {
  if (intent.type === 'quick') {
    return {
      step: 'amount',
      selectedItem: {
        itemId: intent.itemId,
        itemEmoji: intent.itemEmoji,
        itemLabel: intent.itemLabel,
      },
    }
  }

  return { step: 'item', selectedItem: null }
}

interface ExpenseSheetContentProps {
  intent: SheetIntent
  onClose: () => void
  onSaved: (result: SaveExpenseResult) => void
}

function ExpenseSheetContent({ intent, onClose, onSaved }: ExpenseSheetContentProps) {
  const initial = resolveInitialState(intent)
  const { saveExpense } = useExpenseSave(onSaved)
  const { view } = useExpenseView()

  const [step, setStep] = useState<Step>(initial.step)
  const [amount, setAmount] = useState(0)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(initial.selectedItem)
  const [itemDetail, setItemDetail] = useState('')
  const [scope, setScope] = useState<ExpenseScope>(view)
  const [saving, setSaving] = useState(false)

  const close = () => {
    onClose()
  }

  const resolvedItem = selectedItem

  const saveWithItem = async (
    item: SelectedItem,
    expenseAmount: number,
    detail?: string
  ) => {
    setSaving(true)
    await saveExpense({
      amount: expenseAmount,
      itemId: item.itemId,
      itemEmoji: item.itemEmoji,
      itemLabel: item.itemLabel,
      note: detail?.trim() || undefined,
      scope,
    })
    setSaving(false)
    close()
  }

  const handleQuickPreset = async (preset: number) => {
    if (!resolvedItem) return
    await saveWithItem(resolvedItem, preset, itemDetail)
  }

  const handleSave = async () => {
    if (amount <= 0 || !resolvedItem) return
    await saveWithItem(resolvedItem, amount, itemDetail)
  }

  const handleItemSelect = (item: SelectedItem) => {
    setSelectedItem(item)
    setItemDetail('')
    setAmount(0)
    setStep('amount')
  }

  if (step === 'item') {
    return <ItemPicker onSelect={handleItemSelect} />
  }

  const isQuick = intent.type === 'quick'

  return (
    <AmountKeypad
      itemHeader={
        resolvedItem
          ? {
              emoji: resolvedItem.itemEmoji,
              catalogLabel: resolvedItem.itemLabel,
              detail: itemDetail,
              onDetailChange: setItemDetail,
            }
          : undefined
      }
      value={amount}
      onChange={setAmount}
      onSave={handleSave}
      onCancel={close}
      onBack={() => setStep('item')}
      saving={saving}
      autoSaveOnPreset={isQuick}
      onPresetSelect={isQuick ? handleQuickPreset : undefined}
      primaryLabel="Guardar"
      scope={scope}
      onScopeChange={setScope}
    />
  )
}

export function ExpenseSheet({ intent, onClose, onSaved }: ExpenseSheetProps) {
  const open = intent !== null

  return (
    <BottomSheet open={open} onClose={onClose}>
      {intent && (
        <ExpenseSheetContent
          key={intentKey(intent)}
          intent={intent}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </BottomSheet>
  )
}
