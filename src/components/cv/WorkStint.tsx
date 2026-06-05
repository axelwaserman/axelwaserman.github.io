import type { WorkStint as WorkStintType } from '@/data/cv'
import { splitBulletPrefix } from './work-entry-bullet'

interface WorkStintProps {
  stint: WorkStintType
}

export default function WorkStint({ stint }: WorkStintProps) {
  return (
    <article>
      <p className="text-[length:var(--text-ui)] text-[var(--color-muted)] mb-3">{stint.company}</p>
      <ul className="mb-3 space-y-1">
        {stint.roles.map((role) => (
          <li
            key={`${role.title}-${role.dates}`}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5"
          >
            <h3 className="text-[length:var(--text-body)] font-semibold">{role.title}</h3>
            <span className="text-[length:var(--text-ui)] text-[var(--color-muted)] tabular-nums">
              {role.dates}
            </span>
          </li>
        ))}
      </ul>
      {stint.description ? (
        <p className="text-[length:var(--text-body)] max-w-[65ch]">{stint.description}</p>
      ) : null}
      {stint.bullets.length > 0 ? (
        <ul className="mt-3 space-y-2 list-disc list-outside pl-5 marker:text-[var(--color-muted)]">
          {stint.bullets.map((bullet, index) => {
            const split = splitBulletPrefix(bullet)
            return (
              <li
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
