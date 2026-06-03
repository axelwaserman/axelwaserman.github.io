---
phase: 04-deploy
plan: 03
subsystem: infra
tags: [github-actions, cache, performance, optimization, deploy, polish]

requires:
  - phase: 04-deploy
    provides: ".github/workflows/deploy.yml — Plan 01 build/deploy jobs + Plan 02 multi-trigger on: block (push, schedule, workflow_dispatch)"
provides:
  - "actions/cache@v4 step persisting .next/cache across workflow runs, scoped by OS + repo-root lockfile hash + source-file hash (src/**, next.config.ts, postcss.config.mjs, tsconfig.json)"
  - "restore-keys fallback prefix (runner.os + nextjs + lockfile-hash) so partial source changes still warm-start from a recent cache"
affects: [all future production deploys (push, scheduled, manual) — incremental Next.js rebuilds reuse compiler/optimizer cache]

tech-stack:
  added:
    - actions/cache@v4
  patterns:
    - "Insert cache step AFTER npm ci, BEFORE npm run build — node_modules in place at restore, .next/cache available to the build that follows"
    - "Cache .next/cache only (NOT the full .next/ tree) — keeps cache tight, avoids stale build collisions"
    - "Scoped hashFiles globs: 'package-lock.json' (no **/) and 'src/**' + named config files — node_modules is on disk during cache evaluation, unscoped globs would over-invalidate on dependency-tree minor patches"
    - "Multi-line YAML literal block (|) for restore-keys so the prefix is a string scalar, not parsed"

key-files:
  created: []
  modified:
    - .github/workflows/deploy.yml

key-decisions:
  - "Cache .next/cache, NOT .next/ — Next.js 16 .next/cache is the dedicated incremental compile cache; the rest of .next/ is regenerated build output and shouldn't be cached"
  - "Scoped hashFiles globs (no **/* prefix) — when actions/cache evaluates after npm ci, node_modules is on disk; an unscoped **/*.ts or **/package-lock.json glob would fold dependency-tree contents into the cache key, defeating the cache on every dependency-tree minor change"
  - "Insertion order npm ci → cache → npm run build — placing cache before npm ci would cache it but the build would not see the restored copy if subsequent steps reshape directories; placing cache after build defeats the purpose"
  - "actions/cache@v4 pinned at major version per CLAUDE.md (T-04-SC supply-chain disposition: mitigate; this is a GitHub-published first-party action)"
  - "No additional cache step for node_modules — Plan 01 already enabled cache: 'npm' on actions/setup-node@v4; layering another node_modules cache would be redundant"

patterns-established:
  - "Three-component cache key shape for Next.js Pages workflows: ${runner.os}-nextjs-${hashFiles(lockfile)}-${hashFiles(src+configs)}"
  - "Non-blocking polish layered onto a working pipeline — Plan 03 explicitly carries non_blocking: true; if the cache step ever regresses, it can be reverted without touching Plans 01/02"

requirements-completed: [INFRA-07]

duration: ~1 min
completed: 2026-06-03
---

# Phase 04 Plan 03: .next/cache Build Cache Summary

**Layered an actions/cache@v4 step onto the working deploy workflow so daily cron rebuilds restore Next.js incremental compile state — non-blocking polish that pays off from the second run onward.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-06-03T09:50:28Z
- **Completed:** 2026-06-03T09:51:26Z
- **Tasks:** 1 of 1 complete (no checkpoints in this plan)
- **Files created:** 0
- **Files modified:** 1

## Accomplishments

