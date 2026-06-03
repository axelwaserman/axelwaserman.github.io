---
phase: 03-projects
plan: 03
subsystem: projects
tags: [polish, relative-date, hover-state, empty-state, playwright, unit-test, accessibility]
dependency_graph:
  requires:
    - 03-01 (Project type, ProjectCard, Projects, FadeUp data-fadein attribute)
    - 03-02 (enriched projects.json fallback data)
  provides:
    - src/lib/date.ts (formatRelativeDate — nullable ISO string → relative string)
    - src/components/projects/ProjectsEmptyState.tsx (empty-state Server Component)
    - src/components/projects/ProjectCard.tsx (Wave 1 + Plan 03 polish: relative date, hover states)
    - src/components/projects/Projects.tsx (Wave 1 + Plan 03 polish: empty-state guard)
    - e2e/uat-phase-03.spec.ts (Playwright UAT — 6 tests, all passing)
    - tests/unit/date.test.ts (Node --test unit tests for formatRelativeDate)
  affects:
    - playwright.config.ts (baseURL updated to port 3001 — port 3000 occupied by Dagster on this machine)
tech_stack:
  added: []
  patterns:
    - Intl.RelativeTimeFormat with pinned-now for testability
    - CSS group/group-hover for card-level hover state propagation to child elements
    - Playwright role-based locators (getByRole) for structural resilience
    - Node --test for pure utility unit tests (no Vitest required)
key_files:
  created:
    - src/lib/date.ts
    - src/components/projects/ProjectsEmptyState.tsx
    - e2e/uat-phase-03.spec.ts
    - tests/unit/date.test.ts
  modified:
    - src/components/projects/ProjectCard.tsx
    - src/components/projects/Projects.tsx
    - playwright.config.ts
decisions:
  - "formatRelativeDate accepts string | null end-to-end (REVIEW H-8) — returns '' for null/empty/invalid, 'today' for <24h including future dates (clock-skew clamp)"
  - "UAT-5 hard-targets [data-fadein] with no ?? el.parentElement fallback (REVIEW C-1) — test throws loudly if FadeUp wrapper is missing"
  - "UAT-3 uses getByRole('link', name: /repository on GitHub$/i) with exact count assertion (REVIEW H-9)"
  - "UAT-1 uses /.+/ non-empty check instead of bug-attractive ICU regex (REVIEW M-10)"
  - "playwright.config.ts baseURL set to port 3001 — deviation from plan (port 3000 occupied by Dagster on this machine)"
  - "ProjectCard hover states use CSS group/group-hover — compositor-friendly color and border-color only, within prefers-reduced-motion fine envelope"
  - "ARCHIVED_REPO_NAMES is [] — live API check on 2026-06-02 confirmed zero archived repos under axelw"
metrics:
  duration: "~30 minutes"
  completed: "2026-06-02"
  tasks_completed: 3
  files_changed: 7
---

# Phase 03 Plan 03: Polish + Playwright UAT Summary

formatRelativeDate utility with nullable contract, hover/empty-state polish on ProjectCard and Projects, and a 6-test Playwright UAT spec that hard-targets [data-fadein] (REVIEW C-1), uses role-based locators (REVIEW H-9), and avoids the Phase-2 tautological reduced-motion pattern.

## What Was Built

1. **`src/lib/date.ts`** — `formatRelativeDate(iso: string | null, now?: Date): string`: accepts null/empty/invalid and returns `''`; returns `'today'` for deltas < 24h (including future dates via clamp-to-zero); uses `Intl.RelativeTimeFormat('en', { numeric: 'auto' })` for year/month/day bucketing; `DAYS_PER_YEAR = 365.25`, `DAYS_PER_MONTH = 30.44` named constants; defaulted `now` parameter for deterministic testing; no React/Next imports; pure module.

2. **`src/components/projects/ProjectsEmptyState.tsx`** — Server Component rendering the UI-SPEC empty-state copy ("No public projects yet." + "Check back soon…") with focus-visible: outline on the GitHub link, no use client.

3. **`src/components/projects/ProjectCard.tsx` (modified)** — Three changes from Wave 1 baseline:
   - Imports `formatRelativeDate` from `@/lib/date`; replaces `pushedAt.slice(0,10)` with computed `relative` variable
   - Article gets `group` + `transition-colors duration-200 ease-out hover:border-[var(--color-accent)]/40`
   - h3 gets `transition-colors duration-200 ease-out group-hover:text-[var(--color-accent)]`
   - Wave 1's `focus-visible:outline-*` preserved (REVIEW H-7 regression confirmed: 2 occurrences, zero plain `focus:outline` classes)

