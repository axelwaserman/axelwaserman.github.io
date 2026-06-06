import type { Project } from '@/data/projects'
import { formatRelativeDate } from '@/lib/date'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const relative = formatRelativeDate(project.pushedAt)
  const description = project.description?.trim() ?? ''

  return (
    <article className="group h-full flex flex-col p-6 rounded-[var(--radius-card)] border border-[var(--color-muted)]/20 transition-colors duration-200 ease-out hover:border-[var(--color-accent)]/40">
      <h3 className="text-[length:var(--text-body)] font-semibold mb-1 transition-colors duration-200 ease-out group-hover:text-[var(--color-accent)]">
        {project.name}
      </h3>
      {(project.language || relative) && (
        <p className="text-[length:var(--text-ui)] text-[var(--color-muted)] mb-3">
          {project.language}
          {project.language && relative && ' · '}
          {relative && project.pushedAt && <time dateTime={project.pushedAt}>{relative}</time>}
        </p>
      )}
      {description ? (
        <p className="text-[length:var(--text-body)] max-w-[55ch]">{description}</p>
      ) : (
        <p className="sr-only">No description provided</p>
      )}
      <div className="mt-auto pt-6 flex flex-wrap gap-4">
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${project.name} repository on GitHub`}
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 py-2"
        >
          Repo <span aria-hidden="true">→</span>
        </a>
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.name} live demo`}
            className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 py-2"
          >
            Live demo <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  )
}
