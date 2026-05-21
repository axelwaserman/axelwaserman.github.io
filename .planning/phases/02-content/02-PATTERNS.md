# Phase 2: Content - Pattern Map

**Mapped:** 2026-05-21
**Files analyzed:** 13 new/modified files
**Analogs found:** 2 / 13 (codebase is pre-component; most patterns come from existing foundation files)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/styles/tokens.css` | config | transform | `src/styles/tokens.css` (existing) | exact — extend in place |
| `src/app/layout.tsx` | config | request-response | `src/app/layout.tsx` (existing) | exact — extend in place |
| `src/app/page.tsx` | component | request-response | `src/app/page.tsx` (existing) | exact — replace stubs |
| `src/data/cv.ts` | utility | transform | none — no data files exist | no analog |
| `src/components/header/Header.tsx` | component | event-driven | none — no components exist | no analog |
| `src/components/hero/Hero.tsx` | component | request-response | none — no components exist | no analog |
| `src/components/cv/CV.tsx` | component | request-response | none — no components exist | no analog |
| `src/components/cv/WorkEntry.tsx` | component | request-response | none — no components exist | no analog |
| `src/components/cv/EducationEntry.tsx` | component | request-response | none — no components exist | no analog |
| `src/components/cv/SkillsList.tsx` | component | request-response | none — no components exist | no analog |
| `src/components/contact/Contact.tsx` | component | request-response | none — no components exist | no analog |
| `src/components/ui/FadeUp.tsx` | component | event-driven | none — no components exist | no analog |
| `src/hooks/useReducedMotion.ts` | hook | event-driven | none — no hooks exist | no analog |

---

## Pattern Assignments

### `src/styles/tokens.css` (config, transform)

**Analog:** `src/styles/tokens.css` (existing file — extend in place)

**Existing `@theme` block** (lines 1–17 of current file):
```css
@theme {
  /* Color tokens — warm ink / parchment direction (D-06, D-08, D-09) */
  --color-surface: oklch(97% 0.01 75);
  --color-text: oklch(18% 0.01 75);
  --color-accent: oklch(62% 0.19 55);
  --color-muted: oklch(55% 0.03 75);

  /* Type scale tokens — fluid responsive scaling via clamp() (D-05) */
  --text-ui: clamp(0.875rem, 0.82rem + 0.28vw, 1rem);
  --text-body: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --text-heading: clamp(1.75rem, 1.4rem + 1.75vw, 2.5rem);
  --text-hero: clamp(3rem, 1.5rem + 7.5vw, 7rem);

  /* Font family tokens */
  --font-body: Sora, system-ui, sans-serif;
  --font-heading: 'Instrument Serif', Georgia, serif;
}
```

**Addition pattern — append inside the same `@theme` block** (do NOT create a second `@theme` block):
```css
@theme {
  /* ... existing tokens above ... */

  /* Spacing — section-level vertical padding */
  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  /* Radius */
  --radius-card: 0.75rem;

  /* Animation */
  --duration-reveal: 400ms;
  --ease-reveal: cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Key constraint:** Tailwind v4 `@theme` generates utility classes AND CSS variables. Only one `@theme` block per file. Append tokens inside the existing block.

---

### `src/app/layout.tsx` (config, request-response)

**Analog:** `src/app/layout.tsx` (existing file — extend metadata object)

**Existing file** (lines 1–34):
```typescript
import type { Metadata } from 'next'
import { Sora, Instrument_Serif } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Axel W — Software Engineer',
  description: 'Software engineer — portfolio and CV',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

**Extension pattern — replace `metadata` export only** (keep all other code unchanged):
```typescript
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
        url: '/og-image.png',
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

**Key constraint:** `layout.tsx` must NOT have `'use client'` — `metadata` export is only valid in Server Components.

---

### `src/app/page.tsx` (component, request-response)

**Analog:** `src/app/page.tsx` (existing stub — replace comment stubs with real components)

**Existing stub** (lines 1–10):
```typescript
export default function Home() {
  return (
    <main>
      {/* Hero */}
      {/* CV */}
      {/* Projects */}
      {/* Contact */}
    </main>
  )
}
```

**Replacement pattern — Server Component importing child components:**
```typescript
import Header from '@/components/header/Header'
import Hero from '@/components/hero/Hero'
import CV from '@/components/cv/CV'
import Contact from '@/components/contact/Contact'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CV />
        <Contact />
      </main>
    </>
  )
}
```

**Key constraint:** No `'use client'` on `page.tsx` — it imports Client Components (`Header`, `FadeUp`) which are isolated; the page itself stays a Server Component.

---

### `src/data/cv.ts` (utility, transform)

**Analog:** None — no data files exist in the project.

**Pattern source:** RESEARCH.md Pattern 6 + CONTEXT.md D-05, D-06, D-07, D-08.

**Full pattern to copy:**
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

export const bio = 'Building thoughtful software. Open to new opportunities.'

export const title = 'Software Engineer'

export const workEntries: WorkEntry[] = [
  {
    role: 'Software Engineer',
    company: 'Placeholder Company',
    dates: '2023 — Present',
    description: 'Placeholder description — Axel fills this in before launch.',
  },
  // 2–4 more entries following same shape
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
```

**Key constraints:**
- All exports named (no default export) — consumed separately by Hero, CV, Contact
- Interfaces exported alongside data so components can type their props against them
- `bio` and `title` are top-level string exports consumed by `Hero`

---

### `src/components/header/Header.tsx` (component, event-driven)

**Analog:** None — no components exist. Pattern comes from RESEARCH.md Pattern 2 + Code Examples.

**Full client component pattern:**
```typescript
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
        'sticky top-0 z-50 h-16 px-6 flex items-center justify-between',
        'transition-colors duration-300',
        scrolled
          ? 'bg-[var(--color-surface)] shadow-sm'
          : 'bg-transparent'
      )}
    >
      <a
        href="#hero"
        className="font-[var(--font-heading)] text-[length:var(--text-body)] font-semibold"
      >
        Axel W
      </a>
      <nav aria-label="Main navigation" className="hidden sm:flex gap-8">
        <a href="#about">About</a>
        <a href="#cv">CV</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  )
}
```

**Key constraints:**
- `'use client'` required — uses `window.scrollY` and `useState`/`useEffect`
- `{ passive: true }` on scroll listener — prevents blocking the main thread
- Nav hidden on mobile (`hidden sm:flex`) — D-10 decision
- `sticky` not `fixed` — keeps header in document flow (avoids content overlap, see Pitfall 5)
- Sections need `scroll-mt-16` to offset sticky header on anchor scroll (Pitfall 6)
- All colors via `var(--token)` — never hardcoded hex

---

### `src/components/hero/Hero.tsx` (component, request-response)

**Analog:** None — no components exist. Pattern comes from RESEARCH.md Pattern 1 + CONTEXT.md D-01 through D-04.

**Server Component pattern:**
```typescript
import { bio, title, workEntries } from '@/data/cv'

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="min-h-screen flex flex-col justify-center px-6 max-w-4xl scroll-mt-16"
    >
      <h1
        id="hero-heading"
        className="font-[var(--font-heading)] text-[length:var(--text-hero)] leading-[1.05] mb-6"
      >
        Axel W
      </h1>
      <p className="text-[length:var(--text-heading)] text-[var(--color-muted)] mb-4">
        {title}
      </p>
      <p className="text-[length:var(--text-body)] max-w-[60ch] mb-10">
        {bio}
      </p>
      <div className="flex flex-wrap gap-4">
        <a href="https://github.com/axelw" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="https://linkedin.com/in/axelw" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href="mailto:axel@example.com">Email</a>
        <a href="/cv.pdf" download>Download CV</a>
      </div>
    </section>
  )
}
```

**Key constraints:**
- No `'use client'` — purely static props from `cv.ts`, no browser APIs
- Left-aligned (D-01): no `text-center`, no `mx-auto` on the section itself
- `min-h-screen` (D-04): full viewport height
- Name in `--text-hero` / `--font-heading` (D-03): Instrument Serif at display scale
- Semantic `<section>` with `aria-labelledby` pointing to `<h1 id>`
- External links: `target="_blank" rel="noopener noreferrer"` (security)

---

### `src/components/cv/CV.tsx` (component, request-response)

**Analog:** None. Pattern from RESEARCH.md Pattern 7 + CONTEXT.md D-05, D-07.

**Server Component pattern — two-column shell:**
```typescript
import { workEntries, educationEntries, skills } from '@/data/cv'
import WorkEntry from './WorkEntry'
import EducationEntry from './EducationEntry'
import SkillsList from './SkillsList'

