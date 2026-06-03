---
phase: 03
verified_at: 2026-06-03
status: passed
score: 4/4 must-haves verified
overrides_applied: 0
requirements:
  PROJ-01: SATISFIED
  PROJ-02: SATISFIED
  PROJ-03: SATISFIED
adversarial_findings_addressed:
  C-1: VERIFIED
  C-2: VERIFIED
  C-3: VERIFIED
  H-4: VERIFIED
  H-5: VERIFIED
  H-6: VERIFIED
  H-7: VERIFIED
  H-8: VERIFIED
  H-9: VERIFIED
open_concerns_for_next_phase:
  - "playwright.config.ts baseURL hardcoded to port 3001 (deviation from project default 3000) — potential CI brittleness"
  - "CR-01 from 03-REVIEW.md: UAT-2 ARCHIVED_REPO_NAMES=[] is structurally vacuous — no positive-control fixture asserts the archived filter"
  - "WR-01: validator on entry shape does not gate disabled/fork booleans — silent under-reporting if API drifts"
  - "WR-02: fetch has no AbortController/timeout — hung GitHub responses stall next build indefinitely"
  - "WR-03: projectsFallback JSON path is not run through isHttpUrl on homepage values — defense gap relative to live-fetch path"
  - "WR-04: repoUrl from live API is not scheme-validated symmetrically with homepage"
  - "WR-05: console.warn relies on inline eslint-disable rather than centralized override"
  - "IN-05: GITHUB_HANDLE not extracted to a shared constant (still hardcoded across 5+ files)"
---

# Phase 3: Projects Verification Report

**Phase Goal:** The projects section is populated with Axel's public GitHub repos fetched at build time — each entry shows name, description, and a repo link; archived repos are excluded
**Verified:** 2026-06-03
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### ROADMAP Success Criteria

| # | Success Criterion | Status | Evidence |
|---|-------------------|--------|----------|
| 1 | Running `next build` fetches repos from the GitHub API and bakes them into static HTML (no client-side fetch) | VERIFIED | `src/lib/projects.ts:23` exports async `fetchProjects()`; consumed by `src/components/projects/Projects.tsx:5` (async Server Component, no `'use client'`); `out/index.html` contains 4 `href="https://github.com/axelw/..."` entries baked into static HTML; pre-verified evidence: forced-fallback build exit 0 with `::warning::` log |
| 2 | Each project card shows the repo name, description, and a link to the repo | VERIFIED | `ProjectCard.tsx:13` renders `{project.name}` in `<h3>`; line 24 renders description (with `?.trim()` guard); lines 27-35 render Repo link with `aria-label="View ... repository on GitHub"` |
| 3 | Project cards with a `homepage` field show a live demo link; cards without one do not | VERIFIED | `ProjectCard.tsx:36` conditional `{project.homepage && (...)}` renders Live demo link only when homepage truthy; `src/lib/projects.ts:25-33,105` validates protocol via `isHttpUrl` so non-http(s) coerces to `null` |
| 4 | Archived repos do not appear in the projects list | VERIFIED (with caveat) | `src/lib/projects.ts:85-87` filters `archived === false && disabled === false && fork === false`; UAT-2 in `e2e/uat-phase-03.spec.ts` provides assertion shape but ARCHIVED_REPO_NAMES=[] makes the loop vacuous (see CR-01) — filter logic is sound; test coverage gap is tracked as a future concern |

**Score:** 4/4 ROADMAP success criteria verified

### Requirements Coverage

