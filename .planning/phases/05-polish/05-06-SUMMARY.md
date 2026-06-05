---
phase: 05-polish
plan: 06
subsystem: ui
tags: [react, client-component, intersection-observer, requestAnimationFrame, svg, mandala, prefers-reduced-motion, scroll-driven-animation, two-column-layout]

requires:
  - phase: 05-polish
    provides: src/lib/mandala.ts (generateLines, CURATED_PAIRS, pickRandomPair) from Plan 05-04
  - phase: 05-polish
    provides: Hero left-aligned content + URL fixes + h1 metadata target ("Axel Waserman") from Plan 05-01
  - phase: 02-content
    provides: useReducedMotion hook + FadeUp / Header client-component patterns
provides:
  - HeroMandala client component (state + scroll-driven rotation + hero-scroll-out reset)
  - MandalaSVG presentational SVG renderer (consumes generateLines)
  - HeroMandalaControls (n input, k input, refresh button, caption)
  - Hero two-column layout (mobile-stacked / sm 60-40 / lg 50-50)
  - Hero h1 reconciled with layout.tsx metadata (Axel Waserman)
affects:
  - 05-07 (Contact / data-driven imports — independent surface; HeroMandala is self-contained)
  - 05-08 (live GitHub fetch — independent; no shared surface)
  - any future plan touching the hero subtree

tech-stack:
  added: []
  patterns:
    - "Client Component scroll loop: passive scroll listener writes only latestScrollY; rAF reads latestScrollY and writes transform — NO layout reads in rAF (Performance Lock)"
    - "IntersectionObserver gates compositor will-change AND triggers state reset on viewport exit"
    - "Lazy useState initializer for per-mount randomization: useState(() => pickRandomPair())"
    - "Reduced-motion early return: if (reduced) { write static state, no listener, no rAF, no will-change } return"
    - "Server-Component hosts a Client Component child via default import — Hero stays Server, HeroMandala is the only 'use client' boundary in the hero subtree"

key-files:
  created:
    - src/components/hero/MandalaSVG.tsx
    - src/components/hero/HeroMandalaControls.tsx
    - src/components/hero/HeroMandala.tsx
    - .planning/phases/05-polish/05-06-SUMMARY.md
  modified:
    - src/components/hero/Hero.tsx

key-decisions:
  - "Single 'use client' boundary at HeroMandala; MandalaSVG and HeroMandalaControls remain pure presentational so they hydrate inside HeroMandala without their own directives (D-09)"
  - "Lazy useState initializer (useState(() => pickRandomPair())) so each mount picks a fresh pair without an extra useEffect; matches D-04 'random pair on every page load'"
  - "Effect 1 (rotation) deps [reduced]; Effect 2 (observer) deps [reduced, currentPair] — observer recreated when pair changes so the scroll-out reset closure always sees the latest exclusion target"
  - "Functional setState in handleChangeN re-clamps k inside the same updater so 'shrink n then k > n-1' never produces an invalid pair mid-render"
  - "Two-column layout uses CSS grid with sm:grid-cols-[60%_40%] then lg:grid-cols-2; mobile defaults to grid-cols-1 (mandala stacks below CTAs because it is JSX-second)"
  - "Hero h1 'Axel W' -> 'Axel Waserman' to align with layout.tsx metadata locked in Plan 05-01"

patterns-established:
  - "Pattern: scroll-driven rotation via passive listener + rAF + intersection gating, written entirely with native DOM APIs (no GSAP, no Framer Motion)"
  - "Pattern: reduced-motion-first effect — early-return path mirrors FadeUp; rAF and listener never start when reduced is true"
  - "Pattern: clamp utilities live alongside controls; presentational HeroMandalaControls also clamps on blur as a defensive layer (parent re-clamps in setState updaters)"

requirements-completed: []

duration: ~22min
completed: 2026-06-04
---

# Phase 05 Plan 06: HeroMandala client component + two-column hero embed Summary

**Times-Tables-on-a-Circle mandala renders in the hero's right column with passive scroll-driven rotation gated by IntersectionObserver and prefers-reduced-motion; clamp-on-blur (n,k) inputs and a refresh button drive live re-render; the hero now lays out two-column on desktop, 60/40 on tablet, and stacks mandala-below-CTAs on mobile.**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-06-04T23:09:00Z
- **Completed:** 2026-06-04T23:14:00Z
- **Tasks:** 3
- **Files created:** 3 (HeroMandala, HeroMandalaControls, MandalaSVG)
- **Files modified:** 1 (Hero.tsx)

