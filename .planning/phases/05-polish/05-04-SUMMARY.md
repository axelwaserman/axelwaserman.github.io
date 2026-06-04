---
phase: 05-polish
plan: 04
subsystem: testing
tags: [vitest, vite-tsconfig-paths, tdd, mandala, pure-functions, svg]

requires:
  - phase: 02-content
    provides: src/lib/date.ts pure-utility analog and tests/unit/*.test.ts naming convention
provides:
  - Vitest test runner wired to TS path aliases (@/...) via vite-tsconfig-paths
  - npm test / npm test:watch scripts (--passWithNoTests so empty suites pass)
  - vitest.config.ts excludes e2e/** so Playwright specs do not run under Vitest
  - src/lib/mandala.ts — pure ChordLine generator + 8-pair curated set + injectable-RNG pickRandomPair
  - 16 passing unit tests covering geometry, determinism, curated lock, and exclusion logic
affects:
  - 05-06 (HeroMandala client component — imports generateLines, CURATED_PAIRS, pickRandomPair)
  - any future plan adding Vitest unit tests in this repo

tech-stack:
  added:
    - vitest 4.1.8
    - "@vitest/ui 4.1.8"
    - vite-tsconfig-paths 6.1.1
  patterns:
    - "Path-alias resolution in tests via vite-tsconfig-paths plugin (Vitest does NOT auto-resolve tsconfig paths)"
    - "Explicit Vitest imports (no globals) so tsc --noEmit stays green without tsconfig.types changes"
    - "Injectable-RNG pattern (rng?: () => number = Math.random) for deterministic randomness tests"
    - "Pure-utility module shape (analog of src/lib/date.ts): no 'use client', no 'server-only', client-bundle-safe"

key-files:
  created:
    - vitest.config.ts
    - src/lib/mandala.ts
    - src/lib/mandala.test.ts
    - .planning/phases/05-polish/05-04-SUMMARY.md
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Vitest path-alias resolution wired via vite-tsconfig-paths (not native Vite resolve.tsconfigPaths) to remain compatible with Vitest 4.x and stay aligned with the plan's revision note"
  - "Vitest config excludes e2e/** so Playwright specs continue to run under @playwright/test and do not contaminate the Vitest suite"
  - "generateLines uses j = ((i + 1) * k) mod n (zero-indexed equivalent of the canonical Mathologer 1..n iteration). The plan's prose '(i * k) mod n' contradicted the test fixtures for (n=4, k=1) and (n=4, k=2); the behavior contract in PLAN.md §<behavior> was treated as authoritative."
  - "pickRandomPair filters CURATED_PAIRS by deep equality on (n, k) before indexing — predictable, no infinite re-roll loop on a small fixed set"

patterns-established:
  - "Unit tests live next to the source as <module>.test.ts; e2e specs stay under e2e/*.spec.ts"
  - "Vitest tests import the system under test through the @/ alias to keep relative-path churn out of refactors"

requirements-completed: []

duration: ~12min
completed: 2026-06-04
---

# Phase 05 Plan 04: Mandala Pure Functions + Vitest Setup Summary

**Vitest wired to TS path aliases via vite-tsconfig-paths and a pure ChordLine/curated-pair/pickRandomPair library shipped under TDD with 16 passing tests, ready for Plan 05-06 to consume.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-04T22:50:00Z
- **Completed:** 2026-06-04T23:02:00Z
- **Tasks:** 3
- **Files modified:** 5 (3 created, 2 updated)

## Accomplishments

- Vitest 4.1.8 + vite-tsconfig-paths 6.1.1 installed under devDependencies; `npm test` exits 0
- `vitest.config.ts` enables `@/...` alias resolution and excludes `e2e/**` so Playwright specs are not picked up
- `src/lib/mandala.ts` ships `generateLines`, `CURATED_PAIRS` (8 pairs locked per UI-SPEC §"Curated set"), `pickRandomPair`, plus `ChordLine` and `MandalaPair` interfaces — 71 lines, no `'use client'`, no `import 'server-only'`, client-bundle-safe
- 16 unit tests pass — geometry, determinism, curated-set lock, and exclusion-logic coverage
- `npm run build` exits 0; `npx tsc --noEmit` clean

## Task Commits

1. **Task 1: Vitest setup** — `f976ffe` (chore)
2. **Task 2: Failing tests for mandala lib** — `b291d6c` (test, RED)
3. **Task 3: Implement src/lib/mandala.ts** — `fe36b63` (feat, GREEN)

_TDD cycle: RED → GREEN. No REFACTOR commit needed — implementation landed clean at 71 lines._

## Files Created/Modified

- `vitest.config.ts` (created) — Vitest config with `tsconfigPaths()` plugin and `e2e/**` exclusion
- `src/lib/mandala.ts` (created) — Pure ChordLine generator + curated 8-pair set + RNG-injectable picker
- `src/lib/mandala.test.ts` (created) — 16 tests; geometry, determinism, exclusion, curated lock
- `package.json` (modified) — Added `test` and `test:watch` scripts; vitest, @vitest/ui, vite-tsconfig-paths under devDependencies
- `package-lock.json` (modified) — npm install side effect

## Decisions Made

- **Algorithm formula:** Used `j = ((i + 1) * k) mod n` (zero-indexed) instead of the literal prose `j = (i * k) mod n` from PLAN.md §"Algorithm". The test fixtures for `(n=4, k=1)` and `(n=4, k=2)` only satisfy the +1 form; the canonical Mathologer construction is conventionally iterated `i ∈ [1..n]`, which is equivalent to `(i+1)*k mod n` over `i ∈ [0..n-1]`. The cardioid case `(200, 2)` and the curated set verify identically under either reading once you align the index base. Treated PLAN.md's `<behavior>` block as the authoritative contract.
- **Vitest config form:** Kept `vite-tsconfig-paths` plugin per PLAN.md revision note (rather than the newer native `resolve.tsconfigPaths: true`) to match the locked acceptance criteria (`grep -c "tsconfigPaths" vitest.config.ts == 1` would not have hit on `tsconfigPaths: true`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Excluded `e2e/**` from Vitest discovery**
- **Found during:** Task 1 (Vitest setup verification)
- **Issue:** Default Vitest discovery picked up `e2e/uat-phase-02.spec.ts` and `e2e/uat-phase-03.spec.ts`, which call `test.describe()` from `@playwright/test`. Playwright's runtime panics when invoked under Vitest, producing 2 failed test files even though the empty unit suite would otherwise pass thanks to `--passWithNoTests`.
- **Fix:** Added `exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/out/**', 'e2e/**']` to `vitest.config.ts` so Playwright specs continue running only under `@playwright/test`.
- **Files modified:** `vitest.config.ts`
- **Verification:** `npm test` now reports `Test Files  1 passed (1)` and exits 0 cleanly.
- **Committed in:** `f976ffe` (Task 1 commit, before tests were ever written)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking)
**Impact on plan:** Necessary for the runner to function alongside the existing Playwright config. Zero scope creep.

## Issues Encountered

- **Algorithm prose vs. test contract mismatch.** The plan's prose said `j = (i * k) mod n`, but the test fixtures (line[0] for `(n=4, k=1)` is point 0 → point 1) require `j = ((i + 1) * k) mod n`. Resolved by treating the `<behavior>` block as authoritative (it is the testable contract) and documenting the choice both in code comments and in this summary. Cardioid case `(200, 2)` and the rest of the curated set work identically under either zero-indexing reading; only the n=4 fixtures distinguish the two. Plan 05-06 should ship the same formula.
- **Dev warning from vitest:** "The plugin vite-tsconfig-paths is detected. Vite now supports tsconfig paths resolution natively via the resolve.tsconfigPaths option." — informational only, does not affect behavior. PLAN.md's revision note locked the plugin, so the warning is intentional.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 05-06 (HeroMandala) has a verified, deterministic library to consume:
  - `import { generateLines, CURATED_PAIRS, pickRandomPair, type ChordLine, type MandalaPair } from '@/lib/mandala'`
  - RNG injection point (`pickRandomPair(exclude, rng)`) supports the D-05 refresh-button and D-06 hero-scroll-out reset without coupling to `Math.random` for testing.
- Future Vitest unit tests in this repo:
  - Place under any path NOT matching `e2e/**` (e.g. `src/<area>/<file>.test.ts` or `tests/unit/<file>.test.ts`).
  - Use explicit Vitest imports (`import { describe, it, expect } from 'vitest'`) to keep `tsc --noEmit` green.
  - Use `@/...` aliases freely — `vite-tsconfig-paths` resolves them.

## Self-Check: PASSED

- `vitest.config.ts` exists ✓
- `src/lib/mandala.ts` exists (71 lines) ✓
- `src/lib/mandala.test.ts` exists ✓
- Commit `f976ffe` (Task 1) found ✓
- Commit `b291d6c` (Task 2 RED) found ✓
- Commit `fe36b63` (Task 3 GREEN) found ✓
- `npm test` exits 0; 16 unit tests pass ✓
- `npx tsc --noEmit` exits 0 ✓
- `npm run build` exits 0 ✓
- TDD gate sequence: `test(...)` (b291d6c) → `feat(...)` (fe36b63) ✓

---
*Phase: 05-polish*
*Completed: 2026-06-04*
