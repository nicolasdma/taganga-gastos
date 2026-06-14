import { lazy, Suspense, useCallback, useState } from 'react'
import { useMutation } from 'convex/react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { api } from '../convex/_generated/api'
import { BottomNav, type TabId } from '@/components/BottomNav'
import { ConvexConfigError } from '@/components/ConvexConfigError'
import { ExpenseEditSheet } from '@/components/ExpenseEditSheet'
import { ExpenseSheet, type SheetIntent } from '@/components/ExpenseSheet'
import { FabStack } from '@/components/FabStack'
import { ReceiptScanSheet } from '@/components/ReceiptScanSheet'
import { TagangaBackground } from '@/components/TagangaBackground'
import { Toast } from '@/components/Toast'
import { useOutboxSync } from '@/hooks/useOutboxSync'
import { useOutboxStatus } from '@/hooks/useOutboxStatus'
import type { SaveExpenseResult } from '@/hooks/useExpenseSave'
import type { SaveReceiptResult } from '@/hooks/useReceiptSave'
import type { EditableExpense } from '@/lib/expenseTypes'
import { removeFromOutbox, removeReceiptGroupFromOutbox } from '@/lib/outbox'
import { HomeScreen, CalendarScreen } from '@/screens'

const StatsScreen = lazy(() =>
  import('@/screens/StatsScreen').then((m) => ({ default: m.StatsScreen }))
)

const convexUrl = import.meta.env.VITE_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

type ToastState = (SaveExpenseResult & { type?: 'expense' }) | SaveReceiptResult | null

function StatsFallback() {
  return (
    <div className="tab-scroll h-full min-h-0 overflow-y-auto scrollbar-none px-4">
      <div className="pt-safe h-24 rounded-2xl bg-porcelain-cream/60 animate-pulse mb-5" />
      <div className="h-24 rounded-2xl bg-porcelain-cream/60 animate-pulse mb-5" />
      <div className="h-48 rounded-2xl bg-porcelain-cream/60 animate-pulse" />
    </div>
  )
}

function AppShell() {
  const [tab, setTab] = useState<TabId>('home')
  const [sheetIntent, setSheetIntent] = useState<SheetIntent | null>(null)
  const [scanOpen, setScanOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<EditableExpense | null>(null)
  const [pulseKey, setPulseKey] = useState(0)
  const [toast, setToast] = useState<ToastState>(null)

  useOutboxSync()
  const pendingCount = useOutboxStatus()
  const setExpenseExcluded = useMutation(api.expenses.setExpenseExcluded)
  const excludeReceiptGroup = useMutation(api.expenses.excludeReceiptGroup)

  const bump = useCallback(() => setPulseKey((k) => k + 1), [])

  const handleExpenseSaved = useCallback(
    (result: SaveExpenseResult) => {
      bump()
      setToast({ ...result, type: 'expense' })
    },
    [bump]
  )

  const handleReceiptSaved = useCallback(
    (result: SaveReceiptResult) => {
      bump()
      setToast(result)
    },
    [bump]
  )

  const handleUndo = useCallback(async () => {
    if (!toast) return

    if (toast.type === 'receipt') {
      if (toast.expenseIds?.length) {
        await excludeReceiptGroup({ receiptGroupId: toast.receiptGroupId })
      } else {
        removeReceiptGroupFromOutbox(toast.receiptGroupId)
      }
    } else if (toast.expenseId) {
      await setExpenseExcluded({ id: toast.expenseId, excluded: true })
    } else if (toast.clientId) {
      removeFromOutbox(toast.clientId)
    }

    setToast(null)
    bump()
  }, [toast, setExpenseExcluded, excludeReceiptGroup, bump])

  const toastMessage =
    toast?.type === 'receipt'
      ? `🐾 Ticket guardado (${toast.itemCount} ítem${toast.itemCount !== 1 ? 's' : ''})`
      : '🐾 Guardado'

  return (
    <div className="app-shell flex flex-col bg-transparent">
      <TagangaBackground />
      <main className="relative z-10 flex-1 min-h-0 overflow-hidden">
        {tab === 'home' && (
          <HomeScreen
            pulseKey={pulseKey}
            pendingCount={pendingCount}
            onOpenSheet={setSheetIntent}
            onOpenStats={() => setTab('stats')}
            onSaved={handleExpenseSaved}
            onEditExpense={setEditExpense}
            onPendingRemoved={bump}
          />
        )}
        {tab === 'calendar' && (
          <CalendarScreen key="calendar" onEditExpense={setEditExpense} />
        )}
        {tab === 'stats' && (
          <Suspense key="stats" fallback={<StatsFallback />}>
            <StatsScreen />
          </Suspense>
        )}
      </main>

      <FabStack
        onAdd={() => setSheetIntent({ type: 'fab' })}
        onScan={() => setScanOpen(true)}
        pendingCount={pendingCount}
      />

      <BottomNav active={tab} onChange={setTab} />

      <ExpenseSheet
        intent={sheetIntent}
        onClose={() => setSheetIntent(null)}
        onSaved={handleExpenseSaved}
      />

      <ReceiptScanSheet
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onSaved={handleReceiptSaved}
      />

      <ExpenseEditSheet
        expense={editExpense}
        onClose={() => setEditExpense(null)}
        onUpdated={bump}
      />

      {toast && (
        <Toast
          message={toastMessage}
          actionLabel="Deshacer"
          onAction={handleUndo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  if (!convex) {
    return <ConvexConfigError />
  }

  return (
    <ConvexProvider client={convex}>
      <AppShell />
    </ConvexProvider>
  )
}
