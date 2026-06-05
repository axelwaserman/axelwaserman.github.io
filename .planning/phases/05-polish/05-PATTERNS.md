# Phase 5: Polish — Pattern Map

**Mapped:** 2026-06-04
**Files analyzed:** 16 (5 new, 11 modified)
**Analogs found:** 16 / 16 (every file has at least a partial analog in the codebase)

---

## File Classification

| New/Modified File | Status | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `src/components/hero/HeroMandala.tsx` | NEW | Client Component (interactive container) | event-driven (scroll + input) | `src/components/ui/FadeUp.tsx` + `src/components/header/Header.tsx` | role-match (closest existing client components) |
| `src/components/hero/MandalaSVG.tsx` | NEW | presentational component | request-response (props → SVG) | `src/components/cv/EducationEntry.tsx` | role-match (props-only, pure render) |
| `src/components/hero/HeroMandalaControls.tsx` | NEW | presentational sub-component | event-driven (input handlers passed in) | `src/components/cv/SkillsList.tsx` | role-match (small list/control cluster) |
| `src/lib/mandala.ts` | NEW | utility (pure functions) | transform | `src/lib/date.ts` | role-match (pure utility module) |
| `src/components/cv/SkillGroupList.tsx` | NEW | presentational component | request-response | `src/components/cv/SkillsList.tsx` (replaces it) | exact (drop-in replacement) |
| `src/components/cv/DownloadCVButton.tsx` | NEW | presentational component (anchor button) | request-response | Hero CTA `<a href="/cv.pdf" download>` block (lines 45-51 of `Hero.tsx`) | exact |
| `src/app/icon.tsx` | NEW | Next.js convention file (build-time generator) | build-time render | `src/app/layout.tsx` | role-match (only other `src/app/` route file consuming fonts/tokens) |
| `justfile` | NEW | repo-root build recipe | build-time | `package.json` (scripts block) + `next.config.ts` | partial (no exact analog; root config) |
| `public/cv.pdf` | NEW (binary artifact) | static asset | build-time | none — `public/` is empty today | none |
| `src/lib/projects.ts` | MODIFIED | server utility | CRUD/fetch | self (line 7 only) | self-edit |
| `src/data/cv.ts` | MODIFIED | typed data module | request-response | self + `src/data/projects.ts` for interface style | self-edit |
| `src/data/projects.json` | MODIFIED | JSON fallback | data | self | self-edit |
| `src/components/hero/Hero.tsx` | MODIFIED | Server Component | request-response | self | self-edit + embed new client child |
| `src/components/cv/CV.tsx` | MODIFIED | Server Component | request-response | self | self-edit (re-center, render groups, add CTA) |
| `src/components/cv/WorkEntry.tsx` | MODIFIED | presentational component | request-response | self + `src/components/cv/SkillsList.tsx` (for `<ul>` mapping) | self-edit |
| `src/components/projects/Projects.tsx` | MODIFIED | Server Component | request-response | self | self-edit (re-center) |
| `src/components/projects/ProjectsEmptyState.tsx` | MODIFIED | presentational | request-response | self | self-edit (URL fix) |
| `src/components/contact/Contact.tsx` | MODIFIED | Server Component | request-response | self + Hero CTA links pattern | self-edit |
| `src/app/layout.tsx` | MODIFIED | root layout | build-time | self | self-edit (URL fixes) |
| `.github/workflows/deploy.yml` | MODIFIED | CI workflow | build-time | self | self-edit (env var add) |

**Important codebase fact for the planner:** Three `'use client'` files already exist (`src/hooks/useReducedMotion.ts`, `src/components/ui/FadeUp.tsx`, `src/components/header/Header.tsx`). HeroMandala is **not** the first Client Component — CONTEXT.md D-09's note about "first Client Component in this codebase" is incorrect. The pattern for a client interactive component is well-established. This significantly lowers task complexity.

---

## Pattern Assignments

### `src/components/hero/HeroMandala.tsx` (NEW — Client Component)

**Primary analog:** `src/components/ui/FadeUp.tsx` — closest existing client component using `useEffect` + IntersectionObserver + `useReducedMotion` (the exact ingredients HeroMandala needs).
**Secondary analog:** `src/components/header/Header.tsx` — passive scroll listener pattern.

