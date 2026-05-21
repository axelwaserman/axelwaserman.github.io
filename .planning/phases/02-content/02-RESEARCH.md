# Phase 2: Content — Research

**Researched:** 2026-05-21
**Domain:** Next.js App Router static export — static content sections, custom hooks, scroll-reveal, OpenGraph metadata
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hero section**
- D-01: Layout is left-aligned editorial — name, title, bio, and CTA links flush left. No centered axis, no two-column split.
- D-02: No photo — text-only hero. Keeps the typographic, editorial feel aligned with the Instrument Serif/parchment direction.
- D-03: Name uses display scale (`--text-hero`) — large Instrument Serif statement that commands the first viewport. Title and bio in Sora body size below.
- D-04: Hero is full viewport height (`min-h-screen`) — recruiter sees only the hero on load, then scrolls into the CV.

**CV content & data**
- D-05: CV content lives in a typed data file at `src/data/cv.ts` — exports `WorkEntry[]`, `EducationEntry[]`, `string[]` for skills. Components receive data as props. Content is decoupled from layout.
- D-06: Approximately 3–5 work entries — standard timeline density.
- D-07: CV layout is two-column: section label (~20% width) anchors the left column; entries fill the right column. Switches to single-column on mobile.
- D-08: Bio copy in `src/data/cv.ts` uses a placeholder for now — Axel will fill it in before going live.

**Navigation**
- D-09: Sticky header contains name on left + section links on right — "Axel W" as left anchor, links (About, CV, Projects, Contact) on the right.
- D-10: On mobile (< 640px), nav links are hidden — header shows name only.
- D-11: Header starts transparent over the hero; gains `--color-surface` background after scrolling past the hero fold (`window.scrollY > 100`). No library needed.

**Animation & spacing tokens**
- D-12: Spacing tokens: section-level only — add `--space-section` (`clamp(4rem, 3rem + 5vw, 10rem)`) and `--radius-card` to `tokens.css`.
- D-13: Scroll-reveal: opacity 0→1, translateY 16px→0, 400ms ease-out. Triggered by IntersectionObserver. Respects `prefers-reduced-motion`.
- D-14: Animation uses a `useReducedMotion` hook and a reusable `FadeUp` wrapper component. No animation library — native IntersectionObserver only.

### Claude's Discretion

- Exact `clamp()` value for `--space-section` (guideline: 4rem min, 10rem max)
- `--radius-card` value (guideline: 0.5–1rem)
- Skills section layout within the right column (flat tag list, comma-separated, or grouped by category)
- Exact scroll threshold for header background trigger (guideline: ~100px or hero height)
- Component file structure within `src/components/` (planner decides)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-01 | Page shows user's name and title/tagline on load | Hero Server Component, left-aligned, `min-h-screen`, `--text-hero` token |
| HERO-02 | Hero section includes a 1-2 sentence personal bio | cv.ts data file, bio field, max-width 60ch |
| HERO-03 | Hero section includes CTA links to GitHub, LinkedIn, email, and CV download | `<a>` tags with `href`, `mailto:`, `/cv.pdf` static file |
| CV-01 | Work experience section with role, company, dates, and brief description per entry | `WorkEntry[]` type, `WorkEntry` component, two-column grid |
| CV-02 | Education section with degree, institution, and years per entry | `EducationEntry[]` type, `EducationEntry` component |
| CV-03 | Skills section listing languages, tools, and frameworks as flat list (no progress bars) | `string[]` skills, `SkillsList` component, comma-separated or tag layout |
| CV-04 | Contact section with email, LinkedIn, and GitHub links | `Contact` Server Component, links mirror hero CTA set |
| INFRA-01 | Single scrolling page with sticky/fixed header containing anchor nav links | `Header` Client Component, `position: sticky`, anchor hrefs with `#id` |
| INFRA-02 | Fully responsive layout — usable on 320px+ and 1440px | Tailwind `sm:` breakpoint, `max-w` container, horizontal padding |
| INFRA-03 | OpenGraph meta tags set for accurate social sharing preview | Next.js `metadata` export in `page.tsx` or `layout.tsx`, `openGraph` object |
| INFRA-04 | Downloadable CV PDF linked from the site | Static file `public/cv.pdf`, `<a href="/cv.pdf" download>` |
| INFRA-05 | Subtle scroll-reveal animations on section entry, respects `prefers-reduced-motion` | `FadeUp` Client Component, IntersectionObserver, `useReducedMotion` hook |
</phase_requirements>

