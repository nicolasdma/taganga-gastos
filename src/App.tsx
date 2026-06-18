import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useConvexAuth } from 'convex/react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'
import { BottomNav, type TabId } from '@/components/BottomNav'
import { ConvexConfigError } from '@/components/ConvexConfigError'
import { ExpenseEditSheet } from '@/components/ExpenseEditSheet'
import type { EditableExpense } from '@/lib/expenseTypes'
import { ExpenseSheet, type SaveExpenseResult, type SheetIntent } from '@/components/ExpenseSheet'
import { FabStack } from '@/components/FabStack'
import { AndroidInstallBanner } from '@/components/InstallPromptBanner'
import { IosInstallGuide } from '@/components/IosInstallGuide'
import { PwaUpdateBanner } from '@/components/PwaUpdateBanner'
import { ReceiptScanSheet, type SaveReceiptResult } from '@/components/ReceiptScanSheet'
import { CraftBootOverlay } from '@/components/craft/CraftBootOverlay'
import { CraftBootScreen } from '@/components/craft/CraftBootScreen'
import { CraftStatsFallback } from '@/components/craft/CraftLoading'
import { BrandmarkProvider } from '@/components/editorial/AppBrandmarkDock'
import { TagangaBackground } from '@/components/TagangaBackground'
import { Toast } from '@/components/Toast'
import { useHomeFirstViewReady } from '@/hooks/useHomeFirstViewReady'
import { useDisplayModeAnalytics } from '@/hooks/useDisplayModeAnalytics'
import { useIsOffline } from '@/hooks/useIsOffline'
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen'
import { useOutboxSync } from '@/hooks/useOutboxSync'
import { useOutboxStatus } from '@/hooks/useOutboxStatus'
import { ExpenseViewProvider, useExpenseView } from '@/hooks/useExpenseView'
import { useVisualViewportHeight } from '@/hooks/useVisualViewportHeight'
import { hasLocalAuthToken, requestStoragePersistence } from '@/lib/authStorage'
import { removeFromOutbox, removeReceiptGroupFromOutbox } from '@/lib/outbox'
import {
  getExpenseSavedRitualCopy,
  getReceiptSavedRitualCopy,
  type RitualCopy,
} from '@/lib/ritualCopy'
import { cn } from '@/lib/utils'
import { useInviteCodeFromPath } from '@/hooks/useInviteCodeFromPath'
import { HomeScreen, CalendarScreen, LoginScreen, DebugAuthScreen } from '@/screens'

const StatsScreen = lazy(() =>
  import('@/screens/StatsScreen').then((m) => ({ default: m.StatsScreen }))
)

type ToastState = (SaveExpenseResult & { type?: 'expense' }) | SaveReceiptResult | null

interface RitualLineState {
  key: number
  message: string
  ariaLabel?: string
}

function AuthLoadingScreen() {
  return <CraftBootScreen />
}

function StatsFallback() {
  return <CraftStatsFallback />
}

const HOME_BACKGROUND_BEAT_MS = 0

