---
phase: 05-polish
plan: 08
subsystem: infra
tags: [github-api, fallback, projects, gh-cli, jq, deploy-verification]

# Dependency graph
requires:
  - phase: 05-polish
    provides: src/lib/projects.ts default GITHUB_USERNAME = axelwaserman (Plan 05-01); the Project[] interface in src/data/projects.ts (unchanged); the Phase 4 deploy workflow (refreshes projects.json's downstream consumer on every cron rebuild)
provides:
  - Refreshed src/data/projects.json — 4 live axelwaserman public non-archived non-fork repos (axelwaserman.github.io, work_assistant, trip_planner, iceberg_sandbox), replacing the 5 stale axelw/* placeholders (axelw.github.io, node-sublime-build, gun, project-template, project-template-support)
  - D-24 implementation: future API-outage builds will render real (slightly stale) Axel data instead of the axelw placeholders
  - Repository state ready for Task 2 (live deploy verification) — the orchestrator owns Task 2 after the merge / push triggers the deploy workflow on github.com/axelwaserman/axelwaserman.github.io
affects:
  - "Task 2 (this plan, PENDING — owned by orchestrator): live deploy verification of Phase 5 SC-1..SC-4 + D-17 visibility on https://axelwaserman.github.io/"
  - "Phase 6 (deferred): contact form + JSON-LD Person markup will continue to depend on src/data/projects.json as the build-time fallback"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fallback-refresh via gh REST API + jq projection: when src/lib/projects.ts has `import 'server-only'` and cannot be invoked from a one-shot Node script, refresh src/data/projects.json by calling the same /users/{user}/repos endpoint via `gh api` and projecting to the Project shape with jq's filter+select+object-construction. The jq filter mirrors the in-source filter (archived=false AND fork=false AND disabled=false) and the projection mirrors the in-source field rename map (pushed_at -> pushedAt, html_url -> repoUrl, '' homepage -> null)."

key-files:
  created: []
  modified:
    - src/data/projects.json

key-decisions:
  - "Approach B (gh REST API + jq) was the only viable path. The plan explicitly documented why Approach A (re-running fetchProjects via tsx) fails: src/lib/projects.ts:1 has `import 'server-only'` which throws at any non-server import site. No deviation from the plan was needed — the plan body already locked in Approach B."
  - "Did NOT introduce scripts/refresh-fallback.ts. The plan's <action> says: 'Do NOT create scripts/refresh-fallback.ts (that script is not needed under Approach B).' The one-time gh+jq invocation is captured here in the SUMMARY for future reference; we don't ship it as code."
  - "Trailing newline preserved (matches the existing file's style; jq emits trailing newline by default when piped through stdout redirection — verified with `od -c`)."
  - "Filter rejected 2 of the 6 raw entries (CS-tech-test and velib are forks); the live `gh repo list axelwaserman --visibility public --no-archived --source` returns the same 4 names that landed in projects.json, satisfying the plan's cross-check acceptance criterion."

patterns-established:
  - "When refreshing a server-only-fetched JSON snapshot, mirror both the filter logic AND the field projection of the runtime fetcher exactly. Drift between projects.json and projects.ts means a real API outage would surface a different shape than a successful build, breaking the static-export guarantee."

requirements-completed: []

# Metrics
duration: ~10min
completed: 2026-06-04
---

# Phase 5 Plan 08 Task 1: Refresh src/data/projects.json from live GitHub REST API (D-24) Summary

**Replaced the 5 stale axelw/* placeholder repos in src/data/projects.json with the 4 live axelwaserman public non-archived non-fork repos via `gh api /users/axelwaserman/repos` + jq projection — closing D-24 and arming the build-time fallback path with real (slightly stale) Axel data for any future API-outage rebuild.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-04T16:16:00Z (worktree spawn + base alignment)
- **Completed:** 2026-06-04T16:26:12Z (Task 1 commit + verification)
- **Tasks:** 1 of 2 (Task 2 PENDING — orchestrator-owned post-deploy human-verify)
- **Files modified:** 1

## Accomplishments

- Fetched the live axelwaserman repo list via `gh api -H "Accept: application/vnd.github+json" "/users/axelwaserman/repos?per_page=100&type=owner&sort=pushed&direction=desc"`. Response: 6 entries (4 owned, 2 forks).
- Filtered to non-archived, non-fork, non-disabled with jq — matches the in-source filter in `src/lib/projects.ts` exactly. 4 entries survive: `axelwaserman.github.io`, `work_assistant`, `trip_planner`, `iceberg_sandbox` (sorted by pushed_at desc, descending: `2026-06-04T16:18:14Z`, `2026-06-04T10:50:26Z`, `2026-06-02T14:21:25Z`, `2025-07-07T07:30:54Z`).
- Projected to the Project[] shape required by `src/data/projects.ts`: `{ name, description, language, pushedAt, repoUrl, homepage }`. Empty homepage strings coerced to `null` to match `src/lib/projects.ts:isHttpUrl` semantics.
- All four repoUrls start with `https://github.com/axelwaserman/`. Zero stale `axelw/*` URLs remain. None of the original placeholder names (`axelw.github.io`, `node-sublime-build`, `gun`, `project-template`, `project-template-support`) survive in the file.
- `npm run build` exits 0; `out/index.html` shows the four real repo names and zero stale axelw URLs.
- `npx vitest run` 23/23 passing — no test regression.

## Task Commits

Each task was committed atomically:

1. **Task 1: Refresh src/data/projects.json with the live axelwaserman fetch via gh REST API (D-24)** — `0fd29b3` (feat)
2. **Task 2: Push, deploy, and verify all four Phase 5 Success Criteria + D-17 visibility on the live URL** — **PENDING** (gate=blocking checkpoint:human-verify owned by the orchestrator after the merge + push triggers the deploy workflow on the github.com/axelwaserman/axelwaserman.github.io repo). Resume signal: `approved` if every check passes, otherwise the orchestrator describes the failing check.

**Plan metadata commit:** `docs(05-08): complete Task 1; Task 2 awaits live deploy` (this commit, after this file).

## Files Created/Modified

- `src/data/projects.json` — Replaced the 5-entry axelw/* placeholder array with the 4-entry live axelwaserman snapshot. Same JSON shape (matches Project[]). Same 2-space indentation and trailing newline as the existing file.

## Decisions Made

- **Approach B was the only viable path.** Approach A (re-run `fetchProjects` from `src/lib/projects.ts`) is blocked by `import 'server-only'` (line 1 of that file) which throws on any non-server runtime. The plan body locked Approach B in; this implementation followed verbatim.
- **No `scripts/refresh-fallback.ts` was created.** The plan's `<action>` block explicitly forbids it. The one-time `gh api | jq` invocation is documented in this SUMMARY for future reference; we do not ship it as code (the auto-refresh-on-CI variant is explicitly deferred per CONTEXT.md D-24).
- **`/tmp/axelwaserman-repos.json` was used as the staging file** (per the plan's Step 1) and is not committed — it's a transient scratch artifact outside the repo.

## Deviations from Plan

None — Task 1 executed exactly as the plan body specified.

## Issues Encountered

- The orchestrator's prompt said the worktree base would be `31b4175d542e353cc1c53d3aec2b61e067e5a3cd`, but the worktree was actually spawned from an older commit (`79e5fa…`, the Phase 4 closing commit). HEAD at startup was an *ancestor* of the expected base, not equal to it. Resolved with a clean fast-forward (`git merge --ff-only 31b4175d542e353cc1c53d3aec2b61e067e5a3cd`) — working tree was already clean and the merge brought in the Wave-1 + Wave-2 Phase 5 commits the executor needed to see (Plans 05-01..05-07). After the fast-forward the executor proceeded normally; no plan deviation needed.
- `gh repo list axelwaserman --visibility public --no-archived --no-fork` (suggested by Task 1's acceptance criteria for the cross-check) failed with `unknown flag: --no-fork` — the gh CLI version installed locally does not support `--no-fork`. Used the equivalent `--source` flag instead (gh's documented "Show only non-forks" filter); cross-check returned the same 4 names that landed in projects.json.

## User Setup Required

None for Task 1 — no environment variables, no service configuration. `gh` CLI was already authenticated as `axelwaserman` (verified via `gh auth status`).

For Task 2 (orchestrator-owned, post-deploy), the user must wait for the GitHub Actions deploy workflow on `github.com/axelwaserman/axelwaserman.github.io` to finish before running the SC-1..SC-4 + D-17 curl checks listed in the plan body's `<how-to-verify>` block.

## Next Phase Readiness

Phase 5 is one human-verify checkpoint away from done. The repository now satisfies every truth in the plan's `must_haves` block that can be checked locally:

- `src/data/projects.json` contains only `axelwaserman/*` repos (D-24 — DONE)
- `cv.ts` already carries the resolved email `axel.waserman@gmail.com` (Plan 05-02 — done in Wave 1)
- The Hero embeds the mandala SVG (Plan 05-06 — done in Wave 2)
- The Contact section surfaces the email twice (mailto href + visible text — Plan 05-07 — done in Wave 2)
- `app/icon.tsx` ships the AW monogram favicon (Plan 05-03 — done in Wave 1)
- The CV section reflects real history with working personal links (Plan 05-02 + Plan 05-05 — done in Waves 1 & 2)

Remaining: push the worktree merge to `phase-04-deploy`, let the deploy workflow run, then the orchestrator runs the Task 2 curl + visual checks against `https://axelwaserman.github.io/`. If every check passes, `approved` closes the phase. If any check fails, the orchestrator decides whether the gap is in plans 05-01..05-07 (re-execute) or in this plan (fix here).

## Self-Check: PASSED

Verified after the Task 1 commit and before writing this SUMMARY:

- `src/data/projects.json` exists; `node -e "const j = require('./src/data/projects.json'); j.forEach(p => { if (!p.repoUrl.startsWith('https://github.com/axelwaserman/')) process.exit(1) })"` exits 0; `j.length === 4`.
- `grep -c '"axelw/' src/data/projects.json` = 0; `grep -c 'https://github.com/axelwaserman/' src/data/projects.json` = 4.
- `grep -c '"name": "axelw\.github\.io"' src/data/projects.json` = 0; `grep -c '"name": "node-sublime-build"' src/data/projects.json` = 0; `grep -c '"name": "gun"' src/data/projects.json` = 0; `grep -c '"name": "project-template"' src/data/projects.json` = 0; `grep -c '"name": "project-template-support"' src/data/projects.json` = 0.
- `npm run build` exits 0 (verified via tail of build output: `Generating static pages using 5 workers (4/4)` succeeded; `Finalizing page optimization`).
- `out/index.html` contains the 4 live repo names — `grep -oE 'github\.com/axelwaserman/[a-zA-Z0-9._-]+' out/index.html | sort -u` returns `github.com/axelwaserman/axelwaserman.github.io`, `github.com/axelwaserman/iceberg_sandbox`, `github.com/axelwaserman/trip_planner`, `github.com/axelwaserman/work_assistant`.
- `out/index.html` contains zero `github.com/axelw/` substrings.
- `npx vitest run` passes — 23 / 23 tests in 3 files.
- Commit `0fd29b3` (Task 1) present in `git log --oneline`.

---
*Phase: 05-polish*
*Completed: 2026-06-04 (Task 1 only; Task 2 awaits live deploy)*
