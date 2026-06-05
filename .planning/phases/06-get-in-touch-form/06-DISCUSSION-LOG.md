# Phase 6: Get-in-touch form - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-05
**Phase:** 6-get-in-touch-form
**Areas discussed:** Formspree config + secrets, Form fields + validation, Submit UX + states, Hero CTAs + JSON-LD

---

## Formspree config + secrets

### Q1: Formspree endpoint — where does the form ID live?

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded in component | Public Formspree IDs are not secrets; simplest, works in static export | |
| `NEXT_PUBLIC_` env var via GH Actions | Build-time inlined; rotate without code change but adds CI ceremony | |
| Config file (e.g. `src/data/site.ts`) | Hardcoded but centralised in a single config module | ✓ |

**User's choice:** Config file `src/data/site.ts`.

### Q2: Anti-spam approach?

| Option | Description | Selected |
|--------|-------------|----------|
| Formspree honeypot only | `_gotcha` hidden field; zero UX cost; free tier; blocks dumb bots | ✓ |
| Honeypot + Formspree reCAPTCHA | Stronger but needs Formspree paid tier or extra setup | |
| Honeypot + Cloudflare Turnstile | Privacy-friendly CAPTCHA; needs widget + another vendor | |

**User's choice:** Honeypot only.

### Q3: Free-tier limit (50 submissions/month) — how to handle?

| Option | Description | Selected |
|--------|-------------|----------|
| Accept default — don't surface limit | Personal site won't hit 50/mo; Formspree itself emails when nearing | |
| Catch quota error — fallback message | On 4xx with quota error, show "email me directly" with mailto fallback | ✓ |

**User's choice:** Catch quota error → mailto fallback message.

### Q4: Where to store the Formspree form ID before form is implemented?

| Option | Description | Selected |
|--------|-------------|----------|
| Axel creates Formspree form during phase, supplies ID | Plan task: create form, paste ID into config | ✓ |
| Use placeholder ID; document swap-in step | Risk: forget to swap | |

**User's choice:** Axel supplies real ID during phase execution.

---

## Form fields + validation

### Q1: Field set — SC requires name/email/message. Anything else?

| Option | Description | Selected |
|--------|-------------|----------|
| Just name, email, message | Matches SC verbatim; lower friction | |
| Add optional 'subject' field | Helps triage | |
| Add optional 'company / context' field | Recruiter-oriented metadata | ✓ |

**User's choice:** Add optional company / context field.

### Q2: Which fields required?

| Option | Description | Selected |
|--------|-------------|----------|
| All three required | Standard; empty submissions are noise | ✓ |
| Email + message required; name optional | Anonymous-ish contact | |

**User's choice:** All three required (name, email, message); company optional.

### Q3: Client-side validation approach?

| Option | Description | Selected |
|--------|-------------|----------|
| Native HTML5 + light custom | `required`, `type=email`, `maxLength` plus React state errors; no extra deps | |
| React Hook Form + Zod schema | Industry standard; ~13kb gzipped; exposes Axel to common patterns | ✓ |
| Native HTML5 only | Browser-only validation; minimal code | |

**User's choice:** RHF + Zod.

### Q4: Field length limits?

| Option | Description | Selected |
|--------|-------------|----------|
| name 100, email 254, message 5000 | RFC max email; generous name; long-but-bounded message | ✓ |
| No length caps — rely on Formspree limits | Defer to server-side | |

**User's choice:** name 100, email 254, message 5000 (company added later at 200).

### Q5: Optional 'company / context' field — label wording?

| Option | Description | Selected |
|--------|-------------|----------|
| "Company / context (optional)" | Neutral, accommodates recruiters and collaborators | |
| "Where are you reaching out from? (optional)" | Conversational | |
| "Company (optional)" | Concise, recruiter-oriented | ✓ |

**User's choice:** "Company (optional)".

### Q6: Error message display?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline below each field, on blur + submit | RHF default; granular UX | ✓ |
| Single summary at top of form on submit | Less granular | |

**User's choice:** Inline below each field.

### Q7: Company field length cap?

| Option | Description | Selected |
|--------|-------------|----------|
| 200 chars | Generous for free-text context | ✓ |
| 100 chars | Tighter; matches name | |

**User's choice:** 200.

### Q8: Email format check — strict RFC or pragmatic?

| Option | Description | Selected |
|--------|-------------|----------|
| Zod `.email()` default | Pragmatic regex; rejects obvious typos | ✓ |
| Stricter RFC 5322 regex | Catches more edges; rejects some weird-but-valid | |

**User's choice:** Zod `.email()` default.

---

## Submit UX + states

### Q1: Submission method?

(First answered "Native POST + redirect to /thanks", which conflicted with subsequent answers about JS-controlled "Sending…" and inline error. Re-asked to resolve.)

| Option | Description | Selected |
|--------|-------------|----------|
| AJAX fetch JSON to Formspree | Stay on page; inline success/error; no reload | (initially) |
| Native form POST + Formspree thanks page | Loses brand consistency | |
| Native POST + custom redirect to /thanks | Build static `/thanks` route; page reload | (first answer) |
| AJAX fetch + on success `router.push('/thanks')` | RHF onSubmit handler; best UX, most code | ✓ (resolved) |
| True native POST with `_next=/thanks`, no JS | No JS UX; weakest error handling | |
| Native POST + JS progressive enhancement | Form works without JS; with JS does AJAX | |

**User's choice:** AJAX fetch + on success `router.push('/thanks')`.

### Q2: Loading state UX during submit?

| Option | Description | Selected |
|--------|-------------|----------|
| Disable button + change label to 'Sending…' | Restrained; consistent with site's minimal motion | ✓ |
| Disable button + small spinner | Standard pattern | |
| Disable button only, no label change | May feel unresponsive | |

