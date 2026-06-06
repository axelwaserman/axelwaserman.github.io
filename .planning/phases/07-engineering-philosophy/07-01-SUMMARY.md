---
phase: 07-engineering-philosophy
plan: 1
subsystem: ui
tags: [next-app-router, server-components, static-export, tailwind-v4, design-tokens, typography]

requires:
  - phase: 02-content
    provides: section wrapper pattern (id, aria-labelledby, py-[var(--space-section)] px-6 max-w-3xl mx-auto scroll-mt-16) and FadeUp scroll-reveal pattern
  - phase: 03-projects
    provides: visible eyebrow + serif h2 heading pattern from Projects.tsx
provides:
  - Typed PILLARS data module (src/data/philosophy.ts) with three opinionated engineering pillars
  - Server Component Engineering Philosophy section between CV and Projects on the homepage
  - Header nav anchor "Philosophy" wired to #philosophy
  - Static export contains pillar titles + body paragraphs as plain text in out/index.html
affects: [04-deploy, future-content-phases, header-navigation]

tech-stack:
  added: []
  patterns:
    - "Vertical-stacked editorial pillar cards with numeric eyebrow (avoids stock 3-up grid anti-pattern)"
    - "Token-only styling: only existing CSS custom properties from src/styles/tokens.css"
    - "Server-only section composition (no 'use client') using PILLARS.map → <li><PillarCard/></li>"

key-files:
  created:
    - src/data/philosophy.ts
    - src/components/philosophy/Philosophy.tsx
    - src/components/philosophy/PillarCard.tsx
  modified:
    - src/app/page.tsx
    - src/components/header/Header.tsx

key-decisions:
  - "Stacked vertical layout for the three pillars (not 3-column grid) — preserves reading width inside max-w-3xl container and dodges the stock 3-up template anti-pattern"
  - "Numeric eyebrow ('01' / '02' / '03') derived from index in PillarCard rather than baked into data — keeps PILLARS focused on content"
  - "Subtle border (--color-muted/20) instead of box-shadow for layering — keeps the editorial feel without depth tricks"

patterns-established:
  - "Pillar-style content section: visible eyebrow + serif h2 + ul/li of article cards mirroring Projects.tsx wrapper"
  - "Pillar card composition: numeric eyebrow → serif h3 → body p, all token-driven"

requirements-completed: [PHIL-01, PHIL-02, PHIL-03]

duration: ~12min
completed: 2026-06-06
---

# Phase 07 Plan 01: Engineering Philosophy Summary

**Server-rendered Engineering Philosophy section between CV and Projects with three opinionated pillars (Documentation First / High Agency & Iteration / Metrics over Activity), token-only styling, and a header anchor — pillar copy is AI-drafted placeholder pending Task 3 human approval.**

## Performance

- **Duration:** ~12 min (Tasks 1 & 2; Task 3 is a human checkpoint not yet executed)
- **Started:** 2026-06-06
- **Completed (auto tasks):** 2026-06-06
- **Tasks:** 2 of 3 executed (Task 3 = checkpoint:human-verify, blocking — pending human review)
- **Files modified:** 5 (3 created + 2 modified)

## Accomplishments
- Typed `PILLARS` data module with three pillars in fixed order (Documentation First → High Agency & Iteration → Metrics over Activity), each body paragraph > 80 chars
- `Philosophy.tsx` Server Component renders `<section id="philosophy" aria-labelledby="philosophy-heading">` with visible serif h2 "Engineering Philosophy" and a `<ul role="list">` of three `<li><PillarCard/></li>`
- `PillarCard.tsx` Server Component renders an `<article>` with numeric eyebrow ("01"/"02"/"03"), serif h3 title, and body paragraph — token-only styling, subtle border for layering
- `src/app/page.tsx` mounts `<Philosophy />` inside `<FadeUp>` between CV and Projects (DOM order verified by character-index assertion)
- `Header.tsx` carries a "Philosophy" nav anchor to `#philosophy` between the CV and Projects anchors with verbatim adjacent className

## Task Commits

Each task was committed atomically:

1. **Task 1: Pillar data module + Server Component slice** — `cb36803` (feat)
2. **Task 2: Wire Philosophy between CV/Projects + Header anchor** — `747c6c8` (feat)
3. **Task 3: Human visual review + verbatim copy approval** — NOT YET EXECUTED (checkpoint:human-verify, blocking gate)

