import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatCOP } from '@/lib/currency'
import { formatExpenseLabel } from '@/lib/expenseDisplay'
import { ExpenseTimeStamp } from '@/components/ExpenseTimeMeta'
import {
  excludedAmountClass,
  excludedLabelClass,
  isExpenseExcluded,
} from '@/lib/expenseExcluded'
import type { EditableExpense } from '@/lib/expenseTypes'
import { receiptGroupTitle, type ReceiptGroup } from '@/lib/receiptGroups'
import { cn } from '@/lib/utils'

interface ReceiptGroupRowProps {
  group: ReceiptGroup
  defaultExpanded?: boolean
  onEditExpense: (expense: EditableExpense) => void
  onPendingDelete?: (receiptGroupId: string) => void
}

function toEditable(expense: ReceiptGroup['items'][0]): EditableExpense | null {
  if (expense.pending) return null
  return {
    _id: expense._id as EditableExpense['_id'],
    amount: expense.amount,
    itemId: expense.itemId,
    itemLabel: expense.itemLabel,
    itemEmoji: expense.itemEmoji,
    sessionId: expense.sessionId,
    store: expense.store,
    excluded: expense.excluded,
  }
}

export function ReceiptGroupRow({
  group,
  defaultExpanded = false,
  onEditExpense,
  onPendingDelete,
}: ReceiptGroupRowProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { emoji, title, subtitle } = receiptGroupTitle(group)
  const itemCount = group.items.length
  const groupTimes = group.items.map((item) => item.createdAt).filter((ts): ts is number => ts != null)
  const groupTime = groupTimes.length > 0 ? Math.max(...groupTimes) : undefined

  const handleHeaderClick = () => {
    if (group.pending && onPendingDelete) {
      if (window.confirm('¿Quitar este ticket pendiente de sincronización?')) {
        onPendingDelete(group.receiptGroupId)
      }
      return
    }
    setExpanded((v) => !v)
  }

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden row-porcelain',
        group.pending && 'border-dashed opacity-70'
      )}
    >
      <button
        type="button"
        onClick={handleHeaderClick}
        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left active:opacity-90"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{emoji}</span>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-foreground truncate block">
              {title}
              {subtitle ? ` · ${subtitle}` : ''}
            </span>
            {!expanded && (
              <span className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-stitch font-display font-semibold">
                  {itemCount} ítem{itemCount !== 1 ? 's' : ''}
                </span>
                {groupTime != null && <ExpenseTimeStamp createdAt={groupTime} />}
                {group.pending && (
                  <span className="text-[10px] text-amber-700 font-display font-semibold">
                    ⏳ tap quitar
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-extrabold font-tabular text-foreground">
            {formatCOP(group.total)}
          </span>
          {!group.pending &&
            (expanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ))}
        </div>
      </button>

      {expanded && !group.pending && (
        <div className="border-t border-border/40 px-3 py-2 space-y-1">
          {group.items.map((item) => {
            const { emoji: itemEmoji, label } = formatExpenseLabel(item)
            const excluded = isExpenseExcluded(item.excluded)
            const editable = toEditable(item)

            return (
              <button
                key={item._id}
                type="button"
                disabled={!editable}
                onClick={() => editable && onEditExpense(editable)}
                className={cn(
                  'w-full flex items-center justify-between gap-2 text-sm py-1.5 px-1 rounded-lg active:opacity-80',
                  excluded && 'text-red-700/80'
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={cn('truncate text-left', excludedLabelClass(excluded))}>
                    {itemEmoji} {label}
                    {excluded ? ' · no cuenta' : ''}
                  </span>
                  {item.createdAt != null && (
                    <ExpenseTimeStamp createdAt={item.createdAt} className="shrink-0" />
                  )}
                </div>
                <span
                  className={cn('font-semibold font-tabular shrink-0', excludedAmountClass(excluded))}
                >
                  {formatCOP(item.amount)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
