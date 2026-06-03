# Phase 3 — Cross-AI Review Feedback

**Source:** Adversarial peer review by general-purpose subagent (Opus model)
**Reviewer role:** Senior staff engineer, skeptical posture
**Review scope:** All three plans (03-01, 03-02, 03-03), CONTEXT.md, PATTERNS.md, UI-SPEC.md, REQUIREMENTS.md
**Captured:** 2026-06-02

---

## Adversarial Review — Phase 3 (Projects)

### CRITICAL — must fix before execution

1. **UAT-5 reduced-motion check is structurally tautological — copies a broken Phase 2 pattern.**
   - **File/task:** `03-03-PLAN.md` Task 3, UAT-5; `e2e/uat-phase-02.spec.ts:37,48,71`
   - **Failure mode:** `FadeUp.tsx` (file `src/components/ui/FadeUp.tsx`) never emits a `data-fadein` attribute. The selector `el.closest('[data-fadein]') ?? el.parentElement` always falls through to `el.parentElement`, which for `<section id="projects">` is `<main>` — an element with no opacity ever applied, so `getComputedStyle(...).opacity` is always `'1'`. The `expect(parseFloat(op)).toBeGreaterThan(0.9)` assertion passes regardless of whether reduced-motion works, whether FadeUp renders, or whether the fade is broken. This is a green test that proves nothing — exactly the regression Phase 2's commit `368f96a` ("FadeUp invisible under reduced-motion") was supposed to lock. The plan replicates the bug instead of fixing it.
   - **Fix:** Either (a) add `data-fadein` to the wrapper `<div>` in `FadeUp.tsx` and drop the `?? el.parentElement` fallback in the spec, or (b) target `section#projects` itself plus a positive control: assert opacity goes to ≥0.9 on the wrapped section AND that the Hero (no FadeUp wrapper) has opacity 1 throughout (sanity baseline). Without one of these the assertion is tautological.

2. **`process.env.GITHUB_TOKEN` will be statically inlined into the client bundle if the fetch ever runs in client scope, and the plan never asserts the file isn't transitively imported by client code.**
   - **File/task:** `03-01-PLAN.md` Task 1, T-03-01 in threat model
   - **Failure mode:** Next.js inlines `process.env.X` into any module that ends up in the client bundle. `src/lib/projects.ts` is currently only imported by `Projects.tsx` (server), but nothing in the plan or in lint forbids a future Client Component from doing `import { fetchProjects } from '@/lib/projects'`. The acceptance criterion only checks `out/index.html` for `Bearer ` and `GITHUB_TOKEN` substrings — token leaks land in `out/_next/static/chunks/*.js`, which the plan never greps. A grep on HTML alone is the wrong surface.
   - **Fix:** Add `import 'server-only'` at the top of `src/lib/projects.ts` (Next 16 ships this guard package; importing it from a Client Component throws at build). Then add an acceptance criterion: `grep -r "GITHUB_TOKEN\|Bearer " out/_next/static/ | wc -l` returns 0. Both are one-line changes.

3. **`description as JSX text-children` is XSS-safe, but `homepage` and `repoUrl` rendered as `href` attributes have no scheme validation — a `javascript:` URL still executes on user click in modern browsers.**
   - **File/task:** `03-01-PLAN.md` Task 2, T-03-03; `03-03-PLAN.md` T-03-08 ("accept")
   - **Failure mode:** The plan's claim that "`javascript:` URLs in `<a href>` do not execute in modern browsers when `target="_blank" rel="noopener noreferrer"` is set" is **false**. `noopener noreferrer` blocks `window.opener` tampering after navigation; it does not block javascript-scheme execution. Chrome, Firefox, and Safari all execute `<a href="javascript:alert(1)" target="_blank">click</a>` on user click as of 2026. The trust argument ("Axel sets his own homepage") only holds while *Axel's* GitHub account is uncompromised. A single repo settings hijack (or a future contributor with maintainer access) injects a pivot into the rendered site.
   - **Fix:** In the snake-case→camel-case mapper inside `fetchProjects`, validate `homepage` with `try { const u = new URL(raw.homepage); return ['http:','https:'].includes(u.protocol) ? raw.homepage : null } catch { return null }`. Five lines. Same defense for `repoUrl` is unnecessary because `html_url` from GitHub is server-issued, but homepage is not.

### HIGH — should fix before execution

