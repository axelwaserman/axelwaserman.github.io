---
status: partial
phase: 04-deploy
source: [04-VERIFICATION.md]
started: 2026-06-03T00:00:00Z
updated: 2026-06-03T18:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Pushing to main triggers a GitHub Actions build and the live site updates within minutes
expected: After this branch merges to main and Pages is enabled (Source: GitHub Actions), the next push triggers a green workflow run at https://github.com/axelwaserman/axelwaserman.github.io/actions and https://axelwaserman.github.io/ serves the deployed site within ~3 minutes.
result: pass

### 2. Daily cron actually fires and produces a redeploy
expected: The morning after the workflow lands on main (06:00 UTC), https://github.com/axelwaserman/axelwaserman.github.io/actions shows a workflow run with trigger source 'scheduled'. Cron syntactic validity is already verified mechanically (5 fields, '0 6 * * *' parses); only the next-day firing observation requires a human.
result: skipped
reason: Can only verify tomorrow — first 06:00 UTC firing is 2026-06-04. Workflow merged 2026-06-03 10:29 UTC.

### 3. workflow_dispatch button is visible and a manual run completes green
expected: After merge, https://github.com/axelwaserman/axelwaserman.github.io/actions/workflows/deploy.yml shows the 'Run workflow' dropdown in the upper-right. Clicking it (default branch) triggers a run that completes green and the live site at https://axelwaserman.github.io/ continues to respond.
result: pass

### 4. configure-pages@v5 emits no basePath; assets resolve at / on the live site
expected: Browser DevTools on a hard reload of https://axelwaserman.github.io/ shows zero console 404s. Asset URLs are prefixed with / (e.g. /_next/static/...), NOT /website/_next/... — confirming this is treated as a USER-PAGE repo with no basePath.
result: issue
reported: "I warning and one error: Error with Permissions-Policy header: Unrecognized feature: 'browsing-topics'. favicon.ico:1  GET https://axelwaserman.github.io/favicon.ico 404 (Not Found)"
severity: minor
notes: |
  basePath behavior is correct (asset URLs root-relative, no /website/ prefix verified via curl).
  Permissions-Policy warning is emitted by GitHub Pages itself (auto-injected header), not the
  site — out of scope.
  The /favicon.ico 404 IS in scope: no public/ dir, no src/app/icon.* or favicon.ico file,
  and no <link rel="icon"> in the HTML. Browser auto-requests /favicon.ico → 404.

## Summary

total: 4
passed: 2
issues: 1
pending: 0
skipped: 1
blocked: 0

## Gaps

- truth: "Live site has no console 404s on hard reload"
  status: failed
  reason: "User reported: warning + 404 — Permissions-Policy 'browsing-topics' (out of scope, GitHub Pages-emitted), and GET /favicon.ico → 404 (in scope, real bug)"
  severity: minor
  test: 4
  artifacts:
    - path: "src/app/"
      issue: "No favicon.ico, icon.png, or apple-icon.png present in src/app/ — Next.js App Router serves these conventionally."
    - path: "public/"
      issue: "Directory does not exist — no static fallback for /favicon.ico either."
    - path: "src/app/layout.tsx"
      issue: "No <link rel=\"icon\"> declaration in metadata."
  missing:
    - "Add a favicon: place src/app/favicon.ico (or src/app/icon.png) so Next.js auto-includes <link rel=\"icon\"> and emits the asset to /."
  scope_notes: |
    Permissions-Policy 'browsing-topics' warning is injected by GitHub Pages on all responses
    and is unrelated to repo code. Not addressable here.
