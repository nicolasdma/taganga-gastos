import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { KeyboardLayout } from './keyboardLayouts'

export interface CraftKeyboardSession {
  fieldId: string
  layout: KeyboardLayout
  compact: boolean
  uppercase: boolean
  enableShift: boolean
  onChar: (char: string) => void
  onBackspace: () => void
  onDone: () => void
  /** Close keyboard without running onDone (e.g. tap outside). */
  onDismiss: () => void
  onToggleCase: () => void
}

type SessionMeta = Pick<
  CraftKeyboardSession,
  'fieldId' | 'layout' | 'compact' | 'uppercase' | 'enableShift'
>

function sessionMetaEqual(a: SessionMeta, b: SessionMeta): boolean {
  return (
    a.fieldId === b.fieldId &&
    a.layout === b.layout &&
    a.compact === b.compact &&
    a.uppercase === b.uppercase &&
    a.enableShift === b.enableShift
  )
}

interface CraftKeyboardContextValue {
  dock: boolean
  activeFieldId: string | null
  /** Metadata for rendering; handlers live in the session ref. */
  session: SessionMeta | null
  getSession: () => CraftKeyboardSession | null
  focusField: (id: string) => void
  blurField: (id: string) => void
  setSession: (session: CraftKeyboardSession) => void
  clearSession: (fieldId: string) => void
  dismissKeyboard: () => void
}

const CraftKeyboardContext = createContext<CraftKeyboardContextValue | null>(null)

function isKeyboardKeepOpenTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest('.craft-text-field') || target.closest('.craft-keyboard-dock')
  )
}

export function useCraftKeyboardContext() {
  return useContext(CraftKeyboardContext)
}

export function CraftKeyboardProvider({
  children,
  dock = true,
}: {
  children: ReactNode
  /** When true, keyboard renders in CraftKeyboardDock instead of below each field. */
  dock?: boolean
}) {
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(null)
  const sessionRef = useRef<CraftKeyboardSession | null>(null)

  const getSession = useCallback(() => sessionRef.current, [])

  const focusField = useCallback((id: string) => {
    setActiveFieldId(id)
  }, [])

  const blurField = useCallback((id: string) => {
    setActiveFieldId((current) => (current === id ? null : current))
    if (sessionRef.current?.fieldId === id) {
      sessionRef.current = null
      setSessionMeta(null)
    }
  }, [])

  const setSession = useCallback((next: CraftKeyboardSession) => {
    sessionRef.current = next

    const meta: SessionMeta = {
      fieldId: next.fieldId,
      layout: next.layout,
      compact: next.compact,
      uppercase: next.uppercase,
      enableShift: next.enableShift,
    }

    setSessionMeta((current) => {
      if (current && sessionMetaEqual(current, meta)) return current
      return meta
    })

    setActiveFieldId((current) => (current === next.fieldId ? current : next.fieldId))
  }, [])

  const clearSession = useCallback((fieldId: string) => {
    if (sessionRef.current?.fieldId !== fieldId) return
    sessionRef.current = null
    setSessionMeta(null)
    setActiveFieldId((current) => (current === fieldId ? null : current))
  }, [])

  const dismissKeyboard = useCallback(() => {
    const session = sessionRef.current
    if (!session) return
    session.onDismiss()
  }, [])

  useEffect(() => {
    if (!sessionMeta) return

    const onPointerDown = (event: PointerEvent) => {
      if (isKeyboardKeepOpenTarget(event.target)) return
      dismissKeyboard()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [sessionMeta, dismissKeyboard])

  const value = useMemo(
    () => ({
      dock,
      activeFieldId,
      session: sessionMeta,
      getSession,
      focusField,
      blurField,
      setSession,
      clearSession,
      dismissKeyboard,
    }),
    [
      dock,
      activeFieldId,
      sessionMeta,
      getSession,
      focusField,
      blurField,
      setSession,
      clearSession,
      dismissKeyboard,
    ]
  )

  return createElement(CraftKeyboardContext.Provider, { value }, children)
}

/** Ensures only one CraftTextField keyboard is open at a time within a provider. */
export function useCraftKeyboardField(
  controlledFocused?: boolean,
  onFocus?: () => void,
  onBlur?: () => void
) {
  const autoId = useId()
  const ctx = useContext(CraftKeyboardContext)
  const [localFocused, setLocalFocused] = useState(false)

  const isControlled = controlledFocused !== undefined

  const isFocused = isControlled
    ? controlledFocused
    : ctx
      ? ctx.activeFieldId === autoId
      : localFocused

  const focus = useCallback(() => {
    if (isControlled) {
      onFocus?.()
      return
    }
    if (ctx) {
      ctx.focusField(autoId)
      return
    }
    setLocalFocused(true)
  }, [isControlled, onFocus, ctx, autoId])

  const blur = useCallback(() => {
    if (isControlled) {
      onBlur?.()
      return
    }
    if (ctx) {
      ctx.blurField(autoId)
      return
    }
    setLocalFocused(false)
  }, [isControlled, onBlur, ctx, autoId])

  return { fieldId: autoId, isFocused, focus, blur }
}
