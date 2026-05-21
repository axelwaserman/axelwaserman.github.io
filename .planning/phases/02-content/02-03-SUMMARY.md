---
phase: 02-content
plan: 03
subsystem: ui
tags: [react, nextjs, typescript, tailwind, intersection-observer, scroll-reveal, reduced-motion]

# Dependency graph
requires:
  - phase: 02-01
    provides: CV data types and content (workEntries, educationEntries, skills, bio, title), design tokens
  - phase: 02-02
    provides: Header and Hero components, layout.tsx with metadata

provides:
  - useReducedMotion hook — prefers-reduced-motion MediaQueryList listener (client-side)
  - FadeUp scroll-reveal wrapper — IntersectionObserver with opacity/transform animation
  - CV section with Work (WorkEntry), Education (EducationEntry), and Skills (SkillsList) sub-components
  - Contact section with four CTA links matching Hero styling
  - page.tsx — complete page composition: Header + Hero + FadeUp(CV) + FadeUp(Contact)

affects: [03-projects, any future phase adding above-the-fold or scroll-based animation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - IntersectionObserver scroll-reveal with FOUC prevention (initial state in useEffect, not JSX render)
    - useReducedMotion hook gates all animation — false on server (SSR-safe), updated on client mount
    - Server Component default for all content-only components (CV, WorkEntry, EducationEntry, SkillsList, Contact)
    - Client Component boundary limited to browser-API users (Header, FadeUp, useReducedMotion)
    - import type for data interfaces in component props (TypeScript strict)

key-files:
  created:
    - src/hooks/useReducedMotion.ts
    - src/components/ui/FadeUp.tsx
    - src/components/cv/CV.tsx
    - src/components/cv/WorkEntry.tsx
    - src/components/cv/EducationEntry.tsx
    - src/components/cv/SkillsList.tsx
    - src/components/contact/Contact.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "FadeUp initial opacity/transform set inside useEffect to avoid FOUC — not in JSX render"
  - "Hero is NOT wrapped in FadeUp — above-the-fold element must be immediately visible"
  - "CV and Contact are each wrapped in FadeUp — scroll-triggered reveal for below-fold content"
  - "useReducedMotion defaults to false (no motion assumed on server) — correct SSR-safe behavior"
  - "Skills render as flat pill tags — no progress bars per CV-03 requirement"
  - "All CV content remains placeholder — Axel fills in before launch per D-08"

patterns-established:
  - "IntersectionObserver pattern: set initial styles in useEffect, unobserve after first intersection"
  - "useReducedMotion pattern: useState(false) + window.matchMedia inside useEffect with change listener"
  - "Two-column CV grid: sm:grid-cols-[20%_1fr] with single-column fallback on mobile"
  - "Server Components for all static content — no 'use client' unless browser API is required"

requirements-completed: [CV-01, CV-02, CV-03, CV-04, HERO-03, INFRA-02, INFRA-04, INFRA-05]

# Metrics
duration: 8min
completed: 2026-05-21
---

# Phase 2 Plan 03: CV Sections, Contact, FadeUp Scroll-Reveal Summary

**IntersectionObserver scroll-reveal with reduced-motion support, two-column CV layout (Work/Education/Skills), Contact section, and full page composition in page.tsx**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-21T12:56:43Z
- **Completed:** 2026-05-21T13:04:43Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- useReducedMotion hook and FadeUp component implement compositor-only scroll-reveal (opacity/transform) with FOUC prevention and reduced-motion gating
- CV section renders Work, Education, and Skills in a responsive two-column grid with correct typography hierarchy and no progress bars
- Contact section mirrors Hero CTA link styling with four links (email, LinkedIn, GitHub, CV download)
- page.tsx composes all sections: Header outside main, Hero/FadeUp(CV)/FadeUp(Contact) inside main — Hero is not wrapped in FadeUp (above-the-fold)

## Task Commits

Each task was committed atomically:

1. **Task 1: useReducedMotion hook and FadeUp scroll-reveal component** - `a87bfa5` (feat)
2. **Task 2: CV section components (WorkEntry, EducationEntry, SkillsList, CV)** - `ed74f20` (feat)
3. **Task 3: Contact component and complete page wiring** - `c7cbd7e` (feat)

## Files Created/Modified

- `src/hooks/useReducedMotion.ts` — Named export hook; useState(false) SSR default; window.matchMedia + change listener inside useEffect
- `src/components/ui/FadeUp.tsx` — Client wrapper with IntersectionObserver (threshold 0.15); initial opacity=0/transform set in useEffect to prevent FOUC; unobserves after first intersection
- `src/components/cv/CV.tsx` — Server Component; imports from @/data/cv; two-column grid for Work, Education, Skills subsections
- `src/components/cv/WorkEntry.tsx` — Server Component; import type from @/data/cv; semantic article element
- `src/components/cv/EducationEntry.tsx` — Server Component; import type from @/data/cv; semantic article element
- `src/components/cv/SkillsList.tsx` — Server Component; flex-wrap pill list; no progress bars
- `src/components/contact/Contact.tsx` — Server Component; id="contact", aria-labelledby, scroll-mt-16; four CTA links with noopener noreferrer on external links
- `src/app/page.tsx` — Replaced stub with full composition; no 'use client'; imports Header, Hero, CV, Contact, FadeUp

## Decisions Made

- FadeUp initial state (opacity 0, translateY 16px) is set inside useEffect — not in JSX render. This prevents FOUC where SSR-rendered content flickers before the client hydrates.
- Hero is intentionally not wrapped in FadeUp — it is the above-the-fold entry point and must be immediately visible.
- CV and Contact sections each get their own FadeUp wrapper — independent scroll-reveal triggers as the user scrolls down.
- useReducedMotion defaults to false (motion allowed) on server. This is intentional: the server cannot query OS preferences, so the safest default is to assume motion is allowed and let the client update on hydration.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

- All CV content in `src/data/cv.ts` is placeholder text per plan D-08 — Axel must replace before launch.
- `/cv.pdf` and `/og-image.png` are human-provided assets noted in `user_setup` — download link renders but will 404 until the file is placed at `public/cv.pdf`.

## User Setup Required

Two static files must be placed in `public/` before the site is production-ready:

1. **`public/cv.pdf`** — Downloadable CV document. Place at `/Users/axel/code/website/public/cv.pdf`.
2. **`public/og-image.png`** — 1200x630px OpenGraph preview image. Place at `/Users/axel/code/website/public/og-image.png`.

These are noted in the plan's `user_setup` field and are not automated steps.

## Next Phase Readiness

- Phase 2 is complete: Header, Hero, CV (Work/Education/Skills), Contact, FadeUp, useReducedMotion — all live and building.
- Phase 3 (Projects) can wire the `#projects` section stub in page.tsx using the same Server Component + FadeUp pattern established here.
- Real CV content (placeholder text in cv.ts) must be replaced before launch.

---
*Phase: 02-content*
*Completed: 2026-05-21*
