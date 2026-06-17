import { useState } from 'react'
import { AmountKeypad } from '@/components/AmountKeypad'
import { BottomSheet } from '@/components/BottomSheet'
import { CraftKeyboardProvider, useCraftKeyboardFooterSlot } from '@/components/keyboard'
import { CreateCustomItemForm } from '@/components/CreateCustomItemSheet'
import {
  ItemPicker,
  type CreateItemRequest,
  type SelectedItem,
} from '@/components/ItemPicker'
import { itemPickerSubtitle, itemPickerTitle, parseCreateRequest } from '@/components/itemPickerMeta'
import { useExpenseSave, type SaveExpenseResult } from '@/hooks/useExpenseSave'
import { useExpenseView } from '@/hooks/useExpenseView'
import type { ExpenseScope } from '@/lib/expenseScope'
import { useCreateCustomItem, newCustomItemId, type CreatedCustomItem } from '@/hooks/useCreateCustomItem'
import { useUpdateCustomItem } from '@/hooks/useUpdateCustomItem'
import { EmojiSuggestionGrid } from '@/components/items/EmojiSuggestionGrid'
import { applyEmojiToItem, shouldSyncCustomItemEmoji } from '@/lib/customItemEmoji'

export type { SaveExpenseResult }

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

function AmountStep({
  intent,
  selectedItem,
  onSelectedItemChange,
  onClose,
  onSaved,
}: {
  intent: SheetIntent
  selectedItem: SelectedItem
  onSelectedItemChange: (item: SelectedItem) => void
  onClose: () => void
  onSaved: (result: SaveExpenseResult) => void
}) {
  const { saveExpense } = useExpenseSave(onSaved)
  const { updateCustomItem } = useUpdateCustomItem()
  const { view } = useExpenseView()
  const [amount, setAmount] = useState(0)
  const [itemDetail, setItemDetail] = useState('')
  const [scope, setScope] = useState<ExpenseScope>(view)
  const [saving, setSaving] = useState(false)
  const [editingEmoji, setEditingEmoji] = useState(false)

  const saveWithItem = async (expenseAmount: number, detail?: string) => {
    setSaving(true)
    await saveExpense({
      amount: expenseAmount,
      itemId: selectedItem.itemId,
      itemEmoji: selectedItem.itemEmoji,
      itemLabel: selectedItem.itemLabel,
      note: detail?.trim() || undefined,
      scope,
    })
    setSaving(false)
    onClose()
  }

  const isQuick = intent.type === 'quick'

  if (editingEmoji) {
    return (
      <div className="pb-4">
        <p className="label-stitch mb-2 text-center px-0.5">{selectedItem.itemLabel}</p>
        <div className="flex justify-center mb-4">
          <span className="text-5xl leading-none" aria-hidden>
            {selectedItem.itemEmoji}
          </span>
        </div>
        <EmojiSuggestionGrid
          selectedEmoji={selectedItem.itemEmoji}
          searchQuery={selectedItem.itemLabel}
          onSelect={(emoji) => {
            const next = applyEmojiToItem(selectedItem, emoji)
            onSelectedItemChange(next)
            if (shouldSyncCustomItemEmoji(next.itemId)) {
              void updateCustomItem({ itemId: next.itemId, emoji })
            }
            setEditingEmoji(false)
          }}
        />
        <button
          type="button"
          onClick={() => setEditingEmoji(false)}
          className="w-full mt-4 py-2.5 text-sm font-bold text-muted-foreground rounded-xl border border-border/60 active:bg-muted/40"
        >
          Listo
        </button>
      </div>
    )
  }

  return (
    <AmountKeypad
      hideNav
      itemHeader={{
        emoji: selectedItem.itemEmoji,
        catalogLabel: selectedItem.itemLabel,
        detail: itemDetail,
        onDetailChange: setItemDetail,
        onEmojiPress: () => setEditingEmoji(true),
      }}
      value={amount}
      onChange={setAmount}
      onSave={() => {
        if (amount <= 0) return
        void saveWithItem(amount, itemDetail)
      }}
      saving={saving}
      autoSaveOnPreset={isQuick}
      onPresetSelect={isQuick ? (preset) => void saveWithItem(preset, itemDetail) : undefined}
      primaryLabel="Guardar"
      scope={scope}
      onScopeChange={setScope}
    />
  )
}

interface ExpenseSheetContentProps {
  intent: SheetIntent
  step: Step
  selectedItem: SelectedItem | null
  createQuery: string
  createEmoji?: string
  onClose: () => void
  onSaved: (result: SaveExpenseResult) => void
  onSelectItem: (item: SelectedItem) => void
  onSelectedItemChange: (item: SelectedItem) => void
  onRequestCreate: (request: CreateItemRequest) => void
  onItemCreated: (item: CreatedCustomItem) => void
}

