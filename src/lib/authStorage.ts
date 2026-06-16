const JWT_KEY = '__convexAuthJWT'
const REFRESH_KEY = '__convexAuthRefreshToken'

function escapeNamespace(url: string) {
  return url.replace(/[^a-zA-Z0-9]/g, '')
}

/** True when Convex Auth tokens exist in localStorage for this deployment. */
export function hasLocalAuthToken(convexUrl?: string): boolean {
  if (typeof window === 'undefined' || !convexUrl) return false
  const ns = escapeNamespace(convexUrl)
  const jwt = localStorage.getItem(`${JWT_KEY}_${ns}`)
  const refresh = localStorage.getItem(`${REFRESH_KEY}_${ns}`)
  return Boolean(jwt || refresh)
}

/**
 * Ask the browser to mark storage as persistent (reduces eviction on mobile).
 * Note: Safari browser tab vs installed PWA use separate storage partitions on iOS.
 */
export async function requestStoragePersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false
  } catch {
    return false
  }
}
