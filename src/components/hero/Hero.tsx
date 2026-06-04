import { bio, title } from '@/data/cv'
import HeroMandala from './HeroMandala'

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="min-h-screen flex flex-col justify-center px-6 max-w-6xl scroll-mt-16"
    >
      <div className="grid grid-cols-1 sm:grid-cols-[60%_40%] lg:grid-cols-2 gap-8 lg:gap-12 lg:items-center">
        <div>
          <h1
            id="hero-heading"
            className="font-[var(--font-heading)] text-[length:var(--text-hero)] leading-[1.05] text-[var(--color-text)] mb-6"
          >
            Axel Waserman
          </h1>
          <p className="text-[length:var(--text-body)] font-semibold text-[var(--color-muted)] mb-4">
            {title}
          </p>
          <p className="text-[length:var(--text-body)] text-[var(--color-text)] max-w-[60ch] mb-10">
            {bio}
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/axelwaserman"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/axel-waserman-9753221a6/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
            >
              LinkedIn
            </a>
            <a
              href="mailto:axel.waserman@gmail.com"
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
        </div>
        <div>
          <HeroMandala />
        </div>
      </div>
    </section>
  )
}
