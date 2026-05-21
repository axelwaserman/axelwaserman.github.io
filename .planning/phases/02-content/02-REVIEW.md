---
phase: 02-content
reviewed: 2026-05-21T18:50:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/components/contact/Contact.tsx
  - src/components/cv/CV.tsx
  - src/components/cv/EducationEntry.tsx
  - src/components/cv/SkillsList.tsx
  - src/components/cv/WorkEntry.tsx
  - src/components/header/Header.tsx
  - src/components/hero/Hero.tsx
  - src/components/ui/FadeUp.tsx
  - src/data/cv.ts
  - src/hooks/useReducedMotion.ts
  - src/styles/tokens.css
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-21T18:50:00Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

The implementation is structurally sound: semantic HTML is used throughout, the animation pattern correctly respects `prefers-reduced-motion`, TypeScript types are clean, and the design token system is well-organized. However, three blockers need to be addressed before this code should ship:

1. Placeholder/example content is hardcoded for personal URLs and email — these will go live as-is on a public site.
2. Both linked assets (`/cv.pdf`, `/og-image.png`) are missing from `public/` — broken download link and missing OG image.
3. The header navigates to `#projects` which has no corresponding element in the DOM — a dead anchor that silently fails for users.

---

## Critical Issues

### CR-01: Placeholder email and social URLs in production code

**File:** `src/components/contact/Contact.tsx:19`, `src/components/hero/Hero.tsx:24,32,41`

**Issue:** Both the Hero and Contact sections hardcode `mailto:axel@example.com`, `https://github.com/axelw`, and `https://linkedin.com/in/axelw`. The email is an RFC-2606 example domain (not a real address). The GitHub and LinkedIn slugs are generic placeholders. These render as live, clickable links on the public site. A recruiter clicking "Email" will send mail into a void; clicking "GitHub" or "LinkedIn" may land on an unrelated third party's profile.

**Fix:** Replace all four placeholder values with real, confirmed contact details — or centralise them in `src/data/cv.ts` (which already exports `bio` and `title`) so they appear in exactly one place and are impossible to forget:

```ts
// src/data/cv.ts
export const contact = {
  email: 'your-real@email.com',
  github: 'https://github.com/your-real-handle',
  linkedin: 'https://linkedin.com/in/your-real-handle',
} as const
```

Then import and use `contact.email`, `contact.github`, `contact.linkedin` in both `Hero.tsx` and `Contact.tsx`.

---

### CR-02: `public/` directory is empty — `/cv.pdf` and `/og-image.png` are missing

**File:** `src/components/contact/Contact.tsx:42`, `src/components/hero/Hero.tsx:46`, `src/app/layout.tsx:31`

**Issue:** Three distinct locations reference files that do not exist in `public/`:

- `<a href="/cv.pdf" download>` in both `Hero.tsx` and `Contact.tsx` — clicking this link on the deployed site returns a 404. The `download` attribute is semantically correct, but the target file is absent.
- `images: [{ url: '/og-image.png' }]` in the Next.js `metadata` — the Open Graph image tag will render a broken image URL in every social card preview.

These are not future-phase concerns; the assets are already referenced in the current phase's shipping code.

**Fix:** Add the actual PDF and a 1200×630 OG image to `public/` before deploying. Until they exist, either remove the references or replace with honest placeholder paths that are documented as TODOs.

---

### CR-03: `#projects` anchor in navigation links to a non-existent section

**File:** `src/components/header/Header.tsx:45-49`

**Issue:** The nav contains `<a href="#projects">Projects</a>`. There is no element with `id="projects"` anywhere in the rendered page (`page.tsx` has a comment `{/* Projects section — Phase 3 */}` but no actual DOM node). Clicking the link leaves the user at the same scroll position with no visible feedback — a functional dead link. On a static export served over HTTPS, this also produces a console error in some browsers.

**Fix:** Either remove the Projects link until Phase 3 ships:

```tsx
{/* Projects link — re-enable when Phase 3 section is rendered */}
{/* <a href="#projects" ...>Projects</a> */}
```

