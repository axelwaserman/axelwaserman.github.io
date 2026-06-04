---
phase: 05-polish
plan: 01
subsystem: infra
tags: [github-pages, github-actions, metadata, seo, opengraph]

requires:
  - phase: 04-deploy
    provides: GitHub Actions deploy workflow with build step env block
  - phase: 03-projects
    provides: src/lib/projects.ts build-time fetcher with GITHUB_USERNAME default
  - phase: 02-content
    provides: Hero, Contact, ProjectsEmptyState components and layout metadata
provides:
  - Username default + workflow env both target axelwaserman (D-21 belt-and-braces)
  - All source URLs reference real GitHub/LinkedIn accounts (D-23 sweep)
  - Hero and Contact email anchors point to axel.waserman@gmail.com (D-17 resolved 2026-06-04)
  - layout.tsx metadata title aligned with D-15 (Senior Engineering Manager) and host axelwaserman.github.io
affects: [05-polish remaining plans, future content-data refactor (Plan 05-07), live GitHub fetch (Plan 05-08)]

tech-stack:
  added: []
  patterns:
    - "Workflow build-step env: hardcode user-page username at workflow level so the project is self-contained even if no env var is exported in dev"
    - "Metadata title strings are kept in lockstep with cv.ts title (Senior Engineering Manager) and Hero h1 (h1 alignment lands in 05-06)"

key-files:
  created: []
  modified:
    - src/lib/projects.ts
    - .github/workflows/deploy.yml
    - src/components/hero/Hero.tsx
    - src/components/contact/Contact.tsx
    - src/components/projects/ProjectsEmptyState.tsx
    - src/app/layout.tsx
    - .planning/REQUIREMENTS.md

key-decisions:
  - "D-21 implemented as belt-and-braces: source default 'axelwaserman' AND workflow env GITHUB_USERNAME=axelwaserman so neither side silently masks a regression"
  - "D-23 stale-username sweep covered source, components, layout metadata, workflow, and REQUIREMENTS.md (PROJECT.md was already clean — no edit needed)"
  - "D-17 resolved (2026-06-04) — both mailto:axel@example.com placeholders updated to mailto:axel.waserman@gmail.com; Hero email anchor preserved (four-link CTA cluster intact)"
  - "Hero h1 visible 'Axel W' deliberately left for Plan 05-06 to reconcile alongside the two-column hero restructure; metadata-string alignment in layout.tsx is the contract minimum here"

patterns-established:
  - "Username sweep checklist: any time the GitHub user changes, update both src/lib/projects.ts default and .github/workflows/deploy.yml env: GITHUB_USERNAME"
  - "Metadata-title source-of-truth rule: title in src/app/layout.tsx mirrors title in src/data/cv.ts; both must change together (Plan 05-06 will further unify with Hero h1)"

requirements-completed: []

duration: 12min
completed: 2026-06-04
---

# Phase 05 Plan 01: Username + URL sweep + metadata title alignment Summary

**Replaced every stale `axelw` reference across source, workflow, and planning files with `axelwaserman`; restored the resolved email `axel.waserman@gmail.com` to Hero and Contact anchors; aligned layout metadata title with D-15 (`Senior Engineering Manager`).**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-04T (this execution session)
- **Completed:** 2026-06-04
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- **D-21 implemented:** `src/lib/projects.ts` line 7 default and `.github/workflows/deploy.yml` build-step `env:` both target `axelwaserman`. Phase 4 workflow surface (cron, permissions, concurrency, action versions, `GITHUB_TOKEN`) preserved verbatim.
- **D-23 implemented:** All `axelw` URLs and hosts in source/components and `layout.tsx` metadata replaced with the correct `axelwaserman` URLs. ProjectsEmptyState repo URL points at the real user-page repo.
- **D-17 closure (partial):** Both `mailto:axel@example.com` placeholders are now `mailto:axel.waserman@gmail.com`. Hero CTA cluster keeps its four-link structure (GitHub / LinkedIn / Email / Download CV) per UI-SPEC §Copywriting Contract.
- **Metadata title alignment:** Every occurrence of `'Axel W — Software Engineer'` in `src/app/layout.tsx` (title, openGraph.title, openGraph.images.alt, twitter.title) is now `'Axel Waserman — Senior Engineering Manager'`; siteName is `'Axel Waserman'`; metadataBase + openGraph.url use `https://axelwaserman.github.io`.
- **Build green:** `npm run build` exits 0 after every task.

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix `src/lib/projects.ts` default username + add workflow env var** — `8bc90e2` (fix)
2. **Task 2: Replace `axelw` URLs in Hero, Contact, ProjectsEmptyState, layout metadata; restore real email** — `efccc37` (fix)
3. **Task 3: Update REQUIREMENTS.md to reference axelwaserman.github.io** — `89a9ffb` (docs)