**User's choice:** Disable + 'Sending…' label.

### Q3: Success state — what does the user see after submit?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace form with success message | Confirmation + email fallback; no resubmit | (covered by /thanks navigation) |
| Keep form visible, show banner above | Allows resubmit but risk of double-send | |
| Replace form + 'Send another' button | Allows multiple sends explicitly | |

**User's choice:** Navigate to `/thanks` (covered by Q1 resolution).

### Q4: /thanks page design?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal — confirmation message + back link | Static route; small block + email fallback | |
| Full layout (Header + thanks block + footer) | Reuse Header; more wiring | ✓ |

**User's choice:** Full layout (Header + thanks block + email fallback + back link). No site-wide footer (none exists today).

### Q5: Error state UX?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline error block above submit + email fallback link | Defensive; form stays filled for retry | ✓ |
| Inline error only, no email fallback | Less defensive | |

**User's choice:** Inline error + email fallback to axel.waserman@gmail.com.

### Q6: Validation timing — when does Zod fire?

| Option | Description | Selected |
|--------|-------------|----------|
| onBlur for fields + onSubmit | RHF mode `'onBlur'` | ✓ |
| onSubmit only | Less aggressive | |
| onChange (live) | Can feel naggy | |

**User's choice:** onBlur + onSubmit.

### Q7: Focus management on submit/error?

| Option | Description | Selected |
|--------|-------------|----------|
| On error: focus first invalid field; on send: native nav to /thanks | RHF `shouldFocusError`; standard a11y | ✓ |
| No special focus management | Lower a11y polish | |

**User's choice:** Focus first invalid on error; nav to /thanks on success.

### Q8: Footer — does one exist today, or new for /thanks?

| Option | Description | Selected |
|--------|-------------|----------|
| Check codebase first, mirror what exists | If no footer, /thanks gets Header + thanks block only | ✓ |
| Add new minimal footer site-wide as part of this phase | Adds scope | |

**User's choice:** Mirror existing — no footer exists, so none added.

---

## Hero CTAs + JSON-LD

### Q1: Hero CTA cluster — what changes?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace Email with 'Get in touch' (anchor to #contact) | Keep GitHub, LinkedIn, Download CV; swap mailto for anchor | ✓ |
| Drop GitHub + LinkedIn + Email; keep only 'Get in touch' + 'Download CV' | Strict form-first; cleaner | |
| Keep all four, swap mailto for 'Get in touch' anchor | Same intent as recommended | |

**User's choice:** Replace Email anchor with `<a href="#contact">Get in touch</a>`. Keep GitHub, LinkedIn, Download CV.

### Q2: Contact section header copy — change?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep heading + subtext, add form below | Heading and copy stay verbatim | ✓ |
| New copy oriented to form usage | Adjust subtext to encourage form use | |

**User's choice:** Keep heading + subtext.

### Q3: Plain-text email visibility (SC-2) — where in the contact section?

| Option | Description | Selected |
|--------|-------------|----------|
| Small line below the form | Visible humans + crawlers; non-clickable plain text | |
| Tiny print in section caption / above form | Less prominent, still in DOM | ✓ |
| Only in JSON-LD + visually hidden span | ATS still parses but not visible | |

**User's choice:** Tiny print in caption / above form.

### Q4: JSON-LD Person schema — fields?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal: @type, name, email, url, jobTitle, sameAs[GitHub, LinkedIn] | Schema.org standard fields | ✓ |
| Above + image, address, alumniOf | Richer SEO; needs avatar URL | |
| Just @type + name + email | Bare minimum | |

**User's choice:** Minimal Schema.org Person with sameAs.

### Q5: JSON-LD placement — where?

| Option | Description | Selected |
|--------|-------------|----------|
| `src/app/layout.tsx` `<script type="application/ld+json">` in body | Site-wide; static-export safe | ✓ |
| Only on home page (`src/app/page.tsx`) | Less SEO surface | |
| Use Next.js Metadata API jsonLd field | Doesn't exist | |

**User's choice:** layout.tsx site-wide.

### Q6: /thanks SEO — discoverable?

| Option | Description | Selected |
|--------|-------------|----------|
| `<meta name="robots" content="noindex">` | Confirmation page; don't index | ✓ |
| Allow indexing | Could appear in search results awkwardly | |

**User's choice:** noindex.

### Q7: Direct contact links removal — confirm scope?

| Option | Description | Selected |
|--------|-------------|----------|
| Remove from Contact section only; Hero gets 'Get in touch' anchor | Per Q1 | ✓ |
| Also remove GitHub + LinkedIn from Hero entirely | Stricter form-first | |

**User's choice:** Remove from Contact only; Hero keeps GitHub + LinkedIn.

---

## Claude's Discretion

- Submit button label wording.
- Visual treatment of form (input borders, focus states, spacing).
- Inline error message wording and accessibility wiring (`aria-invalid`, `aria-describedby`).
- `/thanks` page exact copy beyond confirmation.
- Whether Contact section's "Download CV" link is removed (recommend remove for purity) or kept.
- Honeypot field name customisation if Formspree docs differ at implementation time.
- Form layout (single column, container width).
- Position of optional `company` field (recommend between email and message).

## Deferred Ideas

- Newsletter / mailing-list signup.
- Resend / Loops / SendGrid alternative form vendor.
- CAPTCHA / Turnstile.
- Site-wide footer.
- Analytics on form submit.
- Optional file attachment field.
- In-app rate-limit display.
- Visual identity refresh away from parchment (carried from Phase 5).
- Auto-refresh `projects.json` fallback in CI (carried from Phase 5).
