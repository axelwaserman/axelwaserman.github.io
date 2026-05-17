# Architecture Patterns

**Project:** Personal Portfolio Site
**Domain:** Static personal website with build-time API integration
**Researched:** 2026-05-17
**Confidence:** HIGH (all findings verified against official Next.js docs and GitHub docs)

---

## Recommended Architecture

### Router Decision: App Router over Pages Router

Use the App Router (`app/` directory). It is the current default and the direction Next.js is actively developing. Both routers support `output: 'export'`, but the App Router enables a cleaner pattern for this project:

- Async Server Components run at build time automatically — no special export syntax needed
- Data fetching is co-located with the component that uses it
- No boilerplate `getStaticProps` / `getStaticPaths` export required
- `pages/` router still works but is legacy; new projects should use `app/`

**Verdict:** Use `app/` directory. Pages Router is not wrong but it is the past.

---

## Component Boundaries

```
app/
├── layout.tsx          → root HTML shell, fonts, global CSS, metadata
├── page.tsx            → single page entry; assembles all sections in order
└── (no sub-routes)     → single-page site has no routing complexity

components/
├── hero/
│   └── Hero.tsx        → name, headline, tagline, primary CTA
├── about/
│   └── About.tsx       → bio text, optional photo
├── cv/
│   ├── CV.tsx          → container for CV sub-sections
│   ├── Experience.tsx  → work history entries
│   ├── Education.tsx   → education entries
│   └── Skills.tsx      → skills list / tag cloud
├── projects/
│   ├── ProjectList.tsx → receives repo array as props, renders grid
│   └── ProjectCard.tsx → single repo: name, description, language, stars
└── contact/
    └── Contact.tsx     → email link, social links (no form)

lib/
├── github.ts           → GitHub API fetch function (build-time only)
└── types.ts            → shared TypeScript types (GithubRepo, etc.)

styles/
├── tokens.css          → CSS custom properties: palette, type scale, spacing
├── typography.css      → font-face declarations, heading/body rules
└── global.css          → reset, base element styles
```

### Component Responsibility Boundaries

| Component | Owns | Does NOT own |
|-----------|------|--------------|
| `app/layout.tsx` | HTML shell, `<head>` metadata, font loading, global CSS | Page content |
| `app/page.tsx` | Section composition order, GitHub API call | Section styling |
| `lib/github.ts` | GitHub API request, response typing, error handling | Rendering |
| `ProjectList.tsx` | Mapping repos → cards, empty state | Fetching data |
| `ProjectCard.tsx` | Single card visual | Data fetching, list logic |
| CV sub-components | Their own content | Each other's content |

**Rule:** `lib/github.ts` is the only file that calls the GitHub API. Page and section components receive typed props, never raw fetch calls.

---

## Data Flow

### Build-Time Data Flow (GitHub Repos)

```
GitHub REST API
    │
    │  GET /users/{username}/repos
    │  (unauthenticated, public repos only)
    │
    ▼
lib/github.ts
    │  fetchRepos(): Promise<GithubRepo[]>
    │  - Calls fetch() at build time
    │  - Maps response to typed GithubRepo interface
    │  - Handles API errors gracefully (returns [] on failure)
    │
    ▼
app/page.tsx  (async Server Component)
    │  const repos = await fetchRepos()
    │  - Runs once during `next build`
    │  - Result baked into static HTML
    │
    ▼
<ProjectList repos={repos} />
    │
    ▼
<ProjectCard repo={repo} />  (one per entry)
```

### Static Content Data Flow (CV, About, Contact)

```
TypeScript constants / inline data in components
    │
    │  No API call, no CMS
    │
    ▼
CV sub-components  (pure, props-only or self-contained)
    ▼
app/page.tsx  (assembled in section order)
    ▼
Static HTML output
```

### Key Point: Server Component Data Fetching

`app/page.tsx` is an async Server Component. The `fetch()` call in it runs during `next build`, not in the browser. The result is serialized into static HTML. At runtime, no JavaScript fetch occurs. This is the correct App Router pattern for `output: 'export'`.

**Do not use Route Handlers** as an intermediary for Server Component data fetching — the build will fail because no server is listening during the build step. Fetch directly from the external API inside the Server Component.

---

## next.config.ts Configuration

```typescript
const nextConfig = {
  output: 'export',

  // Required if hosted at username.github.io/repo-name (not a custom domain)
  // Set to '' if using a custom domain or username.github.io root repo
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',

  // Required: default image optimizer requires a server at runtime
  images: {
    unoptimized: true,
  },
}
```

