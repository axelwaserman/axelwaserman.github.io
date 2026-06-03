---
phase: 04-deploy
verified: 2026-06-03T00:00:00Z
status: human_needed
score: 8/11 must-haves verified mechanically; 3 require live-site human verification
overrides_applied: 0
human_verification:
  - test: "Pushing to main triggers a GitHub Actions build and the live site updates within minutes"
    expected: "After this branch merges to main and Pages is enabled (Source: GitHub Actions), the next push triggers a green workflow run at https://github.com/axelwaserman/axelwaserman.github.io/actions and https://axelwaserman.github.io/ serves the deployed site within ~3 minutes."
    why_human: "Verifying a real deploy requires the PR to be merged to main, GitHub Pages to be enabled (one-time UI step in repo Settings — no gh CLI command), and observing the live URL respond. None of this is reachable from the local working tree."
  - test: "Daily cron actually fires and produces a redeploy"
    expected: "The morning after the workflow lands on main (06:00 UTC), https://github.com/axelwaserman/axelwaserman.github.io/actions shows a workflow run with trigger source 'scheduled'. Cron syntactic validity is already verified mechanically (5 fields, '0 6 * * *' parses); only the next-day firing observation requires a human."
    why_human: "GitHub Actions schedule firing is a wall-clock event that occurs once the workflow is on the default branch. Cannot be verified by reading the YAML — only by waiting for the scheduler."
  - test: "workflow_dispatch button is visible and a manual run completes green"
    expected: "After merge, https://github.com/axelwaserman/axelwaserman.github.io/actions/workflows/deploy.yml shows the 'Run workflow' dropdown in the upper-right. Clicking it (default branch) triggers a run that completes green and the live site at https://axelwaserman.github.io/ continues to respond."
    why_human: "The 'Run workflow' button only appears in the GitHub Actions UI after the workflow lands on the default branch. Requires browser navigation to verify."
  - test: "configure-pages@v5 emits no basePath; assets resolve at / on the live site"
    expected: "Browser DevTools on a hard reload of https://axelwaserman.github.io/ shows zero console 404s. Asset URLs are prefixed with / (e.g. /_next/static/...), NOT /website/_next/... — confirming this is treated as a USER-PAGE repo with no basePath."
    why_human: "Mechanical check confirms `actions/configure-pages@v5` is present and next.config.ts has no basePath/assetPrefix. Final confirmation that the resolved publish path is '/' requires loading the deployed site in a browser."
---

# Phase 04: Deploy — Verification Report

**Phase Goal:** The site is live at axelw.github.io, auto-deploys on every push to main, and rebuilds daily to keep GitHub project data fresh
**Verified:** 2026-06-03
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                         | Status                | Evidence                                                                                                         |
| --- | --------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | Workflow file exists with the correct two-job (build → deploy) Pages pipeline                 | VERIFIED              | `.github/workflows/deploy.yml` parses; `jobs: [build, deploy]`; deploy declares `needs: build`                   |
| 2   | Pushing to main triggers a workflow run                                                        | VERIFIED (file)       | `on.push.branches: [main]` present; YAML parses cleanly                                                          |
| 3   | The live site at axelw.github.io updates within minutes after a push                          | UNCERTAIN (human)     | Requires PR merge + Pages enablement (UI-only step). Mechanical: workflow is wired correctly                      |
| 4   | Daily cron rebuilds the site without human action                                             | VERIFIED (file)       | `on.schedule: - cron: '0 6 * * *'` — 5-field POSIX cron, syntactically valid                                     |
| 5   | workflow_dispatch fallback present (manual "Run workflow" button)                             | VERIFIED (file)       | `on.workflow_dispatch:` present (bare, no inputs — locks manual runs to default branch)                          |
| 6   | All three triggers reuse the same build+deploy jobs (no duplication)                          | VERIFIED              | Single `jobs:` block; both `build` and `deploy` consumed by all three triggers                                    |
| 7   | Workflow uses `actions/configure-pages@v5` so no manual basePath is needed                    | VERIFIED              | `actions/configure-pages@v5` present in build job; `next.config.ts` contains no `basePath` or `assetPrefix`       |
| 8   | GITHUB_TOKEN flows from the workflow into the build step (1,000 req/hr authenticated rate)   | VERIFIED              | `env: GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` on the build step; `src/lib/projects.ts:50-51` reads it          |
| 9   | Workflow-level least-privilege permissions (`contents:read`, `pages:write`, `id-token:write`) | VERIFIED              | `permissions: {contents: read, pages: write, id-token: write}` (parsed from YAML)                                 |
| 10  | Concurrency group `pages` with `cancel-in-progress: false`                                    | VERIFIED              | `concurrency: {group: pages, cancel-in-progress: false}` (parsed from YAML)                                       |
| 11  | actions/cache@v4 step caches `.next/cache` with scoped hashFiles globs                        | VERIFIED              | Cache step at index 4 between `npm ci` (3) and `npm run build` (5); `path: .next/cache`; key uses scoped globs    |

