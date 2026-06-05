# Phase 5: Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-04
**Phase:** 5-polish
**Areas discussed:** Mandala visual direction, Real CV content, Favicon design, Live GitHub fetch correctness

---

## Mandala visual direction

### Q1 — Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Full-page ambient bg (Recommended) | Generative pattern fixed behind the entire page | |
| Hero-only accent | Mandala lives only inside/behind the hero section | ✓ |
| Decorative section dividers | Small mandala elements between sections as ornamental dividers | |
| Single fixed corner accent | One large mandala anchored to a viewport corner | |

**User's choice:** Hero-only accent — specifically the right half of the hero. CV / Projects / Contact sections to be re-centered as part of this phase.
**Notes:** "Besides we probably want to center the CV, projects and get in touch sections" — this expanded scope to include section re-centering (captured as D-02).

### Q2 — Style

| Option | Description | Selected |
|--------|-------------|----------|
| Geometric / fine line (Recommended) | Concentric rings, polygons, vector-precise | |
| Sacred geometry / hand-drawn | Flower-of-life style with hand-drawn feel | |
| Tech / glyph-based | Mandala from monospace characters | |
| Generative / algorithmic | Pattern computed from a seed | (overridden) |

**User's choice:** "Other" with specific direction — algorithmic, leveraging modulos and drawing straight lines between 2 points in a circle. (The classic "Times Tables on a Circle" / Mathologer pattern.)
**Notes:** Concrete, opinionated direction. Pure SVG `<line>` elements; no library needed.

### Q3 — Motion

| Option | Description | Selected |
|--------|-------------|----------|
| Rotate proportional to scroll (Recommended) | `transform: rotate()` tied to scroll position | ✓ |
| Modulus k changes with scroll | k value shifts on scroll, morphing the pattern | |
| Rotate + slowly drift k | Combined rotation + threshold-based k shifts | |
| Continuous rotation, scroll-independent | CSS animation, scroll has no effect | |

**User's choice:** Rotate proportional to scroll.
**Notes:** Compositor-only property; scroll listener via `requestAnimationFrame`.

### Q4 — Parameters

| Option | Description | Selected |
|--------|-------------|----------|
| Claude picks sensible values (Recommended) | Planner chooses n, k, color, stroke | |
| Specific n and k values | User specifies exact pair | |
| Multiple patterns, randomized per visit | Curated set, rotated per page load | (extended) |

**User's choice:** Variation of option 3 — curated set of (n, k) pairs with peculiar visual character + two input fields for user-supplied n and k + a refresh button. Once the user scrolls past the hero, the mandala resets to a random predefined pair.
**Notes:** Significant scope addition — interactive controls. Promotes the mandala to a Client Component (D-09).

---

## Real CV content

### Q1 — Source

| Option | Description | Selected |
|--------|-------------|----------|
| Provide it in this discussion (Recommended) | Paste data into the next 3 turns | |
| Provide a CV PDF / doc | Point at a CV file; extract entries | (extended) |
| Defer to a follow-up phase | Phase 5 keeps placeholder text | |
| Sketch it now, refine later | Provide rough/incomplete data | |

**User's choice:** Variation of option 2 — `assets/CV.typ` is the source. Wants a CV-content review chat before populating the website. The PDF should be downloadable from both the hero and the experience sections.
**Notes:** Content review captured as a deferred idea (writing work, not engineering). Two download placements captured as D-12.

### Q2 — PDF build pipeline

| Option | Description | Selected |
|--------|-------------|----------|
| Commit pre-built public/cv.pdf (Recommended) | Local typst compile; commit PDF | (extended) |
| Build cv.pdf in GitHub Actions | CI installs Typst; PDF regenerated on every build | |
| Pre-commit hook compiles it | Git hook re-runs typst compile on CV.typ change | |
| Skip Typst pipeline, hand-craft cv.pdf | CV.typ exists as personal doc only | |

**User's choice:** Option 1 + a justfile recipe (`just cv`) wraps the typst compile invocation.
**Notes:** Captured as D-11. No CI dependency on Typst.

### Q3 — Mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror CV.typ verbatim (Recommended) | Site = same entries as CV.typ; bullets render | ✓ |
| Condensed 'site' version | Site shows fewer/shorter entries | |
| Expanded version with full bullets | Site renders all bullets; needs interface change | |

**User's choice:** Mirror verbatim.
**Notes:** Requires extending `WorkEntry` with a `bullets` field (D-13). Site and PDF stay in sync.

### Q4 — Download placements + email

| Option | Description | Selected |
|--------|-------------|----------|
| Hero CTA + experience-section button (Recommended) | Two prominent placements | ✓ |
| Single hero CTA only | Just update existing hero link | |
| Subtle inline link, not a button | Subtle text link in experience section | |

**User's choice:** Hero CTA + experience-section button.
**Notes:** Captured as D-12. Real LinkedIn + GitHub URLs locked.

### Q4b — Email

| Option | Description | Selected |
|--------|-------------|----------|
| Use LinkedIn instead of email | Drop the mailto: link entirely | |
| Provide my email now | User writes email; planner uses it | ✓ (no value typed) |
| Use a 'contact' alias on a domain you own | hello@axelwaserman.com or similar | |

