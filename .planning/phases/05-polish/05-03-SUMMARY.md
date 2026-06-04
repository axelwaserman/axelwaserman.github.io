---
phase: 05-polish
plan: 03
subsystem: ui
tags: [favicon, ImageResponse, next-og, satori, instrument-serif, static-export]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Tailwind v4 @theme tokens (--color-surface, --color-text), Instrument Serif via next/font
  - phase: 05-polish (UI-SPEC)
    provides: Favicon Visual Contract (32x32, AW, parchment surface, warm-black text)
provides:
  - Build-time-generated 32x32 PNG favicon emitted by Next.js app/icon.tsx convention
  - Self-hosted Instrument Serif 400 TTF binary committed at src/app/instrument-serif-400.ttf
  - <link rel="icon"> automatically injected into every generated HTML page
affects: [05-08, deploy verification, Phase 5 SC-1]

# Tech tracking
tech-stack:
  added:
    - next/og ImageResponse (built-in, no new dependency)
    - Instrument Serif 400 TTF binary (SIL OFL 1.1) bundled in repo
  patterns:
    - Path B (deterministic offline-safe build): commit font binary, load via readFile
    - Inline color literals in ImageResponse with sRGB (Satori does not yet parse oklch)
    - export const dynamic = 'force-static' on icon route for output:'export' compatibility

key-files:
  created:
    - src/app/icon.tsx
    - src/app/instrument-serif-400.ttf
  modified: []

key-decisions:
  - "Path B chosen over Path A: ship the Instrument Serif TTF in-repo and load via readFile for deterministic builds — no fonts.gstatic.com network call at build time."
  - "Added export const dynamic = 'force-static' to src/app/icon.tsx — required under next.config 'output: export'; without it the build fails with a force-static configuration error."
  - "OKLCH→sRGB conversion: Satori (the renderer behind ImageResponse) does not yet parse oklch() colors, so the inline style passes precomputed sRGB equivalents (rgb(249,244,238) and rgb(20,17,13)) while the oklch source-of-truth literals remain in the file as named constants for D-20 traceability."

patterns-established:
  - "Path B for ImageResponse fonts: commit the TTF inside src/app and load via readFile from process.cwd() — keeps build deterministic and offline-safe."
  - "When Satori cannot parse a CSS color function, document the oklch source as a named constant and pass the precomputed sRGB equivalent to the rendered style."

requirements-completed: []

# Metrics
duration: ~10 min
completed: 2026-06-04
---

# Phase 05 Plan 03: Typographic AW Favicon Summary

**Static-export AW favicon via Next.js `app/icon.tsx` ImageResponse, with the Instrument Serif 400 TTF committed in-repo for deterministic offline builds.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-04T15:39:00Z
- **Completed:** 2026-06-04T15:49:30Z
- **Tasks:** 2
- **Files modified:** 2 (both newly created)

## Accomplishments

- `next build` now emits an `out/icon` PNG asset (32x32, 8-bit RGBA, 878 bytes) at the static export root.
- All generated HTML pages (`out/index.html`, `out/404.html`, `out/_not-found.html`) now contain `<link rel="icon" href="/icon?…" type="image/png" sizes="32x32"/>` injected automatically by Next.js.
- Build is fully offline-safe: no fonts.gstatic.com or fonts.googleapis.com requests during `next build`. The Instrument Serif 400 TTF (62 284 bytes, SIL OFL 1.1) is committed at `src/app/instrument-serif-400.ttf` and loaded via `readFile`.
- D-18 (AW monogram), D-19 (single source of truth, no `public/favicon.ico`), and D-20 (oklch source tokens documented) are all implemented.
- Phase 5 Success Criterion #1 is now verifiable from build output (final visual confirmation reserved for Plan 05-08 at deploy time).

## Task Commits

Each task was committed atomically:

1. **Task 1: Commit Instrument Serif 400 TTF binary** - `c90ba2d` (chore)
2. **Task 2: Create src/app/icon.tsx with Instrument Serif "AW" ImageResponse** - `764f6d3` (feat)

## Files Created/Modified

- `src/app/instrument-serif-400.ttf` — Instrument Serif 400 TTF binary (62 284 bytes), sourced from `https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-2zI.ttf` via the Google Fonts CSS resolver. Licensed under SIL OFL 1.1; redistribution permitted without copyleft restriction on the consuming project.
- `src/app/icon.tsx` — Next.js `app/icon` convention generator. Exports `size`, `contentType`, `dynamic = 'force-static'`, and a default async `Icon()` that returns an `ImageResponse` rendering a centred "AW" in Instrument Serif 400 on the parchment surface, 22 px font size, -0.02em letter-spacing.

## Decisions Made

