# Domain Pitfalls

**Domain:** Next.js static portfolio site with GitHub API + GitHub Pages hosting
**Stack:** Next.js App Router, TypeScript, `output: 'export'`, GitHub Actions, GitHub Pages
**Researched:** 2026-05-17
**Confidence:** HIGH — all pitfalls verified against official documentation

---

## Critical Pitfalls

Mistakes that cause broken deploys, silent failures, or rewrites.

---

### Pitfall 1: next/image breaks silently with `output: 'export'` and no custom loader

**What goes wrong:** `next/image` uses a server-side image optimization API by default. With `output: 'export'` there is no server, so the default loader is unsupported. `next dev` works fine. `next build` produces a hard error or generates broken image URLs.

**Why it happens:** Developers use `<Image>` expecting it to work like a smart `<img>` tag everywhere. The build-time failure only appears when `next build` runs — not during `next dev`.

**Consequences:** Build fails outright, or images silently serve broken URLs in production.

**Prevention:** Two valid options:
1. Add `unoptimized: true` to the images config in `next.config.ts` for a personal portfolio where automated resizing is unnecessary:
   ```ts
   images: { unoptimized: true }
   ```
2. Or avoid `next/image` entirely and use plain `<img>` tags with explicit `width` and `height` attributes. For a static personal site with a handful of images, this is the simpler, zero-surprise approach.

**Detection:** Run `next build` locally before deploying. The error is explicit. Do not rely on `next dev` alone.

**Phase:** Foundation / project setup phase — configure this before writing any image components.

---

### Pitfall 2: basePath missing for project-scoped GitHub Pages repos

**What goes wrong:** GitHub Pages serves a personal account site (`username.github.io`) at `/`, but a project repository site (`username.github.io/repo-name`) at `/repo-name`. Without `basePath: '/repo-name'` in `next.config.ts`, all internal links, `<Link>` components, and `_next/static/` asset paths resolve to `/`, causing 404s for every asset and navigation link.

**Why it happens:** Next.js config defaults to no basePath. Works fine on `localhost:3000`. Only breaks when deployed to GitHub Pages project URL.

**Consequences:** Entire site loads as blank page with cascading 404 errors in the network tab. Hard to debug without knowing the cause.

**Prevention:**
```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '',
}
```
If the repo is the personal root site (`username.github.io` — same name as GitHub username), no basePath is needed since it serves at `/`.

**Detection:** Open the deployed GitHub Pages URL immediately after first deploy. If the page loads blank with 404s in the network tab, missing basePath is the likely cause.

**Phase:** Foundation / project setup phase — determine which type of GitHub Pages URL before writing the config.

---

### Pitfall 3: Server Actions and API Routes used in components (works in dev, errors in build)

**What goes wrong:** Server Actions (`'use server'` functions), `cookies()`, `headers()`, rewrites, and redirects in `next.config.ts` are all unsupported with `output: 'export'`. They work in `next dev` but cause hard build errors.

**Why it happens:** `next dev` runs a full Node.js server, masking the static export constraints. A beginner may scaffold a Server Action for form submission or read a cookie for theme preference without knowing these are server-only features.

**Consequences:** `next build` fails. For this portfolio the most likely accidental trigger is trying to add a contact form with a Server Action — which is explicitly out of scope but tempting to add.

**Prevention:** For this site, everything that needs user interaction should use `mailto:` links or external services (e.g., Formspree). Never write `'use server'` functions in a static export project.

**Detection:** Any `'use server'` import will cause a build error. Run `next build` early and often rather than only at deploy time.

**Phase:** Foundation phase — add a note in project conventions that Server Actions are off-limits.

---

### Pitfall 4: GitHub API unauthenticated rate limit kills the build

**What goes wrong:** Unauthenticated GitHub REST API requests are capped at 60 requests per hour, tied to the IP of the build runner. GitHub Actions runners share IPs across many workflows. Under load, the runner's IP may have already consumed most of the 60-request window before your workflow fires. A `403` or `429` response during `next build` causes the fetch to fail and the build to error or produce stale/empty data.

**Why it happens:** 60 requests/hour sounds like plenty for a single build that makes a handful of requests. But the limit is per originating IP, not per user, and GitHub Actions IPs are shared.

**Consequences:** Build fails with a cryptic fetch error, or (worse) succeeds with an empty projects list if the error is swallowed silently.