| Requirement | Description | Status | Evidence |
|-------------|-------------|--------|----------|
| PROJ-01 | Projects section fetches public GitHub repos via the GitHub REST API at build time | SATISFIED | Build-time fetch in `fetchProjects()`; URL `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&type=owner&sort=pushed&direction=desc`; called from async Server Component `Projects.tsx`; no `'use client'` in projects pipeline |
| PROJ-02 | Each project entry displays the repo name and description | SATISFIED | `ProjectCard.tsx:13` (name); line 24 (description with whitespace-trim guard) |
| PROJ-03 | Each project entry links to a live demo if the repo's `homepage` field is set | SATISFIED | `ProjectCard.tsx:36` conditional `{project.homepage && (...)}` plus `isHttpUrl` validator at the fetch boundary ensuring only valid http(s) URLs survive |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/projects.ts` | Server-only fetcher with pagination, URL allowlist, try/catch fallback, sanitized warn | VERIFIED | 116 lines; `import 'server-only'` first non-comment line; isHttpUrl + parseLinkNext + Link-header pagination; MAX_PAGES=5; try/catch returns `projectsFallback as unknown as Project[]`; sole `console.warn` references `error.name` only |
| `src/data/projects.ts` | `Project` interface with nullable fields incl. `pushedAt: string \| null` | VERIFIED | Exact 6-field interface; `pushedAt: string \| null`, `description \| language \| homepage: string \| null` |
| `src/data/projects.json` | Committed fallback with ≥4 entries (Wave 2) | VERIFIED | 5 entries (axelw.github.io + 4 real repos); all fields present; JSON validates against Project shape |
| `src/components/projects/Projects.tsx` | Server Component, async, empty-state guard | VERIFIED | Async Server Component; renders eyebrow + h2 + grid OR `<ProjectsEmptyState />` when `projects.length === 0` |
| `src/components/projects/ProjectCard.tsx` | Card with name, description, language, relative date, repo link, optional live demo | VERIFIED | All fields rendered; uses `formatRelativeDate`; focus-visible outlines on both links; whitespace `?.trim()` guard on description |
| `src/components/projects/ProjectsEmptyState.tsx` | Empty-state UI with GitHub link | VERIFIED | Renders UI-SPEC copy ("No public projects yet." + "Check back soon"); link to `https://github.com/axelw/axelw.github.io` with focus-visible outline |
| `src/lib/date.ts` | `formatRelativeDate` utility, nullable input | VERIFIED | `formatRelativeDate(iso: string \| null, now?: Date): string`; returns `''` for null/empty/invalid; `'today'` for <24h; uses Intl.RelativeTimeFormat with named DAYS_PER_YEAR/DAYS_PER_MONTH constants |
| `src/app/page.tsx` | Projects wired between CV and Contact | VERIFIED | `<FadeUp><Projects /></FadeUp>` between CV and Contact wrappers (lines 17-19) |
| `src/components/ui/FadeUp.tsx` | Wrapper emits `data-fadein` attribute (REVIEW C-1) | VERIFIED | Line 45: `<div ref={ref} data-fadein className={className}>` |
| `e2e/uat-phase-03.spec.ts` | 6 Playwright UAT specs | VERIFIED | 6 tests (UAT-1 through UAT-6); pre-verified passing 6/6 on phase-03-projects branch |
| `tests/unit/date.test.ts` | Unit tests for `formatRelativeDate` | VERIFIED | 6 tests, all passing locally during verification (re-run on 2026-06-03) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `Projects.tsx` | `src/lib/projects.ts` | `import { fetchProjects } from '@/lib/projects'` | WIRED | Line 1; called at line 6 inside async function |
| `Projects.tsx` | `ProjectCard.tsx` | `import ProjectCard from './ProjectCard'` | WIRED | Line 2; consumed inside `<ul>` map at line 29 |
| `Projects.tsx` | `ProjectsEmptyState.tsx` | `import ProjectsEmptyState` + conditional render | WIRED | Line 3; rendered when `projects.length === 0` (line 23) |
| `ProjectCard.tsx` | `src/data/projects.ts` | `import type { Project }` | WIRED | Line 1 (type-only import) |
| `ProjectCard.tsx` | `src/lib/date.ts` | `import { formatRelativeDate }` | WIRED | Line 2; called at line 9 |
| `src/lib/projects.ts` | GitHub API | `fetch(...)` with URL `api.github.com/users/...` | WIRED | Line 54 builds URL; line 65 calls `fetch(nextUrl, { headers })` |
| `src/lib/projects.ts` | `src/data/projects.json` | `import projectsFallback from '@/data/projects.json'` | WIRED | Line 5; returned in catch (line 113) |
| `src/app/page.tsx` | `src/components/projects/Projects.tsx` | `import Projects` + `<FadeUp><Projects/></FadeUp>` | WIRED | Lines 4, 17-19 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `Projects.tsx` | `projects` | `await fetchProjects()` | Real GitHub API at build time + JSON fallback (5 entries) | FLOWING |
| `ProjectCard.tsx` | `project` (prop) | Passed from `Projects.tsx` map | Live data piped from fetcher | FLOWING |
| `out/index.html` | static HTML | `next build` Server Component output | 4 GitHub URLs baked in (`href="https://github.com/axelw/..."` × 4) — verified via grep | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles cleanly | `npx tsc --noEmit` | exit 0, no output | PASS |
| Unit tests pass | `npx tsx --test tests/unit/date.test.ts` | 6 pass / 0 fail / 0 skipped | PASS |
| `out/index.html` has Projects anchor | `grep 'id="projects"' out/index.html \| wc -l` | 1 | PASS |
| `out/index.html` has section heading | `grep "Selected work on GitHub" out/index.html \| wc -l` | 2 (visible h2 + aria) | PASS |
| `out/index.html` has GitHub repo links | `grep -oE 'href="https://github.com/axelw/[^"]+"' out/index.html \| wc -l` | 4 | PASS |
| Token leak scan: client chunks | `grep -rE "GITHUB_TOKEN\|Bearer " out/_next/static/ \| wc -l` | 0 | PASS |
| Token leak scan: HTML | `grep -E "GITHUB_TOKEN\|Bearer " out/index.html \| wc -l` | 0 | PASS |
| `import 'server-only'` is first non-comment line | `head -1 src/lib/projects.ts` | `import 'server-only'` | PASS |
| No `.message` in console.* calls | `grep -E "console\.[a-z]+\([^)]*\.message" src/lib/projects.ts` | 0 matches | PASS |
| No plain `focus:outline-*` regression | `grep -E '(^\|["\\s])focus:outline' src/components/projects/ProjectCard.tsx` | 0 matches | PASS |
| `focus-visible:outline` present | `grep -c "focus-visible:outline" src/components/projects/ProjectCard.tsx` | 2 (Repo + Live demo) | PASS |
| `data-fadein` attribute on FadeUp wrapper | `grep -c "data-fadein" src/components/ui/FadeUp.tsx` | 1 | PASS |

