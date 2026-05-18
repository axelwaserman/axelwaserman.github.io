---
phase: 1
slug: foundation
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-18
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the foundation phase. Locks the design token system and visual identity — no interactive components yet. All subsequent phases build on these decisions.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none (Phase 1 establishes tokens only) |
| Icon library | none (deferred to Phase 2) |
| Font | Sora (body/UI) + Instrument Serif (headings) |

---

## Spacing Scale

> Spacing tokens are **deferred to Phase 2** per D-10. Phase 1 establishes color + type scale only.

Exceptions: all spacing tokens deferred — added to `tokens.css` in Phase 2 alongside Phase 1 color/type tokens (D-11).

---

## Typography

Fonts loaded via `next/font/google` — self-hosted at build time, zero runtime Google Fonts requests (D-02).

**Families:**
- `--font-body`: Sora — UI text, body copy, labels, nav (D-04)
- `--font-heading`: Instrument Serif — headings only (D-04)

**Weights loaded:** 400, 500, 600, 700 for both families (D-03)

**Font display:** `swap` (required by performance rules)

**Type scale — 4 semantic tokens, all using `clamp()` for fluid responsive scaling (D-05):**

> Intermediate sizes (labels, secondary body, sub-headings) are derived in-use with `em` or Tailwind's built-in scale relative to these 4 tokens — not declared as additional custom properties.

| Token | Role | Clamp Value | Weight |
|-------|------|-------------|--------|
| `--text-ui` | Labels, nav, captions, secondary body | `clamp(0.875rem, 0.82rem + 0.28vw, 1rem)` | 400–500 |
| `--text-body` | Body copy, lead text | `clamp(1rem, 0.92rem + 0.4vw, 1.125rem)` | 400 |
| `--text-heading` | Section headings (Instrument Serif), page-level headings | `clamp(1.75rem, 1.4rem + 1.75vw, 2.5rem)` | 400–600 |
| `--text-hero` | Hero display (Instrument Serif) | `clamp(3rem, 1.5rem + 7.5vw, 7rem)` | 400 |

**Line heights:**
- Body / UI: `1.6`
- Headings / display: `1.15`

**Letter spacing:**
- Display headings: `-0.02em`
- Body: `0`

---

## Color

Direction: **warm ink / parchment** — editorial, not a stock template (D-06).

Format: **oklch() throughout** — perceptually uniform (D-08).

| Token | oklch Value | Hex Approx | Role |
|-------|-------------|------------|------|
| `--color-surface` | `oklch(97% 0.01 75)` | `#f9f6f0` | Page background (D-09) |
| `--color-text` | `oklch(18% 0.01 75)` | `#1e1a16` | Body text, headings |
| `--color-accent` | `oklch(62% 0.19 55)` | `#c4651a` | CTAs, links, highlights |
| `--color-muted` | `oklch(55% 0.03 75)` | `#7a7068` | Secondary text, captions |

Accent chroma: `0.19` — within the locked medium-vibrancy range (oklch chroma 0.18–0.22, D-07).

Accent reserved for: CTA buttons, text links, active nav indicators, focus rings. Never used decoratively on surfaces or for informational icons.

**Tailwind v4 `@theme` registration (D-12):**
```css
@theme {
  --color-surface: oklch(97% 0.01 75);
  --color-text: oklch(18% 0.01 75);
  --color-accent: oklch(62% 0.19 55);
  --color-muted: oklch(55% 0.03 75);
}
```
This makes `bg-surface`, `text-text`, `bg-accent`, `text-accent`, `text-muted` etc. available as Tailwind utilities alongside `var(--color-*)` CSS custom properties.

---

## Copywriting Contract

> Phase 1 has no visible copy (HTML shell only). Copy contracts are deferred to Phase 2 (Content phase). The shell will use HTML comments as section stubs per D-14:
> `{/* Hero */}`, `{/* CV */}`, `{/* Projects */}`, `{/* Contact */}`

| Element | Copy |
|---------|------|
| `<title>` | `Axel W — Software Engineer` |
| `<meta name="description">` | Placeholder — to be filled in Phase 2 with real bio copy |
| Section stubs | JSX comments only, no visible text |

---

## Registry Safety

No third-party component registry used in Phase 1.

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | n/a | n/a |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: FLAG (60/30/10 ratio — non-blocking; declare in Phase 2 when layout is visible)
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-05-18

---

*Source: decisions D-01–D-16 from 01-CONTEXT.md (discuss-phase session 2026-05-18)*