**Prevention:**
1. Wrap the GitHub API fetch in a try/catch with a meaningful fallback (hardcoded or previously-fetched data). Never let a failed GitHub API call crash the build entirely.
2. Keep API calls minimal — one call to `/users/{username}/repos?per_page=100&sort=updated` covers everything needed for this site.
3. For future resilience, add a `GITHUB_TOKEN` secret to the Actions environment and pass it as a `Bearer` header — this raises the limit to 5,000 requests/hour.

**Detection:** Build logs show a `fetch` error mentioning rate limit, or the GitHub API response contains `message: "API rate limit exceeded"`.

**Phase:** GitHub API integration phase — build the error fallback before the feature is "done".

---

### Pitfall 5: GitHub Actions scheduled workflow stops running after 60 days of repo inactivity

**What goes wrong:** GitHub automatically disables scheduled workflows in public repositories that have had no repository activity for 60 days. The daily rebuild silently stops. The projects list on the site becomes stale without any error or notification.

**Why it happens:** GitHub's policy to reduce compute waste on abandoned repos. The portfolio site may look "done" and receive no commits for months, triggering the disable.

**Consequences:** The projects list freezes — star counts and descriptions become stale. No alert is raised unless you check.

**Prevention:** Re-enable the workflow manually when it gets disabled (GitHub sends no email — you must notice). Alternatively, add a manual `workflow_dispatch` trigger alongside the cron so the workflow can be triggered from the GitHub UI to keep it active. A small documentation update every few months would also count as activity.

**Detection:** Go to the repository's Actions tab. Disabled scheduled workflows are shown with a warning banner. If the daily deploy hasn't run in over a week, investigate immediately.

**Phase:** GitHub Actions / CI setup phase — document this limitation in the project README.

---

## Moderate Pitfalls

---

### Pitfall 6: GitHub API pagination silently truncates repos beyond 30

**What goes wrong:** The GitHub REST API returns 30 results per page by default. A user with more than 30 public repositories will silently get an incomplete list. No error is raised.

**Why it happens:** The default `per_page` is 30 and the API does not paginate automatically.

**Prevention:** Always request the maximum: `?per_page=100&sort=updated`. For most personal accounts this covers everything. If a user has more than 100 repos, implement link-header pagination using the `Link` response header. For this portfolio, 100 is almost certainly sufficient — and you will likely filter to show only the most relevant repos anyway.

**Detection:** Count repos in the GitHub UI and compare to what the site renders.

**Phase:** GitHub API integration phase.

---

### Pitfall 7: Importing `next/router` instead of `next/navigation` in App Router

**What goes wrong:** `useRouter`, `usePathname`, and `useSearchParams` must be imported from `next/navigation` when using the App Router. Importing them from `next/router` (the Pages Router location) either throws a runtime error or silently returns undefined values.

**Why it happens:** Most tutorials and Stack Overflow answers for `useRouter` still reference `next/router`. A beginner following older docs will copy the wrong import.

**Consequences:** Navigation hooks return undefined, causing null pointer errors or no-ops that are confusing to debug.

**Prevention:** App Router rule: always import from `next/navigation`. The TypeScript compiler will not catch this mistake — both imports resolve to a module, but `next/router` hooks are not compatible with the App Router at runtime.

**Detection:** If `router.push()` does nothing, or `usePathname()` returns undefined, check the import source first.

**Phase:** Foundation phase — note this in project conventions.

---

### Pitfall 8: `window` / `document` / `localStorage` accessed during SSR/build-time prerender

**What goes wrong:** Client Components are pre-rendered to HTML at build time (`next build`). Browser globals (`window`, `document`, `localStorage`, `navigator`) do not exist in the Node.js build environment. Accessing them at module load time or in the render body throws a `ReferenceError` that crashes the build.

**Why it happens:** In `next dev`, the fast refresh cycle can obscure this because hydration happens quickly. Build-time prerender runs in Node.js, where these globals are absent.

**Prevention:** Access browser globals only inside `useEffect` (which runs client-side only) or behind a `typeof window !== 'undefined'` guard for non-React code.

**Detection:** `next build` throws `ReferenceError: window is not defined` in a component that accesses `window` at render time.

**Phase:** Any phase where scroll behavior, theme detection, or browser-API-based animation is added.

---

