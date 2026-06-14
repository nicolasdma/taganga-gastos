import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MotionRevealProps {
  children: ReactNode
  className?: string
  /** 1–8 — delay de entrada escalonada */
  step?: number
}

export function MotionReveal({ children, className, step = 1 }: MotionRevealProps) {
  const clamped = Math.min(8, Math.max(1, step))
  return (
    <div className={cn(`reveal-step-${clamped}`, className)} style={{ animationDelay: `${(clamped - 1) * 70}ms` }}>
      {children}
    </div>
  )
}
