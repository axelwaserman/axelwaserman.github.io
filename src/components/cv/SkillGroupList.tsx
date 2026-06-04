import type { SkillGroup } from '@/data/cv'

interface SkillGroupListProps {
  groups: SkillGroup[]
}

export default function SkillGroupList({ groups }: SkillGroupListProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.category}>
          <h4 className="font-semibold text-[length:var(--text-body)] text-[var(--color-text)] mb-2">
            {group.category}
          </h4>
          <p className="text-[length:var(--text-ui)] text-[var(--color-text)] max-w-[60ch] leading-[1.5]">
            {group.items.join(', ')}
          </p>
        </div>
      ))}
    </div>
  )
}