- **Path B selected (per 2026-06-04 plan revision):** TTF binary committed in-repo and loaded via `readFile`. Build produces the same favicon every time without any network access. Cost: one ~60 kb binary in the source tree. Benefit: deterministic CI builds and zero dependency on Google Fonts uptime.
- **OKLCH source-of-truth retained alongside sRGB runtime values:** `SURFACE_OKLCH` and `TEXT_OKLCH` constants document the canonical `--color-surface` / `--color-text` token values from `src/styles/tokens.css`; `SURFACE_SRGB` and `TEXT_SRGB` constants supply the precomputed sRGB equivalents that Satori actually consumes. This satisfies D-20 traceability (oklch literal in source) while staying compatible with the renderer.
- **`export const dynamic = 'force-static'` added to icon.tsx** — required under `output: 'export'` for the `/icon` route, otherwise Next 16 errors at build time.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `export const dynamic = 'force-static'` to `src/app/icon.tsx`**
- **Found during:** Task 2 (first `npm run build` attempt)
- **Issue:** Build failed with `export const dynamic = "force-static"/export const revalidate not configured on route "/icon" with "output: export"` — Next.js 16's static export pipeline treats `app/icon.tsx` as a dynamic route by default and requires explicit static configuration.
- **Fix:** Added `export const dynamic = 'force-static'` alongside the existing `size` and `contentType` named exports.
- **Files modified:** `src/app/icon.tsx`
- **Verification:** Subsequent `npm run build` exited 0; `/icon` listed as `○ (Static)` in the route table.
- **Committed in:** `764f6d3` (Task 2 commit)

**2. [Rule 3 - Blocking] OKLCH → sRGB conversion for ImageResponse style values**
- **Found during:** Task 2 (second `npm run build` attempt)
- **Issue:** Build failed at static-page generation with `Unexpected token type: function in CSS rule background: oklch(97% 0.01 75)`. The Satori renderer behind `ImageResponse` does not yet parse `oklch()` color functions.
- **Fix:** Converted both oklch values to their sRGB equivalents using the standard OKLab → linear RGB → sRGB pipeline (`oklch(97% 0.01 75)` → `rgb(249, 244, 238)`, `oklch(18% 0.01 75)` → `rgb(20, 17, 13)`). Kept the original oklch literals as `SURFACE_OKLCH` / `TEXT_OKLCH` named constants and added a comment block linking back to `src/styles/tokens.css`, satisfying D-20 traceability ("inline oklch literal") while feeding Satori a value it can render.
- **Files modified:** `src/app/icon.tsx`
- **Verification:** `npm run build` exited 0; `out/icon` confirmed as a 32×32 8-bit RGBA PNG; HTML pages contain the auto-injected `<link rel="icon">` tag.
- **Committed in:** `764f6d3` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 — blocking issues directly caused by the new icon route).
**Impact on plan:** Both fixes are required for the plan's `<verification>` step (`npm run build` must exit 0). No scope creep — the plan's intent (D-20 traceability + emit a real icon asset) is preserved end-to-end.

## Issues Encountered

- **Satori `oklch()` support gap:** documented above as a deviation; no upstream fix available in Next.js 16.2.6's bundled `next/og`. The conversion path is the canonical workaround until Satori adopts CSS Color Level 4 functions.

## License / Attribution Note

Instrument Serif is licensed under the SIL Open Font License 1.1, which permits redistribution and bundling without imposing copyleft on the consuming project. No `OFL.txt` is required in the repo per the SIL FAQ (the license travels with the font itself when distributed). If/when the project ships a `THIRD-PARTY-LICENSES.md` or equivalent, adding an Instrument Serif entry would be a courtesy — but not a strict OFL 1.1 requirement.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 05-08 (deploy verification) can now confirm the live `axelwaserman.github.io` tab icon visually. Build-side proof is already in place: `out/icon` exists and `out/index.html` references it.
- Other Phase 5 plans (UI polish, copy, OG image, etc.) can run in parallel — they do not touch `src/app/icon.tsx` or the TTF binary.

## Self-Check

Verifying claims before returning:

- `src/app/icon.tsx` exists: FOUND
- `src/app/instrument-serif-400.ttf` exists (62284 bytes): FOUND
- Commit `c90ba2d` (Task 1): FOUND
- Commit `764f6d3` (Task 2): FOUND
- `out/icon` (32x32 PNG, 878 bytes) emitted by build: FOUND
- `<link rel="icon">` present in `out/index.html`, `out/404.html`, `out/_not-found.html`: FOUND (3/3)
- `public/favicon.ico` absent: CONFIRMED ABSENT

## Self-Check: PASSED

---
*Phase: 05-polish*
*Completed: 2026-06-04*
