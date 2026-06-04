import { contact } from '@/data/cv'

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-[var(--space-section)] px-6 max-w-2xl mx-auto scroll-mt-16"
    >
      <h2
        id="contact-heading"
        className="font-[var(--font-heading)] text-[length:var(--text-heading)] mb-4 text-center"
      >
        Get in touch
      </h2>
      <p className="text-[length:var(--text-body)] text-[var(--color-muted)] mb-8 max-w-[55ch] text-center mx-auto">
        Open to opportunities, collaborations, and interesting conversations.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <a
          href={`mailto:${contact.email}`}
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
        >
          {contact.email}
        </a>
        <a
          href={contact.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
        >
          LinkedIn
        </a>
        <a
          href={contact.github}
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
