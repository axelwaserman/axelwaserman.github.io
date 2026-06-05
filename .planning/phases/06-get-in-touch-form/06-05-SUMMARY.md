---
phase: 06-get-in-touch-form
plan: 05
subsystem: hero-cta
tags: [hero, cta, anchor, form-first, d-19]
requires:
  - '06-03 Contact section with id="contact" preserved (post-Wave 2)'
provides:
  - 'Hero CTA cluster aligned with form-first direction (D-19)'
  - 'Same-page #contact anchor pointing to Contact form'
affects:
  - 'src/components/hero/Hero.tsx'
tech-stack:
  added: []
  patterns:
    - 'Same-page anchor pattern (Phase 2 D-22) reused: href="#contact" + scroll-mt-16 on target'
key-files:
  created: []
  modified:
    - 'src/components/hero/Hero.tsx (Email anchor → #contact "Get in touch")'
decisions:
  - 'Followed D-19 verbatim: anchor text is "Get in touch", same-page href, no JS scroll handler'
metrics:
  duration: '~2 minutes'
  completed: '2026-06-05T15:06:14Z'
  tasks_completed: 1
  files_modified: 1
  commits: 1
---

# Phase 06 Plan 05: Hero CTA Swap Summary

Replace the Hero `mailto:` anchor with a same-page `<a href="#contact">Get in touch</a>` so the Hero CTA cluster matches the form-first direction (D-19) introduced in plan 06-03.

## What Was Built

A single, surgical edit to `src/components/hero/Hero.tsx`:

- The third CTA anchor previously pointed to `mailto:axel.waserman@gmail.com` with text "Email".
- It now points to `#contact` with text "Get in touch" — matching D-19 wording verbatim.
- The shared anchor `className` is preserved so the four CTAs remain visually consistent.
- `target="_blank"` / `rel="noopener noreferrer"` are NOT added (same-page link).
- No JS scroll handler is introduced — the existing `scroll-mt-16` on the `#contact` section handles the sticky-header offset (Phase 2 D-22 pattern).

Final CTA cluster order (left-to-right, matches D-19): **GitHub → LinkedIn → Get in touch → Download CV**.

## Tasks Completed

| Task | Name                                                | Commit    | Files                            |
| ---- | --------------------------------------------------- | --------- | -------------------------------- |
| 1    | Swap Hero Email anchor for #contact same-page link  | `c882f33` | `src/components/hero/Hero.tsx`   |

## Verification

All automated checks passed:

- `npm run build` — exit 0; static export produced `out/index.html`.
- HTML assertions (run via inline node script against `out/index.html`):
  - `mailto:axel.waserman@gmail.com` not present anywhere in built HTML (Hero + Contact both clean).
  - `href="#contact"` followed by "Get in touch" matches.
  - GitHub anchor (`https://github.com/axelwaserman`) preserved.
  - LinkedIn anchor (`https://www.linkedin.com/in/axel-waserman-9753221a6/`) preserved.
  - Download CV anchor (`/cv.pdf`) preserved.
- `npm run lint` — exit 0 (max-warnings 0).
- `npx tsc --noEmit` — exit 0.

Acceptance grep checks against `src/components/hero/Hero.tsx`:

- `grep -nE 'href="mailto:'` → no matches.
- `grep -nE 'href="#contact"'` → match at line 43.
- "Get in touch" text → match at line 46.
- GitHub / LinkedIn / `/cv.pdf` anchors each present (count = 1).
- Order in source: GitHub (32) → LinkedIn (40) → Get in touch (46) → Download CV (53).

## Deviations from Plan

None — plan executed exactly as written. Single task, single edit, all acceptance criteria satisfied on the first attempt.

## Known Stubs

None.

## Threat Flags

None — same-page anchor only; no new network surface, no input handling, no auth surface introduced.

## Requirements Closed (Hero half)

- **SC-3 (Hero half):** mailto anchor in Hero replaced with `#contact`. Combined with plan 06-03 (which removed the Contact section's mailto), the Hero half of SC-3 is complete. The Header half — if any further sweep is needed — is out of this plan's scope.

## Self-Check: PASSED

- `src/components/hero/Hero.tsx`: FOUND (modified, lines 42-47 now hold the `#contact` anchor).
- `.planning/phases/06-get-in-touch-form/06-05-SUMMARY.md`: FOUND.
- Commit `c882f33`: FOUND in `git log`.
- `out/index.html` contains the Hero `href="#contact" class="..."` anchor closing with text `Get in touch` (verified via `grep -oE '#contact"[^>]*>[^<]{0,40}'`).
- `out/index.html` contains zero `mailto:axel.waserman@gmail.com` occurrences.
