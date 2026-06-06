---
phase: 7-engineering-philosophy
plan: 2
subsystem: brand-assets
tags: [favicon, og-image, mandala, playwright, ci, brand]
requires:
  - existing src/app/icon.tsx route + next/og ImageResponse pipeline
  - @playwright/test devDependency (already installed)
  - GitHub Pages deploy workflow (.github/workflows/deploy.yml)
provides:
  - deterministic, commit-SHA-seeded mandala favicon (32x32) and apple-touch icon (180x180)
  - build-time OG screenshot pipeline writing 1200x630 PNG to out/og-image.png
  - CI step ordering that regenerates the OG image between build and artifact upload
affects:
  - src/app/icon.tsx (replaced AW monogram with seeded mandala)
  - src/app/apple-icon.tsx (new)
  - src/lib/mandala.ts (extended with favicon generator alongside existing hero geometry)
  - .github/workflows/deploy.yml (two new steps inserted)
  - package.json (one new script entry; no new dependencies)
  - .gitignore (excludes generated PNGs)
tech-stack:
  added: []
  patterns:
    - djb2 string hash → 32-bit seed
    - xorshift32 stateful PRNG → deterministic visual variation per commit
    - next/og ImageResponse with createElement (lib lives in .ts, not .tsx)
    - tiny in-process http server + Playwright Chromium for build-time screenshots
key-files:
  created:
    - src/app/apple-icon.tsx
    - scripts/generate-og-image.mjs
    - .planning/phases/07-engineering-philosophy/07-02-SUMMARY.md
  modified:
    - src/lib/mandala.ts
    - src/app/icon.tsx
    - package.json
    - .github/workflows/deploy.yml
    - .gitignore
decisions:
  - chromium imported from '@playwright/test' (already a devDep) rather than 'playwright' — zero new packages
  - mandala generator lives inside src/lib/mandala.ts (alongside Phase 05 hero chord-line geometry) under a clearly marked BRAND-01 section, instead of a new file — avoids two visually-similar modules with the same name
  - icon.tsx no longer reads the Instrument Serif TTF (no text to render); the file is smaller and faster
  - apple-icon shares the same seedFromCommit() so the favicon and the apple-touch icon are visually consistent per build
  - generated OG PNGs are gitignored — single source of truth is the build pipeline; never let the committed image drift from the live homepage
metrics:
  duration: ~1h
  completed: 2026-06-06
  tasks_completed: 3 of 3 auto tasks (Task 4 is a human-verify checkpoint, deferred to orchestrator/human)
  files_changed: 7
  deps_added: 0
---

# Phase 7 Plan 2: Brand Assets — Mandala Favicon + Real OG Image Summary

**One-liner:** Replaced the AW monogram with a deterministic xorshift32-seeded mandala favicon (32x32 + 180x180 apple-touch), and wired a build-time Playwright screenshot pipeline that regenerates `out/og-image.png` on every GitHub Actions deploy — zero new dependencies.

## Tasks Completed

| Task | Name | Type | Commit |
|------|------|------|--------|
| 1 | Mandala favicon generator + apple-touch icon | auto | `7b818c9` |
| 2 | OG screenshot script + package.json + .gitignore | auto | `827ab8a` |
| 3 | Wire OG generation into deploy workflow | auto | `344f27f` |
| 4 | Human visual review (favicon + OG share preview) | checkpoint:human-verify | _deferred to orchestrator/human_ |

## What Got Built

### Task 1 — Mandala favicon generator

