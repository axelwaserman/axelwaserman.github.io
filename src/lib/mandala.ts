// Pure SVG <line> generation for the hero mandala (Phase 05, D-03..D-06).
// No 'use client', no 'server-only' — this module must be import-safe for
// Client Components in Plan 05-06.

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
  { n: 200, k: 2 },   // cardioid (one cusp)
  { n: 200, k: 3 },   // nephroid (two cusps)
  { n: 200, k: 5 },   // 4-cusp epicycloid
  { n: 240, k: 47 },  // 5-cusp / star
  { n: 300, k: 53 },  // 6-cusp
  { n: 360, k: 73 },  // 7-cusp
] as const

function pointOnCircle(index: number, n: number): { x: number; y: number } {
  const theta = (2 * Math.PI * index) / n - QUARTER_TURN
  return {
    x: CENTER + RADIUS * Math.cos(theta),
    y: CENTER + RADIUS * Math.sin(theta),
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