- Inserted a single `actions/cache@v4` step into the `build:` job of `.github/workflows/deploy.yml`, positioned exactly between the `npm ci` step and the `npm run build` step.
- Cache `path:` is `.next/cache` (the dedicated Next.js incremental compile cache) — not the full `.next/` tree.
- Cache `key:` is the canonical `${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-${{ hashFiles('src/**', 'next.config.ts', 'postcss.config.mjs', 'tsconfig.json') }}` shape: OS + scoped lockfile hash + scoped source-file hash. The hashFiles globs deliberately exclude `node_modules/**`, `out/**`, `.next/**`, and `.planning/**`.
- `restore-keys:` fallback prefix `${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-` lets partial source changes warm-start from the most recent cache that shares OS + dependencies.
- All Plan 01 and Plan 02 content preserved verbatim (verified by the plan's regex check, which re-asserts every Plan 01/02 invariant: push trigger, cron, workflow_dispatch, permissions, concurrency, action-version pins, GITHUB_TOKEN env).
- Workflow YAML still parses cleanly (`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"` succeeds and yields the expected step order: Checkout → Setup Node.js → Configure Pages → Install dependencies → Cache .next/cache → Build Next.js static export → Upload Pages artifact).

## Task Commits

Each task was committed atomically:

1. **Task 1: Add actions/cache@v4 step for .next/cache between npm ci and npm run build** — `36dbced` (feat)

**Plan metadata:** committed alongside SUMMARY.md (this commit)

## Files Created/Modified

- `.github/workflows/deploy.yml` — single 8-line insertion in the `build:` job between `npm ci` and `npm run build`. Rest of the file (triggers, permissions, concurrency, deploy job, action versions, env vars) untouched.

## Inserted Cache Step (verbatim)

```yaml
      - name: Cache .next/cache
        uses: actions/cache@v4
        with:
          path: .next/cache
          key: ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-${{ hashFiles('src/**', 'next.config.ts', 'postcss.config.mjs', 'tsconfig.json') }}
          restore-keys: |
            ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-
```

## Diff vs Plan 02 (post Plans 01 + 02 baseline)

```diff
@@ -36,6 +36,14 @@ jobs:
       - name: Install dependencies
         run: npm ci

+      - name: Cache .next/cache
+        uses: actions/cache@v4
+        with:
+          path: .next/cache
+          key: ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-${{ hashFiles('src/**', 'next.config.ts', 'postcss.config.mjs', 'tsconfig.json') }}
+          restore-keys: |
+            ${{ runner.os }}-nextjs-${{ hashFiles('package-lock.json') }}-
+
       - name: Build Next.js static export
         run: npm run build
         env:
```

Eight insertions, zero deletions, zero modifications outside the new step.

## Final Build-Job Step Order

```
0. Checkout                       (actions/checkout@v4)
1. Setup Node.js                  (actions/setup-node@v4 with cache: 'npm')
2. Configure Pages                (actions/configure-pages@v5)
3. Install dependencies           (npm ci)
4. Cache .next/cache              (actions/cache@v4)              ← NEW (this plan)
5. Build Next.js static export    (npm run build)
6. Upload Pages artifact          (actions/upload-pages-artifact@v3)
```

## Decisions Made

- **`.next/cache` only, not `.next/`** — Next.js writes its incremental build cache (compiler artifacts, optimized images, persistent file cache) to `.next/cache`. The rest of `.next/` is build output that gets regenerated; caching it would bloat the cache and risk stale-output collisions on the next build.
- **Scoped hashFiles globs (no `**/` prefix)** — `actions/cache@v4` evaluates `hashFiles` after `npm ci` runs. At that moment `node_modules/` is on disk regardless of `.gitignore`. An unscoped `**/package-lock.json` would also hash any nested lockfile inside `node_modules/`, and `**/*.ts` would fold dependency-tree TypeScript files into the key — both would invalidate the cache on dependency-tree minor patches even when project source hasn't changed. Scoped globs (`'package-lock.json'`, `'src/**'`, named config files) target only the inputs that actually affect the Next.js build.
- **Insertion order npm ci → cache → npm run build** — node_modules must already be installed when cache restores (so `actions/cache` runs against a known directory layout); cache must restore before `npm run build` so Next.js sees the prior compile state at the start of its build.
- **`restore-keys:` provides a single prefix fallback** — when source changes invalidate the primary key, the fallback (OS + nextjs + lockfile hash) still finds the most recent cache built against the same dependency tree, giving incremental compile a head start.
- **`actions/cache@v4` major-version pinning** — per CLAUDE.md mandate; T-04-SC threat disposition is mitigate (first-party GitHub-published action; SHA-pinning offers no meaningful safety improvement for a personal-site Pages workflow).
- **No additional `node_modules` cache** — Plan 01 already enabled `cache: 'npm'` on `actions/setup-node@v4`. Adding a parallel `node_modules` cache step would be redundant and could fight setup-node's own cache key.

## Verification

The plan's `<verify>` command (run from `/tmp/verify-04-03.js` to avoid zsh `${...}` expansion of regex literals — same workaround Plan 02 documented) returned:

```
All required patterns present and ordered correctly
```

The verify script re-asserted every invariant inherited from Plans 01 and 02 (push trigger, cron, workflow_dispatch, permissions block with id-token: write, concurrency group: pages with cancel-in-progress: false, configure-pages@v5, upload-pages-artifact@v3, deploy-pages@v5, GITHUB_TOKEN env on the build step) and explicitly rejected any presence of `hashFiles('**/package-lock.json')`. Pass.

YAML parser confirmation (PyYAML safe_load):
- `on:` triggers: `['push', 'schedule', 'workflow_dispatch']` (Plan 02 preserved)
- `jobs:` `['build', 'deploy']` (Plan 01 preserved)
- Build steps include `Cache .next/cache` at index 4, between `Install dependencies` (index 3) and `Build Next.js static export` (index 5)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

The plan's inline `<verify>` command (one-liner `node -e "..."`) again risked tripping zsh on `${...}` interpolation inside the regex literals — same shell-quoting artifact Plan 02 documented. Mitigated proactively by writing the same logic to `/tmp/verify-04-03.js` and running `node /tmp/verify-04-03.js`. No defect in the workflow file; verification passed cleanly.

## Pending Checkpoint

None. Plan 03 is fully autonomous (`autonomous: true` in frontmatter, no `checkpoint:*` task types).

The first run URL after this change lands on `main` will be visible at https://github.com/axelwaserman/axelwaserman.github.io/actions — the new "Cache .next/cache" step will appear in the build-job log. On the first run after merge, the cache step will report "Cache not found for input keys" (cold cache); on the second run (next push or next 06:00 UTC cron) it will report a cache hit on the `restore-keys` prefix and a save under the new primary key. Steady-state hit rate depends on how often `src/**` changes between runs.

## User Setup Required

None for this plan. Plan 01's pending one-time GitHub Pages enablement (Source: GitHub Actions in repo settings) and Plan 02's `workflow_dispatch` button verification still apply at the wave/phase level but are unrelated to the cache step.

## Next Phase Readiness

- Plan 04-03 file artifact complete and committed (`36dbced`).
- Phase 4 success criteria coverage:
  - #1, #2 — delivered by Plans 01 and 02 (push deploy + daily cron + manual dispatch).
  - #3, #4 — incremental rebuild cache: this plan adds the canonical `.next/cache` step. First run will be cold; subsequent runs benefit from warm cache (typical 30–60% reduction in build duration on a small site, per the Next.js Pages starter workflow expectations).
- The deploy workflow is now feature-complete for the Phase 4 scope. No further plans in this phase modify it.

## Threat Surface Notes

- **T-04-09 (Tampering — stale cache producing incorrect build output)**: mitigate by construction. The cache key includes both lockfile hash and a source-file hash; a cache hit only occurs when both deps and source are byte-identical to a previous build, which is the exact condition under which the cached `.next/cache` is correct for the current input. Scoped globs avoid over-invalidation.
- **T-04-10 (Information Disclosure — `.next/cache` leaking secrets)**: accept. `.next/cache` contains build-time compile artifacts; secrets (`GITHUB_TOKEN`) are read from `process.env` at build time and inlined into JS bundles only when explicitly referenced. Phase 3 Plan 03 verified no token strings end up in the build output, so the cache (a subset of build output) inherits that property.
- **T-04-11 (DoS — cache corruption blocking builds)**: mitigate. A bad cache produces a failing build; the next run with a different key (any source change) routes around it. Manual recovery via `gh cache delete` or by reverting just this plan's step (non-blocking semantics) is documented.
- **T-04-SC (Tampering — supply chain)**: mitigate. `actions/cache@v4` is a first-party GitHub action pinned per CLAUDE.md; no new packages introduced.

No new threat flags introduced.

## Self-Check: PASSED

- File `.github/workflows/deploy.yml` exists on disk and contains `actions/cache@v4` step: **FOUND** (`grep -F 'actions/cache@v4' .github/workflows/deploy.yml` returns 1 match).
- Commit `36dbced` exists in `git log`: **FOUND** (`git log --oneline -5` shows `36dbced feat(04-03): cache .next/cache between npm ci and npm run build`).
- Plan-level `<verify>` (15 regex patterns + ordering check + unscoped-glob rejection): **PASS** (`All required patterns present and ordered correctly`).
- YAML parses cleanly (PyYAML `safe_load`): **PASS**.
- `git status --porcelain .github/`: **PASS** (empty after commit; no stray new files).
- Plan 01 invariants regression-checked: push trigger, permissions block, concurrency, action versions, GITHUB_TOKEN env, configure-pages@v5/upload-pages-artifact@v3/deploy-pages@v5 — all **PASS** (re-tested by the plan's regex script).
- Plan 02 invariants regression-checked: cron string, workflow_dispatch, on-block shape — all **PASS** (re-tested by the plan's regex script).
- `hashFiles('**/package-lock.json')` (unscoped form) absent: **PASS** (script explicitly rejects it; not present).
- Cache step ordering after npm ci, before npm run build: **PASS** (line-index check; YAML parser confirms step order index 4 between 3 and 5).

---
*Phase: 04-deploy*
*Plan: 03*
*Completed: 2026-06-03*
