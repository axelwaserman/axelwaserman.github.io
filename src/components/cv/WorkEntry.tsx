import type { WorkEntry as WorkEntryType } from '@/data/cv'
import { splitBulletPrefix } from './work-entry-bullet'

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
      {entry.description ? (
        <p className="text-[length:var(--text-body)] max-w-[65ch]">
          {entry.description}
        </p>
      ) : null}
      {entry.bullets.length > 0 ? (
        <ul className="mt-3 space-y-2 list-disc list-outside pl-5 marker:text-[var(--color-muted)]">
          {entry.bullets.map((bullet, index) => {
            const split = splitBulletPrefix(bullet)
            return (
              <li
                // eslint-disable-next-line react/no-array-index-key -- bullet order is data-driven and immutable per plan acceptance criteria
                key={index}
                className="text-[length:var(--text-body)] text-[var(--color-text)] max-w-[65ch] leading-[1.6]"
              >
                {split === null ? (
                  bullet
                ) : (
                  <>
                    <strong className="font-semibold">{split.prefix}</strong>
                    {split.rest}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
    </article>
  )
}
