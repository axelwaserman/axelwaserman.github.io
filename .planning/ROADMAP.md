# Roadmap: Personal Website (axelw.github.io)

## Overview

Five phases, dependency-ordered: the build configuration and design system come first so every subsequent phase can build cleanly. Static content sections ship next, producing a visually complete site before any API work. The GitHub data layer wires in after the static shell is proven. Deployment goes after that — deploy a confirmed working build, not a guess. Phase 5 closes remaining polish items surfaced in production: favicon, decorative pattern, real CV data, and switching from dummy to live GitHub project data.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffold, static export config, design tokens, and HTML shell (completed 2026-05-18)
- [x] **Phase 2: Content** - All static sections (Hero, CV, About, Contact) with layout, navigation, and responsiveness (completed 2026-05-21)
- [x] **Phase 3: Projects** - GitHub API data layer and projects section wired end-to-end (completed 2026-05-30, currently rendering fallback/dummy data — see Phase 5)
- [x] **Phase 4: Deploy** - GitHub Actions workflow with daily cron delivering the live site (completed 2026-06-03)
- [x] **Phase 5: Polish** - Favicon, decorative mandala pattern, real CV content + hyperlinks, real GitHub projects from the API (not the fallback) (completed 2026-06-05)
- [ ] **Phase 6: Get-in-touch form** - Replace direct contact links (mailto/LinkedIn/GitHub) with a Formspree-backed contact form; keep email visible as plain text + JSON-LD Person markup for ATS / SEO crawlers

## Phase Details

### Phase 1: Foundation

**Goal**: A clean `next build` succeeds with correct static export config, design tokens, font loading, and an HTML shell — no page content yet, but the entire project skeleton is right
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-06
**Success Criteria** (what must be TRUE):

  1. `next build` completes without errors and produces an `out/` directory
  2. `next.config.ts` has `output: 'export'` and `images: { unoptimized: true }` set
  3. Design tokens (palette, type scale, spacing) exist in `styles/tokens.css` as CSS custom properties
  4. `app/layout.tsx` renders a valid HTML shell with font loading and metadata object in place

**Plans**: 1 plan

Plans:

- [x] 01-01-PLAN.md — Scaffold, static export config, design tokens, font loading, and HTML shell

### Phase 2: Content

**Goal**: A recruiter can visit the local dev server, read Axel's name, bio, work experience, education, skills, and contact details, and download the CV — fully responsive from 320px to 1440px
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: HERO-01, HERO-02, HERO-03, CV-01, CV-02, CV-03, CV-04, INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05
**Success Criteria** (what must be TRUE):

  1. Visitor sees name, title/tagline, and 1-2 sentence bio on page load without scrolling
  2. Visitor can click anchor nav links in the sticky header to jump to Hero, CV, Projects, and Contact sections
  3. Visitor can read work experience, education, and skills without seeing progress bars anywhere
  4. Visitor can click email, LinkedIn, GitHub, and CV download links from both the hero and contact sections
  5. Layout is usable and overflow-free at 320px mobile and 1440px desktop; scroll-reveal animations respect `prefers-reduced-motion`

**Plans**: 3 plans
**UI hint**: yes

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Design token extensions (--space-section, --radius-card, animation tokens) and typed CV data file (cv.ts)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — OpenGraph metadata, Header (sticky nav, scroll-state), Hero section (name, bio, CTAs)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — CV sections (Work, Education, Skills), Contact section, FadeUp scroll-reveal, page wiring

### Phase 3: Projects

**Goal**: The projects section is populated with Axel's public GitHub repos fetched at build time — each entry shows name, description, and a repo link; archived repos are excluded
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: PROJ-01, PROJ-02, PROJ-03
**Success Criteria** (what must be TRUE):

  1. Running `next build` fetches repos from the GitHub API and bakes them into static HTML (no client-side fetch)
  2. Each project card shows the repo name, description, and a link to the repo
  3. Project cards with a `homepage` field show a live demo link; cards without one do not
  4. Archived repos do not appear in the projects list

**Plans**: 3 plans

Plans:

**Wave 1**

- [ ] 03-01-PLAN.md — Project type, build-time GitHub fetcher, ProjectCard + Projects Server Components, page wiring (vertical slice)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 03-02-PLAN.md — Committed projects.json fallback + try/catch resilience in fetchProjects (D-06)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 03-03-PLAN.md — formatRelativeDate utility, ProjectsEmptyState, UI-SPEC polish (hover/focus states, relative date in meta), Playwright UAT spec

### Phase 4: Deploy

**Goal**: The site is live at axelw.github.io, auto-deploys on every push to main, and rebuilds daily to keep GitHub project data fresh
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: INFRA-07
**Success Criteria** (what must be TRUE):

  1. Pushing to main triggers a GitHub Actions build and the live site at axelw.github.io updates within minutes
  2. A daily cron job (with `workflow_dispatch` fallback) rebuilds and redeploys the site automatically
  3. The workflow uses `actions/configure-pages@v5` so no manual `basePath` configuration is needed

**Plans**: 3 plans

Plans:

**Wave 1**

- [x] 04-01-PLAN.md — Pages-enabled deploy workflow on push to main (configure-pages@v5, two-job build/deploy, GITHUB_TOKEN env)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-02-PLAN.md — Add daily cron schedule + workflow_dispatch trigger to deploy.yml

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04-03-PLAN.md — Add actions/cache@v4 for .next/cache to speed up incremental rebuilds

### Phase 5: Polish

