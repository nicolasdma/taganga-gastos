import { useExpenseView, EXPENSE_VIEW_TRANSITION_MS } from '@/hooks/useExpenseView'

export type ExpenseViewDirection = -1 | 0 | 1

/**
 * Direction of the Home view slide, aligned with kitty brandmark metaphor:
 * +1 personal → shared (mate arrives from the right)
 * -1 shared → personal (mate leaves to the right)
 */
export function useExpenseViewDirection(): {
  direction: ExpenseViewDirection
  isTransitioning: boolean
  transitionMs: number
} {
  const { direction, isTransitioning } = useExpenseView()
  return { direction, isTransitioning, transitionMs: EXPENSE_VIEW_TRANSITION_MS }
}
