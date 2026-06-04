---
phase: 05-polish
plan: 02
subsystem: ui
tags: [cv, typst, just, content, data-layer, nextjs]

# Dependency graph
requires:
  - phase: 02-content
    provides: src/data/cv.ts placeholder structure + WorkEntry/EducationEntry interfaces and CV component scaffolding
  - phase: 04-deploy
    provides: deployable static-export build pipeline that this plan must keep green
provides:
  - Real CV data in src/data/cv.ts mirrored verbatim from assets/CV.typ (bio, title, work entries with bullets, education, three skill groups, contact)
  - Resolved contact.email = 'axel.waserman@gmail.com' (D-17) — non-nullable string, no sentinel
  - Extended interfaces — WorkEntry.bullets: string[], new SkillGroup, new Contact
  - skillGroups: SkillGroup[] export (replaces skills: string[]; no deprecated stub — Strategy A)
  - CV.tsx switched to skillGroups so Wave 1 ends with `npm run build` green
  - Repo-root justfile with `cv` recipe (typst compile assets/CV.typ public/cv.pdf)
  - Committed public/cv.pdf binary artifact (D-11)
  - Committed assets/CV.typ source (was previously untracked; email link added inline)
affects:
  - 05-05 (CV final styling: SkillGroupList, DownloadCVButton, WorkEntry bullets — depends on this data shape)
  - 05-06 (footer/contact rendering — uses contact export)
  - 05-08 (final phase verification)

# Tech tracking
tech-stack:
  added:
    - just (task runner; brew install just)
    - typst (CV compiler; brew install typst) — local-only; CI never runs Typst
  patterns:
    - "PDF artifact committed to repo (no CI build dependency on Typst)"
    - "Single source of truth: assets/CV.typ feeds both src/data/cv.ts content (manually mirrored) and public/cv.pdf (compiled)"
    - "skillGroups data shape: array of { category, items[] } per UI-SPEC §Skill groups"

key-files:
  created:
    - justfile
    - public/cv.pdf
    - assets/CV.typ (committed; was untracked)
  modified:
    - src/data/cv.ts
    - src/components/cv/CV.tsx

key-decisions:
  - "Strategy A executed: skills: string[] export removed entirely, no deprecated stub left behind. CV.tsx switches to skillGroups inside Plan 05-02 so Wave 1 ends green without a bridge."
  - "Bio trimmed from planner-locked draft (221 chars) to 216 chars by removing 'team' from 'distributed team operations' → 'distributed operations'. Planner draft exceeded the 220-char max it specified; trim preserves meaning and the spaced em-dash."
  - "CV.tsx skill rendering uses inline div+p (plan shape (b)) rather than reusing the existing SkillsList component (plan shape (a)). Reason: SkillsList's prop is named 'skills' (array of strings), so shape (a) as written would fail to compile without modifying SkillsList — but the plan explicitly says 'DO NOT delete SkillsList.tsx' and Plan 05-05 owns that file. Shape (b) is the smallest diff that compiles and leaves SkillsList.tsx fully untouched."
  - "Email link added to assets/CV.typ contact header as a single additive `mailto:axel.waserman@gmail.com` link. The plan's verification required `axel.waserman@gmail.com` to appear in CV.typ but it wasn't there. Additive single-line edit only — no wording or structural change to the document."

patterns-established:
  - "WorkEntry bullets contract: bullets is `string[]` always (never optional); bullets stored verbatim INCLUDING the leading 'Bold-Prefix:' marker so the render layer (Plan 05-05) can split on the first colon for typographic emphasis."
  - "skillGroups shape: each group is { category, items: string[] }; items are stored as individual array elements (not pre-joined strings) so renderers can choose comma-join, list, or pill styling."
  - "Em-dash convention: dates use U+2014 EN DASH (—), matching existing cv.ts and CV.typ source."

requirements-completed: []

# Metrics
duration: ~30min
completed: 2026-06-04
---

# Phase 05 Plan 02: CV Data Mirror + Typst PDF Pipeline Summary