---

## Summary

Phase 2 builds all static content sections of the personal website on top of the Phase 1 foundation. There are no new npm packages to install — every dependency needed (Next.js 16, React 19, TypeScript 6, Tailwind v4, clsx, tailwind-merge) is already in `package.json`. The entire phase is custom component authoring.

The key technical boundary is the **Server Component default**: every content-only component (Hero, CV, WorkEntry, EducationEntry, SkillsList, Contact) must be Server Components (no `'use client'` directive). Only two files require client-side JavaScript: `Header` (needs `window.scrollY` scroll state) and `FadeUp` (needs IntersectionObserver). This boundary keeps the JS bundle small and avoids hydration overhead for static content.

The OpenGraph metadata requirement (INFRA-03) is satisfied by extending the existing `metadata` export in `src/app/layout.tsx` or adding a `metadata` export to `src/app/page.tsx`. Next.js 16's `Metadata` type fully supports `openGraph`, `twitter`, and `metadataBase` — all baked into the static HTML at build time with no server needed. [VERIFIED: nextjs.org/docs/app/api-reference/functions/generate-metadata]

**Primary recommendation:** Build in vertical slices — each section (Hero → Header → CV → Contact → FadeUp) is a complete, independently testable unit before proceeding to the next.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hero section (name, bio, CTAs) | Frontend Server (static render) | — | Pure static HTML, no runtime state. Server Component renders at build time. |
| CV data (WorkEntry, EducationEntry, Skills) | Frontend Server (static render) | — | Data file imported at build time, passed as props. Server Components. |
| Contact section | Frontend Server (static render) | — | Static links, no dynamic state. |
| Sticky header (transparent→solid) | Browser / Client | — | `window.scrollY` requires browser APIs; must be `'use client'`. |
| Scroll-reveal (FadeUp) | Browser / Client | — | IntersectionObserver is a browser API; must be `'use client'`. |
| OpenGraph metadata | Frontend Server (build time) | — | `metadata` export in layout/page runs at `next build`, outputs `<meta>` tags in static HTML. |
| Anchor navigation (#section) | Browser / Client | Frontend Server | `href="#id"` anchors work natively in HTML; no JS needed. |
| Responsive layout | Browser / Client | — | Tailwind breakpoint classes, pure CSS. |

---

## Standard Stack

### Core (already installed — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.6 | App Router, static export, metadata API | Project constraint; non-negotiable |
| React | 19.2.6 | Component model, hooks | Bundled with Next.js |
| TypeScript | 6.0.3 | Type safety for data file interfaces | Project constraint; `strict: true` |
| Tailwind CSS | 4.3.0 | Utility classes, `@theme` tokens | Project constraint; all tokens in `tokens.css` |
| clsx | 2.1.1 | Conditional className composition | Already installed; use in all components |
| tailwind-merge | 3.6.0 | Deduplicate Tailwind classes in reusable components | Already installed; use in components accepting `className` prop |

[VERIFIED: npm registry] — all versions confirmed above.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `window.scrollY` | Native browser API | Header scroll state detection | In `Header` client component only |
| `IntersectionObserver` | Native browser API | Scroll-reveal trigger | In `FadeUp` client component only |
| `window.matchMedia('(prefers-reduced-motion: reduce)')` | Native browser API | `useReducedMotion` hook | Inside `FadeUp` and `useReducedMotion` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native IntersectionObserver | Framer Motion / GSAP ScrollTrigger | Context decision D-14 locked native-only; libraries add bundle weight |
| Native `window.scrollY` | Scroll event library | Native is sufficient for a single `>100px` threshold check |
| Static `metadata` export | `generateMetadata` async function | Static export; no request data available; use static `metadata` object |

**Installation:** No new packages. Phase 2 is entirely custom component authoring on the existing stack.

---

## Package Legitimacy Audit

No new packages are installed in Phase 2. All dependencies were installed in Phase 1 and are already in `package.json`. This section is not applicable.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Browser request to /
         │
         ▼
┌────────────────────────────────────────────────────┐
│  next build (static export)                        │
│                                                    │
│  src/app/page.tsx (Server Component)               │
│    ├── metadata export → <meta og:*> in HTML head  │
│    ├── <Header />    ← Client Component            │
│    │     └── window.scrollY → transparent/solid    │
│    └── <main>                                      │
│         ├── <Hero />     Server Component          │
│         ├── <CV />       Server Component          │
│         │    ├── <WorkEntry />   (×3–5)            │
│         │    ├── <EducationEntry /> (×1–2)         │
│         │    └── <SkillsList />                    │
│         └── <Contact />  Server Component          │
│                                                    │
│  Each section wrapped in <FadeUp />                │
│  (Client Component — IntersectionObserver)         │
│                                                    │
│  src/data/cv.ts → props flow down (no fetch)       │
└────────────────────────────────────────────────────┘
         │
         ▼
     out/index.html  (static HTML shipped to GitHub Pages)
```

Data flow:
- `src/data/cv.ts` exports typed arrays → imported by `CV` Server Component → props to `WorkEntry[]`, `EducationEntry[]`, `SkillsList`
- `Header` reads `window.scrollY` on the client → toggles CSS class for background
- `FadeUp` wraps each section → IntersectionObserver triggers opacity/translate animation on entry

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx        # root layout — extend metadata with openGraph here
│   ├── page.tsx          # single page — composes Header + Hero + CV + Contact
│   └── globals.css       # @import tailwindcss, @import tokens.css, body styles
├── components/
│   ├── header/
│   │   └── Header.tsx    # 'use client' — scroll state, sticky nav
│   ├── hero/
│   │   └── Hero.tsx      # Server Component — name, title, bio, CTAs
│   ├── cv/
│   │   ├── CV.tsx        # Server Component — two-column layout shell
│   │   ├── WorkEntry.tsx # Server Component — single work entry row
│   │   ├── EducationEntry.tsx  # Server Component — single education row
│   │   └── SkillsList.tsx     # Server Component — flat skill tags
│   ├── contact/
│   │   └── Contact.tsx   # Server Component — contact links section
│   └── ui/
│       └── FadeUp.tsx    # 'use client' — IntersectionObserver wrapper
├── data/
│   └── cv.ts             # typed data file: WorkEntry[], EducationEntry[], string[]
├── hooks/
│   └── useReducedMotion.ts  # 'use client' hook
└── styles/
    └── tokens.css        # @theme block — Phase 2 adds --space-section, --radius-card, --duration-reveal, --ease-reveal
```

### Pattern 1: Server Component Default

**What:** All components that render static content are Server Components by default in Next.js App Router. No `'use client'` directive = server component.
**When to use:** Any component that only receives props and renders HTML — Hero, CV, WorkEntry, EducationEntry, SkillsList, Contact.
**Example:**
```typescript
// Source: nextjs.org/docs/app/guides/static-exports
// Server Component — no directive needed
interface WorkEntryProps {
  entry: WorkEntry
}

export default function WorkEntry({ entry }: WorkEntryProps) {
  return (
    <article>
      <h3>{entry.role}</h3>
      <p>{entry.company} — {entry.dates}</p>
      <p>{entry.description}</p>
    </article>
  )
}
```

### Pattern 2: Client Component for Browser APIs

**What:** Any component that uses `window`, `document`, `localStorage`, `IntersectionObserver`, or React hooks that depend on browser state (`useState`, `useEffect`) must be marked `'use client'`.
**When to use:** Header (scroll detection), FadeUp (IntersectionObserver), useReducedMotion (matchMedia).
**Example:**
```typescript
// Source: nextjs.org/docs/app/guides/static-exports#browser-apis
'use client'

import { useEffect, useState } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 transition-colors duration-300 ${
        scrolled ? 'bg-[var(--color-surface)] shadow-sm' : 'bg-transparent'
      }`}
    >
      {/* nav content */}
    </header>
  )
}
```

### Pattern 3: IntersectionObserver Scroll-Reveal

**What:** A `FadeUp` wrapper that observes when an element enters the viewport and applies a CSS transition.
**When to use:** Wrap any section that needs scroll-reveal animation. Respects `prefers-reduced-motion` via the `useReducedMotion` hook.
**Example:**
```typescript
// Source: MDN IntersectionObserver + CONTEXT.md D-13, D-14
'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface FadeUpProps {
  children: React.ReactNode
  className?: string
}