## Accomplishments

- `HeroMandala.tsx` Client Component: lazy-initialized `(n,k)` state from `pickRandomPair()`, scroll handler writes only `latestScrollY` on a `passive: true` listener, an rAF loop applies `transform: rotate(scrollY * 0.125 deg)` with no layout reads, an IntersectionObserver toggles `will-change: transform` while the hero is in view and calls `pickRandomPair(currentPair)` on viewport exit (D-06, D-07, D-09).
- `MandalaSVG.tsx` pure presentational: `viewBox 0 0 1000 1000`, `role="img"` with a dynamic `aria-label` citing both `n` and `k`, `aria-describedby="mandala-caption"`, lines rendered with `stroke="var(--color-text)"`, `strokeOpacity={0.35}`, `strokeWidth={1}`, `strokeLinecap="round"`, `fill="none"` per UI-SPEC stroke contract.
- `HeroMandalaControls.tsx` cluster: two `type="number" inputMode="numeric"` inputs with `min/max/step`, clamp-on-blur to `[3, 500]` and `[1, n−1]`, the verbatim 4-path inline refresh-icon SVG inside a 44×44 circular button with a `color-mix()` hover wash and `active:scale-[0.96]` press feedback, plus the `id="mandala-caption"` "n = …, k = …" tabular-nums caption that the SVG `aria-describedby` targets.
- `Hero.tsx` two-column layout: outer `max-w-6xl`; inner `grid grid-cols-1 sm:grid-cols-[60%_40%] lg:grid-cols-2 gap-8 lg:gap-12 lg:items-center`; left column preserves the existing h1, title, bio, and four CTA links verbatim (URLs already correct after Plan 05-01); right column renders `<HeroMandala />`; h1 reconciled to `Axel Waserman` to match the locked metadata in `layout.tsx`.
- Reduced-motion path is provably static: `if (reduced)` writes `transform: rotate(0deg)`, clears `will-change`, and returns before installing the scroll listener or starting the rAF.
- All validation gates green: `npx tsc --noEmit`, `npm run build`, and `npx vitest run` (16 mandala tests + date utility tests still pass).
- Build output `out/index.html` contains `Axel Waserman`, an SVG with `role="img"`, and the dynamic `aria-label="Decorative pattern: chords drawn between {n} points on a circle, …"` — confirms server-side render is intact before client hydration takes over.

## Task Commits

Each task committed atomically:

1. **Task 1: MandalaSVG presentational component** — `0337d26` (feat)
2. **Task 2: HeroMandalaControls cluster** — `3b5cced` (feat)
3. **Task 3: HeroMandala Client Component + Hero.tsx two-column embed** — `c3f2728` (feat)

## Files Created/Modified

- `src/components/hero/MandalaSVG.tsx` (created, 37 lines) — Pure SVG renderer. No `'use client'`. Imports `generateLines` and `type ChordLine` from `@/lib/mandala`. Maps over the chord lines into one `<line>` per record with the locked stroke contract.
- `src/components/hero/HeroMandalaControls.tsx` (created, 115 lines) — Presentational. No `'use client'`. Two number inputs with `clamp-on-blur`, refresh button (44×44 touch target with verbatim 4-path SVG icon), caption span with `id="mandala-caption"`. All accessibility labels per UI-SPEC §Copywriting.
- `src/components/hero/HeroMandala.tsx` (created, 117 lines) — `'use client'`. Lazy `useState(() => pickRandomPair())` for per-mount randomization. Effect 1: passive scroll listener + rAF rotation, reduced-motion early return. Effect 2: IntersectionObserver toggles `will-change` and triggers fresh pair on viewport exit. Functional setState clamps on input change (re-clamps `k` if user shrinks `n` below current `k`).
- `src/components/hero/Hero.tsx` (modified) — Outer `max-w-4xl` -> `max-w-6xl`. Wrapped existing left content in a grid container; added right-column div hosting `<HeroMandala />`. h1 visible text `Axel W` -> `Axel Waserman`. URL hrefs already correct from Plan 05-01.

## Decisions Made

