import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type KittyAnim = 'idle' | 'look' | 'nod' | 'stretch' | 'static'

interface KittySpriteProps {
  className?: string
  size?: number
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

const PLAY_MS: Record<KittyAnim, number> = {
  idle: 0,
  look: 700,
  nod: 1100,
  stretch: 1000,
  static: 0,
}

export function KittySprite({
  className,
  size = 64,
  anim = 'idle',
  pulseKey = 0,
  flip = true,
  playful = anim === 'idle',
}: KittySpriteProps) {
  const [active, setActive] = useState<KittyAnim>(anim)
  const playfulTimers = useRef<ReturnType<typeof setTimeout>[]>([])
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const busy = useRef(false)

  const clearPlayfulTimers = () => {
    playfulTimers.current.forEach(clearTimeout)
    playfulTimers.current = []
  }

  const later = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    playfulTimers.current.push(id)
  }

  const goIdle = () => {
    busy.current = false
    setActive('idle')
  }

  useEffect(() => {
    setActive(anim)
  }, [anim])

  // Guardar → nod (no usar row 4 happy, ojos cerrados = desaparece)
  useEffect(() => {
    if (pulseKey <= 0) return

    if (pulseTimer.current) clearTimeout(pulseTimer.current)
    busy.current = true
    setActive('nod')

    pulseTimer.current = setTimeout(() => {
      pulseTimer.current = null
      goIdle()
    }, PLAY_MS.nod)

    return () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current)
    }
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
        setActive(pick)
        later(() => {
          goIdle()
          schedule()
        }, PLAY_MS[pick])
      }, wait)
    }

    schedule()
    return clearPlayfulTimers
  }, [playful, anim])

  const wrapStyle = { '--kitty-size': `${size}px` } as React.CSSProperties
  const spriteStyle = { '--kitty-row': ROW[active] } as React.CSSProperties

  return (
    <div
      className={cn('kitty-sprite-wrap', flip && 'kitty-sprite-wrap--flip', className)}
      style={wrapStyle}
    >
      <div
        className={cn('kitty-sprite', ANIM_CLASS[active])}
        style={spriteStyle}
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