4. **Wave 1 ships a build that hard-fails on any GitHub API error — including the 60 req/hr unauthenticated rate limit on Axel's local machine.**
   - **File/task:** `03-01-PLAN.md` Task 1 action ("If `!res.ok`, throw … This plan does NOT catch the error"); Task 3 acceptance criterion ("If the build fails specifically due to network, the executor should note this in the SUMMARY")
   - **Failure mode:** The "vertical slice" framing is misleading. Between merging Wave 1 and merging Wave 2, any `npm run build` on a developer machine with no `GITHUB_TOKEN` exhausts the 60 req/hr unauthed cap after a couple of rebuilds (each `next build` calls the API once; refresh-driven dev iteration burns the budget fast). The plan acknowledges this in passing but lets the executor "re-run on a network-enabled host" — that is not the same as a working slice. There is no explicit "Wave 1 + Wave 2 must merge atomically" gate.
   - **Fix:** Either (a) merge the try/catch into Wave 1 and seed `projects.json` with a single placeholder so the build cannot fail (then Wave 2 only adds richer fallback data + the forced-401 test), or (b) add a "Wave 1 ships behind a feature flag / does not get merged to main until Wave 2 lands" note to the plan and to `STATE.md`.

5. **The forced-fallback build test in Wave 2 leaks an `Authorization: Bearer …` header into stdout via `error.message` from real GitHub 401 responses.**
   - **File/task:** `03-02-PLAN.md` Task 2 verify command; `03-02-PLAN.md` T-03-06
   - **Failure mode:** GitHub's 401 response body sometimes echoes the auth scheme in its error. More importantly, `console.warn('… fallback:', error instanceof Error ? error.message : error)` formats the raw error which, in some environments, includes the request URL with query strings or undici-internal request frames containing header dumps. The plan asserts that `error.message` is safe — but it never tests that. The mitigation argument relies on "the error.message originates from native fetch (network error strings) or from the explicit `Error('GitHub API ${res.status}')` thrown in the try block" — yet a malformed-JSON path throws `SyntaxError` from `res.json()` whose `.message` includes a snippet of the response body that GitHub may include the request id in. In the placeholder-token case it's likely fine; for general failure modes it isn't audited.
   - **Fix:** Sanitize the warn: only print a known-safe shape. `console.warn('[projects] GitHub fetch failed, using fallback. Reason:', error instanceof Error ? error.name : 'unknown')` — drop `.message` entirely, or whitelist via regex `^(GitHub API \d+|fetch failed|Invalid URL|Unexpected token)$`. Two lines.

6. **D-04 ("all non-archived public repos, no count cap") is silently violated. The fetcher caps at 100 with a `console.warn` nobody will see.**
   - **File/task:** `03-01-PLAN.md` Task 1 ("D-04 ceiling concession"); D-06 console.warn surfacing
   - **Failure mode:** The plan documents the `per_page=100` ceiling as "an accepted concession with a build-time soft warn." The warn lands in CI logs that nobody opens unless the build fails. A user with 101+ repos silently loses their oldest active work, sorted-by-pushed-desc puts the missing ones at end-of-list, so the regression is invisible. The CTX D-04 truth statement *promises* "all non-archived public repos." The plan's dispensation is unilateral — it changed a locked decision without surfacing the change in `03-CONTEXT.md` or `REQUIREMENTS.md`. Same problem with the D-06 fallback warn: the plan never surfaces it in any human-visible channel (e.g. PR comment, deploy summary, GitHub Actions step output `::warning::`).
   - **Fix:** Either (a) implement Link-header pagination — it's a 15-line loop and the plan already names the technique, or (b) properly amend D-04 to "≤100 most-recently-pushed non-archived public repos" in `03-CONTEXT.md` so the contract isn't quietly broken. For D-06: at minimum, prefix the warn with `::warning::` so GitHub Actions surfaces it in the PR check UI. Without that, D-06's "log a warning when the fallback is used" is satisfied only on a literal reading.

7. **Wave 1's ProjectCard uses `focus:` outline; Wave 3 upgrades it to `focus-visible:`. Until Wave 3 lands, keyboard-tab users get an outline on every mouse-clicked card too — not just regressions, an active accessibility regression introduced by this phase.**
   - **File/task:** `03-01-PLAN.md` Task 2 action (`focus:outline-2 focus:outline-[var(--color-accent)]`)
   - **Failure mode:** This is `focus:` (always-on focus ring) being shipped as the MVP, then "polished" away in Wave 3. If Waves 1 and 2 ship to main while Wave 3 is in flight, mouse users see persistent outlines after click. Trivial to avoid.
   - **Fix:** Use `focus-visible:` from the start in Wave 1. The Wave 3 plan literally says "this is new code in Plan 03; do not regress Phase 2 components" — so why not write the new code right the first time? Move the `focus-visible:` decision into Wave 1 Task 2 acceptance criteria; delete it from Wave 3.