function AppShellInner() {
  const [tab, setTab] = useState<TabId>('home')
  const [sheetIntent, setSheetIntent] = useState<SheetIntent | null>(null)
  const [scanOpen, setScanOpen] = useState(false)
  const [editExpense, setEditExpense] = useState<EditableExpense | null>(null)
  const [pulseKey, setPulseKey] = useState(0)
  const [toast, setToast] = useState<ToastState>(null)
  const [ritualLine, setRitualLine] = useState<RitualLineState | null>(null)
  const ritualLineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keyboardOpen = useKeyboardOpen()
  const homeReady = useHomeFirstViewReady()
  const [bootOverlay, setBootOverlay] = useState<'visible' | 'exiting' | 'gone'>('visible')
  const [contentRevealed, setContentRevealed] = useState(false)
  const [statsMounted, setStatsMounted] = useState(false)

  useEffect(() => {
    if (!homeReady || bootOverlay !== 'visible') return
    const frame = window.requestAnimationFrame(() => {
      setBootOverlay('exiting')
    })
    return () => window.cancelAnimationFrame(frame)
  }, [homeReady, bootOverlay])

  const handleBootExited = useCallback(() => {
    setBootOverlay('gone')
    window.setTimeout(() => setContentRevealed(true), HOME_BACKGROUND_BEAT_MS)
  }, [])

  useOutboxSync()
  const pendingCount = useOutboxStatus()
  const { view, setView } = useExpenseView()
  const setExpenseExcluded = useMutation(api.expenses.setExpenseExcluded)
  const excludeReceiptGroup = useMutation(api.expenses.excludeReceiptGroup)

  const bump = useCallback(() => setPulseKey((k) => k + 1), [])

  const showRitualLine = useCallback((copy: RitualCopy) => {
    setRitualLine((current) => ({
      key: (current?.key ?? 0) + 1,
      message: copy.homeLine,
      ariaLabel: copy.ariaLabel,
    }))

    if (ritualLineTimerRef.current !== null) {
      clearTimeout(ritualLineTimerRef.current)
    }

    ritualLineTimerRef.current = setTimeout(() => {
      ritualLineTimerRef.current = null
      setRitualLine(null)
    }, 5200)
  }, [])

  useEffect(() => {
    return () => {
      if (ritualLineTimerRef.current !== null) {
        clearTimeout(ritualLineTimerRef.current)
      }
    }
  }, [])

  const handleTabChange = useCallback((next: TabId) => {
    if (next === 'stats') setStatsMounted(true)
    setTab(next)
  }, [])

  const handleExpenseSaved = useCallback(
    (result: SaveExpenseResult) => {
      bump()
      showRitualLine(
        getExpenseSavedRitualCopy({
          view: result.scope,
          type: 'expense',
          itemLabel: result.itemLabel,
          amount: result.amount,
        })
      )
      setToast({ ...result, type: 'expense' })
    },
    [bump, showRitualLine]
  )

  const handleReceiptSaved = useCallback(
    (result: SaveReceiptResult) => {
      bump()
      showRitualLine(
        getReceiptSavedRitualCopy({
          view: result.scope,
          type: 'receipt',
          itemCount: result.itemCount,
        })
      )
      setToast(result)
    },
    [bump, showRitualLine]
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

  const toastCopy =
    toast?.type === 'receipt'
      ? getReceiptSavedRitualCopy({
          view: toast.scope,
          type: 'receipt',
          itemCount: toast.itemCount,
        })
      : toast
        ? getExpenseSavedRitualCopy({
            view: toast.scope,
            type: 'expense',
            itemLabel: toast.itemLabel,
            amount: toast.amount,
          })
        : null

  return (
    <BrandmarkProvider
      view={view}
      onViewChange={setView}
      pulseKey={pulseKey}
      pendingCount={pendingCount}
      hidden={keyboardOpen}
    >
      <div
        className={cn(
          'app-shell flex flex-col bg-transparent',
          bootOverlay !== 'gone' && 'app-shell--booting',
          !contentRevealed && 'app-shell--content-hold',
          contentRevealed && 'app-shell--content-revealed'
        )}
      >
        <TagangaBackground />

      <main
        className="relative z-10 flex-1 min-h-0 overflow-hidden"
        aria-hidden={!contentRevealed}
      >
        <div className={cn('h-full', tab !== 'home' && 'hidden')}>
          <HomeScreen
            pulseKey={pulseKey}
            ritualLine={ritualLine}
            onOpenSheet={setSheetIntent}
            onOpenStats={() => handleTabChange('stats')}
            onSaved={handleExpenseSaved}
            onEditExpense={setEditExpense}
            onPendingRemoved={bump}
          />
        </div>
        <div className={cn('h-full', tab !== 'calendar' && 'hidden')}>
          <CalendarScreen active={tab === 'calendar'} onEditExpense={setEditExpense} />
        </div>
        {statsMounted && (
          <div className={cn('h-full', tab !== 'stats' && 'hidden')}>
            <Suspense fallback={<StatsFallback />}>
              <StatsScreen active={tab === 'stats'} />
            </Suspense>
          </div>
        )}
      </main>

      <FabStack
        onAdd={() => setSheetIntent({ type: 'add' })}
        onScan={() => setScanOpen(true)}
        pendingCount={pendingCount}
        hidden={keyboardOpen || !contentRevealed}
        compact={tab === 'home'}
      />

      {!keyboardOpen && contentRevealed && <BottomNav active={tab} onChange={handleTabChange} />}

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
          message={toastCopy?.toastMessage ?? ''}
          actionLabel="Deshacer"
          onAction={handleUndo}
          onDismiss={() => setToast(null)}
        />
      )}

      {bootOverlay !== 'gone' && (
        <CraftBootOverlay
          exiting={bootOverlay === 'exiting'}
          onExited={handleBootExited}
        />
      )}
      </div>
    </BrandmarkProvider>
  )
}

function AppShell() {
  return (
    <ExpenseViewProvider>
      <AppShellInner />
    </ExpenseViewProvider>
  )
}

function AuthenticatedApp() {
  const { isLoading, isAuthenticated, isRefreshing } = useConvexAuth()
  const offline = useIsOffline()
  const convexUrl = import.meta.env.VITE_CONVEX_URL
  const hasStoredSession = hasLocalAuthToken(convexUrl)
  const offlineWithSession = offline && hasStoredSession
  const household = useQuery(
    api.households.getMyHousehold,
    isAuthenticated && !isLoading ? {} : 'skip'
  )
  const inviteCodeFromPath = useInviteCodeFromPath()
  const ensureUserReady = useMutation(api.households.ensureUserReady)
  const joinHousehold = useMutation(api.households.joinHousehold)
  const [bootstrapping, setBootstrapping] = useState(false)
  const bootstrapAttempted = useRef(false)

  useDisplayModeAnalytics()

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

  if (isLoading || isRefreshing || bootstrapping) {
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
  const isDebugAuthRoute =
    typeof window !== 'undefined' && window.location.pathname === '/debug-auth'

  if (!import.meta.env.VITE_CONVEX_URL) {
    return <ConvexConfigError />
  }

  if (isDebugAuthRoute) {
    return <DebugAuthScreen />
  }

  return (
    <>
      <PwaUpdateBanner />
      <AuthenticatedApp />
    </>
  )
}