**Real CV data lifted out of assets/CV.typ into src/data/cv.ts (bio, title, work history with bullets, education, three skill groups, contact email), `just cv` recipe wired up, and public/cv.pdf compiled and committed — Wave 1 ends with `npm run build` green and the rendered page surfacing real skill data.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-06-04T15:21Z (approximate)
- **Completed:** 2026-06-04T15:52Z
- **Tasks:** 3 of 4 (Task 4 is a checkpoint:human-verify and is awaiting Axel's review)
- **Files modified/created:** 5 (cv.ts, CV.tsx, justfile, assets/CV.typ, public/cv.pdf)

## Accomplishments

- Replaced all placeholder data in `src/data/cv.ts` with verbatim content from `assets/CV.typ`: bio, title (`Senior Engineering Manager | Backend & Data`), 6 work entries with bullets, 2 education entries, three skill groups, and a real contact (D-17 resolved with `axel.waserman@gmail.com`).
- Extended the data layer with three new interfaces (`SkillGroup`, `Contact`) and a new `bullets: string[]` field on `WorkEntry` (D-13). The legacy `skills: string[]` export is gone — no deprecated bridge, per Strategy A from the 2026-06-04 plan revision.
- Switched `src/components/cv/CV.tsx` to consume `skillGroups`, keeping Wave 1's `npm run build` green even though Plan 05-05's centering / DownloadCVButton / styled SkillGroupList / WorkEntry bullets layer hasn't run yet. SkillsList.tsx is preserved untouched for Plan 05-05 to delete.
- Stood up a repo-root `justfile` with a `cv` recipe (`typst compile assets/CV.typ public/cv.pdf`) and committed the resulting PDF (48 KB, 2 pages, contains real CV content with the email visible). D-11 honored: CI never runs Typst.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend cv.ts interfaces + replace placeholders with CV.typ content** — `37e6bd3` (feat)
2. **Task 2: Switch CV.tsx imports from skills to skillGroups** — `efa9406` (feat)
3. **Task 3: Add justfile + compile public/cv.pdf** — `74928c9` (feat)

**Task 4** is a `checkpoint:human-verify` gate — Axel reviews bio + title + CV mirror before commit. Returned to orchestrator.

## Files Created/Modified

- `src/data/cv.ts` — Rewritten: extended interfaces (WorkEntry.bullets, SkillGroup, Contact), real bio/title/work/education/skillGroups/contact data, no placeholders.
- `src/components/cv/CV.tsx` — Switched import from `skills` to `skillGroups`; renders three groups inline (category heading + comma-joined items) using shape (b) from the plan; SkillsList import dropped (now unused; component file preserved).
- `justfile` — New repo-root file (6 lines): `default` recipe (`just --list`) + `cv` recipe (`typst compile`).
- `assets/CV.typ` — Committed (was untracked); single additive edit to the contact header inserting `mailto:axel.waserman@gmail.com` link before the existing Website / LinkedIn / Github links.
- `public/cv.pdf` — Compiled binary artifact (48 KB, PDF 1.7, 2 pages).

## Decisions Made

- **Strategy A (no deprecated stub):** Removed `skills: string[]` entirely from `cv.ts` and switched `CV.tsx` in this plan instead of leaving a `// @deprecated` bridge for Plan 05-05 to clean up. Aligns with the 2026-06-04 plan revision.
- **CV.tsx render shape (b) over (a):** Used inline `<div><h4>{category}</h4><p>{items.join(', ')}</p></div>` rather than reusing `<SkillsList items={group.items} />`. Reason: existing SkillsList prop is named `skills`, not `items` — shape (a) as written wouldn't compile without modifying SkillsList, and the plan explicitly forbids deleting/modifying SkillsList here. Shape (b) is the smallest diff that compiles AND leaves SkillsList untouched for Plan 05-05.
- **Bio trim (216 chars):** Planner-locked recommended draft was 221 chars — exceeded the planner's own 220-char max. Removed the word `team` from `distributed team operations`, dropping length to 216. Spacing/punctuation preserved; semantics unchanged.
- **Email link added inline to CV.typ:** Plan verification required the email to appear in `assets/CV.typ`, but the source file did not contain it. Added a single `#link("mailto:axel.waserman@gmail.com")[axel.waserman\@gmail.com]` to the existing contact links list — additive only, no structural change to the doc.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Bio length exceeded planner-stated 220-char max**
- **Found during:** Task 1 (cv.ts rewrite)
- **Issue:** The plan's locked recommended bio draft was 221 characters, but the same plan stipulated "Max 220 chars; verify with `string.length`."
- **Fix:** Removed `team` from `distributed team operations` → `distributed operations`. Final length 216 chars; meaning preserved; spaced em-dash retained.
- **Files modified:** src/data/cv.ts
- **Verification:** `node -e "console.log(text.length)"` returned 216.
- **Committed in:** 37e6bd3 (Task 1 commit)

**2. [Rule 3 - Blocking] assets/CV.typ was untracked AND missing the required email**
- **Found during:** Task 3 (justfile + PDF compile)
- **Issue:** Two related blockers:
  (a) `assets/CV.typ` was untracked in git (existed in the main checkout from prior phase context work but never committed). The worktree didn't contain it. Task 3's `just cv` recipe needs it as input.
  (b) The plan's verification line `grep -c "axel.waserman@gmail.com" assets/CV.typ >= 1` requires the email to be in CV.typ, but the file did not contain it (the contact header only had Website/LinkedIn/Github links).
- **Fix:**
  (a) Copied `assets/CV.typ` from the main checkout into the worktree, then committed it as part of Task 3's commit.
  (b) Added a single additive line to the contact header: `#link("mailto:axel.waserman@gmail.com")[axel.waserman\@gmail.com] | ` prepended to the existing Website/LinkedIn/Github link list.
- **Files modified:** assets/CV.typ
- **Verification:** `grep -c "axel.waserman@gmail.com" assets/CV.typ` returned 1; `pdftotext public/cv.pdf` shows the email rendered in the PDF header.
- **Committed in:** 74928c9 (Task 3 commit)

**3. [Rule 3 - Blocking] Unused SkillsList import in CV.tsx**
- **Found during:** Task 2 (CV.tsx switch)
- **Issue:** Plan shape (b) renders skill groups inline without using `<SkillsList />`, but the original `import SkillsList from './SkillsList'` line would remain. Next.js's lint pass typically warns on unused imports and could fail `npm run build` under stricter configs.
- **Fix:** Dropped the unused `import SkillsList from './SkillsList'` line. The SkillsList.tsx file itself is untouched and still in place for Plan 05-05 to delete (per the plan's explicit guard).
- **Files modified:** src/components/cv/CV.tsx
- **Verification:** `npm run build` exits 0; `grep -c "SkillsList" src/components/cv/CV.tsx` returns 0; `test -f src/components/cv/SkillsList.tsx` returns true.
- **Committed in:** efa9406 (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking).
**Impact on plan:** None of the deviations expand scope. (1) was a planner-internal contradiction in the bio recipe, (2) unblocked Task 3's compile step and resolved a verification-vs-source mismatch, (3) kept the build green by removing a now-unused import without touching the SkillsList component file Plan 05-05 will own. SkillsList.tsx, WorkEntry.tsx, EducationEntry.tsx, all CV-section layout (centering / max-w / sectioning), DownloadCVButton, and SkillGroupList component are all explicitly deferred to Plan 05-05 — no scope leakage.

## Issues Encountered

- **Worktree did not contain `assets/`** — the parent checkout had a working-copy `assets/CV.typ` that was never committed. Resolved by copying the file into the worktree and committing it as part of Task 3 (deviation #2).
- **`grep` aliased to `ugrep`** — the user's shell aliases `grep` to `ugrep`, which has stricter regex semantics and shell glob handling. Worked around by invoking `/usr/bin/grep` directly when running plan acceptance grep checks. No effect on committed code.
- **Typst font fallback warning** — `Liberation Sans` is not installed locally; Typst falls back to a similar sans-serif. Plan explicitly accepts this warning and forbids modifying CV.typ to silence it. PDF renders correctly.

## Known Stubs

None introduced by Plan 05-02. The following are tracked as intentional intermediate state (resolved by Plan 05-05):

- CV.tsx skill rendering uses unstyled inline `<div><h4><p>` blocks (no eyebrow alignment, no SkillGroupList component, no UI-SPEC styling). Plan 05-05 owns the final SkillGroupList component + styling.
- WorkEntry.tsx does not yet render the `bullets` array (the field is now part of the data model but the renderer ignores it). Plan 05-05 owns the bulleted list rendering with bold-prefix split.
- DownloadCVButton component does not exist yet. Plan 05-05 introduces it and wires it to `/cv.pdf`.
- The CV section is not yet centered (still uses `max-w-4xl px-6` from the Phase 2 layout, not the Plan-05-05 `max-w-3xl mx-auto` centering treatment).
- contact (with email/github/linkedin) is exported but not rendered yet — Plan 05-06 owns the footer/contact rendering.

These are documented as intentional in the plan itself (every one is explicitly deferred to a named follow-up plan). Strategy A keeps Wave 1's build green as the contract for this plan; the visual surface lands in Wave 2.

## User Setup Required

`typst` and `just` must be installed locally for any future re-compile of `public/cv.pdf` (D-11: PDF is committed; CI never runs Typst). Both were already on PATH during this execution — no install step needed. For future contributors:

```bash
brew install typst just
just cv   # recompiles public/cv.pdf
```

No environment variables, no dashboards, no external services.

## Next Phase Readiness

Plan 05-05 (Wave 2, depends on 05-02) is now unblocked. Specifically:

- `skillGroups: SkillGroup[]` data shape is in place and consumable.
- `WorkEntry.bullets: string[]` field is on every work entry (empty `[]` for the consolidated EM and Data Engineer I roles, populated for the others).
- `contact.email` is a non-null string ready for footer rendering and `mailto:` link wiring.
- `public/cv.pdf` is committed and will be served at `/cv.pdf` from the static export — Plan 05-05's `DownloadCVButton` can target it directly.
- `npm run build` exits 0 — Plan 05-05 starts from a green base.

The only outstanding item from Plan 05-02 is **Task 4: Axel's human-verify checkpoint** — confirms bio wording, that the work entries match his real history, and that the rendered PDF passes a visual sanity check. The orchestrator pauses on this gate.

## Self-Check: PASSED

Verified:
- `src/data/cv.ts` exists, contains `axel.waserman@gmail.com`, `Senior Engineering Manager | Backend & Data`, `Contentsquare` (5 occurrences), `PwC France`, `Panodyssey`, `ESILV`, `Griffith College Dublin`, `Engineering Leadership`, `Backend & Systems Architecture`, `Hands-on Tech Stack`, no `Placeholder*`, no `<<TBD: email>>`, no `EMAIL_TBD_SENTINEL`, no `skills: string[]` export.
- `src/components/cv/CV.tsx` exists, imports `skillGroups`, renders three skill groups, contains no bare `skills` token.
- `assets/CV.typ` exists, contains `axel.waserman@gmail.com`.
- `justfile` exists, contains the `typst compile assets/CV.typ public/cv.pdf` line, is 6 lines (< 20).
- `public/cv.pdf` exists, is 48,008 bytes (> 1000), is a valid PDF 1.7 with 2 pages, contains the rendered email.
- `npx tsc --noEmit` exits 0.
- `npm run build` exits 0; out/index.html contains `Engineering Leadership`, `Backend & Systems Architecture`, `Hands-on Tech Stack`, `Senior Engineering Manager`, `Contentsquare`.
- `just cv` re-runnable; produces same 48,008-byte PDF.
- Commits 37e6bd3, efa9406, 74928c9 all present in `git log --oneline -5`.

---
*Phase: 05-polish*
*Completed: 2026-06-04*