**`basePath` note:** If the GitHub Pages URL is `axel.github.io` (root user page), set `basePath: ''`. If it is `axel.github.io/website` (project page), set `basePath: '/website'`. Use an env var to manage this cleanly — the GitHub Actions workflow sets it; local dev leaves it unset.

**`images.unoptimized: true`** is the simplest valid option. The default Next.js image optimizer requires a running Node.js server, which does not exist at static-export serve time. For a personal site with few images (avatar, maybe one or two icons), unoptimized is acceptable. The alternative — a custom loader pointing at Cloudinary or similar — adds dependency and complexity not warranted here.

---

## GitHub Pages Deployment: Recommended Approach

Use the **GitHub Actions artifact-based deployment** pattern (not `gh-pages` branch, not `docs/` folder).

Rationale:
- No committing build artifacts back to the repository
- Official GitHub starter workflow exists for Next.js
- Clean separation between source and deployment
- `actions/deploy-pages` handles serving from GitHub's infrastructure directly

### Deployment Architecture

```
.github/workflows/deploy.yml
    │
    ├── on.push (main branch)          → deploy on manual push
    └── on.schedule (cron: '0 2 * * *') → daily rebuild at 02:00 UTC

    Job 1: build
    ─────────────
    actions/checkout@v4
    actions/setup-node@v4 (Node 20, npm cache)
    actions/configure-pages@v5         → injects basePath automatically
    npm ci
    npm run build                       → runs `next build`, outputs to ./out
    actions/upload-pages-artifact@v3   → uploads ./out

    Job 2: deploy (needs: build)
    ─────────────────────────────
    environment: github-pages
    actions/deploy-pages@v5
```

**Permissions required on the workflow:**
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

**Concurrency control** (prevents overlapping deploys):
```yaml
concurrency:
  group: pages
  cancel-in-progress: true
```

### `actions/configure-pages@v5` Integration

This action reads the GitHub Pages settings and auto-injects `NEXT_PUBLIC_BASE_PATH` into the build environment. This eliminates the need to hardcode the basePath value — the action resolves it from the repository configuration. The `next.config.ts` reads `process.env.NEXT_PUBLIC_BASE_PATH` at build time.

---

## Scheduled Rebuild Pattern (GitHub Actions Cron)

```yaml
on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'   # 02:00 UTC daily
  workflow_dispatch:        # manual trigger for debugging
```

**Caveats verified from official docs:**
- Minimum interval is 5 minutes (daily is fine)
- Scheduled workflows are disabled in public repos after 60 days of no repository activity. Mitigation: commit a small change (e.g., update a date in a file) monthly, or use `workflow_dispatch` to reset the timer.
- Cron runs may be delayed at high-load periods. For a portfolio site, a few minutes of delay is irrelevant.
- GitHub Actions does not guarantee exact cron timing — treat it as "approximately daily."

**GitHub API rate limits:**
- Unauthenticated: 60 requests/hour per IP
- The build runner's IP is shared across many GitHub Actions runs — do not rely on the 60/hour unauthenticated limit being reliably available
- **Use a GitHub token in the Actions environment** (`GITHUB_TOKEN` is available automatically). A `GITHUB_TOKEN`-authenticated request gets 5,000 requests/hour. A single `GET /users/{username}/repos` call uses 1 request. Pass the token as an `Authorization` header in `lib/github.ts` when running in CI.

---

## Directory/File Structure (Full)

```
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css          (or import from styles/)
├── components/
│   ├── hero/
│   │   └── Hero.tsx
│   ├── about/
│   │   └── About.tsx
│   ├── cv/
│   │   ├── CV.tsx
│   │   ├── Experience.tsx
│   │   ├── Education.tsx
│   │   └── Skills.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   └── ProjectCard.tsx
│   └── contact/
│       └── Contact.tsx
├── lib/
│   ├── github.ts
│   └── types.ts
├── public/
│   └── (avatar, favicon, og image)
├── styles/
│   ├── tokens.css
│   ├── typography.css
│   └── global.css
├── .github/
│   └── workflows/
│       └── deploy.yml
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Unsupported Features in Static Export (Gotchas)

| Feature | Status | Impact on This Project |
|---------|--------|----------------------|
| `next/image` default optimizer | NOT supported | Use `images: { unoptimized: true }` |
| Server Actions | NOT supported | N/A — no form processing needed |
| API Routes (runtime) | NOT supported | N/A — no runtime API needed |
| `cookies()` / `headers()` | NOT supported | N/A — no auth or session |
| Incremental Static Regeneration | NOT supported | N/A — daily rebuild via cron handles freshness |
| Dynamic routes without `generateStaticParams` | NOT supported | N/A — single-page site, no dynamic routes |
| Rewrites / Redirects | NOT supported | N/A — no URL manipulation needed |
| `next/font` with `display: 'swap'` | Supported | Works fine in static export |
| Server Components (async, data-fetching) | Fully supported | Core pattern used for GitHub fetch |
| Route Handlers (GET only, no Request access) | Supported | Not needed for this project |

**Key insight:** For this project, every "unsupported" feature is either irrelevant or has a clean workaround. The static export constraints do not conflict with any requirement in PROJECT.md.

---

## Suggested Build Order (Phase Implications)

Dependencies between components determine what must exist before what can be built:

```
Phase 1 — Foundation
  next.config.ts (output, basePath, images)
  styles/tokens.css + typography.css + global.css
  app/layout.tsx (HTML shell, font loading)
  lib/types.ts (GithubRepo type definition)
  REASON: Everything else imports from these. No visual output yet.

