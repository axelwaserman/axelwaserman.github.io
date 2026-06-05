---
phase: 06-get-in-touch-form
plan: 02
subsystem: seo
tags: [json-ld, schema-org, structured-data, ssr, nextjs-app-router, static-export]

requires:
  - phase: 05-polish
    provides: locked cv.ts contact + title values; root layout with metadataBase + openGraph baseline
provides:
  - Site-wide Schema.org Person JSON-LD block injected into <body> on every prerendered page
  - src/lib/person-schema.ts as the single, deterministic source for the Person payload (built from cv.ts)
  - Vitest unit coverage asserting schema shape, cv.ts sourcing, deterministic JSON.stringify
affects: [06-03, 06-06]

tech-stack:
  added: []
  patterns:
    - Module-scope deterministic JSON-LD object built from typed cv.ts exports (no Math.random / Date.now / new Date) — guarantees byte-identical SSR + first-client render per memory feedback_ssr_hydration_determinism
    - JSON-LD injected via dangerouslySetInnerHTML with minified JSON.stringify (no whitespace formatting) for transport efficiency
    - Pure data module under src/lib/ enables unit-testable schema construction without importing the layout's next/font dependencies

key-files:
  created:
    - src/lib/person-schema.ts
    - tests/unit/person-schema.test.ts
  modified:
    - src/app/layout.tsx

key-decisions:
  - "Extracted personSchema into src/lib/person-schema.ts (rather than inlining in layout.tsx) so the construction is unit-testable without pulling next/font/google into vitest"
  - "Derived jobTitle via title.split(' | ')[0] from cv.ts rather than hardcoding 'Senior Engineering Manager' — keeps single-source-of-truth with the displayed CV title (D-22)"
  - "Emitted minified JSON via JSON.stringify(personSchema) (no second/third args) to keep payload compact and indentation-free in HTML"

patterns-established:
  - "Pattern: pure typed data modules under src/lib/ for build-time-known JSON payloads — keeps SSR-deterministic, unit-testable, and decoupled from React component scaffolding"

requirements-completed: [SC-2]

duration: 8min
completed: 2026-06-05
---

# Phase 06 Plan 02: Person JSON-LD Injection Summary

**Schema.org Person JSON-LD rendered site-wide from a deterministic src/lib/person-schema module sourced from cv.ts, fulfilling the JSON-LD half of SC-2.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-05T14:33:00Z
- **Completed:** 2026-06-05T14:41:31Z
- **Tasks:** 1 (TDD: RED → GREEN; no REFACTOR needed)
- **Files modified:** 3 (1 created lib module, 1 created test, 1 modified layout)

## Accomplishments

- Person JSON-LD block now rendered into the prerendered `out/index.html` `<body>` on every page (verified via grep against `application/ld+json`, `"@type":"Person"`, `axel.waserman@gmail.com`, GitHub & LinkedIn `sameAs` URLs, and `jobTitle: "Senior Engineering Manager"`).
- Schema values flow from `cv.ts` (`contact.email`, `contact.github`, `contact.linkedin`, `title`) — zero drift between displayed CV and structured data.
- SSR-deterministic construction: object built once at module scope, no `Math.random` / `Date.now` / `new Date()` in the JSON-LD path.
- 9 unit tests asserting schema shape, cv.ts sourcing, and deterministic minified JSON.stringify output.

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): failing test for Person JSON-LD schema** — `f84ab14` (test)
2. **Task 1 (GREEN): inject Person JSON-LD into root layout** — `cb90cab` (feat)

_TDD: REFACTOR phase skipped — implementation already minimal and matches plan's `<action>` exactly._

## Files Created/Modified

- `src/lib/person-schema.ts` (created) — typed `PersonSchema` interface and `personSchema` constant built from `cv.ts` (`contact.email`, `contact.github`, `contact.linkedin`, `title.split(' | ')[0]`); `as const`-frozen with readonly tuple for `sameAs`.
- `src/app/layout.tsx` (modified) — added `import { personSchema } from '@/lib/person-schema'`; rendered `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />` as the first child of `<body>` (before `{children}`). Existing `metadata`, fonts, and `<html>`/`<body>` shape preserved exactly.
- `tests/unit/person-schema.test.ts` (created) — 9 tests covering: `@context`, `@type`, `name`, `email` (asserted equal to `contact.email`), `url`, `jobTitle` (asserted equal to `title.split(' | ')[0]`), `sameAs` ordering, deterministic JSON.stringify, and round-trip JSON.parse.

## Decisions Made

