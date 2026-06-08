import { fetchProjects } from '@/lib/projects'
import ProjectCard from './ProjectCard'
import ProjectsEmptyState from './ProjectsEmptyState'

export default async function Projects() {
  const projects = await fetchProjects()

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="py-[var(--space-section)] px-6 max-w-5xl mx-auto scroll-mt-16"
    >
      <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em] mb-4 text-center">
        Projects
      </div>
      <h2
        id="projects-heading"
        className="font-[var(--font-heading)] text-[length:var(--text-heading)] mb-8 text-center"
      >
        Selected work on GitHub
      </h2>
      {projects.length === 0 ? (
        <ProjectsEmptyState />
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-fr">
            {projects.map((p) => (
              <li key={p.repoUrl} className="h-full">
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
          <div className="mt-10 text-center">
            <a
              href="https://github.com/axelwaserman?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-border)] text-[length:var(--text-ui)] font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text)] transition-colors duration-[var(--duration-normal)]"
            >
              View all projects on GitHub
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>
        </>
      )}
    </section>
  )
}
