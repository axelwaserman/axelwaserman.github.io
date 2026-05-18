# Walking Skeleton — Phase 1: Foundation

> Records the architectural decisions locked in Phase 1 that all subsequent phases build on without renegotiating.

---

## Framework

| Decision | Value |
|----------|-------|
| Framework | Next.js 16.2.6, App Router |
| Language | TypeScript 6.0.3 (strict mode) |
| UI library | React 19.x (bundled with Next.js) |
| Export mode | `output: 'export'` — static HTML/CSS/JS only |
| Output directory | `out/` |
| Image optimizer | `images: { unoptimized: true }` — required; no Next.js image server at runtime |
| Server features | None used — no Server Actions, ISR, cookies, rewrites, dynamic Routes |

## Data Layer

| Decision | Value |
|----------|-------|
| Runtime database | None — public static site, no backend |
| Build-time data | GitHub REST API via native `fetch` (Phase 3) |
| Auth at build time | `GITHUB_TOKEN` env var in GitHub Actions (1,000 req/hr) |
| Auth at runtime | None — all pages are public |

## Auth

None. This is a fully public portfolio site with no login, sessions, or protected routes.

## CSS / Design System

| Decision | Value |
|----------|-------|
| CSS tooling | Tailwind CSS 4.3.0 + `@tailwindcss/postcss` |
| Token registration | `@theme` directive in `src/styles/globals.css` |
| Token file | `src/styles/tokens.css` — imported into `globals.css` |
| Color format | `oklch()` throughout |
| Font loading | `next/font/google` — self-hosted at build time, zero runtime requests |
| Body font | Sora (weights 400, 500, 600, 700) |
| Heading font | Instrument Serif (weights 400, 500, 600, 700) |
| Theme direction | Warm ink / parchment — light theme only |

## Design Tokens (locked in Phase 1)

### Colors

| Token | oklch Value | Role |
|-------|-------------|------|
| `--color-surface` | `oklch(97% 0.01 75)` | Page background |
| `--color-text` | `oklch(18% 0.01 75)` | Body text, headings |
| `--color-accent` | `oklch(62% 0.19 55)` | CTAs, links, active indicators |
| `--color-muted` | `oklch(55% 0.03 75)` | Secondary text, captions |

### Type Scale

| Token | clamp() Value | Role |
|-------|---------------|------|
| `--text-ui` | `clamp(0.875rem, 0.82rem + 0.28vw, 1rem)` | Labels, nav, captions |
| `--text-body` | `clamp(1rem, 0.92rem + 0.4vw, 1.125rem)` | Body copy, lead text |
| `--text-heading` | `clamp(1.75rem, 1.4rem + 1.75vw, 2.5rem)` | Section headings |
| `--text-hero` | `clamp(3rem, 1.5rem + 7.5vw, 7rem)` | Hero display |

### Font CSS Variables

| Variable | Value |
|----------|-------|
| `--font-body` | Applied via Sora `next/font/google` instance |
| `--font-heading` | Applied via Instrument Serif `next/font/google` instance |

## Utilities

| Library | Version | Use |
|---------|---------|-----|
| `clsx` | 2.1.1 | Conditional className composition |
| `tailwind-merge` | 3.6.0 | Merge Tailwind classes in reusable components |

## Directory Layout

```
src/
├── app/
│   ├── layout.tsx       # Root layout: font loading, metadata, HTML shell
│   ├── page.tsx         # Single page: section stub comments only (Phase 1)
│   └── globals.css      # @import tokens.css, @theme block, Tailwind base
├── components/          # Created empty; populated in Phase 2
├── hooks/               # Created empty; populated in Phase 2
├── lib/                 # Created empty; populated in Phase 3
└── styles/
    └── tokens.css       # All design tokens as CSS custom properties
```

Root config files:
- `next.config.ts` — `output: 'export'`, `images: { unoptimized: true }`
- `postcss.config.mjs` — `@tailwindcss/postcss` plugin
- `.prettierrc` — project formatting rules
- `tsconfig.json` — strict mode, `@/*` path alias pointing to `src/`

## Deployment Target

| Decision | Value |
|----------|-------|
| Host | GitHub Pages (axelw.github.io — user page, no `basePath` needed) |
| Deploy method | GitHub Actions (wired in Phase 4) |
| Pages action | `actions/configure-pages@v5` handles basePath injection automatically |
| Artifact directory | `out/` |
| Trigger | Push to `main` + daily cron (Phase 4) |

## Decisions Deferred to Later Phases

| Item | Deferred To |
|------|-------------|
| Spacing, radius, animation tokens | Phase 2 |
| All visible content (hero, CV, contact) | Phase 2 |
| GitHub API data fetching | Phase 3 |
| GitHub Actions CI/CD workflow | Phase 4 |

---

*Generated: 2026-05-18 — Phase 1 Walking Skeleton*
