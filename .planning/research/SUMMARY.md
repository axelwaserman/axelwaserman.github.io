# Project Research Summary

**Project:** Personal Portfolio / CV Website
**Domain:** Static personal developer portfolio with build-time GitHub API integration
**Researched:** 2026-05-17
**Confidence:** HIGH

## Executive Summary

This is a personal developer portfolio site intended to serve recruiters and collaborators, built as a single-page static site deployed to GitHub Pages. The expert approach is a Next.js App Router project with `output: 'export'`, built once per day via GitHub Actions cron, with GitHub repo data fetched at build time from the REST API and baked into static HTML. No backend, no runtime server, no CMS — content lives in code and a daily cron keeps the projects section fresh.

The recommended stack is non-negotiable on the core pieces (Next.js 16, TypeScript 6, App Router) and leans minimalist on dependencies: Tailwind CSS v4 for styling, native `fetch` for the GitHub API call, `clsx` + `tailwind-merge` as the only runtime utility additions. No component libraries — this is a learning project with a custom visual direction, and shadcn/ui or similar would fight both goals. The static export constraint eliminates an entire category of tempting additions (Server Actions, contact forms, dark mode toggle) that are either incompatible or out of scope.

The main risk cluster is configuration: `basePath`, `images.unoptimized`, the GitHub API token, and `.gitignore` setup must all be correct before the first `next build`. Getting any of these wrong produces either silent failures or cascading 404s that are confusing to debug without knowing the cause. Set all four correctly in Phase 1 and the remaining phases are low-risk.

---

## Key Findings

### Recommended Stack

Next.js 16.2.6 with App Router and `output: 'export'` is the definitive choice. App Router's async Server Components make build-time data fetching idiomatic (`async function Page()` that awaits a fetch) without the `getStaticProps` boilerplate of the Pages Router, which is now in maintenance mode. TypeScript strict mode from day one is non-negotiable per project requirements.

Tailwind CSS v4.3.0 replaces `tailwind.config.js` with CSS `@theme` variables, has zero-config content detection, and needs only `@import "tailwindcss"` in globals.css. Design tokens go into `@theme` as CSS custom properties, consistent with the project's coding style rules. The GitHub API integration uses a single call to `GET /users/{username}/repos?type=public&sort=updated&per_page=100` via native `fetch` — Octokit is over-engineering for one endpoint.

**Core technologies:**
- Next.js 16.2.6 (App Router): Framework — static export, build-time Server Components, `next/font` self-hosting
- TypeScript 6.0.3: Type safety — strict mode, typed API responses
- Tailwind CSS 4.3.0: Styling — `@theme` tokens, zero-config, fits editorial minimal direction
- `next/font/google`: Font loading — self-hosted at build time, zero CLS, zero external runtime requests
- Native `fetch` (Node.js built-in): GitHub API — single endpoint, no dependency needed
- GitHub Actions (official Next.js Pages workflow): CI/CD — build + deploy + daily cron rebuild
- `clsx` 2.1.1 + `tailwind-merge` 3.6.0: Class utilities — only two non-framework runtime additions

### Expected Features

The site must function as a recruiter-facing CV artifact. Every section in the "must have" list is load-bearing — missing any of them makes the site feel incomplete to the target audience.

**Must have (table stakes):**
- Hero section — name, role, one-line positioning statement
- About / bio — 2-4 sentences with a personality signal
- Work experience timeline — company, role, dates, outcome bullet
- Skills — grouped tags by category; no progress bars (universally mocked)
- Projects section — fetched from GitHub API; name, description, language, stars, repo link per card
- Contact section — mailto link + LinkedIn + GitHub (covers 95% of actual contact needs)
- Anchor navigation with smooth scroll — active section highlight on scroll
- Resume / CV download link — PDF in-repo or stable external URL
- Correct OpenGraph / meta tags — og:title, og:description, og:image (critical for job-search sharing)
- Responsive layout — 320px through 1440px, all touch targets 44x44px minimum

