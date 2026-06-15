export type ExpenseScope = 'shared' | 'personal'
export type ExpenseView = 'shared' | 'personal'

export const DEFAULT_EXPENSE_SCOPE: ExpenseScope = 'personal'
export const DEFAULT_EXPENSE_VIEW: ExpenseView = 'personal'

export const EXPENSE_SCOPE_LABELS: Record<ExpenseScope, string> = {
  shared: 'Compartido',
  personal: 'Personal',
}

export const EXPENSE_VIEW_LABELS: Record<ExpenseView, string> = {
  shared: 'Nosotros',
  personal: 'Míos',
}
