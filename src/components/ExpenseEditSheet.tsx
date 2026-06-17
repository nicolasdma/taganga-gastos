import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { AmountKeypad } from '@/components/AmountKeypad'
import { BottomSheet } from '@/components/BottomSheet'
import { CraftKeyboardProvider, useCraftKeyboardFooterSlot } from '@/components/keyboard'
import { CreateCustomItemForm } from '@/components/CreateCustomItemSheet'
import { EmojiSuggestionGrid } from '@/components/items/EmojiSuggestionGrid'
import {
  ItemPicker,
  type CreateItemRequest,
  type SelectedItem,
} from '@/components/ItemPicker'
import { itemPickerSubtitle, itemPickerTitle, parseCreateRequest } from '@/components/itemPickerMeta'
import { excludedNoticeClass, excludedRowClass } from '@/lib/expenseExcluded'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import type { EditableExpense } from '@/lib/expenseTypes'
import { useCreateCustomItem, newCustomItemId } from '@/hooks/useCreateCustomItem'
import { useUpdateCustomItem } from '@/hooks/useUpdateCustomItem'
import { applyEmojiToItem, shouldSyncCustomItemEmoji } from '@/lib/customItemEmoji'

export type { EditableExpense }
import { hapticSave } from '@/lib/haptics'
import { pushRecentItem } from '@/lib/preferences'
import { cn } from '@/lib/utils'

interface ExpenseEditSheetProps {
  expense: EditableExpense | null
  onClose: () => void
  onUpdated: () => void
}

type Step = 'edit' | 'item' | 'create-item' | 'edit-emoji'

interface ExpenseEditContentProps {
  expense: EditableExpense
  step: Step
  createQuery: string
  createEmoji?: string
  onClose: () => void
  onUpdated: () => void
  onStepChange: (step: Step) => void
  onRequestCreate: (request: CreateItemRequest) => void
}

