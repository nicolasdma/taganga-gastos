import { useState } from 'react'
import { AmountKeypad } from '@/components/AmountKeypad'
import { BottomSheet } from '@/components/BottomSheet'
import { ItemPicker, type SelectedItem } from '@/components/ItemPicker'
import { getCategory } from '@/lib/categories'
import { useExpenseSave, type SaveExpenseResult } from '@/hooks/useExpenseSave'

export type SheetIntent =
  | { type: 'supermarket' }
  | {
      type: 'quick'
      categoryId: string
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
    return `quick:${intent.categoryId}:${intent.itemId}`
  }
  return intent.type
}

function resolveInitialState(intent: SheetIntent): {
  step: Step
  categoryId: string
  selectedItem: SelectedItem | null
} {
  if (intent.type === 'quick') {
    return {
      step: 'amount',
      categoryId: intent.categoryId,
      selectedItem: {
        itemId: intent.itemId,
        itemEmoji: intent.itemEmoji,
        itemLabel: intent.itemLabel,
      },
    }
  }

  return { step: 'item', categoryId: 'supermarket', selectedItem: null }
}

interface ExpenseSheetContentProps {
  intent: SheetIntent
  onClose: () => void
  onSaved: (result: SaveExpenseResult) => void
}

function ExpenseSheetContent({ intent, onClose, onSaved }: ExpenseSheetContentProps) {
  const initial = resolveInitialState(intent)
  const { saveExpense } = useExpenseSave(onSaved)

  const [step, setStep] = useState<Step>(initial.step)
  const [amount, setAmount] = useState(0)
  const [categoryId] = useState(initial.categoryId)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(initial.selectedItem)
  const [itemDetail, setItemDetail] = useState('')
  const [saving, setSaving] = useState(false)

  const close = () => {
    onClose()
  }

  const resolvedItem = selectedItem
  const category = getCategory(categoryId)

  const saveWithItem = async (
    item: SelectedItem,
    expenseAmount: number,
    detail?: string
  ) => {
    setSaving(true)
    await saveExpense({
      amount: expenseAmount,
      categoryId,
      itemId: item.itemId,
      itemEmoji: item.itemEmoji,
      itemLabel: item.itemLabel,
      note: detail?.trim() || undefined,
    })
    setSaving(false)
    close()
  }

  const handleQuickPreset = async (preset: number) => {
    if (!resolvedItem) return
    await saveWithItem(resolvedItem, preset, itemDetail)
  }

  const handleSave = async () => {
    if (!resolvedItem || amount <= 0) return
    await saveWithItem(resolvedItem, amount, itemDetail)
  }

  const handleItemSelect = (item: SelectedItem) => {
    setSelectedItem(item)
    setItemDetail('')
    setAmount(0)
    setStep('amount')
  }

  if (step === 'item' && category) {
    return (
      <ItemPicker
        categoryId={categoryId}
        categoryEmoji={category.emoji}
        categoryLabel={category.label}
        onSelect={handleItemSelect}
      />
    )
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
      onBack={intent.type === 'supermarket' ? () => setStep('item') : undefined}
      saving={saving}
      autoSaveOnPreset={isQuick}
      onPresetSelect={isQuick ? handleQuickPreset : undefined}
      primaryLabel="Guardar"
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