**Score:** 8/11 truths verified by mechanical inspection of the codebase. 3 truths require human verification of a live deploy that cannot exist until the PR merges and GitHub Pages is enabled (a one-time UI-only step the user must perform in repo Settings).

### Required Artifacts

| Artifact                            | Expected                                                       | Status   | Details                                                                                                                  |
| ----------------------------------- | -------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `.github/workflows/deploy.yml`      | Pages-enabled deploy workflow (push, schedule, workflow_dispatch triggers; build → deploy jobs) | VERIFIED | 67 lines, parses as valid YAML, contains all three triggers and both jobs                                                |
| `next.config.ts` (unmodified)       | No basePath / assetPrefix added (user-page repo)               | VERIFIED | `grep -E "basePath|assetPrefix" next.config.ts` returns empty                                                            |
| `src/lib/projects.ts` (consumer)    | Reads `process.env.GITHUB_TOKEN` for authenticated rate limit | VERIFIED | Lines 50-51 read the env var; deploy.yml passes the token via step-level env on the build step                            |

### Key Link Verification

| From                                              | To                                                       | Via                                                              | Status   | Details                                                                                              |
| ------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy.yml` (build job)        | `.github/workflows/deploy.yml` (deploy job)              | `actions/upload-pages-artifact@v3` → `actions/deploy-pages@v5`   | VERIFIED | Build uploads `./out` artifact; deploy job has `needs: build` and runs `actions/deploy-pages@v5`     |
| `.github/workflows/deploy.yml` (build step)       | `src/lib/projects.ts`                                    | `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` env var              | VERIFIED | Workflow passes the token; projects.ts:50-51 reads `process.env.GITHUB_TOKEN`                        |
| Schedule trigger                                  | Same build+deploy jobs                                   | Shared `on:` block — single jobs definition                      | VERIFIED | Cron and workflow_dispatch reuse the same `build` + `deploy` jobs; no duplication                    |
| `actions/cache@v4` step                           | `.next/cache` directory on runner                        | `path: .next/cache`                                              | VERIFIED | Step ordered: `npm ci` (line 36) → cache (line 39) → `npm run build` (line 47) — restoration before build |

### Data-Flow Trace (Level 4)

Not applicable — this phase ships a CI/CD configuration file. There is no rendered UI or dynamic data variable to trace. The "data" in this phase is the workflow's wiring of the build→deploy pipeline, which is already verified at Levels 1-3.

### Behavioral Spot-Checks

| Behavior                                                         | Command                                                                          | Result                                                                                  | Status |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------ |
| YAML parses cleanly                                              | `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"` | Parses — top-level keys: name, on, permissions, concurrency, jobs                       | PASS   |
| Cron expression has exactly 5 whitespace-separated fields        | Split `'0 6 * * *'` on whitespace                                                | 5 fields: `["0","6","*","*","*"]`                                                       | PASS   |
| Build steps ordered correctly (npm ci → cache → npm run build)   | Line-index check                                                                 | npm ci=line 36, cache=line 39, npm run build=line 47 — strictly increasing              | PASS   |
| All 24 mechanical workflow patterns present                      | `node -e` regex sweep over deploy.yml                                            | 24/24 PASS (triggers, action versions, env, permissions, concurrency, deploy wiring)    | PASS   |
| Anti-pattern absent (`hashFiles('**/package-lock.json')`)         | `grep` for unscoped lockfile glob                                                | Not present — only the scoped form `hashFiles('package-lock.json')` is used             | PASS   |
| Plan-referenced commits exist                                    | `git show --no-patch 43551ae c2b6e16 36dbced`                                    | All three commits resolve with the expected `feat(04-0X)` subjects                      | PASS   |
| Live URL responds with HTTP 2xx                                  | `curl -sI https://axelwaserman.github.io/`                                       | SKIPPED — branch not yet merged; Pages not yet enabled                                  | SKIP   |

### Probe Execution

No probes are declared in any of the three phase plans (`scripts/*/tests/probe-*.sh` does not exist in this repo for this phase). Skipped.

### Requirements Coverage

| Requirement | Source Plan       | Description                                                                              | Status                       | Evidence                                                                                                                   |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| INFRA-07    | 04-01, 04-02, 04-03 | GitHub Actions workflow with daily cron trigger: rebuilds and deploys to axelw.github.io | SATISFIED (mechanically) — pending live confirmation | `.github/workflows/deploy.yml` ships push + daily cron + workflow_dispatch triggers; live confirmation in `human_verification` |