**'use client' + imports pattern** (from `src/components/ui/FadeUp.tsx` lines 1-9):
```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface FadeUpProps {
  children: React.ReactNode
  className?: string
}
```
Rules to copy: `'use client'` at top; named imports from `'react'` (no `import * as React`); path alias `@/hooks/...`; `interface ComponentNameProps`; default export later.

**Reduced-motion gating pattern** (from `src/components/ui/FadeUp.tsx` lines 13-23):
```tsx
const reduced = useReducedMotion()

useEffect(() => {
  const el = ref.current
  if (!el) return

  if (reduced) {
    el.style.opacity = '1'
    el.style.transform = 'none'
    return
  }
  // ... motion path follows
}, [reduced])
```
Rules to copy: read `reduced` once; early-return with the static state inside the effect; gate the motion path behind `if (!reduced)`.

**IntersectionObserver pattern** (from `src/components/ui/FadeUp.tsx` lines 28-42):
```tsx
const observer = new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting) {
      // ... do thing
      observer.unobserve(el)
    }
  },
  { threshold: 0.15 }
)

observer.observe(el)
return () => observer.disconnect()
```
HeroMandala uses this **twice**: once with `threshold: 0` to detect hero-out-of-viewport for scroll-out reset (D-06) AND for `will-change` toggling, once for the rAF scroll loop gating.

**Passive scroll listener pattern** (from `src/components/header/Header.tsx` lines 9-13):
```tsx
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 100)
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```
Rules to copy: `{ passive: true }` flag; cleanup function returned from `useEffect`; no-deps array. HeroMandala extends this: scroll handler ONLY writes `latestScrollY = window.scrollY`; an rAF loop reads it and writes `transform: rotate(...)`. Per UI-SPEC's Performance Lock, **no layout reads inside the rAF**.

**Inline style for compositor-only transform** (from `src/components/ui/FadeUp.tsx` lines 25-26, 32-33):
```tsx
el.style.opacity = '0'
el.style.transform = 'translateY(16px)'
```
Apply `el.style.transform = `rotate(${deg}deg)`` directly on the SVG element. Compositor-only. Matches `web/performance.md`.

---

### `src/components/hero/MandalaSVG.tsx` (NEW — presentational)

**Analog:** `src/components/cv/EducationEntry.tsx` — minimal props-only component, default export, named props interface.

**Component shape pattern** (from `src/components/cv/EducationEntry.tsx` lines 1-19):
```tsx
import type { EducationEntry as EducationEntryType } from '@/data/cv'

interface EducationEntryProps {
  entry: EducationEntryType
}

export default function EducationEntry({ entry }: EducationEntryProps) {
  return (
    <article>
      ...
    </article>
  )
}
```
For MandalaSVG: imports `generateLines` from `@/lib/mandala`; props `{ n: number; k: number }`; renders `<svg viewBox="0 0 1000 1000" ...>` with `.map()` over lines. **No `'use client'`** — pure presentational, can be rendered from inside HeroMandala (which is `'use client'`) without needing its own directive.

**Tailwind token consumption pattern** (from `src/components/cv/SkillsList.tsx` line 11):
```tsx
className="px-3 py-1 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-muted)]/20 text-[length:var(--text-ui)]"
```
Token bridging idiom: `text-[length:var(--text-ui)]`, `text-[var(--color-text)]`, `border-[var(--color-muted)]/20` (alpha modifier on a CSS var). For the SVG `<line>`, use `stroke="var(--color-text)" strokeOpacity={0.35}` directly (SVG attributes, not Tailwind utilities — Tailwind v4 has no native SVG stroke utility for arbitrary CSS-var values).

---

### `src/components/hero/HeroMandalaControls.tsx` (NEW)

**Analog:** `src/components/cv/SkillsList.tsx` (small list+UI cluster) + Hero CTA link pattern (anchor styling).

