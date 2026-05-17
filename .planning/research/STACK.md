# Technology Stack

**Project:** Personal developer portfolio/CV website
**Researched:** 2026-05-17
**Confidence:** HIGH — all versions verified against npm registry and official docs as of research date

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.2.6 | Framework | Non-negotiable per requirements. App Router is the current default and is fully compatible with `output: 'export'`. Server Components run at build time, which is exactly what build-time GitHub API fetching needs. |
| React | 19.x (bundled with Next 16) | UI rendering | Bundled with Next.js — no independent install decision needed. |
| TypeScript | 6.0.3 | Type safety | Non-negotiable per requirements. Use strict mode from day one to maximise learning value. |

**App Router vs Pages Router decision:** Use App Router. It is the current recommended approach in Next.js docs. For a static export, both work, but App Router's async Server Components make build-time data fetching idiomatic (`async function Page()` that `fetch`es during `next build`) rather than requiring `getStaticProps`. The learning curve aligns better with 2025+ React patterns. Pages Router is in maintenance mode.

**Key static export constraints confirmed:**
- `output: 'export'` in `next.config.ts` — outputs to `out/`
- `images: { unoptimized: true }` required because the default Next.js image optimizer is a server feature. For a portfolio site, serving pre-sized images directly is fine.
- `next/font` works correctly with static export — fonts are downloaded at build time and self-hosted. Zero runtime Google Fonts requests.
- Server Actions, ISR, cookies, rewrites, redirects, and dynamic Route Handlers are unavailable — none are needed for this project.

---

### CSS Approach

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.3.0 | Utility-first styling | |
| `@tailwindcss/postcss` | (same package, bundled) | PostCSS integration for Next.js | |

**Why Tailwind v4, not v3:** Tailwind v4 (stable, released early 2025) is the current release. It drops `tailwind.config.js` in favour of CSS `@theme` variables, has zero-config content detection (no `content: []` array needed), and needs only `@import "tailwindcss"` in globals.css. For a learner building from scratch, starting on v4 is correct — there is no legacy config to migrate.

**Why Tailwind over CSS Modules or styled-components:**
- CSS Modules: Good choice, but offers no acceleration for a single person building a small site. You write all the CSS manually, which is slower.
- styled-components: Runtime CSS-in-JS. Poor fit for static export + minimal portfolio. Adds bundle weight for no benefit.
- Tailwind v4: Utility-first keeps the feedback loop tight during development. The minimal, editorial design direction (clean whitespace, typography contrast, rounded corners) maps directly to Tailwind's scale utilities. Custom design tokens go into `@theme` in globals.css as CSS custom properties — which aligns with the project's coding style rules.

**What NOT to use:** shadcn/ui or any component library. This is a learning project with a custom visual direction. Adopting a pre-built component library would shortcut the learning and produce a template-looking result — both explicitly against project goals.

---

### GitHub API Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Native `fetch` | (Node.js built-in) | GitHub API calls at build time | |

**Why raw fetch, not Octokit:**

For this project's specific use case — fetching a list of public repos for one user, once, at build time — `@octokit/rest` (v22.0.1) is unnecessary overhead. The GitHub REST API endpoint `GET /users/{username}/repos` returns JSON with all needed fields (`name`, `description`, `language`, `stargazers_count`, `forks_count`, `topics`, `html_url`, `updated_at`) directly. Native `fetch` with a typed response interface is simpler and has zero dependencies.

Octokit makes sense when: you have many different API calls, need pagination helpers, or want TypeScript types for the full GitHub schema. For a single endpoint returning ~30 repos, it is over-engineering.

**Rate limits (verified from GitHub docs):**

| Auth type | Limit |
|-----------|-------|
| Unauthenticated | 60 requests/hour |
| `GITHUB_TOKEN` in Actions | 1,000 requests/hour per repo |

The build runs inside GitHub Actions where `GITHUB_TOKEN` is automatically available. Pass it as a bearer token in the `Authorization` header to stay well within limits. This also avoids the 60 req/hour unauthenticated cap that could cause a build failure on a busy CI runner.

