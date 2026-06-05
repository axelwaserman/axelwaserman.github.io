---
phase: 06-get-in-touch-form
plan: 03
subsystem: contact-form-vertical-slice
tags: [contact-form, react-hook-form, zod, formspree, a11y, ssr-determinism]
requires:
  - "src/data/site.ts FORMSPREE_ENDPOINT (plan 06-01)"
  - "react-hook-form, zod, @hookform/resolvers under dependencies (plan 06-01)"
provides:
  - "src/components/contact/contact-schema.ts — Zod schema + ContactFormValues type"
  - "src/components/contact/ContactForm.tsx — 'use client' RHF + zodResolver form with honeypot, AJAX submit, success → /thanks, fallback error block"
  - "Contact section embedding the form + plain-text email caption (D-21)"
affects:
  - src/components/contact/contact-schema.ts
  - src/components/contact/ContactForm.tsx
  - src/components/contact/Contact.tsx
tech-stack:
  added: []
  patterns:
    - "Zod schema + z.infer<typeof schema> as the single source of truth for both runtime validation and form-values type (rules/typescript/coding-style.md)"
    - "RHF mode: 'onBlur' + shouldFocusError: true (D-10 / D-12)"
    - "Honeypot read at event-time via form.elements.namedItem (avoids ref-during-render lint trap in React 19's react-hooks/refs rule)"
    - "Server Component shell embedding a Client Component child (Phase 5 D-09 precedent reused)"
    - "Template-literal interpolation in JSX text to prevent React comment-node insertion between prefix and dynamic value (keeps SC-2 rendered HTML scraper-parseable)"
key-files:
  created:
    - src/components/contact/contact-schema.ts
    - src/components/contact/ContactForm.tsx
  modified:
    - src/components/contact/Contact.tsx
decisions:
  - "Honeypot is read inside onSubmit via the SyntheticEvent target's form.elements.namedItem('_gotcha') instead of via gotchaRef.current. Reason: React 19's react-hooks/refs lint rule flags ref reads inside any closure passed (transitively) to handleSubmit, even though the read only happens at event-time. The DOM-lookup variant is functionally equivalent and lint-clean."
  - "gotchaRef is retained on the input element (no .current access in code) so a future fix that needs imperative access to the honeypot input has a stable hook without re-querying the DOM."
  - "Plain-text email caption uses {`Or reach me directly at ${contact.email}.`} (template literal in a single JSX expression) instead of inline text + {contact.email}. React inserts a <!-- --> comment between adjacent text and JSX expression children; the template-literal form keeps the rendered HTML as a single continuous string, which is what SC-2's rendered-HTML half requires for ATS / SEO crawlers."
  - "Submit button label: 'Send message' (CONTEXT.md discretion bullet recommendation). Loading label: 'Sending…' (D-14, single ellipsis character)."
  - "Download CV anchor removed from Contact section per CONTEXT.md discretion bullet (Hero CTA + CV-section button still surface CV download; Contact section is now purely form-focused)."
  - "Honeypot is intentionally NOT registered with RHF (and not present in the Zod schema). Using register('_gotcha' as never) would violate the no-`as never` / no-`any` rule from typescript/coding-style.md."
metrics:
  duration: ~12 min
  completed: 2026-06-05
requirements: [SC-1, SC-2, SC-3, SC-4]
---

# Phase 06 Plan 03: ContactForm Vertical Slice Summary

Vertical slice that delivers the working contact form end-to-end inside the existing Contact section: a Zod schema as the validation source of truth, a RHF + zodResolver Client Component with honeypot and AJAX submit to Formspree, success → `/thanks` navigation, error → email-fallback block, and a plain-text email caption that replaces the legacy four-anchor cluster.

## What Was Built