export default function FadeUp({ children, className }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !ref.current) return

    const el = ref.current
    el.style.opacity = '0'
    el.style.transform = 'translateY(16px)'

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
```

### Pattern 4: useReducedMotion Hook

**What:** A client-side hook that reads the OS `prefers-reduced-motion` media query.
**When to use:** Inside `FadeUp` to gate all motion. Handles SSR by defaulting to `false` (no motion preference on server).
**Example:**
```typescript
// Source: MDN prefers-reduced-motion + CONTEXT.md D-14
'use client'

import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}
```

### Pattern 5: OpenGraph Metadata (Static)

**What:** Next.js `metadata` export that generates `<meta og:*>` tags at build time. Must live in a Server Component file (layout or page).
**When to use:** Add to `src/app/layout.tsx` for site-wide OG tags. Since this is a single-page site, layout-level is appropriate.
**Example:**
```typescript
// Source: nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Axel W — Software Engineer',
  description: 'Software engineer — portfolio and CV',
  metadataBase: new URL('https://axelw.github.io'),
  openGraph: {
    title: 'Axel W — Software Engineer',
    description: 'Software engineer — portfolio and CV',
    url: 'https://axelw.github.io',
    siteName: 'Axel W',
    type: 'website',
    images: [
      {
        url: '/og-image.png',  // static file in public/; Axel provides before launch
        width: 1200,
        height: 630,
        alt: 'Axel W — Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Axel W — Software Engineer',
    description: 'Software engineer — portfolio and CV',
  },
}
```

**Important:** The `metadata` export and `generateMetadata` function are only supported in Server Components. `layout.tsx` already has no `'use client'` directive — safe to add metadata there. [VERIFIED: nextjs.org/docs/app/api-reference/functions/generate-metadata]

### Pattern 6: Typed CV Data File

**What:** A TypeScript module exporting typed arrays that serve as the single source of truth for all CV content.
**When to use:** Import in `CV.tsx` and pass down as props. Decouples content from layout.
**Example:**
```typescript
// src/data/cv.ts
export interface WorkEntry {
  role: string
  company: string
  dates: string          // e.g. "2022 — Present"
  description: string
}

export interface EducationEntry {
  degree: string
  institution: string
  years: string          // e.g. "2018 — 2022"
}

export const workEntries: WorkEntry[] = [
  {
    role: 'Software Engineer',
    company: 'Placeholder Company',
    dates: '2023 — Present',
    description: 'Placeholder description.',
  },
  // ... 2-4 more entries
]

export const educationEntries: EducationEntry[] = [
  {
    degree: 'Placeholder Degree',
    institution: 'Placeholder University',
    years: '2019 — 2023',
  },
]

export const skills: string[] = [
  'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'PostgreSQL',
]

export const bio = 'Building thoughtful software. Open to new opportunities.'

export const title = 'Software Engineer'
```

### Pattern 7: Two-Column CV Layout with Tailwind

**What:** CSS Grid two-column layout — label column ~20%, entries column ~80% — switching to single-column on mobile.
**When to use:** The outer `CV` component shell for each of Work, Education, Skills.
**Example:**
```typescript
// UI-SPEC.md CV Section layout
// Mobile: single column (default)
// sm: (640px+): two-column grid
<div className="grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12">
  <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
    Work
  </div>
  <div className="space-y-12">
    {/* WorkEntry components */}
  </div>
</div>
```

### Anti-Patterns to Avoid

- **`'use client'` on content components:** Hero, CV, WorkEntry, EducationEntry, SkillsList, Contact have no browser APIs. Adding `'use client'` unnecessarily increases bundle size and disables server rendering.
- **Inline `style` for animation initial state in FadeUp:** Setting `opacity: 0` via inline style in JSX render causes a flash on server-rendered HTML (element visible before JS hydrates). Set initial state in `useEffect` after mount instead.
- **`window.scrollY` outside `useEffect`:** Accessing `window` at module scope or render time crashes during `next build` (server environment has no `window`). Always access inside `useEffect` or event handlers.
- **`generateMetadata` async function when static is sufficient:** For a fully static site with no dynamic data, use the `metadata` object export — simpler and avoids any async overhead.
- **Animating `height`, `top`, or `margin`:** These cause layout recalculation. Use only `opacity` and `transform: translateY` for scroll-reveal — both are compositor-friendly. [CITED: CLAUDE.md performance.md]
- **Hardcoding color values instead of CSS custom properties:** All colors, spacing, and type sizes must reference `var(--token-name)` — never `#fff` or `1rem` inline. [CITED: CLAUDE.md web/coding-style.md]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OpenGraph meta tags | Custom `<head>` manipulation | Next.js `metadata` export | Next.js handles `<head>` injection, deduplication, and correct static rendering automatically |
| Font loading | `<link>` tags or manual @font-face | `next/font/google` (already wired in layout.tsx) | Already set up in Phase 1; fonts are self-hosted at build time, zero CLS |
| Conditional className merging | String concatenation or ternaries | `clsx` + `tailwind-merge` | Handles edge cases, prevents Tailwind class conflicts in reusable components |
| Responsive breakpoints | Custom media queries in CSS | Tailwind `sm:` prefix | Already in the stack; consistent with the rest of the project |
| CSS custom property declaration | `:root {}` blocks | `@theme {}` in `tokens.css` | Tailwind v4 `@theme` generates utility classes AND sets CSS variables; `:root` only does the latter |

**Key insight:** This phase has no unsolved infrastructure problems. Every tool is already installed and configured. The work is authoring — write components, wire data, apply tokens.

---

## Common Pitfalls

### Pitfall 1: `window` accessed during `next build`

**What goes wrong:** Build fails with `ReferenceError: window is not defined` if `window.scrollY`, `IntersectionObserver`, or `window.matchMedia` are called at module scope or at component render time.
**Why it happens:** Next.js Server Components and the static export build run in a Node.js environment where `window` does not exist.
**How to avoid:** Always access browser APIs inside `useEffect` (which only runs client-side after hydration). `'use client'` alone is not sufficient — the component still server-renders to HTML, and module-level code runs on the server.
**Warning signs:** Build error mentioning `window is not defined` or `document is not defined`.

### Pitfall 2: FadeUp causes layout shift (FOUC)

**What goes wrong:** Elements are briefly visible at full opacity before JavaScript hydrates and sets `opacity: 0`. This looks like a flash of unstyled content.
**Why it happens:** Server-rendered HTML contains the element without opacity:0. The browser paints it, then JS sets opacity:0 a few milliseconds later.
**How to avoid:** Set the initial hidden state (`opacity: 0; transform: translateY(16px)`) inside `useEffect` rather than in JSX render. This way the element is only hidden after the client JS runs — but since the observer fires quickly, the net effect is invisible to users. Alternatively, use a CSS class toggled by JS instead of inline styles.
**Warning signs:** Flicker visible on hard refresh; visible elements disappear momentarily then fade back in.

### Pitfall 3: `metadata` export in a `'use client'` file

**What goes wrong:** TypeScript error or Next.js build error: "Metadata is not supported in Client Components."
**Why it happens:** The `metadata` export (and `generateMetadata`) are only valid in Server Components. `src/app/layout.tsx` is currently a Server Component — do not add `'use client'` to it.
**How to avoid:** Keep `layout.tsx` as a Server Component. If interactive children are needed, extract them into separate `'use client'` files.
**Warning signs:** Build error: "You are attempting to export `metadata` from a component marked with `'use client'`."

### Pitfall 4: Tailwind v4 `@theme` variable naming collisions

**What goes wrong:** Defining `--text-*` tokens in `@theme` and also using Tailwind's built-in `text-{size}` utilities creates confusion. Custom `--text-ui`, `--text-body` etc. already defined in Phase 1 — they generate utility classes like `text-ui`, `text-body`.
**Why it happens:** Tailwind v4's `@theme` namespace `--text-*` maps to font-size utilities. The tokens exist as both CSS variables (accessible via `var(--text-body)`) and as utility classes (`text-body`).
**How to avoid:** Use `text-body`, `text-hero`, etc. as Tailwind utility classes (no `var()` wrapper) OR reference `var(--text-body)` in arbitrary values like `text-[length:var(--text-body)]`. Both work — pick one style and be consistent.
**Warning signs:** Text sizes not applying as expected; confusing utility class vs CSS variable usage.

### Pitfall 5: `position: fixed` vs `position: sticky` for header

**What goes wrong:** `position: fixed` removes the header from document flow, causing the first section to render behind it. `position: sticky` keeps it in flow but needs a parent that allows scrolling.
**Why it happens:** Common confusion between the two positioning modes.
**How to avoid:** Per UI-SPEC.md, use `position: sticky; top: 0; z-index: 50`. The sticky header stays in normal flow and doesn't overlap content. The page content starts below the header naturally.
**Warning signs:** Hero section text hidden behind header; scroll position off by header height when clicking anchor links.

### Pitfall 6: Anchor link scroll offset with sticky header

**What goes wrong:** Clicking anchor nav links (e.g. `href="#cv"`) scrolls so the section heading lands directly under the sticky header, obscuring it.
**Why it happens:** Browser default anchor scroll positions the element at the exact viewport top — no offset for the header height.
**How to avoid:** Add `scroll-margin-top` to section elements equal to the header height (64px). In Tailwind: `scroll-mt-16` on each `<section>`. [ASSUMED — standard pattern; not verified against specific Next.js/Tailwind version docs]
**Warning signs:** Section headings hidden behind the sticky header after clicking anchor nav.

### Pitfall 7: `og:image` requires absolute URL

**What goes wrong:** Build warning or social preview broken — OG images with relative paths don't work.
**Why it happens:** The Open Graph spec requires absolute URLs for `og:image`. Next.js uses `metadataBase` to resolve relative paths automatically, but `metadataBase` must be set.
**How to avoid:** Set `metadataBase: new URL('https://axelw.github.io')` in the `metadata` object when adding `openGraph.images`. Without `metadataBase`, passing `/og-image.png` causes a build error.
**Warning signs:** Next.js build warning: "metadata.metadataBase is not set for resolving social open graph or twitter images."

---

## Code Examples

Verified patterns from official sources:

### OpenGraph metadata in layout.tsx
```typescript
// Source: nextjs.org/docs/app/api-reference/functions/generate-metadata#opengraph
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://axelw.github.io'),
  openGraph: {
    title: 'Axel W — Software Engineer',
    description: 'Software engineer — portfolio and CV',
    url: 'https://axelw.github.io',
    siteName: 'Axel W',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}
```

### Sticky header with scroll detection
```typescript
// Source: nextjs.org/docs/app/guides/static-exports#browser-apis
'use client'
import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={clsx(
        'sticky top-0 z-50 h-16 transition-colors duration-300',
        scrolled ? 'bg-[var(--color-surface)] shadow-sm' : 'bg-transparent'
      )}
    >
      {/* ... */}
    </header>
  )
}
```

### useReducedMotion hook
```typescript
// Source: MDN prefers-reduced-motion, CONTEXT.md D-14
'use client'
import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}
```

### FadeUp component with IntersectionObserver
```typescript
// Source: MDN IntersectionObserver API, CONTEXT.md D-13
'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function FadeUp({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(16px)'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced])

  return <div ref={ref} className={className}>{children}</div>
}
```

### Tailwind v4 @theme token extension
```css
/* Source: tailwindcss.com/docs/theme, CONTEXT.md D-12, UI-SPEC.md */
/* Add to src/styles/tokens.css inside the existing @theme block */
@theme {
  /* ... existing tokens from Phase 1 ... */

  /* Spacing — section-level */
  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  /* Radius */
  --radius-card: 0.75rem;

  /* Animation */
  --duration-reveal: 400ms;
  --ease-reveal: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `next export` CLI command | `output: 'export'` in `next.config.ts` | Next.js 14 | Already done in Phase 1; no change needed |
| `themeColor` in metadata | `generateViewport` export | Next.js 13.2 | Not needed for this phase |
| Pages Router for static sites | App Router (stable since 13.4) | Next.js 13.4 | Already using App Router from Phase 1 |
| Tailwind v3 `tailwind.config.js` | Tailwind v4 CSS-first `@theme` in CSS file | Tailwind v4 (2025) | Already using v4 from Phase 1; `@theme` in `tokens.css` |
| `window.addEventListener('scroll')` churn | `{ passive: true }` flag on scroll listener | Long established | Use `passive: true` for all scroll handlers — prevents blocking main thread |

**Deprecated/outdated:**
- `next export` CLI: removed in Next.js 14; use `output: 'export'` config instead (already done)
- `metadata.viewport` / `metadata.themeColor`: deprecated in Next.js 13.2 in favor of `generateViewport`; not needed in Phase 2

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `scroll-margin-top` (Tailwind `scroll-mt-16`) is the standard solution for anchor link offset with sticky headers | Common Pitfalls — Pitfall 6 | Low — even if the utility class name is wrong, the CSS property name is a verified standard; adjust class name accordingly |
| A2 | OG image optimal dimensions are 1200×630px | Code Examples — OpenGraph metadata | Low — dimensions affect only how social platforms crop the preview; won't break the site |

**All other claims in this research were verified via official Next.js documentation or confirmed from the existing codebase.**

---

## Open Questions

1. **OG image file**
   - What we know: INFRA-03 requires OpenGraph meta tags; the `metadata` export is the correct implementation
   - What's unclear: Axel has not provided an `og-image.png` file for `public/`. The metadata can be added now; the image file is Axel's responsibility before launch.
   - Recommendation: Add metadata with `og:image` pointing to `/og-image.png`; add a note in the plan that `public/og-image.png` is a human-provided asset (like `public/cv.pdf`). Do not block Phase 2 on this.

2. **CV PDF file**
   - What we know: INFRA-04 requires a downloadable CV PDF at `/cv.pdf`
   - What's unclear: `public/` directory is currently empty — Axel has not provided the PDF.
   - Recommendation: Link to `/cv.pdf` in the hero CTA and contact section. Add a placeholder note. The file is Axel's to provide before deploy.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `next build`, `next dev` | ✓ | 25.7.0 | — |
| npm | Package management | ✓ | 11.10.1 | — |
| Next.js | App framework | ✓ | 16.2.6 (in node_modules) | — |
| Tailwind CSS | Styling | ✓ | 4.3.0 (in node_modules) | — |
| TypeScript | Type checking | ✓ | 6.0.3 (in node_modules) | — |
| `public/cv.pdf` | INFRA-04 (CV download) | ✗ | — | Link still renders; 404 until Axel provides the file |
| `public/og-image.png` | INFRA-03 (OG image) | ✗ | — | `og:image` tag still renders; social preview image missing until provided |

**Missing dependencies with no fallback:** None — build succeeds without the PDF and OG image.

**Missing dependencies with fallback:**
- `public/cv.pdf` — linked in hero and contact as `/cv.pdf`; plan must note this is a human-provided asset
- `public/og-image.png` — referenced in metadata; plan must note this is a human-provided asset

---

## Validation Architecture

> `workflow.nyquist_validation` is explicitly `false` in `.planning/config.json`. This section is skipped.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in Phase 2 |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | All content is public |
| V5 Input Validation | No | No user input in Phase 2 (all static content) |
| V6 Cryptography | No | No cryptography |

### Known Threat Patterns for Static Personal Website

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via hardcoded content | Tampering | Content is hardcoded TypeScript — no unsanitized user input. No `dangerouslySetInnerHTML`. |
| External link to `javascript:` | Tampering | All external links hardcoded to `https://` or `mailto:` — no user-supplied URLs |
| Clickjacking | Elevation | GitHub Pages serves standard headers; no specific risk for a public portfolio |

**Security verdict:** Phase 2 has no meaningful attack surface. All content is hardcoded in TypeScript. No user input, no APIs, no auth. Standard static site security posture — no special action required beyond following the no-`dangerouslySetInnerHTML` rule.

---

## Project Constraints (from CLAUDE.md)

The following directives from `CLAUDE.md` are actionable constraints the planner must respect:

1. **`output: 'export'` in `next.config.ts`** — already configured in Phase 1; do not change it. Server Actions, ISR, cookies, rewrites, and API routes are unavailable.
2. **No `shadcn/ui`** — explicitly excluded; all components are custom.
3. **App Router only** — Pages Router is out; all components in `src/app/` and `src/components/`.
4. **Tailwind v4 `@theme`** — all design tokens go inside `@theme {}` in `tokens.css`, not in `:root {}` or a `tailwind.config.js`.
5. **`next/font/google`** — fonts already loaded in `layout.tsx`; do not add `<link>` tags or self-host manually.
6. **`clsx` + `tailwind-merge`** — use for conditional class composition; do not use string concatenation.
7. **`images: { unoptimized: true }`** — already set; do not use `next/image` with optimization features.
8. **Light theme only** — no dark mode variants.
9. **No CMS, no contact form** — all content hardcoded in TypeScript.
10. **`@/*` path alias** — TypeScript paths configured; use `@/components/...`, `@/data/...`, `@/hooks/...` in imports.
11. **Strict TypeScript** — `strict: true` in `tsconfig.json`; all props and return types must be explicit on exported functions.

---

## Sources

### Primary (HIGH confidence)
- `nextjs.org/docs/app/api-reference/functions/generate-metadata` — OpenGraph metadata shape, `metadataBase`, static `metadata` export; version 16.2.6, fetched 2026-05-21
- `nextjs.org/docs/app/guides/static-exports` — static export constraints, `'use client'` Browser API pattern, `useEffect` for window access; version 16.2.6, fetched 2026-05-21
- `/Users/axel/code/website/src/styles/tokens.css` — existing `@theme` tokens confirmed (colors, type scale, font families)
- `/Users/axel/code/website/src/app/layout.tsx` — font variables confirmed (`--font-body`, `--font-heading`), existing metadata object shape
- `/Users/axel/code/website/package.json` — all dependency versions confirmed
- `tailwindcss.com/docs/theme` — `@theme` directive, namespace-to-utility mapping, v4 CSS-first configuration

### Secondary (MEDIUM confidence)
- `.planning/phases/02-content/02-UI-SPEC.md` — all layout specifications, spacing values, typography roles, component inventory (generated by gsd-ui-researcher, reviewed 2026-05-21)
- `.planning/phases/02-content/02-CONTEXT.md` — locked decisions D-01 through D-14

### Tertiary (LOW confidence)
- A1: `scroll-margin-top` / `scroll-mt-16` for sticky header anchor offset — standard web pattern, not verified against specific Next.js/Tailwind docs in this session

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed in `package.json` and npm registry; no new installs
- Architecture: HIGH — Server/Client component boundary verified against official Next.js static export docs
- Pitfalls: HIGH for Pitfalls 1–5, 7 (verified); MEDIUM for Pitfall 6 (assumed standard pattern)
- Patterns: HIGH — all patterns reference official docs or existing codebase

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (Next.js 16 is very recent; 30-day window is conservative)
