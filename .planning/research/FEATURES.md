# Feature Landscape

**Domain:** Personal developer portfolio website
**Researched:** 2026-05-17
**Confidence:** HIGH (drawn from 10+ real production portfolio sites + GitHub community curation of 1,600+ portfolios)

---

## Table Stakes

Features visitors expect. Missing = site feels incomplete or unprofessional, raises doubt about attention to detail.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero / intro section | First impression; establishes who you are within 5 seconds | Low | Name, role/title, one-line positioning statement |
| About / professional bio | Visitors want to understand background before engaging with work | Low | 2-4 sentences; avoids wall-of-text |
| Work experience timeline | Recruiters scan this first; without it the site reads as a student project | Low–Med | Chronological, company + role + dates; brief outcome bullet |
| Skills list | Enables quick stack-matching for recruiters and collaborators | Low | Avoid exhaustive lists; group by category (Languages, Frameworks, Tools) |
| Projects section | Core proof-of-work; without it the site is a CV not a portfolio | Med | See project entry requirements below |
| Contact / social links | Every visitor who wants to reach you will look for this | Low | At minimum: email link + GitHub + LinkedIn |
| Responsive layout | >50% of portfolio visitors arrive on mobile | Med | Must work at 320px through 1440px |
| Readable typography | Portfolio itself is a design artifact; bad type = bad signal | Low | Clear hierarchy: name > section headings > body |
| Anchor navigation | Single-page scroll without nav links is disorienting | Low | Smooth scroll to sections; active state on scroll position |
| Resume / CV download | Recruiters universally expect a downloadable PDF | Low | PDF linked from the site; keep it in-repo or linked from a stable URL |

### Project Entry — Required Fields

Each project card/row must include all of the following to meet table stakes:

| Field | Why | Source |
|-------|-----|--------|
| Name | Identity | GitHub API `name` |
| Description | Context; what it does and why | GitHub API `description` |
| Primary language | Quick stack signal | GitHub API `language` |
| Star count | Social proof and community interest indicator | GitHub API `stargazers_count` |
| Link to repo | Let visitors inspect the code | GitHub API `html_url` |

Optional but valuable (not required for table stakes):

| Field | Why | Source |
|-------|-----|--------|
| Live demo link | Shows it actually works | GitHub API `homepage` |
| Topics / tags | Helps categorize (e.g., react, cli, open-source) | GitHub API `topics` |
| Last updated | Shows active maintenance | GitHub API `pushed_at` |

---

## Differentiators

Features that set the site apart. Not expected, not penalized if absent, but memorable when present.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Pinned / curated project ordering | Shows editorial judgment; prevents GitHub star-count from purely dictating order | Low | Allow manual pin list in config; fall back to star-sort |
| Topics/tag filtering on projects | Useful when project count exceeds ~8 | Med | Simple client-side filter by language or tag |
| Personality signal in copy | Humanizes the developer; distinguishes from template-paste bios | Low | One concrete personal detail (obsession, side interest, location) in the hero or about section |
| Subtle scroll-driven entrance animations | Conveys frontend craft without overwhelming content | Med | Intersection Observer + CSS transitions; NOT GSAP scrollytelling for this scope |
| Correct OpenGraph / meta tags | Site preview looks professional when shared on LinkedIn, Slack, etc. | Low | og:title, og:description, og:image; critical for job search sharing |
| Favicon with intentional design | Small detail that signals care | Low | Custom SVG or 32×32 PNG; not default Next.js icon |
| Location + timezone / availability status | Useful context for remote-work recruiters | Low | Static text; no dynamic data needed |
| Archived project toggle | Keeps list clean while preserving history | Low | Filter out `archived: true` repos by default; optional show toggle |

---

## Anti-Features

Features to explicitly NOT build for v1. These commonly clutter portfolios, increase maintenance burden, or actively undermine the target audience (recruiters, collaborators).

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Skill progress bars / percentages | Universally mocked in tech hiring; "95% JavaScript" signals self-deception | List skills as plain grouped tags; let the projects prove proficiency |
| Animated loading screen / splash | Delays content delivery; annoys returning visitors; adds no information | Load content immediately; entrance animations on scroll are sufficient |
| Visitor counter or "views" badge | Looks amateur on personal sites | Omit entirely |
| Auto-playing audio | Aggressive UX; triggers immediate close | Never |
| Parallax background images | Heavy, layout-jank-prone, distracting | Use static backgrounds with intentional CSS depth instead |
| Contact form with server-side processing | Requires backend infrastructure incompatible with GH Pages static hosting | Direct email link (mailto:) + social links |
| Blog / writing section | Scope creep for v1; empty blog sections are worse than no blog | Add in a future phase when there is content to ship |
| Dark mode toggle | Extra design work (two full color systems) for low incremental value on a minimal light site | Single intentional light theme, well-executed |
| Technology logo carousel / icon wall | Template-default; provides no signal; recruiters skip it | Skills grouped as readable text |
| Counter animations (counting up to "5 years experience") | Gimmicky; slows time-to-information | State facts plainly |
| Full-screen video background | Massive performance cost; accessibility nightmare | Static visual or no background media |
| CMS / admin panel | Adds complexity; content is stable and infrequently changed | Content in code; edit via git |
| Easter eggs / hidden pages | Fine for established developers with fans; for a job-seeking portfolio it wastes visitor attention | Ship the core product first |

