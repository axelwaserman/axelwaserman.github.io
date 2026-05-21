interface SkillsListProps {
  skills: string[]
}

export default function SkillsList({ skills }: SkillsListProps) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Skills">
      {skills.map((skill) => (
        <li
          key={skill}
          className="px-3 py-1 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-muted)]/20 text-[length:var(--text-ui)]"
        >
          {skill}
        </li>
      ))}
    </ul>
  )
}
