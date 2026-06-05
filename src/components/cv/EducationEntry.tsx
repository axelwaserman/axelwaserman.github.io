import type { EducationEntry as EducationEntryType } from '@/data/cv'

interface EducationEntryProps {
  entry: EducationEntryType
}

export default function EducationEntry({ entry }: EducationEntryProps) {
  return (
    <article>
      <h3 className="text-[length:var(--text-body)] font-semibold mb-1">{entry.degree}</h3>
      <p className="text-[length:var(--text-ui)] text-[var(--color-muted)]">
        {entry.institution} — {entry.years}
      </p>
    </article>
  )
}
