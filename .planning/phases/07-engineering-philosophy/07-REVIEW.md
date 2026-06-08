---
phase: 07-engineering-philosophy
reviewed: 2026-06-06T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - .github/workflows/deploy.yml
  - scripts/generate-og-image.mjs
  - src/app/apple-icon.tsx
  - src/app/icon.tsx
  - src/app/page.tsx
  - src/components/header/Header.tsx
  - src/components/philosophy/Philosophy.tsx
  - src/components/philosophy/PillarCard.tsx
  - src/data/philosophy.ts
  - src/lib/mandala.ts
findings:
  critical: 1
  warning: 7
  info: 6
  total: 14
status: issues_found
---

# Phase 07: Code Review Report

**Reviewed:** 2026-06-06
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

The phase delivers three coherent slices: an "Engineering Philosophy" section, a deterministic mandala favicon/apple-icon, and a build-time OG image screenshot pipeline run from CI. The code is generally well-structured, uses immutable patterns, and avoids obvious anti-patterns. However, the review surfaced one Critical correctness defect in the deterministic mandala (which is the entire point of this phase's brand asset work), one path-traversal weakness in the static server, and a cluster of warnings around type safety, accessibility, and CI robustness.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: `generateMandala` is non-deterministic across canvas sizes — favicon and apple-icon produce different mandalas for the same commit

**File:** `src/lib/mandala.ts:179-292`
**Issue:** The phase explicitly promises that "Same commit SHA → same mandala family across favicon and apple-touch icon" (see comment in `src/app/apple-icon.tsx:7-8`). The implementation does NOT achieve this. Although both icons call `seedFromCommit()` and feed the same seed into `generateMandala`, the geometry uses canvas-size-dependent quantization in two places that change visual identity:

1. `petalRadius = Math.max(1, canvasSize * 0.04 * (1 - i / ringCount))` — at 32px the inner ring petal radius is `Math.max(1, 32*0.04*(1 - 2/3)) = Math.max(1, 0.426) = 1`, while at 180px the same ring is `Math.max(1, 180*0.04*0.333) = 2.4`. The ratio of inner to outer petals differs across sizes, producing visually distinct mandalas. This is not "consistent visual identity."
2. `strokeWidth = Math.max(0.75, canvasSize / 64)` — at 32px the stroke is clamped to 0.75 (i.e. `32/64 = 0.5` floored to the floor); at 180px it is 2.8125. Stroke-width is not strictly proportional, so line weight relative to petal radius shifts.

The PRNG calls (`prng()` for ringCount, petalCounts, rotationOffsets) are deterministic and identical across sizes — the bug is not in the seed, it is in the geometry mapping. The phase's stated invariant is broken.

**Fix:** Either drop the contract claim, or scale geometry strictly proportionally:

```ts
// Remove the Math.max clamps that diverge at small sizes, OR document them
// honestly as "icon and apple-icon share seed but not pixel-perfect scaling."
const petalRadius = canvasSize * 0.04 * (1 - i / ringCount)
const strokeWidth = canvasSize / 64
```

If the 32px legibility floor is truly required, surface that asymmetry in the contract: rename comments to say "shared seed family, scale-aware rendering," not "consistent visual identity per build."

## Warnings

### WR-01: Path traversal mitigation in `safeJoin` is bypassable by symlinks and Windows path separators

**File:** `scripts/generate-og-image.mjs:45-54`
**Issue:** `safeJoin` decodes the URL, normalizes, and asserts the result starts with `root + path.sep`. Two gaps:

1. If `out/` contains a symlink pointing outside the directory (unlikely in CI but possible if a user runs this locally with custom build steps), `path.normalize` does not resolve symlinks. A request for `/escape/secret.txt` would still resolve under `out/` lexically but `fs.readFile` would follow the symlink. Use `fs.realpath` and re-check containment.
2. On Windows, `path.sep` is `\` while URLs always use `/`. `path.normalize` will convert separators, but the `decodeURIComponent` step happens first — a request like `/..%5Csecret` (encoded `\`) is decoded to `/..\secret`, and on POSIX `path.join` treats `\` as a literal filename byte (safe), but on Windows it becomes a path separator and may escape. The script runs in CI on `ubuntu-latest`, so this is a hardening concern, not an active vulnerability.

**Fix:**
```js
async function safeJoin(root, requestUrl) {
  const urlPath = requestUrl.split('?')[0].split('#')[0]
  const decoded = decodeURIComponent(urlPath)
  const joined = path.normalize(path.join(root, decoded))
  const realRoot = await fs.realpath(root)
  let realJoined
  try {
    realJoined = await fs.realpath(joined)
  } catch {
    realJoined = joined  // file may not exist yet; fall back to lexical check
  }
  if (realJoined !== realRoot && !realJoined.startsWith(realRoot + path.sep)) {
    return null
  }
  return joined
}
```

### WR-02: OG image generation runs after `upload-pages-artifact` cache key is computed but does NOT block deploy when it fails silently

**File:** `.github/workflows/deploy.yml:53-62`
**Issue:** The workflow installs Playwright and runs `npm run og:generate` between `next build` and `actions/upload-pages-artifact`. If `og:generate` fails, the script's `process.exit(1)` at line 178 of `generate-og-image.mjs` will fail the step and abort the job — that part is fine. However:

1. The `og-image.png` is written into `out/` AFTER `next build`. If a future contributor reorders steps or adds caching that restores `out/` from a previous build, the OG image will silently be the previous version. There is no integrity check (e.g., a build-time hash committed alongside `index.html`) that the OG image matches the current HTML.
2. The cache key on line 43 includes `src/**` but not `scripts/**`. Changes to `scripts/generate-og-image.mjs` will not bust `.next/cache`. This is irrelevant for OG correctness (the script doesn't use `.next/cache`), but it is a cache-correctness smell.

**Fix:** Add `scripts/**` to the cache key hash inputs, and consider asserting the OG image's mtime is newer than `out/index.html` before upload.

### WR-03: `waitForReady` swallows errors and can hang well beyond timeout under DNS misconfiguration

**File:** `scripts/generate-og-image.mjs:100-118`
**Issue:** The retry loop polls every 100ms but `http.get` has no per-request timeout. If the OS resolver hangs on `127.0.0.1` (rare but possible in pathological CI environments), each request can block for ~30s before `req.on('error')` fires, blowing past the 10s deadline. The `try/catch` block is also unreachable — `new Promise` already wraps the inner call, so the outer `try/catch` does nothing.

**Fix:**
```js
const req = http.get(url, { timeout: 1000 }, (res) => { ... })
req.on('timeout', () => { req.destroy(); resolve(false) })
```
And remove the unreachable outer `try/catch`.

### WR-04: `Header` scroll listener has no `prefers-reduced-motion` consideration and triggers re-renders on every scroll past 100px

**File:** `src/components/header/Header.tsx:9-13`
**Issue:** `setScrolled(window.scrollY > 100)` is called on every scroll event. React bails out when the boolean doesn't change, so this is functionally fine — but the `onScroll` handler runs on every frame the user scrolls, and there is no `requestAnimationFrame` throttle. More importantly, the initial render assumes `scrolled = false`, which is wrong if the user lands on a deep-link anchor (`#projects`) where the page is already scrolled past 100px. The header will render in the unscrolled (transparent) state, then snap to the scrolled (surface) state after the first scroll event — a CLS/flash.

**Fix:**
```tsx
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 100)
  onScroll()  // sync initial state to actual scroll position
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```

### WR-05: `pickRandomPair` crashes if `exclude` matches the only-remaining curated pair, and silently returns `undefined` when called with an empty curated set

**File:** `src/lib/mandala.ts:79-89`
**Issue:** `CURATED_PAIRS` currently has 6 entries, so this is dormant. But the function has no guard: if a future change reduces `CURATED_PAIRS` to a single entry equal to `exclude`, `candidates.length === 0`, `Math.floor(rng() * 0) === 0`, and `candidates[0]` returns `undefined`. The function's return type is `MandalaPair`, not `MandalaPair | undefined`, so the type system is lying. This is the kind of latent bug that bites years later.

**Fix:**
```ts
export function pickRandomPair(
  exclude?: MandalaPair,
  rng: () => number = Math.random,
): MandalaPair {
  const candidates =
    exclude === undefined
      ? CURATED_PAIRS
      : CURATED_PAIRS.filter((pair) => !isSamePair(pair, exclude))
  if (candidates.length === 0) {
    // Safe fallback when caller excludes the only remaining pair.
    return CURATED_PAIRS[0]
  }
  const index = Math.floor(rng() * candidates.length)
  return candidates[index]
}
```

### WR-06: `seedFromCommit` falls back to `'local-dev'` silently — local builds will always emit the same mandala, masking real CI/local divergence

**File:** `src/lib/mandala.ts:147-151`
**Issue:** When `GITHUB_SHA` and `VERCEL_GIT_COMMIT_SHA` are both unset, the function returns `djb2('local-dev')`. This is documented as intentional, but it has a subtle consequence: a developer reviewing the favicon locally sees one mandala, while CI emits a different one for every commit. There is no warning or telemetry that the fallback fired, so a developer who breaks `process.env.GITHUB_SHA` plumbing in CI (e.g. by switching to a self-hosted runner that doesn't inject it) will not notice — the build will succeed and the favicon will quietly become the same `'local-dev'` mandala on every push.

**Fix:** Either log a warning to stderr when the fallback is used, or thread the SHA via an explicit env var the workflow controls (e.g. `BUILD_COMMIT_SHA`) and fail the build if absent in production:
```ts
export function seedFromCommit(): number {
  const sha = process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA
  if (!sha) {
    if (process.env.NODE_ENV === 'production' && process.env.CI) {
      throw new Error('seedFromCommit: no commit SHA in CI build')
    }
    return djb2('local-dev')
  }
  return djb2(sha)
}
```

### WR-07: `Header` nav links rely on `href="#hero"` but there is no visible focus indicator on the brand-mark anchor

**File:** `src/components/header/Header.tsx:23-28`
**Issue:** The nav `<a>` elements have explicit `focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2` classes, but the brand-mark anchor (`Axel W`, line 23-28) does not. Keyboard users tabbing into the page hit the brand-mark first and get no visible focus state — failing WCAG 2.4.7 Focus Visible. Same anchor also uses `font-[var(--font-heading)]` which is a Tailwind arbitrary-value class; depending on Tailwind v4 parsing this may emit `font-family: var(--font-heading)` or be silently dropped. Verify in the rendered DOM.

**Fix:** Add the same focus classes to the brand mark, and consider extracting the repeated `focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 hover:text-[var(--color-accent)] hover:underline` block into a single class via `@apply` or a shared component to satisfy DRY.

## Info

### IN-01: Dead `void` references on `SURFACE_OKLCH` constants exist solely to keep the names in source

**File:** `src/app/icon.tsx:32-35`, `src/app/apple-icon.tsx:20`
**Issue:** The `void SURFACE_OKLCH` / `void TEXT_OKLCH` / `void ACCENT_OKLCH` statements exist only so the constants survive tree-shaking for "D-20 traceability." This is a code smell — using `void` to defeat the optimizer is a workaround for missing documentation infrastructure. The same intent could be served by a JSDoc comment block or a single `TOKEN_TRACEABILITY` exported const.

**Fix:** Replace with a single comment-block or a typed export consumed by docs tooling:
```ts
/** D-20 traceability: tokens.css source values. */
export const D20_TOKENS = {
  surface: 'oklch(97% 0.01 75)',
  text: 'oklch(18% 0.01 75)',
  accent: 'oklch(62% 0.19 55)',
} as const
```
Then drop the `void` lines.

### IN-02: `Philosophy` `<ul role="list">` with `role="list"` is a workaround for Safari's removal of list semantics when `list-style: none` is applied

**File:** `src/components/philosophy/Philosophy.tsx:20`
**Issue:** Adding `role="list"` to a `<ul>` is a known Safari workaround. It is correct here, but worth a one-line comment so a future contributor doesn't "clean it up."

**Fix:** Add `// Safari strips list semantics from <ul> with list-style:none — keep role="list".` above the element.

### IN-03: Hardcoded magic numbers in mandala generation

**File:** `src/lib/mandala.ts:186, 191-192, 206, 207, 230`
**Issue:** Several magic numbers are inlined: `3 + Math.floor(prng() * 3)` (ring count range), `6 + Math.floor(prng() * 7)` (petal count range), `canvasSize * 0.45` (max radius), `canvasSize / 64` (stroke divisor), `canvasSize * 0.04` (petal radius). These are tunable visual parameters and should be named constants at module scope so a designer can find them.

**Fix:**
```ts
const MIN_RINGS = 3
const MAX_RINGS = 5
const MIN_PETALS_PER_RING = 6
const MAX_PETALS_PER_RING = 12
const MAX_RADIUS_RATIO = 0.45
const PETAL_RADIUS_RATIO = 0.04
const STROKE_DIVISOR = 64
```

### IN-04: `generate-og-image.mjs` uses `process.cwd()` for path resolution, which is brittle if the script is invoked from a non-root directory

**File:** `scripts/generate-og-image.mjs:16-17`
**Issue:** `path.resolve(process.cwd(), 'out')` requires the script to be run from the repo root. `npm run og:generate` always runs from the package root, so this works in practice, but `import.meta.url`-relative resolution would be more robust:

**Fix:**
```js
import { fileURLToPath } from 'node:url'
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.resolve(REPO_ROOT, 'out')
const PUBLIC_DIR = path.resolve(REPO_ROOT, 'public')
```

### IN-05: `MandalaResult.params` is returned but never consumed by callers

**File:** `src/lib/mandala.ts:120-123, 195-202`
**Issue:** `generateMandala` returns `{ children, params }` but both call sites (`src/app/icon.tsx:38` and `src/app/apple-icon.tsx:23`) destructure only `children`. The `params` field exists with no consumer. Either remove it (YAGNI) or wire it into a snapshot test that asserts determinism.

**Fix:** If a snapshot test is planned, add it. Otherwise drop the `params` field from the result.

### IN-06: Comment claims `output: 'export'` requires `dynamic = 'force-static'` for the icon route, which overstates a Next.js behavior

**File:** `src/app/icon.tsx:13-15`
**Issue:** The comment asserts that without `dynamic = 'force-static'`, the build fails with a specific error. In Next.js 15+, file-based metadata routes (`icon.tsx`, `apple-icon.tsx`) are static-by-default under `output: 'export'`; the explicit `force-static` is belt-and-braces, not strictly required. The comment may mislead a future contributor debugging a related issue.

**Fix:** Soften the comment to "Belt-and-braces — explicitly mark as static so the route never accidentally becomes dynamic when imports change."

---

_Reviewed: 2026-06-06_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
