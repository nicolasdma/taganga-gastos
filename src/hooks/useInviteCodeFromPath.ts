import { useMemo } from 'react'

export function useInviteCodeFromPath(): string | undefined {
  return useMemo(() => {
    const match = window.location.pathname.match(/^\/join\/([^/]+)/i)
    return match?.[1]?.toUpperCase()
  }, [])
}