- **`src/components/contact/contact-schema.ts` (new):** Zod object schema for the four form fields (`name`, `email`, `company` optional, `message`) with length caps per D-08 (100 / 254 / 200 / 5000) and `.email()` format check (D-09). `.trim()` runs before `.min()` / `.max()` so leading/trailing whitespace cannot bypass required-field or length constraints. `ContactFormValues` is exported as `z.infer<typeof contactSchema>` — single source of truth for both client-side runtime validation and the TypeScript form-values type. No React imports, no fetch, no side effects.
- **`src/components/contact/ContactForm.tsx` (new, `'use client'`):** Function component using `useForm<ContactFormValues>({ resolver: zodResolver(contactSchema), mode: 'onBlur', shouldFocusError: true, defaultValues: { name: '', email: '', company: '', message: '' } })`. Renders four labelled fields plus a hidden honeypot input named `_gotcha`. Per-field `aria-invalid` + `aria-describedby` linked to inline error spans (D-11 a11y). Submit handler clears `submitError`, reads the honeypot at event-time, POSTs JSON to `FORMSPREE_ENDPOINT` with `Accept: application/json` + `Content-Type: application/json` headers (D-13), and either calls `router.push('/thanks')` on success (D-15) or sets the fallback error message above the submit button on failure (D-16 / D-03). Loading state disables the button and swaps the label to `'Sending…'` (D-14). Tailwind v4 token-driven styling consumes `--text-ui`, `--text-body`, `--color-text`, `--color-surface`, `--color-muted`, `--color-accent`, `--radius-card`. No JS animation — SC-4's reduced-motion contract is honoured by absence (FadeUp on the parent section is inherited from elsewhere in the page composition; no in-component motion needed). No `Math.random` / `Date.now` / `new Date()` in the render path — SSR hydration determinism (memory: `feedback_ssr_hydration_determinism.md`) preserved.
- **`src/components/contact/Contact.tsx` (refactored):** Same `<section id="contact" aria-labelledby="contact-heading" …>` wrapper, heading `Get in touch`, and subtext preserved verbatim (D-20). The four-anchor cluster (mailto, LinkedIn, GitHub, Download CV) is replaced with `<ContactForm />` plus a small plain-text email caption below it (D-21 / SC-2 rendered-HTML half). The caption uses template-literal interpolation (`{`Or reach me directly at ${contact.email}.`}`) so the rendered HTML is one continuous string — no React-inserted `<!-- -->` comment between the prefix and the address. Component remains a Server Component (no `'use client'`); the Client boundary is encapsulated entirely inside `ContactForm`.

## Tasks

| Task | Name                                                            | Commit  |
| ---- | --------------------------------------------------------------- | ------- |
| 1    | Create Zod contact schema and inferred type                     | 243f2e0 |
| 2    | Build ContactForm Client Component (RHF + Zod + AJAX submit)    | 768f6d6 |
| 3    | Refactor Contact section to embed ContactForm + remove anchors  | 34c6042 |

## Verification

- `npx tsc --noEmit` — passes
- `npm run lint` — `eslint . --max-warnings 0`, passes (after working around the `react-hooks/refs` false positive on `gotchaRef.current` access through `handleSubmit` — see Deviations)
- `npm run build` — `next build` succeeds; all 5 static routes generated (`/`, `/_not-found`, `/icon`, `/thanks`, plus root assets)
- **Contact-section HTML scan** (custom node script extracting `<section id="contact" …</section>`):
  - Contains `Get in touch`
  - Contains `Or reach me directly at axel.waserman@gmail.com` (SC-2 rendered-HTML half)
  - Contains `_gotcha` (honeypot rendered into static HTML)
  - Contains the form's `name="message"` input
  - Does NOT contain `href="mailto:axel.waserman@gmail.com"` inside the contact section
  - Does NOT contain `LinkedIn` / `GitHub` / `Download CV` text inside the contact section

## Acceptance Criteria

| Criterion (from plan)                                                                                          | Status |
| -------------------------------------------------------------------------------------------------------------- | ------ |
| Schema exports `contactSchema` and `ContactFormValues` (z.infer)                                               | Met    |
| Length caps: name ≤ 100, email ≤ 254, company ≤ 200, message ≤ 5000                                            | Met    |
| `.email()` format check                                                                                        | Met    |
| `'use client'` on ContactForm                                                                                  | Met    |
| RHF + zodResolver wired against contactSchema                                                                  | Met    |
| FORMSPREE_ENDPOINT used (no hardcoded URL)                                                                     | Met    |
| `useRouter` + `router.push('/thanks')`                                                                         | Met    |
| Honeypot `_gotcha` rendered, `tabIndex={-1}`, `aria-hidden`, hidden via `display: none`                        | Met    |
| `useRef<HTMLInputElement>(null)` attached to the honeypot input                                                | Met    |
| No `as never` / `Math.random` / `Date.now` / `new Date(` calls                                                 | Met    |
| `Sending` loading label, `Send message` default label                                                          | Met    |
| Email fallback string `axel.waserman@gmail.com` in the error block                                             | Met    |
| `mode: 'onBlur'`, `shouldFocusError: true`                                                                     | Met    |
| `aria-invalid` and `aria-describedby` per field                                                                | Met    |
| `Company (optional)` label verbatim (D-06)                                                                     | Met    |
| Contact.tsx imports and renders `<ContactForm />`                                                              | Met    |
| `mailto:` removed from Contact.tsx (no link, no comment reference)                                             | Met    |
| `LinkedIn` / `GitHub` / `Download CV` removed from Contact.tsx                                                 | Met    |
| `Or reach me directly at` caption present                                                                      | Met    |
| `Get in touch` heading + `Open to opportunities` subtext preserved verbatim                                    | Met    |
| Contact.tsx remains a Server Component (no `'use client'`)                                                     | Met    |
| `out/index.html` Contact section contains the caption with the email address inline (no comment break)        | Met    |
| `out/index.html` Contact section contains the form with `_gotcha` and `name="message"`                         | Met    |
| `out/index.html` Contact section does not contain `href="mailto:axel.waserman@gmail.com"`                       | Met    |
| `npm run build`, `npm run lint`, `npx tsc --noEmit` all exit 0                                                 | Met    |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Honeypot read path adapted to satisfy React 19's `react-hooks/refs` lint rule**

