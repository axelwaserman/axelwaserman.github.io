---
phase: 06-get-in-touch-form
plan: 06
subsystem: testing
tags: [playwright, e2e, formspree, anti-harvest, base64, json-ld, accessibility]

requires:
  - phase: 06-01
    provides: FORMSPREE_ENDPOINT centralised in src/data/site.ts
  - phase: 06-02
    provides: Person JSON-LD wired in root layout
  - phase: 06-03
    provides: ContactForm + Zod schema + Contact section
  - phase: 06-04
    provides: Static /thanks confirmation route
  - phase: 06-05
    provides: Hero CTA swap to #contact

provides:
  - End-to-end Playwright UAT spec for Phase 6 covering all four success criteria
  - Real Formspree form ID (xpqeqaoy) committed in src/data/site.ts
  - Visual regression screenshots at 320 / 768 / 1440 + reduced-motion
  - Anti-harvest gate that fails CI if the plain email ever ships in static HTML

affects: [future-phase tracking — anti-harvest constraint persists across phases]

tech-stack:
  added: []
  patterns:
    - "Anti-harvest email pattern: store base64 in source, decode at client render boundary, JSON-LD injected client-side post-hydration"
    - "Static-HTML egress check via Playwright `request` (no JS exec) to assert sensitive strings are absent"

key-files:
  created:
    - "e2e/uat-phase-06.spec.ts (10 tests, 7 screenshots)"
    - "src/lib/email.ts (EMAIL_ENCODED + decodeEmail)"
    - "src/components/PersonSchema.tsx (client-side JSON-LD injector)"
    - "tests/unit/email.test.ts"
  modified:
    - "src/data/site.ts (real Formspree ID pasted)"
    - "src/data/cv.ts (contact.email → contact.emailEncoded)"
    - "src/app/layout.tsx (server JSON-LD → <PersonSchema /> client component)"
    - "src/app/thanks/page.tsx (drop plain-email caption)"
    - "src/components/contact/Contact.tsx (drop static caption)"
    - "src/components/contact/ContactForm.tsx (decoded fallback message — only on submit error)"
    - "src/app/globals.css (overflow-x: clip on html + body)"
  deleted:
    - "src/lib/person-schema.ts (replaced by client-side PersonSchema)"
    - "tests/unit/person-schema.test.ts (assertions moved to email.test.ts + e2e spec)"

key-decisions:
  - "Email obfuscation: base64 in source, decoded only on the client at render time. Static HTML never contains the plain address."
  - "JSON-LD moved to a Client Component so the Person email is injected post-hydration. Schema.org consumers that run JS still parse it; naive scrapers find nothing."
  - "Plain-text email caption REMOVED from the resting state of the contact section AND from /thanks. The email only renders inside the form's error-fallback block when a Formspree submit fails."
  - "Horizontal-scroll snapping fixed via overflow-x: clip on html and body (avoids overflow:hidden's interaction with sticky positioning). Root cause was the rotating Hero mandala growing the visual AABB past the viewport."

patterns-established:
  - "Decode-on-render: any sensitive literal (email here) lives base64 in source, atob on the client at the render boundary, never on the server."
  - "Anti-harvest gate test: e2e spec fetches raw HTML via Playwright request and asserts the plain string is absent — protects against future regressions that re-introduce server-side email rendering."

requirements-completed: [SC-1, SC-2, SC-3, SC-4]

duration: ~90min (plan 06-06 + 3 user-requested enhancements)
completed: 2026-06-05
---

# Phase 6: get-in-touch-form — Plan 06-06 Summary

**Playwright UAT, real Formspree pipe, and three end-of-phase enhancements that collectively turned the contact surface from "form + visible email" into "form-only, anti-harvest, post-hydration JSON-LD".**

## Performance

- **Duration:** ~90 min (Task 1 spec ~4 min, Formspree provisioning + test ~10 min, Enhancements 1-3 ~75 min)
- **Tasks:** 3/3 (Task 1 auto, Tasks 2-3 human checkpoints — both approved)

## Accomplishments

### Task 1 — Playwright UAT spec
- 10 tests in `e2e/uat-phase-06.spec.ts` covering validation, happy path, error path, honeypot, JSON-LD parse, anti-harvest gate, contact-section resting state, Hero CTA cluster, breakpoint screenshots, reduced-motion smoke.
- All Formspree calls intercepted via `page.route('**/formspree.io/**', ...)` — no real network egress in CI.
- 7 screenshots written to `e2e/screenshots/phase-06-{contact,thanks}-{320,768,1440}.png` + `phase-06-contact-reduced-motion.png`.

### Task 2 — Formspree live
- Form `xpqeqaoy` provisioned at https://formspree.io/f/xpqeqaoy with recipient `axel.waserman@gmail.com`.
- Real submission verified end-to-end: `npm run dev` form fill → /thanks navigation → email arrived in inbox within ~1 minute.

### Task 3 — Visual + functional review
- Approved by Axel after the three enhancements landed.

## Enhancements (user-requested at end-of-phase checkpoint)

### 1. Horizontal-scroll fix
The rotating Hero mandala's visual bounding box exceeds the viewport at certain rotation angles, allowing touch devices to snap the window past its right edge. Fix: `overflow-x: clip` on `html` AND `body` (clip preserves position:sticky behaviour that overflow:hidden can break). One-line CSS change in `src/app/globals.css`.

### 2. Email base64 obfuscation
- New `src/lib/email.ts` with `EMAIL_ENCODED` (base64) and `decodeEmail()` (atob-only — Buffer fallback removed to avoid pulling the buffer polyfill into the client bundle).
- `Contact.email` field renamed to `contact.emailEncoded` so consumers cannot accidentally re-introduce a plain literal.
- Server-rendered JSON-LD replaced with a Client Component (`src/components/PersonSchema.tsx`) that decodes the email and injects the `<script type="application/ld+json">` post-mount.
- Verified: `grep -r 'axel.waserman@gmail' out/` returns 0 hits across the entire static export. The encoded literal appears only in the decode call site's chunk.

### 3. Plain-text caption gated to error state
- Contact section's "Or reach me directly at …" caption removed from the resting state.
- /thanks page's "Or email me directly at …" line removed.
- The email surfaces only in the form's error-fallback block when a Formspree submit fails (decoded once via `useMemo` and rendered inline).
- This trades a small amount of always-visible discoverability for the anti-harvest goal — the form remains the primary CTA, and the address is still reachable when the form pipe is unavailable.

## Verification

- `npm run build` — green (5 routes prerendered).
- `npm test` — 26 tests pass (24 prior + 2 new email tests).
- `npx eslint src/ --max-warnings 0` — clean.
- `npx tsc --noEmit` — clean.
- `npx playwright test e2e/uat-phase-06.spec.ts` — 10/10 pass.
- Manual real submission to Formspree → email delivered to `axel.waserman@gmail.com`.

## Deviations

- Original plan asserted plain-text email visible in the resting contact section (D-21 / SC-2 visible-HTML half). Enhancement 3 supersedes this: the email is no longer present at rest. SC-2's "JSON-LD email parseable by ATS / search engines" half is preserved via the client-side JSON-LD injection (Googlebot, Bingbot, and other JS-executing Schema.org consumers still parse it). The trade-off is documented in this SUMMARY and reflected in the updated UAT spec.

## Threat flags

- None. The Formspree endpoint is a public URL by design (D-01); the address is encoded in the bundle but reversible — base64 is obfuscation, not encryption. The goal is to defeat naive scrapers, not adversarial harvesters.