**Should have (differentiators, low complexity):**
- Pinned / curated project ordering — shows editorial judgment over pure star-count sorting
- OpenGraph image — 1200x630 static asset; required for og:image to work
- Custom favicon — not the default Next.js icon; small signal of care
- Availability / location text — useful context for remote-work recruiters
- Scroll-driven entrance animations — Intersection Observer + CSS transitions; not GSAP scrollytelling
- Archived repo filtering — filter `archived: true` in the API fetch, no UI toggle needed

**Defer (v2+):**
- Tag/language filtering on projects — only warranted when project count exceeds ~8
- Blog / writing section — empty blog is worse than no blog; add when content exists
- Topics display — confirm GitHub topics are populated before building the UI

**Explicitly exclude (anti-features):**
Skill progress bars, animated loading screen, parallax backgrounds, dark mode toggle, contact form, blog section, technology logo carousel, counter animations, visitor counter.

### Architecture Approach

The architecture is a flat single-page App Router project. `app/page.tsx` is an async Server Component that calls `lib/github.ts` once during `next build` — the result is serialized into static HTML and no runtime fetch ever occurs. All other sections (Hero, About, CV, Contact) are pure components with their content in TypeScript constants. Deployment uses GitHub Actions artifact-based deployment, never a `gh-pages` branch.

**Major components:**
1. `app/layout.tsx` — HTML shell, `<head>` metadata, font loading, global CSS import
2. `app/page.tsx` — section assembly order, single GitHub API call; async Server Component
3. `lib/github.ts` — sole owner of the GitHub API fetch; typed `GithubRepo` interface; try/catch with empty-array fallback
4. `components/projects/ProjectList.tsx` + `ProjectCard.tsx` — receive typed repo array as props; no fetching
5. `components/hero/`, `about/`, `cv/`, `contact/` — self-contained; static content from TypeScript constants
6. `styles/tokens.css` — all design tokens as CSS custom properties; single source of truth for palette, type scale, spacing
7. `.github/workflows/deploy.yml` — build + deploy + daily cron; `actions/configure-pages@v5` auto-injects `NEXT_PUBLIC_BASE_PATH`

### Critical Pitfalls

1. **`next/image` without `unoptimized: true` breaks the build** — Set `images: { unoptimized: true }` in `next.config.ts` before writing any image component. `next dev` works; `next build` fails. Alternatively use plain `<img>` tags with explicit `width` and `height` attributes.

2. **Missing `basePath` for project-scoped GitHub Pages** — If the repo URL is `username.github.io/website`, every asset and link 404s without `basePath`. Use `process.env.NEXT_PUBLIC_BASE_PATH`; `actions/configure-pages@v5` injects it automatically in CI.

3. **GitHub API rate limit kills the build** — Unauthenticated requests share a 60 req/hour IP-based limit across all GitHub Actions runners. Always wrap `fetchRepos()` in try/catch with a graceful empty-array fallback. Pass `GITHUB_TOKEN` as a Bearer header in CI to get 5,000 req/hour.

4. **Server Actions and API Routes fail silently in dev, hard-error in build** — With `output: 'export'`, `'use server'` functions, `cookies()`, `headers()`, rewrites, and redirects all work in `next dev` but crash `next build`. Never write `'use server'` in this project.

5. **Scheduled workflow disabled after 60 days of repo inactivity** — GitHub silently disables cron workflows in public repos with no activity for 60 days. Add `workflow_dispatch` to the workflow so it can be manually re-enabled from the GitHub UI.

---

## Implications for Roadmap

All four research files agree on a four-phase build order driven by dependency topology: configuration must precede components, static sections can be built before the data layer, and deployment should come last after a successful local build.

