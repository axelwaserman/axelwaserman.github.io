import { generateLines, type ChordLine } from '@/lib/mandala'

interface MandalaSVGProps {
  n: number
  k: number
}

export default function MandalaSVG({ n, k }: MandalaSVGProps) {
  const lines: ChordLine[] = generateLines(n, k)
  const ariaLabel = `Decorative pattern: chords drawn between ${n} points on a circle, connecting each point to its multiple of ${k}`

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
      aria-describedby="mandala-caption"
      className="w-full h-full"
    >
      {lines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="var(--color-text)"
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </svg>
  )
}