Or add a stub section with the correct `id` so the anchor resolves:

```tsx
<section id="projects" aria-labelledby="projects-heading" className="...">
  {/* Phase 3 */}
</section>
```

---

## Warnings

### WR-01: `useReducedMotion` initialises to `false`, causing a motion flash on first render for users who prefer reduced motion

**File:** `src/hooks/useReducedMotion.ts:6`

**Issue:** `useState(false)` means the hook always returns `false` on the first render (SSR and initial hydration). `FadeUp` reads this value to decide whether to set `opacity: 0` and begin the animation. For users with `prefers-reduced-motion: reduce`, the correct initial state is `true`, but the hook serves `false` until the `useEffect` fires, which is after the first paint. On slow devices or during hydration this gap is visible — the element briefly flickers or starts animating before the hook corrects itself.

**Fix:** Initialise from `window.matchMedia` synchronously inside a lazy initialiser, guarded for SSR:

```ts
const [reduced, setReduced] = useState<boolean>(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
```

This eliminates the race without breaking SSR (the server-side `false` is fine; hydration picks up the correct value before any animation fires).

---

### WR-02: `FadeUp` sets inline styles after mount, leaving elements invisible if JavaScript fails or is slow

**File:** `src/components/ui/FadeUp.tsx:20-21`

**Issue:** The initial hidden state (`opacity: 0`, `translateY(16px)`) is applied via JavaScript in `useEffect`. On slow connections, before JS hydrates, the element renders fully visible — then snaps to invisible — then fades in. This is a FOUC in reverse: content flashes visible before disappearing. The comment acknowledges FOUC in the forward direction but the reverse flash is equally disruptive. More critically, if JS is disabled or blocked, the element stays hidden permanently because the reveal logic never runs.

**Fix:** Set the initial hidden state via CSS on the element, conditionally applied when the component mounts and motion is enabled. A reliable approach is a CSS class driven by a `data-` attribute set during render:

```tsx
// Apply initial state via a class rather than JS mutation
return (
  <div
    ref={ref}
    className={clsx(className, !reduced && 'fade-up-initial')}
    data-animate={!reduced ? 'pending' : undefined}
  >
    {children}
  </div>
)
```

```css
.fade-up-initial { opacity: 0; transform: translateY(16px); }
[data-animate="done"] { transition: opacity 400ms ease-out, transform 400ms ease-out; opacity: 1; transform: translateY(0); }
```

Alternatively, accept the current approach as a deliberate progressive enhancement tradeoff, but document it explicitly and ensure `noscript` fallback behaviour is acceptable.

---

### WR-03: `workEntries` key strategy is fragile and will break with real data

**File:** `src/components/cv/CV.tsx:22`

**Issue:** `key={`${entry.company}-${entry.dates}`}` uses a composite of company name and date range. With the placeholder data, every `company` value is `"Placeholder Company"`, producing keys `Placeholder Company-2023 — Present`, `Placeholder Company-2021 — 2023`, etc. React will accept these because the dates differ — but this is only accidentally unique. When real data is entered, two roles at the same employer with different date formats (e.g. both normalised to the same string, or a "Freelance" period) would produce duplicate keys, causing React to silently drop one entry from the DOM. The same pattern exists for `educationEntries` at line 34 using `institution + years`.

**Fix:** Add a stable `id` field to the `WorkEntry` and `EducationEntry` interfaces and use it as the key:

```ts
export interface WorkEntry {
  id: string  // e.g. 'acme-2023', unique slug
  role: string
  company: string
  dates: string
  description: string
}
```

```tsx
{workEntries.map((entry) => (
  <WorkEntry key={entry.id} entry={entry} />
))}
```

---

### WR-04: Contact section is not horizontally centred — `max-w-4xl` without `mx-auto`

**File:** `src/components/contact/Contact.tsx:6`, `src/components/cv/CV.tsx:11`

