---
phase: 04-deploy
plan: 02
subsystem: infra
tags: [github-actions, cron, schedule, workflow-dispatch, deploy]

requires:
  - phase: 04-deploy
    provides: ".github/workflows/deploy.yml — push-to-main two-job Pages pipeline (build → deploy)"
provides:
  - "Daily 06:00 UTC cron rebuild that re-fetches GitHub API and republishes the static site without human action"
  - "Manual 'Run workflow' button (workflow_dispatch) in the GitHub Actions UI for on-demand redeploys"
  - "Single on:-block now drives three triggers (push, schedule, workflow_dispatch) feeding the same build+deploy jobs"
affects: [04-deploy plan 03 (.next/cache), all future scheduled and manual production deploys]

tech-stack:
  added: []
  patterns:
    - "Multi-trigger workflow (push + schedule + workflow_dispatch) sharing one set of jobs — no per-trigger duplication"
    - "Quoted POSIX-cron string in YAML ('0 6 * * *') — required because unquoted '*' is a YAML alias sigil"
    - "Bare workflow_dispatch (no inputs:) — adds 'Run workflow' button without parameters; locked to default branch by GitHub Actions semantics"

key-files:
  created: []
  modified:
    - .github/workflows/deploy.yml

key-decisions:
  - "Cron at 06:00 UTC daily — outside top-of-hour congestion window that GitHub Actions docs warn about (00:00 UTC), and after typical European morning so a manual rerun is feasible if the scheduled run regresses"
  - "Bare workflow_dispatch (no inputs:) — keeps the 'Run workflow' button to a single click; GitHub semantics restrict workflow_dispatch without explicit branch input to the default branch (main), eliminating T-04-08 elevation-of-privilege risk by construction"
  - "Single on: block reused by all three triggers — no copy-paste of jobs, ensures cron and manual runs publish identical artifacts to push runs"
  - "Plan 01's flow-style branches: [main] preserved verbatim — the schedule and workflow_dispatch keys were added as siblings without touching the push trigger"

patterns-established:
  - "Sibling-trigger expansion: when adding triggers to an existing workflow, append under on: rather than restructuring; keeps the diff minimal and the regression surface small"
  - "Cron quoting hygiene: every cron expression in this repo's workflows is single-quoted ('0 6 * * *') so the YAML parser treats it as a scalar string, not an alias"

requirements-completed: [INFRA-07]

duration: ~2 min
completed: 2026-06-03
---

# Phase 04 Plan 02: Daily Cron + workflow_dispatch Triggers Summary

**Extended the Plan 01 deploy workflow with a daily 06:00 UTC cron and a manual workflow_dispatch button — same build+deploy jobs, three trigger sources, zero duplication.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-03T09:46:00Z (approx)
- **Completed:** 2026-06-03T09:47:36Z
- **Tasks:** 1 of 2 complete (Task 2 is a `checkpoint:human-verify` gate — see "Pending Checkpoint" below)
- **Files created:** 0
- **Files modified:** 1

## Accomplishments