8. **`pushedAt` validation accepts `string | null` from the API but the type forbids null. The fetcher will produce `pushedAt: null` cards that crash `formatRelativeDate` (Wave 3) or render `Invalid Date`.**
   - **File/task:** `03-01-PLAN.md` Task 1 action ("at least `name: string`, `html_url: string`, `pushed_at: string`, `archived: boolean`"); UI-SPEC §Component Inventory ("pushedAt: string (ISO)")
   - **Failure mode:** GitHub returns `pushed_at: null` for a brand-new repo with no pushes. The plan's narrowing "validate the minimum required fields are present — at least `pushed_at: string`" is an assertion about the validator, not the data; the plan never specifies what happens when `pushed_at` is null. The mapping `pushed_at → pushedAt` will produce `pushedAt: null` typed as `string`, which is a type lie. Wave 3's `formatRelativeDate(project.pushedAt)` will then call `new Date(null)` → `1970-01-01` → "56 years ago" rendered on the card.
   - **Fix:** Either (a) make `pushedAt: string | null` in `Project` and have `formatRelativeDate(null)` return `''`, or (b) drop the entry from the result if `pushed_at` is null. State this explicitly in Task 1 acceptance criteria.

9. **`href` is `null` if the Repo link locator strategy fails — `expect(repoUrl).toMatch(...)` against `null` throws an unhelpful Playwright error, not the targeted assertion failure.**
   - **File/task:** `03-03-PLAN.md` Task 3 UAT-3 (`const repoUrl = await card.locator('a').first().getAttribute('href')`)
   - **Failure mode:** UAT-3 assumes "Repo link is always first per Plan 01 ProjectCard structure" — but Wave 1 hasn't shipped yet. If a later refactor moves the title into an `<a>` (e.g. a future spike to make the whole card clickable, which D-01 hover state suggests), the first `<a>` becomes the title-link, not the Repo link. The test then validates the wrong URL silently. The accessible name on the Repo link is `View {repo.name} repository on GitHub` — locating by role+name, not by source order, is the invariant that won't break.
   - **Fix:** `const repoLink = card.getByRole('link', { name: /repository on GitHub$/ })` then `expect(await repoLink.count()).toBe(1)` then `getAttribute('href')`. Same idea as the live-demo locator already used in the same test. Two lines.

### MEDIUM — worth addressing in execution

10. **`Intl.RelativeTimeFormat` output regex in UAT-1 will not match Node 22's locale data — it will reject perfectly valid ICU outputs like `"in 1 day"` (positive deltas under clock skew).**
    - **File/task:** `03-03-PLAN.md` Task 3 UAT-1 (regex `/^(...)( · )?(today|yesterday|last (day|...)|\d+ ... ago|in \d+ ...)$/`)
    - **Failure mode:** `formatRelativeDate` clamps negative deltas to 0 → 'today', which the regex accepts. But the ICU output for `numeric: 'auto'` includes phrases like `"last week"` (the regex has `last (day|week|month|year)` — note `day` is an unusual ICU-auto output for -1 days; "yesterday" wins). More problematically, `numeric: 'auto'` produces `"last month"` for -1 month, but the value `-Math.floor(months) === -1` will yield `"last month"` — the regex accepts that — but for some locales/Node versions the unit pluralization differs. The regex is fragile for an end-to-end check.
    - **Fix:** Either drop the format check (the unit test in Wave 3 was deferred — bring it back as a 5-line Vitest or a Node `--test` script run in `verify`), or relax the regex to `/.+/` and check non-empty. The regex form is bug-attractive.

11. **`projects.json` is committed and read at *test* time but mutates during normal development (Axel pushes to a repo → `pushed_at` changes). UAT-3's "vacuity check" demands ≥1 fallback-mapped card; in practice the live fetch returns fresher data than the JSON, so as the JSON ages, fewer rendered cards match.**
    - **File/task:** `03-03-PLAN.md` Task 3 UAT-3 ("`expect(checkedCount, 'at least one rendered card must match a fallback entry — otherwise UAT-3 is vacuous').toBeGreaterThan(0)`")
    - **Failure mode:** The match key is `repoUrl` (i.e. `html_url`), which is stable. So the vacuity check holds as long as the JSON has any repo Axel still owns. Fine in practice. But the assertion documentation says "at least one fallback-mapped card was checked" — if Axel renames a repo (changes `html_url`), the JSON entry's `repoUrl` will not match the live data and UAT-3's strict per-card check passes vacuously for that card while the vacuity guard hides the silence. Edge case but plausible.
    - **Fix:** Document a maintenance step in `STATE.md`: "If you rename a public repo, regenerate `src/data/projects.json`." Or assert `checkedCount >= cards.length / 2` to detect drift earlier.

