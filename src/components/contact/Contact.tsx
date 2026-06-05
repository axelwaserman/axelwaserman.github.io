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
    </section>
  )
}
