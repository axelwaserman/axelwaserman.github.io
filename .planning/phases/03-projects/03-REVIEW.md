---
phase: 03-projects
reviewed: 2026-06-02T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - e2e/uat-phase-03.spec.ts
  - src/app/page.tsx
  - src/components/projects/ProjectCard.tsx
  - src/components/projects/Projects.tsx
  - src/components/projects/ProjectsEmptyState.tsx
  - src/components/ui/FadeUp.tsx
  - src/data/projects.json
  - src/data/projects.ts
  - src/lib/date.ts
  - src/lib/projects.ts
  - tests/unit/date.test.ts
findings:
  critical: 1
  warning: 6
  info: 6
  total: 13
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-06-02
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Phase 3 implements the GitHub-driven Projects section with a server-only fetch wrapper, a presentational `ProjectCard`, an empty-state fallback, and a Phase-3 UAT spec. The team materially addressed the prior critical findings: `FadeUp` now emits `data-fadein` (closing C-1), `src/lib/projects.ts` carries `import 'server-only'` and validates the `homepage` URL scheme via `isHttpUrl` (closing C-2 / C-3), `pushedAt` is typed as `string | null` and `formatRelativeDate` gracefully handles every null/invalid path (closing H-8), `description?.trim()` is in place (closing M-13), and the Repo-link locator is now role-based (closing H-9). The `console.warn` is sanitized to `error.name` only (closing H-5), and pagination is implemented with a hard `MAX_PAGES=5` ceiling (partially addressing H-6).

