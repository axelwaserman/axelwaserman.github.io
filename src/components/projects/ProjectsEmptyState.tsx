export default function ProjectsEmptyState() {
  return (
    <div>
      <p className="text-[length:var(--text-body)] text-[var(--color-text)] mb-2">
        No public projects yet.
      </p>
      <p className="text-[length:var(--text-body)] text-[var(--color-muted)] max-w-[55ch]">
        Check back soon — or look at the source for{' '}
        <a
          href="https://github.com/axelw/axelw.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2"
        >
          this site itself
        </a>
        .
      </p>
    </div>
  )
}
