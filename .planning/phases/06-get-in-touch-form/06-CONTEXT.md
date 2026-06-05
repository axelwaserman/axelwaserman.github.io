# Phase 6: Get-in-touch form - Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the Contact section's direct anchor links (mailto, LinkedIn, GitHub) with a Formspree-backed contact form (name + email + message + optional company) that delivers messages to `axel.waserman@gmail.com`. Email address remains visible as plain text in the rendered HTML AND surfaces in a JSON-LD `Person` schema in `<head>` for ATS / SEO crawlers. Hero CTA cluster is updated to a form-first direction (Email anchor swapped for a "Get in touch" anchor that scrolls to `#contact`). A static `/thanks` confirmation route is added.

**Does NOT include:**
- Server-side processing of submissions — Formspree handles delivery
- CAPTCHA / Turnstile — honeypot only
- Newsletter / mailing-list signup
- Resend or alternative form vendor evaluation
- Site-wide footer (none exists today and not added here)
- Visual identity refresh away from parchment (deferred per Phase 5)
- Auto-refresh of `projects.json` fallback (deferred per Phase 5)
- Removal of GitHub / LinkedIn / Download CV anchors from the Hero (only Email is replaced)

</domain>

<decisions>
## Implementation Decisions

### Formspree configuration

- **D-01 (form ID storage):** Formspree endpoint URL lives in a new `src/data/site.ts` module as a named export (e.g., `export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/<id>'`). Hardcoded — public form IDs are not secrets. Centralised so future site config (e.g., social URLs) can move here.
- **D-02 (anti-spam):** Formspree's built-in honeypot (`_gotcha` hidden input) is the only anti-spam measure. No CAPTCHA, no Turnstile. Acceptable for a personal site; Formspree free tier supports it.
- **D-03 (quota handling):** When Formspree returns a 4xx with a quota / rate-limit error, the form's error UX shows the email-fallback message ("Something went wrong. Email me directly at axel.waserman@gmail.com") rather than a generic error.
- **D-04 (form ID provisioning):** User (Axel) creates the Formspree form during phase execution and supplies the real form ID. Plan must include an explicit task: "Create Formspree form, paste ID into `src/data/site.ts`." No placeholder ship-blockers.

### Form fields and validation

- **D-05 (field set):** Four fields — `name` (required), `email` (required), `message` (required), `company` (optional). Company field added beyond SC-1's three required fields to help triage recruiter inbox.
- **D-06 (company label):** Company field label = `"Company (optional)"`.
- **D-07 (validation library):** **React Hook Form + Zod**. New deps: `react-hook-form`, `zod`, `@hookform/resolvers`. Zod schema lives next to the form component (e.g., `src/components/contact/contact-schema.ts`) and is the single source of truth for both client-side validation and field length caps.
- **D-08 (length caps):** name ≤ 100, email ≤ 254 (RFC 5321 max), message ≤ 5000, company ≤ 200. Enforced by Zod `.max()`.
- **D-09 (email format):** `z.string().email()` — pragmatic regex (Zod default). Rejects obvious typos; accepts edge-case-valid addresses.
- **D-10 (validation timing):** RHF `mode: 'onBlur'`. Errors appear after each field loses focus, plus full re-validation on submit.
- **D-11 (error display):** Inline error message rendered immediately below each field (red text, small, descriptive). Error clears as user types a valid value. No top-of-form summary.
- **D-12 (focus management):** RHF `shouldFocusError: true` — on submit, focus jumps to the first invalid field. Successful submit navigates to `/thanks`, which resets focus naturally.

### Submit UX and states

