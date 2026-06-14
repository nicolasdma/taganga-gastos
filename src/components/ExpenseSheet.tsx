import { useState } from 'react'
import { AmountKeypad } from '@/components/AmountKeypad'
import { BottomSheet } from '@/components/BottomSheet'
import { CategoryPicker } from '@/components/CategoryPicker'
import { ItemPicker, type SelectedItem } from '@/components/ItemPicker'
import { getCategory } from '@/lib/categories'
import { useExpenseSave, type SaveExpenseResult } from '@/hooks/useExpenseSave'

export type SheetIntent =
  | { type: 'fab' }
  | { type: 'supermarket' }
  | {
      type: 'quick'
      categoryId: string
      itemId: string
      itemEmoji: string
      itemLabel: string
    }

type Step = 'amount' | 'category' | 'item'

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
  categoryId: string | null
  selectedItem: SelectedItem | null
} {
  if (intent.type === 'supermarket') {
    return { step: 'item', categoryId: 'supermarket', selectedItem: null }
  }

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

  return { step: 'amount', categoryId: null, selectedItem: null }
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
  const [categoryId, setCategoryId] = useState<string | null>(initial.categoryId)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(initial.selectedItem)
  const [showDetail, setShowDetail] = useState(false)
  const [saving, setSaving] = useState(false)

  const close = () => {
    onClose()
  }

  const handleQuickPreset = async (preset: number) => {
    if (intent.type !== 'quick') return
    setSaving(true)
    await saveExpense({
      amount: preset,
      categoryId: intent.categoryId,
      itemId: intent.itemId,
      itemEmoji: intent.itemEmoji,
      itemLabel: intent.itemLabel,
    })
    setSaving(false)
    close()
  }

  const handleQuickSave = async () => {
    if (intent.type !== 'quick' || amount <= 0) return
    setSaving(true)
    await saveExpense({
      amount,
      categoryId: intent.categoryId,
      itemId: intent.itemId,
      itemEmoji: intent.itemEmoji,
      itemLabel: intent.itemLabel,
    })
    setSaving(false)
    close()
  }

  const handleFabContinue = () => {
    if (amount > 0) setStep('category')
  }

  const handleCategorySelect = async (catId: string) => {
    setCategoryId(catId)

    if (showDetail) {
      setStep('item')
      return
    }

    setSaving(true)
    await saveExpense({ amount, categoryId: catId })
    setSaving(false)
    close()
  }

  const handleItemSelect = async (item: SelectedItem) => {
    if (categoryId === 'supermarket' || intent.type === 'supermarket') {
      setSelectedItem(item)
      setAmount(0)
      setStep('amount')
      return
    }

    if (intent.type === 'fab') {
      setSaving(true)
      await saveExpense({
        amount,
        categoryId: categoryId!,
        itemId: item.itemId,
        itemEmoji: item.itemEmoji,
        itemLabel: item.itemLabel,
      })
      setSaving(false)
      close()
    }
  }

  const handleItemAmountSave = async () => {
    if (!selectedItem || amount <= 0 || !categoryId) return
    setSaving(true)
    await saveExpense({
      amount,
      categoryId,
      itemId: selectedItem.itemId,
      itemEmoji: selectedItem.itemEmoji,
      itemLabel: selectedItem.itemLabel,
    })
    setSaving(false)
    close()
  }

  const category = categoryId ? getCategory(categoryId) : null

  if (step === 'category' && intent.type === 'fab') {
    return (
      <CategoryPicker
        showDetail={showDetail}
        onToggleDetail={() => setShowDetail((v) => !v)}
        onSelect={handleCategorySelect}
      />
    )
  }

  if (step === 'item' && categoryId && category) {
    return (
      <ItemPicker
        categoryId={categoryId}
        categoryEmoji={category.emoji}
        categoryLabel={category.label}
        onSelect={handleItemSelect}
      />
    )
  }

  const title =
    selectedItem
      ? `${selectedItem.itemEmoji} ${selectedItem.itemLabel}`
      : intent.type === 'fab'
        ? 'Nuevo gasto'
        : 'Monto'

  const subtitle =
    category && selectedItem
      ? `${category.emoji} ${category.label}`
      : category
        ? category.label
        : undefined

  const isQuick = intent.type === 'quick'
  const isItemAmount =
    selectedItem &&
    step === 'amount' &&
    categoryId !== null &&
    (categoryId === 'supermarket' || intent.type === 'supermarket')

  return (
    <AmountKeypad
      title={title}
      subtitle={subtitle}
      value={amount}
      onChange={setAmount}
      onSave={
        isItemAmount
          ? handleItemAmountSave
          : isQuick
            ? handleQuickSave
            : intent.type === 'fab'
              ? handleFabContinue
              : () => {}
      }
      onCancel={close}
      saving={saving}
      autoSaveOnPreset={isQuick}
      onPresetSelect={isQuick ? handleQuickPreset : undefined}
      primaryAction={intent.type === 'fab' && !isItemAmount ? 'continue' : 'save'}
      primaryLabel={
        isItemAmount ? 'Guardar' : intent.type === 'fab' ? 'Siguiente' : undefined
      }
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
