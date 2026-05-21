---
phase: 02-content
plan: "02"
subsystem: ui
tags: [react, nextjs, typescript, tailwind, opengraph, sticky-header, hero]

# Dependency graph
requires:
  - phase: 02-01
    provides: "CV data file (bio, title exports) and design token extensions (--space-section, --radius-card, animation tokens)"
provides:
  - "Header.tsx — sticky client component with scroll-state background toggle and anchor nav"
  - "Hero.tsx — server component with name, title, bio, and four CTA links"
  - "layout.tsx extended with OpenGraph and Twitter card metadata"
affects: [02-03, 02-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Client Component boundary: 'use client' only for browser API components (Header); server default for content (Hero)"
    - "Scroll listener with passive: true to avoid blocking main thread"
    - "CSS token references via var(--token-name) in Tailwind arbitrary values"
    - "clsx for conditional className composition on scroll-state toggle"

key-files:
  created:
    - src/components/header/Header.tsx
    - src/components/hero/Hero.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Header uses sticky positioning (not fixed) to keep element in document flow and avoid content overlap"
  - "Nav links hidden on mobile (hidden sm:flex) — D-10 decision from context doc"
  - "Hero is a pure Server Component — imports cv.ts data at build time, zero client JS"
  - "metadataBase set to https://axelw.github.io so og:image resolves to absolute URL in static export"
  - "og-image.png and cv.pdf are human-provided assets — links render correctly, files 404 until Axel provides them"

patterns-established:
  - "Server Component default: omit 'use client' for content-only components"
  - "Client boundary only when using window/document/IntersectionObserver"
  - "All colors and type sizes via var(--token-name) — no hardcoded hex or Tailwind palette"
  - "External links always include target='_blank' rel='noopener noreferrer'"
  - "py-2 on inline links to ensure 44px minimum touch target"

requirements-completed: [HERO-01, HERO-02, HERO-03, INFRA-01, INFRA-02, INFRA-03]

# Metrics
duration: 8min
completed: 2026-05-21
---

# Phase 02 Plan 02: Hero and Header Summary

**Sticky header with scroll-state toggle, Hero server component with Instrument Serif display name and four CTA links, and OpenGraph/Twitter metadata wired into layout.tsx**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-21T12:51:21Z
- **Completed:** 2026-05-21T12:54:16Z
- **Tasks:** 3
- **Files modified:** 3 (1 modified, 2 created)

## Accomplishments
- Extended layout.tsx with full OpenGraph and Twitter card metadata — og:title, og:image, og:url, twitter:card all present in static HTML output
- Created Header.tsx as a 'use client' component with passive scroll listener, transparent-to-surface background transition at 100px, and mobile-hidden anchor nav
- Created Hero.tsx as a Server Component rendering display-scale name in Instrument Serif, title/bio from cv.ts, and four CTA links with designed hover/focus states

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend OpenGraph metadata in layout.tsx** - `f1dbaed` (feat)
2. **Task 2: Build Header client component with sticky nav and scroll-state** - `5b2f524` (feat)
3. **Task 3: Build Hero server component with name, bio, and CTA links** - `1544702` (feat)

## Files Created/Modified
- `src/app/layout.tsx` — Extended metadata export with metadataBase, openGraph, and twitter fields
- `src/components/header/Header.tsx` — Sticky client component: scroll-state toggle via useEffect/useState, passive scroll listener, hidden sm:flex nav with four anchor links
- `src/components/hero/Hero.tsx` — Server component: h1 Axel W in --text-hero/--font-heading, title/bio from cv.ts, four CTA links with 44px touch targets

## Decisions Made
- Header uses `sticky` positioning (not `fixed`) to stay in document flow — avoids content overlap without margin compensation
- Nav is `hidden sm:flex` per D-10; no hamburger menu in Phase 2 scope
- Hero is a pure Server Component — no client JS needed, all content static at build time
- `metadataBase: new URL('https://axelw.github.io')` required for og:image to resolve as absolute URL in static export (pitfall from RESEARCH.md)
- Placeholder assets (og-image.png, cv.pdf) are human tasks; links ship correct, files 404 until provided

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

- `href="/cv.pdf" download` — cv.pdf does not exist yet; Axel must provide before launch
- `url: '/og-image.png'` in openGraph.images — og-image.png does not exist yet; Axel must provide before launch
- Hero CTA links use placeholder URLs (github.com/axelw, linkedin.com/in/axelw, axel@example.com) — must be updated with real URLs before launch

These stubs are intentional and documented per the plan. They do not prevent the plan's goal (first above-the-fold experience renders correctly). Plan 02 explicitly notes them as human-provided assets.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Header and Hero are ready for integration into page.tsx (Plan 03)
- Sections built in Plan 03 will need `scroll-mt-16` class to offset the 64px sticky header on anchor scroll
- Real CV content (bio, title, work entries) remains placeholder — Axel fills in before launch
- Header nav has four links (#hero, #cv, #projects, #contact) — all anchors exist once Plan 03 sections are built

---
*Phase: 02-content*
*Completed: 2026-05-21*
