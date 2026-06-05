---
phase: 06-get-in-touch-form
verified: 2026-06-05T23:05:00Z
status: human_needed
score: 4/4 must-haves verified (SC-2 satisfied via documented scope deviation; SC-1 live-pipe confirmation requires human attestation)
overrides_applied: 1
overrides:
  - must_have: "Plain-text email axel.waserman@gmail.com is present in the rendered HTML at least once (for ATS / scraper visibility)"
    reason: "User-requested end-of-phase enhancement supersedes D-21. Email is now base64-obfuscated in source and decoded only on the client at render. Static HTML never contains the literal address. SC-2's structured-data half is preserved via the client-side JSON-LD injection (PersonSchema.tsx) — Schema.org consumers that execute JS (Googlebot, Bingbot) still parse it. Trade: anti-harvest property bought at the cost of always-visible plain-text rendering. Documented in 06-06-SUMMARY.md and reflected in updated UAT spec."
    accepted_by: "axel"
    accepted_at: "2026-06-05T22:45:00Z"
human_verification:
  - test: "Live Formspree submission delivers email to axel.waserman@gmail.com"
    expected: "Filling and submitting the contact form on the deployed site (or local dev with a real network egress) results in an email arriving in axel.waserman@gmail.com inbox within ~1 minute"
    why_human: "Cannot verify email delivery programmatically without external mail-account access; e2e tests mock the Formspree endpoint. SUMMARY claims this was confirmed manually on 2026-06-05; verifier cannot independently re-confirm without intercepting Axel's inbox."
  - test: "JSON-LD parses correctly for Schema.org consumers in production"
    expected: "Google Rich Results Test (or schema.org validator) on https://axelwaserman.github.io/ reports a valid Person entity with email axel.waserman@gmail.com"
    why_human: "Tool requires live URL + external service round-trip; not reproducible in CI. Local Playwright test confirms the post-hydration <script type='application/ld+json'> exists with the decoded email, but external-validator confirmation is a separate trust step."
  - test: "Visual review of contact section + /thanks page at 320 / 768 / 1440 + reduced-motion"
    expected: "Form layout, focus states, error treatment, and /thanks page look intentional (anti-template) at all breakpoints; no overflow; no layout jumps; reduced-motion screenshot is visually clean"
    why_human: "feedback_visual_review_static_export.md: curl/grep checks insufficient — requires Axel eyeball on Playwright screenshots (already captured at e2e/screenshots/phase-06-*.png)"
  - test: "Horizontal-scroll fix holds on a real touch device"
    expected: "Pinching/scrolling on a phone at the home page does not snap horizontally past the viewport's right edge while the Hero mandala rotates"
    why_human: "overflow-x: clip CSS change cannot be exercised by automated tests on a desktop browser; requires real device interaction"
---

# Phase 6: Get-in-touch form — Verification Report

**Phase Goal:** Visitors initiate contact via a Formspree-backed form embedded on the page that delivers messages to Axel's inbox; direct contact links (mailto / LinkedIn / GitHub anchors as primary contact channels) are removed from the Contact section in favor of the form, while the email address itself remains discoverable to ATS crawlers and search engines.

**Verified:** 2026-06-05
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Success Criteria SC-1..SC-4)

