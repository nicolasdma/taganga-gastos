import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CollageStickerProps {
  children: ReactNode
  className?: string
  tone?: 'cream' | 'sage' | 'blush' | 'cobalt'
  rotate?: 'left' | 'right' | 'none'
}

const TONES = {
  cream: 'bg-porcelain-cream text-ink border-stitch/50',
  sage: 'bg-yarn-sage/35 text-ink border-yarn-sage',
  blush: 'bg-yarn-blush/50 text-clay-deep border-clay/30',
  cobalt: 'bg-cobalt-glaze/15 text-cobalt-deep border-cobalt-glaze/40',
}

const ROTATE = {
  left: '-rotate-3',
  right: 'rotate-2',
  none: 'rotate-0',
}

export function CollageSticker({
  children,
  className,
  tone = 'cream',
  rotate = 'left',
}: CollageStickerProps) {
  return (
    <span
      className={cn(
        'collage-sticker inline-flex items-center gap-1',
        'px-2.5 py-1 rounded-full border-2',
        'text-[10px] font-bold font-display tracking-wide',
        'shadow-collage',
        TONES[tone],
        ROTATE[rotate],
        className
      )}
    >
      {children}
    </span>
  )
}
