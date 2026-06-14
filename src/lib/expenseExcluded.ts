import { cn } from '@/lib/utils'

export function isExpenseExcluded(excluded?: boolean) {
  return excluded === true
}

export function excludedRowClass(excluded?: boolean) {
  return cn(
    excluded &&
      'bg-red-100/95 border-2 border-red-300/85 text-red-900 shadow-sm backdrop-blur-[2px]'
  )
}

export function excludedAmountClass(excluded?: boolean) {
  return cn(excluded && 'text-red-800 line-through decoration-red-500/90')
}

export function excludedLabelClass(excluded?: boolean) {
  return cn(excluded && 'text-red-900 line-through decoration-red-500/80')
}

export function excludedBadgeClass() {
  return 'text-[10px] font-bold text-red-900 bg-red-100 border border-red-300/90 px-1.5 py-0.5 rounded-full uppercase shrink-0'
}

export function excludedNoticeClass() {
  return 'text-xs font-semibold text-red-900 bg-red-100/95 border border-red-300/85 rounded-xl px-3 py-2 text-center'
}
