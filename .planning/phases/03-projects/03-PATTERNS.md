# Phase 3: Projects - Pattern Map

**Mapped:** 2026-06-02
**Files analyzed:** 8 new / 1 modified
**Analogs found:** 8 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/data/projects.ts` (type + maybe array) | data/types | request-response (build-time) | `src/data/cv.ts` | exact |
| `src/data/projects.json` (fallback) | data (static fallback) | file-I/O (build-time read) | `src/data/cv.ts` (shape only — no JSON peer exists) | role-match |
| `src/lib/projects.ts` (`fetchProjects`) | utility / data-loader | request-response (build-time fetch with fallback) | `src/data/cv.ts` (typed export) + `src/components/cv/CV.tsx` (data import) | role-match (no existing fetcher) |
| `src/lib/date.ts` (`formatRelativeDate`) | utility (pure) | transform | (no existing utility — `src/lib/` is empty) | no analog |
| `src/components/projects/Projects.tsx` | section component (Server) | request-response → render | `src/components/contact/Contact.tsx` (visible h2 section) + `src/components/cv/CV.tsx` (data-driven section) | exact |
| `src/components/projects/ProjectCard.tsx` | presentational component (Server) | render-only (props in) | `src/components/cv/WorkEntry.tsx` | exact |
| `src/components/projects/ProjectsEmptyState.tsx` | presentational component (Server) | render-only | `src/components/contact/Contact.tsx` (heading + body + link block) | role-match |
| `src/app/page.tsx` (modified) | route composition | render | itself (existing pattern) | exact |
| `e2e/uat-phase-03.spec.ts` | test (Playwright E2E) | render-validate | `e2e/uat-phase-02.spec.ts` | exact |

## Pattern Assignments

### `src/data/projects.ts` (type definitions + optionally helper consts)

**Analog:** `src/data/cv.ts`

**Imports/exports pattern** (`src/data/cv.ts:1-12`):
```typescript
export interface WorkEntry {
  role: string
  company: string
  dates: string       // e.g. "2022 — Present"
  description: string
}