function ExpenseEditContent({
  expense,
  step,
  createQuery,
  createEmoji,
  onClose,
  onUpdated,
  onStepChange,
  onRequestCreate,
}: ExpenseEditContentProps) {
  const updateExpense = useMutation(api.expenses.updateExpense)
  const setExpenseExcluded = useMutation(api.expenses.setExpenseExcluded)
  const { createCustomItem } = useCreateCustomItem()
  const { updateCustomItem } = useUpdateCustomItem()

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

  if (step === 'edit-emoji') {
    return (
      <div className="pb-4">
        <p className="label-stitch mb-2 px-0.5">{selectedItem.itemLabel}</p>
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
            setSelectedItem(next)
            if (shouldSyncCustomItemEmoji(next.itemId)) {
              void updateCustomItem({ itemId: next.itemId, emoji })
            }
            onStepChange('edit')
          }}
        />
      </div>
    )
  }

  if (step === 'item') {
    return (
      <ItemPicker
        onSelect={(item) => {
          setSelectedItem(item)
          onStepChange('edit')
        }}
        onRequestCreate={(request) => {
          const { query, emoji } = parseCreateRequest(request)
          if (emoji) {
            const itemId = newCustomItemId()
            setSelectedItem({ itemId, itemEmoji: emoji, itemLabel: query })
            onStepChange('edit')
            void createCustomItem({ label: query, emoji, itemId }).then((item) => {
              setSelectedItem((prev) =>
                prev?.itemLabel === query && prev.itemEmoji === emoji ? item : prev
              )
            })
            return
          }
          onRequestCreate({ query, emoji })
        }}
      />
    )
  }

  if (step === 'create-item') {
    return (
      <CreateCustomItemForm
        key={`${createQuery}:${createEmoji ?? ''}`}
        initialLabel={createQuery}
        initialEmoji={createEmoji}
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

      <div className="w-full mb-4 flex items-center gap-2 rounded-xl px-3 py-2.5 border text-left bg-muted/40 border-border/60">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
          Ítem
        </span>
        <button
          type="button"
          onClick={() => onStepChange('edit-emoji')}
          className="text-2xl leading-none shrink-0 rounded-lg px-1 active:scale-95 transition-transform"
          aria-label="Cambiar emoji"
        >
          {display.emoji}
        </button>
        <button
          type="button"
          onClick={() => onStepChange('item')}
          className={cn(
            'flex-1 min-w-0 text-right text-sm font-bold active:opacity-80',
            excludedRowClass(excluded)
          )}
        >
          {display.label}
        </button>
      </div>

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

function ExpenseEditSheetBody({
  expense,
  onClose,
  onUpdated,
}: {
  expense: EditableExpense
  onClose: () => void
  onUpdated: () => void
}) {
  const [step, setStep] = useState<Step>('edit')
  const [createQuery, setCreateQuery] = useState('')
  const [createEmoji, setCreateEmoji] = useState<string | undefined>()

  const handleRequestCreate = (request: CreateItemRequest) => {
    const { query, emoji } = parseCreateRequest(request)
    setCreateQuery(query)
    setCreateEmoji(emoji)
    setStep('create-item')
  }

  const handleBack = () => {
    if (step === 'item' || step === 'create-item' || step === 'edit-emoji') {
      setStep('edit')
      return
    }
    onClose()
  }

  const sheetTitle = (() => {
    if (step === 'item') return itemPickerTitle()
    if (step === 'create-item') return '✏️ Nuevo ítem'
    if (step === 'edit-emoji') return 'Elegí un emoji'
    const display = formatExpenseLabel(expense)
    return `${display.emoji} ${display.label}`
  })()

  const sheetSubtitle = (() => {
    if (step === 'item') return itemPickerSubtitle()
    if (step === 'create-item') return undefined
    if (step === 'edit-emoji') return undefined
    if (expense.excluded) return 'Editar · no cuenta en totales'
    return 'Editar monto'
  })()

  const headerAction = step === 'edit' ? 'cancel' : 'back'

  return (
    <CraftKeyboardProvider dock>
      <ExpenseEditSheetPanel
        expense={expense}
        step={step}
        createQuery={createQuery}
        createEmoji={createEmoji}
        sheetTitle={sheetTitle}
        sheetSubtitle={sheetSubtitle}
        headerAction={headerAction}
        onClose={onClose}
        onUpdated={onUpdated}
        handleBack={handleBack}
        onRequestCreate={handleRequestCreate}
        setStep={setStep}
      />
    </CraftKeyboardProvider>
  )
}

function ExpenseEditSheetPanel({
  expense,
  step,
  createQuery,
  createEmoji,
  sheetTitle,
  sheetSubtitle,
  headerAction,
  onClose,
  onUpdated,
  handleBack,
  onRequestCreate,
  setStep,
}: {
  expense: EditableExpense
  step: Step
  createQuery: string
  createEmoji?: string
  sheetTitle: string | undefined
  sheetSubtitle: string | undefined
  headerAction: 'cancel' | 'back'
  onClose: () => void
  onUpdated: () => void
  handleBack: () => void
  onRequestCreate: (request: CreateItemRequest) => void
  setStep: (step: Step) => void
}) {
  const footer = useCraftKeyboardFooterSlot()

  return (
    <BottomSheet
      open
      onClose={onClose}
      height="standard"
      title={sheetTitle}
      subtitle={sheetSubtitle}
      headerAction={headerAction}
      onBack={handleBack}
      scrollKey={step}
      footer={footer}
    >
      <ExpenseEditContent
        expense={expense}
        step={step}
        createQuery={createQuery}
        createEmoji={createEmoji}
        onClose={onClose}
        onUpdated={onUpdated}
        onStepChange={(next) => {
          setStep(next)
        }}
        onRequestCreate={onRequestCreate}
      />
    </BottomSheet>
  )
}

export function ExpenseEditSheet({ expense, onClose, onUpdated }: ExpenseEditSheetProps) {
  if (!expense) return null

  return (
    <ExpenseEditSheetBody
      key={expense._id}
      expense={expense}
      onClose={onClose}
      onUpdated={onUpdated}
    />
  )
}