**Important:** The `GITHUB_TOKEN` is available as `${{ secrets.GITHUB_TOKEN }}` in Actions and does not need to be manually configured. Pass it to the build as an environment variable (`GITHUB_TOKEN`), then read it with `process.env.GITHUB_TOKEN` during `next build`.

**Fields available per repo (confirmed):** `name`, `description`, `language`, `stargazers_count`, `forks_count`, `html_url`, `topics`, `updated_at`, `created_at`, `pushed_at`, `visibility`, `fork`, `archived`.

**Endpoint to use:** `GET https://api.github.com/users/{username}/repos?type=public&sort=updated&per_page=30`

---

### GitHub Actions Workflow

The official `actions/starter-workflows` Next.js Pages workflow (verified from GitHub source) uses these actions in this order:

| Action | Version | Purpose |
|--------|---------|---------|
| `actions/checkout` | v4 | Checkout repo |
| `actions/setup-node` | v4 | Node.js 20 with caching |
| `actions/configure-pages` | v5 | Injects `basePath` and sets `images.unoptimized: true` automatically |
| `actions/cache` | v4 | Cache `.next/cache` for faster rebuilds |
| `actions/upload-pages-artifact` | v3 | Package `./out` directory |
| `actions/deploy-pages` | v5 | Deploy to GitHub Pages |

**Daily rebuild:** Add a `schedule` trigger alongside `push`:

```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * *'   # 06:00 UTC daily
  workflow_dispatch:
```

**Node version:** 20 (LTS, required by Tailwind v4's upgrade tooling; safe for Next.js 16).

---

### Font Loading

| Technology | Purpose | Why |
|------------|---------|-----|
| `next/font/google` | Load and self-host Google Fonts at build time | Works with static export. Fonts are downloaded during `next build`, embedded as self-hosted assets in `out/`, and served without any Google Fonts runtime requests. Zero CLS from font loading. `font-display: swap` is the default. |

**Recommended font pairing for minimal editorial direction:**
- Display/headings: Geist (from Vercel, available in `next/font/google`) or Inter for a clean technical feel — or `Plus Jakarta Sans` / `DM Sans` for slightly more character.
- Body: Same family at regular weight, or pair with a secondary serif if the editorial direction calls for it.

No more than two font families. One variable font is ideal — avoids multiple weight files.

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` | 2.1.1 | Conditional className composition | Always — use instead of string concatenation for conditional classes |
| `tailwind-merge` | 3.6.0 | Merge Tailwind classes without conflicts | Use in reusable components that accept `className` props |

These two are the only non-framework runtime dependencies beyond React/Next needed for this project. Keep the dependency count minimal — this is a static marketing/portfolio page.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| CSS | Tailwind v4 | CSS Modules | Slower iteration for a solo learner on a small project; requires writing all CSS manually |
| CSS | Tailwind v4 | styled-components | Runtime CSS-in-JS; performance regression on static site; poor fit for static export |
| CSS | Tailwind v4 | Tailwind v3 | v4 is stable and current; starting on v3 creates unnecessary migration work |
| GitHub API | Raw fetch | `@octokit/rest` | Over-engineering for a single public endpoint; adds 40kb+ of deps for zero benefit |
| GitHub API | Raw fetch | GraphQL API | More complexity, requires auth setup, no benefit over REST for this use case |
| Router | App Router | Pages Router | Pages Router is in maintenance mode; App Router is the current paradigm |
| Components | None | shadcn/ui | Fights the custom design direction; shortcircuits the learning goal |
| Fonts | `next/font/google` | Self-hosted font files | `next/font` handles self-hosting automatically with better DX |
| Fonts | `next/font/google` | Raw `<link>` to Google Fonts | Creates runtime request to Google, CLS risk, worse privacy |

---

## Installation

```bash
# Scaffold (use official Next.js CLI, choose App Router + TypeScript)
npx create-next-app@latest website \
  --typescript \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd website

# Tailwind v4 with PostCSS integration
npm install tailwindcss @tailwindcss/postcss postcss

# Utility helpers
npm install clsx tailwind-merge
```

**postcss.config.mjs:**
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**globals.css (replace contents):**
```css
@import "tailwindcss";

@theme {
  /* Add design tokens here as CSS custom properties */
}
```

**next.config.ts:**
```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

---

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
