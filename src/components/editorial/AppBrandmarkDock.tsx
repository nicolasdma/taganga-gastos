import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { EditorialBrandmark } from '@/components/editorial/EditorialBrandmark'
import type { ExpenseView } from '@/lib/expenseScope'

interface BrandmarkContextValue {
  view: ExpenseView
  onViewChange: (view: ExpenseView) => void
  pulseKey: number
  pendingCount: number
  hidden: boolean
}

const BrandmarkContext = createContext<BrandmarkContextValue | null>(null)

export function BrandmarkProvider({
  children,
  view,
  onViewChange,
  pulseKey = 0,
  pendingCount = 0,
  hidden = false,
}: BrandmarkContextValue & { children: ReactNode }) {
  return (
    <BrandmarkContext.Provider value={{ view, onViewChange, pulseKey, pendingCount, hidden }}>
      {children}
    </BrandmarkContext.Provider>
  )
}

/**
 * Inline brandmark rendered by each header. This intentionally uses normal layout
 * instead of the old fixed dock so small screens can position it via flex.
 */
export function BrandmarkSlot() {
  const ctx = useContext(BrandmarkContext)

  if (!ctx || ctx.hidden) {
    return <div className="editorial-brandmark-slot editorial-brandmark-slot--empty shrink-0" aria-hidden />
  }

  return (
    <div className="editorial-brandmark-slot shrink-0">
      <EditorialBrandmark
        view={ctx.view}
        onViewChange={ctx.onViewChange}
        pulseKey={ctx.pulseKey}
        pendingCount={ctx.pendingCount}
      />
    </div>
  )
}
