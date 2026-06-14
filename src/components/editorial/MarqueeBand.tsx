interface MarqueeBandProps {
  items?: string[]
}

const DEFAULT = [
  'TAGANGA',
  'PESCADO',
  'CERVEZA',
  'CAFÉ',
  'HUEVOS',
  'PAN',
  'LIMÓNADA',
  'TAXI',
  'SUPER',
  'DOMICILIO',
  'OLÍMPICA',
  'PLAYA',
  'MANGO',
  'POLLO',
  'ARROZ',
]

export function MarqueeBand({ items = DEFAULT }: MarqueeBandProps) {
  const line = items.join(' ✦ ') + ' ✦ '
  const doubled = line + line

  return (
    <div className="marquee-band overflow-hidden" aria-hidden>
      <div className="marquee-track">
        <span>{doubled}</span>
        <span>{doubled}</span>
      </div>
    </div>
  )
}