| #    | Truth                                                                                                                      | Status                | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SC-1 | Contact section renders a working form (name + email + message) that submits to Formspree → email delivered to Axel        | ✓ VERIFIED (code) + ? human (live delivery) | `Contact.tsx` embeds `<ContactForm />`. `ContactForm.tsx` lines 73-90 POST to `FORMSPREE_ENDPOINT`. `src/data/site.ts` line 7: real form ID `xpqeqaoy` committed (`https://formspree.io/f/xpqeqaoy`). `e2e/uat-phase-06.spec.ts` UAT-2 asserts `formspreeRequested === true` and navigation to `/thanks`. Live delivery confirmation deferred to human (SUMMARY claims one real submission landed at 2026-06-05).                                                                                                                                                                                  |
| SC-2 | Plain email present in HTML for ATS AND in JSON-LD Person `<script type="application/ld+json">`                            | ✓ PASSED (override) — anti-harvest deviation | Original SC-2 had two halves: (a) plain text in HTML, (b) JSON-LD. Half (a) was deliberately removed in the user-requested enhancement (06-06 SUMMARY §"Enhancement 3"). Half (b) preserved: `PersonSchema.tsx` is a Client Component that injects `<script type="application/ld+json">` post-hydration (`useEffect` line 16) with the decoded email. UAT-5 parses the script after navigation and asserts `parsed.email === 'axel.waserman@gmail.com'`. UAT-6 anti-harvest gate confirms the plain literal is absent from the static HTML. Override documented in frontmatter. |
| SC-3 | mailto: / LinkedIn / GitHub anchors removed from Contact; Hero CTA cluster updated form-first                              | ✓ VERIFIED            | `Contact.tsx` (22 lines total) renders only the heading + subtext + `<ContactForm />` — no anchors at all. `Hero.tsx` lines 42-47: `<a href="#contact">Get in touch</a>` replaces former mailto:. `grep -F "mailto:" out/index.html out/thanks.html` returns 0 hits. UAT-7 asserts zero `mailto:` anchors site-wide and confirms the Hero retains GitHub + LinkedIn + #contact + /cv.pdf.                                                                                                                                                                                                                                                                                          |
| SC-4 | Form respects prefers-reduced-motion, validates client-side, shows clear success/error states                              | ✓ VERIFIED            | Validation: `contact-schema.ts` (Zod, all 4 fields with `.min`/`.max`/`.email`); `ContactForm.tsx` line 44 `mode: 'onBlur'` + line 45 `shouldFocusError: true`; inline `<p role="alert">` per field with `aria-invalid` + `aria-describedby`. Success: `router.push('/thanks')` line 87; `/thanks` page exists at `src/app/thanks/page.tsx` with `metadata.robots = noindex`. Error: `submitError` block (lines 201-209) renders fallback message. Reduced-motion: form has no JS-driven motion; UAT-9 runs page under `reducedMotion: 'reduce'` and verifies the form renders cleanly. |

**Score:** 4/4 truths verified (SC-2 via override; SC-1 live-pipe confirmation pending human attestation)

### Required Artifacts

| Artifact                                       | Expected                                                       | Status     | Details                                                                                                                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/contact/ContactForm.tsx`       | Client Component, RHF + Zod, AJAX submit, honeypot, error UI   | ✓ VERIFIED | 220 lines, all required wiring present (`useForm`, `zodResolver`, `useRouter`, fetch, `_gotcha` hidden input, error block).                                                        |
| `src/components/contact/contact-schema.ts`     | Zod schema with name/email/company/message + length caps       | ✓ VERIFIED | 43 lines, `z.object` with `.trim()`+`.min`+`.max`+`.email` per D-08/D-09. `z.infer` exported as `ContactFormValues`.                                                                |
| `src/components/contact/Contact.tsx`           | Server Component, embeds form, no anchors                      | ✓ VERIFIED | 22 lines, only heading + subtext + `<ContactForm />`. No mailto/linkedin/github anchors.                                                                                            |
| `src/components/PersonSchema.tsx`              | Client Component injecting JSON-LD post-hydration              | ✓ VERIFIED | 43 lines, `'use client'`, `useEffect` injects `<script type="application/ld+json">` with decoded email, name, jobTitle, sameAs.                                                    |
| `src/lib/email.ts`                             | EMAIL_ENCODED + decodeEmail (atob)                             | ✓ VERIFIED | 13 lines, `EMAIL_ENCODED = 'YXhlbC53YXNlcm1hbkBnbWFpbC5jb20='`, `decodeEmail` uses `atob`. Round-trip verified by `tests/unit/email.test.ts`.                                       |
| `src/data/site.ts`                             | FORMSPREE_ENDPOINT named export                                | ✓ VERIFIED | Real form ID `xpqeqaoy` committed; URL `https://formspree.io/f/xpqeqaoy`.                                                                                                          |
| `src/data/cv.ts`                               | `contact.emailEncoded` (renamed from `email`)                  | ✓ VERIFIED | Field renamed per D-22 enhancement; value sourced from `EMAIL_ENCODED` in `@/lib/email`.                                                                                            |
| `src/app/layout.tsx`                           | Renders `<PersonSchema />` in `<body>`                          | ✓ VERIFIED | Line 4 import, line 54 mount inside `<body>`.                                                                                                                                       |
| `src/app/thanks/page.tsx`                      | Static thanks route with Header + thanks block + back link     | ✓ VERIFIED | 33 lines, `metadata.robots = { index: false, follow: false }`, no plain email caption (per Enhancement 3).                                                                          |
| `src/components/hero/Hero.tsx`                 | mailto: anchor replaced with `#contact`                        | ✓ VERIFIED | Line 42: `<a href="#contact">Get in touch</a>`. Other 3 CTAs (GitHub, LinkedIn, /cv.pdf) preserved.                                                                                 |
| `src/app/globals.css`                          | overflow-x: clip on html + body                                | ✓ VERIFIED | Lines 4-14 confirm clip on both `html` and `body`.                                                                                                                                  |
| `e2e/uat-phase-06.spec.ts`                     | 10 Playwright UAT tests covering all SCs                       | ✓ VERIFIED | 232 lines, 10 tests including anti-harvest gate (UAT-6), JSON-LD parse (UAT-5), happy path (UAT-2), error path (UAT-3), validation (UAT-1), CTA cluster (UAT-7), reduced-motion (UAT-9), screenshot suite (UAT-8). |
| `e2e/screenshots/phase-06-*.png`               | 7 screenshots written                                          | ✓ VERIFIED | 7 PNG files present at expected breakpoints (320, 768, 1440) + reduced-motion.                                                                                                     |
| `tests/unit/email.test.ts`                     | Unit tests for email obfuscation                               | ✓ VERIFIED | 2 tests: base64 format guard + round-trip decode. Both pass.                                                                                                                       |
| `src/lib/person-schema.ts`                     | Removed (replaced by client-side `PersonSchema`)               | ✓ VERIFIED | File no longer present; replaced by `src/components/PersonSchema.tsx`.                                                                                                              |