export default function CV() {
  return (
    <section
      id="cv"
      aria-labelledby="cv-heading"
      className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
    >
      <h2 id="cv-heading" className="sr-only">CV</h2>

      {/* Work */}
      <div className="grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12 mb-20">
        <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Work
        </div>
        <div className="space-y-12">
          {workEntries.map((entry) => (
            <WorkEntry key={`${entry.company}-${entry.dates}`} entry={entry} />
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12 mb-20">
        <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Education
        </div>
        <div className="space-y-8">
          {educationEntries.map((entry) => (
            <EducationEntry key={`${entry.institution}-${entry.years}`} entry={entry} />
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 sm:grid-cols-[20%_1fr] gap-y-8 sm:gap-x-12">
        <div className="text-[length:var(--text-ui)] font-semibold text-[var(--color-muted)] uppercase tracking-[0.08em]">
          Skills
        </div>
        <SkillsList skills={skills} />
      </div>
    </section>
  )
}
```

---

### `src/components/cv/WorkEntry.tsx` (component, request-response)

**Analog:** None. Pattern from RESEARCH.md Pattern 1 (Server Component default).

**Server Component pattern:**
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

**Key constraints:**
- Import type uses `type` keyword (TypeScript strict: avoids value import of interface)
- Props interface name disambiguated from data type (`WorkEntryType` alias)
- Semantic `<article>` for a self-contained content unit

---

### `src/components/cv/EducationEntry.tsx` (component, request-response)

**Analog:** `src/components/cv/WorkEntry.tsx` (sister component — same Server Component pattern)

**Pattern — mirrors WorkEntry structure:**
```typescript
import type { EducationEntry as EducationEntryType } from '@/data/cv'

interface EducationEntryProps {
  entry: EducationEntryType
}

export default function EducationEntry({ entry }: EducationEntryProps) {
  return (
    <article>
      <h3 className="text-[length:var(--text-body)] font-semibold mb-1">
        {entry.degree}
      </h3>
      <p className="text-[length:var(--text-ui)] text-[var(--color-muted)]">
        {entry.institution} — {entry.years}
      </p>
    </article>
  )
}
```

---

### `src/components/cv/SkillsList.tsx` (component, request-response)

**Analog:** None directly. Same Server Component pattern as WorkEntry.

**Server Component pattern — flat tag list:**
```typescript
interface SkillsListProps {
  skills: string[]
}

export default function SkillsList({ skills }: SkillsListProps) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Skills">
      {skills.map((skill) => (
        <li
          key={skill}
          className="px-3 py-1 rounded-[var(--radius-card)] bg-[oklch(from_var(--color-surface)_l_c_h_/_0.6)] border border-[var(--color-muted)]/20 text-[length:var(--text-ui)]"
        >
          {skill}
        </li>
      ))}
    </ul>
  )
}
```

**Key constraint:** No progress bars — flat list only (REQUIREMENTS.md explicit, D-05 confirmed out-of-scope).

---

### `src/components/contact/Contact.tsx` (component, request-response)

**Analog:** None. Same Server Component pattern.

**Server Component pattern:**
```typescript
export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-[var(--space-section)] px-6 max-w-4xl scroll-mt-16"
    >
      <h2
        id="contact-heading"
        className="font-[var(--font-heading)] text-[length:var(--text-heading)] mb-8"
      >
        Contact
      </h2>
      <div className="flex flex-wrap gap-6">
        <a href="mailto:axel@example.com">Email</a>
        <a href="https://linkedin.com/in/axelw" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href="https://github.com/axelw" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="/cv.pdf" download>Download CV</a>
      </div>
    </section>
  )
}
```

---

### `src/components/ui/FadeUp.tsx` (component, event-driven)

**Analog:** None. Pattern from RESEARCH.md Pattern 3 + Code Examples.

**Full client component pattern:**
```typescript
'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface FadeUpProps {
  children: React.ReactNode
  className?: string
}

export default function FadeUp({ children, className }: FadeUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return

    // Set initial state inside useEffect to avoid FOUC (Pitfall 2)
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

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
```

**Key constraints:**
- Initial `opacity: 0` set in `useEffect`, not JSX render — prevents FOUC (Pitfall 2)
- `useReducedMotion()` gates all motion — returns early if `reduced` is true, element appears at full opacity instantly
- Only animates `opacity` and `transform` — compositor-friendly (performance.md)
- `observer.unobserve(el)` after trigger — fires once per element, no repeated callbacks

---

### `src/hooks/useReducedMotion.ts` (hook, event-driven)

**Analog:** None. Pattern from RESEARCH.md Pattern 4 + Code Examples.

**Full hook pattern:**
```typescript
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

**Key constraints:**
- `useState(false)` — server default is `false`; no motion preference assumed on server (safe SSR)
- `window.matchMedia` inside `useEffect` — never at module scope (Pitfall 1)
- Responds to OS-level preference changes at runtime via `change` event
- Named export (not default) — standard for hooks

---

## Shared Patterns

### CSS Token Reference Pattern
**Source:** `src/styles/tokens.css` + `src/app/globals.css`
**Apply to:** All component files that set colors, type sizes, or spacing

```typescript
// CORRECT: Always reference tokens via var() in Tailwind arbitrary values
className="text-[length:var(--text-body)]"
className="text-[var(--color-muted)]"
className="py-[var(--space-section)]"
className="rounded-[var(--radius-card)]"

// WRONG: Never hardcode values
className="text-base"         // bypasses fluid type scale
className="text-gray-500"     // bypasses warm parchment palette
className="py-16"             // bypasses fluid spacing
```

Note: `--text-*` tokens also generate Tailwind utility classes (`text-body`, `text-hero`) via `@theme`. Both `text-body` and `text-[length:var(--text-body)]` work — pick one style per file and be consistent.

### Font Reference Pattern
**Source:** `src/app/layout.tsx` (lines 5–17) + `src/app/globals.css` (line 6)
**Apply to:** All components that set font-family

```typescript
// CORRECT: Use CSS variable tokens set by next/font
className="font-[var(--font-heading)]"   // Instrument Serif
className="font-[var(--font-body)]"      // Sora (also the body default)

// Body default: font-family already set on <body> in globals.css
// Only override when switching from body font to heading font
```

### Import Path Pattern
**Source:** `tsconfig.json` (`@/*` alias pointing to `src/`)
**Apply to:** All component and hook files

```typescript
// CORRECT: Use @/ path alias
import { workEntries } from '@/data/cv'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import FadeUp from '@/components/ui/FadeUp'

// WRONG: Relative paths that break on file moves
import { workEntries } from '../../data/cv'
```

### Server Component Default Pattern
**Source:** RESEARCH.md Pattern 1 + Next.js App Router docs
**Apply to:** Hero, CV, WorkEntry, EducationEntry, SkillsList, Contact

```typescript
// CORRECT: No directive = Server Component (renders at build time, zero JS)
interface WorkEntryProps {
  entry: WorkEntry
}
export default function WorkEntry({ entry }: WorkEntryProps) {
  return <article>...</article>
}

// WRONG: Adding 'use client' to content-only components
'use client'  // ← adds this component to the JS bundle unnecessarily
```

### Client Component Boundary Pattern
**Source:** RESEARCH.md Pattern 2 + Code Examples
**Apply to:** Header, FadeUp, useReducedMotion only

```typescript
// CORRECT: 'use client' only when browser APIs are required
'use client'

import { useEffect, useState } from 'react'

// All window/document/IntersectionObserver access inside useEffect:
useEffect(() => {
  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}, [])
```

### Semantic HTML Pattern
**Source:** Global coding-style rules
**Apply to:** All section components

```typescript
// Section wrapper pattern:
<section id="cv" aria-labelledby="cv-heading" className="scroll-mt-16 ...">
  <h2 id="cv-heading">CV</h2>
  ...
</section>

// Note: scroll-mt-16 (64px) offsets the sticky header height on anchor scroll
// Use sr-only on h2 when the section label appears in the two-column layout instead
```

### clsx Conditional Class Pattern
**Source:** CLAUDE.md stack — `clsx` + `tailwind-merge` installed
**Apply to:** Header (scroll state toggle) and any component with conditional classes

```typescript
import { clsx } from 'clsx'

// Simple conditional:
className={clsx(
  'base-class another-base',
  condition && 'conditional-class',
  scrolled ? 'bg-[var(--color-surface)]' : 'bg-transparent'
)}

// For reusable components accepting className prop, use twMerge:
import { twMerge } from 'tailwind-merge'
className={twMerge(clsx('internal-classes', props.className))}
```

---

## No Analog Found

The following files have no close match in the codebase. The planner should use RESEARCH.md patterns and the excerpts above directly.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/data/cv.ts` | utility | transform | No data files exist in the project yet |
| `src/components/header/Header.tsx` | component | event-driven | No components exist; no scroll-state components |
| `src/components/hero/Hero.tsx` | component | request-response | No components exist |
| `src/components/cv/CV.tsx` | component | request-response | No components exist |
| `src/components/cv/WorkEntry.tsx` | component | request-response | No components exist |
| `src/components/cv/EducationEntry.tsx` | component | request-response | No components exist |
| `src/components/cv/SkillsList.tsx` | component | request-response | No components exist |
| `src/components/contact/Contact.tsx` | component | request-response | No components exist |
| `src/components/ui/FadeUp.tsx` | component | event-driven | No components exist; no IntersectionObserver wrappers |
| `src/hooks/useReducedMotion.ts` | hook | event-driven | No hooks exist |

All patterns for these files are fully specified in the **Pattern Assignments** section above, drawn from RESEARCH.md verified examples and official Next.js/MDN documentation.

---

## Metadata

**Analog search scope:** `src/` (all subdirectories)
**Files scanned:** 4 existing source files (`tokens.css`, `layout.tsx`, `page.tsx`, `globals.css`)
**No-analog verdict:** This is a freshly scaffolded project — Phase 1 established the foundation; Phase 2 builds the first components. All patterns are sourced from the existing foundation files and the verified research document.
**Pattern extraction date:** 2026-05-21
