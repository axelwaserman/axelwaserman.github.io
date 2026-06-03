---
phase: 04-deploy
reviewed: 2026-06-03T00:00:00Z
depth: standard
files_reviewed: 1
files_reviewed_list:
  - .github/workflows/deploy.yml
findings:
  critical: 0
  warning: 1
  info: 3
  total: 4
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-06-03T00:00:00Z
**Depth:** standard
**Files Reviewed:** 1
**Status:** issues_found

## Summary

Reviewed `.github/workflows/deploy.yml` — a two-job (build → deploy) GitHub Actions
workflow that publishes the Next.js static export to GitHub Pages on push to `main`,
on a daily 06:00 UTC cron, and via `workflow_dispatch`.

The workflow is **functionally correct**. All security-critical items check out:

- Action versions are pinned per CLAUDE.md (`@v4`/`@v5`/`@v3` major tags as mandated).
- `permissions:` block follows least-privilege for OIDC-based `deploy-pages`
  (`contents: read`, `pages: write`, `id-token: write`).
- `concurrency: { group: pages, cancel-in-progress: false }` matches GitHub's
  recommended config for Pages — in-flight deploys are not interrupted.
- `GITHUB_TOKEN` is scoped to the build step's `env:` (not job-wide), minimizing
  exposure surface. The token is the workflow-provided default token, never a
  hardcoded secret.
- No user-controlled input is interpolated into `run:` shell commands — there is
  no workflow-injection vector. (`${{ github.event.* }}` is not used anywhere.)
- The cache key is correctly scoped (`hashFiles('package-lock.json')` rather
  than the unscoped `**/package-lock.json`, and explicit `src/**` + named config
  files instead of `**/*.ts`), so dependency-tree noise inside `node_modules/`
  cannot invalidate the cache key.
- The cache step is correctly ordered: AFTER `npm ci`, BEFORE `npm run build`.
- Workflow only triggers on `push` to `main`, `schedule`, and `workflow_dispatch` —
  it cannot be invoked from fork PRs, so no fork-PR token-leakage risk.
- `restore-keys:` prefix is a strict prefix of `key:`, so partial cache hits
  resolve correctly.

The findings below are quality / robustness concerns, not correctness or security
defects. None are blockers; the workflow can ship as-is.

## Warnings

### WR-01: No `timeout-minutes` set on either job

**File:** `.github/workflows/deploy.yml:20-21, 57-59`
**Issue:** Neither the `build` nor the `deploy` job declares `timeout-minutes`.
GitHub's default job timeout is **360 minutes (6 hours)**. A hung build, network
hang, or wedged action could burn six hours of runner minutes per occurrence —
and because the daily cron triggers on schedule, a stuck run could be replaced
by the next day's run only after that 6-hour ceiling. For a small static-site
build that finishes in 1–2 minutes, the default timeout is wildly disproportionate
to the work.

This also interacts with `concurrency: cancel-in-progress: false`: if a build
gets stuck, queued runs (including subsequent pushes) are blocked behind it
until the timeout expires.

**Fix:** Add a tight per-job timeout. 10 minutes for build, 5 for deploy:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      ...

  deploy:
    needs: build
    runs-on: ubuntu-latest
    timeout-minutes: 5
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      ...
```

## Info

### IN-01: `node-version: 20` floats across the entire 20.x line

**File:** `.github/workflows/deploy.yml:29`
**Issue:** `node-version: 20` resolves to the latest available Node 20.x release
on the runner image. This is convenient but non-deterministic across runs —
two consecutive cron runs on different days can compile against different Node
20.x patch releases, which can in rare cases produce different build output
(e.g., a Node-bundled OpenSSL change affecting `crypto.subtle` callers, or a
V8 codegen change affecting tsc output). Pinning more tightly produces
reproducible builds.

This is the only floating version in the file — every `actions/*` reference is
pinned to a major tag and Node should match that posture.

**Fix:** Pin to a specific minor or use `.nvmrc`:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.18'   # or: node-version-file: '.nvmrc'
    cache: 'npm'
```

If `.nvmrc` is preferred, add it at the repo root with the desired version
string and switch to `node-version-file: '.nvmrc'`.

### IN-02: `public/**` not included in cache-key source hash

**File:** `.github/workflows/deploy.yml:43`
**Issue:** The source-component of the cache key hashes `src/**`,
`next.config.ts`, `postcss.config.mjs`, and `tsconfig.json`. Static assets in
`public/` (favicons, OG images, downloadable PDFs, etc.) are NOT in the hash.

In practice this is benign because `.next/cache` only stores incremental
compile output and Next.js itself invalidates on input changes — but the
trade-off is worth being explicit about. If, for example, an OG image is
swapped without any code change, the cache key remains identical (intentional);
if Next ever extends `.next/cache` to cover image-pipeline output, this glob
would need to widen.

**Fix:** Either widen the hash to include `public/**`, or leave a comment
documenting the deliberate scope:

```yaml
key: ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-${{ hashFiles('src/**', 'public/**', 'next.config.ts', 'postcss.config.mjs', 'tsconfig.json') }}
```

(Optional change; current behavior is acceptable.)

### IN-03: No notification on cron-build failure

**File:** `.github/workflows/deploy.yml:6-7`
**Issue:** The daily 06:00 UTC cron rebuild silently exists to keep the
GitHub Projects section fresh against the GitHub API. If a scheduled run
fails (rate-limit hit, transient API error, broken token, dependency CVE
auto-bump breaking the build), the failure shows up in the Actions tab but
nothing actively notifies the maintainer. The site continues to serve the
last successful build, so users see stale data without anyone realizing the
refresh pipeline is broken.

GitHub does send email notifications for scheduled-workflow failures by
default at the user-account level, but only after consecutive failures and
only to the workflow file's last committer — easy to miss.

**Fix:** Optional. Either accept the risk (cron is best-effort, last
successful deploy is always live) or add a lightweight failure step that
opens a GitHub issue on cron failures:

```yaml
- name: Open issue on cron failure
  if: failure() && github.event_name == 'schedule'
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: `Scheduled deploy failed on ${new Date().toISOString().slice(0,10)}`,
        body: `Workflow run: ${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`,
        labels: ['ci', 'cron-failure']
      })
```

If this is added, `permissions:` would need `issues: write`.

(Optional — not required to ship Phase 4.)

---

_Reviewed: 2026-06-03T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
