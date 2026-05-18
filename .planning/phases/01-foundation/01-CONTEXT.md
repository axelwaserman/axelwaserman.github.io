# Phase 1: Foundation - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the project skeleton: `next.config.ts` with static export config, design tokens (colors + type scale) in `src/styles/tokens.css`, font loading in `app/layout.tsx`, and an HTML shell with section placeholders. No visible page content — but every subsequent phase builds on these choices.

**Success criteria (from ROADMAP.md):**
1. `next build` completes without errors and produces an `out/` directory
2. `next.config.ts` has `output: 'export'` and `images: { unoptimized: true }` set
3. Design tokens (palette, type scale) exist in `styles/tokens.css` as CSS custom properties
4. `app/layout.tsx` renders a valid HTML shell with font loading and metadata object in place

</domain>

<decisions>
## Implementation Decisions

### Typography pairing
- **D-01:** Font pairing: **Sora** (body) + **Instrument Serif** (headings) — classic/authoritative editorial direction
- **D-02:** Both fonts load via `next/font/google` — zero runtime Google Fonts requests, self-hosted at build time
- **D-03:** Weights to load: **400, 500, 600, 700** for both families
- **D-04:** Sora is the body/UI font; Instrument Serif is used for headings only
- **D-05:** Custom type scale tokens in `tokens.css` — all type tokens use `clamp()` for fluid responsive scaling. Planner picks the clamp() values.

### Color palette
- **D-06:** Direction: **warm ink / parchment** — off-white background (~oklch 97%), near-black text, warm amber or terracotta accent
- **D-07:** Accent saturation: **medium vibrancy** — oklch chroma ~0.18–0.22
- **D-08:** Color format: **oklch()** throughout — perceptually uniform, aligns with project coding style rules
- **D-09:** Color token set (minimal): `--color-surface`, `--color-text`, `--color-accent`, `--color-muted` — 4 tokens only; expand in Phase 2 if needed

### Design token scope
- **D-10:** Phase 1 tokens: **colors + type scale only** — spacing, radius, and animation tokens are deferred to Phase 2
- **D-11:** When Phase 2 adds spacing tokens, they go into the same `tokens.css` file — all design decisions in one place
- **D-12:** Token format: **Tailwind v4 `@theme` directive** — tokens are available as both Tailwind utility classes (e.g. `bg-accent`, `text-accent`) and CSS custom properties (`var(--color-accent)`)

### Scaffold approach
- **D-13:** Bootstrap via **`create-next-app`** then clean up boilerplate (default page content, globals.css placeholder styles, etc.)
- **D-14:** `app/page.tsx` at end of Phase 1: empty shell with commented section stubs (`{/* Hero */}`, `{/* CV */}`, `{/* Projects */}`, `{/* Contact */}`)
- **D-15:** File structure: **`src/` directory** — `src/app/`, `src/components/`, `src/hooks/`, `src/lib/`, `src/styles/` — aligns with CLAUDE.md file organization rules
- **D-16:** Linting/formatting: **full setup in Phase 1** — ESLint (`next/core-web-vitals`) + Prettier with `.prettierrc`. Hooks fire on every edit.

### Claude's Discretion
- Specific `clamp()` values for all type scale tokens (must be responsive; planner picks sensible ranges)
- Specific oklch values for warm parchment palette (must hit the warm ink direction with medium-vibrancy accent)
- ESLint/Prettier config details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project planning docs
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and dependency order
- `.planning/REQUIREMENTS.md` — INFRA-06 (static export requirement assigned to Phase 1)
- `.planning/PROJECT.md` — constraints (GitHub Pages, `output: 'export'`, `images: { unoptimized: true }`), tech stack decisions, key decisions table

### Technology docs (from CLAUDE.md)
- `CLAUDE.md` — full technology stack decisions, conventions, and file organization rules; MUST read before planning
- Next.js static export: `output: 'export'` + `images: { unoptimized: true }` required (no SSR, no server actions, no ISR)
- Tailwind v4 with `@tailwindcss/postcss` — `@theme` directive for token registration
- `next/font/google` for font loading — fonts downloaded at build time, zero runtime requests
- `clsx` + `tailwind-merge` for class composition

### Coding style rules
- `/Users/axel/.claude/rules/web/coding-style.md` — CSS custom property conventions, file organization, naming
- `/Users/axel/.claude/rules/web/performance.md` — bundle budgets (JS < 150kb gzip for landing page, CSS < 30kb), font loading rules (max 2 families, `font-display: swap`, preload only critical weight)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — project is a blank slate. `src/` directory does not exist yet.

### Established Patterns
- No existing patterns. Phase 1 establishes the baseline all subsequent phases follow.

### Integration Points
- `src/app/layout.tsx` — Phase 2 content sections and Phase 3 projects will import components rendered inside this layout
- `src/styles/tokens.css` — all phases reference these tokens; Phase 2 expands with spacing/radius tokens
- `next.config.ts` — static export config locked here; no changes expected in later phases

</code_context>

<specifics>
## Specific Ideas

- Design must be **responsive** — all type tokens must use `clamp()` for fluid scaling, not fixed rem values
- Warm parchment palette: off-white surface (~oklch 97%), near-black text, warm amber/terracotta accent at medium vibrancy (oklch chroma ~0.18–0.22)
- Both fonts (Sora + Instrument Serif) loaded via `next/font/google` with weights 400, 500, 600, 700

</specifics>

<deferred>
## Deferred Ideas

- Spacing scale, border-radius tokens, and animation easing/duration tokens — deferred to Phase 2
- None from discussion went out of phase scope

</deferred>

---

*Phase: 1-Foundation*
*Context gathered: 2026-05-18*
