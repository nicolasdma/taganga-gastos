import { Delete } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { keyTapFeedback } from '@/lib/tapFeedback'

interface NumericKeypadProps {
  value: number
  onChange: (value: number) => void
  onDone?: () => void
  maxValue?: number
  compact?: boolean
  className?: string
}

interface NumKeyProps {
  children: React.ReactNode
  onPress: () => void
  className?: string
  ariaLabel?: string
}

function NumKey({ children, onPress, className, ariaLabel }: NumKeyProps) {
  const [flash, setFlash] = useState(false)

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onPointerDown={() => {
        keyTapFeedback()
        setFlash(true)
        window.setTimeout(() => setFlash(false), 50)
      }}
      onClick={onPress}
      className={cn(
        'rounded-2xl chip-tile font-bold text-foreground active:scale-[0.97] active:shadow-none transition-transform',
        flash && 'bg-cobalt-glaze/10',
        className
      )}
    >
      {children}
    </button>
  )
}

export function NumericKeypad({
  value,
  onChange,
  onDone,
  maxValue = 99_999_999,
  compact = false,
  className,
}: NumericKeypadProps) {
  const keyH = compact ? 'h-10 text-lg' : 'h-12 text-xl'

  const appendDigit = (digit: number) => {
    const next = value * 10 + digit
    if (next > maxValue) return
    onChange(next)
  }

  const backspace = () => {
    onChange(Math.floor(value / 10))
  }

  return (
    <div className={cn('select-none', className)} role="group" aria-label="Teclado numérico">
      <div className="grid grid-cols-3 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <NumKey
            key={digit}
            onPress={() => appendDigit(digit)}
            className={keyH}
          >
            {digit}
          </NumKey>
        ))}
        <NumKey onPress={backspace} className={cn('flex items-center justify-center', keyH)} ariaLabel="Borrar">
          <Delete className="h-5 w-5 text-muted-foreground" />
        </NumKey>
        <NumKey onPress={() => appendDigit(0)} className={cn('col-span-2', keyH)}>
          0
        </NumKey>
      </div>
      {onDone && (
        <button
          type="button"
          onClick={onDone}
          className={cn(
            'w-full mt-2 rounded-2xl btn-cobalt text-sm font-bold active:shadow-none active:translate-y-px',
            compact ? 'h-9' : 'h-10'
          )}
        >
          Listo
        </button>
      )}
    </div>
  )
}
