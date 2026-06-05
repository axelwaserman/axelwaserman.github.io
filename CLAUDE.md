<!-- GSD:project-start source:PROJECT.md -->

## Project

**Personal Website**

A single-page personal website serving as a public home on the web — for job seeking, personal branding, and portfolio showcase. It includes a CV section (work experience, education, skills, contact), and a GitHub projects list that stays fresh via a daily GitHub Actions rebuild pulling from the GitHub API.

**Core Value:** A recruiter, collaborator, or curious stranger can land on the site, understand who Axel is, and find his work within 30 seconds — no friction, no staleness.

### Constraints

- **Hosting**: GitHub Pages — requires `output: 'export'` in Next.js config; no server-side rendering or API routes at runtime
- **Tech stack**: Next.js + TypeScript + React — chosen to learn modern frontend patterns
- **Data freshness**: Projects list updated via scheduled GH Actions rebuild, not real-time
- **Content management**: All content is hardcoded or sourced from GitHub API — no CMS
- **Design**: Light theme only; avoid anything that looks like a stock template
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Framework

| Technology | Version                     | Purpose      | Why                                                                                                                                                                                                                  |
| ---------- | --------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js    | 16.2.6                      | Framework    | Non-negotiable per requirements. App Router is the current default and is fully compatible with `output: 'export'`. Server Components run at build time, which is exactly what build-time GitHub API fetching needs. |
| React      | 19.x (bundled with Next 16) | UI rendering | Bundled with Next.js — no independent install decision needed.                                                                                                                                                       |
| TypeScript | 6.0.3                       | Type safety  | Non-negotiable per requirements. Use strict mode from day one to maximise learning value.                                                                                                                            |

- `output: 'export'` in `next.config.ts` — outputs to `out/`
- `images: { unoptimized: true }` required because the default Next.js image optimizer is a server feature. For a portfolio site, serving pre-sized images directly is fine.
- `next/font` works correctly with static export — fonts are downloaded at build time and self-hosted. Zero runtime Google Fonts requests.
- Server Actions, ISR, cookies, rewrites, redirects, and dynamic Route Handlers are unavailable — none are needed for this project.

### CSS Approach

| Technology             | Version                 | Purpose                         | Why |
| ---------------------- | ----------------------- | ------------------------------- | --- |
| Tailwind CSS           | 4.3.0                   | Utility-first styling           |     |
| `@tailwindcss/postcss` | (same package, bundled) | PostCSS integration for Next.js |     |

- CSS Modules: Good choice, but offers no acceleration for a single person building a small site. You write all the CSS manually, which is slower.
- styled-components: Runtime CSS-in-JS. Poor fit for static export + minimal portfolio. Adds bundle weight for no benefit.
- Tailwind v4: Utility-first keeps the feedback loop tight during development. The minimal, editorial design direction (clean whitespace, typography contrast, rounded corners) maps directly to Tailwind's scale utilities. Custom design tokens go into `@theme` in globals.css as CSS custom properties — which aligns with the project's coding style rules.

### GitHub API Integration

| Technology                | Version                      | Purpose                        | Why |
| ------------------------- | ---------------------------- | ------------------------------ | --- |
| Native `fetch`            | (Node.js built-in)           | GitHub API calls at build time |     |
| Auth type                 | Limit                        |
| -----------               | -------                      |
| Unauthenticated           | 60 requests/hour             |
| `GITHUB_TOKEN` in Actions | 1,000 requests/hour per repo |

### GitHub Actions Workflow

| Action                          | Version | Purpose                                                              |
| ------------------------------- | ------- | -------------------------------------------------------------------- |
| `actions/checkout`              | v4      | Checkout repo                                                        |
| `actions/setup-node`            | v4      | Node.js 20 with caching                                              |
| `actions/configure-pages`       | v5      | Injects `basePath` and sets `images.unoptimized: true` automatically |
| `actions/cache`                 | v4      | Cache `.next/cache` for faster rebuilds                              |
| `actions/upload-pages-artifact` | v3      | Package `./out` directory                                            |
| `actions/deploy-pages`          | v5      | Deploy to GitHub Pages                                               |

### Font Loading

| Technology         | Purpose                                       | Why                                                                                                                                                                                                                                  |
| ------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `next/font/google` | Load and self-host Google Fonts at build time | Works with static export. Fonts are downloaded during `next build`, embedded as self-hosted assets in `out/`, and served without any Google Fonts runtime requests. Zero CLS from font loading. `font-display: swap` is the default. |

- Display/headings: Geist (from Vercel, available in `next/font/google`) or Inter for a clean technical feel — or `Plus Jakarta Sans` / `DM Sans` for slightly more character.
- Body: Same family at regular weight, or pair with a secondary serif if the editorial direction calls for it.

### Supporting Libraries

| Library          | Version | Purpose                                  | When to Use                                                          |
| ---------------- | ------- | ---------------------------------------- | -------------------------------------------------------------------- |
| `clsx`           | 2.1.1   | Conditional className composition        | Always — use instead of string concatenation for conditional classes |
| `tailwind-merge` | 3.6.0   | Merge Tailwind classes without conflicts | Use in reusable components that accept `className` props             |

## Alternatives Considered

| Category   | Recommended        | Alternative                  | Why Not                                                                                   |
| ---------- | ------------------ | ---------------------------- | ----------------------------------------------------------------------------------------- |
| CSS        | Tailwind v4        | CSS Modules                  | Slower iteration for a solo learner on a small project; requires writing all CSS manually |
| CSS        | Tailwind v4        | styled-components            | Runtime CSS-in-JS; performance regression on static site; poor fit for static export      |
| CSS        | Tailwind v4        | Tailwind v3                  | v4 is stable and current; starting on v3 creates unnecessary migration work               |
| GitHub API | Raw fetch          | `@octokit/rest`              | Over-engineering for a single public endpoint; adds 40kb+ of deps for zero benefit        |
| GitHub API | Raw fetch          | GraphQL API                  | More complexity, requires auth setup, no benefit over REST for this use case              |
| Router     | App Router         | Pages Router                 | Pages Router is in maintenance mode; App Router is the current paradigm                   |
| Components | None               | shadcn/ui                    | Fights the custom design direction; shortcircuits the learning goal                       |
| Fonts      | `next/font/google` | Self-hosted font files       | `next/font` handles self-hosting automatically with better DX                             |
| Fonts      | `next/font/google` | Raw `<link>` to Google Fonts | Creates runtime request to Google, CLS risk, worse privacy                                |

## Installation

# Scaffold (use official Next.js CLI, choose App Router + TypeScript)

# Tailwind v4 with PostCSS integration

# Utility helpers

## Sources

- Next.js static export docs: https://nextjs.org/docs/app/guides/static-exports (version 16.2.6, fetched 2026-05-13)
- Next.js latest release: v16.2.6 (2026-05-07, verified from GitHub releases API)
- Tailwind CSS v4 docs: https://tailwindcss.com (version 4.3.0, verified from npm registry 2026-05-17)
- Tailwind v4 release blog: https://tailwindcss.com/blog/tailwindcss-v4
- Octokit rest.js: v22.0.1 (verified npm registry, 2025-10-31)
- GitHub REST API rate limits: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- GitHub Actions Next.js workflow: https://github.com/actions/starter-workflows/blob/main/pages/nextjs.yml (verified 2026-05-17)
- TypeScript: v6.0.3 (verified npm registry)
- clsx: v2.1.1 / tailwind-merge: v3.6.0 (verified npm registry)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.

<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->
