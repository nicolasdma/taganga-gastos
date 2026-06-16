import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useConvexAuth } from '@convex-dev/auth/react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { BottomNav, type TabId } from '@/components/BottomNav'
import { ConvexConfigError } from '@/components/ConvexConfigError'
import { ExpenseEditSheet } from '@/components/ExpenseEditSheet'
import { ExpenseSheet, type SheetIntent } from '@/components/ExpenseSheet'
import { FabStack } from '@/components/FabStack'
import { AndroidInstallBanner } from '@/components/InstallPromptBanner'
import { IosInstallGuide } from '@/components/IosInstallGuide'
import { PwaUpdateBanner } from '@/components/PwaUpdateBanner'
import { ReceiptScanSheet } from '@/components/ReceiptScanSheet'
import { TagangaBackground } from '@/components/TagangaBackground'
import { Toast } from '@/components/Toast'
import { useDisplayModeAnalytics } from '@/hooks/useDisplayModeAnalytics'
import { useIsOffline } from '@/hooks/useIsOffline'
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen'
import { useOutboxSync } from '@/hooks/useOutboxSync'
import { useOutboxStatus } from '@/hooks/useOutboxStatus'
import { useVisualViewportHeight } from '@/hooks/useVisualViewportHeight'
import type { SaveExpenseResult } from '@/hooks/useExpenseSave'
import type { SaveReceiptResult } from '@/hooks/useReceiptSave'
import type { EditableExpense } from '@/lib/expenseTypes'
import {
  hasLocalAuthToken,
  refreshAccessTokenIfNeeded,
  requestStoragePersistence,
} from '@/lib/authStorage'
import { removeFromOutbox, removeReceiptGroupFromOutbox } from '@/lib/outbox'
import { useInviteCodeFromPath } from '@/hooks/useInviteCodeFromPath'
import { HomeScreen, CalendarScreen, LoginScreen } from '@/screens'

const StatsScreen = lazy(() =>
  import('@/screens/StatsScreen').then((m) => ({ default: m.StatsScreen }))
)

type ToastState = (SaveExpenseResult & { type?: 'expense' }) | SaveReceiptResult | null

function AuthLoadingScreen() {
  return (
    <div className="app-shell flex items-center justify-center">
      <p className="text-sm font-semibold text-muted-foreground">Cargando…</p>
    </div>
  )
}

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
  const keyboardOpen = useKeyboardOpen()

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
        onAdd={() => setSheetIntent({ type: 'add' })}
        onScan={() => setScanOpen(true)}
        pendingCount={pendingCount}
        hidden={keyboardOpen}
      />

      {!keyboardOpen && <BottomNav active={tab} onChange={setTab} />}

      {!keyboardOpen && <AndroidInstallBanner />}
      {!keyboardOpen && <IosInstallGuide />}

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

      {toast && !keyboardOpen && (
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

function AuthenticatedApp() {
  const { isLoading, isAuthenticated } = useConvexAuth()
  const offline = useIsOffline()
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  const hasStoredSession = hasLocalAuthToken(convexUrl)
  const offlineWithSession = offline && hasStoredSession
  const household = useQuery(api.households.getMyHousehold)
  const inviteCodeFromPath = useInviteCodeFromPath()
  const ensureUserReady = useMutation(api.households.ensureUserReady)
  const joinHousehold = useMutation(api.households.joinHousehold)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [recoveryState, setRecoveryState] = useState<'idle' | 'recovering' | 'failed'>('idle')
  const bootstrapAttempted = useRef(false)

  useDisplayModeAnalytics()

  useEffect(() => {
    void requestStoragePersistence()
  }, [])

  // Fallback: Convex Auth only loads JWT on mount; recover when refresh token remains.
  useEffect(() => {
    if (isLoading || isAuthenticated || !convexUrl || !hasStoredSession) return
    if (recoveryState !== 'idle') return
    setRecoveryState('recovering')

    void (async () => {
      const refreshed = await refreshAccessTokenIfNeeded(convexUrl)
      if (refreshed) {
        window.location.reload()
        return
      }
      setRecoveryState('failed')
    })()
  }, [isLoading, isAuthenticated, convexUrl, hasStoredSession, recoveryState])

  useEffect(() => {
    if (!isAuthenticated) return
    void requestStoragePersistence()
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || household === undefined || household !== null) return
    if (bootstrapAttempted.current) return
    bootstrapAttempted.current = true

    setBootstrapping(true)
    void (async () => {
      try {
        if (inviteCodeFromPath) {
          await joinHousehold({ inviteCode: inviteCodeFromPath })
          window.history.replaceState({}, '', '/')
        } else {
          await ensureUserReady({})
        }
      } catch {
        try {
          await ensureUserReady({})
        } catch {
          bootstrapAttempted.current = false
        }
      } finally {
        setBootstrapping(false)
      }
    })()
  }, [isAuthenticated, household, inviteCodeFromPath, ensureUserReady, joinHousehold])

  const recoveringSession =
    !isAuthenticated &&
    hasStoredSession &&
    recoveryState !== 'failed' &&
    (recoveryState === 'recovering' || recoveryState === 'idle')

  if (isLoading || bootstrapping || recoveringSession) {
    return <AuthLoadingScreen />
  }

  if (!isAuthenticated) {
    if (offlineWithSession) {
      return <AppShell />
    }
    return <LoginScreen />
  }

  if (household === undefined && !offlineWithSession) {
    return <AuthLoadingScreen />
  }

  if (!household && !offlineWithSession) {
    return <AuthLoadingScreen />
  }

  return <AppShell />
}

export default function App() {
  useVisualViewportHeight()

  if (!import.meta.env.VITE_CONVEX_URL) {
    return <ConvexConfigError />
  }

  return (
    <>
      <PwaUpdateBanner />
      <AuthenticatedApp />
    </>
  )
}