- **Lazy useState initializer for randomization.** The plan describes "On mount: pick a random pair from `CURATED_PAIRS` via `pickRandomPair()` and store in state". Implemented via `useState<MandalaPair>(() => pickRandomPair())` — fires exactly once at mount, no extra `useEffect` round-trip, no SSR/CSR hydration race because `pickRandomPair()` only runs on the client (HeroMandala is `'use client'`).
- **Two effects with distinct dependencies.** Effect 1 (rotation) deps `[reduced]`. Effect 2 (observer) deps `[reduced, currentPair]`. Observer is recreated whenever `currentPair` changes so the scroll-out closure always passes the latest pair as the exclusion target to `pickRandomPair(previous)`. Inside the observer callback the reset uses functional setState (`setCurrentPair((previous) => pickRandomPair(previous))`) for safety against stale closures.
- **Defensive double-clamping.** HeroMandalaControls clamps on blur (presentation layer); HeroMandala re-clamps inside its setState updaters (state layer). The parent's clamp is the authoritative source of truth — the controls clamp is purely a UX nicety so the displayed input value matches the rendered pair without a flicker.
- **Hero h1 'Axel Waserman'.** Plan 05-01's metadata-alignment summary explicitly deferred the visible h1 reconciliation to Plan 05-06 where the two-column restructure happens; the plan's acceptance criteria require `grep -c 'Axel Waserman' src/components/hero/Hero.tsx == 1` and `grep -c '>Axel W<' == 0`. Both pass.
- **Grid composition.** Mobile (default) is `grid-cols-1`, so source order (left content first, mandala second) places the mandala below the CTAs as required by UI-SPEC §"Hero composition (D-01) — mobile <640px". Tablet uses `sm:grid-cols-[60%_40%]` (60/40 split). Desktop uses `lg:grid-cols-2` (50/50). Single grid declaration covers all three breakpoints.

## Deviations from Plan

None — plan executed exactly as written.

The plan's recommended Tailwind composition (`grid grid-cols-1 sm:grid-cols-[60%_40%] lg:grid-cols-2 lg:gap-12 lg:items-center gap-8`) was applied verbatim. The plan said either Tailwind composition was acceptable; the recommended one was used.

## Issues Encountered

- **Worktree HEAD initialization.** When the executor started, `git rev-parse HEAD` returned `79e5faa…` (the head of `phase-04-deploy` at worktree-creation time) but the plan's expected base was `ef3cd08389…` (Wave 1 merge head). Resolved with a non-destructive forward-only `git reset --hard ef3cd08389…` since `ef3cd08…` is a strict descendant of `79e5faa…` (verified via `git merge-base`). No commits lost.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 05-07 (Contact centering + data-driven contact import) is unaffected by this work — Hero subtree is self-contained.
- Plan 05-08 (live GitHub fetch) is unaffected.
- Future hero edits should treat HeroMandala as the only `'use client'` boundary; MandalaSVG and HeroMandalaControls remain pure props-only presentational components.
- `will-change: transform` is set/cleared by the IntersectionObserver — future scroll-driven additions to the hero should follow the same gating pattern to avoid permanent compositor layers.
- Performance Lock validated structurally (no layout reads in rAF, single transform mutation per frame, scroll listener body is one assignment, observer disconnects on unmount). Devtools-confirmed runtime measurement is the next phase's UAT step.

## Self-Check: PASSED

- `src/components/hero/MandalaSVG.tsx` exists (37 lines)
- `src/components/hero/HeroMandalaControls.tsx` exists (115 lines)
- `src/components/hero/HeroMandala.tsx` exists (117 lines)
- `src/components/hero/Hero.tsx` modified (max-w-6xl, grid, "Axel Waserman", `<HeroMandala />`)
- Commit `0337d26` (Task 1) reachable from HEAD
- Commit `3b5cced` (Task 2) reachable from HEAD
- Commit `c3f2728` (Task 3) reachable from HEAD
- `npx tsc --noEmit` exits 0
- `npm run build` exits 0
- `npx vitest run` exits 0 (16 mandala + 6 date tests pass)
- `out/index.html` contains `Axel Waserman`, `<svg`, `role="img"`, and the dynamic `aria-label="Decorative pattern: chords drawn between {n} points on a circle…"` — confirming SSR is healthy
- All Task 1, 2, 3 grep-based acceptance criteria from the plan pass (verified inline)

---
*Phase: 05-polish*
*Completed: 2026-06-04*
