import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type KittyAnim = 'idle' | 'look' | 'nod' | 'stretch' | 'static'

interface KittySpriteProps {
  className?: string
  size?: number
  /** Inherit --kitty-size from parent CSS instead of setting an inline size. */
  inheritSize?: boolean
  anim?: KittyAnim
  /** Cambia → nod rápido (guardar) */
  pulseKey?: number
  flip?: boolean
  playful?: boolean
}

/** Fila Y en el spritesheet (32px por fila) */
const ROW: Record<KittyAnim, number> = {
  idle: 0,
  look: 1,
  nod: 3,
  stretch: 6,
  static: 7,
}

const ANIM_CLASS: Record<KittyAnim, string> = {
  idle: 'kitty-sprite--idle',
  look: 'kitty-sprite--look',
  nod: 'kitty-sprite--nod',
  stretch: 'kitty-sprite--stretch',
  static: 'kitty-sprite--static',
}

const PLAYFUL: KittyAnim[] = ['look', 'nod', 'stretch']

export function KittySprite({
  className,
  size = 64,
  inheritSize = false,
  anim = 'idle',
  pulseKey = 0,
  flip = true,
  playful = anim === 'idle',
}: KittySpriteProps) {
  const [active, setActive] = useState<KittyAnim>(anim)
  const spriteRef = useRef<HTMLDivElement>(null)
  const playfulTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const onAnimEnd = useRef<(() => void) | null>(null)
  const busy = useRef(false)

  const clearPlayfulTimers = () => {
    playfulTimers.current.forEach(clearTimeout)
    playfulTimers.current = []
  }

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    playfulTimers.current.push(id)
  }

  const snapToIdleFrame = () => {
    const el = spriteRef.current
    if (!el) return
    el.style.animation = 'none'
    el.style.setProperty('--kitty-row', String(ROW.idle))
    void el.offsetWidth
    el.style.removeProperty('animation')
  }

  const goIdle = () => {
    onAnimEnd.current = null
    snapToIdleFrame()
    busy.current = false
    setActive('idle')
  }

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (!event.animationName.startsWith('kitty-x')) return

    const done = onAnimEnd.current
    if (!done) return
    onAnimEnd.current = null
    done()
  }

  useEffect(() => {
    queueMicrotask(() => setActive(anim))
  }, [anim])

  // Guardar → nod (no usar row 4 happy, ojos cerrados = desaparece)
  useEffect(() => {
    if (pulseKey <= 0) return

    busy.current = true
    onAnimEnd.current = goIdle
    queueMicrotask(() => setActive('nod'))
  }, [pulseKey])

  // Acciones random — timers separados del pulse para no romper el loop
  useEffect(() => {
    if (!playful || anim === 'static') return

    const schedule = () => {
      const wait = 2800 + Math.random() * 5500
      later(() => {
        if (busy.current) {
          schedule()
          return
        }
        const pick = PLAYFUL[Math.floor(Math.random() * PLAYFUL.length)]
        busy.current = true
        onAnimEnd.current = () => {
          goIdle()
          schedule()
        }
        setActive(pick)
      }, wait)
    }

    schedule()
    return () => {
      clearPlayfulTimers()
      onAnimEnd.current = null
    }
  }, [playful, anim])

  const wrapStyle = inheritSize ? undefined : ({ '--kitty-size': `${size}px` } as CSSProperties)
  const spriteStyle = { '--kitty-row': ROW[active] } as CSSProperties

  return (
    <div
      className={cn('kitty-sprite-wrap', flip && 'kitty-sprite-wrap--flip', className)}
      style={wrapStyle}
    >
      <div
        ref={spriteRef}
        className={cn('kitty-sprite', ANIM_CLASS[active])}
        style={spriteStyle}
        onAnimationEnd={handleAnimationEnd}
        role="img"
        aria-label="Gatito Taganga"
      />
    </div>
  )
}

export function kittyAnimFromVariant(variant?: 'peek' | 'sit' | 'sleep'): KittyAnim {
  if (variant === 'sleep') return 'static'
  return 'idle'
}

export function kittyPlayfulFromVariant(variant?: 'peek' | 'sit' | 'sleep'): boolean {
  return variant !== 'sleep'
}
