---
phase: 07-engineering-philosophy
fixed_at: 2026-06-06T00:00:00Z
review_path: .planning/phases/07-engineering-philosophy/07-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 07: Code Review Fix Report

**Fixed at:** 2026-06-06
**Source review:** .planning/phases/07-engineering-philosophy/07-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (1 Critical + 7 Warnings; 6 Info findings out of scope)
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CR-01: `generateMandala` is non-deterministic across canvas sizes

**Files modified:** `src/lib/mandala.ts`
**Commit:** `fda1feb`
**Applied fix:** Removed all `Math.max` clamps from mandala geometry — `petalRadius`, `strokeWidth`, and the center dot radius now scale strictly proportionally with `canvasSize`. The 32px favicon and the 180px apple-touch icon now produce visually identical mandala families for the same seed. Updated the `generateMandala` JSDoc to document the strict-proportionality contract.

### WR-01: Path traversal mitigation in `safeJoin` is bypassable by symlinks

**Files modified:** `scripts/generate-og-image.mjs`
**Commit:** `5890d75`
**Applied fix:** Made `safeJoin` `async` and used `fs.realpath` to resolve symlinks for both the root and the joined path before checking containment. Falls back to the lexical containment check when the resolved path does not exist (404 case). Updated the single caller in `startStaticServer` to `await` the now-async function.

### WR-02: OG image generation cache key omits `scripts/**`

**Files modified:** `.github/workflows/deploy.yml`
**Commit:** `709f876`
**Applied fix:** Added `scripts/**` to the `hashFiles(...)` inputs of the `.next/cache` cache key so changes to `scripts/generate-og-image.mjs` (and any future build-time scripts) bust the cache.

### WR-03: `waitForReady` swallows errors and can hang past timeout

**Files modified:** `scripts/generate-og-image.mjs`
**Commit:** `af202de`
**Applied fix:** Added a 1s `timeout` option to `http.get` and a `req.on('timeout', ...)` handler that destroys the request and resolves `false`. Removed the unreachable outer `try/catch`. The retry loop is now bounded per-request and exits cleanly when the deadline passes.

### WR-04: `Header` initial scroll state desync

**Files modified:** `src/components/header/Header.tsx`
**Commit:** `29d33c4`
**Applied fix:** Call `onScroll()` once inside `useEffect` so the header reflects the actual `window.scrollY` on mount. Fixes a flash for users arriving via deep-link anchors (`#projects`, `#philosophy`) where the page is already scrolled past 100px.

### WR-05: `pickRandomPair` can return `undefined` when candidates is empty

**Files modified:** `src/lib/mandala.ts`
**Commit:** `3554d22`
**Applied fix:** Added a `candidates.length === 0` guard that returns `CURATED_PAIRS[0]`. Honours the declared `MandalaPair` (non-nullable) return type even if `CURATED_PAIRS` is ever reduced to a single entry equal to `exclude`.

### WR-06: `seedFromCommit` falls back to `'local-dev'` silently

**Files modified:** `src/lib/mandala.ts`
**Commit:** `3ba5f0b`
**Applied fix:** Added a `NODE_ENV=production && CI` check that throws a descriptive `Error` when neither `GITHUB_SHA` nor `VERCEL_GIT_COMMIT_SHA` is present. Local dev builds still fall back to `djb2('local-dev')`. Updated the JSDoc to document the new failure mode.

### WR-07: `Header` brand-mark anchor missing focus indicator

**Files modified:** `src/components/header/Header.tsx`
**Commit:** `955185b`
**Applied fix:** Added the same `focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 hover:text-[var(--color-accent)] hover:underline` classes as the nav links to the `Axel W` brand-mark anchor. Now satisfies WCAG 2.4.7 Focus Visible for keyboard tab order.

## Skipped Issues

None — all in-scope findings were fixed.

## Notes

- The 6 Info findings (IN-01 through IN-06) are **out of scope** for this fix run (`fix_scope: critical_warning`). They remain in `07-REVIEW.md` for future cleanup.
- Verification: TypeScript `tsc --noEmit` clean for all touched files (using main repo's `node_modules` via temporary symlink), Node `--check` clean for `scripts/generate-og-image.mjs`, and the full vitest suite (24 tests across 4 files) passes after all fixes.

---

_Fixed: 2026-06-06_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
