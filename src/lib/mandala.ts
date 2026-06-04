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

// Locked 8-pair set — UI-SPEC §"Curated (n, k) set — LOCKED" (D-04). Order is
// load-bearing: tests assert deep equality against this exact sequence.
export const CURATED_PAIRS: readonly MandalaPair[] = [
  { n: 200, k: 2 },
  { n: 200, k: 3 },
  { n: 240, k: 5 },
  { n: 300, k: 7 },
  { n: 360, k: 11 },
  { n: 144, k: 89 },
  { n: 180, k: 179 },
  { n: 250, k: 13 },
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
