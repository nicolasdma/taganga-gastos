import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumericKeypadProps {
  value: number
  onChange: (value: number) => void
  onDone?: () => void
  maxValue?: number
  compact?: boolean
  className?: string
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
          <button
            key={digit}
            type="button"
            onClick={() => appendDigit(digit)}
            className={cn(
              'rounded-2xl chip-tile font-bold text-foreground active:translate-y-0.5 active:shadow-none',
              keyH
            )}
          >
            {digit}
          </button>
        ))}
        <button
          type="button"
          onClick={backspace}
          className={cn(
            'rounded-2xl chip-tile flex items-center justify-center active:translate-y-0.5 active:shadow-none',
            keyH
          )}
          aria-label="Borrar"
        >
          <Delete className="h-5 w-5 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={() => appendDigit(0)}
          className={cn(
            'rounded-2xl chip-tile font-bold text-foreground active:translate-y-0.5 active:shadow-none col-span-2',
            keyH
          )}
        >
          0
        </button>
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
