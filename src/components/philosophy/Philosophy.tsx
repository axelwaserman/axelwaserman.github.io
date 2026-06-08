import { PILLARS } from '@/data/philosophy'
import PillarCard from './PillarCard'

export default function Philosophy() {
  return (
    <section
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="py-[var(--space-section)] px-6 max-w-3xl mx-auto scroll-mt-16"
    >
      <div className="text-center text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em] mb-4">
        Philosophy
      </div>
      <h2
        id="philosophy-heading"
        className="font-[var(--font-heading)] text-[length:var(--text-heading)] mb-12 text-center"
      >
        Engineering Philosophy
      </h2>
      <ul role="list" className="flex flex-col gap-6">
        {PILLARS.map((pillar, index) => (
          <li key={pillar.id}>
            <PillarCard pillar={pillar} index={index} />
          </li>
        ))}
      </ul>
    </section>
  )
}