### Adversarial Review Traceability (03-REVIEWS.md)

| Finding | Concern | Status | Evidence |
|---------|---------|--------|----------|
| C-1 | UAT reduced-motion check tautological — needs `data-fadein` hard target | ADDRESSED | FadeUp.tsx line 45 emits `data-fadein`; UAT-5 uses `el.closest('[data-fadein]')` and throws if missing (e2e/uat-phase-03.spec.ts:155-160), no `?? el.parentElement` fallback |
| C-2 | `process.env.GITHUB_TOKEN` could be inlined into client bundle | ADDRESSED | `import 'server-only'` is line 1 of `src/lib/projects.ts`; `out/_next/static/` token-leak scan returns 0 matches; pre-verified during Wave 2 forced-fallback build |
| C-3 | `homepage` href has no protocol allowlist (javascript: hole) | ADDRESSED | `isHttpUrl` helper in `src/lib/projects.ts:25-33` validates `new URL(raw).protocol === 'http:' \|\| 'https:'`; applied in mapping at line 105 |
| H-4 | Wave 1 ships build that hard-fails on any API error | ADDRESSED | try/catch wraps entire fetcher body (line 24, 107); catch returns `projectsFallback as unknown as Project[]`; Wave 1 seeded JSON with 1 entry, Wave 2 enriched to 5 |
| H-5 | Forced-fallback build leaks `Bearer ...` via error.message | ADDRESSED | `console.warn` references `error.name` only (line 111); pre-verified Wave 2 forced-fallback log contains zero `Bearer`/`Authorization` substrings |
| H-6 | D-04 silently violated by per_page=100 cap | ADDRESSED | Link-header pagination via `parseLinkNext` (line 35-42); `MAX_PAGES = 5` cap with explicit error throw on overflow (line 60-63); `::warning::` prefix on fallback warn surfaces in GitHub Actions UI |
| H-7 | focus-visible upgrade deferred to Wave 3 — accessibility regression in interim | ADDRESSED | `focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2` shipped in Wave 1 ProjectCard; zero plain `focus:outline-*` in file |
| H-8 | `pushedAt` validation accepts null but type forbids it | ADDRESSED | `Project.pushedAt: string \| null` end-to-end; ProjectCard guards `<time>` element with `relative && project.pushedAt`; `formatRelativeDate(null)` returns `''` (verified via unit test) |
| H-9 | UAT-3 first-anchor locator strategy fragile | ADDRESSED | UAT-3 uses `card.getByRole('link', { name: /repository on GitHub$/i })` with exact `.toBe(1)` count assertion (e2e/uat-phase-03.spec.ts:82-83) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/projects.ts` | 108 | `// eslint-disable-next-line no-console` | INFO | Intentional, justified inline; build-time only behind `import 'server-only'` guard. Tracked as WR-05 in 03-REVIEW.md as future-concern. |
| `e2e/uat-phase-03.spec.ts` | 20 | `ARCHIVED_REPO_NAMES: string[] = []` | WARNING | UAT-2 loop iterates zero times — currently asserts only that h3 text is non-empty. Filter logic in source IS correct; test coverage of the filter is the gap. CR-01 in 03-REVIEW.md. |