### Phase 1: Foundation
**Rationale:** Everything else imports from here. Wrong configuration here causes confusing failures in every subsequent phase rather than obvious errors at the source.
**Delivers:** Working `next build` with correct static export config, design token system, TypeScript types, font loading, and HTML shell — no visible page content yet.
**Addresses:** OpenGraph meta tags (set up in `layout.tsx`), font loading
**Avoids:** Pitfall 1 (images config), Pitfall 2 (basePath), Pitfall 3 (Server Actions off-limits), `next-env.d.ts` in .gitignore
**Key tasks:**
- `next.config.ts` with `output: 'export'`, `images: { unoptimized: true }`, `basePath` from env var
- `.gitignore` with `next-env.d.ts`, `out/`, `.next/`
- `styles/tokens.css` — palette, type scale, spacing as CSS custom properties
- `lib/types.ts` — `GithubRepo` interface
- `app/layout.tsx` — HTML shell, `next/font` setup, metadata object with og tags
- `globals.css` with `@import "tailwindcss"` and `@theme` block
- Verify `next build` succeeds before moving on

### Phase 2: Static Sections
**Rationale:** Hero, About, CV, and Contact are self-contained with no API dependency. Building them first produces a visually complete, deployable site before the GitHub data layer is wired up.
**Delivers:** Full single-page layout with all static content sections visible and responsive; resume download link in place.
**Addresses:** Hero, About, Work experience, Skills, Contact section, anchor navigation, responsive layout, resume download
**Avoids:** Pitfall 9 (CLS from images without dimensions), Pitfall 15 (layout-bound animation), `ignoreBuildErrors` shortcut
**Key tasks:**
- `components/hero/Hero.tsx` — name, role, tagline, primary CTA
- `components/about/About.tsx` — bio + personality signal
- `components/cv/` — Experience, Education, Skills (grouped tags, no bars)
- `components/contact/Contact.tsx` — mailto + LinkedIn + GitHub
- `app/page.tsx` — assemble sections in order (no GitHub fetch yet)
- Anchor navigation with smooth scroll and active-section highlight
- Responsive layout verified at 320, 768, 1024, 1440
- Public assets: favicon, og image (1200x630), resume PDF

### Phase 3: Projects Section and GitHub Data Layer
**Rationale:** The data layer depends on `lib/types.ts` from Phase 1. The Projects section depends on the data layer. Separating this from static sections means Phase 2 remains independently testable.
**Delivers:** Live projects grid populated from GitHub API at build time; star counts, descriptions, language tags, repo links.
**Addresses:** Projects section (table stakes), optional pinned ordering, archived repo filtering
**Avoids:** Pitfall 4 (rate limit — try/catch + GITHUB_TOKEN), Pitfall 6 (silent truncation — `per_page=100`), anti-pattern of fetching in a Client Component, anti-pattern of Route Handler proxy
**Key tasks:**
- `lib/github.ts` — `fetchRepos()` with `Authorization` header, `per_page=100`, try/catch returning `[]` on failure
- `components/projects/ProjectCard.tsx` — name, description, language badge, star count, repo link
- `components/projects/ProjectList.tsx` — map repos to cards, empty state, optional pin list
- Wire `fetchRepos()` into `app/page.tsx` (async Server Component call)
- Filter out `archived: true` repos in the fetch/map logic

### Phase 4: Deployment and CI
**Rationale:** Deploy only after `next build` succeeds locally. This phase is purely infrastructure — wiring the working local build to GitHub Pages and adding the daily refresh cron.
**Delivers:** Live site on GitHub Pages with automatic deploys on push and daily GitHub data refresh.
**Addresses:** Daily rebuild pattern (keeps repo data fresh)
**Avoids:** Pitfall 2 (basePath — resolved by `actions/configure-pages@v5`), Pitfall 5 (60-day inactivity disable — `workflow_dispatch` added), Pitfall 14 (cron at top of hour)
**Key tasks:**
- `.github/workflows/deploy.yml` — `checkout@v4`, `setup-node@v4` (Node 20), `configure-pages@v5`, `npm ci`, `npm run build`, `upload-pages-artifact@v3`, `deploy-pages@v5`
- Permissions: `contents: read`, `pages: write`, `id-token: write`
- Concurrency: `group: pages`, `cancel-in-progress: true`
- Triggers: `push` to main + `schedule: '15 2 * * *'` + `workflow_dispatch`
- GitHub Pages settings: source = GitHub Actions
- Document 60-day inactivity limit in README

