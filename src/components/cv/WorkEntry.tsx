import type { WorkEntry as WorkEntryType } from '@/data/cv'

interface WorkEntryProps {
  entry: WorkEntryType
}

export default function WorkEntry({ entry }: WorkEntryProps) {
  return (
    <article>
      <h3 className="text-[length:var(--text-body)] font-semibold mb-1">
        {entry.role}
      </h3>
      <p className="text-[length:var(--text-ui)] text-[var(--color-muted)] mb-3">
        {entry.company} — {entry.dates}
      </p>
      <p className="text-[length:var(--text-body)] max-w-[65ch]">
        {entry.description}
      </p>
    </article>
  )
}