- Extended `src/lib/mandala.ts` with three new exports — `seedFromCommit`, `xorshift32`, `generateMandala` — under a clearly marked `BRAND-01` section. The Phase 05 hero geometry exports (`generateLines`, `CURATED_PAIRS`, `pickRandomPair`) are unchanged.
- `seedFromCommit()` reads `process.env.GITHUB_SHA` (or `VERCEL_GIT_COMMIT_SHA`, falling back to the literal `'local-dev'`) and runs it through djb2 → uint32.
- `xorshift32(seed)` returns a stateful PRNG closure; guards against the `seed=0` stall (replaces with 1).
- `generateMandala(seed, canvasSize)` returns `{ children, params }`:
  - `children` is a single `<svg>` element built via `React.createElement` (the file is `.ts`, not `.tsx`, so JSX literals would not parse — `createElement` is the right tool here).
  - 1 outer guide ring + N concentric rings (N ∈ [3,5]) of 6..12 petals each, alternating ink/accent colors per ring, plus a center accent dot.
  - Petal radii and stroke widths scale with `canvasSize`, so the same seed reads at both 32px and 180px.
- `src/app/icon.tsx` rewritten: dropped the Instrument Serif font load (no text to render); imports the generator and renders the seeded mandala on a parchment background. Preserved `size`, `contentType`, and `dynamic = 'force-static'` exports.
- `src/app/apple-icon.tsx` (new) mirrors `icon.tsx` at 180×180 with the same generator and seed.
- Both icon files keep the oklch source-of-truth comments (D-20 traceability) alongside the precomputed sRGB equivalents Satori needs.

#### Final mandala parameters (seed = djb2('local-dev') = 904798876)

```json
{
  "ringCount": 5,
  "petalCounts": [10, 7, 7, 12, 8],
  "rotationOffsets": [276.5, 64.95, 11.14, 144.57, 18.77]
}
```

CI runs will produce a different mandala (seed = djb2(commit SHA)), so each deploy gets a unique-but-deterministic icon.

### Task 2 — OG screenshot script

- `scripts/generate-og-image.mjs` (Node ESM, ~170 lines):
  - Imports `chromium` from `@playwright/test` (already a devDep — zero new packages).
  - Boots a tiny `http.createServer` against `./out` bound to `127.0.0.1:4173` (no external interface — mitigates T-7-06).
  - Content-Type whitelist for the static server prevents serving unexpected file types as HTML.
  - Polls until `GET /` succeeds, then drives Playwright at viewport `1200×630`, `waitUntil: 'networkidle'`, takes a `clip: { x:0, y:0, width:1200, height:630 }` PNG screenshot.
  - Writes the buffer to **both** `public/og-image.png` (for local dev preview) and `out/og-image.png` (for CI artifact upload).
  - Sanity-checks file size ∈ [10_000, 500_000] bytes.
  - `try/finally` guarantees `browser.close()` and `server.close()` — no orphan processes (verified via `ps -ax`).
- `package.json` gets a single new entry: `"og:generate": "node scripts/generate-og-image.mjs"`. `dependencies` and `devDependencies` are otherwise byte-identical.
- `.gitignore` now excludes `public/og-image.png` and `out/og-image.png` — the artifact is rebuilt every deploy, never committed.

#### Local end-to-end run

```
$ npm run build && npm run og:generate
…
OG image written: 1200x630, 282389 bytes
```

`out/og-image.png` PNG IHDR check: width=1200, height=630, size=282_389 bytes ✓

### Task 3 — CI wiring

Inserted two steps in `.github/workflows/deploy.yml` between `Build Next.js static export` and `Upload Pages artifact`:

```yaml
- name: Install Playwright Chromium
  run: npx playwright install --with-deps chromium

- name: Generate OG image
  run: npm run og:generate
```

Step ordering verification (character offsets in the YAML):
`Build Next.js static export` < `Install Playwright Chromium` < `Generate OG image` < `Upload Pages artifact` ✓

`src/app/layout.tsx` already had the correct openGraph entry — `url: '/og-image.png'`, `width: 1200`, `height: 630`, non-empty `alt` — so no edit was needed there.

## Verification

