import { contact } from '@/data/cv'
import ContactForm from './ContactForm'

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
      <ContactForm />
      {/* Plain-text email caption (D-21 / SC-2 rendered-HTML half).
          MUST remain plain text — not an anchor tag — so ATS scrapers can
          parse the address without resurrecting a clickable email link.
          The form above is the primary CTA; this is an explicit, low-
          emphasis fallback channel. */}
      <p className="text-[length:var(--text-ui)] text-[var(--color-muted)] text-center mt-6">
        {`Or reach me directly at ${contact.email}.`}
      </p>
    </section>
  )
}