## Files Created/Modified
- `src/data/philosophy.ts` — typed `PILLARS` array (3 entries) with placeholder verbatim copy
- `src/components/philosophy/Philosophy.tsx` — section wrapper, eyebrow, h2, ul/li of PillarCards
- `src/components/philosophy/PillarCard.tsx` — article card with numeric eyebrow, h3 title, body p
- `src/app/page.tsx` — added Philosophy import + `<FadeUp><Philosophy /></FadeUp>` between CV and Projects
- `src/components/header/Header.tsx` — added `<a href="#philosophy">Philosophy</a>` between CV and Projects anchors

## Server Component Constraint Held

Verified by grep gate during automated verification:

- `! grep "'use client'" src/components/philosophy/Philosophy.tsx` → exit 0
- `! grep "'use client'" src/components/philosophy/PillarCard.tsx` → exit 0

`Header.tsx` retains its existing `'use client'` directive (sticky scroll behaviour) — that file pre-exists and was not converted; only the new Philosophy and PillarCard components needed to be Server-only per PHIL-03, and they are.

## Static Export Verification

`npx next build` exits 0 and `out/index.html` contains:

- "Engineering Philosophy" — section heading
- "Documentation First" — pillar 1 title
- "High Agency &amp; Iteration" / "High Agency & Iteration" — pillar 2 title
- "Metrics over Activity" — pillar 3 title

(Pillar body substrings are also present — they are part of the SSR-rendered HTML.)

## Final Pillar Body Paragraphs (as shipped, pending human approval)

These are AI-drafted placeholders. Task 3 is a `checkpoint:human-verify` blocking gate that will either approve them or replace them with verbatim copy from Axel before phase verification.

**Documentation First**
> Async-first engineering is built on writing. Before code, before standups, before status updates, the decision lives in a document — context, options, trade-offs, and the call you actually made. Documents persist; meetings evaporate. A team that writes can scale across time zones, hand work over without re-explaining it, and onboard new engineers without burning a senior to do it. I default to drafting before discussing.

**High Agency & Iteration**
> High agency means engineers move work forward without waiting for permission, escalation, or perfect information. They ship a small slice, watch what breaks, and iterate from real signal rather than imagined risk. The job of the manager is to make that safe — to set the boundary clearly enough that experimentation inside it is encouraged. Slow, consensus-heavy organisations look prudent and are not; they pay for caution in cycle time.

**Metrics over Activity**
> A busy team is not a productive team. Hours logged, tickets closed, and standups attended measure motion, not outcome. I anchor teams to a small number of metrics that actually reflect customer or system value — latency, retention, error budget, time-to-recover — and treat everything else as instrumentation. When activity diverges from outcome, the activity is wrong, not the metric.

## Decisions Made

- Stacked vertical layout (not 3-column grid). Plan explicitly forbade the stock 3-up card pattern; stacking inside `max-w-3xl` keeps editorial reading rhythm and matches CV section width.
- Numeric eyebrow lives in `PillarCard` (derived from index prop) rather than in the data module — keeps `PILLARS` focused on semantic content.
- Subtle 20%-opacity border using `border-[var(--color-muted)]/20` instead of shadows — provides layering without ornamental depth tricks.

## Deviations from Plan

None — plan executed exactly as written. No Rule 1/2/3 auto-fixes were triggered. Type-check and build are green.

## Issues Encountered

None.

## Pending Human Checkpoint

**Task 3 — `checkpoint:human-verify` (blocking gate)** is intentionally NOT executed by this autonomous wave. Per the plan, the user must:

1. Build and serve the static export locally (`npx next build && npx serve out -l 3001`).
2. Capture Playwright screenshots at 320 / 768 / 1440 viewport widths.
3. Visually verify DOM order, heading visibility, three pillars in correct order, no overflow, design-system consistency, and that the header "Philosophy" anchor scrolls to the section.
4. Read `src/data/philosophy.ts` and either reply `approved` (ship the placeholder copy as final) OR provide three verbatim body paragraphs to replace it — in which case the executor will swap them in, re-build, and re-screenshot.

The orchestrator should surface this checkpoint to the user before final phase verification.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Section is composed and statically exported. Awaiting human visual + copy verification (Task 3) before the phase as a whole can be marked verified.
- Header nav now has 4 links + brand at `≥sm` breakpoints — still fits comfortably; no responsive layout regression observed.

## Self-Check: PASSED

- FOUND: src/data/philosophy.ts
- FOUND: src/components/philosophy/Philosophy.tsx
- FOUND: src/components/philosophy/PillarCard.tsx
- FOUND: .planning/phases/07-engineering-philosophy/07-01-SUMMARY.md
- FOUND commit: cb36803 (Task 1)
- FOUND commit: 747c6c8 (Task 2)

---
*Phase: 07-engineering-philosophy*
*Completed (auto tasks): 2026-06-06*
