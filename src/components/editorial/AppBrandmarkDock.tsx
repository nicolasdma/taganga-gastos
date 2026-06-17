import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { TabId } from '@/components/BottomNav'
import { EditorialBrandmark } from '@/components/editorial/EditorialBrandmark'
import type { ExpenseView } from '@/lib/expenseScope'

const INITIAL_SCROLL: Record<TabId, number> = { home: 0, calendar: 0, stats: 0 }

interface TabScrollContextValue {
  reportScroll: (tab: TabId, y: number) => void
  scrollY: Record<TabId, number>
}

const TabScrollContext = createContext<TabScrollContextValue | null>(null)

export function TabScrollProvider({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(INITIAL_SCROLL)

  const reportScroll = useCallback((tab: TabId, y: number) => {
    setScrollY((prev) => (prev[tab] === y ? prev : { ...prev, [tab]: y }))
  }, [])

  const value = useMemo(() => ({ reportScroll, scrollY }), [reportScroll, scrollY])

  return <TabScrollContext.Provider value={value}>{children}</TabScrollContext.Provider>
}

export function useTabScroll() {
  const ctx = useContext(TabScrollContext)
  if (!ctx) {
    throw new Error('useTabScroll must be used within TabScrollProvider')
  }
  return ctx
}

/** Layout reservation — brandmark renders in AppBrandmarkDock (single instance). */
export function BrandmarkSlot() {
  return <div className="editorial-brandmark-slot shrink-0" aria-hidden />
}

interface AppBrandmarkDockProps {
  tab: TabId
  view: ExpenseView
  onViewChange: (view: ExpenseView) => void
  pulseKey?: number
  pendingCount?: number
  hidden?: boolean
}

/**
 * One EditorialBrandmark for the whole app — never remounts on tab change.
 * Fixed in the header band; translateY follows tab scroll so it moves with content.
 */
export function AppBrandmarkDock({
  tab,
  view,
  onViewChange,
  pulseKey = 0,
  pendingCount = 0,
  hidden,
}: AppBrandmarkDockProps) {
  const { scrollY } = useTabScroll()

  if (hidden) return null

  const offset = scrollY[tab] ?? 0

  return (
    <div
      className="app-brandmark-dock"
      data-tab={tab}
      style={{ transform: `translate3d(0, ${-offset}px, 0)` }}
    >
      <EditorialBrandmark
        view={view}
        onViewChange={onViewChange}
        pulseKey={pulseKey}
        pendingCount={pendingCount}
      />
    </div>
  )
}