### Pitfall 9: CLS from images without explicit dimensions

**What goes wrong:** If an `<img>` tag (or misconfigured `<Image>`) has no `width` and `height` attributes, the browser reserves no space for it during HTML parse. When the image loads, the page reflows and content jumps. This tanks CLS scores and looks unprofessional.

**Why it happens:** Developers write `<img src="..." />` without dimensions because it "looks fine" during development on fast local machines where images load instantly.

**Prevention:** Every `<img>` tag must have explicit `width` and `height` attributes. Use CSS `aspect-ratio` when the intrinsic size is unknown. For `next/image` with `unoptimized: true`, dimensions are still required props and the component enforces this at compile time.

**Detection:** Run Lighthouse (PageSpeed Insights) — CLS > 0.1 is the first thing to investigate. Chrome DevTools Performance tab visualizes layout shifts with purple markers.

**Phase:** First time any image is added to the site.

---

### Pitfall 10: `next-env.d.ts` committed to the repo and causing stale type conflicts

**What goes wrong:** `next-env.d.ts` is auto-generated by Next.js on every `next dev` or `next build`. Committing it causes merge conflicts and can cause stale type definitions if the committed version is out of sync with the installed Next.js version.

**Why it happens:** Beginners commit all files including auto-generated ones.

**Prevention:** Add `next-env.d.ts` to `.gitignore`. It will be regenerated on every build. This is explicitly recommended in the Next.js TypeScript documentation.

**Detection:** If two developers get a git merge conflict in `next-env.d.ts`, it is not in `.gitignore`.

**Phase:** Foundation / project setup phase — set up `.gitignore` correctly before first commit.

---

### Pitfall 11: `typescript.ignoreBuildErrors: true` used to "fix" a failing build

**What goes wrong:** A beginner hits a TypeScript error during `next build`, doesn't understand it, and adds `typescript: { ignoreBuildErrors: true }` to `next.config.ts` to make the build pass. TypeScript errors are now completely silent in CI. Real type bugs ship to production undetected.

**Why it happens:** The error message from `next build` suggests this option. It's tempting when under pressure to deploy.

**Consequences:** The entire value of TypeScript disappears. Bugs that types would have caught reach the deployed site.

**Prevention:** Never use `ignoreBuildErrors`. Fix the actual TypeScript error. For a beginner, common sources are: forgetting `await` on an async function, missing `?.` on a nullable API response field, or using `any` where a proper type is available.

**Detection:** Grep the codebase for `ignoreBuildErrors` — if it exists, remove it and fix what it was hiding.

**Phase:** Any phase — but most dangerous if introduced early and forgotten.

---

## Minor Pitfalls

---

### Pitfall 12: GitHub Pages 404 for direct navigation to client-side routes

**What goes wrong:** GitHub Pages serves static files. If the site has multiple routes (e.g., a future `/projects` page) and a user navigates directly to that URL or refreshes, GitHub Pages returns a 404 because there is no `/projects/index.html`.

**Why it happens:** SPA routing relies on the server to serve `index.html` for all routes. GitHub Pages does not support this fallback.

**Prevention for this project:** The site is a single scrolling page with no sub-routes. This is not a concern for the current scope. If routes are ever added, use the `trailingSlash: true` option and ensure `generateStaticParams` generates a corresponding HTML file for every route.

**Detection:** Navigate directly to a sub-URL on the deployed site. If it returns 404, the HTML file was not generated.

**Phase:** Only relevant if multi-page routing is added later.

---

### Pitfall 13: Font FOUT (Flash of Unstyled Text) from incorrect `next/font` setup

**What goes wrong:** `next/font` eliminates FOUT when used correctly — it self-hosts the font and inlines a `size-adjust` CSS trick to prevent layout shift. But developers sometimes import fonts via a plain `<link>` to Google Fonts (common tutorial pattern) instead of `next/font/google`. This reintroduces external network requests and FOUT.

**Why it happens:** Old tutorials and the Google Fonts quickstart documentation show the `<link>` approach. It looks simpler.

**Prevention:** Use `next/font/google` exclusively. Never add a `<link rel="stylesheet">` to Google Fonts. The font is automatically self-hosted at build time and included in the static export with no additional configuration needed.

**Detection:** WebPageTest or Lighthouse shows `font-display: swap` with a visible text shift, or the network tab shows a request to `fonts.googleapis.com`.