export interface EducationEntry {
  degree: string
  institution: string
  years: string       // e.g. "2018 — 2022"
}
```

**Apply to Phase 3:** Define `Project` interface as a named export (no default exports anywhere). Match the field shape locked in 03-UI-SPEC.md §Component Inventory:
```typescript
export interface Project {
  name: string
  description: string | null
  language: string | null
  pushedAt: string         // ISO 8601
  repoUrl: string
  homepage: string | null
}
```
Field naming follows TS conventions (`camelCase`, e.g. `pushedAt` not `pushed_at`). The fetcher transforms GitHub's snake_case payload into this shape. Per `~/.claude/rules/typescript/coding-style.md`, `interface` is correct here (object shape that may be reused/extended). Avoid `any` on the GitHub API response — type the raw shape with a separate internal interface inside the fetcher and `unknown` at the JSON-parse boundary.

---

### `src/data/projects.json` (committed fallback)

**Analog:** `src/data/cv.ts` (shape only — there is no existing JSON file in `src/data/`)

**Why this analog:** The schema must round-trip with the `Project` type at compile time. `cv.ts` shows the project's preferred typed-data convention. JSON is used here only because Phase 3 specifically requires a raw-data fallback artifact that can be checked in by automation/humans without TypeScript syntax.

**Apply to Phase 3:**
- File is a JSON array of objects matching `Project[]`.
- Field names are camelCase (so the JSON parses directly into `Project[]` with no transformation).
- Seed with at minimum the `axelw.github.io` repo (the empty-state body links to it explicitly per UI-SPEC §Copywriting; if API fails for an empty user, JSON should still produce a non-empty grid OR fall through to the empty state — planner decides). Keep `language` and `description` realistic, `pushedAt` ISO 8601, `homepage` nullable.

---

### `src/lib/projects.ts` (`fetchProjects`)

**Analog (data-shape side):** `src/data/cv.ts` — typed named export consumed by Server Component.
**Analog (consumption side):** `src/components/cv/CV.tsx:1` — `import { workEntries, ... } from '@/data/cv'`.

**Imports pattern (project convention):** `@/` alias for `src/` is in use throughout — see `src/components/cv/CV.tsx:1-3`:
```typescript
import { workEntries, educationEntries, skills } from '@/data/cv'
import WorkEntry from './WorkEntry'
import EducationEntry from './EducationEntry'
```

**Apply to Phase 3:** Place in `src/lib/projects.ts` (the `src/lib/` directory exists but is empty — first occupant). Export a single async function `fetchProjects(): Promise<Project[]>`. Importable as:
```typescript
import { fetchProjects } from '@/lib/projects'
import type { Project } from '@/data/projects'
```

**Build-time fetch pattern (no in-tree analog — derive from `CLAUDE.md` Tech Stack):**
- Use the runtime-builtin `fetch` (Node 20 in CI, also natively available in Next 16 server scope). No `@octokit/rest` (CLAUDE.md alternatives table explicitly rejects it).
- Endpoint: `https://api.github.com/users/axelw/repos?per_page=100&type=owner&sort=pushed&direction=desc` (planner confirms username; `?type=owner` excludes forks contributed-to but not owned; verify with REQUIREMENTS PROJ-01 wording). Alternative if pagination across >100 repos is ever needed: loop `Link` headers — but document a guard so a missing `Link` header does not crash.
- Headers: `Accept: application/vnd.github+json`, `User-Agent: axelw-website-build` (GitHub requires UA), and `Authorization: Bearer ${process.env.GITHUB_TOKEN}` only when the env var is set (Phase 4 wires the token; local builds run unauthenticated).
- Validate JSON at the boundary. Per `~/.claude/rules/typescript/coding-style.md`, treat the response as `unknown` and narrow it (or use a Zod schema if planner introduces Zod — not currently a dep, so prefer hand-written narrowing for now to avoid bundle bloat).
- Filter: drop archived (`archived === true`) and dropped/disabled. Keep `fork === false` as well unless the planner deliberately includes forks.
- Sort: `pushed_at` descending (already requested via query, but re-sort defensively after filter to be deterministic).
- Map: snake_case GitHub fields → `Project` camelCase shape.

**Error-handling / fallback pattern (no in-tree analog — derive from `~/.claude/rules/typescript/coding-style.md`):**
```typescript
// shape pattern only — planner writes the real version
import projectsFallback from '@/data/projects.json'

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch(GH_URL, { headers, /* no `cache: 'force-cache'` needed — Next caches build-time fetches by default */ })
    if (!res.ok) throw new Error(`GitHub API ${res.status}`)
    const raw: unknown = await res.json()
    return normalizeAndFilter(raw)
  } catch (error: unknown) {
    // CTX D-06: build must always succeed; log and fall back
    // eslint-disable-next-line no-console -- intentional build-time warning per D-06
    console.warn('[projects] GitHub fetch failed, using src/data/projects.json fallback:', error instanceof Error ? error.message : error)
    return projectsFallback as Project[]
  }
}
```
Notes:
- `console.warn` is intentional and *only* fires at build time inside Server Components. It does not ship to the client. `~/.claude/rules/typescript/coding-style.md` bans `console.log` in production code; `console.warn` for a documented build-time fallback is acceptable but must include the eslint-disable line so the rule is respected explicitly.
- `next.config.ts` already has `output: 'export'`, so this fetch runs only during `next build`. No runtime fetching is introduced.
- JSON imports work in Next 16 / TS 6 with `resolveJsonModule: true`. Planner verifies `tsconfig.json` includes it (it does in the Next default).

---

### `src/lib/date.ts` (`formatRelativeDate`)

**Analog:** none — `src/lib/` is empty. Use first-principles based on UI-SPEC §Copywriting (`Intl.RelativeTimeFormat('en', { numeric: 'auto' })`).