- `.github/workflows/deploy.yml` `on:` block extended from one trigger to three: `push: branches: [main]`, `schedule: - cron: '0 6 * * *'`, `workflow_dispatch:`
- Cron syntactic validity verified mechanically by Task 1's automated regex check (5 whitespace-separated fields, each matching `[0-9*/,\-]+`)
- Plan 01's `permissions:`, `concurrency:`, and `jobs:` blocks left byte-equal — the diff against Plan 01 contains exclusively the three added lines (`schedule:`, `- cron: '0 6 * * *'`, `workflow_dispatch:`)
- Build step still passes `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` so cron and manual runs use the authenticated 1,000 req/hr GitHub API rate limit when re-fetching projects (regression-checked in Task 1's verify)
- All five CLAUDE.md-mandated action versions (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v5`) preserved verbatim

## Task Commits

Each task was committed atomically:

1. **Task 1: Add daily cron + workflow_dispatch triggers to deploy.yml** — `c2b6e16` (feat)

**Plan metadata:** committed alongside SUMMARY.md (this commit)

## Files Created/Modified

- `.github/workflows/deploy.yml` — `on:` block now triggers on push to main (unchanged from Plan 01), daily cron at 06:00 UTC, and manual workflow_dispatch from the Actions UI. Three-line addition; rest of the file untouched.

## Final `on:` Block (post-Plan 02)

```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'
  workflow_dispatch:
```

## Diff vs Plan 01

```diff
@@ -3,6 +3,9 @@ name: Deploy to GitHub Pages
 on:
   push:
     branches: [main]
+  schedule:
+    - cron: '0 6 * * *'
+  workflow_dispatch:

 permissions:
   contents: read
```

Three insertions, zero deletions, zero modifications outside the `on:` block.

## Decisions Made

- **06:00 UTC daily cron** — outside the top-of-hour congestion window the GitHub Actions schedule docs explicitly warn about (`0 * * * *` types). A 24h staleness window for the projects list is the explicit T-04-07 disposition (accept).
- **Bare `workflow_dispatch:` (no `inputs:`)** — covers the user need ("button to redeploy now") with one click and one default branch. GitHub Actions only allows `workflow_dispatch` to run from non-default branches when explicit `inputs:` are declared; declining to declare them locks the manual trigger to main, which is exactly the threat-model disposition for T-04-08 (accept by construction).
- **Single `on:` block, no job duplication** — the three triggers all feed the same build+deploy jobs. This guarantees cron-built and manually-built artifacts are byte-identical to push-built artifacts.

## Cron Syntactic Validation

Task 1's `<verify>` step ran a JS check that:
1. Confirmed `'0 6 * * *'` matches the cron literal regex.
2. Split the expression on whitespace — got exactly 5 fields.
3. Tested each field against `[0-9*/,\-]+` — all five pass.

Result: `All required patterns present; cron expression is syntactically valid`.

GitHub's scheduler firing the cron at the right wall-clock time is a next-day observation (see "Pending Checkpoint"), but the YAML / cron string itself is verified-good in this plan.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

The plan's inline `<verify>` command (a one-line `node -e "..."` invocation) tripped over zsh's interpretation of `$` in the `GITHUB_TOKEN` regex literal — the shell expanded the unescaped `${...}` portion before Node ever saw it, producing a spurious "Missing patterns" error. Re-ran the same logic from a `/tmp/verify-04-02.js` file (no shell expansion) and it returned `All required patterns present; cron expression is syntactically valid`. No defect in the workflow file; this was purely a shell-quoting artifact of the inline form.

## Pending Checkpoint

**Task 2: Verify workflow_dispatch button works AND cron syntax validates (`type="checkpoint:human-verify"` gate="blocking")**

The cron syntax has already been mechanically verified in Task 1's auto-verify (passed). The remaining human-verify steps are:

1. The Plan 01 → main merge, **plus** Plan 04-01's still-pending one-time GitHub Pages enablement (Source: GitHub Actions in repo settings) — both are prerequisites that live outside this plan.
2. Open https://github.com/axelwaserman/axelwaserman.github.io/actions/workflows/deploy.yml and confirm the **"Run workflow"** dropdown is visible in the upper-right (proves `workflow_dispatch:` parsed).
3. Click "Run workflow" → "Run workflow" (default branch). Confirm the run starts and completes green.
4. Confirm https://axelwaserman.github.io/ still serves after the manual run.
5. (Next-day, non-blocking observation) confirm a `scheduled`-trigger run appears at ~06:00 UTC the morning after the workflow lands on main.

The orchestrator must surface this checkpoint to the human after the wave merges. Cron syntax validity (the gated half of this checkpoint) is already satisfied.

## User Setup Required

None *new* in this plan — Plan 01's pending one-time Pages-source enablement still applies, and the workflow_dispatch button only becomes visible once the workflow lands on the default branch via the orchestrator's PR merge.

## Next Phase Readiness

- Plan 04-02 file artifact complete and committed (`c2b6e16`).
- Plan 04-03 (`actions/cache@v4` for `.next/cache`) can slot a step between `actions/setup-node@v4` and `npm ci` without disturbing the multi-trigger `on:` block established here — caching is orthogonal to trigger source.
- Phase 4 Success Criterion #2 (daily cron + workflow_dispatch fallback rebuild and redeploy automatically) is **mechanically delivered** by this plan's file change; functional confirmation is the Task 2 human-verify checkpoint that runs after the wave merges to main.

## Threat Surface Notes

No new trust boundaries crossed. The plan's threat register dispositions all hold:
- **T-04-06 (DoS — cron racing push)**: Plan 01's `concurrency: group: pages, cancel-in-progress: false` (unchanged) serializes overlapping runs.
- **T-04-07 (Tampering — cron drift)**: accepted; worst case is one stale-by-24h projects list.
- **T-04-08 (EoP — workflow_dispatch backdoor)**: accepted by construction; bare workflow_dispatch (no `inputs:`) restricts the manual trigger to the default branch.
- **T-04-SC (Tampering — supply chain)**: no new packages, no new actions; carries forward Plan 01's mitigation.

No threat flags introduced.

## Self-Check: PASSED

- File `.github/workflows/deploy.yml` exists on disk with all three triggers: **FOUND**
- Commit `c2b6e16` exists in `git log`: **FOUND**
- Plan-level `<verify>` (cron + 10 regex pattern checks): **PASS** (`All required patterns present; cron expression is syntactically valid`)
- Acceptance-criteria diff guard `git diff .github/workflows/deploy.yml | grep -E '^[+-]' | grep -vE '^(---|\+\+\+|@@|[+-]\s*(schedule|workflow_dispatch|- cron|push:|branches:|on:))'`: **PASS** (empty output — only `on:`-block lines changed)
- `git status --porcelain .github/`: **PASS** (only the modified workflow file; no new files)
- Plan 01 `push: branches: [main]` regression: **PASS** (loose regex `/on:[\s\S]*?push:[\s\S]*?branches:\s*(\[main\]|-\s*main)/m` still matches)
- Plan 01 `permissions:` (`contents: read`, `pages: write`, `id-token: write`): **PASS** (unchanged)
- Plan 01 `concurrency:` (`group: pages`, `cancel-in-progress: false`): **PASS** (unchanged)
- Plan 01 action-version pins (`@v4`, `@v5`, `@v3`): **PASS** (unchanged)
- `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` literal still present on build step: **PASS**

---
*Phase: 04-deploy*
*Plan: 02*
*Completed: 2026-06-03*
