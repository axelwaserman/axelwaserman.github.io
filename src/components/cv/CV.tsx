import { workEntries, educationEntries, skills } from '@/data/cv'
import WorkEntry from './WorkEntry'
import EducationEntry from './EducationEntry'
import SkillsList from './SkillsList'

export default function CV() {
  return (
    <section
      id="cv"
      aria-labelledby="cv-heading"
      className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
    >
      <h2 id="cv-heading" className="sr-only">CV</h2>

      {/* Work */}
      <div className="grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12 mb-20">
        <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Work
        </div>
        <div className="space-y-12">
          {workEntries.map((entry) => (
            <WorkEntry key={`${entry.company}-${entry.dates}`} entry={entry} />
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12 mb-20">
        <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Education
        </div>
        <div className="space-y-8">
          {educationEntries.map((entry) => (
            <EducationEntry key={`${entry.institution}-${entry.years}`} entry={entry} />
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12">
        <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Skills
        </div>
        <SkillsList skills={skills} />
      </div>
    </section>
  )
}
