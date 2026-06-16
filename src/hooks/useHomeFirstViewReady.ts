import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useFrequentQuickItems } from '@/hooks/useFrequentQuickItems'
import { useIsOffline } from '@/hooks/useIsOffline'
import { usePeriodTotals } from '@/hooks/usePeriodTotals'
import { useTagangaBackgroundReady } from '@/hooks/useTagangaBackgroundReady'
import { DEFAULT_EXPENSE_VIEW } from '@/lib/expenseScope'

const RECENT_LIST_LIMIT = 28
const HOME_BOOT_MIN_MS = 700
const HOME_BOOT_TIMEOUT_MS = 5000
const HOME_BOOT_OFFLINE_TIMEOUT_MS = 2500

/**
 * True cuando el Home tab tiene lo principal listo para mostrar sin skeletons:
 * foto Taganga, prefs de vista, totales hoy/semana/mes, acceso rápido y recientes.
 */
export function useHomeFirstViewReady(): boolean {
  const offline = useIsOffline()
  const tagangaReady = useTagangaBackgroundReady()
  const [minElapsed, setMinElapsed] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  const prefs = useQuery(api.userPreferences.getMyPreferences)
  const view = prefs?.expenseView ?? DEFAULT_EXPENSE_VIEW

  const { today, week, month } = usePeriodTotals(view)
  const recentExpenses = useQuery(api.expenses.recentExpenses, {
    limit: RECENT_LIST_LIMIT,
    view,
  })
  const frequentQuick = useFrequentQuickItems(view, 3)
  const recentOne = useQuery(api.expenses.recentExpenses, { limit: 1, view })

  useEffect(() => {
    const timer = window.setTimeout(() => setMinElapsed(true), HOME_BOOT_MIN_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const timeoutMs = offline ? HOME_BOOT_OFFLINE_TIMEOUT_MS : HOME_BOOT_TIMEOUT_MS
    const timer = window.setTimeout(() => setTimedOut(true), timeoutMs)
    return () => window.clearTimeout(timer)
  }, [offline])

  const dataReady =
    prefs !== undefined &&
    today !== undefined &&
    week !== undefined &&
    month !== undefined &&
    recentExpenses !== undefined &&
    frequentQuick !== undefined &&
    recentOne !== undefined

  return tagangaReady && minElapsed && (dataReady || timedOut)
}
