import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Low-level styled input. For text entry in the app UI, prefer CraftTextField
 * (readOnly + custom keyboard) so iOS/Android never open the OS keyboard.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, readOnly = true, inputMode = 'none', ...props }, ref) => {
    return (
      <input
        type={type}
        readOnly={readOnly}
        inputMode={inputMode}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'flex h-11 w-full rounded-xl border-2 border-input bg-porcelain-cream px-4 py-2 text-base font-medium ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-cobalt-glaze focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