What survives review is one critical correctness gap (UAT-2's archived-repo assertion is structurally vacuous), several warnings around the data-validation boundary in `fetchProjects`, and a handful of code-quality issues. Notably, the static `ARCHIVED_REPO_NAMES = []` array in the UAT spec means UAT-2 currently iterates over an empty list and asserts nothing, even though the comment claims it "must be re-run whenever this file is touched" — there is no enforcement of that obligation. A second material issue: the `disabled` and `fork` fields are dereferenced as booleans without being part of the entry-shape validator, so a payload missing those keys silently coerces `undefined !== false` and the repo gets filtered out — defensive in practice, but it produces silent under-reporting that the test suite cannot detect.

## Critical Issues

### CR-01: UAT-2 archived-repo assertion is structurally vacuous

**File:** `e2e/uat-phase-03.spec.ts:20,58-70`
**Issue:** `ARCHIVED_REPO_NAMES` is hardcoded to `[]` with a comment instructing the executor to re-run the live API check whenever the file is touched. Because the array is empty, the for-loop on line 65 iterates zero times and the only remaining assertion (line 69) merely confirms that every rendered card has a non-empty `<h3>` text — which is not a test of "archived repos do not appear." This is the same class of green-test-that-proves-nothing pattern that REVIEW C-1 was raised to close: the test will continue to pass even after Axel archives a repo and forgets to update the constant. The "live check on 2026-06-02 returned [] archived repos" only documents the state at one point in time and offers no mechanism to detect drift.

Compounding this: if Axel ever archives a repo without updating `ARCHIVED_REPO_NAMES`, the production filter in `src/lib/projects.ts:86` will correctly exclude it, but UAT-2 will not catch a regression in that filter (e.g., if `r.archived === false` is accidentally inverted). The test asserts nothing meaningful about the filter's behaviour.

**Fix:** Either (a) compute the archived set at test time by hitting the GitHub API in a `beforeAll` (skip if rate-limited and emit a Playwright warning so the gap is visible), or (b) add a positive control — fixture-mock a known-archived repo into the fetch path and assert it is *not* in `renderedNames`. Option (b) is preferable because it does not depend on network state. Without one of these, UAT-2 should be removed and the archived-filter coverage moved to a unit test in `tests/unit/projects.test.ts` that calls `fetchProjects` against a stubbed `fetch` returning a mix of archived/non-archived entries.

```ts
// Suggested unit-test sketch (tests/unit/projects.test.ts)
test('fetchProjects: archived repos are filtered out', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify([
    { name: 'a', html_url: '...', archived: true,  disabled: false, fork: false, ... },
    { name: 'b', html_url: '...', archived: false, disabled: false, fork: false, ... },
  ]), { status: 200, headers: { 'content-type': 'application/json' } })
  const result = await fetchProjects()
  assert.deepEqual(result.map(r => r.name), ['b'])
})
```

## Warnings

### WR-01: `disabled` and `fork` are referenced as booleans but not validated by the entry-shape guard

**File:** `src/lib/projects.ts:72-78,86`
**Issue:** The validator on lines 72-77 only accepts entries where `name`, `html_url`, and `archived` are well-typed. The subsequent filter on line 86 reads `r.disabled === false && r.fork === false`. If a payload arrives where `disabled` or `fork` is missing or non-boolean (e.g., GitHub adds a new repo type, or the API response shape drifts), the access yields `undefined`, the strict-equality check returns `false`, and the repo is silently dropped. The user never sees the repo, and the test suite cannot detect the loss because `projects.json` fallback is only triggered on `throw`, not on "every entry got filtered."

This also conflates two different failure modes: a malformed entry (which `continue` is documented to handle) versus a well-formed entry missing one optional-looking field (which currently silently fails closed).

**Fix:** Extend the validator to require all dereferenced booleans:
```ts
if (
  typeof e.name !== 'string' ||
  typeof e.html_url !== 'string' ||
  typeof e.archived !== 'boolean' ||
  typeof e.disabled !== 'boolean' ||
  typeof e.fork !== 'boolean'
)
  continue
```
Then the filter on line 86 is provably operating on a fully-typed `GitHubRepo`.

### WR-02: `fetch` calls have no timeout — a hung GitHub response stalls `next build` indefinitely

**File:** `src/lib/projects.ts:65`
**Issue:** `await fetch(nextUrl, { headers })` has no `signal` passed and no `AbortController`. If GitHub TCP-accepts the connection but never responds (a real failure mode during regional outages), `next build` hangs until the process is killed. CI builds have job-level timeouts, but local builds will block indefinitely; worse, the timeout cost compounds across the up-to-5 paginated requests.

**Fix:** Add an `AbortController` per-request with a sensible budget (e.g., 10 seconds):
```ts
const controller = new AbortController()
const timer = setTimeout(() => controller.abort(), 10_000)
try {
  const res = await fetch(nextUrl, { headers, signal: controller.signal })
  // ...
} finally {
  clearTimeout(timer)
}
```
A timeout-induced abort throws, which falls into the existing catch and triggers the JSON fallback — exactly the desired behaviour.

### WR-03: `projectsFallback` JSON is read at build time without runtime validation

**File:** `src/lib/projects.ts:5,113`
**Issue:** `projects.json` is imported as a typed JSON module and cast via `as unknown as Project[]`. There is no runtime check that fields conform to the `Project` shape — in particular, no `isHttpUrl` validation on `homepage` values from the JSON. If a future commit introduces a malformed entry (e.g., `"homepage": "javascript:alert(1)"`), the same `javascript:` URL execution hole that REVIEW C-3 closed for the live-fetch path is reopened on the fallback path. The live-API path validates; the JSON path doesn't. Defense should be uniform across both data sources.

**Fix:** Run the same normalization the live-fetch path uses on `projectsFallback` before returning:
```ts
return (projectsFallback as unknown[]).map((raw): Project => {
  const r = raw as Record<string, unknown>
  return {
    name: typeof r.name === 'string' ? r.name : '',
    description: typeof r.description === 'string' && r.description.length > 0 ? r.description : null,
    language:    typeof r.language === 'string' && r.language.length > 0 ? r.language : null,
    pushedAt:    typeof r.pushedAt === 'string' && r.pushedAt.length > 0 ? r.pushedAt : null,
    repoUrl:     typeof r.repoUrl === 'string' ? r.repoUrl : '',
    homepage:    isHttpUrl(r.homepage) ? r.homepage : null,
  }
}).filter((p) => p.name && p.repoUrl)
```
Better still: lift `isHttpUrl` out of the `try` block (it does not need closure access to anything inside the try) and reuse it.

### WR-04: `repoUrl` from the live API is not scheme-validated

**File:** `src/lib/projects.ts:104`
**Issue:** REVIEW C-3 added `isHttpUrl` validation for `homepage` because user-controlled. The same protection is not applied to `raw.html_url` because the prior review reasoned "html_url is server-issued by GitHub." That argument is correct *when GitHub is honest*. However, the entry-shape guard on lines 72-77 only checks `typeof e.html_url === 'string'` — it does not check the URL has an `http(s):` scheme. If GitHub ever returned a malformed entry (or a test fixture leaked through), `repoUrl` could be `"javascript:..."` and would render as an `href` attribute on lines 28-32 of `ProjectCard.tsx`. Symmetric defense costs nothing.

**Fix:** Reuse `isHttpUrl` for `repoUrl`: in the `.map(...)` block, return the entry only if `isHttpUrl(raw.html_url)`; otherwise drop it.

### WR-05: `console.warn` violates the project's "no console.* in production code" rule despite the eslint-disable comment

**File:** `src/lib/projects.ts:108-112`
**Issue:** The project rule (TypeScript coding-style.md) states: "No `console.log` statements in production code." `src/lib/projects.ts` runs at build time only, but it is shipped in the source tree and the eslint rule is suppressed via inline comment. A future refactor that imports `fetchProjects` into a Client Component would compile (lint passes due to the disable), and the `console.warn` would land in the browser. The `import 'server-only'` guard prevents this at runtime, but the lint disable removes the static-analysis safety net.

**Fix:** Replace the eslint-disable with a project-local logger module (e.g., `src/lib/log.ts`) that no-ops on the client and forwards to `console.warn` only on the server, OR keep the `console.warn` but remove the inline disable and add a per-file eslint override in `eslint.config.*` so the exception is centrally documented and reviewable.

### WR-06: `formatRelativeDate` may emit "0 days ago" at exact 24h boundaries due to float drift

**File:** `src/lib/date.ts:14,28`
**Issue:** When `deltaMs === 24 * 60 * 60 * 1000` exactly (i.e., precisely 24 hours), the line-12 check `deltaMs < 24 * 60 * 60 * 1000` is false, falling into the days branch. `days = 1.0`, `Math.floor(years) = 0`, `Math.floor(months) = 0`, so the final branch produces `formatter.format(-1, 'day')`. With `numeric: 'auto'`, `Intl.RelativeTimeFormat` emits `"yesterday"` for `-1, 'day'`, which is fine. However at `deltaMs = 24*60*60*1000 - 1` we get "today", and at `deltaMs = 24*60*60*1000` we jump to "yesterday" — discontinuous but acceptable.

The real concern: at very small deltas where clock skew matters (e.g., 23h59m59s), the rendered string is "today"; at 24h00m01s, it becomes "yesterday." This is the documented Intl behaviour and not a bug per se, but the unit test (`tests/unit/date.test.ts`) does NOT cover the 24h-boundary transition. A future refactor of the `< 24h` short-circuit may regress without a test.

**Fix:** Add boundary tests:
```ts
test('formatRelativeDate: exactly 24h ago returns yesterday', () => {
  assert.equal(formatRelativeDate('2026-06-01T12:00:00Z', NOW), 'yesterday')
})
test('formatRelativeDate: 23h59m ago returns today', () => {
  assert.equal(formatRelativeDate('2026-06-01T12:00:01Z', NOW), 'today')
})
```
Same applies for the year/month thresholds (29d / 30d, 364d / 365d). Coverage for `formatRelativeDate` is currently 6 cases for 5 distinct branches — boundary coverage is missing.

## Info

### IN-01: UAT-3 vacuity check is loose and may silently mask drift

**File:** `e2e/uat-phase-03.spec.ts:107-119`
**Issue:** The `checkedCount > 0` assertion ensures *at least one* card matched a fallback entry. As `projects.json` ages and the live fetch returns fresher data, the overlap shrinks, but the test stays green as long as one repo URL still matches. This was raised as M-11 in the prior review and accepted, but worth tracking: the documented mitigation ("update STATE.md") has not been implemented in this codebase.

**Fix:** Tighten to `expect(checkedCount).toBeGreaterThanOrEqual(Math.floor(cards.length / 2))` to fail loudly if more than half the rendered cards no longer match the fallback. Alternatively, add a dedicated unit test that compares fallback `repoUrl` set against current API output during CI.

### IN-02: Magic numbers in pagination logic should be named constants

**File:** `src/lib/projects.ts:8-9,60`
**Issue:** `PER_PAGE = 100` and `MAX_PAGES = 5` are module-level constants (good), but the implicit cap of 500 repos is documented only in the error message. A reader has to multiply to discover the threshold. Same applies to the request timeout when WR-02 is addressed.

**Fix:** Add `const MAX_REPOS = PER_PAGE * MAX_PAGES // 500` and reference it in the error message.

### IN-03: `<time dateTime>` only renders when `relative` is non-empty — accessibility loses an opportunity

**File:** `src/components/projects/ProjectCard.tsx:18-20`
**Issue:** When `pushedAt` is present but `formatRelativeDate` returns `''` (e.g., invalid ISO), the `<time>` element does not render at all. Screen readers and crawlers therefore see no machine-readable timestamp. The fix is cheap and improves SEO/accessibility.

**Fix:** Render `<time dateTime={project.pushedAt}>` whenever `project.pushedAt` is a valid string, with the human-readable text as fallback content; show "—" or omit visually if `relative` is empty but keep `dateTime` for crawlers.

### IN-04: `ProjectCard` link `aria-label` strings can produce awkward text for repos named with trailing punctuation

**File:** `src/components/projects/ProjectCard.tsx:31,41`
**Issue:** `aria-label={`View ${project.name} repository on GitHub`}` produces e.g. "View axelw.github.io repository on GitHub" — fine. For a repo named `"react?"` it becomes `"View react? repository on GitHub"`. Not a defect, but the brittleness suggests the labels should use a punctuation-tolerant template or quote the name (`"View 'react?' repository..."`). Pedantic.

**Fix:** Either accept as-is or wrap the name: ``View "${project.name}" repository on GitHub``.

### IN-05: `axelw` username is hardcoded in five+ files (REVIEW L-16 unaddressed)

**File:** `src/components/projects/ProjectsEmptyState.tsx:10`, `src/components/contact/Contact.tsx:25,33`, `src/components/hero/Hero.tsx:24,32`, `src/lib/projects.ts:7`, `e2e/uat-phase-03.spec.ts:19,86`, `src/data/projects.json` (multiple)
**Issue:** Prior review L-16 noted this; the implementation introduced `GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? 'axelw'` in `src/lib/projects.ts` but did not extract a shared constant module. A username change still requires multi-file edits.

**Fix:** `src/lib/handles.ts` exporting `export const GITHUB_HANDLE = 'axelw' as const` and importing across consumers. Note: the empty-state link to the website's own repo is a special case — that one *should* stay relative to the deploy URL, not derived from the handle.

### IN-06: UAT-6 grid-track count regex remains fragile (REVIEW L-15 partially addressed)

**File:** `e2e/uat-phase-03.spec.ts:188,198`
**Issue:** A positive `display === 'grid'` check now precedes the track count (lines 184-187, 195-198), which mostly closes L-15. However, the split regex `/\s+(?=[\d(])/` still produces `["none"]` (length 1) for `gridTemplateColumns: 'none'` (which Tailwind never emits, but a misconfigured token override might). False-positive risk at 320px is low but non-zero.

**Fix:** Add `expect(cols).not.toBe('none')` before the split, OR replace the split with `cols.split(/\s+/).filter(t => /^\d|^minmax|^repeat|^\(|^[a-z]+\(/i.test(t)).length`.

---

_Reviewed: 2026-06-02_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
