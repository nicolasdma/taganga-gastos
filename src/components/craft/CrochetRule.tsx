import { useId } from 'react'
import { cn } from '@/lib/utils'

interface CrochetRuleProps {
  className?: string
}

/** Divisor estilo cadena de crochet */
export function CrochetRule({ className }: CrochetRuleProps) {
  const patternId = useId().replace(/:/g, '')

  return (
    <div className={cn('crochet-rule', className)} aria-hidden>
      <svg viewBox="0 0 320 12" preserveAspectRatio="none" className="w-full h-3">
        <defs>
          <pattern id={patternId} x="0" y="0" width="16" height="12" patternUnits="userSpaceOnUse">
            <path
              d="M2 6 C2 2 6 2 8 6 C10 10 14 10 14 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </pattern>
        </defs>
        <rect width="100%" height="12" fill={`url(#${patternId})`} />
      </svg>
    </div>
  )
}