function ExpenseSheetContent({
  intent,
  step,
  selectedItem,
  createQuery,
  createEmoji,
  onClose,
  onSaved,
  onSelectItem,
  onSelectedItemChange,
  onRequestCreate,
  onItemCreated,
}: ExpenseSheetContentProps) {
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
        key={`${createQuery}:${createEmoji ?? ''}`}
        initialLabel={createQuery}
        initialEmoji={createEmoji}
        onCreated={onItemCreated}
      />
    )
  }

  if (!selectedItem) return null

  return (
    <AmountStep
      key={selectedItem.itemId}
      intent={intent}
      selectedItem={selectedItem}
      onSelectedItemChange={onSelectedItemChange}
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}

function ExpenseSheetBody({
  intent,
  open,
  onClose,
  onSaved,
}: {
  intent: SheetIntent | null
  open: boolean
  onClose: () => void
  onSaved: (result: SaveExpenseResult) => void
}) {
  const initial = intent ? resolveInitialState(intent) : { step: 'item' as Step, selectedItem: null }
  const [step, setStep] = useState<Step>(initial.step)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(initial.selectedItem)
  const [createQuery, setCreateQuery] = useState('')
  const [createEmoji, setCreateEmoji] = useState<string | undefined>()
  const { createCustomItem } = useCreateCustomItem()

  const handleSelectItem = (item: SelectedItem) => {
    setSelectedItem(item)
    setStep('amount')
  }

  const handleItemCreated = (item: CreatedCustomItem) => {
    setCreateQuery('')
    setCreateEmoji(undefined)
    handleSelectItem({
      itemId: item.itemId,
      itemEmoji: item.itemEmoji,
      itemLabel: item.itemLabel,
    })
  }

  const handleRequestCreate = (request: CreateItemRequest) => {
    const { query, emoji } = parseCreateRequest(request)
    if (emoji) {
      const itemId = newCustomItemId()
      handleSelectItem({
        itemId,
        itemEmoji: emoji,
        itemLabel: query,
      })
      void createCustomItem({ label: query, emoji, itemId }).then((item) => {
        setSelectedItem((prev) =>
          prev?.itemLabel === query && prev.itemEmoji === emoji ? item : prev
        )
      })
      return
    }
    setCreateQuery(query)
    setCreateEmoji(undefined)
    setStep('create-item')
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
    if (step === 'amount') return undefined
    return 'Monto'
  })()

  const sheetSubtitle = step === 'item' ? itemPickerSubtitle() : undefined
  const headerAction = step === 'item' ? 'cancel' : 'back'

  return (
    <CraftKeyboardProvider dock>
      <ExpenseSheetPanel
        open={open}
        onClose={onClose}
        sheetTitle={sheetTitle}
        sheetSubtitle={sheetSubtitle}
        headerAction={headerAction}
        handleBack={handleBack}
        step={step}
        intent={intent}
        selectedItem={selectedItem}
        createQuery={createQuery}
        createEmoji={createEmoji}
        onSaved={onSaved}
        onSelectItem={handleSelectItem}
        onSelectedItemChange={setSelectedItem}
        onRequestCreate={handleRequestCreate}
        onItemCreated={handleItemCreated}
      />
    </CraftKeyboardProvider>
  )
}

function ExpenseSheetPanel({
  open,
  onClose,
  sheetTitle,
  sheetSubtitle,
  headerAction,
  handleBack,
  step,
  intent,
  selectedItem,
  createQuery,
  createEmoji,
  onSaved,
  onSelectItem,
  onSelectedItemChange,
  onRequestCreate,
  onItemCreated,
}: {
  open: boolean
  onClose: () => void
  sheetTitle: string | undefined
  sheetSubtitle: string | undefined
  headerAction: 'cancel' | 'back'
  handleBack: () => void
  step: Step
  intent: SheetIntent | null
  selectedItem: SelectedItem | null
  createQuery: string
  createEmoji?: string
  onSaved: (result: SaveExpenseResult) => void
  onSelectItem: (item: SelectedItem) => void
  onSelectedItemChange: (item: SelectedItem) => void
  onRequestCreate: (request: CreateItemRequest) => void
  onItemCreated: (item: CreatedCustomItem) => void
}) {
  const footer = useCraftKeyboardFooterSlot()

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      height="standard"
      title={sheetTitle}
      subtitle={sheetSubtitle}
      headerAction={headerAction}
      onBack={handleBack}
      scrollKey={step}
      footer={footer}
    >
      {intent && (
        <ExpenseSheetContent
          intent={intent}
          step={step}
          selectedItem={selectedItem}
          createQuery={createQuery}
          createEmoji={createEmoji}
          onClose={onClose}
          onSaved={onSaved}
          onSelectItem={onSelectItem}
          onSelectedItemChange={onSelectedItemChange}
          onRequestCreate={onRequestCreate}
          onItemCreated={onItemCreated}
        />
      )}
    </BottomSheet>
  )
}

export function ExpenseSheet({ intent, onClose, onSaved }: ExpenseSheetProps) {
  const open = intent !== null

  return (
    <ExpenseSheetBody
      key={intent ? intentKey(intent) : 'closed'}
      intent={intent}
      open={open}
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}
