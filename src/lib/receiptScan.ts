export interface ReceiptScanItem {
  label: string
  amount: number
}

export interface ReceiptScanResult {
  store?: string
  items: ReceiptScanItem[]
  total?: number
}

export interface EditableReceiptItem extends ReceiptScanItem {
  id: string
}

export function toEditableItems(items: ReceiptScanItem[]): EditableReceiptItem[] {
  return items.map((item) => ({
    ...item,
    id: crypto.randomUUID(),
  }))
}

export function sumItems(items: Array<{ amount: number }>): number {
  return items.reduce((s, i) => s + i.amount, 0)
}
