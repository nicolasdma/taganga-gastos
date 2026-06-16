import type { CSSProperties } from 'react'
import type { TabId } from '@/components/BottomNav'
import { EditorialBrandmark } from '@/components/editorial/EditorialBrandmark'
import type { ExpenseView } from '@/lib/expenseScope'

interface AppBrandmarkDockProps {
  tab: TabId
  view: ExpenseView
  onViewChange: (view: ExpenseView) => void
  pulseKey?: number
  pendingCount?: number
  hidden?: boolean
}

/** Single persistent brandmark — lives in App shell, never remounts on tab change. */
export function AppBrandmarkDock({
  tab,
  view,
  onViewChange,
  pulseKey = 0,
  pendingCount = 0,
  hidden,
}: AppBrandmarkDockProps) {
  if (hidden) return null

  return (
    <div className="app-brandmark-dock" data-tab={tab}>
      <EditorialBrandmark
        view={view}
        onViewChange={onViewChange}
        pulseKey={pulseKey}
        pendingCount={pendingCount}
      />
    </div>
  )
}

/** Reserves header space so titles do not sit under the fixed dock. */
export function EditorialHeaderSpacer() {
  return (
    <div
      className="editorial-header__brandmark-spacer shrink-0"
      style={{ '--editorial-kitty-size': '76px' } as CSSProperties}
      aria-hidden
    />
  )
}
