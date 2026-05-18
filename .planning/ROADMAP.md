# Roadmap: Personal Website (axelw.github.io)

## Overview

Four phases, dependency-ordered: the build configuration and design system come first so every subsequent phase can build cleanly. Static content sections ship next, producing a visually complete site before any API work. The GitHub data layer wires in after the static shell is proven. Deployment goes last — deploy a confirmed working build, not a guess.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Project scaffold, static export config, design tokens, and HTML shell
- [ ] **Phase 2: Content** - All static sections (Hero, CV, About, Contact) with layout, navigation, and responsiveness
- [ ] **Phase 3: Projects** - GitHub API data layer and projects section wired end-to-end
- [ ] **Phase 4: Deploy** - GitHub Actions workflow with daily cron delivering the live site

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
- [ ] 01-01-PLAN.md — Scaffold, static export config, design tokens, font loading, and HTML shell

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
**Plans**: TBD
**UI hint**: yes

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
**Plans**: TBD

### Phase 4: Deploy
**Goal**: The site is live at axelw.github.io, auto-deploys on every push to main, and rebuilds daily to keep GitHub project data fresh
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: INFRA-07
**Success Criteria** (what must be TRUE):
  1. Pushing to main triggers a GitHub Actions build and the live site at axelw.github.io updates within minutes
  2. A daily cron job (with `workflow_dispatch` fallback) rebuilds and redeploys the site automatically
  3. The workflow uses `actions/configure-pages@v5` so no manual `basePath` configuration is needed
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/1 | Not started | - |
| 2. Content | 0/TBD | Not started | - |
| 3. Projects | 0/TBD | Not started | - |
| 4. Deploy | 0/TBD | Not started | - |
