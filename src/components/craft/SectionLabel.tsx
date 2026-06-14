import type { ReactNode } from 'react'
import { CrochetRule } from '@/components/craft/CrochetRule'
import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: ReactNode
  className?: string
  /** Sobre foto Taganga — texto blanco con sombra */
  overPhoto?: boolean
}

export function SectionLabel({ children, className, overPhoto }: SectionLabelProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 mb-2.5',
        overPhoto && 'section-label--over-photo',
        className
      )}
    >
      <CrochetRule className={cn('flex-1 max-w-[2.5rem]', overPhoto ? 'text-white/50' : 'text-stitch/70')} />
      <p className="label-stitch shrink-0">{children}</p>
      <CrochetRule className={cn('flex-1', overPhoto ? 'text-white/50' : 'text-stitch/70')} />
    </div>
  )
}