**Phase:** Typography / design setup phase.

---

### Pitfall 14: Cron schedule delayed or dropped at the top of the hour

**What goes wrong:** GitHub Actions documents that scheduled workflows experience delays during high-load periods, specifically noting the top of every hour is peak congestion. A cron set to `0 2 * * *` (2:00 AM) may run at 2:20 AM or later, or occasionally be dropped under extreme load.

**Why it happens:** Shared infrastructure load patterns.

**Prevention:** For a daily rebuild of a portfolio site this is a non-issue — a 20-minute delay or even an occasional missed run has zero user impact. Avoid scheduling at exactly `0 * * * *` (top of hour) by using minutes like `15` or `47`.

**Detection:** Check the Actions run history. Timestamps will show actual execution time vs scheduled time.

**Phase:** GitHub Actions setup phase — a one-line cron expression change.

---

### Pitfall 15: Animating layout-bound CSS properties causing jank

**What goes wrong:** Animating `height`, `width`, `top`, `left`, `margin`, or `padding` triggers browser layout recalculation on every frame, causing janky scrolling and poor CLS scores even on capable hardware. This is especially visible on scroll-linked animations.

**Why it happens:** These feel like the natural properties to animate (e.g., "make this div slide down" by animating `height`).

**Prevention:** Animate `transform` and `opacity` exclusively. These are compositor-friendly and do not trigger layout. For slide-in effects, use `transform: translateY()`. For reveals, use `opacity` plus optionally `clip-path`. Add `will-change: transform` narrowly and remove it after the animation completes.

**Detection:** Chrome DevTools Performance panel shows "Layout" or "Recalculate Style" events inside the animation frame. Anything purple in the main thread timeline during a scroll is a red flag.

**Phase:** Any phase involving CSS transitions or scroll animations.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Project initialization | Missing `basePath` / `assetPrefix` for project-scoped repo | Determine URL structure first; set config before any pages |
| Project initialization | `next-env.d.ts` committed | Add to `.gitignore` immediately |
| Project initialization | `next/image` used without `unoptimized: true` | Set `images: { unoptimized: true }` or use `<img>` tags |
| GitHub API integration | Silent truncation at 30 repos | Always pass `per_page=100` |
| GitHub API integration | Rate limit crash during build | Wrap in try/catch with graceful fallback |
| GitHub Actions setup | Scheduled workflow disabled after inactivity | Document the 60-day limit; add `workflow_dispatch` trigger |
| GitHub Actions setup | Cron at top of hour | Schedule at non-zero minutes (e.g., `15 2 * * *`) |
| Typography setup | Google Fonts via `<link>` instead of `next/font` | Use `next/font/google` exclusively |
| Any image work | Images without explicit dimensions | Always set `width` and `height` |
| Any component work | `next/router` import instead of `next/navigation` | App Router always uses `next/navigation` |
| Any animation work | Layout-bound property animation | Use `transform` and `opacity` only |
| Any TS work | `ignoreBuildErrors: true` as a shortcut | Never add this; fix the actual error |

---

## Sources

- Next.js static export docs (official, v16.2.6, verified 2026-05-17): https://nextjs.org/docs/app/guides/static-exports
- Next.js basePath config (official, v16.2.6): https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath
- Next.js TypeScript config (official, v16.2.6): https://nextjs.org/docs/app/api-reference/config/typescript
- Next.js useRouter (official, v16.2.6): https://nextjs.org/docs/app/api-reference/functions/use-router
- Next.js font optimization (official, v16.2.6): https://nextjs.org/docs/app/getting-started/fonts
- GitHub REST API rate limits (official): https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api
  - Unauthenticated: 60 requests/hour (IP-based), HIGH confidence
- GitHub Pages limits (official): https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
  - 1 GB site size, 100 GB/month bandwidth, 10 builds/hour (bypassed by Actions)
- GitHub Actions schedule event (official): https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule
  - 60-day inactivity disable, top-of-hour congestion, HIGH confidence
- GitHub Actions deploy-pages action (official): https://github.com/actions/deploy-pages
  - Requires `pages: write` and `id-token: write` permissions, HIGH confidence
- web.dev CLS guide (official): https://web.dev/articles/cls
  - Layout shift causes and compositor-friendly animation patterns, HIGH confidence
