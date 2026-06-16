import { useCallback, useEffect, useRef } from 'react'
import type { TabId } from '@/components/BottomNav'
import { useTabScroll } from '@/components/editorial/AppBrandmarkDock'

/** Attach to a tab's scroll container; syncs offset for the persistent brandmark dock. */
export function useReportTabScroll(tab: TabId) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { reportScroll } = useTabScroll()
  const rafRef = useRef<number | null>(null)

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      reportScroll(tab, el.scrollTop)
    })
  }, [reportScroll, tab])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    reportScroll(tab, el.scrollTop)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [tab, onScroll, reportScroll])

  return scrollRef
}
