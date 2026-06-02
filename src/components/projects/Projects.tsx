import { fetchProjects } from '@/lib/projects'
import ProjectCard from './ProjectCard'

export default async function Projects() {
  const projects = await fetchProjects()

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
    >
      <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em] mb-4">
        Projects
      </div>
      <h2
        id="projects-heading"
        className="font-[var(--font-heading)] text-[length:var(--text-heading)] mb-8"
      >
        Selected work on GitHub
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {projects.map((p) => (
          <li key={p.repoUrl}>
            <ProjectCard project={p} />
          </li>
        ))}
      </ul>
    </section>
  )
}
