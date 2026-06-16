import { useEffect, useMemo, useState } from 'react'
import { AmountKeypad } from '@/components/AmountKeypad'
import { BottomSheet } from '@/components/BottomSheet'
import { CreateCustomItemForm } from '@/components/CreateCustomItemSheet'
import {
  ItemPicker,
  itemPickerSubtitle,
  itemPickerTitle,
  type SelectedItem,
} from '@/components/ItemPicker'
import { ITEM_CATALOG } from '@/lib/items'
import { mergeCatalogWithCustom } from '@/lib/mergeCatalog'
import { useCustomItems } from '@/hooks/useCustomItems'
import { useExpenseSave, type SaveExpenseResult } from '@/hooks/useExpenseSave'
import { useExpenseView } from '@/hooks/useExpenseView'
import type { ExpenseScope } from '@/lib/expenseScope'
import type { CreatedCustomItem } from '@/hooks/useCreateCustomItem'

export type SheetIntent =
  | { type: 'add' }
  | {
      type: 'quick'
      itemId: string
      itemEmoji: string
      itemLabel: string
    }

type Step = 'item' | 'amount' | 'create-item'

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
  step: Step
  selectedItem: SelectedItem | null
  createQuery: string
  onClose: () => void
  onSaved: (result: SaveExpenseResult) => void
  onSelectItem: (item: SelectedItem) => void
  onRequestCreate: (query: string) => void
  onItemCreated: (item: CreatedCustomItem) => void
}

function ExpenseSheetContent({
  intent,
  step,
  selectedItem,
  createQuery,
  onClose,
  onSaved,
  onSelectItem,
  onRequestCreate,
  onItemCreated,
}: ExpenseSheetContentProps) {
  const { saveExpense } = useExpenseSave(onSaved)
  const { view } = useExpenseView()

  const [amount, setAmount] = useState(0)
  const [itemDetail, setItemDetail] = useState('')
  const [scope, setScope] = useState<ExpenseScope>(view)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setAmount(0)
    setItemDetail('')
  }, [selectedItem?.itemId])

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
    onClose()
  }

  const handleQuickPreset = async (preset: number) => {
    if (!selectedItem) return
    await saveWithItem(selectedItem, preset, itemDetail)
  }

  const handleSave = async () => {
    if (amount <= 0 || !selectedItem) return
    await saveWithItem(selectedItem, amount, itemDetail)
  }

  if (step === 'item') {
    return (
      <ItemPicker
        onSelect={onSelectItem}
        onRequestCreate={onRequestCreate}
      />
    )
  }

  if (step === 'create-item') {
    return (
      <CreateCustomItemForm
        initialLabel={createQuery}
        onCreated={onItemCreated}
      />
    )
  }

  const isQuick = intent.type === 'quick'

  return (
    <AmountKeypad
      hideNav
      itemHeader={
        selectedItem
          ? {
              emoji: selectedItem.itemEmoji,
              catalogLabel: selectedItem.itemLabel,
              detail: itemDetail,
              onDetailChange: setItemDetail,
            }
          : undefined
      }
      value={amount}
      onChange={setAmount}
      onSave={handleSave}
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
  const { view } = useExpenseView()
  const customItems = useCustomItems(view)

  const catalogSize = useMemo(() => {
    if (customItems === undefined) return ITEM_CATALOG.length
    return mergeCatalogWithCustom(ITEM_CATALOG, customItems).length
  }, [customItems])

  const [step, setStep] = useState<Step>('item')
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null)
  const [createQuery, setCreateQuery] = useState('')

  useEffect(() => {
    if (!intent) return
    const initial = resolveInitialState(intent)
    setStep(initial.step)
    setSelectedItem(initial.selectedItem)
    setCreateQuery('')
  }, [intent])

  const handleSelectItem = (item: SelectedItem) => {
    setSelectedItem(item)
    setStep('amount')
  }

  const handleItemCreated = (item: CreatedCustomItem) => {
    setCreateQuery('')
    handleSelectItem({
      itemId: item.itemId,
      itemEmoji: item.itemEmoji,
      itemLabel: item.itemLabel,
    })
  }

  const handleBack = () => {
    if (step === 'create-item' || step === 'amount') {
      setStep('item')
      return
    }
    onClose()
  }

  const sheetTitle = (() => {
    if (step === 'item') return itemPickerTitle()
    if (step === 'create-item') return '✏️ Nuevo ítem'
    // amount: itemHeader en el body (emoji + nombre editable)
    if (step === 'amount') return undefined
    return 'Monto'
  })()

  const sheetSubtitle = (() => {
    if (step === 'item') return itemPickerSubtitle(catalogSize)
    if (step === 'create-item') {
      return 'Empieza en Míos. Si lo usás en un gasto compartido, queda para todo el hogar.'
    }
    return undefined
  })()

  const headerAction = step === 'item' ? 'cancel' : 'back'

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      height="standard"
      title={sheetTitle}
      subtitle={sheetSubtitle}
      headerAction={headerAction}
      onBack={handleBack}
    >
      {intent && (
        <ExpenseSheetContent
          key={intentKey(intent)}
          intent={intent}
          step={step}
          selectedItem={selectedItem}
          createQuery={createQuery}
          onClose={onClose}
          onSaved={onSaved}
          onSelectItem={handleSelectItem}
          onRequestCreate={(query) => {
            setCreateQuery(query)
            setStep('create-item')
          }}
          onItemCreated={handleItemCreated}
        />
      )}
    </BottomSheet>
  )
}