## Files Created/Modified

- `src/lib/projects.ts` — default `GITHUB_USERNAME` changed from `'axelw'` to `'axelwaserman'` (line 7 only). Every other line preserved verbatim including `import 'server-only'`, the `GitHubRepo` interface, pagination loop, fork/archive/disabled filter, sort by `pushed_at` desc, fallback path, and the eslint-disable build-time `console.warn`.
- `.github/workflows/deploy.yml` — added `GITHUB_USERNAME: axelwaserman` as a second key under the `Build Next.js static export` step's `env:` block. Cron schedule, permissions, concurrency, action versions (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/cache@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v5`), and the existing `GITHUB_TOKEN` env are unchanged.
- `src/components/hero/Hero.tsx` — three `href` updates: GitHub → `https://github.com/axelwaserman`; LinkedIn → `https://www.linkedin.com/in/axel-waserman-9753221a6/`; Email → `mailto:axel.waserman@gmail.com`. CTA cluster of four anchors (GitHub / LinkedIn / Email / Download CV) preserved with all className tokens and visible labels intact.
- `src/components/contact/Contact.tsx` — three `href` updates mirroring Hero (Email, LinkedIn, GitHub). No structural / className changes — Plan 05-07 owns the centering and conversion to data-driven `contact` import.
- `src/components/projects/ProjectsEmptyState.tsx` — repo URL now `https://github.com/axelwaserman/axelwaserman.github.io`.
- `src/app/layout.tsx` — `metadataBase` and `openGraph.url` use `https://axelwaserman.github.io`; every `'Axel W — Software Engineer'` string and the `'Axel W'` siteName updated to `'Axel Waserman — Senior Engineering Manager'` / `'Axel Waserman'` per D-15 + UI-SPEC §Copywriting.
- `.planning/REQUIREMENTS.md` — title heading and INFRA-07 narrative now say `axelwaserman.github.io`. Requirement IDs, statuses, and traceability table preserved.

## Decisions Made

- **Implemented D-21 belt-and-braces.** Both source default and workflow env target `axelwaserman` so a regression in either layer surfaces immediately rather than being silently masked.
- **Implemented D-23 sweep across the full surface listed in the plan.** Verified `.planning/PROJECT.md` was already clean (only mention of `axelwaserman` in a Phase 4 decision row referencing `axelwaserman.github.io` — not stale); no edit required there.
- **Treated D-17 as resolved.** Per the plan revision note dated 2026-06-04, the email is the literal string `axel.waserman@gmail.com`. Updated both `mailto:` anchors directly; no sentinel/TBD handling.
- **Did not change Hero `<h1>` visible text from `Axel W`.** Plan 05-01 explicitly defers this to Plan 05-06 where the two-column hero restructure happens. Layout metadata strings (Senior Engineering Manager, Axel Waserman) are aligned per the plan's contract minimum.

## Deviations from Plan

None — plan executed exactly as written.

The plan flagged that `.planning/PROJECT.md` should be re-checked for stale references; the pre-edit grep confirmed PROJECT.md only contained the correct `axelwaserman.github.io` reference (in the Phase 4 user-page-repo decision row), so no edit was performed. This matches the plan's "if matches existed, they were updated" branch with the "no matches" outcome.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 05-08 (live GitHub fetch verification) is unblocked at the username layer: a CI build now exports `GITHUB_USERNAME=axelwaserman`, and any local build outside CI defaults to the same value.
- Plan 05-02 (data-driven refactor of CV / contact / hero) can directly seed `contact.email = 'axel.waserman@gmail.com'` without any TBD handling.
- Plan 05-06 (two-column hero) will reconcile the visible Hero `<h1>` (`Axel W`) with the now-aligned metadata `Axel Waserman` strings.
- Plan 05-07 (Contact centering + data-driven import) can swap the now-correct hard-coded `mailto:axel.waserman@gmail.com` and the GitHub/LinkedIn URLs to read from `contact.*` without further URL edits.
- Phase 5 Success Criterion #4 ("Projects section renders Axel's real public repos via the GitHub API at build time") is no longer blocked by a stale username.

## Self-Check: PASSED

All claimed files exist on disk and all task commits (`8bc90e2`, `efccc37`, `89a9ffb`) are reachable from `HEAD`.

---
*Phase: 05-polish*
*Completed: 2026-06-04*
