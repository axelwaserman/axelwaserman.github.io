# Phase 3: Projects - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Fetch Axel's public GitHub repos at build time via the GitHub REST API and render them as a static Projects section on the page. Each card shows repo name, description, primary language, last pushed date, a link to the repo, and an optional live demo link when `homepage` is set. Archived repos are excluded.

**Does NOT include:** the full-page geometric/mandala animation (deferred), dark mode, search/filtering, GitHub Actions deploy workflow (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Layout
- **D-01:** Responsive **card grid** — multi-column on desktop, single-column on mobile. Must avoid the generic Tailwind card grid look; the planner should push beyond default styling (intentional hierarchy, hover states, editorial feel) per the anti-template policy.
- **D-02:** Projects section is wrapped with the existing `<FadeUp>` component, consistent with CV and Contact sections.

### Data fetching
- **D-03:** GitHub data is fetched at **build time** inside a React Server Component (consistent with all other data-bearing components in this project). No client-side fetch.
- **D-04:** Fetch **all non-archived public repos** — no count cap.
- **D-05:** Sort by **most recently pushed** (`pushed_at` descending).
- **D-06:** On API failure during build, **fall back to a committed `src/data/projects.json`** file. The build should always succeed; stale cached data is preferable to a broken build. Log a warning when the fallback is used.

### Card content
- **D-07:** Each card displays: repo **name**, **description**, **primary language**, **last pushed date** (relative format, e.g. "3 months ago"), **repo link**, and **live demo link** only when the API `homepage` field is set.
- **D-08:** Star count is deliberately **excluded** — the user chose not to include it.

### Animation (deferred)
- **D-09:** The full-page background geometric/mandala animation is **out of scope for Phase 3**. Noted as a deferred Phase 3b idea.

### Claude's Discretion
- Relative date formatting approach (e.g. `Intl.RelativeTimeFormat` vs a lightweight utility vs the `date-fns` package)
- Exact card visual design beyond the grid layout constraint (hover states, shadow depth, language tag styling, etc.) — must satisfy the anti-template policy
- GitHub API endpoint choice (REST `/users/{user}/repos` vs GraphQL) — REST is the established project pattern
- Structure of the `projects.json` fallback file schema
- Component file structure within `src/components/projects/`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 2 decisions (locked)
- `.planning/phases/02-content/02-CONTEXT.md` — Server Component pattern, FadeUp wrapper, design token usage, anti-template policy application
- `src/app/page.tsx` — current page composition; Projects section stub comment shows where to wire in
- `src/styles/tokens.css` — existing `@theme` tokens (`--radius-card`, `--color-surface/text/accent/muted`, type scale); Projects section uses these directly

### Phase 1 decisions (locked)
- `.planning/phases/01-foundation/01-CONTEXT.md` — typography (Sora + Instrument Serif), color tokens (warm parchment), token format (`@theme`)

### Project planning
- `.planning/ROADMAP.md` — Phase 3 goal, success criteria, dependency on Phase 2
- `.planning/REQUIREMENTS.md` — PROJ-01, PROJ-02, PROJ-03 (all assigned to Phase 3)
- `.planning/PROJECT.md` — constraints (GitHub Pages, static export, no client-side fetch, light theme only)

### Coding style rules
- `CLAUDE.md` — tech stack, file organization conventions
- `/Users/axel/.claude/rules/web/coding-style.md` — CSS custom properties, naming conventions, semantic HTML
- `/Users/axel/.claude/rules/web/performance.md` — JS < 150kb gzip, compositor-only animation properties
- `/Users/axel/.claude/rules/web/design-quality.md` — anti-template policy; card design must demonstrate hierarchy, intentional hover states, depth

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/FadeUp.tsx` — scroll-reveal wrapper; Projects section should be wrapped with it
- `src/hooks/useReducedMotion.ts` — if any client-side animation is added to cards (hover effects), this hook must be respected
- `src/styles/tokens.css` — `--radius-card`, `--space-section`, `--duration-reveal`, `--ease-reveal` already defined
- `src/data/cv.ts` — establishes the typed data file pattern for `src/data/projects.ts` or `src/data/projects.json`

### Established Patterns
- **Server Components for data** — Hero, CV, Contact are all Server Components that import from `src/data/`. GitHub fetch follows the same shape: fetch at build time, pass typed data as props to presentational components.
- **Named exports in data files** — `cv.ts` uses named exports (`workEntries`, `skills`, etc.); `projects.ts` (or the fetch function) should follow this.
- **No animation library** — only native IntersectionObserver + CSS transitions. Any card hover animation must stay on compositor properties (`transform`, `opacity`).

### Integration Points
- `src/app/page.tsx` line with `{/* Projects section — Phase 3 */}` — replace this stub with `<FadeUp><Projects /></FadeUp>`
- `src/components/header/Header.tsx` — nav link `#projects` anchor already points to the Projects section; the section element needs `id="projects"`

</code_context>

<specifics>
## Specific Ideas

- No specific library references — user did not specify a particular visual reference for the card design
- Geometric/mandala animation interest noted: the user wants this as a full-page background accent on the landing page. Deferred to its own phase.

</specifics>

<deferred>
## Deferred Ideas

- **Full-page geometric/mandala background animation** — User wants a CSS/JS generative geometric or mandala-style animation as a global ambient background accent across the whole page. This is a standalone visual feature that touches `layout.tsx` or `page.tsx` globally. Recommended as **Phase 3b: Visual** (between Projects and Deploy). Does not block Phase 4 Deploy.

</deferred>

---

*Phase: 3-projects*
*Context gathered: 2026-06-02*