- **Found during:** Task 2 (lint after writing ContactForm)
- **Issue:** The plan's prescribed implementation read the honeypot via `gotchaRef.current?.value ?? ''` inside `onSubmit`, which is invoked through `handleSubmit(onSubmit)`. React 19 / `eslint-plugin-react-hooks` flags this as `Cannot access refs during render` because the analyser cannot prove the closure only runs at event-time once it crosses the `handleSubmit` boundary. The error blocked `npm run lint` (`--max-warnings 0`).
- **Fix:** The honeypot is now read at event-time via the `BaseSyntheticEvent`'s form target — `formEl?.elements.namedItem('_gotcha') as HTMLInputElement | null`. Functionally equivalent (still uncontrolled, still merged into the JSON body, still hidden + `tabIndex={-1}`), but the lint analyser is satisfied because no `ref.current` is read in the closure. `gotchaRef` remains attached to the input element (a stable hook for any future imperative access) without being read in source.
- **Files modified:** `src/components/contact/ContactForm.tsx`
- **Commit:** 768f6d6

**2. [Rule 1 — Bug] Plain-text email caption uses template-literal interpolation to prevent React comment insertion**

- **Found during:** Task 3 (HTML verification after first build)
- **Issue:** The naive form `Or reach me directly at {contact.email}.` produces rendered HTML containing `Or reach me directly at <!-- -->axel.waserman@gmail.com.` because React inserts a comment node between adjacent text children and JSX expression children to disambiguate hydration. The plan's verification regex (`/Or reach me directly at axel\.waserman@gmail\.com/`) does not match across the comment, and — more importantly — ATS / SEO scrapers that expect a single continuous string at SC-2's bar would see a broken token.
- **Fix:** Wrap the entire string in a single template-literal expression: `{`Or reach me directly at ${contact.email}.`}`. Result is one text node, one continuous rendered string, regex passes, scraper sees the full address adjacent to the prefix.
- **Files modified:** `src/components/contact/Contact.tsx`
- **Commit:** 34c6042

### Plan-script note (non-blocking)

The plan's `<verify automated>` script for Task 3 checks the entire `out/index.html` for `<a href="mailto:axel.waserman@gmail.com">`. The Hero section still ships that anchor — its swap to `<a href="#contact">Get in touch</a>` is plan 06-05's responsibility (D-19 explicitly scopes the mailto removal to the Contact section in this plan, and to the Hero in the next plan). Verification was therefore re-run with the check scoped to the Contact section only (extracted via `<section id="contact"…</section>` regex). All Contact-section assertions pass. No code change needed; documenting so the reader doesn't re-flag the Hero mailto as a regression.

## Authentication Gates

None.

## Known Stubs

- `FORMSPREE_ENDPOINT` remains `https://formspree.io/f/PLACEHOLDER_FORM_ID` (carried over from plan 06-01 — replacement is plan 06-06's user-action checkpoint, D-04). Form will visibly POST to a 404-ing URL until the real form ID is pasted in. Submit-failure path correctly surfaces the email-fallback block in that state, so user-facing behaviour degrades gracefully.

## Threat Flags

None — no new network endpoints beyond the already-disclosed Formspree URL, no auth surface, no schema changes at trust boundaries.

## Self-Check

- File exists: `src/components/contact/contact-schema.ts` — FOUND
- File exists: `src/components/contact/ContactForm.tsx` — FOUND
- File exists: `src/components/contact/Contact.tsx` — FOUND (modified)
- Commit `243f2e0` — FOUND
- Commit `768f6d6` — FOUND
- Commit `34c6042` — FOUND

## Self-Check: PASSED
