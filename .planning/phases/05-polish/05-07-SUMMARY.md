---
phase: 05-polish
plan: 07
subsystem: ui
tags: [contact, projects, layout, accessibility, seo, ats]

# Dependency graph
requires:
  - phase: 05-polish
    provides: src/data/cv.ts contact export with non-null email (Plan 05-02), and the post-Plan-05-01 axelwaserman canonical URLs already present in Contact.tsx
provides:
  - Centered Projects container (max-w-5xl mx-auto) with centered eyebrow + heading; card grid kept verbatim (cards stay internally left-aligned)
  - Centered Contact container (max-w-2xl mx-auto); heading + body text-center; link cluster justify-center
  - Contact section is now data-driven — LinkedIn / GitHub / Email all sourced from the typed `contact` import out of @/data/cv
  - Email anchor visible text content = literal email string (axel.waserman@gmail.com) so ATS / SEO crawlers can pick it up from rendered HTML — D-17 visibility requirement
  - Email row is unconditional (no typed-conditional, no EMAIL_TBD_SENTINEL)
affects:
  - 05-08 (final phase verification — confirms D-02 + D-17 truths in rendered HTML)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Centered section pattern: max-w-{N}xl mx-auto on the outer <section>, text-center on heading + eyebrow, justify-center on flex link cluster — applied per-section with widths chosen for content density (Projects 5xl, Contact 2xl)."
    - "Email visibility for ATS / SEO: the email anchor's visible text content is the literal email string (not the word 'Email') in any section that should surface the address as crawlable plain text. Hero CTA cluster keeps the 'Email' label per UI-SPEC §Copywriting; Contact uses the literal address."
    - "Data-driven contact links: components import `{ contact }` from '@/data/cv' and consume `contact.email`, `contact.linkedin`, `contact.github` rather than hard-coding URLs. Future contact changes are a one-line edit in cv.ts."

key-files:
  created: []
  modified:
    - src/components/projects/Projects.tsx
    - src/components/contact/Contact.tsx

key-decisions:
  - "Hero's CTA cluster Email anchor is intentionally NOT changed in this plan — UI-SPEC §Copywriting Contract Hero CTA link labels lock it to the visible word 'Email'. The plan body confirms: 'The Hero CTA cluster (Plan 05-01) keeps Email as the visible label since the rendered visible-text email in Contact already covers the SEO/ATS concern. Only Contact uses the email string as visible text.' rendered HTML still contains the email 6 times (mailto href in Hero + mailto href in Contact + visible text in Contact + 3 occurrences inside the cv.ts JSON-equivalent surfacing — confirmed via grep)."
  - "Email anchor placed FIRST in the Contact link cluster (Email -> LinkedIn -> GitHub -> Download CV) per UI-SPEC reading order."
  - "Used a template literal `mailto:${contact.email}` (rather than string concatenation) for the email href — keeps the data-driven pattern consistent with the contact.linkedin / contact.github idiom."

patterns-established:
  - "Re-centered section invariant: only `max-w-*` and the addition of `mx-auto` change between Phase 2's two-column layout and Phase 5's centered layout. `id`, `aria-labelledby`, `py-[var(--space-section)]`, `px-6`, and `scroll-mt-16` (sticky-header anchor offset) are preserved verbatim."
  - "Contact section is the canonical place to surface the email as crawlable plain text. Future phases that introduce a contact form (Phase 6 deferred per CONTEXT.md) must keep the visible-text email present somewhere in the rendered HTML for ATS / SEO + JSON-LD Person markup."

requirements-completed: []

# Metrics
duration: ~5min
completed: 2026-06-04
---

# Phase 5 Plan 07: Re-center Projects + Contact, data-driven contact, email visible as plain text Summary

**Projects + Contact sections re-centered per D-02; Contact now consumes the typed `contact` export from cv.ts and renders the email as visible plain text in the rendered HTML so ATS / SEO crawlers can pick up the address (D-17).**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-04T16:11:16Z
- **Completed:** 2026-06-04T16:13:06Z
- **Tasks:** 2 of 2
- **Files modified:** 2

## Accomplishments

- Re-centered the Projects section: outer container is now `max-w-5xl mx-auto`; eyebrow + heading both `text-center`. Card grid preserved verbatim (`grid grid-cols-1 sm:grid-cols-2 gap-6`) so cards keep their internal left-aligned scannability.
- Re-centered the Contact section: outer container is now `max-w-2xl mx-auto`; heading + body both `text-center`; body retains `max-w-[55ch] mx-auto`; link cluster gets `justify-center`.
- Switched the Contact component to consume the typed `contact` export from `@/data/cv`. LinkedIn href = `contact.linkedin`, GitHub href = `contact.github`, Email href = `` `mailto:${contact.email}` ``. Future address changes are a one-line edit in cv.ts.
- Made the email row unconditional (no typed-conditional, no `EMAIL_TBD_SENTINEL`). The plan revision explicitly removed the conditional once D-17 resolved on 2026-06-04.
- Set the email anchor's visible text content to the literal email string (`axel.waserman@gmail.com`) instead of the word "Email" — the address now surfaces as plain visible text in `out/index.html` for ATS / SEO crawler discoverability.
- Preserved all link styling tokens verbatim across every Contact anchor (the Phase 2 underline + hover decoration switch + accent focus ring pattern).