**Number input + label pattern — no codebase analog yet.** Use UI-SPEC's locked contract directly. Shape (synthesized from CV pill styling for radius/border consistency):
```tsx
<label className="flex items-center gap-2 text-[length:var(--text-ui)] text-[var(--color-muted)]">
  n
  <input
    type="number"
    inputMode="numeric"
    min={3}
    max={500}
    step={1}
    defaultValue={n}
    onChange={...}
    onBlur={...}
    className="w-[6ch] px-2 py-1.5 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-muted)]/30 text-[var(--color-text)] tabular-nums focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 hover:border-[var(--color-muted)]/50"
    aria-label="Number of points on circle"
  />
</label>
```
Rules to copy from `SkillsList`: `rounded-[var(--radius-card)]`, `border-[var(--color-muted)]/20-30`, `bg-[var(--color-surface)]`, `text-[length:var(--text-ui)]`. Rules to copy from Hero CTA link `focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2` (lines 27, 35, 41 of `Hero.tsx`).

**Refresh button pattern — synthesized from CTA link + UI-SPEC contract.** Inline SVG icon (provided verbatim in UI-SPEC §"Refresh button contract"). Reuse the focus ring class from the Hero CTAs.

---

### `src/lib/mandala.ts` (NEW — utility)

**Analog:** `src/lib/date.ts` — pure utility, no `'use client'`, no `'server-only'`, used at both build time (curated pairs imported by HeroMandala which is client) and dev time.

**Module shape** — read `src/lib/date.ts` to follow its export style. Quick excerpt expected (small file, named exports, no side effects):
```ts
// Pure utility — no React, no DOM, no network
export interface ChordLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface MandalaPair {
  n: number
  k: number
}

export const CURATED_PAIRS: readonly MandalaPair[] = [...] as const

export function generateLines(n: number, k: number): ChordLine[] { ... }

export function pickRandomPair(exclude?: MandalaPair): MandalaPair { ... }
```
Rules to copy from `src/lib/date.ts`: small focused file (under ~60 lines), named exports only, explicit return types per `typescript/coding-style.md` "Public APIs" rule. NO `import 'server-only'` (this is consumed by a client component).

**Anti-pattern reminder:** `src/lib/projects.ts:1` uses `import 'server-only'`. **Do NOT** add this to `mandala.ts` — it would break the client bundle.

---

### `src/components/cv/SkillGroupList.tsx` (NEW — replaces SkillsList.tsx)

**Analog:** `src/components/cv/SkillsList.tsx` (current pill version it replaces) — same imports/export shape; only the JSX body changes.

**Component shape** (from `src/components/cv/SkillsList.tsx` lines 1-19):
```tsx
interface SkillsListProps {
  skills: string[]
}

export default function SkillsList({ skills }: SkillsListProps) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Skills">
      {skills.map((skill) => (
        <li
          key={skill}
          className="px-3 py-1 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-muted)]/20 text-[length:var(--text-ui)]"
        >
          {skill}
        </li>
      ))}
    </ul>
  )
}
```
For SkillGroupList per UI-SPEC §"Skill groups (D-16)": three groups, each rendered as **category heading + comma-separated inline list** (NOT pills). Replace the inner JSX. Keep the same import style and named props interface.

```tsx
import type { SkillGroup } from '@/data/cv'

interface SkillGroupListProps {
  groups: SkillGroup[]
}

export default function SkillGroupList({ groups }: SkillGroupListProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.category}>
          <h4 className="text-[length:var(--text-body)] font-semibold text-[var(--color-text)] mb-2">
            {group.category}
          </h4>
          <p className="text-[length:var(--text-ui)] text-[var(--color-text)] max-w-[60ch] leading-[1.5]">
            {group.items.join(', ')}
          </p>
        </div>
      ))}
    </div>
  )
}
```
Mark `SkillsList.tsx` for **deletion** once `SkillGroupList.tsx` is wired (UI-SPEC inventory: "DEPRECATED").

---

### `src/components/cv/DownloadCVButton.tsx` (NEW)

**Analog:** Hero "Download CV" anchor block (`src/components/hero/Hero.tsx` lines 45-51) — the exact same `<a href="/cv.pdf" download>` semantic. UI-SPEC reshapes the styling but the semantic is identical.