### Phase Ordering Rationale

- Phase 1 before everything: `next.config.ts`, `lib/types.ts`, and `styles/tokens.css` are imported by all subsequent phases. Configuration errors here produce misleading errors downstream.
- Phase 2 before Phase 3: Static sections have no dependencies beyond Phase 1. Building them first gives a visually complete, testable site before any API integration is attempted.
- Phase 3 before Phase 4: Deploy after the build is confirmed working locally. Debugging basePath and static export issues is easier against a local build than against GitHub Pages.
- Phase 4 last: Infrastructure concerns are isolated. No component work.

### Research Flags

Phases with standard patterns (research-phase skip justified):
- **Phase 1:** Next.js App Router setup is extensively documented; official starter workflow exists. Configuration values verified in STACK.md and ARCHITECTURE.md.
- **Phase 2:** Pure component work with Tailwind. Well-understood patterns. No exotic library integrations.
- **Phase 4:** GitHub Actions Next.js Pages workflow is a first-party official starter. All action versions and permissions verified.

Phases that may benefit from targeted research during planning:
- **Phase 3:** The `GITHUB_TOKEN` authentication pattern and try/catch fallback behavior under rate-limiting are worth a targeted verification pass during implementation — particularly confirming the token is available in the Actions environment without manual secret configuration.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry and official Next.js/Tailwind docs as of 2026-05-17 |
| Features | HIGH | Drawn from 10+ real production portfolios plus 1,681-example community list; GitHub API fields confirmed from official docs |
| Architecture | HIGH | All patterns verified against official Next.js static export docs; four anti-patterns explicitly documented with causes |
| Pitfalls | HIGH | All 15 pitfalls verified against official documentation; not inferred from community posts |

**Overall confidence:** HIGH

### Gaps to Address

- **`basePath` value unknown until repo type is confirmed:** The correct `basePath` depends on whether the GitHub Pages URL is the root user page (`username.github.io`) or a project page (`username.github.io/repo-name`). Must be determined before Phase 1 configuration is finalized. The `actions/configure-pages@v5` env-var pattern handles this cleanly at CI time.
- **Design direction not specified:** The feature and stack research assume a minimal editorial visual direction. The actual typography pairing, color palette, and component visual style remain undefined. This is a Phase 1/2 boundary decision that affects `styles/tokens.css` and all component work.
- **Content not written:** Work experience, bio, and skills content will be placeholders in Phase 2 that need replacement with real content before launch. Not a technical risk but a launch blocker.

---

## Sources

### Primary (HIGH confidence)
- Next.js static export docs (official, v16.2.6): https://nextjs.org/docs/app/guides/static-exports
- Next.js basePath config (official): https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
- Tailwind CSS v4 docs: https://tailwindcss.com (v4.3.0, verified npm registry 2026-05-17)
- GitHub REST API docs: https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- GitHub Actions Next.js starter workflow: https://github.com/actions/starter-workflows/blob/main/pages/nextjs.yml
- GitHub Actions schedule event docs: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule
- GitHub Pages publishing source docs: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

### Secondary (MEDIUM confidence, pattern-level observation)
- Brittany Chiang portfolio (brittanychiang.com) — feature and UX patterns
- Lee Robinson portfolio (leerob.com) — feature and architecture patterns
- Anthony Fu portfolio (antfu.me) — feature patterns
- Emma Bostian curated list (github.com/emmabostian/developer-portfolios) — 1,681 examples reviewed at pattern level

---
*Research completed: 2026-05-17*
*Ready for roadmap: yes*