REQUIREMENTS.md maps INFRA-07 → Phase 4. No orphaned requirement IDs detected. All plans (04-01, 04-02, 04-03) declare `requirements: [INFRA-07]` in frontmatter — consistent and accounted for.

Note on REQUIREMENTS.md status: INFRA-07 is still listed as `Pending` and the unchecked `[ ]` checkbox remains in the v1 Requirements list. The actual hostname in REQUIREMENTS.md and ROADMAP.md is `axelw.github.io` (placeholder); the real repo is `axelwaserman/axelwaserman.github.io`. The deploy workflow targets the actual repo correctly. Updating the REQUIREMENTS.md status box to checked and reconciling the placeholder hostname is recommended once the live site is confirmed up — this is a documentation-bookkeeping follow-up, not a goal-blocker for Phase 4.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |

None. Scan of `.github/workflows/deploy.yml` for `TODO|TBD|FIXME|XXX|HACK|PLACEHOLDER` returned zero matches. The workflow file is clean.

### Human Verification Required

The mechanical surface (workflow file shape, action versions, triggers, cron syntax, permissions, concurrency, env wiring, cache step ordering) is fully verified. The remaining items are inherently observable only on a live deploy and require:

1. Merging this branch to `main` (the orchestrator's PR step).
2. The user performing the one-time GitHub Pages enablement in repo Settings (Source: GitHub Actions) — this is a UI-only step with no `gh` CLI equivalent for first-time enablement, surfaced as a `checkpoint:human-action` in Plan 04-01 Task 2.
3. Observing the actual deploy outcomes per the four `human_verification` items above.

### 1. Push-to-main triggers a deploy and the live site updates within minutes

**Test:** Merge `phase-04-deploy` to `main` via PR. Enable GitHub Pages with Source: GitHub Actions at https://github.com/axelwaserman/axelwaserman.github.io/settings/pages. Push any small commit to `main`.
**Expected:** A green workflow run at https://github.com/axelwaserman/axelwaserman.github.io/actions completes both `build` and `deploy` jobs within ~3 minutes; https://axelwaserman.github.io/ responds HTTP 200 and renders the homepage.
**Why human:** Cannot be verified mechanically — requires PR merge and a one-time UI enablement of GitHub Pages.

### 2. Daily cron actually fires (next-day observation)

**Test:** The morning after the workflow lands on `main`, navigate to https://github.com/axelwaserman/axelwaserman.github.io/actions and filter by trigger source.
**Expected:** A run with trigger source `scheduled` is present at ~06:00 UTC.
**Why human:** Wall-clock event; cannot be observed without waiting for the GitHub Actions scheduler.

### 3. workflow_dispatch button is visible and runs green

**Test:** After merge, open https://github.com/axelwaserman/axelwaserman.github.io/actions/workflows/deploy.yml. Click "Run workflow" → "Run workflow" (default branch).
**Expected:** Dropdown is visible in the upper-right; manual run starts and completes green; live site continues to serve.
**Why human:** UI element only renders once the workflow is on the default branch.

### 4. configure-pages@v5 emits no basePath; assets load with status 200

**Test:** Hard-reload https://axelwaserman.github.io/ with browser DevTools open (Network tab).
**Expected:** Zero 404s. Asset request paths are `/_next/static/...` (NOT `/website/_next/...`).
**Why human:** Confirms `actions/configure-pages@v5` correctly detected the user-page topology at build time and emitted no basePath. Mechanical verification confirmed the action is invoked and `next.config.ts` is clean; runtime confirmation needs a real deploy to inspect.

### Gaps Summary

There are no mechanical gaps. The workflow file is correctly shaped: all three triggers present (push, daily cron at 06:00 UTC, manual workflow_dispatch), all five CLAUDE.md-mandated action versions pinned (`@v4`, `@v5`, `@v3`), least-privilege permissions block, concurrency group, GITHUB_TOKEN env wiring with a real consumer in `src/lib/projects.ts:50-51`, and the `.next/cache` step correctly ordered between `npm ci` and `npm run build` with scoped hashFiles globs that explicitly avoid the `**/package-lock.json` over-invalidation anti-pattern.

The only blockers to declaring full goal achievement are external to the codebase: the branch must be merged to `main`, GitHub Pages must be enabled in repo Settings (a one-time UI step Plan 04-01 explicitly surfaces as a `checkpoint:human-action`), and the four live-deploy items above must be observed. None of these can be verified from the local working tree, which is why the status is `human_needed` and not `passed`.

Once the human items resolve green, INFRA-07 in REQUIREMENTS.md should be flipped from `[ ] Pending` to `[x] Complete`. The placeholder hostname `axelw.github.io` in REQUIREMENTS.md and ROADMAP.md vs the real `axelwaserman.github.io` is a separate documentation-bookkeeping follow-up.

---

_Verified: 2026-06-03_
_Verifier: Claude (gsd-verifier)_
