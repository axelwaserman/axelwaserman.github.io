---
phase: 04-deploy
plan: 01
subsystem: infra
tags: [github-actions, github-pages, ci, deploy, static-export, next-static-export]

requires:
  - phase: 03-projects
    provides: Build-time GitHub fetcher (src/lib/projects.ts) reading GITHUB_TOKEN
provides:
  - GitHub Actions workflow that builds and deploys the Next.js static export to GitHub Pages on every push to main
  - Two-job pipeline (build → deploy) using actions/upload-pages-artifact + actions/deploy-pages
  - Authenticated GitHub API rate limit (1,000 req/hr) for build-time project fetch via secrets.GITHUB_TOKEN
affects: [04-deploy plan 02 (cron + workflow_dispatch), 04-deploy plan 03 (.next/cache), all future production deploys]

tech-stack:
  added:
    - actions/checkout@v4
    - actions/setup-node@v4
    - actions/configure-pages@v5
    - actions/upload-pages-artifact@v3
    - actions/deploy-pages@v5
  patterns:
    - "Two-job Pages pipeline (build → deploy) — build assembles ./out, deploy publishes the artifact"
    - "Workflow-level permissions block scoped to least privilege (contents:read, pages:write, id-token:write)"
    - "concurrency group: pages + cancel-in-progress: false — never cancels an in-flight Pages deploy"
    - "GITHUB_TOKEN passed via step-level env: only on the build step that needs it"

key-files:
  created:
    - .github/workflows/deploy.yml
  modified: []

key-decisions:
  - "Used flow-style branches: [main] (not block-style with dash) — Plan 02 verification regex tolerates later sibling-trigger additions (schedule, workflow_dispatch)"
  - "No basePath / assetPrefix in next.config.ts — axelwaserman.github.io is a USER-PAGE repo, configure-pages@v5 detects topology and emits no basePath; assets resolve at /"
  - "Major-pinned action versions (@v4, @v5, @v3) per CLAUDE.md mandate — accepted T-04-01 (Tampering) per plan threat model: blast radius is one static-site rebuild on a personal-site Pages workflow"
  - "npm ci (not npm install) — lockfile-deterministic build matches the audit trail in package-lock.json"
  - "permissions block uses exactly the 3 keys deploy-pages@v5 needs: contents:read, pages:write, id-token:write (OIDC for the deploy step)"

patterns-established:
  - "Pages workflow shape: build job → upload-pages-artifact@v3 with path: ./out → deploy job (needs:build) → deploy-pages@v5 with environment github-pages"
  - "Build-step env mapping for build-time secrets: env: GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} — keeps the token out of the workflow scope, scoped to the one step that reads it"
  - "Concurrency group 'pages' with cancel-in-progress:false — Pages best practice; partial-deploy avoidance over speed"

requirements-completed: [INFRA-07]

duration: 6 min
completed: 2026-06-03
---

# Phase 04 Plan 01: GitHub Pages Deploy Workflow Summary

**Two-job push-to-main GitHub Actions pipeline that builds the Next.js static export and publishes it to GitHub Pages with authenticated GitHub API rate limits and least-privilege permissions.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-06-03T16:38:00Z (approx)
- **Completed:** 2026-06-03T16:44:00Z (approx)
- **Tasks:** 1 of 2 complete (Task 2 is a human-action checkpoint — see "Pending Checkpoint" below)
- **Files created:** 1
- **Files modified:** 0

## Accomplishments

