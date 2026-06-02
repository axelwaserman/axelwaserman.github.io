# Phase 3: Projects - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 3-projects
**Areas discussed:** Card design & grid, Repo ordering & count, Extra metadata per card, Build-time error handling

---

## Card design & grid

| Option | Description | Selected |
|--------|-------------|----------|
| Responsive card grid | 2–3 columns desktop, 1 mobile. Anti-template: push beyond generic Tailwind grid. | ✓ |
| Horizontal list / feed | Single column, wide rows. More editorial. | |
| Bento layout | Mixed sizes, some spanning 2 columns. | |

**User's choice:** Responsive card grid

---

## Geometric/mandala animation placement

| Option | Description | Selected |
|--------|-------------|----------|
| Per-card background decoration | Unique SVG per card seeded from repo name | |
| Section header decoration | One large generative visual above Projects heading | |
| Card hover reveal | Geometric pattern animates in on hover | |
| You decide (non-distracting) | Leave placement to Claude | |
| Full-page background or global accent | Subtle persistent element across the whole page | ✓ |

**User's choice:** Full-page background or global accent
**Notes:** Deferred to its own phase (Phase 3b: Visual) as it touches the global layout shell rather than just the Projects section.

---

## Repo ordering & count

| Option | Description | Selected |
|--------|-------------|----------|
| Most recently pushed | Sort by `pushed_at` descending | ✓ (ordering) |
| Most starred | Sort by `stargazers_count` descending | |
| Manual order via config list | Prioritized list of repo names | |
| All non-archived public repos | No count cap | ✓ (count) |
| Cap at 12 | Show 12 most recently pushed | |
| Cap at 6 | Tighter showcase, only 6 | |

**User's choice:** Most recently pushed, all non-archived (no cap)

---

## Extra metadata per card

| Option | Description | Selected |
|--------|-------------|----------|
| Primary language | e.g. "TypeScript", "Python" — from API | ✓ |
| Star count | Stargazers count | |
| Last pushed date | Relative "3 months ago" or absolute | ✓ |

**User's choice:** Primary language + last pushed date (star count excluded)

---

## Build-time error handling

| Option | Description | Selected |
|--------|-------------|----------|
| Hard fail the build | Throw error, stop build immediately | |
| Fall back to empty list | Log warning, render "Projects coming soon" | |
| Fall back to cached JSON file | Keep committed `src/data/projects.json`; use on API failure | ✓ |

**User's choice:** Fall back to committed JSON cache

---

## Claude's Discretion

- Relative date formatting approach
- Exact card visual design (hover states, shadow depth, language tag styling)
- GitHub API endpoint choice
- `projects.json` fallback schema
- Component file structure within `src/components/projects/`

## Deferred Ideas

- **Full-page geometric/mandala background animation** — global ambient background accent across the whole page. Recommended as Phase 3b: Visual. Does not block Phase 4 Deploy.
