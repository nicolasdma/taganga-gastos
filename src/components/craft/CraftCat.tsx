import { cn } from '@/lib/utils'

interface CraftCatProps {
  className?: string
  variant?: 'sit' | 'peek' | 'sleep'
}

/** Gatito line-art estilo bordado / porcelana pintada a mano */
export function CraftCat({ className, variant = 'sit' }: CraftCatProps) {
  if (variant === 'peek') {
    return (
      <svg
        viewBox="0 0 64 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('craft-cat', className)}
        aria-hidden
      >
        <ellipse cx="32" cy="38" rx="22" ry="8" fill="#2a4060" opacity="0.08" />
        <path
          d="M8 36 C8 22 18 14 32 14 C46 14 56 22 56 36"
          stroke="#3d5a80"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="#fbf7f0"
        />
        <path d="M14 18 L10 8 L20 16" stroke="#3d5a80" strokeWidth="2" strokeLinejoin="round" fill="#fbf7f0" />
        <path d="M50 18 L54 8 L44 16" stroke="#3d5a80" strokeWidth="2" strokeLinejoin="round" fill="#fbf7f0" />
        <circle cx="24" cy="28" r="2.5" fill="#1a2744" />
        <circle cx="40" cy="28" r="2.5" fill="#1a2744" />
        <ellipse cx="32" cy="33" rx="2" ry="1.5" fill="#c4725a" />
        <path d="M28 31 L32 34 L36 31" stroke="#c4725a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M18 24 Q24 26 28 24" stroke="#3d5a80" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M36 24 Q42 26 46 24" stroke="#3d5a80" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    )
  }

  if (variant === 'sleep') {
    return (
      <svg
        viewBox="0 0 80 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('craft-cat', className)}
        aria-hidden
      >
        <ellipse cx="40" cy="46" rx="28" ry="7" fill="#2a4060" opacity="0.07" />
        <ellipse cx="40" cy="32" rx="26" ry="18" fill="#fbf7f0" stroke="#3d5a80" strokeWidth="2" />
        <path d="M18 22 L14 10 L26 18" stroke="#3d5a80" strokeWidth="2" fill="#fbf7f0" strokeLinejoin="round" />
        <path d="M62 22 L66 10 L54 18" stroke="#3d5a80" strokeWidth="2" fill="#fbf7f0" strokeLinejoin="round" />
        <path d="M28 30 Q40 34 52 30" stroke="#1a2744" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <text x="58" y="18" fontSize="10" fill="#4a6fa5" opacity="0.7">
          z z
        </text>
        <path
          d="M12 38 Q40 44 68 38"
          stroke="#b8a898"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3 4"
          opacity="0.6"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 72 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('craft-cat', className)}
      aria-hidden
    >
      <ellipse cx="36" cy="72" rx="24" ry="6" fill="#2a4060" opacity="0.1" />
      <path
        d="M20 48 C16 58 18 68 36 68 C54 68 56 58 52 48 L48 32 C46 24 42 18 36 18 C30 18 26 24 24 32 Z"
        fill="#fbf7f0"
        stroke="#3d5a80"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M24 22 L20 8 L30 18" stroke="#3d5a80" strokeWidth="2" fill="#fbf7f0" strokeLinejoin="round" />
      <path d="M48 22 L52 8 L42 18" stroke="#3d5a80" strokeWidth="2" fill="#fbf7f0" strokeLinejoin="round" />
      <circle cx="28" cy="38" r="3" fill="#1a2744" />
      <circle cx="44" cy="38" r="3" fill="#1a2744" />
      <circle cx="29" cy="37" r="1" fill="#fbf7f0" opacity="0.6" />
      <circle cx="45" cy="37" r="1" fill="#fbf7f0" opacity="0.6" />
      <path d="M32 44 L36 47 L40 44" stroke="#c4725a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="36" cy="43" rx="2.5" ry="2" fill="#c4725a" opacity="0.35" />
      <path d="M36 52 L36 62" stroke="#3d5a80" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 58 L36 62 L42 58" stroke="#3d5a80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 36 Q26 38 28 36" stroke="#3d5a80" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M44 36 Q48 38 50 36" stroke="#3d5a80" strokeWidth="0.8" fill="none" opacity="0.4" />
    </svg>
  )
}