**Anchor + download pattern** (from `src/components/hero/Hero.tsx` lines 45-51):
```tsx
<a
  href="/cv.pdf"
  download
  className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
>
  Download CV
</a>
```
Keep the `download` attr (web/security.md). Keep the focus-ring + accent-on-hover convention. Replace styling per UI-SPEC §"Download Button Visual Contract": transparent bg, **bottom-only hairline border** in `--color-accent`, inline SVG icon left of label, `download` attribute, full label `Download CV (PDF)`. Inline SVG path is provided verbatim in UI-SPEC.

---

### `src/app/icon.tsx` (NEW — Next.js convention file)

**Analog:** `src/app/layout.tsx` — only other route-level file in `src/app/`; uses `next/font/google` for Instrument Serif (which `icon.tsx` also needs).

**Font import pattern** (from `src/app/layout.tsx` lines 2, 12-17):
```tsx
import { Instrument_Serif } from 'next/font/google'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-heading',
  display: 'swap',
})
```
For `icon.tsx`, font loading inside `ImageResponse` is different — fonts are passed to `ImageResponse` via the `fonts` option as ArrayBuffer. Standard Next.js pattern (see Next.js docs):
```tsx
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const fontData = await fetch(
    new URL('https://fonts.googleapis.com/.../instrumentserif.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'oklch(97% 0.01 75)', // --color-surface inlined per UI-SPEC
        color: 'oklch(18% 0.01 75)',     // --color-text inlined
        fontSize: 22,
        letterSpacing: '-0.02em',
        fontFamily: 'Instrument Serif',
      }}>
        AW
      </div>
    ),
    { ...size, fonts: [{ name: 'Instrument Serif', data: fontData, weight: 400 }] }
  )
}
```
Rules from UI-SPEC §"Favicon Visual Contract": 32×32, oklch literals (CSS vars don't resolve inside ImageResponse), Instrument Serif 400, `letter-spacing: -0.02em`, glyphs `AW`. Confirm static-export compatibility per CONTEXT.md D-19.

---

### `justfile` (NEW — repo root)

**No direct codebase analog** (no existing justfile). Closest: `package.json`'s scripts block + workflow YAML. Synthesized from UI-SPEC + CONTEXT.md D-11:

```just
# Compile assets/CV.typ → public/cv.pdf
cv:
    typst compile assets/CV.typ public/cv.pdf

# Future recipes go here.
```
Per CONTEXT.md D-11: PDF is committed to repo (no CI Typst dependency). Workflow: edit CV.typ → `just cv` → commit both files.

---

### `src/lib/projects.ts` (MODIFIED — line 7 only)

**Self-edit.** Single change per CONTEXT.md D-21:
- Line 7: `const GITHUB_USERNAME = process.env.GITHUB_USERNAME ?? 'axelw'` → `'axelwaserman'`

**Preserve everything else** per CONTEXT.md "Reusable Assets":
- `import 'server-only'` (line 1)
- pagination loop, fork/archive/disabled filter, sort by pushedAt, fallback to `projectsFallback`
- `console.warn` is intentional (line 109 has the `eslint-disable` comment that documents this)

---

### `src/data/cv.ts` (MODIFIED — extend interfaces, replace placeholder data)

**Self-edit.** Extends existing shape per CONTEXT.md D-13, D-14, D-15, D-16.

**Existing pattern to follow** (lines 1-12):
```ts
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
Rules: named exports, `interface` for object shapes (per `typescript/coding-style.md` — interfaces for object shapes), `string` types for em-dash-formatted dates (preserve em-dash convention).

**Modifications required:**
1. Extend `WorkEntry` interface: add `bullets: string[]` (D-13). Optional? Per UI-SPEC, default to empty array if a role has no bullets.
2. Add new interface `SkillGroup { category: string; items: string[] }` (D-16). Use `interface` per global rule.
3. Replace `export const skills: string[]` with `export const skillGroups: SkillGroup[]` (D-16). The three CV.typ groups, verbatim category names.
4. Replace `bio` with the 1–2-sentence trim of CV.typ Professional Summary (D-14).
5. Replace `title` with `'Senior Engineering Manager | Backend & Data'` (D-15, exact pipe + spacing per UI-SPEC).
6. Replace placeholder work/education entries with verbatim CV.typ content. Bullets that begin with bold phrase + colon (e.g. *"Post-Acquisition Integration:"*) are stored as plain strings; UI-SPEC says splitting/bold-rendering happens at component render time.

**Bullet bold-prefix split** — store strings as-is, split on first `:` in `WorkEntry.tsx`. UI-SPEC §"Work entry rendering — bullets" line: "Implementation: split on first `:` at data-prep time" — reading carefully, this means **at render time** in the component (the data file holds the canonical string).

---

### `src/data/projects.json` (MODIFIED — refresh fallback)

**Self-edit per CONTEXT.md D-24.** Run live fetch once during Phase 5; replace this file's content with the result. Same JSON shape — Project[] (matches `src/data/projects.ts` interface). All `axelw` URLs replaced with `axelwaserman`. No structural change.

---

### `src/components/hero/Hero.tsx` (MODIFIED — embed mandala, fix URLs)

**Self-edit.** Embed `<HeroMandala />` in a right column; preserve existing left-column content. URL fixes per D-23.

**Existing structure to preserve** (lines 1-22):
- Server Component (no `'use client'`)
- imports `bio`, `title` from `@/data/cv` — still works after `cv.ts` is updated
- semantic `<section id="hero" aria-labelledby="hero-heading">` (matches `web/coding-style.md` "Semantic HTML First")
- existing classes on `<h1>` and CTA links

**Changes per UI-SPEC §"Hero composition (D-01)":**
1. Wrap the existing left-column block in a flex/grid container with right column for the mandala. UI-SPEC contract:
   - Desktop ≥1024px: 50/50 split.
   - Tablet 640–1023px: 60/40.
   - Mobile <640px: stacked, mandala below CTAs.
   - Recommended Tailwind: `lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center`, with the mandala column hidden then revealed via responsive utilities, OR mobile-first stack with `lg:` overrides.
2. Embed `<HeroMandala />` (default export) in the right column.
3. Fix URLs (D-23):
   - Line 24: `https://github.com/axelw` → `https://github.com/axelwaserman`
   - Line 32: `https://linkedin.com/in/axelw` → `https://www.linkedin.com/in/axel-waserman-9753221a6/`
   - Line 40 (`mailto:axel@example.com`): UI-SPEC §Copywriting Contract — Hero CTA labels preserved; **Email row in Contact** is omitted while TBD, but Hero is silent on this. Conservative read: also surface the same TBD behaviour in Hero (omit Email link until address provided). PLAN.md must call this out.
4. The existing `max-w-4xl` constraint may need to widen (e.g. `max-w-6xl`) to fit two columns at desktop — planner's call within UI-SPEC bounds.

---

### `src/components/cv/CV.tsx` (MODIFIED — re-center, render groups, add CTA)

**Self-edit per CONTEXT.md D-02, D-12, D-16.**

**Existing two-column grid pattern** (lines 16, 28, 40):
```tsx
<div className="grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12 mb-20">
  <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
    Work
  </div>
  <div className="space-y-12">
    {workEntries.map(...)}
  </div>
</div>
```
**This grid is dropped per UI-SPEC §"CV section".** New layout:
- Outer container `max-w-3xl mx-auto` (768px centered).
- Each block: eyebrow label centered above entries (was: left-side column).
- Entries below stay internally left-aligned.
- Vertical rhythm: `mb-12` between blocks, `space-y-8` between entries within a block, `mt-6` between eyebrow and first entry.

**Skill rendering change:**
- Replace `import SkillsList from './SkillsList'` with `import SkillGroupList from './SkillGroupList'`.
- Replace `import { ... skills } from '@/data/cv'` with `import { ... skillGroups } from '@/data/cv'`.
- Replace `<SkillsList skills={skills} />` with `<SkillGroupList groups={skillGroups} />`.

**Insert "Download CV (PDF)" button** between Work and Education blocks (UI-SPEC: "directly after the last work entry, **before** the Education block"):
```tsx
import DownloadCVButton from './DownloadCVButton'
// ... after Work block, before Education block:
<div className="flex justify-center mt-12 mb-12">
  <DownloadCVButton />
</div>
```

---

### `src/components/cv/WorkEntry.tsx` (MODIFIED — render bullets)

**Self-edit per CONTEXT.md D-13, UI-SPEC §"Work entry rendering — bullets".**

**Existing pattern preserved** (lines 1-21): role `<h3>`, company–dates `<p>`, description `<p>`. Add bullets render below description.

**Bullet rendering pattern — synthesize from `SkillsList` `<ul>` style:**
```tsx
{entry.bullets && entry.bullets.length > 0 && (
  <ul className="mt-3 space-y-2 list-disc list-outside pl-5 marker:text-[var(--color-muted)]">
    {entry.bullets.map((bullet, i) => {
      const colonIndex = bullet.indexOf(':')
      if (colonIndex > 0 && colonIndex < 60) {
        const prefix = bullet.slice(0, colonIndex + 1)
        const rest = bullet.slice(colonIndex + 1)
        return (
          <li key={i} className="text-[length:var(--text-body)] text-[var(--color-text)] max-w-[65ch] leading-[1.6]">
            <strong className="font-semibold">{prefix}</strong>{rest}
          </li>
        )
      }
      return (
        <li key={i} className="text-[length:var(--text-body)] text-[var(--color-text)] max-w-[65ch] leading-[1.6]">
          {bullet}
        </li>
      )
    })}
  </ul>
)}
```
Rules per UI-SPEC: `list-disc list-outside pl-5`; bullet text Sora 400 line-height 1.6; `max-w-[65ch]`; `marker:text-[var(--color-muted)]`; first-colon split for bold prefix; `mt-3` between description and list.

---

### `src/components/projects/Projects.tsx` (MODIFIED — re-center)

**Self-edit per CONTEXT.md D-02.** Per UI-SPEC §"Projects section":
- Outer container: `max-w-5xl mx-auto`.
- Eyebrow + heading: `text-center`.
- Card grid stays `grid-cols-1 sm:grid-cols-2 gap-6` (existing). Cards remain internally left-aligned.

**Existing structure preserved otherwise** (no changes to fetcher call, no changes to ProjectCard).

---

### `src/components/projects/ProjectsEmptyState.tsx` (MODIFIED — URL fix)

**Self-edit per D-23.** Single line change:
- Line 10: `https://github.com/axelw/axelw.github.io` → `https://github.com/axelwaserman/axelwaserman.github.io`

UI-SPEC §"Projects section — D-23 fix" confirms.

---

### `src/components/contact/Contact.tsx` (MODIFIED — re-center + URL fixes + email TBD)

**Self-edit per CONTEXT.md D-02, D-17, D-23, UI-SPEC §"Contact section".**

**Existing CTA link pattern preserved** (lines 17-47): `flex flex-wrap gap-4`, four links with consistent styling. **Email row omitted entirely** per UI-SPEC Copywriting Contract: "LOCKED behavior: omit the email row entirely until `<<TBD: email>>` is replaced".

**Changes:**
1. Outer container: add `max-w-2xl mx-auto`.
2. Heading + body: add `text-center` (heading) and `text-center mx-auto` (body); body keeps `max-w-[55ch]`.
3. Link cluster: change `flex flex-wrap gap-4` → `flex flex-wrap gap-4 justify-center`.
4. **Remove** the `mailto:axel@example.com` `<a>` block (lines 18-23) — silent omission until address provided.
5. URL fixes per D-23:
   - Line 25: `https://linkedin.com/in/axelw` → `https://www.linkedin.com/in/axel-waserman-9753221a6/`
   - Line 33: `https://github.com/axelw` → `https://github.com/axelwaserman`

---

### `src/app/layout.tsx` (MODIFIED — metadata URL fixes)

**Self-edit per CONTEXT.md D-23.** Three string changes:
- Line 22: `metadataBase: new URL('https://axelw.github.io')` → `'https://axelwaserman.github.io'`
- Line 26: `url: 'https://axelw.github.io'` → `'https://axelwaserman.github.io'`

Title strings (`'Axel W — Software Engineer'`, lines 20, 24, 27, 34, 40, 41) — **defer to planner** per UI-SPEC Copywriting Contract Hero name row: "keep as `Axel W` **or** `Axel Waserman` — defer to planner". Whatever the planner picks for Hero `<h1>`, layout.tsx metadata strings should match.

Title also contains "Software Engineer" — UI-SPEC §Copywriting locks `title` (D-15) to `'Senior Engineering Manager | Backend & Data'`. Planner should align metadata `title` accordingly (or consciously diverge with rationale).

---

### `.github/workflows/deploy.yml` (MODIFIED — add username env var)

**Self-edit per CONTEXT.md D-21.** Add `GITHUB_USERNAME: axelwaserman` to the build step's env:

**Existing pattern** (lines 47-50):
```yaml
- name: Build Next.js static export
  run: npm run build
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
**After change:**
```yaml
- name: Build Next.js static export
  run: npm run build
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_USERNAME: axelwaserman
```
**Belt-and-braces** with `src/lib/projects.ts:7` default change (D-21) — local builds without the env var still work.

**Do NOT regress** Phase 4 decisions: cron schedule (line 7), permissions block (lines 10-13), concurrency (lines 15-17), action versions (`@v4`, `@v5`, `@v3`). Single addition only.

---

## Shared Patterns

### Pattern 1: CTA / link styling (anchor-with-underline)

**Source:** `src/components/hero/Hero.tsx` lines 25-29 (and replicated 7× across Hero, Contact, ProjectCard, ProjectsEmptyState).

**Apply to:** All new anchors and link-styled buttons in Phase 5 — including the Mandala refresh button's focus ring and the new DownloadCVButton's focus ring.

```tsx
className="text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2"
```

The focus-ring tokens are project-canonical: `outline: 2px solid var(--color-accent); outline-offset: 2px`. Use `focus-visible:` (preferred for keyboard-only ring, per `ProjectCard.tsx` line 32) where appropriate.

### Pattern 2: Section container shape

**Source:** Every existing section (`Hero.tsx:8`, `CV.tsx:11`, `Projects.tsx:12`, `Contact.tsx:6`).

**Existing pattern:**
```tsx
<section
  id="..."
  aria-labelledby="...-heading"
  className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
>
```
**Apply to:** Every modified section keeps the `id`, `aria-labelledby`, `py-[var(--space-section)]`, `px-6`, `scroll-mt-16` tokens. Only `max-w-*` and `mx-auto` change per re-centering contract:
- CV: `max-w-3xl mx-auto`
- Projects: `max-w-5xl mx-auto`
- Contact: `max-w-2xl mx-auto`
- Hero: stays `max-w-4xl` (or widens for two-col layout — planner's call)

`scroll-mt-16` matches the sticky 64px header (Header.tsx line 18 `h-16`). Preserve.

### Pattern 3: Eyebrow label / section label styling

**Source:** `src/components/cv/CV.tsx` line 17, `src/components/projects/Projects.tsx` line 14.

```tsx
className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]"
```
**Apply to:** All eyebrow labels in re-centered CV blocks. Add `text-center` per UI-SPEC §"CV section". Projects eyebrow already gets `text-center`.

### Pattern 4: Component file shape

**Source:** Every component file in `src/components/`.

```tsx
// Imports first (named imports from React, then path-aliased imports)
import type { Foo } from '@/data/foo'

