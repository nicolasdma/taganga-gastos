import { cn } from '@/lib/utils'

/** Tres puntos con ritmo lento — onda suave, no spinner. */
export function CraftLoadingDots({ className }: { className?: string }) {
  return (
    <span className={cn('craft-loading-dots', className)} aria-hidden>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  )
}

interface CraftScreenMessageProps {
  text: string
  className?: string
}

export function CraftScreenMessage({ text, className }: CraftScreenMessageProps) {
  return (
    <p className={cn('boot-screen__msg', className)}>
      {text}
      <CraftLoadingDots />
    </p>
  )
}

/** Para aria-label / lectores de pantalla */
export function screenMessageA11y(text: string): string {
  return `${text}…`
}
