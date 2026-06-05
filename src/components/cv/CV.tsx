import { workStints, educationEntries, skillGroups } from '@/data/cv'
import WorkStint from './WorkStint'
import EducationEntry from './EducationEntry'
import SkillGroupList from './SkillGroupList'
import DownloadCVButton from './DownloadCVButton'

export default function CV() {
  return (
    <section
      id="cv"
      aria-labelledby="cv-heading"
      className="py-[var(--space-section)] px-6 max-w-3xl mx-auto scroll-mt-16"
    >
      <h2 id="cv-heading" className="sr-only">
        CV
      </h2>

      {/* Work */}
      <div className="mb-12">
        <div className="text-center text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Work
        </div>
        <div className="mt-6 space-y-8">
          {workStints.map((stint) => (
            <WorkStint key={`${stint.company}-${stint.roles[0]?.dates ?? ''}`} stint={stint} />
          ))}
        </div>
      </div>

      {/* Download CV (PDF) — secondary CTA between Work and Education (D-12) */}
      <div className="flex justify-center mt-12 mb-12">
        <DownloadCVButton />
      </div>

      {/* Education */}
      <div className="mb-12">
        <div className="text-center text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Education
        </div>
        <div className="mt-6 space-y-8">
          {educationEntries.map((entry) => (
            <EducationEntry key={`${entry.institution}-${entry.years}`} entry={entry} />
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-12">
        <div className="text-center text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Skills
        </div>
        <div className="mt-6">
          <SkillGroupList groups={skillGroups} />
        </div>
      </div>
    </section>
  )
}
