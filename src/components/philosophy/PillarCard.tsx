import type { Pillar } from '@/data/philosophy'

interface PillarCardProps {
  pillar: Pillar
  index: number
}

export default function PillarCard({ pillar, index }: PillarCardProps) {
  const numeral = String(index + 1).padStart(2, '0')

  return (
    <article className="bg-[var(--color-surface)] text-[var(--color-text)] rounded-[var(--radius-card)] border border-[var(--color-muted)]/20 p-8 sm:p-10">
      <div className="text-[length:var(--text-ui)] uppercase tracking-[0.08em] text-[var(--color-muted)] mb-3">
        {numeral}
      </div>
      <h3 className="font-[var(--font-heading)] text-[length:var(--text-heading)] leading-tight mb-4">
        {pillar.title}
      </h3>
      <p className="text-[length:var(--text-body)] text-[var(--color-text)] leading-relaxed">
        {pillar.body}
      </p>
    </article>
  )
}
