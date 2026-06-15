import { formatExpenseClockTime } from '@/lib/expenseTime'
import { cn } from '@/lib/utils'

interface ExpenseTimeStampProps {
  createdAt: number
  className?: string
}

export function ExpenseTimeStamp({ createdAt, className }: ExpenseTimeStampProps) {
  return (
    <span
      className={cn(
        'font-display font-tabular text-[10px] font-semibold text-stitch/80 tracking-tight leading-none',
        className
      )}
    >
      {formatExpenseClockTime(createdAt)}
    </span>
  )
}

interface ExpenseDaySectionHeaderProps {
  label: string
  className?: string
}

export function ExpenseDaySectionHeader({ label, className }: ExpenseDaySectionHeaderProps) {
  return (
    <div className={cn('flex justify-center py-2 first:pt-0', className)}>
      <div className="expense-section-pill expense-section-pill--day tilt-gentle">
        <span className="text-sm leading-none" aria-hidden>
          📅
        </span>
        <span className="font-display text-[13px] font-bold text-ink tracking-tight">{label}</span>
      </div>
    </div>
  )
}

interface ExpenseTimeOfDaySectionHeaderProps {
  label: string
  emoji: string
  accent: 'sage' | 'clay' | 'cobalt'
  className?: string
}

export function ExpenseTimeOfDaySectionHeader({
  label,
  emoji,
  accent,
  className,
}: ExpenseTimeOfDaySectionHeaderProps) {
  return (
    <div className={cn('expense-section-header expense-section-header--moment', className)}>
      <div className={cn('expense-section-pill expense-section-pill--moment tilt-alt', `expense-section-pill--${accent}`)}>
        <span className="text-base leading-none" aria-hidden>
          {emoji}
        </span>
        <span className="font-display text-[12px] font-bold text-ink tracking-tight">{label}</span>
      </div>
      <div className="expense-section-thread" aria-hidden />
    </div>
  )
}

/** @deprecated use ExpenseDaySectionHeader or ExpenseTimeStamp */
export function ExpenseTimeMeta(props: ExpenseTimeStampProps) {
  return <ExpenseTimeStamp {...props} />
}

/** @deprecated use ExpenseDaySectionHeader */
export function ExpenseListSectionLabel({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return <ExpenseDaySectionHeader label={children} className={className} />
}