**Issue:** Both `CV` and `Contact` apply `max-w-4xl` to their outer `<section>` but omit `mx-auto`. `Hero` also does this at `src/components/hero/Hero.tsx:8`. Without `mx-auto`, `max-w-4xl` constrains the width but does not centre the block — the section hugs the left edge on wide viewports. Whether this is intentional (left-aligned editorial layout) or an oversight is ambiguous from the code alone, but it is inconsistent: the project brief states editorial intent and most editorial/CV sites centre their content column.

**Fix:** If centred layout is intended, add `mx-auto` to all three sections:

```tsx
className="py-[var(--space-section)] px-6 max-w-4xl mx-auto scroll-mt-16"
```

If intentionally left-aligned, document this as a deliberate design choice in a comment so future contributors do not "fix" it.

---

### WR-05: `scroll-mt-16` offset assumes exactly `h-16` header — any header height change silently breaks scroll-to-anchor

**File:** `src/components/cv/CV.tsx:11`, `src/components/contact/Contact.tsx:6`, `src/components/hero/Hero.tsx:8`

**Issue:** Three sections use `scroll-mt-16` (4rem) as the scroll margin to compensate for the sticky header. The header is defined with `h-16` in `Header.tsx:18`, which currently matches. This creates a silent coupling: changing the header height requires remembering to update three separate `scroll-mt-*` classes. There is no token tying them together.

**Fix:** Define a `--header-height` CSS custom property in `tokens.css` and use it in both places:

```css
/* tokens.css */
--header-height: 4rem; /* 64px, matches h-16 */
```

```tsx
// sections
className="... scroll-mt-[var(--header-height)]"

// header
style={{ height: 'var(--header-height)' }}
```

---

## Info

### IN-01: Placeholder content shipped in `src/data/cv.ts`

**File:** `src/data/cv.ts:18-51`

**Issue:** All four `workEntries` use `"Placeholder Role"`, `"Placeholder Company"`, and `"Placeholder description — Axel fills this in before launch."`. The single `educationEntry` also uses placeholders. These strings render verbatim on the live site. Unlike CR-01 (which is a functional bug with broken links), these are content gaps — but they will embarrass the site owner if deployed as-is. The Phase 2 intent was to ship real content.

**Fix:** Replace all placeholder entries with real CV content before deploying.

---

### IN-02: `'use client'` directive on `useReducedMotion` hook is non-standard

**File:** `src/hooks/useReducedMotion.ts:1`

**Issue:** The `'use client'` directive belongs on component files (`.tsx`), not on custom hook files. Hooks do not need the directive — they inherit the client/server boundary from the component that calls them. In Next.js App Router, adding `'use client'` to a hook file is technically harmless (the hook will run on the client) but it is misleading: the directive implies this file is a component boundary, which it is not. It will confuse future maintainers and may surprise linters.

**Fix:** Remove `'use client'` from `useReducedMotion.ts`. The hook is already only usable in client components (it calls `window.matchMedia`); that constraint is enforced by the runtime, not by the directive.

---

### IN-03: Link class string is duplicated verbatim across Hero and Contact

**File:** `src/components/hero/Hero.tsx:27-28`, `src/components/contact/Contact.tsx:20-21`

**Issue:** The Tailwind class string for styled anchor links:

```
text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2
decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)]
focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2
```

appears identically four times in `Hero.tsx` and four times in `Contact.tsx` — eight total copies. Any styling change (e.g., adding a `transition` duration) must be applied to all eight independently.

**Fix:** Extract to a shared component or a `clsx`/`twMerge` helper constant:

```tsx
// src/components/ui/ExternalLink.tsx
import { twMerge } from 'tailwind-merge'

const linkClass =
  'text-[length:var(--text-ui)] text-[var(--color-text)] underline underline-offset-2 ' +
  'decoration-[var(--color-muted)] hover:decoration-[var(--color-accent)] hover:text-[var(--color-accent)] ' +
  'focus:outline-2 focus:outline-[var(--color-accent)] focus:outline-offset-2 py-2'

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
}

export function ExternalLink({ className, children, ...props }: ExternalLinkProps) {
  return (
    <a className={twMerge(linkClass, className)} {...props}>
      {children}
    </a>
  )
}
```

---

_Reviewed: 2026-05-21T18:50:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