## Task Commits

Each task was committed atomically:

1. **Task 1: Re-center Projects.tsx** — `5385e29` (feat)
2. **Task 2: Re-center Contact.tsx + drive contact via typed import; render email as visible plain text** — `59f5d4b` (feat)

**Plan metadata commit:** docs(05-07): complete plan summary (this commit, after this file).

## Files Created/Modified

- `src/components/projects/Projects.tsx` — Outer section width: `max-w-4xl` -> `max-w-5xl mx-auto`. Eyebrow div className gets `text-center` appended. h2 heading className gets `text-center` appended. Card `<ul>` and ProjectsEmptyState consumption untouched.
- `src/components/contact/Contact.tsx` — Added `import { contact } from '@/data/cv'`. Outer section: `max-w-4xl` -> `max-w-2xl mx-auto`. h2: `text-center` added. Body p: `text-center mx-auto` added (`max-w-[55ch]` preserved). Link cluster: `flex flex-wrap gap-4` -> `flex flex-wrap gap-4 justify-center`. Email anchor moved to FIRST position in the cluster; href = `` `mailto:${contact.email}` ``; visible text content = `{contact.email}`. LinkedIn href = `{contact.linkedin}`, GitHub href = `{contact.github}`. Download CV anchor preserved at end.

## Decisions Made

- **Hero `Email` label preserved:** UI-SPEC §Copywriting Contract — Hero CTA link labels are locked to the visible word `Email`. Only Contact surfaces the email as visible plain text. Hero's mailto href still uses the same `axel.waserman@gmail.com` from prior plans, so the rendered HTML still contains the address several times.
- **Email anchor first in cluster:** UI-SPEC reading order is Email -> LinkedIn -> GitHub -> Download CV. The plan called this out explicitly and the implementation follows.
- **Template literal for mailto href:** `` `mailto:${contact.email}` `` keeps the data-driven idiom consistent with the `href={contact.linkedin}` / `href={contact.github}` siblings.

## Deviations from Plan

None — plan executed exactly as written. The plan body anticipated every grep check, the order of links in the cluster, and the visible-text rule for the email anchor. The post-Plan-05-01 file state already had the canonical `axelwaserman` URLs and the `mailto:axel.waserman@gmail.com` href, so no D-23 sweep was needed in this plan.

## Issues Encountered

None — both tasks compiled cleanly on first attempt. `npx tsc --noEmit`, `npm run build`, and `npx vitest run` all passed without intervention.

## User Setup Required

None — no external service configuration, no environment variables, no dashboards. The contact data lives in `src/data/cv.ts` (already populated by Plan 05-02 with the resolved D-17 email).

## Next Phase Readiness

Plan 05-07 finishes the Wave 2 re-centering for Projects + Contact (CV is owned by Plan 05-05; Hero stays left-aligned per Phase 2 D-01 + Phase 5 D-01). The remaining downstream work:

- **Plan 05-08 (final phase verification)** is now unblocked — it can grep `out/index.html` for the four locked truths (Projects centered, Contact centered, Contact email row always rendered, email visible as plain text) and find them all true.

`npm run build` exits 0; `out/index.html` contains:
- 6 occurrences of `axel.waserman@gmail.com` (well above the ≥2 required)
- A mailto anchor in the Contact section whose visible text content is the literal email string
- 1 occurrence of `https://github.com/axelwaserman` and 1 of `axel-waserman-9753221a6` (data-driven LinkedIn / GitHub URLs sourced from `contact`)

## Self-Check: PASSED

Verified after the final commit:

- `src/components/projects/Projects.tsx` exists; `/usr/bin/grep -c` counts: `max-w-5xl mx-auto` = 1, `max-w-4xl` = 0, `text-center` = 2, `grid grid-cols-1 sm:grid-cols-2 gap-6` = 1, `py-[var(--space-section)]` = 1, `scroll-mt-16` = 1.
- `src/components/contact/Contact.tsx` exists; `/usr/bin/grep -c` counts: `max-w-2xl mx-auto` = 1, `max-w-4xl` = 0, `text-center` = 2, `justify-center` = 1, `from '@/data/cv'` = 1, `EMAIL_TBD_SENTINEL` = 0, `contact\.linkedin` = 1, `contact\.github` = 1, `contact\.email` = 2 (mailto href + visible text), `mailto:axel@example.com` = 0, `axelw[^a]` = 0.
- `npx tsc --noEmit` exits 0.
- `npm run build` exits 0; `out/index.html` contains a contact-section mailto anchor whose visible text is the literal `axel.waserman@gmail.com`.
- `npx vitest run` passes — 16 / 16 tests in 2 files.
- Commits 5385e29 (Task 1) and 59f5d4b (Task 2) both present in `git log --oneline`.

---
*Phase: 05-polish*
*Completed: 2026-06-04*