**Goal**: A first-time visitor lands on https://axelwaserman.github.io/, sees a favicon in the browser tab, encounters a deliberate decorative mandala pattern, reads Axel's real CV (real names, dates, links — not placeholder text), and sees Axel's actual public GitHub repos in the projects section (fetched live from the API at build time, not the committed fallback)
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: (post-deploy polish — no requirement IDs; goal-derived)
**Success Criteria** (what must be TRUE):

  1. Browser tab for axelwaserman.github.io shows a favicon (no /favicon.ico 404 in DevTools console)
  2. The page features a deliberate mandala-style decorative pattern integrated into the design (location and styling chosen during phase planning — not a stock template element)
  3. CV section content (work experience, education, skills, contact links) reflects Axel's real history with working email, LinkedIn, and GitHub URLs — no Lorem Ipsum, placeholder names, or example.com links
  4. Projects section renders Axel's real public repos via the GitHub API at build time (not the projects.json fallback). Verified by inspecting the deployed HTML for repo names that match `gh repo list axelwaserman --visibility public --no-archived`

**Plans**: 8 plans

Plans:

**Wave 1** *(parallel-safe; no file overlaps)*

- [x] 05-01-PLAN.md — Stale username sweep + GITHUB_USERNAME workflow env (D-21, D-23) + metadata title alignment with D-15
- [x] 05-02-PLAN.md — CV data extraction from CV.typ + justfile + public/cv.pdf compile (D-10, D-11, D-13–D-16) + email TBD sentinel (D-17 prep)
- [x] 05-03-PLAN.md — Favicon via src/app/icon.tsx ImageResponse (D-18, D-19, D-20)
- [x] 05-04-PLAN.md — TDD: src/lib/mandala.ts pure utility (generateLines, CURATED_PAIRS, pickRandomPair) (D-03, D-04)

**Wave 2** *(blocked on Wave 1 — file/data dependencies)*

- [x] 05-05-PLAN.md — CV section components: bullets render, SkillGroupList, DownloadCVButton, centered layout (D-02, D-12, D-13, D-16) — depends on 05-02
- [x] 05-06-PLAN.md — HeroMandala client component + MandalaSVG + HeroMandalaControls + Hero two-column embed (D-01, D-05–D-09) — depends on 05-01, 05-04
- [x] 05-07-PLAN.md — Re-center Projects + Contact, data-driven contact (LinkedIn/GitHub/email) with email visible as plain text per D-17 (D-02, D-17 render) — depends on 05-01, 05-02

**Wave 3** *(phase exit gate)*

- [x] 05-08-PLAN.md — Refresh src/data/projects.json with live gh REST API fetch (D-24), live-deploy verification of all four Phase 5 Success Criteria + D-17 ATS/SEO email visibility (D-22) — depends on all prior plans

### Phase 6: Get-in-touch form

**Goal**: Visitors initiate contact via a Formspree-backed form embedded on the page that delivers messages to Axel's inbox; direct contact links (mailto / LinkedIn anchor / GitHub anchor) are removed from the contact section in favor of the form, while the email address itself remains visible as plain text and JSON-LD Person markup so ATS crawlers and search engines can still parse it
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: (post-launch UX — no requirement IDs; goal-derived)
**Success Criteria** (what must be TRUE):

  1. Contact section renders a working form (name + email + message fields) that submits to a configured Formspree endpoint and delivers an email to axel.waserman@gmail.com
  2. The plain-text email `axel.waserman@gmail.com` is present in the rendered HTML at least once (for ATS / scraper visibility) AND appears in a JSON-LD Person `<script type="application/ld+json">` block in `<head>`
  3. Direct contact links (mailto, LinkedIn anchor, GitHub anchor as primary contact channels) are removed from the Contact section; the form is the primary CTA. Hero CTA cluster is updated consistently per the form-first direction.
  4. Form respects `prefers-reduced-motion`, validates input client-side, and shows a clear success / error state on submission

**Plans**: 6 plans

Plans:
**Wave 1** *(parallel-safe; no file overlaps — three independent slices: deps+endpoint, JSON-LD, /thanks page)*

- [x] 06-01-PLAN.md — Add react-hook-form/zod/@hookform/resolvers, regenerate package-lock from scratch, create src/data/site.ts with FORMSPREE_ENDPOINT placeholder (D-01, D-04, D-07)
- [x] 06-02-PLAN.md — Inject Person JSON-LD <script type="application/ld+json"> into root layout, values sourced from cv.ts (D-22, SC-2 JSON-LD half)
- [x] 06-04-PLAN.md — Static /thanks confirmation route (Header + thanks block + plain-text email + Back link + noindex meta) (D-17, D-18)

**Wave 2** *(blocked on Wave 1 — depends on 06-01 deps + endpoint)*

- [x] 06-03-PLAN.md — Zod contact schema + ContactForm Client Component (RHF + zodResolver, AJAX submit, honeypot, error block) + Contact section refactor (form embedded, plain-text email caption, anchors removed) (D-02, D-05–D-16, D-20, D-21, D-23)

**Wave 3** *(phase exit gate)*

- [x] 06-05-PLAN.md — Hero CTA swap: replace mailto: anchor with same-page #contact 'Get in touch' anchor (D-19) — depends on 06-03
- [ ] 06-06-PLAN.md — Playwright E2E spec (validation/happy/error/honeypot/JSON-LD/visual screenshots), real Formspree ID provisioning (human checkpoint), visual review per feedback_visual_review_static_export.md — depends on 06-01..06-05


## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete   | 2026-05-18 |
| 2. Content | 3/3 | Complete   | 2026-05-21 |
| 3. Projects | 3/3 | Complete   | 2026-05-30 |
| 4. Deploy | 3/3 | Complete   | 2026-06-03 |
| 5. Polish | 0/8 | In progress | - |
| 6. Get-in-touch form | 5/6 | In Progress|  |
</content>
</invoke>