No BLOCKER-level anti-patterns. All TBD/FIXME/XXX scan returned no matches in modified files.

### Human Verification Required

None required. All four ROADMAP success criteria are observable via static HTML grep + already-passed Playwright UAT (6/6) + already-passed unit tests (6/6 reverified during this verification). Visual quality is owned by 03-UI-SPEC and confirmed via Playwright screenshots at 320/768/1280/1440. The phase is ready to proceed to Phase 4 (Deploy).

### Gaps Summary

No goal-blocking gaps. Phase 3 delivers all three Phase requirements (PROJ-01/02/03) and all four ROADMAP success criteria with substantive, wired, data-flowing implementations. The adversarial review findings (C-1 through H-9) from `03-REVIEWS.md` are all addressed in the codebase as documented above.

**Open concerns to triage before or during Phase 4 (advisory only — none block phase 3 acceptance):**

1. **playwright.config.ts port deviation** — `baseURL` hardcoded to `http://localhost:3001` and `webServer.command: 'npm run dev -- --port 3001'`. The 03-03-SUMMARY notes this was a local-machine workaround for a Dagster process on port 3000. CI may need a portable approach (env var, dynamic port detection) before Phase 4 deploy automation runs.

2. **CR-01 — UAT-2 archived-repo assertion is structurally vacuous** (Critical in code-review, Warning here because the source filter is verified correct). `ARCHIVED_REPO_NAMES = []` means the for-loop iterates zero times. The production filter at `src/lib/projects.ts:86` is sound, but UAT-2 cannot detect a regression of that filter. Recommended fix: a unit test in `tests/unit/projects.test.ts` with a stubbed `fetch` that exercises the archived/non-archived paths.

3. **WR-01 — disabled/fork validator gap** — entry-shape guard only checks name/html_url/archived. Missing/non-boolean `disabled` or `fork` causes silent under-reporting (entry filtered out rather than thrown).

4. **WR-02 — fetch has no AbortController/timeout** — hung GitHub responses stall `next build` indefinitely on local machines (CI has job-level timeouts).

5. **WR-03 — projects.json fallback path bypasses isHttpUrl** — a malicious commit injecting `"homepage": "javascript:..."` into the JSON would re-open the C-3 hole on the fallback path.

6. **WR-04 — repoUrl from live API is not scheme-validated symmetrically** with homepage. Defense-in-depth gap.

7. **WR-05 — eslint-disable for console.warn** — fragile; a project-local logger or central eslint override would be more durable.

8. **IN-05 — GITHUB_HANDLE not extracted to a shared constant** — the `axelw` literal still appears in 5+ files (ProjectsEmptyState, Contact, Hero, projects.ts, projects.json, e2e spec). Original L-16 review item only partially addressed inside `src/lib/projects.ts`.

These are documented in `03-REVIEW.md` and should be considered for the Phase 4 plan or a maintenance follow-up.

---

*Verified: 2026-06-03*
*Verifier: Claude (gsd-verifier)*
