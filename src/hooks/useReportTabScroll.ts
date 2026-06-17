import { useRef } from 'react'

/** Attach to a tab's scroll container. Kept as a small ref helper for screen consistency. */
export function useReportTabScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)
  return scrollRef
}