**User's choice:** "Provide my email now" — but no value entered in Other field.
**Notes:** Captured as D-17 with `<<TBD: email>>` token. Planner must surface this as a blocking task. Phase 5 cannot ship until a real email value is provided. Planner picks the safest UX for the contact section in the interim (likely omit the email row).

---

## Favicon design

### Q1 — Mark

| Option | Description | Selected |
|--------|-------------|----------|
| A modulus-mandala mark (Recommended) | Reuse the hero algorithm at icon scale | |
| Initials AW | Typographic monogram | ✓ |
| Stylized 'A' | Single letter, possibly with mandala negative space | |
| Abstract geometric mark unrelated to mandala | Decoupled simple geometric mark | |

**User's choice:** Initials AW.
**Notes:** Captured as D-18.

### Q2 — Style

| Option | Description | Selected |
|--------|-------------|----------|
| Instrument Serif, classical (Recommended) | AW in display font on parchment | ✓ |
| Sora bold sans | AW in body font, bold | |
| Stacked / overlapping AW | Single ligature-like mark | |
| Single 'A' with descender hint | Monogram simplified to one letter | |

**User's choice:** Instrument Serif, classical.
**Notes:** Captured as D-18 / D-20.

### Q3 — Format

| Option | Description | Selected |
|--------|-------------|----------|
| app/icon.tsx (Next.js generated, Recommended) | ImageResponse + font; build-time generated | ✓ |
| app/icon.png (static asset) | Pre-rendered PNG | |
| public/favicon.ico (legacy multi-size) | Multi-resolution .ico | |
| All three (icon.tsx + apple-icon + favicon.ico) | Full set | |

**User's choice:** app/icon.tsx.
**Notes:** Captured as D-19. Compatible with `output: 'export'`.

### Q4 — Colors

| Option | Description | Selected |
|--------|-------------|----------|
| Parchment bg + dark text (Recommended) | --color-surface + --color-text | ✓ |
| Inverted (dark bg, parchment text) | Higher contrast against tab chromes | |
| Transparent bg, dark text | AW only, no background fill | |
| Accent-color bg, parchment text | --color-accent fill | |

**User's choice:** Option 1, with explicit note that Phase 5 commits to parchment provisionally and a future phase will refresh the visual identity around the mandala.
**Notes:** Captured as D-20 + Deferred Idea (visual identity refresh).

---

## Live GitHub fetch correctness

### Q1 — Source fix

| Option | Description | Selected |
|--------|-------------|----------|
| Set GITHUB_USERNAME=axelwaserman in workflow + change default in code (Recommended) | Belt and braces | ✓ |
| Change code default only | Single line of source | |
| Set workflow env var only, leave code default | Local builds still wrong | |
| Hardcode and remove env-var indirection | Simplest; loses indirection | |

**User's choice:** Belt-and-braces.
**Notes:** Captured as D-21. Workflow env + code default both updated.

### Q2 — Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Inspect deployed HTML for known repo names (Recommended) | curl + grep against gh repo list | ✓ |
| Build-time assertion: fail build if fallback is hit | Strict mode; contradicts D-06 | |
| Add a build-stamp in HTML output | data-source attr | |
| Console.warn check via DevTools / build log | Check GH Actions log for warning | |

**User's choice:** Option 1.
**Notes:** Captured as D-22. Matches Phase 5 SC-4 verbatim.

### Q3 — Sweep scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full sweep across all source files (Recommended) | All code + planning docs | ✓ |
| Only files affecting the deployed site | Skip planning docs | |
| Only files the user sees — leave projects.json as-is | Risky | |
| Defer code sweep to a separate phase | Phase 5 ships with broken hardcoded URLs | |

**User's choice:** Full sweep.
**Notes:** Captured as D-23.

### Q4 — Fallback refresh

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — freeze a real snapshot now (Recommended) | One-time refresh during Phase 5 | ✓ |
| Leave projects.json alone | Defer | |
| Replace projects.json with empty array | Honest about failure; visually empty | |
| Auto-refresh fallback on each successful live fetch | Workflow commits back to repo | |

**User's choice:** One-time refresh now.
**Notes:** Captured as D-24. Auto-refresh deferred to a future phase.

---

## Claude's Discretion

The user gave Claude latitude on:

- Exact (n, k) pairs in the curated mandala set (5–10 with strong visual character)
- Mandala stroke color, stroke width, opacity, viewBox dimensions
- Mandala rotation rate (degrees per pixel scrolled)
- Mandala input min/max bounds and validation behavior
- Refresh button visual treatment
- Centering treatment for CV / Projects / Contact (D-02) — internal block layout vs block position
- WorkEntry bullets rendering (round bullets vs em-dash, indent vs hang)
- `SkillGroup` interface shape (D-16)
- "Download CV (PDF)" button placement / icon / mobile width
- `app/icon.tsx` ImageResponse exact size and font weight
- Email-row UX in the contact section while the email value is `<<TBD>>`
- Test strategy for the mandala component

## Deferred Ideas

- Visual identity refresh away from parchment, anchored on the mandala — future phase
- CV content review chat (writing work, not engineering) — separate conversation before running `just cv` for production
- Auto-refresh `projects.json` on every successful CI build
- Build-time strict mode that fails the build when fallback is hit (contradicts Phase 3 D-06)
- Mandala mobile-breakpoint refinements
- `apple-icon` / multi-size `favicon.ico` for legacy iOS / pinned-tab support
