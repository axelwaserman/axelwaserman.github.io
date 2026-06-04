import { describe, it, expect } from 'vitest'
import { splitBulletPrefix } from './work-entry-bullet'

describe('splitBulletPrefix', () => {
  it('returns null when bullet has no colon', () => {
    expect(splitBulletPrefix('Plain bullet without colon')).toBeNull()
  })

  it('returns null when colon is at index 0', () => {
    expect(splitBulletPrefix(':leading colon')).toBeNull()
  })

  it('returns null when colon is at index >= 60', () => {
    const longPrefix = 'A'.repeat(60) + ':rest'
    expect(splitBulletPrefix(longPrefix)).toBeNull()
  })

  it('splits on first colon when index in (0, 60)', () => {
    const result = splitBulletPrefix('Bold-Prefix: rest of bullet')
    expect(result).toEqual({
      prefix: 'Bold-Prefix:',
      rest: ' rest of bullet',
    })
  })

  it('splits on the FIRST colon only', () => {
    const result = splitBulletPrefix('A: B: C')
    expect(result).toEqual({ prefix: 'A:', rest: ' B: C' })
  })

  it('splits at boundary index 59 (still under 60)', () => {
    const prefix = 'A'.repeat(59) // index 59 will be the colon
    const bullet = prefix + ':tail'
    const result = splitBulletPrefix(bullet)
    expect(result).toEqual({ prefix: prefix + ':', rest: 'tail' })
  })

  it('splits the canonical CV bullet (Post-Acquisition Integration:)', () => {
    const bullet =
      'Post-Acquisition Integration: Successfully integrated Hotjar’s remote-first team culture'
    const result = splitBulletPrefix(bullet)
    expect(result).not.toBeNull()
    expect(result!.prefix).toBe('Post-Acquisition Integration:')
    expect(result!.rest.startsWith(' Successfully')).toBe(true)
  })
})