### Key Link Verification

| From                              | To                                  | Via                                                                  | Status     | Details                                                                                                          |
| --------------------------------- | ----------------------------------- | -------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `app/page.tsx`                    | `Contact`                           | `import Contact from '@/components/contact/Contact'`                 | ✓ WIRED    | Used inline as `<Contact />` (page.tsx line 21).                                                                 |
| `Contact`                         | `ContactForm`                       | `import ContactForm from './ContactForm'`                            | ✓ WIRED    | Used as `<ContactForm />` in section body.                                                                       |
| `ContactForm`                     | `contactSchema`                     | `zodResolver(contactSchema)` in `useForm` config                     | ✓ WIRED    | Schema is the resolver source for RHF.                                                                           |
| `ContactForm`                     | `FORMSPREE_ENDPOINT`                | `fetch(FORMSPREE_ENDPOINT, { method: 'POST', ... })`                 | ✓ WIRED    | Real ID `xpqeqaoy`. Submit handler awaits response, navigates `/thanks` on 2xx, sets error block otherwise.       |
| `ContactForm`                     | `decodeEmail(contact.emailEncoded)` | Inside `useMemo` for `decodedEmail` (used only on error fallback)    | ✓ WIRED    | Email decoded once and embedded in `fallbackErrorMessage` constructed at render time.                            |
| `app/layout.tsx`                  | `PersonSchema`                      | `import PersonSchema from '@/components/PersonSchema'` + `<PersonSchema />` mount | ✓ WIRED    | Mounted inside `<body>`, renders only after hydration (`useState` + `useEffect`).                                |
| `PersonSchema`                    | `decodeEmail(contact.emailEncoded)` | `useEffect` body builds JSON-LD with decoded email                   | ✓ WIRED    | Confirmed by UAT-5 (post-hydration parse asserts `email === 'axel.waserman@gmail.com'`).                          |
| `Hero`                            | Contact section anchor              | `<a href="#contact">Get in touch</a>`                                | ✓ WIRED    | `Contact` section has `id="contact"` + `scroll-mt-16`.                                                            |
| `ContactForm` submit success path | `/thanks`                           | `router.push('/thanks')`                                             | ✓ WIRED    | `useRouter` from `next/navigation`, `/thanks/page.tsx` exists as static route.                                   |

### Data-Flow Trace (Level 4)