- **Pure-module extraction (`src/lib/person-schema.ts`):** The plan's `<action>` permitted "module scope". Putting the constant in a dedicated typed module (rather than inline at the top of `layout.tsx`) keeps the construction unit-testable in vitest without dragging `next/font/google` imports into the test runtime, and gives the schema a strongly-typed `PersonSchema` interface with readonly fields. The plan's `files_modified` listed `src/app/layout.tsx`; the new helper is a non-conflicting additive file under `src/lib/` and is imported by the listed file.
- **`jobTitle` derived (not hardcoded):** Per D-22, `jobTitle` is `'Senior Engineering Manager'` — the leading clause of `cv.ts` `title` `'Senior Engineering Manager | Backend & Data'`. Implemented as `title.split(' | ')[0]` so future edits to `cv.ts` flow through automatically.
- **Minified JSON.stringify:** Used `JSON.stringify(personSchema)` (no indentation arg). Keeps the inline `<script>` payload compact in the prerendered HTML.

## Deviations from Plan

None of the four deviation rules triggered.

- The only departure from the literal plan text is creating `src/lib/person-schema.ts` rather than inlining the constant in `layout.tsx`. This is documented under "Decisions Made" — the plan's `<action>` says "at module scope (not inside the component body)", which the lib module satisfies. `files_modified` is observed (layout.tsx is the modified file; the lib file is additive). This is a within-spirit interpretation, not a Rule 1–4 deviation.

**Total deviations:** 0
**Impact on plan:** None — plan executed within its stated intent.

## Issues Encountered

- One Prettier formatting warning on the freshly written test file (`tests/unit/person-schema.test.ts`) — auto-fixed via `npx prettier --write`. No logic change.

## User Setup Required

None — no external service configuration required for this plan. Person schema values are all build-time-known from `cv.ts`.

## Verification Run

- `npm test` — 24 passed (9 new + 15 existing)
- `npm run lint` — clean (0 warnings, `--max-warnings 0`)
- `npx tsc --noEmit` — clean
- `npm run build` — green (Next.js 16.2.7, static export, 4 pages prerendered)
- Plan acceptance greps against `out/index.html` — all 8 pass:
  - `application/ld+json` ✓
  - `"@type":"Person"` ✓
  - `axel.waserman@gmail.com` ✓
  - `Axel Waserman` ✓
  - `https://github.com/axelwaserman` ✓
  - `https://www.linkedin.com/in/axel-waserman-9753221a6/` ✓
  - `jobTitle` key ✓
  - `"Senior Engineering Manager"` value ✓
- `grep -n 'contact.email' src/lib/person-schema.ts` — confirms email is imported, not hardcoded.
- `grep -nE 'Math\.random|Date\.now|new Date\(' src/lib/person-schema.ts src/app/layout.tsx` — no matches in code (sole hit is inside a JSDoc comment documenting the SSR-determinism invariant); pre-existing `new URL(...)` in `metadata.metadataBase` is unchanged from before this plan.

## Known Stubs

None — all values are real, sourced from `cv.ts`, and rendered into the prerendered HTML.

## Threat Flags

None — JSON-LD `<script>` uses `dangerouslySetInnerHTML` with build-time-known typed data only (no user input, no runtime fetch). Web security guidance permits this pattern for static structured-data injection.

## Self-Check

- [x] `src/lib/person-schema.ts` exists — verified
- [x] `tests/unit/person-schema.test.ts` exists — verified
- [x] `src/app/layout.tsx` modified — verified
- [x] Commit `f84ab14` exists in `git log` — verified (RED: test)
- [x] Commit `cb90cab` exists in `git log` — verified (GREEN: feat)
- [x] All plan acceptance criteria greps pass against `out/index.html` — verified
- [x] `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` all green — verified

## Self-Check: PASSED

## Next Plan Readiness

- SC-2 JSON-LD half is shipped. The rendered-HTML half (plain-text `axel.waserman@gmail.com` line in the Contact section, D-21) is delivered in plan 06-03.
- Plan 06-06 task 1 will assert full JSON-LD payload correctness (all six keys, exact values) via Playwright DOM eval (`document.querySelector('script[type="application/ld+json"]')` + `JSON.parse(...)`); current grep checks are presence-only by design.
- No blockers for downstream plans. `cv.ts`-sourced pattern is reusable for future schema additions (e.g., WebSite, BreadcrumbList) if needed in later phases.

---
*Phase: 06-get-in-touch-form*
*Plan: 02*
*Completed: 2026-06-05*
