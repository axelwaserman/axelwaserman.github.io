'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import type { BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { contactSchema, type ContactFormValues } from './contact-schema'
import { FORMSPREE_ENDPOINT } from '@/data/site'
import { contact } from '@/data/cv'
import { decodeEmail } from '@/lib/email'

// Shared Tailwind class strings — kept as constants so the JSX stays readable.
const fieldWrapperClass = 'flex flex-col gap-2'
const labelClass =
  'text-[length:var(--text-ui)] text-[var(--color-muted)] font-medium'
const inputBaseClass =
  'w-full rounded-[var(--radius-card)] border border-[var(--color-muted)]/40 bg-[var(--color-surface)] text-[length:var(--text-body)] text-[var(--color-text)] px-4 py-3 transition-colors focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 focus:border-[var(--color-accent)] aria-[invalid=true]:border-[var(--color-accent)]'
const errorClass =
  'text-[length:var(--text-ui)] text-[var(--color-accent)] mt-0.5'

export default function ContactForm() {
  const router = useRouter()
  // gotchaRef is intentionally retained: the honeypot is also referenced by id
  // inside the form via DOM lookup at submit-time (see onSubmit). Keeping the
  // ref attached makes future programmatic access (e.g., resetting after a
  // failed submit) ergonomic without re-querying the DOM each time.
  const gotchaRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Decoded only at render time on the client. Never appears in the static
  // HTML or in the bundled module source as a plain literal — anti-harvest.
  const decodedEmail = useMemo(
    () => decodeEmail(contact.emailEncoded),
    [],
  )
  const fallbackErrorMessage = `Something went wrong. Email me directly at ${decodedEmail}.`

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
    shouldFocusError: true,
    defaultValues: {
      name: '',
      email: '',
      company: '',
      message: '',
    },
  })

  // Read the honeypot value at event-time inside the submit handler. The
  // honeypot is an uncontrolled DOM input — reading it via the SyntheticEvent
  // target keeps the ref read scoped to the event boundary, satisfying the
  // react-hooks/refs rule (refs may be read in event handlers, never during
  // render).
  const onSubmit = useCallback(
    async (
      values: ContactFormValues,
      event?: BaseSyntheticEvent,
    ): Promise<void> => {
      setSubmitError(null)
      const formEl = event?.target as HTMLFormElement | undefined
      const honeypotInput = formEl?.elements.namedItem(
        '_gotcha',
      ) as HTMLInputElement | null
      const honeypotValue = honeypotInput?.value ?? ''
      const body = JSON.stringify({ ...values, _gotcha: honeypotValue })

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body,
        })

        if (!response.ok) {
          setSubmitError(fallbackErrorMessage)
          return
        }

        router.push('/thanks')
      } catch {
        setSubmitError(fallbackErrorMessage)
      }
    },
    [router, fallbackErrorMessage],
  )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6 mt-8"
      aria-describedby={submitError ? 'contact-submit-error' : undefined}
    >
      {/* Honeypot — uncontrolled, NOT registered with RHF. Value is read
          inside onSubmit by querying the form's elements collection at
          event-time, then merged into the JSON body manually (D-02). The
          gotchaRef is also attached for direct programmatic access if a
          future fix needs it. Hidden visually + skipped by tab order. */}
      <input
        ref={gotchaRef}
        id="contact-gotcha"
        name="_gotcha"
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        style={{ display: 'none' }}
      />

      <div className={fieldWrapperClass}>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          aria-invalid={errors.name ? true : false}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          className={inputBaseClass}
          {...register('name')}
        />
        {errors.name ? (
          <p id="contact-name-error" role="alert" className={errorClass}>
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className={fieldWrapperClass}>
        <label htmlFor="contact-email" className={labelClass}>
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : false}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          className={inputBaseClass}
          {...register('email')}
        />
        {errors.email ? (
          <p id="contact-email-error" role="alert" className={errorClass}>
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className={fieldWrapperClass}>
        <label htmlFor="contact-company" className={labelClass}>
          Company (optional)
        </label>
        <input
          id="contact-company"
          type="text"
          autoComplete="organization"
          aria-invalid={errors.company ? true : false}
          aria-describedby={
            errors.company ? 'contact-company-error' : undefined
          }
          className={inputBaseClass}
          {...register('company')}
        />
        {errors.company ? (
          <p id="contact-company-error" role="alert" className={errorClass}>
            {errors.company.message}
          </p>
        ) : null}
      </div>

      <div className={fieldWrapperClass}>
        <label htmlFor="contact-message" className={labelClass}>
          Message
        </label>
        <textarea
          id="contact-message"
          rows={6}
          aria-invalid={errors.message ? true : false}
          aria-describedby={
            errors.message ? 'contact-message-error' : undefined
          }
          className={`${inputBaseClass} resize-y min-h-[8rem]`}
          {...register('message')}
        />
        {errors.message ? (
          <p id="contact-message-error" role="alert" className={errorClass}>
            {errors.message.message}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p
          id="contact-submit-error"
          role="alert"
          className="text-[length:var(--text-ui)] text-[var(--color-accent)] border border-[var(--color-accent)]/40 rounded-[var(--radius-card)] px-4 py-3 bg-[var(--color-accent)]/5"
        >
          {submitError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-[var(--radius-card)] bg-[var(--color-text)] text-[var(--color-surface)] text-[length:var(--text-ui)] font-medium px-6 py-3 transition-opacity hover:opacity-90 focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