| Artifact                      | Data Variable          | Source                                              | Produces Real Data          | Status      |
| ----------------------------- | ---------------------- | --------------------------------------------------- | --------------------------- | ----------- |
| `ContactForm`                 | submitted form values  | RHF `register`/`handleSubmit` → fetch body          | Yes — user input            | ✓ FLOWING   |
| `ContactForm` error block     | `decodedEmail`         | `useMemo(() => decodeEmail(contact.emailEncoded))`  | Yes — base64 → plain string | ✓ FLOWING   |
| `PersonSchema`                | `json` state           | `useEffect` builds JSON.stringify of Person schema  | Yes — decoded email + cv data | ✓ FLOWING |
| `Contact`                     | n/a                    | Static markup; no dynamic data                      | n/a                         | n/a         |
| `/thanks`                     | n/a                    | Static markup                                       | n/a                         | n/a         |

### Behavioral Spot-Checks

| Behavior                                                                | Command                                                                                       | Result                                | Status   |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- | -------- |
| Static HTML has no `mailto:` anchors                                    | `grep -F "mailto:" out/index.html out/thanks.html`                                            | exit 1 (no match)                     | ✓ PASS   |
| Static HTML never contains plain `axel.waserman@gmail.com`              | `grep -F "axel.waserman@gmail.com" -r out/`                                                   | exit 1 (no match)                     | ✓ PASS   |
| Encoded literal not in static HTML (only inlined into JS chunks)        | `grep -c "YXhlbC53YXNlcm1hbkBnbWFpbC5jb20=" out/index.html`                                   | 0                                     | ✓ PASS   |
| JSON-LD `<script type="application/ld+json">` is NOT in static HTML     | `grep -c "application/ld+json" out/index.html`                                                | 0                                     | ✓ PASS (post-hydration only — by design) |
| Hero "Get in touch" anchor present in static HTML                       | `grep -o "Get in touch" out/index.html`                                                       | 1 hit                                 | ✓ PASS   |
| TypeScript clean                                                        | `npx tsc --noEmit`                                                                            | exit 0, zero diagnostics              | ✓ PASS   |
| ESLint clean                                                            | `npx eslint src/ --max-warnings 0`                                                            | exit 0, zero output                   | ✓ PASS   |
| Vitest suite                                                            | `npm test`                                                                                    | 24 tests pass (4 files)               | ✓ PASS   |
| `out/` static export exists with /thanks route                          | `ls out/`                                                                                     | `index.html`, `thanks.html`, `404.html`, `cv.pdf`, `_next/`, etc. | ✓ PASS |

### Probe Execution

No probe scripts declared by this phase (no `scripts/*/tests/probe-*.sh` referenced in PLAN/SUMMARY). The phase relies on Playwright UAT spec + unit tests + manual SUMMARY-claim of live submission. **Step skipped: no formal probes.**

### Requirements Coverage

Phase 6 has no REQ-IDs in `.planning/REQUIREMENTS.md` (post-launch UX, goal-derived per ROADMAP). Plans declare goal-derived `SC-1..SC-4` IDs. All SCs satisfied per the Observable Truths table above. No orphaned IDs.

| Requirement | Source Plan(s)                  | Description                                                               | Status                | Evidence                                |
| ----------- | ------------------------------- | ------------------------------------------------------------------------- | --------------------- | --------------------------------------- |
| SC-1        | 06-01, 06-03, 06-06             | Form posts to Formspree → email delivered                                 | ✓ Code SATISFIED + ? human (live delivery) | `ContactForm` POSTs to real `xpqeqaoy` endpoint; UAT-2 confirms request fired; live delivery requires human inbox check. |
| SC-2        | 06-02, 06-06                    | Plain email + JSON-LD discoverability                                     | ✓ SATISFIED (override) | Original "plain HTML" half traded for anti-harvest; JSON-LD half preserved via post-hydration injection.                |
| SC-3        | 06-03, 06-05                    | mailto/LinkedIn/GitHub removed from Contact; Hero CTAs form-first         | ✓ SATISFIED           | Verified in code + static HTML grep + UAT-7.                                                                            |
| SC-4        | 06-03, 06-06                    | Validation, success/error UX, prefers-reduced-motion respected            | ✓ SATISFIED           | Zod schema, RHF onBlur, /thanks, error block, UAT-1/3/9.                                                                |

