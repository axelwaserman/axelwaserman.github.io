---
phase: 03-projects
plan: 01
subsystem: projects
tags: [github-api, server-component, data-fetching, security, accessibility]
dependency_graph:
  requires:
    - 02-content (FadeUp, tokens, page.tsx, section patterns)
  provides:
    - src/data/projects.ts (Project type)
    - src/data/projects.json (fallback seed data)
    - src/lib/projects.ts (fetchProjects server-only fetcher)
    - src/components/projects/Projects.tsx (section server component)
    - src/components/projects/ProjectCard.tsx (card presentational component)
  affects:
    - src/components/ui/FadeUp.tsx (data-fadein attribute added)
    - src/app/page.tsx (Projects wired between CV and Contact)
tech_stack:
  added:
    - server-only (Next.js guard package — prevents client bundle inclusion)
  patterns:
    - Server Component async function with build-time GitHub REST API fetch
    - Link-header pagination with MAX_PAGES=5 guard
    - try/catch fallback to committed JSON on any fetch failure
    - isHttpUrl() URL protocol allowlist (http:/https: only)
    - import 'server-only' to block GITHUB_TOKEN client bundle inlining
key_files:
  created:
    - src/data/projects.ts
    - src/data/projects.json
    - src/lib/projects.ts
    - src/components/projects/Projects.tsx
    - src/components/projects/ProjectCard.tsx
  modified:
    - src/components/ui/FadeUp.tsx
    - src/app/page.tsx
decisions:
  - "Project.pushedAt is string | null end-to-end (REVIEW H-8) — GitHub returns null for repos with no pushes"
  - "Wave 1 ships with JSON fallback inline (REVIEW H-4 path-a) — build always succeeds regardless of API availability"
  - "import 'server-only' is first non-comment line of src/lib/projects.ts (REVIEW C-2) — structural GITHUB_TOKEN client-bundle guard"
  - "isHttpUrl() validates homepage via new URL().protocol allowlist (REVIEW C-3) — javascript: scheme XSS blocked at fetch time"
  - "focus-visible: used from day one on all links (REVIEW H-7) — no plain focus: regression"
  - "error.name only in console.warn, never error.message (REVIEW H-5) — no request frame leakage in build logs"
  - "::warning:: prefix on fallback warn — surfaces in GitHub Actions job summary UI"
  - "GITHUB_USERNAME centralized constant (REVIEW L-16) — single location for username reference"
  - "Fork filter fork === false intentional (REVIEW L-14) — only owned repos shown"
metrics:
  duration: "~15 minutes"
  completed: "2026-06-02"
  tasks_completed: 3
  files_changed: 7
---

# Phase 03 Plan 01: Projects MVP Slice Summary

Server-only build-time GitHub fetcher with Link-header pagination, XSS-safe URL validation, JSON fallback, typed Project shape, focusable card grid, and FadeUp data-fadein attribute — fully hardened per the cross-AI adversarial review.

## What Was Built

A complete end-to-end Projects section for the personal website:

1. **`src/data/projects.ts`** — `Project` interface with `pushedAt: string | null` and four other nullable fields
2. **`src/data/projects.json`** — Wave 1 placeholder with `axelw.github.io` seed entry so builds never hard-fail
3. **`src/lib/projects.ts`** — Server-only fetcher: `import 'server-only'` guard, Link-header pagination (MAX_PAGES=5), `isHttpUrl()` URL protocol allowlist, try/catch returning JSON fallback, single `::warning::` prefixed `console.warn` using `error.name` only
4. **`src/components/projects/ProjectCard.tsx`** — Presentational server component: repo name, optional language·pushedAt meta with `<time>` element, optional trimmed description, Repo link, conditional Live demo link — all with `focus-visible:` from day one
5. **`src/components/projects/Projects.tsx`** — Async server component: calls `fetchProjects()`, renders eyebrow "Projects" + visible h2 "Selected work on GitHub" + responsive `grid-cols-1 sm:grid-cols-2` card grid
6. **`src/components/ui/FadeUp.tsx`** — Added `data-fadein` attribute to wrapper div (REVIEW C-1)
7. **`src/app/page.tsx`** — `<FadeUp><Projects /></FadeUp>` inserted between CV and Contact

## Tasks

| Task | Name | Commit |
|------|------|--------|
| 1 | Project type, fetcher, JSON, FadeUp data-fadein | f7fa83f |
| 2 | ProjectCard and Projects server components | 76aa430 |
| 3 | Wire Projects into page.tsx, build verification | 0af72a8 |

## Deviations from Plan

None — plan executed exactly as written. All REVIEW findings (C-1, C-2, C-3, H-4, H-5, H-6, H-7, H-8, M-13, L-14, L-16) addressed inline per plan revision 2.

## Security Verification

- **REVIEW C-2 (HARD GATE):** `grep -rE "GITHUB_TOKEN|Bearer " out/_next/static/` returned zero matches
- **out/index.html:** zero occurrences of `GITHUB_TOKEN` or `Bearer ` (defense in depth)
- **REVIEW C-3:** `isHttpUrl()` uses `new URL(raw).protocol` allowlist — `javascript:`, `data:`, `file:` schemes coerced to null at fetch time
- **REVIEW H-5:** `error.name` only in `console.warn` — confirmed by `grep -E "console\.[a-z]+\([^)]*\.message"` returning zero

## Build Verification

- `npm run build` exits 0 (confirmed — uses JSON fallback path, no live GitHub API required)
- `out/index.html` contains `id="projects"`, `"Selected work on GitHub"`, and `href="https://github.com/axelw/axelw.github.io"`
- `npx tsc --noEmit` exits 0

## Known Stubs

- `src/data/projects.json` contains one placeholder entry (axelw.github.io with `pushedAt: "2026-06-02T00:00:00Z"` and `homepage: null`). Plan 02 enriches with 4–7 real recent repos and adds a forced-401 fallback verification test.
- `ProjectCard` renders `pushedAt.slice(0, 10)` as raw YYYY-MM-DD text. Plan 03 adds `formatRelativeDate()` utility to convert to "3 months ago" format.
- No hover card border transition or empty state in this plan — Plan 03 adds those.

## Threat Flags

No new threat surface beyond what was in the plan's threat model. All mitigations implemented as specified.

## Self-Check: PASSED

- [x] `src/data/projects.ts` exists with `export interface Project`
- [x] `src/data/projects.json` exists with valid JSON
- [x] `src/lib/projects.ts` exists with `import 'server-only'` as first line
- [x] `src/components/projects/ProjectCard.tsx` exists
- [x] `src/components/projects/Projects.tsx` exists
- [x] `src/components/ui/FadeUp.tsx` contains `data-fadein`
- [x] `src/app/page.tsx` imports and renders Projects between CV and Contact
- [x] Commits f7fa83f, 76aa430, 0af72a8 all present in git log