- `.github/workflows/deploy.yml` created with the canonical Pages two-job pipeline (build → deploy)
- All five mandated CLAUDE.md action versions pinned verbatim: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v5`
- Workflow-level `permissions:` declaring exactly the three keys required for OIDC-based `deploy-pages@v5`: `contents: read`, `pages: write`, `id-token: write`
- `concurrency: group: pages` with `cancel-in-progress: false` — guarantees no in-flight Pages deploy is interrupted (per Pages best practice)
- Build step passes `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` via step-level `env:` so `src/lib/projects.ts` uses the 1,000 req/hr authenticated rate limit instead of the 60 req/hr unauthenticated bucket
- `actions/configure-pages@v5` step given `id: pages` so its (empty) basePath output remains addressable for future plans
- Deploy job correctly declares `needs: build`, the `environment: github-pages` block with the canonical `url: ${{ steps.deployment.outputs.page_url }}`, and an `id: deployment` step
- `next.config.ts` left untouched — `configure-pages@v5` handles user-page topology with no basePath needed (assets resolve at `/`, not `/website/`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create .github/workflows/deploy.yml** — `43551ae` (feat)

**Plan metadata:** committed alongside SUMMARY.md (this commit)

## Files Created/Modified

- `.github/workflows/deploy.yml` — Pages-enabled deploy workflow. Two jobs (build, deploy). Triggered on `push: branches: [main]`. Build uses Node 20 with npm caching, runs `npm ci` then `npm run build` with `GITHUB_TOKEN` in env, uploads `./out` as the Pages artifact. Deploy job consumes the artifact via `actions/deploy-pages@v5` and exposes the live URL through the `github-pages` environment.

## Decisions Made

- **Flow-style trigger array (`branches: [main]`)** — chosen over block-style (`branches:\n  - main`) because the Plan 02 verification regex `branches:\s*(\[main\]|-\s*main)` tolerates either form, and flow-style gives Plan 02 a single-line edit point when adding `schedule:` and `workflow_dispatch:` siblings.
- **`push:` placed first under `on:`** — matches the convention the plan specifies; future planners can append sibling triggers without reordering.
- **Major-pin action versions** — accepted threat T-04-01 (Tampering) per the plan threat model; SHA-pinning offers no meaningful safety improvement for a personal-site Pages workflow and dramatically increases Dependabot review cost.
- **`cache: 'npm'` on `setup-node@v4`** — speeds rebuilds without introducing a separate `actions/cache@v4` step (that's Plan 03's territory for `.next/cache`).
- **No basePath in `next.config.ts`** — for the user-page repo `axelwaserman/axelwaserman.github.io`, the Pages publish path is `/`. `configure-pages@v5` detects this and emits no basePath. Adding one would break asset resolution.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None during implementation. Two acceptance-criteria check scripts in the post-write verification loop produced false negatives initially (one due to a regex matching across the wider workflow text region rather than only the permissions block, the other due to shell-level `$` escaping in a literal grep pattern). Both were re-verified with corrected scripts and confirmed PASS — no defect in the file itself. The plan's primary `<verify>` command (`node -e ...`) returned `All required patterns present` on first run.

## Pending Checkpoint

**Task 2: One-time enablement — turn on GitHub Pages in repo settings (`type="checkpoint:human-action"` gate="blocking")**

The deploy workflow file is committed but **cannot publish until the human performs a one-time UI step**:

1. Open https://github.com/axelwaserman/axelwaserman.github.io/settings/pages
2. Under "Build and deployment" → set **Source** to **GitHub Actions** and Save
3. Push the branch to main (orchestrator workflow merges this branch via PR)
4. Open https://github.com/axelwaserman/axelwaserman.github.io/actions and confirm both `build` and `deploy` jobs run green
5. Open https://axelwaserman.github.io/ and confirm:
   - Hero name is visible
   - Projects section is populated (build-time GitHub fetch worked under authenticated rate limit)
   - Browser DevTools shows no 404s for CSS / fonts / images (confirms `configure-pages@v5` emitted the correct empty basePath for this user-page repo — assets at `/_next/...`, not `/website/_next/...`)

There is no `gh` CLI command that flips the Pages source on first-time enablement, which is why this is a `human-action` checkpoint rather than auto-fixable. This is the expected blocking gate for Plan 04-01 closure.

## User Setup Required

Yes — see "Pending Checkpoint" above. The plan frontmatter declares:

```yaml
user_setup:
  - service: github-pages
    why: "GitHub Pages must be enabled with Source: GitHub Actions before any deploy run can publish — this is a one-time UI step the user performs in repo Settings."
```

Verification commands once enabled:

- `gh run list --workflow="Deploy to GitHub Pages" --limit 1` — should show a recent successful run after pushing to main
- `curl -sI https://axelwaserman.github.io/ | head -1` — should return `HTTP/2 200`

## Next Phase Readiness

- Plan 04-01 file artifact complete and committed (`43551ae`).
- Phase 4 Plan 02 (cron + `workflow_dispatch`) can layer on top by extending the existing `on:` block — the flow-style `branches: [main]` chosen here gives Plan 02 a clean single-key insertion point.
- Phase 4 Plan 03 (`actions/cache@v4` for `.next/cache`) can slot a step between `setup-node@v4` and `npm ci` without disturbing the rest of the pipeline.
- **Blocker for full Phase 4 success criteria #1:** Pages source enablement (Task 2 checkpoint) — out of executor scope; orchestrator must surface this to the human before the live URL responds.

## Threat Surface Notes

The workflow introduces:
- `id-token: write` permission for OIDC-based deploy-pages@v5 (mitigated per T-04-05 — scoped to exactly the keys needed)
- `secrets.GITHUB_TOKEN` flowing into the build step (mitigated per T-04-02 — Actions auto-masks secret values; token only in step-level env, never echoed)

Both are within the plan's threat-register dispositions; no new threat flags introduced.

## Self-Check: PASSED

- File `.github/workflows/deploy.yml` exists on disk: **FOUND**
- Commit `43551ae` exists: **FOUND**
- Plan-level verification (`<verify>` automated regex check): **All required patterns present**
- `next.config.ts` unchanged: **PASS** (`git diff next.config.ts` empty)
- No `basePath` / `assetPrefix` in `next.config.ts`: **PASS**
- Permissions block has exactly 3 keys (`contents: read`, `pages: write`, `id-token: write`): **PASS**
- `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` literal present on build step: **PASS** (verified with `grep -F`)
- `npm ci` precedes `npm run build` in the file: **PASS**
- `actions/upload-pages-artifact@v3` uses `path: ./out`: **PASS**
- Deploy job declares `needs: build` and `environment: { name: github-pages, url: ... outputs.page_url }`: **PASS**
- All 5 CLAUDE.md-mandated action versions present verbatim: **PASS**

---
*Phase: 04-deploy*
*Plan: 01*
*Completed: 2026-06-03*
