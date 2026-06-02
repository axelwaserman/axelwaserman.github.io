import type { Project } from '@/data/projects'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="p-6 rounded-[var(--radius-card)] border border-[var(--color-muted)]/20">
      <h3 className="text-[length:var(--text-body)] font-semibold mb-1">{project.name}</h3>
      {(project.language !== null || project.pushedAt !== null) && (
        <p className="text-[length:var(--text-ui)] text-[var(--color-muted)] mb-3">
          {project.language}
          {project.language && project.pushedAt && ' · '}
          {project.pushedAt && (
            <time dateTime={project.pushedAt}>{project.pushedAt.slice(0, 10)}</time>
          )}
        </p>
      )}
      {project.description?.trim() && (
        <p className="text-[length:var(--text-body)] mb-6 max-w-[55ch]">{project.description}</p>
      )}
      <div className="flex flex-wrap gap-4">
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
