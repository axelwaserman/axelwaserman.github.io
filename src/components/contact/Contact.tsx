export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
    >
      <h2
        id="contact-heading"
        className="font-[var(--font-heading)] text-[length:var(--text-heading)] mb-4"
      >
        Get in touch
      </h2>
      <p className="text-[length:var(--text-body)] text-[var(--color-muted)] mb-8 max-w-[55ch]">
        Open to opportunities, collaborations, and interesting conversations.
      </p>
      <div className="flex flex-wrap gap-4">
        <a
          href="mailto:axel@example.com"
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
        >
          Email
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
          href="https://github.com/axelw"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
        >
          GitHub
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
