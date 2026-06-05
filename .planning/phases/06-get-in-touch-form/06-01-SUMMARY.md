---
phase: 06-get-in-touch-form
plan: 01
subsystem: contact-form-foundation
tags: [deps, lockfile, site-data, formspree]
requires: []
provides:
  - "react-hook-form, zod, @hookform/resolvers in package.json dependencies"
  - "package-lock.json regenerated cleanly (npm ci passes)"
  - "src/data/site.ts exporting FORMSPREE_ENDPOINT: string"
affects:
  - package.json
  - package-lock.json
  - src/data/site.ts
tech-stack:
  added:
    - react-hook-form@^7.77.0
    - zod@^4.4.3
    - "@hookform/resolvers@^5.4.0"
  patterns:
    - named-export-only data modules (mirrors src/data/cv.ts)
key-files:
  created:
    - src/data/site.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - "Lockfile regenerated from scratch (rm package-lock.json && rm -rf node_modules && npm install) per memory feedback_npm_ci_lock_sync.md"
  - "Endpoint stored as a single named string constant (D-01); no env vars, no JSON wrapper"
  - "PLACEHOLDER_FORM_ID intentionally committed; replacement scheduled for plan 06-06 user-action checkpoint (D-04)"
metrics:
  duration: ~3 min
  completed: 2026-06-05
requirements: [SC-1]
---

# Phase 06 Plan 01: Foundation — Form Deps + site.ts Summary

Foundation slice: install react-hook-form/zod/@hookform/resolvers, regenerate the lockfile cleanly, and create `src/data/site.ts` with a typed `FORMSPREE_ENDPOINT` constant so subsequent plans can wire `ContactForm` against a single source of truth.

## What Was Built

- **Dependency additions (D-07):** `react-hook-form@^7.77.0`, `zod@^4.4.3`, and `@hookform/resolvers@^5.4.0` added under `dependencies` (they ship to the client bundle, so `devDependencies` would be wrong). Versions resolved to current latest stable at install time, fully compatible with React 19.2.x / Next 16.2.6.
- **Lockfile regeneration:** `package-lock.json` deleted and rebuilt with a single `npm install` against the updated `package.json` — guards the `EUSAGE` failure mode flagged in memory `feedback_npm_ci_lock_sync.md`. Verified with a clean `npm ci` against the new lockfile.
- **`src/data/site.ts` (new):** Single named export `FORMSPREE_ENDPOINT: string` set to `https://formspree.io/f/PLACEHOLDER_FORM_ID`. Inline comment flags the placeholder for the plan 06-06 user-action checkpoint (D-04). File mirrors the named-export-only convention of `src/data/cv.ts` — no default export, no runtime logic.

## Tasks

| Task | Name                                          | Commit  |
| ---- | --------------------------------------------- | ------- |
| 1    | Add form deps + regenerate package-lock       | 4b4353e |
| 2    | Create src/data/site.ts with FORMSPREE_ENDPOINT | 071de80 |

## Verification

- `npm ci` — clean install from regenerated lockfile, exits 0 (no EUSAGE / ELOCKVERIFY)
- `npm run lint` — `eslint . --max-warnings 0`, passes
- `npx tsc --noEmit` — passes
- `npm run build` — `next build` succeeds, all 4 static pages generated
- Lockfile contains all three deps at expected resolved versions (verified via `node -e ...packages['node_modules/<pkg>']`)
- `src/data/site.ts` matches `export const FORMSPREE_ENDPOINT\s*:\s*string\s*=` and contains a `PLACEHOLDER` comment marker

## Acceptance Criteria

| Criterion (from plan)                                                | Status |
| -------------------------------------------------------------------- | ------ |
| react-hook-form / zod / @hookform/resolvers under `dependencies`     | Met    |
| `package-lock.json` lists all three deps                             | Met    |
| `npm ci` succeeds clean                                              | Met    |
| `next build` exits 0                                                 | Met    |
| `src/data/site.ts` exports `FORMSPREE_ENDPOINT: string`              | Met    |
| Placeholder marker present                                           | Met    |
| `npx tsc --noEmit` exits 0                                           | Met    |
| File has no default export, no extraneous imports                    | Met    |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

- `FORMSPREE_ENDPOINT` is intentionally `https://formspree.io/f/PLACEHOLDER_FORM_ID`. This is a planned stub: the real form ID is provisioned by Axel and pasted in via plan 06-06's user-action checkpoint (D-04). The phase plan explicitly tracks this as the user-action gate for SC-1 verification. Do not treat as a bug.

## Self-Check

- File exists: `src/data/site.ts` — FOUND
- File exists: `package.json` (modified) — FOUND
- File exists: `package-lock.json` (regenerated) — FOUND
- Commit `4b4353e` — FOUND
- Commit `071de80` — FOUND

## Self-Check: PASSED
