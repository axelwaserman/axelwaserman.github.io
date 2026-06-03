# Personal Website

## What This Is

A single-page personal website serving as a public home on the web — for job seeking, personal branding, and portfolio showcase. It includes a CV section (work experience, education, skills, contact), and a GitHub projects list that stays fresh via a daily GitHub Actions rebuild pulling from the GitHub API.

## Core Value

A recruiter, collaborator, or curious stranger can land on the site, understand who Axel is, and find his work within 30 seconds — no friction, no staleness.

## Requirements

### Validated

- [x] **PROJ-01** (Phase 3, verified 2026-06-03): Projects section fetches public GitHub repos via REST API at build time
- [x] **PROJ-02** (Phase 3, verified 2026-06-03): Each project entry displays repo name and description
- [x] **PROJ-03** (Phase 3, verified 2026-06-03): Each project entry links to a live demo if `homepage` field is set

### Active

- [ ] Single scrolling page with sections: hero/intro, about/CV, projects, contact
- [ ] CV section with work experience, education, skills, and contact/social links
- [ ] GitHub projects list: fetched from GitHub API, rebuilt daily via GH Actions (Phase 3 shipped build-time fetch; daily rebuild lands in Phase 4)
- [ ] Each project entry shows name, description, primary language (star count deliberately excluded per D-08)
- [ ] Static export for GitHub Pages hosting (Next.js `output: 'export'`)
- [ ] Automated daily rebuild and deploy via GitHub Actions (Phase 4)
- [ ] Minimal light design: white/near-white background, black text, rounded corners, clean typography

### Out of Scope

- Blog / writing section — scope creep, add later if needed
- Dark mode toggle — keep it simple, single intentional light theme
- CMS / admin panel — content is code (no dynamic backend)
- Contact form with server-side processing — static site; link to email or social instead
- Auth / login — no private content

## Context

- Builder is learning frontend development with React and TypeScript — this project is both a deliverable and a learning exercise.
- Hosted on GitHub Pages, which requires Next.js static export mode.
- GitHub projects data is pulled from the GitHub public API at build time — no secrets needed for public repos.
- Daily rebuild scheduled via GitHub Actions to keep project metadata (stars, descriptions) fresh.
- Design direction: minimal, editorial, light background, rounded corners, strong typography — not "gamer", not dark, not template-default.

## Constraints

- **Hosting**: GitHub Pages — requires `output: 'export'` in Next.js config; no server-side rendering or API routes at runtime
- **Tech stack**: Next.js + TypeScript + React — chosen to learn modern frontend patterns
- **Data freshness**: Projects list updated via scheduled GH Actions rebuild, not real-time
- **Content management**: All content is hardcoded or sourced from GitHub API — no CMS
- **Design**: Light theme only; avoid anything that looks like a stock template

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js over Astro | Learning React/TS is a primary goal alongside shipping | — Pending |
| Static export for GH Pages | GitHub Pages is free, zero maintenance hosting | — Pending |
| Build-time GH API fetch | Avoids client-side rate limiting and API key exposure | — Validated (Phase 3) |
| Single page layout | Simpler, faster to build, better for personal sites | — Pending |
| Build-time fetch with committed JSON fallback | Build never breaks if GitHub is unreachable; stale data > broken site | — Validated (Phase 3) |
| `import 'server-only'` on fetcher | Prevent any future accidental token leak to client bundle | — Validated (Phase 3) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-03 after Phase 3 verification*