Phase 2 — Static Sections (no API dependency)
  Hero.tsx
  About.tsx
  CV sub-components (Experience, Education, Skills)
  Contact.tsx
  app/page.tsx (assemble static sections)
  REASON: These are self-contained. Can be built and visually tested without GitHub data.

Phase 3 — Data Layer + Projects Section
  lib/github.ts (fetchRepos function, GITHUB_TOKEN support)
  ProjectCard.tsx
  ProjectList.tsx
  Wire into app/page.tsx
  REASON: GitHub data layer depends on the type system from Phase 1.
          Projects section depends on the data layer.

Phase 4 — Deployment Infrastructure
  .github/workflows/deploy.yml (build + deploy + cron schedule)
  GitHub Pages settings (source: GitHub Actions)
  Environment variable configuration (NEXT_PUBLIC_BASE_PATH)
  REASON: Deploy only after the site builds successfully locally.
```

**Critical dependency:** `next.config.ts` with correct `output: 'export'` and `images: { unoptimized: true }` must be set before the first `next build` attempt. Getting this wrong causes confusing build failures rather than obvious configuration errors.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fetching GitHub Data in a Client Component

**What:** `useEffect` + `fetch` in a `'use client'` component to call GitHub API.

**Why bad:** Exposes the fetch to rate limiting from each visitor's IP (60 req/hr unauthenticated). Stars and descriptions update on every page load but the data is already baked into the static HTML build. Unnecessary runtime cost. May hit CORS issues.

**Instead:** Fetch once at build time in the async Server Component `page.tsx`. Data is baked into static HTML. No runtime fetch occurs.

---

### Anti-Pattern 2: Using Route Handlers to Proxy GitHub API at Build Time

**What:** Create `app/api/github/route.ts` and fetch from it inside a Server Component.

**Why bad:** During `next build`, no server is running. The Server Component tries to call the Route Handler, which has nothing to answer — the build fails. This is explicitly called out in Next.js docs as a known pitfall.

**Instead:** Call the GitHub API directly from `lib/github.ts` inside `page.tsx`.

---

### Anti-Pattern 3: Hardcoding `basePath` to the Repository Name

**What:** `basePath: '/website'` hardcoded in `next.config.ts`.

**Why bad:** If the repo is renamed, or if a custom domain is added (no subdirectory), the build breaks silently — links and assets 404.

**Instead:** Read from `process.env.NEXT_PUBLIC_BASE_PATH`. GitHub's `actions/configure-pages@v5` injects this automatically. Locally it defaults to `''`.

---

### Anti-Pattern 4: Committing Build Output to `gh-pages` Branch

**What:** Run `next build`, then `git add out/`, commit and push to a `gh-pages` branch.

**Why bad:** Pollutes git history with binary build artifacts. Creates merge conflicts. Requires additional tools (`gh-pages` npm package). GitHub Actions artifact-based deployment is the current recommended approach.

**Instead:** Use `actions/upload-pages-artifact` + `actions/deploy-pages`. The `out/` directory is uploaded as a deployment artifact and served directly, never committed.

---

## Sources

- Next.js static export docs (official, verified May 2026): https://nextjs.org/docs/app/guides/static-exports
- Next.js basePath config (official): https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
- Next.js assetPrefix config (official): https://nextjs.org/docs/app/api-reference/config/next-config-js/assetPrefix
- Next.js image component unoptimized (official): https://nextjs.org/docs/app/api-reference/components/image
- GitHub Actions deploy-pages action: https://github.com/actions/deploy-pages
- GitHub Actions Next.js starter workflow: https://github.com/actions/starter-workflows/blob/main/pages/nextjs.yml
- GitHub Actions schedule event docs (official): https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule
- GitHub REST API rate limits (official): https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
- GitHub Pages publishing source docs (official): https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