4. **`src/components/projects/Projects.tsx` (modified)** — Added `ProjectsEmptyState` import; wrapped grid render in `projects.length === 0 ? <ProjectsEmptyState /> : <ul>…</ul>` conditional; section shell and headings always rendered.

5. **`e2e/uat-phase-03.spec.ts`** — 6 Playwright tests, all passing:
   - UAT-1: section#projects + h2 + ul/empty-state; meta text matches `/.+/` (REVIEW M-10)
   - UAT-2: ARCHIVED_REPO_NAMES strict not-to-contain assertion (vacuous for [] but shape is load-bearing)
   - UAT-3: role-based Repo link locator + exactly-one-link guard + vacuity check (REVIEW H-9)
   - UAT-4: header `#projects` anchor scrolls section into view under sticky header
   - UAT-5: reduced-motion check with hard [data-fadein] target + throw on missing wrapper (REVIEW C-1)
   - UAT-6: visual snapshots at 320/768/1280/1440 with single/double column assertions

6. **`tests/unit/date.test.ts`** — 6 Node `--test` unit tests with `NOW = new Date('2026-06-02T12:00:00Z')`: null → '', empty → '', invalid → '', <24h → 'today', future → 'today', ~3mo → /month/i match (REVIEW M-10 deterministic coverage)

## Tasks

| Task | Name | Commit |
|------|------|--------|
| 1 | formatRelativeDate utility and ProjectsEmptyState component | b42ebcb |
| 2 | UI-SPEC polish — hover states, relative date meta, empty-state guard | d1c5613 |
| 3 | Phase 3 Playwright UAT spec and unit tests | 6dce04d |

## Deviations from Plan

### Auto-fixed Issues

None.

### Scope Adjustments

**1. [Note] playwright.config.ts baseURL changed to port 3001**
- **Found during:** Task 3 verify
- **Issue:** Port 3000 was occupied by a Dagster instance on this machine; all 5 spec tests that waited on `section#projects` timed out
- **Fix:** Updated `playwright.config.ts` to use `baseURL: 'http://localhost:3001'` and `command: 'npm run dev -- --port 3001'`
- **Files modified:** `playwright.config.ts`
- **Impact:** Tests pass locally on port 3001; CI will spin up fresh — the `reuseExistingServer: true` flag means CI uses whatever port the `command` binds, so this is safe. If CI already has a `next dev` on 3001, `reuseExistingServer` reuses it. No behavioral change to the app.

## Security Verification

- No new attack surface: Plan 03 adds CSS-only hover states (paint-only, no DOM mutation), a pure utility (no network/DOM), and tests.
- T-03-08 (carried forward from Wave 1): `isHttpUrl()` in `src/lib/projects.ts` still validates homepage at fetch time — ProjectCard's `{project.homepage && …}` guard hides any null. No new homepage-handling code added.
- Build output: `grep -rE "GITHUB_TOKEN|Bearer " out/_next/static/` still returns 0 matches (re-verified after build).

## Build Verification

- `npx tsc --noEmit` exits 0
- `npm run build` exits 0; build output includes `group-hover` class in CSS chunks
- `out/index.html` contains `id="projects"`, `"Selected work on GitHub"`, and `href="https://github.com/axelw/"` links
- `npx tsx --test tests/unit/date.test.ts` exits 0 (6 pass, 0 fail)
- `npx playwright test e2e/uat-phase-03.spec.ts` exits 0 (6 pass in 11.7s)

## Known Stubs

None — all content is live. `ProjectsEmptyState` renders actual copy. `formatRelativeDate` is fully implemented. All Playwright assertions cover real rendered output.

## Threat Flags

No new security-relevant surface introduced in this plan. All changes are CSS-only polish, pure utility, and test infrastructure.

## Self-Check: PASSED

- [x] `src/lib/date.ts` exists and exports `formatRelativeDate`
- [x] `src/components/projects/ProjectsEmptyState.tsx` exists
- [x] `src/components/projects/ProjectCard.tsx` contains `group`, `hover:border-[var(--color-accent)]/40`, `group-hover:text-[var(--color-accent)]`
- [x] `src/components/projects/Projects.tsx` contains `projects.length === 0` conditional
- [x] `e2e/uat-phase-03.spec.ts` exists with 6 tests
- [x] `tests/unit/date.test.ts` exists with 6 unit tests
- [x] Commits b42ebcb, d1c5613, 6dce04d all present in git log
- [x] All 6 Playwright tests pass
- [x] All 6 unit tests pass
- [x] tsc exits 0
- [x] build exits 0