### Automated checks (all passing)

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | exit 0 |
| `npm run test` (vitest) | 24 passed (existing hero mandala tests still green) |
| `npm run build` | exit 0; both `/icon` and `/apple-icon` emitted in `out/` |
| `out/icon` exists, contains no AW monogram | ✓ |
| `out/apple-icon` exists | ✓ |
| `npm run og:generate` | exit 0, no orphan processes |
| `out/og-image.png` PNG IHDR | 1200×630, 282_389 bytes |
| `public/og-image.png` matches `out/og-image.png` | ✓ |
| `.gitignore` excludes both PNGs | ✓ (`git check-ignore` confirms) |
| Determinism contract (djb2 + xorshift32) | same seed → same first 5 PRNG values, verified |
| `'use client'` not present in any new/modified file | ✓ |
| CI step ordering in deploy.yml | ✓ |
| `src/app/layout.tsx` openGraph metadata | ✓ (url + 1200 + 630 + non-empty alt) |

### Confirmation: zero new dependencies

`package.json` `dependencies` / `devDependencies` unchanged; only the `scripts.og:generate` entry is new.

### Confirmation: no `'use client'` added

Verified in `src/lib/mandala.ts`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`, `scripts/generate-og-image.mjs`.

### Confirmation: CI step ordering

Build → Install Playwright Chromium → Generate OG image → Upload Pages artifact. ✓

## Deviations from Plan

1. **[Decision] Generator co-located in `src/lib/mandala.ts` instead of a brand-new file.**
   - **Found during:** Task 1 read-first.
   - **Issue:** A pre-existing `src/lib/mandala.ts` from Phase 05 hosts hero chord-line geometry. The plan called for a fresh module by the same name, which would have either (a) collided/overwritten Phase 05 work or (b) required a renamed file.
   - **Resolution:** Appended the favicon mandala generator into the existing file under a clearly demarcated `// =========== BRAND-01 ===========` block, with a refreshed top-of-file header that documents both responsibilities. All Phase 05 exports remain at their original public surface; existing tests (24) still pass.
   - **Files affected:** `src/lib/mandala.ts` (single file, two responsibilities, well-marked).

2. **[Rule 3] `src/lib/mandala.ts` stays `.ts` (not `.tsx`); JSX swapped for `React.createElement`.**
   - **Found during:** Task 1 implementation.
   - **Issue:** The existing file is `.ts`, and renaming would break the `@/lib/mandala` import path used by `src/components/hero/*` and the test file.
   - **Resolution:** Used `import { createElement } from 'react'` and built the SVG tree imperatively. Functionally equivalent; preserves all Phase 05 imports.

3. **[Decision] `chromium` imported from `@playwright/test` rather than `playwright`.**
   - **Found during:** Task 2 read-first.
   - **Issue:** Only `@playwright/test` is in devDeps (`playwright` standalone is not). The plan permitted either; this avoided a new dependency.
   - **Resolution:** `import { chromium } from '@playwright/test'` — documented in the script's top comment block.

4. **[Rule 2 — minor robustness] Static server adds an `.html` fallback for extension-less paths.**
   - **Found during:** Task 2 implementation.
   - **Issue:** The original spec was `index.html` for extension-less URLs, but Next.js static export emits sibling `<route>.html` files (e.g. `/thanks.html`) alongside `<route>/index.html`. Falling back to both keeps the local server compatible with the actual `out/` layout.
   - **Resolution:** Server tries `<path>.html` first, then `<path>/index.html`. Defense-in-depth; doesn't affect the homepage path the OG screenshot actually uses.

5. **[Decision] Generator + icon files keep the `D-20` oklch source-of-truth comments alive.**
   - **Found during:** Task 1.
   - **Issue:** Plan said "drop the `fontSize`, `letterSpacing`, `fontFamily`, `color` props" — done. But the existing oklch comments are part of D-20 traceability and have value beyond text rendering. Kept them.
   - **Resolution:** Both `icon.tsx` and `apple-icon.tsx` retain the oklch comment block + `void` references for compile-time grep-ability.

No architectural deviations (no Rule 4 events).

## Authentication Gates

None.

## Threat Surface

All threats from the plan's `<threat_model>` register were honored:

