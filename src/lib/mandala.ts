// BRAND-01: deterministic mandala favicon generator + Phase 05 hero mandala line geometry.
//
// This module hosts two unrelated mandala utilities behind one filename:
//   1. Phase 05 hero: `generateLines`, `CURATED_PAIRS`, `pickRandomPair` —
//      Times-Tables-on-a-Circle chord geometry for the homepage hero animation.
//   2. Phase 07 favicon: `generateMandala`, `seedFromCommit`, `xorshift32` —
//      a commit-SHA-seeded SVG mandala used by src/app/icon.tsx and
//      src/app/apple-icon.tsx as the build-time favicon (replacing the AW monogram).
//
// Pure module: no client-component directive, no server-only directive. Must be
// import-safe for both Client Components (hero) and the next/og ImageResponse
// pipeline (icons).

export interface ChordLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface MandalaPair {
  n: number
  k: number
}

const CENTER = 500
const RADIUS = 460
const QUARTER_TURN = Math.PI / 2

// Curated pair set — picked for visual distinctiveness (Mathologer-style
// cardioid / nephroid / multi-cusp epicycloids). Replaced the original 8-pair
// set after visual review showed (180, 179) collapsed to an n-gon outline and
// (300, 7) looked like a near-solid disk. Tests below mirror this exact list.
export const CURATED_PAIRS: readonly MandalaPair[] = [
  { n: 200, k: 2 }, // cardioid (one cusp)
  { n: 200, k: 3 }, // nephroid (two cusps)
  { n: 200, k: 5 }, // 4-cusp epicycloid
  { n: 240, k: 47 }, // 5-cusp / star
  { n: 300, k: 53 }, // 6-cusp
  { n: 360, k: 73 }, // 7-cusp
] as const

// 4 decimal places of an SVG user unit ≈ 0.0001px at viewBox=1000, well below
// any visible threshold but enough to avoid hydration mismatches caused by
// last-digit floating-point drift between SSR and client runtimes.
const COORD_DECIMALS = 4

function quantize(value: number): number {
  return Number(value.toFixed(COORD_DECIMALS))
}

function pointOnCircle(index: number, n: number): { x: number; y: number } {
  const theta = (2 * Math.PI * index) / n - QUARTER_TURN
  return {
    x: quantize(CENTER + RADIUS * Math.cos(theta)),
    y: quantize(CENTER + RADIUS * Math.sin(theta)),
  }
}

// Times-Tables-on-a-Circle: each point i (0..n-1) is connected to point
// ((i + 1) * k) mod n. This zero-indexed form is equivalent to the canonical
// Mathologer construction iterated over i=1..n, and matches UI-SPEC's
// (n=4, k=1) expectation that line[0] connects point 0 → point 1.
export function generateLines(n: number, k: number): ChordLine[] {
  const lines: ChordLine[] = []
  for (let i = 0; i < n; i++) {
    const j = ((i + 1) * k) % n
    const a = pointOnCircle(i, n)
    const b = pointOnCircle(j, n)
    lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
  }
  return lines
}

function isSamePair(a: MandalaPair, b: MandalaPair): boolean {
  return a.n === b.n && a.k === b.k
}

export function pickRandomPair(
  exclude?: MandalaPair,
  rng: () => number = Math.random,
): MandalaPair {
  const candidates =
    exclude === undefined
      ? CURATED_PAIRS
      : CURATED_PAIRS.filter((pair) => !isSamePair(pair, exclude))
  const index = Math.floor(rng() * candidates.length)
  return candidates[index]
}

// =============================================================================
// BRAND-01: deterministic favicon mandala generator.
// =============================================================================
//
// Why djb2 + xorshift32?
// - djb2: tiny, well-known, deterministic string-to-uint32 hash. Sufficient for
//   visual seeding (we are not signing anything). No crypto dependency, runs at
//   build time, deterministic across Node versions.
// - xorshift32: minimal stateful PRNG with a fast period (2^32 - 1). Uniform
//   enough for picking ring counts and petal placements. Stalls on seed 0 — we
//   guard against that below.
//
// Color tokens (sRGB equivalents of the oklch tokens in src/styles/tokens.css —
// Satori does not yet support oklch() in inline styles, so we precompute):
//   --color-surface = oklch(97% 0.01 75) → rgb(249, 244, 238)  (parchment background)
//   --color-text    = oklch(18% 0.01 75) → rgb(20, 17, 13)     (dark ink stroke)
//   --color-accent  = oklch(62% 0.19 55) → rgb(214, 99, 47)    (warm orange accent)

import { createElement, type ReactElement } from 'react'

export interface MandalaParams {
  ringCount: number
  petalCounts: number[]
  rotationOffsets: number[]
  bgColor: string
  strokeColor: string
  accentColor: string
}

export interface MandalaResult {
  children: ReactElement
  params: MandalaParams
}

const FAVICON_SURFACE_SRGB = 'rgb(249, 244, 238)'
const FAVICON_TEXT_SRGB = 'rgb(20, 17, 13)'
const FAVICON_ACCENT_SRGB = 'rgb(214, 99, 47)'

