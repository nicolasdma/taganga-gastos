import { useEffect, useMemo, useState } from 'react'
import { getTzOffsetMinutes, localDateKey } from '@/lib/dates'

export function useLocalToday() {
  const [todayKey, setTodayKey] = useState(() => localDateKey())
  const tzOffsetMinutes = useMemo(() => getTzOffsetMinutes(), [])

  useEffect(() => {
    const check = () => {
      const next = localDateKey()
      setTodayKey((prev) => (prev === next ? prev : next))
    }

    check()
    const id = window.setInterval(check, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return { todayKey, tzOffsetMinutes }
}
