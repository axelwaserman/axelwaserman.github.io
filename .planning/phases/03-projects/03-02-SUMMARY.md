---
phase: 03-projects
plan: 02
subsystem: projects
tags: [fallback-data, security, build-verification, github-api]
dependency_graph:
  requires:
    - 03-01 (Project type, fetchProjects fetcher, JSON fallback wire-up, try/catch path)
  provides:
    - src/data/projects.json (enriched with 5 real entries — usable fallback grid density)
  affects: []
tech_stack:
  added: []
  patterns:
    - Forced-401 build test with GITHUB_TOKEN placeholder to verify catch-path fires
    - H-5 defense-in-depth: grep-assert no Bearer/Authorization in build log
    - Shape-parity enforcement: JSON entries validated against Project interface contract
key_files:
  created: []
  modified:
    - src/data/projects.json
decisions:
  - "axelw GitHub account has exactly 4 public non-archived non-fork repos at execution time; all 4 included plus existing axelw.github.io placeholder — 5 total"
  - "axelw.github.io homepage updated to https://axelw.github.io (live at execution time)"
  - "gun repo homepage field was empty string in API — coerced to null in JSON per isHttpUrl contract parity"
  - "Task 2 is verification-only — no files modified; no separate commit required for the verification step"
metrics:
  duration: "~5 minutes"
  completed: "2026-06-02"
  tasks_completed: 2
  files_changed: 1
---

# Phase 03 Plan 02: Fallback Data Enrichment + Forced-Fallback Verification Summary

Enriched src/data/projects.json from 1 placeholder to 5 real entries (all non-archived non-fork public repos under axelw), and automatically verified the Wave-1 catch path fires under a forced-401 with no Bearer/Authorization header data in the build log (REVIEW H-5 defense in depth).

## What Was Built

1. **`src/data/projects.json` (enriched)** — grew from 1 entry to 5 entries:
   - `axelw.github.io` — updated homepage to `https://axelw.github.io` (live URL)
   - `node-sublime-build` — Shell, no description, pushed 2014-09-15
   - `gun` — Shell, "Show files not committed to git", pushed 2014-08-31
   - `project-template` — JavaScript, Node/Express/MySQL/Backbone stack, pushed 2013-07-24
   - `project-template-support` — JavaScript, project-template tooling, pushed 2013-07-24
   - Sorted newest-first by pushedAt; all 6 fields present; nullable pushedAt and http(s)-only homepage shape parity confirmed

2. **Automated verification (Task 2 — no file changes):**
   - `npx tsc --noEmit` — exits 0 (type check passes after JSON enrichment)
   - Success-path `npm run build` — exits 0; build log does NOT contain "GitHub fetch failed"
   - Forced-fallback `GITHUB_TOKEN=ghp_invalidtoken_... npm run build` — exits 0; catch fires and emits `::warning::[projects] GitHub fetch failed, using src/data/projects.json fallback. Reason: Error`
   - REVIEW H-5: build log contains NEITHER `Bearer ` NOR `Authorization`
   - REVIEW H-6: build log contains `::warning::` prefix
   - REVIEW C-2: `grep -rE "GITHUB_TOKEN|Bearer " out/_next/static/` returns 0 matches

## Tasks

| Task | Name | Commit |
|------|------|--------|
| 1 | Enrich src/data/projects.json with 4–7 real recent repos | bc9963a |
| 2 | Verify forced-fallback path with H-5 defense-in-depth assertions | (verification-only, no commit) |

## Deviations from Plan

### Auto-fixed Issues

None.

### Scope Adjustments

**1. [Note] GitHub username axelw has exactly 4 public repos (not 4–7)**
- **Found during:** Task 1 bootstrap curl
- **Impact:** Plan said "pick 3–6 additional repos". axelw has exactly 4 total public non-archived non-fork repos. Combined with the existing axelw.github.io placeholder = 5 entries total, which satisfies the ≥4 acceptance criterion.
- **Action:** Included all 4 real repos. No fabricated entries.

**2. [Note] axelw.github.io is a private/non-public repo — not returned by the repos API**
- **Found during:** Verification curl for `api.github.com/repos/axelw/axelw.github.io` returned 404
- **Impact:** The site repo is not visible in the public repos list (likely private or named differently). The Wave 1 placeholder entry for it was kept with the live homepage URL since the site is deployed at `https://axelw.github.io`.
- **Action:** Kept as placeholder entry; homepage updated from `null` to `https://axelw.github.io`.

## Security Verification

- **REVIEW H-5 (defense in depth):** `/tmp/build-fallback.log` contains zero occurrences of `Bearer ` — confirmed via Node assertion
- **REVIEW H-5 (defense in depth):** `/tmp/build-fallback.log` contains zero occurrences of `Authorization` — confirmed via Node assertion
- **REVIEW H-6:** `::warning::` prefix present in build log — surfaces in GitHub Actions job summary UI
- **REVIEW C-2 (re-verified):** `grep -rE "GITHUB_TOKEN|Bearer " out/_next/static/` returns 0 matches — server-only boundary holds after new builds
- **REVIEW C-3 shape parity:** JSON validation script confirms all non-null homepage values start with `https://` — zero violations

## Build Verification

- `npx tsc --noEmit` exits 0 (TypeScript clean after JSON enrichment)
- `npm run build` (success path) exits 0; log clean — no fallback warn
- `GITHUB_TOKEN=ghp_invalidtoken_force_401_for_fallback_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx npm run build` (forced-fallback path) exits 0; log contains expected warn with `::warning::` prefix, no header data
- `out/index.html` contains all 5 `href="https://github.com/axelw/..."` values (confirmed by grep)

## Known Stubs

- `src/data/projects.json` entries for `node-sublime-build`, `gun`, `project-template`, and `project-template-support` are real repos but older (2013–2014). They will be superseded at build time by the live GitHub API fetch whenever a valid `GITHUB_TOKEN` is available. The fallback is now visually dense (5 entries) rather than the single-entry Wave 1 placeholder.
- `ProjectCard` still renders `pushedAt.slice(0, 10)` as raw YYYY-MM-DD text. Plan 03 adds `formatRelativeDate()` to display "X years ago" format.

## Threat Flags

No new threat surface introduced. Wave 2 only modifies committed JSON data (T-03-05: same git-review mitigation applies) and adds automated verification. The C-2 boundary confirmed again post-build.

## Self-Check: PASSED

- [x] `src/data/projects.json` contains 5 entries (≥4 required)
- [x] All 5 entries validated by the plan's Node verification script: exits 0 with "OK 5 entries"
- [x] Commit bc9963a present in git log
- [x] `npx tsc --noEmit` exits 0
- [x] Success-path build log clean (no "GitHub fetch failed")
- [x] Forced-fallback build exits 0 and log contains "GitHub fetch failed" with `::warning::` prefix
- [x] No `Bearer ` or `Authorization` in forced-fallback build log
- [x] `out/_next/static/` contains zero `GITHUB_TOKEN` or `Bearer ` occurrences
- [x] `out/index.html` contains 5 `href="https://github.com/axelw/..."` values
