export type ExpenseViewPanelRole = 'active' | 'outgoing' | 'incoming' | 'dormant'

/** Visible panel — receives pointer events and drives layout height */
export function isExpenseViewPanelVisible(role: ExpenseViewPanelRole): boolean {
  return role === 'active' || role === 'incoming'
}