/**
 * djb2 hash — converts an arbitrary string into a deterministic 32-bit unsigned int.
 * Reference: http://www.cse.yorku.ca/~oz/hash.html
 */
function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + c
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return hash >>> 0
}

/**
 * Reads the build-time commit SHA from the environment and returns a deterministic
 * 32-bit seed. Falls back to a constant string for offline / local dev builds so
 * the same dev machine always sees the same mandala until they push.
 */
export function seedFromCommit(): number {
  const sha =
    process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'local-dev'
  return djb2(sha)
}

/**
 * xorshift32 PRNG. Returns a stateful closure that produces floats in [0, 1).
 * Calling the returned closure twice with the same seed yields the same sequence.
 */
export function xorshift32(seed: number): () => number {
  // xorshift32 stalls on state 0 — replace with 1 to keep the sequence alive.
  let state = (seed | 0) === 0 ? 1 : seed >>> 0
  return function next(): number {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    state = state >>> 0
    return state / 0xffffffff
  }
}

/**
 * Build a deterministic mandala SVG.
 *
 * - `seed` selects the visual variant (ring count, petal counts, rotations).
 * - `canvasSize` controls the viewBox; petal radii and stroke widths scale
 *   linearly with it, so the same seed produces a visually consistent mandala
 *   at 32px (favicon) and 180px (apple-touch icon).
 *
 * Output: a single <svg> element ready to be embedded as ImageResponse children.
 */
export function generateMandala(
  seed: number,
  canvasSize: number,
): MandalaResult {
  const prng = xorshift32(seed)

  // 3..5 rings — enough variation to feel intentional, few enough to read at 16px.
  const ringCount = 3 + Math.floor(prng() * 3)

  const petalCounts: number[] = []
  const rotationOffsets: number[] = []
  for (let i = 0; i < ringCount; i++) {
    petalCounts.push(6 + Math.floor(prng() * 7)) // 6..12
    rotationOffsets.push(prng() * 360)
  }

  const params: MandalaParams = {
    ringCount,
    petalCounts,
    rotationOffsets,
    bgColor: FAVICON_SURFACE_SRGB,
    strokeColor: FAVICON_TEXT_SRGB,
    accentColor: FAVICON_ACCENT_SRGB,
  }

  const cx = canvasSize / 2
  const cy = canvasSize / 2
  const maxRadius = canvasSize * 0.45
  const strokeWidth = Math.max(0.75, canvasSize / 64)

  const elements: ReactElement[] = []
  let elementKey = 0

  // Outer guide ring — gives the mandala a clean silhouette at small sizes.
  elements.push(
    createElement('circle', {
      key: `guide-${elementKey++}`,
      cx,
      cy,
      r: maxRadius,
      fill: 'none',
      stroke: FAVICON_TEXT_SRGB,
      strokeWidth,
    }),
  )

  for (let i = 0; i < ringCount; i++) {
    const ringIndex = i + 1
    const radius = (ringIndex / (ringCount + 1)) * maxRadius
    const petalCount = petalCounts[i]
    const rotationOffsetRad = (rotationOffsets[i] * Math.PI) / 180
    const petalRadius = Math.max(1, canvasSize * 0.04 * (1 - i / ringCount))
    // Alternate stroke colors per ring so the mandala has a hint of warmth
    // without flooding the design — even rings = ink, odd rings = accent.
    const ringColor = i % 2 === 0 ? FAVICON_TEXT_SRGB : FAVICON_ACCENT_SRGB

    // Connector ring — faint ink circle the petals sit on.
    elements.push(
      createElement('circle', {
        key: `ring-${elementKey++}`,
        cx,
        cy,
        r: radius,
        fill: 'none',
        stroke: FAVICON_TEXT_SRGB,
        strokeWidth: strokeWidth * 0.5,
        opacity: 0.35,
      }),
    )

    for (let k = 0; k < petalCount; k++) {
      const theta = (k / petalCount) * 2 * Math.PI + rotationOffsetRad
      const px = cx + radius * Math.cos(theta)
      const py = cy + radius * Math.sin(theta)
      elements.push(
        createElement('circle', {
          key: `petal-${elementKey++}`,
          cx: px,
          cy: py,
          r: petalRadius,
          fill: ringColor,
          stroke: FAVICON_TEXT_SRGB,
          strokeWidth: strokeWidth * 0.5,
        }),
      )
    }
  }

  // Center dot — anchors the symmetry.
  elements.push(
    createElement('circle', {
      key: `center-${elementKey++}`,
      cx,
      cy,
      r: Math.max(1, canvasSize * 0.04),
      fill: FAVICON_ACCENT_SRGB,
      stroke: FAVICON_TEXT_SRGB,
      strokeWidth: strokeWidth * 0.5,
    }),
  )

  const children: ReactElement = createElement(
    'svg',
    {
      width: canvasSize,
      height: canvasSize,
      viewBox: `0 0 ${canvasSize} ${canvasSize}`,
      xmlns: 'http://www.w3.org/2000/svg',
    },
    ...elements,
  )

  return { children, params }
}
