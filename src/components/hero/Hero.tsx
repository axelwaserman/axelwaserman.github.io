import { bio, title } from '@/data/cv'

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="min-h-screen flex flex-col justify-center px-6 max-w-4xl scroll-mt-16"
    >
      <h1
        id="hero-heading"
        className="font-[var(--font-heading)] text-[length:var(--text-hero)] leading-[1.05] text-[var(--color-text)] mb-6"
      >
        Axel W
      </h1>
      <p className="text-[length:var(--text-body)] font-semibold text-[var(--color-muted)] mb-4">
        {title}
      </p>
      <p className="text-[length:var(--text-body)] text-[var(--color-text)] max-w-[60ch] mb-10">
        {bio}
      </p>
      <div className="flex flex-wrap gap-4">
        <a
          href="https://github.com/axelw"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/axelw"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
        >
          LinkedIn
        </a>
        <a
          href="mailto:axel@example.com"
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
        >
          Email
        </a>
        <a
          href="/cv.pdf"
          download
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
        >
          Download CV
        </a>
      </div>
    </section>
  )
}