### Anti-Patterns Found

| File                                       | Line | Pattern                                  | Severity | Impact                                                                                                                                                                                                                  |
| ------------------------------------------ | ---- | ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/site.ts`                         | 4-7  | Stale "PLACEHOLDER" comment block referring to `PLACEHOLDER_FORM_ID` even though the real ID has already been pasted | ℹ️ Info  | Comment is misleading: the placeholder has been replaced (`xpqeqaoy`) but the comment still says "PLACEHOLDER". Cosmetic — does not affect runtime. Suggest cleaning up in a follow-up commit; not a blocker. |
| `src/components/PersonSchema.tsx`          | 21   | `// eslint-disable-next-line react-hooks/set-state-in-effect` | ℹ️ Info  | Justified inline (must defer JSON-LD payload until post-hydration so SSR markup never serialises the email). Anti-harvest design choice — accepted.                                                                  |

No 🛑 BLOCKER markers (TBD/FIXME/XXX without issue references) found in phase-modified files.

### Human Verification Required

#### 1. Live Formspree submission delivers email to axel.waserman@gmail.com

**Test:** Submit a real form (no Playwright route mock) on the deployed site or local dev with network egress allowed.
**Expected:** Email arrives in `axel.waserman@gmail.com` inbox within ~1 minute.
**Why human:** Email delivery cannot be verified programmatically without external mail-account access. SUMMARY documents this was confirmed manually on 2026-06-05; verifier cannot independently re-confirm.

#### 2. JSON-LD parses correctly for Schema.org consumers in production

**Test:** Run Google's Rich Results Test on `https://axelwaserman.github.io/` and inspect the Person schema.
**Expected:** Validator detects a Person entity with `email`, `name`, `jobTitle`, `sameAs`. Email surfaces correctly.
**Why human:** Tool requires live URL + external service round-trip; not reproducible in CI.

#### 3. Visual review of contact section + /thanks at 320 / 768 / 1440 + reduced-motion

**Test:** Open `e2e/screenshots/phase-06-*.png` and verify visual quality.
**Expected:** Form layout intentional, focus states designed, error treatment clear, /thanks page balanced. No overflow, no jumps, no template-feel.
**Why human:** Per `feedback_visual_review_static_export.md` — Playwright screenshot + Axel eyeball is mandatory, curl/grep checks are insufficient.

#### 4. Horizontal-scroll fix holds on a real touch device

**Test:** Open the site on a phone, pinch and scroll while the Hero mandala rotates.
**Expected:** Window does not snap horizontally past the right edge.
**Why human:** `overflow-x: clip` interacts with touch gesture engines; desktop Playwright cannot reproduce the original symptom.

### Gaps Summary

No code-level gaps blocking goal achievement. The single deviation (plain-text email visibility removed in favor of base64-obfuscation) is documented in `06-06-SUMMARY.md` and accepted via the `overrides` block above. SC-2's structured-data half — the half that actually matters for ATS/SEO crawlers that execute JS — is fully preserved through `PersonSchema.tsx` post-hydration injection. The phase trades a small amount of always-visible plain-text discoverability for an anti-harvest property.

The `human_needed` status is driven by four items that require human attestation rather than code gaps:

1. Live email delivery (already manually confirmed per SUMMARY; verifier cannot re-confirm without inbox access).
2. External Schema.org validator round-trip.
3. Visual review of captured screenshots (project memory mandates this for static-export work).
4. Real-device confirmation of the `overflow-x: clip` horizontal-scroll fix.

All four are routine end-of-phase human checks — none indicate code issues.

### Minor follow-up suggestions (not blockers)

- Update the "PLACEHOLDER" comment block in `src/data/site.ts` (lines 4-7) to reflect that the form ID has been provisioned. The comment is now stale.
- Consider documenting the override decision (Enhancement 3, plain-text email removal) in `.planning/REQUIREMENTS.md` or a follow-up note so future phases inherit the constraint cleanly. The anti-harvest invariant is currently expressed only via the e2e gate test (UAT-6) and a SUMMARY paragraph.

---

_Verified: 2026-06-05_
_Verifier: Claude (gsd-verifier)_
