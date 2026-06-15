import { cn } from '@/lib/utils'

interface CameraFabIconProps {
  className?: string
}

export function CameraFabIcon({ className }: CameraFabIconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn('pointer-events-none select-none', className)}
    >
      <path
        d="M22 16h20l5 9H17l5-9z"
        fill="#D4DCE8"
        stroke="#1A2744"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect
        x="9"
        y="25"
        width="46"
        height="30"
        rx="6"
        fill="#E8EDF5"
        stroke="#1A2744"
        strokeWidth="2.5"
      />
      <rect x="27" y="18" width="10" height="6" rx="2" fill="#A8C4E8" stroke="#1A2744" strokeWidth="1.5" />
      <circle cx="32" cy="40" r="11" fill="#1A2744" />
      <circle cx="32" cy="40" r="9" fill="#7A9BC0" />
      <circle cx="32" cy="40" r="6.5" fill="#B8D4F0" />
      <circle cx="28.5" cy="37" r="2" fill="white" fillOpacity="0.75" />
      <path
        d="M35 43c1.5 1.2 3.5 1.2 5 0"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
      <rect x="13" y="47" width="9" height="4.5" rx="2.25" fill="#F5C842" stroke="#1A2744" strokeWidth="1.5" />
    </svg>
  )
}