---

## Feature Dependencies

```
Anchor navigation → Single-page section structure (must have IDs on sections)
Resume download → PDF asset in repo or external link (needed before launch)
OpenGraph tags → og:image asset (need at least a 1200×630 static image)
Archived project toggle → Projects section (extends it; not independent)
Topics/tag filtering → Projects section (extends it; not independent)
Daily GitHub API rebuild → GitHub Actions workflow + Next.js build-time fetch
```

---

## UX Expectations

### Navigation
- Sticky header or at minimum an in-page anchor nav is expected on single-page sites
- Smooth scrolling is standard; instant jump feels jarring
- Active section highlight as visitor scrolls is a differentiator that costs little
- Mobile nav: hamburger or compact icon row; not a full desktop nav that overflows

### Scroll Behavior
- Single page means all content is on one URL; anchor links (`/#projects`) must work
- Scroll progress should not be artificially throttled by heavy JS
- Entrance animations must respect `prefers-reduced-motion`

### Mobile
- Touch targets: minimum 44×44px for all interactive elements
- No horizontal overflow at any breakpoint
- Project cards must be readable at 320px (not just at 768px+)
- Contact links must be tappable without zooming

### Contact Patterns — What Actually Gets Used

Based on observed patterns across 10+ production portfolios:

| Method | Usage Pattern | Recommendation |
|--------|--------------|----------------|
| Email (mailto: link) | High — direct, zero friction, works offline | Primary contact method |
| LinkedIn profile link | High — expected by recruiters | Include in contact section and footer |
| GitHub profile link | High — expected by developers | Include in nav/header and contact |
| Contact form (static, Formspree-style) | Medium — adds friction; not needed for personal site | Skip for v1 (out of scope per PROJECT.md) |
| Twitter / X | Low — declining professional relevance | Include if active; optional |
| Discord | Low — niche; mostly OSS maintainers | Omit unless relevant to persona |
| Phone number | Very low — privacy concern; not expected | Omit |

Practical recommendation: mailto: link + LinkedIn + GitHub covers 95% of actual contact needs. Keep it to these three.

---

## MVP Recommendation

Based on the project scope defined in PROJECT.md (single-page, job-seeking, recruiter-facing):

**Prioritize for v1:**
1. Hero with name, role, one-line positioning
2. About / bio (concise; personality signal)
3. Work experience timeline
4. Skills (grouped tags, no bars)
5. Projects section (fetched from GitHub API at build time; name, description, language, stars, repo link)
6. Contact section (mailto + LinkedIn + GitHub)
7. Anchor navigation with smooth scroll
8. Resume / CV download link
9. Correct OpenGraph / meta tags
10. Responsive layout (320–1440px)

**Defer (not v1):**
- Tag filtering on projects — only needed when project count exceeds ~8
- Topics display — nice-to-have; add after confirming GitHub topics are populated
- Blog section — out of scope per PROJECT.md
- Archived project toggle — can filter archived repos in the API fetch logic without needing UI

**Explicitly exclude:**
Everything in the Anti-Features table.

---

## Sources

- Brittany Chiang portfolio (brittanychiang.com) — HIGH confidence, direct observation
- Lee Robinson portfolio (leerob.com) — HIGH confidence, direct observation
- Delba de Oliveira portfolio (delba.dev) — HIGH confidence, direct observation
- Paco Coursey portfolio (paco.me) — HIGH confidence, direct observation
- Anthony Fu portfolio (antfu.me) — HIGH confidence, direct observation
- Tobias Ahlin portfolio (tobiasahlin.com) — HIGH confidence, direct observation
- Samuel Kraft portfolio (samuelkraft.com) — HIGH confidence, direct observation
- Ryan Mulligan portfolio (ryanmulligan.dev) — HIGH confidence, direct observation
- Tania Rascia portfolio (taniarascia.com) — HIGH confidence, direct observation
- Emma Bostian curated list (github.com/emmabostian/developer-portfolios) — HIGH confidence, 1,681 examples reviewed at pattern level
- GitHub REST API docs (docs.github.com) — HIGH confidence, official source
- The Odin Project portfolio requirements (theodinproject.com) — MEDIUM confidence, curriculum reference