// Named props interface (interface, NOT type, per typescript/coding-style.md)
interface ComponentNameProps {
  prop: Foo
}

// Default export, named function, destructured props
export default function ComponentName({ prop }: ComponentNameProps) {
  return ( ... )
}
```
**Apply to:** All new components in Phase 5 (HeroMandala, MandalaSVG, HeroMandalaControls, SkillGroupList, DownloadCVButton). `'use client'` only on HeroMandala (parent container with state).

### Pattern 5: Token consumption in Tailwind v4 arbitrary values

**Source:** every component, e.g. `src/components/cv/CV.tsx:17`.

| Need | Idiom |
|------|-------|
| Color | `text-[var(--color-text)]`, `bg-[var(--color-surface)]`, `border-[var(--color-muted)]` |
| Color with alpha | `border-[var(--color-muted)]/20`, `border-[var(--color-muted)]/30` (alpha modifier on CSS var) |
| Font size token | `text-[length:var(--text-ui)]` (note `length:` prefix is required) |
| Font family | `font-[var(--font-heading)]` |
| Section padding | `py-[var(--space-section)]` |
| Radius | `rounded-[var(--radius-card)]` |

**Apply to:** All new components. Never hardcode hex colors or px values that have a token equivalent.

### Pattern 6: `'use client'` discipline

**Source:** `src/components/ui/FadeUp.tsx`, `src/components/header/Header.tsx`, `src/hooks/useReducedMotion.ts`.

Rules:
- `'use client'` directive is line 1.
- Apply to the **smallest** component that owns the state/effects (HeroMandala parent — yes; MandalaSVG presentational child — no).
- Server components can render Client Components as children (Hero stays Server, embeds HeroMandala). UI-SPEC D-09 confirms.

### Pattern 7: `interface` for props, `type` for unions

Per `typescript/coding-style.md`:
- `interface ComponentNameProps` — every existing component uses this.
- `type SomeUnion = 'a' | 'b'` — only for union types (no current example in codebase yet).

**Apply to:** New `SkillGroup` interface in `cv.ts`; new `MandalaPair`, `ChordLine` in `lib/mandala.ts`; all new component prop interfaces.

### Pattern 8: Path alias `@/`

**Source:** every import in `src/`, e.g. `src/components/cv/CV.tsx:1` `import { workEntries, ... } from '@/data/cv'`.

`@/` resolves to `src/` (per `tsconfig.json`). All new files use this — never relative paths longer than `./SiblingFile`.

---

## No Analog Found

Files with no close codebase match (planner uses UI-SPEC + RESEARCH.md / external docs instead):

| File | Reason | Mitigation |
|------|--------|------------|
| `justfile` | No existing root-level recipe runner. | UI-SPEC D-11 + Typst CLI docs. Single recipe; trivial. |
| `public/cv.pdf` | `public/` is empty today; no static asset analog. | Generated from `assets/CV.typ` via `just cv`; committed binary. |
| `src/app/icon.tsx` | No existing `ImageResponse`-using file in the project. | Next.js `app/icon.tsx` convention docs (UI-SPEC §"Favicon Visual Contract" provides exact contract). Confirm `output: 'export'` compatibility per CONTEXT.md D-19. |
| Number-input control styling | No existing form input in the codebase. | UI-SPEC §"Number input contract" provides locked values (border colors, padding, focus ring, clamp-on-blur). Combined with Pattern 5 (token consumption). |
| Inline SVG icons (refresh, download) | No existing inline SVG icon usage in components. | UI-SPEC §"Refresh button contract" and §"Download Button" each provide the exact SVG path data verbatim. |
| `requestAnimationFrame` scroll loop | Header uses passive scroll without rAF (just `setState`). FadeUp uses IntersectionObserver. No existing rAF pattern. | UI-SPEC §"Scroll-driven rotation (D-07)" provides the explicit constraints (latestScrollY pattern, no layout reads in rAF, IntersectionObserver-gated `will-change`). Standard well-documented pattern. |

---

## Metadata

**Analog search scope:**
- `src/app/` (2 files: layout.tsx, page.tsx)
- `src/components/` (12 files across hero, header, cv, contact, projects, ui)
- `src/hooks/` (1 file)
- `src/lib/` (2 files: date.ts, projects.ts)
- `src/data/` (3 files: cv.ts, projects.ts, projects.json)
- `src/styles/tokens.css`
- `.github/workflows/deploy.yml`
- `next.config.ts`, `package.json`, root config

**Files scanned:** ~22 source files (entire `src/` is small enough to read fully).

**Pattern extraction date:** 2026-06-04

**Critical correction surfaced for planner:**
> CONTEXT.md D-09 says HeroMandala will be the **first Client Component** in this codebase. **This is incorrect.** Three `'use client'` files already exist: `src/hooks/useReducedMotion.ts`, `src/components/ui/FadeUp.tsx`, `src/components/header/Header.tsx`. The Client-Component pattern (with IntersectionObserver, useReducedMotion, passive scroll listeners) is well-established. Planner should treat HeroMandala as a "follow the existing pattern" task rather than a "first-of-its-kind" risk.