- **D-13 (submission method):** AJAX `fetch('<endpoint>', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(values) })`. Uses RHF's `handleSubmit(onSubmit)` with `onSubmit` calling fetch and awaiting response.
- **D-14 (loading state):** During submit, the submit button is `disabled` and its label changes from `"Send message"` (or planner's choice) to `"Sending…"`. No spinner — consistent with the site's restrained motion.
- **D-15 (success state):** On HTTP 2xx, `router.push('/thanks')` (Next.js `useRouter` from `next/navigation`). Form does not need to clear locally because the user navigates away.
- **D-16 (error state):** On non-2xx or network error, render an inline error block above the submit button: `"Something went wrong. Email me directly at axel.waserman@gmail.com."` The form keeps its values so the user can retry. Quota / rate-limit errors (D-03) reuse this same block.
- **D-17 (`/thanks` route):** New static route at `src/app/thanks/page.tsx`. Layout: existing `Header` at top + a centered "Thanks — message received. I'll reply soon." block + a plain-text email fallback ("Or email: axel.waserman@gmail.com") + a "Back to home" link. No site-wide footer (none exists today; not adding here). Page is statically exportable (no client-only dependencies).
- **D-18 (`/thanks` SEO):** `<meta name="robots" content="noindex" />` (or `metadata.robots.index = false`). Not a content page; should not appear in search results.

### Hero CTAs and JSON-LD

- **D-19 (Hero CTA cluster):** The four Hero CTAs become: **GitHub, LinkedIn, Get in touch, Download CV**. The current `mailto:` anchor is replaced with a same-page anchor `<a href="#contact">Get in touch</a>` that scrolls to the Contact section. GitHub and LinkedIn anchors are preserved (form-first applies to *Email*, not all socials).
- **D-20 (Contact section copy):** Heading `"Get in touch"` and subtext `"Open to opportunities, collaborations, and interesting conversations."` are kept verbatim. The form replaces the link cluster below the subtext.
- **D-21 (plain-text email visibility — SC-2):** A small line in the section caption / above the form renders the address as plain (non-clickable) text. Suggested wording: `"Or reach me directly at axel.waserman@gmail.com."` Tiny print, muted color, but present in the rendered HTML so ATS scrapers and search engines can parse it. The form remains the primary CTA; this is an explicit fallback channel, not a `mailto:` link.
- **D-22 (JSON-LD Person schema):** Site-wide JSON-LD block in `src/app/layout.tsx` body, rendered as `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />`. Schema fields: `@context: 'https://schema.org'`, `@type: 'Person'`, `name: 'Axel Waserman'`, `email: 'axel.waserman@gmail.com'`, `url: 'https://axelwaserman.github.io'`, `jobTitle: 'Senior Engineering Manager'` (mirroring `cv.ts` `title`), `sameAs: ['https://github.com/axelwaserman', 'https://www.linkedin.com/in/axel-waserman-9753221a6/']`. Single schema source — pull values from `cv.ts` exports where possible to avoid drift.
- **D-23 (Contact section anchor links removed — SC-3):** All three direct anchors in `src/components/contact/Contact.tsx` (mailto, LinkedIn, GitHub) are removed. The Download CV link in the Contact section: keep (matches existing Contact pattern + Phase 5 D-12 — separate from the form-first decision).

### Claude's Discretion

- Submit button label (e.g., "Send message", "Send", "Send a note"). Recommend something editorial, not generic.
- Visual treatment of the form (input borders, focus states, spacing) — must satisfy anti-template policy and stay consistent with Phase 5 D-02 centered Contact treatment + parchment palette tokens.
- Inline error message wording and styling (must be accessible — `aria-invalid`, `aria-describedby` linking field to its error span).
- `/thanks` page exact copy and visual treatment beyond "Thanks — message received. I'll reply soon."
- Whether to keep "Download CV" link in the Contact section's residual content (recommend: keep — it does not conflict with form-first; Phase 5 D-12 added the prominent CV button at end of CV section, the Contact one becomes minor).
- Honeypot field name customisation (default `_gotcha` is fine; if Formspree docs recommend a different convention at implementation time, follow that).
- Form layout: single column vs labelled two-column (recommend single column, max-width container ~32rem, consistent with Contact section's centered editorial layout).
- Whether the optional `company` field appears between `email` and `message` or after `message` (recommend: between `email` and `message` — natural metadata-then-content flow).
- Whether to keep the existing "Download CV" anchor in the Contact section after removing mailto/LinkedIn/GitHub, or also remove it because Phase 5 D-12 already adds a prominent CV button at the end of the CV section (planner picks; recommend: remove to keep the Contact section purely form-focused; visitors still get CV via Hero CTA + CV-section button).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 5 decisions (locked, carried forward)
- `.planning/phases/05-polish/05-CONTEXT.md` — D-17 confirms email = `axel.waserman@gmail.com`, GitHub `axelwaserman`, LinkedIn `axel-waserman-9753221a6`, real CV title = `'Senior Engineering Manager | Backend & Data'`. Includes the explicit Phase 6 hand-off note about replacing direct contact links with the Formspree form. D-02 (centered Contact section) is the layout baseline Phase 6 form sits inside.
- `src/components/contact/Contact.tsx` — current direct-link cluster; Phase 6 replaces this content with the form (D-23) while keeping heading + subtext (D-20).
- `src/components/hero/Hero.tsx` — current 4-CTA cluster; Phase 6 swaps the `mailto:` anchor for `#contact` (D-19).
- `src/data/cv.ts` — `bio`, `title`, `contact { email, linkedin, github }`. JSON-LD pulls values from here (D-22) — single source of truth.
- `src/app/layout.tsx` — root layout with `metadataBase`, `openGraph`. Phase 6 adds a JSON-LD `<script>` to the body (D-22).

### Phase 2 decisions (locked, carried forward)
- `.planning/phases/02-content/02-CONTEXT.md` — sticky header + anchor nav (`#contact` target works). FadeUp scroll-reveal pattern; the form section can keep using FadeUp.
- `src/components/header/Header.tsx` — sticky nav; reused unchanged on `/thanks`.
- `src/hooks/useReducedMotion.ts` — must be respected by any form-related motion; recommend none beyond CSS focus transitions.

### Phase 1 decisions (locked)
- `.planning/phases/01-foundation/01-CONTEXT.md` — `output: 'export'` constraint (no server-side anything; AJAX submit goes to Formspree's domain at runtime in the browser, which is compatible).
- `src/styles/tokens.css` — `--color-surface`, `--color-text`, `--color-accent`, `--color-muted`, `--font-heading`, `--font-body`, type scale. Form inputs and `/thanks` page consume these tokens.

### Project planning
- `.planning/ROADMAP.md` — Phase 6 goal + 4 success criteria + dependency on Phase 5.
- `.planning/REQUIREMENTS.md` — no new REQ-IDs (post-launch UX, goal-derived).
- `.planning/PROJECT.md` — constraints (GitHub Pages, static export, light theme, no CMS, no server-side form processing).

### User memory (relevant)
- `/Users/axel/.claude/projects/-Users-axel-code-website/memory/feedback_phase_pr_workflow.md` — push + open PR after subagent validates each phase; human merges manually.
- `/Users/axel/.claude/projects/-Users-axel-code-website/memory/feedback_visual_review_static_export.md` — curl/grep checks insufficient; always Playwright screenshot + Axel eyeball before merge. Applies to form rendering + `/thanks` page + JSON-LD source-view.
- `/Users/axel/.claude/projects/-Users-axel-code-website/memory/feedback_npm_ci_lock_sync.md` — regenerate `package-lock.json` from scratch when adding deps mid-phase (RHF + Zod + resolvers will trigger this), or CI fails with EUSAGE.
- `/Users/axel/.claude/projects/-Users-axel-code-website/memory/feedback_ssr_hydration_determinism.md` — Client Components must render identically on SSR and first client render. Form will be a Client Component; ensure no `Math.random` / `Date.now` in render path.
- `/Users/axel/.claude/projects/-Users-axel-code-website/memory/reference_github_repo.md` — username + default branch.

### Coding style rules
- `CLAUDE.md` — tech stack (Next 16.2.6, Tailwind v4, TS 6, App Router), file organization, `output: 'export'`.
- `/Users/axel/.claude/rules/web/coding-style.md` — semantic HTML (`<form>`, `<label>`, `<input>`, `<textarea>`, `<button>`), file org by feature, design tokens via CSS custom properties.
- `/Users/axel/.claude/rules/web/security.md` — XSS: never inject unsanitized HTML. JSON-LD via `dangerouslySetInnerHTML` is acceptable for build-time-known JSON; values come from typed `cv.ts` exports, not user input. Form: no client-side handling of secrets; Formspree endpoint is public.
- `/Users/axel/.claude/rules/web/performance.md` — JS bundle < 150kb gzipped (RHF + Zod + resolvers add ~13kb gzipped combined; well within budget).
- `/Users/axel/.claude/rules/web/testing.md` — Playwright e2e for the submit flow (visit page, fill form, submit, expect navigation to `/thanks`). Visual regression on contact section + `/thanks`.
- `/Users/axel/.claude/rules/web/design-quality.md` — anti-template policy applies to the form; intentional input styling, focus states that feel designed, editorial restraint.
- `/Users/axel/.claude/rules/typescript/coding-style.md` — Zod schema + `z.infer` for form values type; RHF generic typed with the inferred type; no `any`.

### External docs (planner / researcher should consult)
- Formspree React/AJAX docs — `Accept: application/json` mode, `_gotcha` honeypot field, error response shape. Confirm exact endpoint format and the recommended fetch call signature current as of phase start.
- React Hook Form + Zod resolver docs — `useForm` with `zodResolver`, `mode: 'onBlur'`, `shouldFocusError`, error shape, submit handler with disabled-while-submitting.
- Schema.org `Person` type — required vs recommended properties; `sameAs` array convention.
- Next.js 16 App Router — `useRouter` from `next/navigation` for client navigation, `metadata.robots` for `/thanks` noindex, JSON-LD pattern under `output: 'export'`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/header/Header.tsx` — sticky nav with anchor links. The new `#contact` anchor in Hero CTA matches existing `Header` anchor pattern exactly.
- `src/components/ui/FadeUp.tsx` — wrap the form's parent block with FadeUp for scroll reveal consistent with prior phases (gates on `useReducedMotion` already).
- `src/hooks/useReducedMotion.ts` — Phase 6 likely doesn't need direct usage (FadeUp handles it).
- `src/data/cv.ts` — `bio`, `title`, and `contact { email, linkedin, github }` are the JSON-LD source of truth (D-22).
- `src/styles/tokens.css` — design tokens for inputs, buttons, error text, `/thanks` page.
- `src/app/layout.tsx` — entry point for the JSON-LD `<script>` injection (D-22).
- Phase 5 HeroMandala / centered Contact pattern (`'use client'` Client Component embedded inside Server Component sections) — Phase 6 form follows the same shape: `Contact` section can stay a Server Component that imports a `<ContactForm />` Client Component.

### Established Patterns
- **Server Components for static; Client Components only when needed** (Phase 5 D-09 precedent). The form is a Client Component; the surrounding `Contact` section stays a Server Component.
- **Named exports in data files** (`cv.ts`). Apply to new `src/data/site.ts` (D-01).
- **Tailwind v4 token consumption via `text-[length:var(--text-ui)]` etc.** (Contact + Hero patterns) — form elements should adopt the same approach for typography + spacing tokens.
- **Sticky `<a href="#contact">` anchor scrolls** — Hero `#contact` CTA reuses the same anchor mechanic the Header already uses.
- **Static export compatibility** — `/thanks` is a static route under `app/`, no client-only data fetching, no server-only APIs.

### Integration Points
- **New file: `src/data/site.ts`** — exports `FORMSPREE_ENDPOINT`. Centralized config.
- **New file: `src/components/contact/ContactForm.tsx`** — `'use client'` form component (RHF + Zod), consumed by `Contact.tsx`. Owns submit handler, success navigation, error UI.
- **New file: `src/components/contact/contact-schema.ts`** — Zod schema + `z.infer` type. Shared by ContactForm and any unit test.
- **New file: `src/app/thanks/page.tsx`** — static thanks route with Header + thanks block + plain-text email + back link + `metadata.robots.index = false`.
- **Edit: `src/components/contact/Contact.tsx`** — remove direct anchor cluster (D-23), keep heading + subtext (D-20), embed `<ContactForm />` and a small plain-text email caption (D-21).
- **Edit: `src/components/hero/Hero.tsx`** — replace `mailto:` anchor with `<a href="#contact">Get in touch</a>` (D-19); preserve other three CTAs.
- **Edit: `src/app/layout.tsx`** — add `<script type="application/ld+json">` with the Person schema (D-22), values pulled from `cv.ts`.
- **Edit: `package.json` + `package-lock.json`** — add `react-hook-form`, `zod`, `@hookform/resolvers`. Regenerate lockfile from scratch (memory: `feedback_npm_ci_lock_sync.md`).

</code_context>

<specifics>
## Specific Ideas

- The form lives inside the existing centered `Contact` section (Phase 5 D-02 layout). Single column, max-width consistent with the section's `max-w-2xl`.
- Submit button label proposal (Claude discretion): "Send message" — simple, editorial.
- `/thanks` page wording proposal: heading "Thanks — message received." Body: "I read every message and will reply soon. Or email me directly at axel.waserman@gmail.com." + "← Back to home" link.
- Plain-text email caption proposal (D-21): rendered as a `<p>` in the section, small text token, muted color: "Or reach me directly at axel.waserman@gmail.com." Non-link, plain text — both human-visible and crawler-parseable.
- JSON-LD shape proposal:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Axel Waserman",
    "email": "axel.waserman@gmail.com",
    "url": "https://axelwaserman.github.io",
    "jobTitle": "Senior Engineering Manager",
    "sameAs": [
      "https://github.com/axelwaserman",
      "https://www.linkedin.com/in/axel-waserman-9753221a6/"
    ]
  }
  ```
- Honeypot field: hidden `<input type="text" name="_gotcha" tabIndex={-1} aria-hidden="true" style={{ display: 'none' }} />` per Formspree convention.

</specifics>

<deferred>
## Deferred Ideas

- **Newsletter / mailing-list signup** — separate concern; not requested.
- **Resend / Loops / SendGrid alternative form vendor** — Formspree chosen; revisit only if quota or reliability becomes an issue.
- **CAPTCHA / Turnstile** — only if honeypot proves insufficient post-launch.
- **Site-wide footer** — none exists today; adding one is its own design decision and belongs in a future polish phase.
- **Analytics on form submit (e.g., Plausible custom event)** — out of scope; site has no analytics today.
- **Optional file attachment field on the form** — Formspree supports this on paid tiers; not needed for v1.
- **In-app rate-limit display ("you've already sent a message recently")** — over-engineering for a personal site.
- **Visual identity refresh away from parchment** — still deferred from Phase 5.
- **Auto-refresh `projects.json` fallback in CI** — still deferred from Phase 5.

</deferred>

---

*Phase: 6-get-in-touch-form*
*Context gathered: 2026-06-05*
