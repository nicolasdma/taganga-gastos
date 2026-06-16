const JWT_KEY = '__convexAuthJWT'
const REFRESH_KEY = '__convexAuthRefreshToken'

function escapeNamespace(url: string) {
  return url.replace(/[^a-zA-Z0-9]/g, '')
}

function authKeys(convexUrl: string) {
  const ns = escapeNamespace(convexUrl)
  return {
    jwt: `${JWT_KEY}_${ns}`,
    refresh: `${REFRESH_KEY}_${ns}`,
  }
}

/** True when Convex Auth tokens exist in localStorage for this deployment. */
export function hasLocalAuthToken(convexUrl?: string): boolean {
  if (typeof window === 'undefined' || !convexUrl) return false
  const keys = authKeys(convexUrl)
  const jwt = localStorage.getItem(keys.jwt)
  const refresh = localStorage.getItem(keys.refresh)
  return Boolean(jwt || refresh)
}

export interface AuthStoragePresence {
  hasJwt: boolean
  hasRefresh: boolean
}

/** Debug helper: report localStorage token presence without exposing token values. */
export function getLocalAuthStoragePresence(convexUrl?: string): AuthStoragePresence {
  if (typeof window === 'undefined' || !convexUrl) {
    return { hasJwt: false, hasRefresh: false }
  }

  const keys = authKeys(convexUrl)
  return {
    hasJwt: Boolean(localStorage.getItem(keys.jwt)),
    hasRefresh: Boolean(localStorage.getItem(keys.refresh)),
  }
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
