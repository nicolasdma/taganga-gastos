import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { BottomSheet } from '@/components/BottomSheet'
import { useReceiptSave, type SaveReceiptResult } from '@/hooks/useReceiptSave'
import { formatCOP } from '@/lib/currency'
import {
  sumItems,
  toEditableItems,
  type EditableReceiptItem,
  type ReceiptScanResult,
} from '@/lib/receiptScan'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReceiptReviewSheetProps {
  open: boolean
  scanResult: ReceiptScanResult
  onClose: () => void
  onSaved: (result: SaveReceiptResult) => void
}

export function ReceiptReviewSheet({
  open,
  scanResult,
  onClose,
  onSaved,
}: ReceiptReviewSheetProps) {
  const { saveReceipt } = useReceiptSave(onSaved)
  const [items, setItems] = useState<EditableReceiptItem[]>(() =>
    toEditableItems(scanResult.items)
  )
  const [store, setStore] = useState(scanResult.store ?? '')
  const [editingAmountId, setEditingAmountId] = useState<string | null>(null)
  const [amountDraft, setAmountDraft] = useState(0)
  const [saving, setSaving] = useState(false)

  const itemsTotal = useMemo(() => sumItems(items), [items])
  const totalMismatch =
    scanResult.total != null && scanResult.total !== itemsTotal && items.length > 0

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateLabel = (id: string, label: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)))
  }

  const startEditAmount = (item: EditableReceiptItem) => {
    setEditingAmountId(item.id)
    setAmountDraft(item.amount)
  }

  const commitAmount = () => {
    if (!editingAmountId) return
    setItems((prev) =>
      prev.map((i) => (i.id === editingAmountId ? { ...i, amount: amountDraft } : i))
    )
    setEditingAmountId(null)
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: '', amount: 0 },
    ])
  }

  const handleSave = async () => {
    if (saving) return
    const validItems = items.filter((i) => i.label.trim() && i.amount > 0)
    if (validItems.length === 0) return

    setSaving(true)
    try {
      await saveReceipt({
        store: store.trim() || undefined,
        items: validItems.map((i) => ({
          itemLabel: i.label.trim(),
          amount: i.amount,
        })),
      })
    } finally {
      setSaving(false)
    }
  }

  const canSave = items.some((i) => i.label.trim() && i.amount > 0)

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-foreground">Revisar ticket</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-muted-foreground"
          >
            Cancelar
          </button>
        </div>

        <div className="mb-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Ítems
          </p>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-2 py-2"
              >
                <span className="text-lg shrink-0">🧾</span>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateLabel(item.id, e.target.value)}
                  placeholder="Nombre del ítem"
                  inputMode="text"
                  enterKeyHint="done"
                  className="flex-1 min-w-0 bg-transparent text-base font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    editingAmountId === item.id ? commitAmount() : startEditAmount(item)
                  }
                  className={cn(
                    'text-sm font-extrabold font-tabular shrink-0 px-2 py-1 rounded-lg',
                    editingAmountId === item.id
                      ? 'bg-coral/10 text-coral'
                      : 'bg-muted/50 text-foreground'
                  )}
                >
                  {formatCOP(editingAmountId === item.id ? amountDraft : item.amount)}
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Quitar ítem"
                  className="p-1 text-muted-foreground active:text-coral"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {editingAmountId && (
            <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Monto del ítem</p>
              <input
                type="number"
                inputMode="numeric"
                enterKeyHint="done"
                value={amountDraft || ''}
                onChange={(e) => setAmountDraft(Math.max(0, Number(e.target.value) || 0))}
                className="w-full text-2xl font-extrabold font-tabular bg-transparent outline-none mb-2"
              />
              <Button size="sm" className="w-full" onClick={commitAmount}>
                Listo
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={addItem}
            className="mt-2 text-sm font-bold text-coral active:opacity-70"
          >
            + Agregar ítem
          </button>

          <div className="mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total</span>
              <span className="text-lg font-extrabold font-tabular">{formatCOP(itemsTotal)}</span>
            </div>
            {totalMismatch && (
              <p className="text-[11px] text-amber-600 mt-1">
                Total ticket: {formatCOP(scanResult.total!)} · Suma ítems: {formatCOP(itemsTotal)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 mb-5">
          <p className="text-sm font-bold text-foreground mb-2">Nombre del lugar (opcional)</p>
          <input
            type="text"
            value={store}
            onChange={(e) => setStore(e.target.value)}
            placeholder="Ej: Olímpica, Juan Valdez, Éxito…"
            inputMode="text"
            enterKeyHint="done"
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-2.5 text-base font-semibold outline-none focus:ring-2 focus:ring-coral/30"
          />
        </div>

        <Button
          size="lg"
          className="w-full rounded-2xl"
          disabled={!canSave || saving}
          onClick={() => void handleSave()}
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </div>
    </BottomSheet>
  )
}
