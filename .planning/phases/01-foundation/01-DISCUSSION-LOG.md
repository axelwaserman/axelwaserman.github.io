# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 1-Foundation
**Areas discussed:** Typography pairing, Color palette, Tokens depth, Scaffold approach

---

## Typography pairing

| Option | Description | Selected |
|--------|-------------|----------|
| Technical / clean | Geist or Inter — modern, readable, developer-credibility signal | |
| Editorial / distinctive | Plus Jakarta Sans or DM Sans — more personality, still professional | |
| Classic / authoritative | Sora + a serif like Instrument Serif — editorial pairing, polished/senior | ✓ |

**Serif choice:**
| Instrument Serif | High-contrast, elegant. Google Fonts. Pairs well with Sora's geometric body | ✓ |
| Playfair Display | More dramatic serifs, strong for pull-quotes | |
| You decide | Claude picks | |

**Font roles:**
| Sora body, Instrument Serif headings | Classic editorial split — clean body, authoritative headings | ✓ |
| Instrument Serif body, Sora headings | Unusual reversal — literary feel | |

**Weights:**
| Minimal: 400 + 600 each | Saves ~40kb vs full weights | |
| Standard: 400, 500, 600, 700 each | More flexibility for hierarchy | ✓ |

**Loading:**
| Both via next/font/google | Zero runtime Google Fonts requests | ✓ |
| Sora via next/font, Instrument Serif local | More setup, no benefit if using Google Fonts | |

**Type scale:**
| Custom tokens in tokens.css | Defines --text-hero with clamp() for fluid responsive scaling | ✓ |
| Tailwind built-in | Less design control | |

**User's choice:** Sora (body) + Instrument Serif (headings), weights 400/500/600/700, both via next/font/google, custom clamp() type tokens
**Notes:** User emphasized design must be responsive — all type tokens must use clamp().

---

## Color palette

| Option | Description | Selected |
|--------|-------------|----------|
| Warm ink / parchment | Off-white bg, near-black text, warm amber/terracotta accent | ✓ |
| Cool stone / slate | Cool gray undertone, slate-blue/indigo accent | |
| Neutral with a pop | True white, single saturated accent | |
| I have a specific palette | Custom | |

**Saturation:**
| Muted / earthy | oklch chroma ~0.12–0.16. Refined, editorial | |
| Medium vibrancy | oklch chroma ~0.18–0.22. More energy, still tasteful | ✓ |
| You decide | Claude picks | |

**Color format:**
| oklch() | Perceptually uniform, aligns with coding style rules | ✓ |
| hsl() | More familiar | |
| hex | Most portable | |

**Token count:**
| Minimal (surface, text, accent, muted) | 4 tokens, covers personal site needs | ✓ |
| Standard (+ border, link, interactive) | More explicit for hover/focus | |
| You decide | Planner decides | |

**User's choice:** Warm parchment palette, medium vibrancy accent, oklch() throughout, 4 minimal tokens

---

## Tokens depth

| Option | Description | Selected |
|--------|-------------|----------|
| Full foundation | Colors + type + spacing + radius + animation tokens | |
| Colors + type only | Spacing/radius/animation deferred to Phase 2 | ✓ |
| Minimal stub | Only tokens Phase 1 literally needs | |

**Spacing decision:**
| Add to tokens.css in Phase 2 | All design decisions in one file | ✓ |
| Use Tailwind's spacing scale | Less maintenance | |

**Token format:**
| Raw CSS custom properties only | Simpler | |
| Tailwind @theme directive | Tokens usable as Tailwind utilities AND CSS vars | ✓ |

**User's choice:** Colors + type only in Phase 1; expand tokens.css in Phase 2; use Tailwind @theme directive

---

## Scaffold approach

| Option | Description | Selected |
|--------|-------------|----------|
| create-next-app then clean up | Official CLI, correct App Router + TypeScript setup | ✓ |
| Manual from scratch | More control, more setup risk | |

**page.tsx content:**
| Empty shell with section placeholders | Section stubs give Phase 2 a map | ✓ |
| Minimal hello world | Phase 2 structures from scratch | |

**File structure:**
| src/ directory | Aligns with CLAUDE.md file organization rules | ✓ |
| Root app/ directory | create-next-app default | |

**Lint/format:**
| Full lint + format setup | ESLint + Prettier with hooks | ✓ |
| Next.js defaults only | Can add later | |

**User's choice:** create-next-app → clean up, src/ structure, section placeholder stubs in page.tsx, ESLint + Prettier from day one

---

## Claude's Discretion

- Specific `clamp()` values for all type scale tokens
- Specific oklch() color values for warm parchment palette
- ESLint/Prettier configuration details

## Deferred Ideas

- Spacing scale, border-radius tokens, animation easing/duration tokens → Phase 2