12. **No `next build` cache key for the GitHub fetch — every CI build hits the API, eating the 1000 req/hr token budget and slowing PR builds.**
    - **File/task:** `03-01-PLAN.md` Task 1 action ("Do not add `cache: 'force-cache'` — Next.js caches build-time fetches by default")
    - **Failure mode:** Next 16 with `output: 'export'` runs the fetch every time `next build` runs from a fresh `.next/cache` (i.e., every PR check, every Actions cron). The "Next caches build-time fetches by default" comment misreads the docs — caching is per-build for repeated *fetches in the same build*, not across builds. So the plan claims a defense it doesn't actually have.
    - **Fix:** Either explicitly accept this (the rate is fine — 1000/hr easily covers daily cron + PRs) or add `next: { revalidate: 3600 }` plus actions/cache for `.next/cache`. Document the choice. Don't claim a caching property that isn't true.

13. **Empty-string `description` is implicitly handled but `description: "   "` (whitespace only, yes this happens) renders an empty `<p>` with bottom margin, producing a visible gap.**
    - **File/task:** `03-01-PLAN.md` Task 2 action (`project.description && project.description.length > 0 &&`)
    - **Failure mode:** `"   "` is truthy and length > 0, so the guard renders the `<p>`. Mostly invisible cosmetically but creates layout drift between cards.
    - **Fix:** `project.description?.trim() &&` — one character changed.

### LOW / pedantic

14. **D-04 says "no count cap"; PATTERNS.md proposes excluding forks; that's a tighter filter than D-04 says.** The plan filters `fork === false` defensively. Probably right, but the decision was never logged. (`03-PATTERNS.md:94` "Keep `fork === false` as well unless the planner deliberately includes forks.") Mention in CONTEXT.md.

15. **UAT-6 320px column count check uses `cols.trim().split(/\s+(?=[\d(])/).length` — fragile against `gridTemplateColumns: 'none'` (would split to `["none"]`, length 1, false-positive pass).** Cribbed from Phase 2; same flaw. Use a positive check on `display: grid` first.

16. **The empty-state hyperlinks to `https://github.com/axelw/axelw.github.io`, but the `Project.repoUrl` filter on UAT-3 only accepts `https://github.com/axelw/...`. If Axel ever changes his GH username, every hard-coded `axelw` substring across 5+ files breaks at once.** Extract to a constant. Pedantic but cheap.

17. **`group-hover:text-[var(--color-accent)]` on the title overlaps with the link's own `hover:text-[var(--color-accent)]` — when hovering the Repo link, both rules apply identically, fine, but it means title color is bound to card-hover even when only the link is interacted with via touch. Minor; tablet UX may feel less precise.**

### What the plan got right

- Pattern mapping (`03-PATTERNS.md`) is unusually thorough — clear analog citations down to file:line for each new component.
- The decision to keep `<a>` per link rather than wrapping the entire card in one `<a>` (UI-SPEC §Interaction "Card itself is **not** wrapped in a single big `<a>`") is correct and not common.
- Eyebrow + visible h2 split (UI-SPEC §Copywriting "Selected work on GitHub") earns the anti-template policy.
- Three-wave decomposition is genuinely incremental: each wave's diff is small and the contracts between them are explicit.
- `import type` discipline is enforced in acceptance criteria, not just prose.
- Wave 2's automated forced-fallback test (invalid `GITHUB_TOKEN` → 401 → catch fires → log substring asserted) is a good deterministic test of D-06.

### Adversarial verdict

Send back for replan of Waves 1 and 3. The CRITICAL findings are not stylistic — finding #1 invalidates the marquee reduced-motion test (it was already broken in Phase 2 and the plan replicates the bug), #2 is a token-leak surface that the acceptance criteria literally fail to inspect, and #3 is a real `javascript:` URL execution hole gated only by trust in the user's GitHub account remaining uncompromised. Wave 1 also ships a deliberately fragile build (HIGH #4) under the "vertical slice" banner. Fix the three CRITICALs, atomically merge Waves 1+2 (or seed a fallback into Wave 1), promote `focus-visible:` to Wave 1, harden `pushedAt` and the Repo-link locator, and the plan is ready. The remaining MEDIUM/LOW items can land during execution.
