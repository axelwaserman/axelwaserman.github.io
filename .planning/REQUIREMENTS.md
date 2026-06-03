# Requirements — Personal Website (axelw.github.io)

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
- [ ] **INFRA-07**: GitHub Actions workflow with daily cron trigger: rebuilds and deploys to `axelw.github.io`

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
