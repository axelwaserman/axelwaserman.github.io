# Phase 2: Content - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all static content sections of the personal website: Hero, CV (work experience, education, skills), and Contact. Add a sticky header with anchor navigation. Wire in scroll-reveal animations and ensure the layout is fully responsive from 320px to 1440px. Phase ends when a recruiter can visit the local dev server and find everything they need to evaluate Axel.

**Does NOT include:** GitHub projects data (Phase 3), deployment (Phase 4), dark mode, blog, or contact form.

</domain>

<decisions>
## Implementation Decisions

### Hero section
- **D-01:** Layout is **left-aligned editorial** — name, title, bio, and CTA links flush left. No centered axis, no two-column split.
- **D-02:** **No photo** — text-only hero. Keeps the typographic, editorial feel aligned with the Instrument Serif/parchment direction.
- **D-03:** Name uses **display scale (`--text-hero`)** — large Instrument Serif statement that commands the first viewport. Title and bio in Sora body size below.
- **D-04:** Hero is **full viewport height (`min-h-screen`)** — recruiter sees only the hero on load, then scrolls into the CV.

### CV content & data
- **D-05:** CV content lives in a **typed data file** at `src/data/cv.ts` — exports `WorkEntry[]`, `EducationEntry[]`, `string[]` for skills. Components receive data as props. Content is decoupled from layout.
- **D-06:** Approximately **3–5 work entries** — standard timeline density.
- **D-07:** CV layout is **two-column**: section label (Work / Education / Skills) anchors the left column at ~20% width; entries fill the right column. Switches to single-column on mobile.
- **D-08:** Bio copy in `src/data/cv.ts` uses a **placeholder** for now — Axel will fill it in before going live.

### Navigation
- **D-09:** Sticky header contains **name on left + section links on right** — "Axel W" as left anchor, links (About, CV, Projects, Contact) on the right.
- **D-10:** On **mobile (< 640px), nav links are hidden** — header shows name only. Single-page layout means natural scroll handles navigation without a hamburger drawer.
- **D-11:** Header starts **transparent** over the hero; gains `--color-surface` background after scrolling past the hero fold. Requires a simple `window.scrollY > threshold` check (no library needed).

### Animation & spacing tokens
- **D-12:** Spacing tokens: **section-level only** — add `--space-section` (section vertical padding, `clamp(4rem, 3rem + 5vw, 10rem)`) and `--radius-card` to `tokens.css`. Use Tailwind's built-in spacing utilities for component-level spacing.
- **D-13:** Scroll-reveal: **very subtle** — `opacity: 0 → 1`, `translateY: 16px → 0`, duration 400ms, ease-out. Triggered by IntersectionObserver. Respects `prefers-reduced-motion` (no transform, instant appear when enabled).
- **D-14:** Animation implementation uses a `useReducedMotion` hook and a reusable `FadeUp` wrapper component (or equivalent CSS class toggle). No animation library — native IntersectionObserver only.

### Claude's Discretion
- Exact `clamp()` value for `--space-section` (guideline: 4rem min, 10rem max)
- `--radius-card` value (guideline: 0.5–1rem)
- Skills section layout within the right column (flat tag list, comma-separated, or grouped by category)
- Exact scroll threshold for header background trigger (guideline: ~100px or hero height)
- Component file structure within `src/components/` (planner decides)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 decisions (locked)
- `.planning/phases/01-foundation/01-CONTEXT.md` — typography (Sora + Instrument Serif), color tokens (warm parchment), token format (`@theme`), file structure (`src/` dir)
- `src/styles/tokens.css` — existing `@theme` tokens; Phase 2 extends this file, does NOT replace it
- `src/app/layout.tsx` — root layout with font variable injection; Phase 2 components render inside this
- `src/app/page.tsx` — section stub placeholders that Phase 2 replaces with real components

### Project planning
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, dependency on Phase 1
- `.planning/REQUIREMENTS.md` — HERO-01, HERO-02, HERO-03, CV-01, CV-02, CV-03, CV-04, INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05 (all assigned to Phase 2)
- `.planning/PROJECT.md` — constraints (GitHub Pages, static export, light theme only), out-of-scope items

### Coding style rules
- `CLAUDE.md` — tech stack, file organization conventions; must read before planning
- `/Users/axel/.claude/rules/web/coding-style.md` — CSS custom properties, naming conventions, semantic HTML
- `/Users/axel/.claude/rules/web/performance.md` — JS < 150kb gzip, CSS < 30kb, `loading="lazy"` for below-fold images, compositor-only animation properties
- `/Users/axel/.claude/rules/web/design-quality.md` — anti-template policy; must demonstrate hierarchy, depth, intentional hover states

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/styles/tokens.css` — `--color-surface/text/accent/muted`, `--text-ui/body/heading/hero`, `--font-body/heading` already defined; Phase 2 adds `--space-section` and `--radius-card` to the same file
- `src/app/layout.tsx` — `Sora` and `Instrument_Serif` font variables injected on `<html>`; all Phase 2 components inherit them via `var(--font-body)` / `var(--font-heading)`
- No components exist yet — `src/components/` is empty

### Established Patterns
- Tailwind v4 `@theme` for all tokens — Phase 2 must follow the same pattern
- `clsx` + `tailwind-merge` installed — use for conditional class composition in components
- Static export constraints — no `use client` unless genuinely necessary; prefer server components for static content

### Integration Points
- `src/app/page.tsx` — Phase 2 replaces the four comment stubs with real `<Hero />`, `<CV />`, `<Projects placeholder />`, `<Contact />` section components
- `src/app/layout.tsx` — Phase 2 adds the `<Header />` component inside the root layout (or directly in `page.tsx` above `<main>`)

</code_context>

<specifics>
## Specific Ideas

- Header scroll behavior: transparent → solid on `window.scrollY > 100` (or hero section height — planner picks)
- Mobile nav: name only below 640px, full links at `sm:` breakpoint and above
- Skills section: flat list — no progress bars (REQUIREMENTS.md is explicit; OUT-OF-SCOPE confirmed)
- CV download: link to `/cv.pdf` (static file in `public/`); Axel provides the PDF before deploy
- CTA links in hero: GitHub, LinkedIn, email (mailto:), CV download — four links in a row

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 2-Content*
*Context gathered: 2026-05-19*