- **T-7-04 (Tampering, accept):** `generateMandala` is pure; seed source is repo write access, already protected.
- **T-7-05 (Information Disclosure, mitigate):** Pending — Task 4 human-verify will eyeball the screenshot for unintended content.
- **T-7-06 (Tampering, mitigate):** Local server binds to `127.0.0.1:4173` only; Content-Type whitelist; serves only files under `out/` (path containment check via `safeJoin`).
- **T-7-07 (DoS, accept):** ~30–60s added to deploy; acceptable.
- **T-7-SC (Supply chain, mitigate):** No new packages added — Package Legitimacy Gate not triggered.

No new threat flags discovered.

## Known Stubs

None.

## Open Follow-ups

1. **Append BRAND-01, BRAND-02, BRAND-03 to `.planning/REQUIREMENTS.md`** before Phase 7 verification closes. The plan introduced these IDs but the requirements doc has not yet been updated. Suggested one-liners:
   - **BRAND-01:** Favicon is a deterministic mandala seeded from the build commit SHA (no AW monogram).
   - **BRAND-02:** OG image at `/og-image.png` is a real 1200×630 screenshot of the live homepage, regenerated on every deploy.
   - **BRAND-03:** OG image is referenced from `src/app/layout.tsx` openGraph metadata and present in the GitHub Pages artifact upload.

2. **Task 4 — Human visual review (checkpoint:human-verify, gate=blocking):**
   - **(A) Favicon legibility:** Local `npm run build && npx serve out -l 3001` → open in Chrome, inspect favicon at 16px (tab) and 32px (DevTools → Network → `icon` → Preview). Confirm mandala reads cleanly, no AW.
   - **(B) OG share preview:** After this PR's GitHub Actions deploy, open `https://axelwaserman.github.io/og-image.png` (must be 200 OK, 1200×630). Validate the social embed on at least two of: opengraph.xyz, X (Twitter) Card Validator, LinkedIn Post Inspector, Discord paste.
   - **Approval rules:** Approve only if BOTH legibility checks pass AND the social embed shows the real homepage screenshot (not 404, not the favicon, not a placeholder).

3. **Optional follow-up — cache the Playwright browser binary in CI** if deploy time becomes painful. Skipped intentionally per plan: keep the change minimal first.

## CI Step Ordering Confirmation

```
build job:
  Checkout
  Setup Node.js
  Configure Pages
  Install dependencies (npm ci)
  Cache .next/cache
  Build Next.js static export
  Install Playwright Chromium      ← NEW
  Generate OG image                ← NEW
  Upload Pages artifact            (path: ./out — picks up regenerated og-image.png)

deploy job: actions/deploy-pages@v5
```

## Local OG Image Output (for Task 4 reference)

- Path: `/Users/axel/code/website/.claude/worktrees/agent-a919e85bbd91f86fa/out/og-image.png`
- Dimensions: 1200×630 (verified via PNG IHDR bytes 16..23)
- Size: 282_389 bytes (within [10_000, 500_000] bound)
- Source: Playwright Chromium screenshot of `http://127.0.0.1:4173/` against the freshly-built `out/`

## Self-Check: PASSED

- `src/lib/mandala.ts` — exists, exports `generateMandala`, `seedFromCommit`, `xorshift32` ✓
- `src/app/icon.tsx` — modified, no `>AW<`, no `fontSize: 22`, imports from `@/lib/mandala` ✓
- `src/app/apple-icon.tsx` — exists, size 180×180, dynamic force-static, imports from `@/lib/mandala` ✓
- `scripts/generate-og-image.mjs` — exists, imports chromium, references 1200/630/og-image.png ✓
- `package.json` — has `og:generate` script, no new deps ✓
- `.gitignore` — excludes both PNG paths ✓
- `.github/workflows/deploy.yml` — has both new steps in correct order ✓
- Commits exist: `7b818c9`, `827ab8a`, `344f27f` ✓ (verified via `git log --oneline`)
- Build passes: `npx tsc --noEmit` exit 0; `npm run build` exit 0; `out/` produced ✓
- Local OG run: `out/og-image.png` 1200×630 282_389 bytes ✓
