# Phase 5: Polish - Context

**Gathered:** 2026-06-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Take the live deploy from "wired up" to "ready to share" by closing four pre-launch polish items: a favicon visible in the browser tab; a deliberate algorithmic mandala visual integrated into the hero; real CV content sourced from `assets/CV.typ` (no placeholder text, working personal links); and a successful live GitHub fetch at build time so the projects section renders Axel's real public repos rather than the committed `axelw` placeholder fallback.

**Does NOT include:**
- A site-wide visual redesign moving away from the parchment palette (deferred — see Deferred Ideas)
- Editing the wording or structure of `assets/CV.typ` itself (writing/proofread, not engineering)
- New CV / Projects features (filtering, search, language-tag UI, etc.)
- Any new section beyond Hero/CV/Projects/Contact
- Build-time auto-refreshing of the `projects.json` fallback after each successful fetch (deferred)

</domain>

<decisions>
## Implementation Decisions

### Mandala (interactive hero accent)

- **D-01 (placement):** Mandala lives in the **right half of the hero section only**. Hero text stays left-aligned (Phase 2 D-01); mandala fills the right column. Once scrolled past the hero, the mandala is not visible.
- **D-02 (page rebalance):** CV, Projects, and Contact sections are **re-centered** as part of this phase. Today they inherit Phase 2 D-07's two-column "label-anchor / entries-fill" layout — Phase 5 changes them to centered layouts. The exact centering treatment per section is the planner's call (see Claude's Discretion below).
- **D-03 (algorithm):** Mandala is **algorithmically generated** by placing `n` evenly spaced points on a circle and drawing a straight line from each point `i` to point `(i × k) mod n`. Pure SVG `<line>` elements; no animation library, no external math library. Built deterministically at render time from `(n, k)`.
- **D-04 (curated set):** A small **curated set of `(n, k)` pairs** with strong visual character ships in code (planner picks the set — recommend 5–10 pairs spanning cardioid-style, dense star, sparse polygon, etc.). On each page load, one pair is chosen at random.
- **D-05 (interactive controls):** Two **input fields** (number-typed, sensible min/max) for `n` and `k` let the visitor override the seed and re-render the mandala live. A **refresh button** picks a fresh random pair from the curated set.
- **D-06 (scroll reset):** When the user scrolls **past the hero section**, the mandala state resets to a random pair from the curated set — any user-supplied `(n, k)` is discarded. (The mandala is no longer visible at that point, but if the user scrolls back up they see a fresh pattern.)
- **D-07 (scroll-driven motion):** The mandala SVG **rotates proportional to scroll position** via `transform: rotate(...)` on the SVG element. Compositor-only property; scroll listener uses `requestAnimationFrame`. Must not introduce layout thrash. Rotation rate is a tuning value (planner picks; e.g., 1° per N pixels).
- **D-08 (reduced motion):** Respects `prefers-reduced-motion` via the existing `useReducedMotion` hook. When reduced-motion is on: no scroll-driven rotation, mandala renders static. The interactive controls (inputs, refresh button) still work.
- **D-09 (component type):** Mandala is a **Client Component** (`'use client'`) because it owns interactive inputs, scroll-driven rotation, and per-load randomization. The Hero section that hosts it remains a Server Component and embeds the mandala client component.

### Real CV content (sourced from assets/CV.typ)

- **D-10 (single source of truth):** `assets/CV.typ` is the canonical source for CV content. The **website's `src/data/cv.ts` mirrors it verbatim** (same work entries, same education entries, same skills decomposition). No divergence between site and PDF.
- **D-11 (PDF build pipeline):** A **`justfile`** is added at repo root with a `cv` recipe that compiles `assets/CV.typ` → `public/cv.pdf` via `typst compile`. The compiled PDF is **committed to the repo** (not built in CI). Workflow: edit `CV.typ` → run `just cv` → commit both. No new CI dependency on Typst.
- **D-12 (download placements):** Two download links to `/cv.pdf`, both with the `download` HTML attribute:
  - Hero CTA (already present per HERO-03 — wire to `/cv.pdf` if not already, ensure `download` attr)
  - **New** styled "Download CV (PDF)" button at the **end of the experience/CV section**
- **D-13 (WorkEntry interface extension):** `WorkEntry` interface in `src/data/cv.ts` gains a **`bullets: string[]`** field so CV.typ's rich Contentsquare bullets render verbatim on the site. CV component is updated to render bullets under each role's description.
- **D-14 (real bio):** `bio` export in `src/data/cv.ts` = a **1–2-sentence trim** of CV.typ's Professional Summary. Planner drafts; user reviews before commit.
- **D-15 (real title):** `title` export = `'Senior Engineering Manager | Backend & Data'` (from CV.typ contact header).
- **D-16 (skills layout):** `skills` becomes the **three CV.typ groups** (Engineering Leadership / Backend & Systems Architecture / Hands-on Tech Stack) rather than a flat array. The CV.ts skills shape changes — planner picks the new type (e.g., `SkillGroup[]` with `category` + `items`). The CV component renders three sub-lists under the Skills heading.
- **D-17 (contact links — real URLs):**
  - GitHub: `https://github.com/axelwaserman`
  - LinkedIn: `https://www.linkedin.com/in/axel-waserman-9753221a6/`
  - Email: **`<<TBD: email>>`** — Axel must provide before launch. Planner must surface this as an explicit task in PLAN.md and the implementing agent must NOT invent an address. Until provided, the contact section's email link uses a clearly-marked placeholder (or omits the email row); planner picks the safest UX. **PHASE-5 IS NOT DONE until the email value is real.**

### Favicon (typographic monogram)

- **D-18 (mark):** Favicon = **"AW" monogram in Instrument Serif** (matches the site's display font). Classical, editorial. Provisional — to be revisited once the post-Phase-5 visual identity moves away from parchment.
- **D-19 (delivery format):** **`app/icon.tsx`** Next.js convention file using `ImageResponse` + Instrument Serif. Single source, regenerated each build. Confirmed compatible with `output: 'export'`. (Do not also ship `public/favicon.ico` unless legacy support proves necessary during implementation — keep it simple.)
- **D-20 (colors):** Background = `--color-surface` (parchment); text = `--color-text` (dark). Resolved at build time inside `icon.tsx`.

### Live GitHub fetch correctness

- **D-21 (username fix — belt and braces):**
  - Workflow build step gets `GITHUB_USERNAME=axelwaserman` env var
  - Default in `src/lib/projects.ts:7` changes from `'axelw'` to `'axelwaserman'`
  - Belt-and-braces — local builds without the env var still produce the right list.
- **D-22 (verification):** Phase 5 verify step fetches the **live deployed HTML** for `https://axelwaserman.github.io/`, greps for repo names that should appear (live `axelwaserman` repos from `gh repo list axelwaserman --visibility public --no-archived`), and asserts the stale `axelw.github.io` placeholder name from the old fallback **does NOT** appear. Matches Phase 5 SC-4 verbatim.
- **D-23 (full stale-username sweep):** Replace every stale `axelw` reference across:
  - `src/app/layout.tsx` — `metadataBase`, `openGraph.url`
  - `src/components/hero/Hero.tsx` — GitHub + LinkedIn hrefs
  - `src/components/contact/Contact.tsx` — GitHub + LinkedIn hrefs
  - `src/components/projects/ProjectsEmptyState.tsx` — repo URL
  - `src/lib/projects.ts:7` — default username (covered by D-21)
  - `src/data/projects.json` — repo names + URLs (covered by D-24)
  - `.planning/REQUIREMENTS.md` — stale `axelw.github.io` references in headings/INFRA-07 narrative
  - `.planning/PROJECT.md` — quick scan; update any stale references
- **D-24 (refresh fallback snapshot):** During Phase 5 implementation, run the live fetch once and **commit the result as the new `src/data/projects.json` fallback**. Future API-outage builds will then render real (slightly stale) Axel data instead of the `axelw` placeholders. (Auto-refreshing the fallback on every successful build is explicitly **deferred** — out of scope here.)

### Claude's Discretion

- Exact `(n, k)` pairs in the curated mandala set — choose 5–10 with strong visual character (cardioid k=2, star polygons, sparse polygons, etc.).
- Mandala stroke color, stroke width, base opacity, viewBox dimensions — must satisfy the anti-template policy and feel deliberate.
- Mandala rotation rate (degrees per pixel scrolled) — tune for "calm and editorial," not gimmicky.
- Mandala `n` and `k` input min/max bounds and validation behavior on out-of-range input.
- Refresh button visual treatment.
- Centering treatment for CV / Projects / Contact sections (D-02) — a re-centered hero stays editorial; CV likely keeps its two-column structure but centers the whole block; Projects centers its grid container; Contact stacks centered. Planner chooses the consistent treatment.
- WorkEntry rendering: how bullets are formatted (round bullets vs em-dash, indent vs hang).
- `SkillGroup` interface shape (D-16).
- Whether the new "Download CV (PDF)" button at the end of the experience section is full-width on mobile, what icon it uses (if any), and where exactly it sits.
- `app/icon.tsx` exact ImageResponse size and font weight — start from Next.js docs default (32×32) unless there's a reason to override.
- How the email TBD is surfaced in the UI before Axel provides it (planner picks the safest UX — likely omit the email row entirely until provided).
- Test strategy for the mandala component (unit-test the line-pair generator deterministically; visual regression for the rendered SVG at given seeds).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source of truth for CV content
- `assets/CV.typ` — **canonical CV content**. `src/data/cv.ts` mirrors this verbatim (D-10). Compiled to `public/cv.pdf` via `just cv` (D-11).

### Phase 3 decisions (locked, mostly carried forward)
- `.planning/phases/03-projects/03-CONTEXT.md` — Server Component pattern, fallback strategy (D-06 there), card layout, anti-template policy. Phase 5 D-09 deferred mandala becomes Phase 5 here.
- `src/lib/projects.ts` — current GitHub fetcher; Phase 5 fixes username default (D-21).
- `src/data/projects.json` — current fallback (axelw placeholders); Phase 5 refreshes it (D-24).
- `src/data/projects.ts` — Project interface; Phase 5 should not need to modify.

### Phase 2 decisions (locked, mostly carried forward)
- `.planning/phases/02-content/02-CONTEXT.md` — Hero left-aligned editorial layout (D-01 there, preserved for the left half of the hero), FadeUp wrapper, scroll-reveal animation pattern, sticky header with anchor nav, useReducedMotion hook, two-column CV layout (D-07 there — **modified by Phase 5 D-02 in favor of centered sections**).
- `src/components/header/Header.tsx` — sticky nav; no changes expected.
- `src/components/hero/Hero.tsx` — Phase 5 adds the mandala in the right half + fixes axelw links.
- `src/components/cv/` — Phase 5 updates to render bullets, render skill groups, add "Download CV (PDF)" button, re-center.
- `src/components/projects/` — Phase 5 re-centers; live fetch produces real data.
- `src/components/contact/Contact.tsx` — Phase 5 fixes axelw links + handles email TBD + re-centers.
- `src/hooks/useReducedMotion.ts` — must be respected by mandala scroll-driven rotation (D-08).

### Phase 1 decisions (locked)
- `.planning/phases/01-foundation/01-CONTEXT.md` — typography (Sora + Instrument Serif), color tokens (warm parchment), `@theme` token format, `output: 'export'` constraint.
- `src/styles/tokens.css` — design tokens including `--color-surface`, `--color-text`, `--font-heading` (Instrument Serif). Favicon and mandala consume these.
- `src/app/layout.tsx` — root layout with font variables; Phase 5 fixes axelw metadata.

### Phase 4 (deploy workflow) — adjacent
- `.github/workflows/` — Phase 5 D-21 adds `GITHUB_USERNAME=axelwaserman` env var to the build step. Do not regress Phase 4 decisions (cron schedule, configure-pages topology, action versions).

### Project planning
- `.planning/ROADMAP.md` — Phase 5 goal, 4 success criteria, dependency on Phase 4.
- `.planning/REQUIREMENTS.md` — no new REQ-IDs; Phase 5 is goal-derived polish. Stale `axelw.github.io` references must be updated as part of D-23.
- `.planning/PROJECT.md` — constraints (GitHub Pages, static export, light theme, no CMS).

### User memory (relevant)
- `/Users/axel/.claude/projects/-Users-axel-code-website/memory/reference_github_repo.md` — confirms `axelwaserman` (not `axelw`) is the correct username; user-page repo at `axelwaserman.github.io`.
- `/Users/axel/.claude/projects/-Users-axel-code-website/memory/feedback_phase_pr_workflow.md` — push + open PR after subagent validates each phase.

### Coding style rules
- `CLAUDE.md` — tech stack, file organization, project conventions.
- `/Users/axel/.claude/rules/web/coding-style.md` — CSS custom properties, naming conventions, semantic HTML, file organization by feature.
- `/Users/axel/.claude/rules/web/performance.md` — JS < 150kb gzip, compositor-only animation properties (mandala rotation must comply).
- `/Users/axel/.claude/rules/web/design-quality.md` — anti-template policy applies to the mandala, the favicon, and the centered section layouts.
- `/Users/axel/.claude/rules/web/security.md` — `download` attribute on PDF link, no `dangerouslySetInnerHTML`.

### External docs (planner / researcher should consult)
- Next.js `app/icon.tsx` convention with static export — confirm `ImageResponse` works under `output: 'export'`.
- Typst CLI — `typst compile` invocation for the `justfile` recipe.
- Modulus circle / Times-Tables-on-a-Circle pattern (Mathologer-style) — research for tasteful curated `(n, k)` pairs.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/FadeUp.tsx` — sections re-centered in D-02 stay wrapped in FadeUp (consistent with prior phases).
- `src/hooks/useReducedMotion.ts` — mandala scroll rotation gates on this (D-08).
- `src/lib/projects.ts` — fetcher logic is sound; only the username default needs to change (D-21). Do not over-edit; preserve the pagination, fork/archive/disabled filter, sort, and fallback path.
- `src/lib/date.ts` — relative date formatter for projects; no changes.
- `src/data/projects.ts` — `Project` interface; no changes expected.
- `src/styles/tokens.css` — `--color-surface`, `--color-text`, `--color-accent`, `--color-muted`, `--font-heading` (Instrument Serif), `--font-body` (Sora). Favicon and mandala consume these directly.
- `src/data/cv.ts` — current shape (`bio`, `title`, `WorkEntry[]`, `EducationEntry[]`, `string[]` skills) — Phase 5 extends `WorkEntry` (D-13) and changes the skills shape (D-16).

### Established Patterns
- **Server Components for static data; Client Components only when needed** — mandala is the first Client Component in this codebase (D-09). Hero stays a Server Component and embeds the mandala client component.
- **Named exports in data files** — `cv.ts` uses named exports; preserve.
- **Native IntersectionObserver + CSS only** — mandala rotation must follow this rule (no GSAP, no Framer Motion). Use `requestAnimationFrame` + `transform: rotate()`.
- **`import 'server-only'` on fetcher** — `src/lib/projects.ts` already enforces this; preserve when editing line 7.
- **Tailwind v4 `@theme`** — favicon `ImageResponse` cannot use Tailwind directly; pull values from `tokens.css` literals or duplicate the two color values inline (`--color-surface` ≈ a known oklch value; planner reads tokens.css and inlines).

### Integration Points
- `src/app/layout.tsx` — fix `metadataBase` and OG `url` (axelw → axelwaserman). Add `app/icon.tsx` next to it (D-19).
- `src/components/hero/Hero.tsx` — embed `<HeroMandala />` client component in a right-column flex partition; left column keeps existing content. Fix github + linkedin hrefs.
- `src/components/cv/` — render bullets per WorkEntry (D-13); render skill groups (D-16); add "Download CV (PDF)" button at end (D-12); re-center (D-02).
- `src/components/projects/Projects.tsx` — re-center container (D-02). Live fetch produces real data once D-21 lands.
- `src/components/projects/ProjectsEmptyState.tsx` — fix axelw repo URL.
- `src/components/contact/Contact.tsx` — fix axelw links; surface email TBD per D-17; re-center.
- `.github/workflows/<deploy>.yml` — add `env: GITHUB_USERNAME: axelwaserman` to the build step (D-21).
- New file: `justfile` at repo root (D-11).
- New file: `src/components/hero/HeroMandala.tsx` (or similar; planner picks final path).
- New file: `src/app/icon.tsx` (D-19).

</code_context>

<specifics>
## Specific Ideas

- Mandala visual reference: classic "Times Tables on a Circle" / Mathologer pattern — straight chords from point i to point (i × k) mod n on n evenly-spaced circle points. Common pretty pairs: n=200/k=2 (cardioid), n=200/k=3 (nephroid), n=300/k=5 (5-petal), n=500/k=7. Curated set should span calm sparse → dense star.
- Hero composition: two-column on desktop (left = existing text + CTAs; right = mandala SVG fitting the hero viewport height); on mobile, mandala stacks below or shrinks — planner picks (recommend: mandala visible on mobile too, smaller, possibly above text or inset).
- Mandala input controls: small, unobtrusive, sit beneath or alongside the SVG. Number inputs with explicit `min` / `max` / `step` attributes. Refresh button is a small icon button (e.g., circular arrow) with accessible label.
- CV section centering treatment: keep the visual hierarchy of "section label" then "entries," but center the whole block within the page container — the block can stay internally left-aligned, what changes is its position on the page.
- Favicon: `app/icon.tsx` returning an ImageResponse rendering "AW" centered, Instrument Serif, ~24pt within a 32×32 box.
- "Download CV (PDF)" button visual: prominent enough to be discoverable, restrained enough not to fight the editorial feel. Recommend small download icon + text, on the page's accent color.

</specifics>

<deferred>
## Deferred Ideas

- **Visual identity refresh away from parchment, anchored on the mandala** — Axel wants the post-Phase-5 site to drop the parchment palette in favor of a direction that better fits the mandala. Future phase. Do not preemptively rework tokens in Phase 5.
- **CV content review chat** — before publishing, Axel wants a discussion about CV.typ wording (bullet phrasing, ordering, summary tone). This is writing/proofread work, not Phase 5 engineering. Suggest doing it in a separate conversation before running `just cv` for the production PDF.
- **Auto-refresh `projects.json` on every successful CI build** — instead of a one-time refresh in Phase 5 (D-24), have the workflow commit the latest live fetch back to the repo on each successful build. Adds CI complexity; defer until the one-time refresh proves insufficient.
- **Build-time strict mode that fails the build when fallback is hit** — explicitly out of scope; D-06 from Phase 3 prefers stale data over a broken site.
- **Mandala on mobile breakpoint refinements** — if the planner picks a mobile mandala layout that turns out to feel cramped, refinements live in a follow-up phase.
- **`apple-icon` / multi-size `favicon.ico` for legacy iOS / pinned-tab support** — only `app/icon.tsx` ships in Phase 5. If browser-tab discovery is incomplete after launch, add legacy assets in a follow-up.

</deferred>

---

*Phase: 5-polish*
*Context gathered: 2026-06-04*