**Apply to Phase 3:** Pure function, single named export, fully unit-testable (though Phase 3 testing is Playwright E2E per `~/.claude/rules/typescript/testing.md` — leave unit-test wiring to the planner if they want Vitest, but it is not required by current scripts in `package.json`).
```typescript
// shape pattern only
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  // Use Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  // Diff in days/months/years; bucket to the largest unit ≥ 1.
  // < 24h returns 'today' (UI-SPEC override).
}
```
Type the public API explicitly per `~/.claude/rules/typescript/coding-style.md` §Public APIs. No `any`. Pass `now` as a defaulted parameter so tests can pin a clock.

---

### `src/components/projects/Projects.tsx` (Server Component, section)

**Analog:** `src/components/cv/CV.tsx` (data-driven section, multi-block layout) + `src/components/contact/Contact.tsx` (visible h2 pattern — UI-SPEC explicitly says "use Contact pattern, not CV `sr-only` pattern").

**Imports pattern** (`src/components/cv/CV.tsx:1-4`):
```typescript
import { workEntries, educationEntries, skills } from '@/data/cv'
import WorkEntry from './WorkEntry'
import EducationEntry from './EducationEntry'
import SkillsList from './SkillsList'
```

**Apply to Phase 3:**
```typescript
import { fetchProjects } from '@/lib/projects'
import ProjectCard from './ProjectCard'
import ProjectsEmptyState from './ProjectsEmptyState'
```

**Server Component async pattern** (no existing async Server Component in repo — Phase 3 introduces the first):
```typescript
export default async function Projects() {
  const projects = await fetchProjects()
  // ...
}
```
This is valid in Next 16 App Router and runs only during `next build` because `output: 'export'`. No `'use client'` directive — this component must remain server-side.

**Section container pattern** (copy verbatim from `src/components/contact/Contact.tsx:3-7`):
```typescript
<section
  id="contact"
  aria-labelledby="contact-heading"
  className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
>
```
**Apply to Phase 3:**
```typescript
<section
  id="projects"
  aria-labelledby="projects-heading"
  className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
>
```
Anchor target `id="projects"` matches `src/components/header/Header.tsx:45` `<a href="#projects">`.

