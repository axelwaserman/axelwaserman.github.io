# Phase 2: Content - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 2-Content
**Areas discussed:** Hero composition, CV content & data, Navigation, Animation & spacing tokens

---

## Hero composition

### Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Left-aligned editorial | Name, title, bio flush left — asymmetric, editorial feel | ✓ |
| Fully centered | Everything centered on a vertical axis | |
| Two-column split | Text left, visual element right | |

**User's choice:** Left-aligned editorial

### Photo

| Option | Description | Selected |
|--------|-------------|----------|
| No photo — text only | Keeps it typographic and editorial | ✓ |
| Small circular avatar | Constrained headshot | |
| Larger portrait, styled | Artistic treatment (grayscale, clipped shape) | |

**User's choice:** No photo

### Name scale

| Option | Description | Selected |
|--------|-------------|----------|
| Display / statement size | Name uses --text-hero (~5–7rem), Instrument Serif | ✓ |
| Restrained heading size | Name uses --text-heading (~2rem) | |

**User's choice:** Display scale

### Hero height

| Option | Description | Selected |
|--------|-------------|----------|
| Full viewport height | Hero fills 100vh | ✓ |
| Tall section, not full height | Content below partially visible | |

**User's choice:** Full viewport height (min-h-screen)

---

## CV content & data

### Data location

| Option | Description | Selected |
|--------|-------------|----------|
| Typed data file (src/data/cv.ts) | Exported typed arrays, decoupled from layout | ✓ |
| Inline JSX | Content directly in component files | |

**User's choice:** Typed data file

### Work history volume

| Option | Description | Selected |
|--------|-------------|----------|
| 1–2 jobs | Early career | |
| 3–5 jobs | Mid-career range | ✓ |
| 6+ jobs | Extensive history | |

**User's choice:** 3–5 jobs

### CV layout

| Option | Description | Selected |
|--------|-------------|----------|
| Two-column: label left, content right | Section label anchors left (~20%), entries fill right | ✓ |
| Single-column full-width | Standard blog-style flow | |

**User's choice:** Two-column

### Bio

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder for now | Planner uses placeholder; Axel edits before going live | ✓ |
| Type it now | Capture exact bio text | |

**User's choice:** Placeholder

---

## Navigation

### Header content

| Option | Description | Selected |
|--------|-------------|----------|
| Name left + section links right | "Axel W" anchor + About/CV/Projects/Contact | ✓ |
| Section links only, centered | No name/logo | |
| Name only, no nav links | Minimal — no anchor links | |

**User's choice:** Name on left + section links on right

### Mobile nav

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger menu | Three-line icon opens drawer | |
| All links visible, smaller text | Links stay in header at smaller size | |
| Links hidden, name only | Mobile shows name only; natural scroll navigation | ✓ |

**User's choice:** Links hidden, name only (< 640px)

### Header style

| Option | Description | Selected |
|--------|-------------|----------|
| Solid surface background | Always has --color-surface background | |
| Transparent, gains background on scroll | Starts transparent; backdrop appears after scrolling past hero | ✓ |
| Subtle border-bottom only | No background change | |

**User's choice:** Transparent, gains background on scroll

---

## Animation & spacing tokens

### Spacing tokens

| Option | Description | Selected |
|--------|-------------|----------|
| Token only section-level gaps | --space-section + --radius-card; Tailwind for component spacing | ✓ |
| Full spacing scale | Complete custom --space-1 through --space-16 scale | |

**User's choice:** Section-level tokens only

### Scroll-reveal animations

| Option | Description | Selected |
|--------|-------------|----------|
| Very subtle — fade up 16px, 0.4s | Small travel, short duration, reduced-motion safe | ✓ |
| More dramatic — fade up 40px, 0.7s | Larger travel, longer duration | |
| No animations | Content appears instantly | |

**User's choice:** Very subtle (16px, 400ms, ease-out)

---

## Claude's Discretion

- Exact `clamp()` value for `--space-section`
- `--radius-card` value
- Skills section layout within right column (flat tag list vs grouped)
- Exact scroll threshold for header background trigger
- Component file structure within `src/components/`

## Deferred Ideas

None — discussion stayed within phase scope.
