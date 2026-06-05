import { describe, it, expect } from 'vitest'
import { generateLines, CURATED_PAIRS, pickRandomPair, type MandalaPair } from '@/lib/mandala'

// Tests inject a deterministic `rng` via the optional 2nd arg of `pickRandomPair`
// so selection is verifiable without flakiness — defaults to Math.random in prod.

const CENTER = 500
const RADIUS = 460

describe('generateLines', () => {
  it('returns exactly n lines for the smallest valid (n=3, k=1)', () => {
    const lines = generateLines(3, 1)
    expect(lines).toHaveLength(3)
  })

  it('returns 200 lines for curated pair (200, 2) — cardioid', () => {
    const lines = generateLines(200, 2)
    expect(lines).toHaveLength(200)
  })

  it('returns 360 lines for curated max-n pair (360, 11)', () => {
    const lines = generateLines(360, 11)
    expect(lines).toHaveLength(360)
  })

  it('places point 0 at 12 o’clock: line[0].x1 ≈ 500, line[0].y1 ≈ 40', () => {
    const lines = generateLines(4, 1)
    expect(lines[0].x1).toBeCloseTo(CENTER, 6)
    expect(lines[0].y1).toBeCloseTo(CENTER - RADIUS, 6) // 40
  })

  it('all chord endpoints are within radius 460 of center', () => {
    const lines = generateLines(200, 2)
    for (const line of lines) {
      const d1 = Math.hypot(line.x1 - CENTER, line.y1 - CENTER)
      const d2 = Math.hypot(line.x2 - CENTER, line.y2 - CENTER)
      expect(d1).toBeCloseTo(RADIUS, 6)
      expect(d2).toBeCloseTo(RADIUS, 6)
    }
  })

  it('(n=4, k=1): line[0] connects top (500, 40) to right (960, 500)', () => {
    const lines = generateLines(4, 1)
    expect(lines[0].x1).toBeCloseTo(500, 6)
    expect(lines[0].y1).toBeCloseTo(40, 6)
    expect(lines[0].x2).toBeCloseTo(960, 6)
    expect(lines[0].y2).toBeCloseTo(500, 6)
  })

  it('(n=4, k=2): line[0] connects top (500, 40) to bottom (500, 960)', () => {
    const lines = generateLines(4, 2)
    expect(lines[0].x1).toBeCloseTo(500, 6)
    expect(lines[0].y1).toBeCloseTo(40, 6)
    expect(lines[0].x2).toBeCloseTo(500, 6)
    expect(lines[0].y2).toBeCloseTo(960, 6)
  })

  it('is deterministic — calling generateLines(200, 2) twice produces deeply equal arrays', () => {
    const a = generateLines(200, 2)
    const b = generateLines(200, 2)
    expect(a).toEqual(b)
  })
})

describe('CURATED_PAIRS', () => {
  it('has exactly 6 entries', () => {
    expect(CURATED_PAIRS).toHaveLength(6)
  })

  it('contains the visually-vetted pair set in the locked order', () => {
    const expected: readonly MandalaPair[] = [
      { n: 200, k: 2 },
      { n: 200, k: 3 },
      { n: 200, k: 5 },
      { n: 240, k: 47 },
      { n: 300, k: 53 },
      { n: 360, k: 73 },
    ]
    expect(CURATED_PAIRS).toEqual(expected)
  })

  it('every pair has 2 ≤ k ≤ n − 2 (excludes degenerate n-gon outline and solid-disk cases)', () => {
    for (const { n, k } of CURATED_PAIRS) {
      expect(k).toBeGreaterThanOrEqual(2)
      expect(k).toBeLessThanOrEqual(n - 2)
    }
  })
})

describe('pickRandomPair', () => {
  it('returns one of the 8 curated pairs when called with no args', () => {
    const pair = pickRandomPair()
    const isCurated = CURATED_PAIRS.some((p) => p.n === pair.n && p.k === pair.k)
    expect(isCurated).toBe(true)
  })

  it('with rng=() => 0 and no exclude, returns CURATED_PAIRS[0]', () => {
    const pair = pickRandomPair(undefined, () => 0)
    expect(pair).toEqual(CURATED_PAIRS[0])
  })

  it('with rng returning ~0.999, returns the last entry when no exclude', () => {
    const pair = pickRandomPair(undefined, () => 0.9999999)
    expect(pair).toEqual(CURATED_PAIRS[CURATED_PAIRS.length - 1])
  })

  it('never returns the excluded pair — exclude=CURATED_PAIRS[0], rng=() => 0 returns CURATED_PAIRS[1]', () => {
    const pair = pickRandomPair(CURATED_PAIRS[0], () => 0)
    expect(pair).toEqual(CURATED_PAIRS[1])
  })

  it('skips the excluded pair across many calls (rng=Math.random)', () => {
    const exclude = CURATED_PAIRS[3]
    for (let i = 0; i < 200; i++) {
      const pair = pickRandomPair(exclude)
      expect(pair).not.toEqual(exclude)
    }
  })

  it('with exclude=last and rng=() => 0.9999999 returns the second-to-last pair', () => {
    const last = CURATED_PAIRS[CURATED_PAIRS.length - 1]
    const expected = CURATED_PAIRS[CURATED_PAIRS.length - 2]
    const pair = pickRandomPair(last, () => 0.9999999)
    expect(pair).toEqual(expected)
  })
})