**Visible heading pattern** (copy from `src/components/contact/Contact.tsx:8-13` — UI-SPEC explicitly mandates Contact-style visible h2):
```typescript
<h2
  id="contact-heading"
  className="font-[var(--font-heading)] text-[length:var(--text-heading)] mb-4"
>
  Get in touch
</h2>
```
**Apply to Phase 3:** Eyebrow label "Projects" first (mirroring CV's section labels — see `src/components/cv/CV.tsx:17-18`), then visible h2 "Selected work on GitHub" (UI-SPEC §Copywriting). Eyebrow class string from `src/components/cv/CV.tsx:17`:
```typescript
className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]"
```

**Grid pattern** (UI-SPEC §Spacing — no exact analog; derive from CV's mobile-first grid at `src/components/cv/CV.tsx:16`):
```typescript
// CV uses: grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12
// Projects uses (UI-SPEC):
<ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {projects.map((p) => (
    <li key={p.repoUrl}>
      <ProjectCard project={p} />
    </li>
  ))}
</ul>
```
The `<ul>/<li>` wrapping is mandated by UI-SPEC §Accessibility — matches `src/components/cv/SkillsList.tsx:7-15`.

**Empty-state guard:**
```typescript
if (projects.length === 0) return (<section ...><ProjectsEmptyState /></section>)
```
Or render the empty state inside the same section shell. Planner picks; both are consistent with the project's terse style.

---

### `src/components/projects/ProjectCard.tsx` (Server Component, presentational)

**Analog:** `src/components/cv/WorkEntry.tsx` — typed-prop presentational `<article>` with h3 + meta + body.

**Full pattern to copy** (`src/components/cv/WorkEntry.tsx:1-21`):
```typescript
import type { WorkEntry as WorkEntryType } from '@/data/cv'

interface WorkEntryProps {
  entry: WorkEntryType
}

export default function WorkEntry({ entry }: WorkEntryProps) {
  return (
    <article>
      <h3 className="text-[length:var(--text-body)] font-semibold mb-1">
        {entry.role}
      </h3>
      <p className="text-[length:var(--text-ui)] text-[var(--color-muted)] mb-3">
        {entry.company} — {entry.dates}
      </p>
      <p className="text-[length:var(--text-body)] max-w-[65ch]">
        {entry.description}
      </p>
    </article>
  )
}
```

**Apply to Phase 3:**
```typescript
import type { Project } from '@/data/projects'
import { formatRelativeDate } from '@/lib/date'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="p-6 rounded-[var(--radius-card)] border border-[var(--color-muted)]/20 transition-colors duration-200 ease-out hover:border-[var(--color-accent)]/40">
      <h3 className="text-[length:var(--text-body)] font-semibold mb-1">
        {project.name}
      </h3>
      {/* meta line — language · relative date; omit language if null */}
      <p className="text-[length:var(--text-ui)] text-[var(--color-muted)] mb-3">
        {project.language ? `${project.language} · ` : ''}{formatRelativeDate(project.pushedAt)}
      </p>
      {/* description — omit <p> entirely if null/empty per UI-SPEC */}
      {project.description && (
        <p className="text-[length:var(--text-body)] mb-6 max-w-[55ch]">
          {project.description}
        </p>
      )}
      {/* link row */}
      <div className="flex flex-wrap gap-4">
        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer"
           aria-label={`View ${project.name} repository on GitHub`}
           className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 py-2">
          Repo <span aria-hidden="true">→</span>
        </a>
        {project.homepage && (
          <a href={project.homepage} target="_blank" rel="noopener noreferrer"
             aria-label={`View ${project.name} live demo`}
             className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2 py-2">
            Live demo <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
    </article>
  )
}
```

Diff vs `WorkEntry.tsx`:
- Adds card surface treatment (border, padding, radius) per UI-SPEC §Color "Card surface treatment".
- Adds `transition-colors duration-200 ease-out` and `hover:border-[var(--color-accent)]/40` per UI-SPEC §Interaction. Both are paint-only (compositor-friendly) per `~/.claude/rules/web/performance.md`.
- Conditional rendering for `description` (omit when null) and `homepage` (no link when null) — derived from UI-SPEC §Copywriting.
- Text-link pattern (link with `aria-label`, `target="_blank" rel="noopener noreferrer"`, hover decoration swap, focus outline) is **copied verbatim from `src/components/contact/Contact.tsx:18-22` and `src/components/hero/Hero.tsx:23-29`** — see Shared Patterns below.

---

### `src/components/projects/ProjectsEmptyState.tsx` (Server Component)

**Analog:** `src/components/contact/Contact.tsx:1-18` — section with h-level + body paragraph + inline link.

**Apply to Phase 3:**
```typescript
export default function ProjectsEmptyState() {
  return (
    <div>
      <p className="text-[length:var(--text-body)] text-[var(--color-text)] mb-2">
        No public projects yet.
      </p>
      <p className="text-[length:var(--text-body)] text-[var(--color-muted)] max-w-[55ch]">
        Check back soon — or look at the source for{' '}
        <a
          href="https://github.com/axelw/axelw.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2"
        >
          this site itself
        </a>
        .
      </p>
    </div>
  )
}
```
Copy text is verbatim from UI-SPEC §Copywriting. Link styling matches Shared Pattern §External Link below.

---

### `src/app/page.tsx` (modified)

**Analog:** itself (`src/app/page.tsx:1-23`) — already locked composition pattern.

**Existing pattern** (`src/app/page.tsx:1-23`):
```typescript
import Header from '@/components/header/Header'
import Hero from '@/components/hero/Hero'
import CV from '@/components/cv/CV'
import Contact from '@/components/contact/Contact'
import FadeUp from '@/components/ui/FadeUp'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FadeUp>
          <CV />
        </FadeUp>
        <FadeUp>
          <Contact />
        </FadeUp>
        {/* Projects section — Phase 3 */}
      </main>
    </>
  )
}
```

**Apply to Phase 3:** Replace the comment stub with `<FadeUp><Projects /></FadeUp>`. Two things to decide:
1. **Position** — UI-SPEC and Header order suggest `Hero → CV → Projects → Contact`, but the current file has Contact before the stub. Planner should move Projects to sit **between CV and Contact** so the visible order matches the nav order in `Header.tsx` (`#hero, #cv, #projects, #contact`).
2. **Async page consideration** — `Projects` is `async`, but `Home` does not need to be async because RSC composition allows async children of sync parents. `<FadeUp>` is a Client Component (`'use client'` at `src/components/ui/FadeUp.tsx:1`) and accepts an async Server Component as its child via the React composition model. Verify by `next build`.

**Modified result:**
```typescript
import Header from '@/components/header/Header'
import Hero from '@/components/hero/Hero'
import CV from '@/components/cv/CV'
import Projects from '@/components/projects/Projects'
import Contact from '@/components/contact/Contact'
import FadeUp from '@/components/ui/FadeUp'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FadeUp><CV /></FadeUp>
        <FadeUp><Projects /></FadeUp>
        <FadeUp><Contact /></FadeUp>
      </main>
    </>
  )
}
```

---

### `e2e/uat-phase-03.spec.ts` (Playwright E2E)

**Analog:** `e2e/uat-phase-02.spec.ts` — same project, established test shape.

**Imports + describe pattern** (`e2e/uat-phase-02.spec.ts:1-7`):
```typescript
import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

test.describe('Phase 02 UAT', () => {
```

**Apply to Phase 3:** Match the file naming, describe block name (`Phase 03 UAT`), screenshot dir convention. Cover at minimum:
1. **Render check** — `section#projects` exists, contains a visible h2, and renders ≥ 1 `<article>` (or empty-state copy).
2. **No archived** — fixture/build snapshot must not include any repo whose name implies it (the build will already have filtered; this is a smoke check).
3. **Live demo conditional** — count of `Live demo` links matches count of cards with non-null `homepage` in the rendered fallback `projects.json` (loadable from disk in the test).
4. **Anchor scroll** — clicking `header a[href="#projects"]` scrolls Projects into view (mirrors UAT-4/UAT-5 patterns).
5. **Reduced-motion** — wrapping `<FadeUp>` reveals the section under `reducedMotion: 'reduce'` (clone UAT-3 from `uat-phase-02.spec.ts:55-77`).
6. **Visual regression at 320 / 768 / 1280 / 1440** per `~/.claude/rules/web/testing.md` priority order.

**Reduced-motion fixture** (copy verbatim from `e2e/uat-phase-02.spec.ts:56-58`):
```typescript
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
```

---

## Shared Patterns

### External Link
**Source:** `src/components/contact/Contact.tsx:25-30` and `src/components/hero/Hero.tsx:23-29` (identical class string used in both files — already a de-facto shared pattern).
**Apply to:** Repo link, Live demo link, Empty-state link, any future external link in Projects.
```typescript
<a
  href={url}
  target="_blank"
  rel="noopener noreferrer"
  className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
>
  {label}
</a>
```
Phase 3 should upgrade `focus:` → `focus-visible:` per UI-SPEC §Interaction (`focus-visible:outline-2 …`). The existing components use `focus:`; this is a known minor regression in Phase 2 that Phase 3 should not propagate. Planner may choose to leave Phase 2 alone (out of scope) and only apply `focus-visible:` to new code, or fix in flight if the planner wants symmetry.

### Section Container
**Source:** `src/components/contact/Contact.tsx:3-7`, `src/components/cv/CV.tsx:8-12`, `src/components/hero/Hero.tsx:5-9`.
**Apply to:** Outer `<section>` of `Projects.tsx`.
```typescript
className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
```
Identical container chrome on every section — do not deviate.

### Aria-Labelled Section
**Source:** `src/components/contact/Contact.tsx:5-12`.
**Apply to:** `<section id="projects" aria-labelledby="projects-heading">` paired with `<h2 id="projects-heading">…</h2>`. Use a visible h2 (not `sr-only` like CV at `src/components/cv/CV.tsx:13`) per UI-SPEC §Copywriting structural note.

### Eyebrow Label
**Source:** `src/components/cv/CV.tsx:17-19` (and 29-31, 41-43 — repeated three times in CV).
```typescript
<div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
  Work
</div>
```
**Apply to:** "Projects" eyebrow above the visible h2.

### Card Surface (NEW pattern, derived not copied)
**Source:** `src/components/cv/SkillsList.tsx:9-13` is the closest precedent (uses same border/radius vocabulary, smaller scale).
```typescript
className="px-3 py-1 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-muted)]/20 text-[length:var(--text-ui)]"
```
**Apply to ProjectCard:** Scale up to card-size — `p-6` instead of `px-3 py-1`, drop `bg-[var(--color-surface)]` (cards inherit from page; UI-SPEC §Color "tonally-flat card" decision), keep `rounded-[var(--radius-card)]` and `border border-[var(--color-muted)]/20`. Add hover transition per UI-SPEC §Interaction.

### Typed Data Imports
**Source:** `src/components/cv/CV.tsx:1` + `src/components/cv/WorkEntry.tsx:1`.
**Apply to:** All Projects components — import `Project` type via `import type { Project } from '@/data/projects'`. Use `import type` (not value import) for type-only imports — TS 6 strict mode enforces this with `verbatimModuleSyntax`.

### Animation Wrapper
**Source:** `src/app/page.tsx:13-18`.
**Apply to:** Wrap `<Projects />` in `<FadeUp>` exactly as CV and Contact are wrapped. Do not modify `FadeUp` itself — the planner should treat it as a sealed dependency. UI-SPEC §Component Inventory confirms.

### Reduced-Motion Respect
**Source:** `src/components/ui/FadeUp.tsx:13` (`useReducedMotion`) — Phase 3 inherits this for free via `<FadeUp>`. **Do not add new motion** in `ProjectCard` beyond the 200ms color/border transition (already a "fine" envelope under prefers-reduced-motion per UI-SPEC §Interaction). If the planner adds anything more, they must wire `useReducedMotion` at the leaf — but Server Components cannot use hooks, so this would require splitting into a Client subcomponent. The current contract avoids that complication.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/date.ts` | utility | transform | `src/lib/` is empty in the codebase. First occupant. Planner uses `Intl.RelativeTimeFormat('en', { numeric: 'auto' })` per UI-SPEC. No external dep needed. |
| `src/lib/projects.ts` build-time fetch + fallback logic | utility / data-loader | request-response with fallback | No existing fetcher in the project. Pattern derived from `CLAUDE.md` Tech Stack ("Native fetch") plus `~/.claude/rules/typescript/coding-style.md` error handling. |
| `src/data/projects.json` | static fallback data file | file-I/O | No existing JSON file in `src/data/`. Schema must mirror the `Project` interface in `src/data/projects.ts`. |

For these three, the planner should write fresh code following the project's named-export, typed, immutable conventions — not copy from elsewhere.

---

## Metadata

**Analog search scope:** `src/components/`, `src/data/`, `src/lib/`, `src/hooks/`, `src/styles/`, `src/app/`, `e2e/`, `playwright.config.ts`, `package.json`.
**Files scanned:** 18 (all of `src/` plus tests + config).
**Pattern extraction date:** 2026-06-02
