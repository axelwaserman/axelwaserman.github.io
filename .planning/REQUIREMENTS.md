# Requirements — Personal Website (axelwaserman.github.io)

## v1 Requirements

### Hero

- [x] **HERO-01**: Page shows user's name and title/tagline on load
- [x] **HERO-02**: Hero section includes a 1-2 sentence personal bio
- [x] **HERO-03**: Hero section includes CTA links to GitHub, LinkedIn, email, and CV download

### CV

- [x] **CV-01**: Work experience section with role, company, dates, and brief description per entry
- [x] **CV-02**: Education section with degree, institution, and years per entry
- [x] **CV-03**: Skills section listing languages, tools, and frameworks as a flat list (no progress bars)
- [x] **CV-04**: Contact section with email, LinkedIn, and GitHub links

### Projects

- [x] **PROJ-01**: Projects section fetches public GitHub repos via the GitHub REST API at build time
- [x] **PROJ-02**: Each project entry displays the repo name and description
- [x] **PROJ-03**: Each project entry links to a live demo if the repo's `homepage` field is set

### Infrastructure

- [x] **INFRA-01**: Single scrolling page with a sticky/fixed header containing anchor nav links to each section
- [x] **INFRA-02**: Fully responsive layout — usable on mobile (320px+) and desktop (1440px)
- [x] **INFRA-03**: OpenGraph meta tags set for accurate social sharing preview (title, description, image)
- [x] **INFRA-04**: Downloadable CV PDF linked from the site (user provides the PDF file)
- [x] **INFRA-05**: Subtle scroll-reveal animations on section entry (fade/slide, respects `prefers-reduced-motion`)
- [x] **INFRA-06**: Next.js static export (`output: 'export'`) producing a deployable `out/` directory
- [ ] **INFRA-07**: GitHub Actions workflow with daily cron trigger: rebuilds and deploys to `axelwaserman.github.io`

---

## Milestone v1.1 — Positioning Requirements

Reposition site + CV for Engineering Manager / Staff Data Engineer roles at async, fully-remote B2B SaaS. Eliminate corporate fluff and passive verbs; project high-agency, async-first, metrics-driven engineering identity.

### Engineering Philosophy

- [ ] **PHIL-01**: Standalone Engineering Philosophy section rendered between CV and Projects on the homepage, with section heading and three pillar cards (Documentation First / High Agency & Iteration / Metrics over Activity)
- [ ] **PHIL-02**: Each pillar card renders the pillar title and a single body paragraph using the verbatim copy from the milestone spec (async-first, synchronous-overhead-minimization framing)
- [ ] **PHIL-03**: Section is fully static-export compatible (no client-side data fetching), uses existing typography tokens, and is readable at 320 / 768 / 1440 widths

### Project Portfolio

- [ ] **PORT-01**: Each project card renders three labelled blocks — Problem, Solution, Impact — instead of a single description paragraph
- [ ] **PORT-02**: Every project's Impact block contains at least one explicit quantitative metric (percentage, time saved, throughput, or count)
- [ ] **PORT-03**: Project data source (GitHub-fetched repos in `src/data/projects.ts` or equivalent) carries Problem / Solution / Impact fields per repo, populated for the showcased projects (work_assistant, data pipelines, math visualizer at minimum)
- [ ] **PORT-04**: Empty / fallback states for repos missing P/S/I metadata gracefully degrade to existing single-description rendering (no broken cards in production)

### CV — Content (Typst)

- [ ] **CV-CONTENT-01**: Every operational bullet across all roles in `assets/CV.typ` uses a high-agency engineering verb (Architected / Spearheaded / Shipped / Consolidated / Drove / Built / Established / Eliminated / Migrated) and contains zero instances of `responsible for`, `managed team of`, `assisted with`, `helped`, `worked on`, `participated in`, `tasked with`
- [ ] **CV-CONTENT-02**: Every operational bullet contains at least one explicit quantitative metric (e.g. % reduction, latency drop, deployment frequency delta, retention rate, dollar amount, headcount, time saved)
- [ ] **CV-CONTENT-03**: ATS scannability preserved — single or standard dual-column text layout; zero graphic skill bars / progress wheels / decorative canvas elements

### CV — Build & Distribution

- [ ] **CV-BUILD-01**: Typst compiler output target renamed from `cv.pdf` to `Axel_Waserman_Engineering_Manager.pdf`; build command produces this filename deterministically
- [ ] **CV-BUILD-02**: Compiling `assets/CV.typ` produces zero errors, zero warnings, and zero layout overflow on the latest stable Typst CLI
- [ ] **CV-BUILD-03**: All download paths in the site source (`Hero.tsx` CV download anchor, `DownloadCVButton.tsx`, any references in tests / e2e specs / data modules) point to the new filename — zero dead `cv.pdf` references in the production build output

---

## v2 (Deferred)

- Language tag and star count per project card (GitHub API fields available, deferred for v1 simplicity)
- GitHub repo topics displayed as tags on project entries
- Light/subtle hover interactions on project cards

---

## Out of Scope

- Blog / writing section — adds scope, content maintenance burden; defer indefinitely
- Dark mode toggle — single intentional light theme chosen; avoid half-baked dual-theme
- Contact form with server-side processing — incompatible with GitHub Pages static hosting
- Skill progress bars — universally considered misleading/negative signal in tech hiring
- CMS or admin panel — all content lives in code; no dynamic backend
- Authentication / login — no private content

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| HERO-01 | Phase 2 | Complete |
| HERO-02 | Phase 2 | Complete |
| HERO-03 | Phase 2 | Complete |
| CV-01 | Phase 2 | Complete |
| CV-02 | Phase 2 | Complete |
| CV-03 | Phase 2 | Complete |
| CV-04 | Phase 2 | Complete |
| PROJ-01 | Phase 3 | Complete |
| PROJ-02 | Phase 3 | Complete |
| PROJ-03 | Phase 3 | Complete |
| INFRA-01 | Phase 2 | Complete |
| INFRA-02 | Phase 2 | Complete |
| INFRA-03 | Phase 2 | Complete |
| INFRA-04 | Phase 2 | Complete |
| INFRA-05 | Phase 2 | Complete |
| INFRA-06 | Phase 1 | Complete |
| INFRA-07 | Phase 4 | Pending |
