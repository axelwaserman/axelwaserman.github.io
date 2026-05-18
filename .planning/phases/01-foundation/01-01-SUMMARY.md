---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [nextjs, typescript, tailwind, tailwindv4, fonts, tokens, css-custom-properties, static-export]

# Dependency graph
requires: []
provides:
  - next.config.ts with output: 'export' and images: { unoptimized: true }
  - src/styles/tokens.css with Tailwind v4 @theme block (4 color + 4 type scale tokens)
  - src/app/globals.css importing tailwindcss and tokens.css
  - src/app/layout.tsx with Sora + Instrument Serif loaded via next/font/google
  - src/app/page.tsx with four section stub comments
  - Full toolchain: TypeScript strict, Prettier, ESLint next/core-web-vitals
  - Verified next build produces out/index.html — Walking Skeleton complete
affects: [02-content, 03-projects, 04-deploy]

# Tech tracking
tech-stack:
  added:
    - next@16.2.6
    - react@19
    - typescript@6.0.3
    - tailwindcss@4.3.0
    - "@tailwindcss/postcss"
    - clsx@2.1.1
    - tailwind-merge@3.6.0
    - prettier@3.8.3
    - eslint-config-next@16.2.6
  patterns:
    - Tailwind v4 @theme directive for design token registration
    - next/font/google for build-time font self-hosting
    - oklch() color format for perceptually uniform palette
    - clamp() for all fluid type scale tokens

key-files:
  created:
    - next.config.ts
    - postcss.config.mjs
    - tsconfig.json
    - .prettierrc
    - eslint.config.mjs
    - .gitignore
    - package.json
    - src/styles/tokens.css
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
  modified: []

key-decisions:
  - "Scaffolded manually (not via create-next-app) because existing .planning/ and CLAUDE.md files blocked create-next-app execution — all required files created by hand"
  - "Font pairing: Sora (body/UI, 400/500/600/700) + Instrument Serif (headings only, 400 — higher weights unavailable in Google Fonts)"
  - "Color direction: warm ink/parchment — oklch(97% 0.01 75) surface, oklch(18% 0.01 75) text, oklch(62% 0.19 55) accent (amber/terracotta)"
  - "Design tokens in src/styles/tokens.css inside Tailwind v4 @theme directive — available as both CSS custom properties and Tailwind utilities"
  - "Phase 1 tokens: colors + type scale only; spacing/radius/animation deferred to Phase 2"

patterns-established:
  - "Token file: all design tokens live in src/styles/tokens.css inside @theme"
  - "Import order in globals.css: @import tailwindcss; then @import tokens; then base rules"
  - "Font loading: next/font/google with variable: '--font-*' and display: 'swap'"
  - "Font CSS variables applied to <html> element so all children inherit them"

requirements-completed: [INFRA-06]

# Metrics
duration: 8min
completed: 2026-05-18
---

# Phase 01 Plan 01: Foundation Summary

**Next.js 16 Walking Skeleton with static export, Tailwind v4 design tokens (warm parchment palette + fluid type scale), and Sora/Instrument Serif fonts self-hosted at build time**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-18T16:04:15Z
- **Completed:** 2026-05-18T16:13:00Z
- **Tasks:** 3
- **Files modified:** 11 created, 1 auto-updated (tsconfig.json by Next.js build)

## Accomplishments

- `next build` exits 0, produces `out/` directory with `out/index.html` containing `Axel W — Software Engineer` title
- Design token system locked: 4 oklch color tokens + 4 clamp() type scale tokens in Tailwind v4 `@theme` directive
- Sora and Instrument Serif loaded via `next/font/google` — fonts self-hosted in `out/_next/static/media/`, zero runtime Google Fonts requests
- Full toolchain in place: TypeScript strict mode, Prettier, ESLint with next/core-web-vitals ruleset

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold project and lock static export config** - `39846c8` (feat)
2. **Task 2: Design tokens and globals.css** - `a510078` (feat)
3. **Task 3: Font loading, HTML shell, and next build verification** - `68f152f` (feat)

## Files Created/Modified

- `next.config.ts` — static export config: `output: 'export'`, `images: { unoptimized: true }`
- `postcss.config.mjs` — Tailwind v4 PostCSS plugin (`@tailwindcss/postcss`)
- `tsconfig.json` — TypeScript strict mode, `@/*` path alias, updated by Next.js build (jsx: react-jsx)
- `.prettierrc` — semi:false, singleQuote, trailingComma:all, printWidth:100
- `eslint.config.mjs` — flat config extending next/core-web-vitals
- `.gitignore` — covers node_modules, .next/, out/, build artifacts
- `package.json` — format, format:check, lint scripts; all required dependencies
- `src/styles/tokens.css` — Tailwind v4 @theme with 4 color tokens + 4 type scale tokens + font family stubs
- `src/app/globals.css` — @import tailwindcss + @import tokens.css + body base styles
- `src/app/layout.tsx` — Sora + Instrument_Serif font loading, metadata, HTML shell
- `src/app/page.tsx` — empty main with four section stub JSX comments

## Decisions Made

- Scaffolded manually instead of using `create-next-app` because existing `.planning/` and `CLAUDE.md` files in the working directory blocked the official scaffolder — all files created by hand to identical effect
- Font pairing: Sora for body/UI (weights 400–700), Instrument Serif for headings only (weight 400 only — higher weights unavailable on Google Fonts)
- Warm ink/parchment color palette using oklch(): off-white surface, near-black text, amber/terracotta accent at oklch chroma 0.19 (within locked 0.18–0.22 range)
- Phase 1 token scope intentionally limited to colors + type scale — spacing, radius, animation deferred to Phase 2 per plan

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Manual scaffold instead of create-next-app**
- **Found during:** Task 1 (scaffold project)
- **Issue:** `create-next-app` refused to run because `.planning/` and `CLAUDE.md` files already existed in the target directory — the tool requires an empty directory
- **Fix:** Created all project files manually (package.json, next.config.ts, tsconfig.json, postcss.config.mjs, .prettierrc, eslint.config.mjs, src/ structure) to exactly match what create-next-app would produce. Installed dependencies individually via npm.
- **Files modified:** All scaffold files
- **Verification:** `npx tsc --noEmit` exits 0; `npm run build` exits 0; all acceptance criteria met
- **Committed in:** 39846c8 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — scaffold method)
**Impact on plan:** Functionally identical outcome; scaffold method change has no downstream impact.

## Issues Encountered

- `npm audit` reports 2 moderate vulnerabilities in postcss (used by next). The suggested fix (`npm audit fix --force`) would downgrade to Next.js 9.3.3 — worse than the vulnerability. Vulnerabilities are moderate severity only, not HIGH/CRITICAL. Accepted per threat model T-01-01.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Static export pipeline proven end-to-end (`next build` → `out/`)
- Design token system in place — Phase 2 can import and use `var(--color-*)` and `var(--text-*)` tokens immediately
- Tailwind v4 utilities (`bg-surface`, `text-accent`, etc.) ready for Phase 2 component work
- Font variables (`--font-body`, `--font-heading`) on `<html>` — all Phase 2 components inherit typography automatically
- Four section stub comments in page.tsx mark Phase 2 content injection points

---
*Phase: 01-foundation*
*Completed: 2026-05-18*
