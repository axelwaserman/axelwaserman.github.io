/**
 * Pure helper for WorkEntry bullet rendering.
 *
 * UI-SPEC §"Work entry rendering — bullets" rule:
 *   "Bullets that begin with a bold phrase up to the first colon (e.g.
 *    'Post-Acquisition Integration:') preserve the bold span: render the
 *    phrase up to the first colon as Sora 600 inline; rest stays Sora 400."
 *
 * Window: split only when the first colon is at index in (0, 60). A colon
 * past character 60 likely belongs to the body of a sentence, not a bold
 * label — leaving it un-split avoids accidentally bolding mid-sentence text.
 */
export interface BulletSplit {
  prefix: string
  rest: string
}

const BOLD_PREFIX_MAX_INDEX = 60

export function splitBulletPrefix(bullet: string): BulletSplit | null {
  const colonIndex = bullet.indexOf(':')
  if (colonIndex <= 0 || colonIndex >= BOLD_PREFIX_MAX_INDEX) {
    return null
  }
  return {
    prefix: bullet.slice(0, colonIndex + 1),
    rest: bullet.slice(colonIndex + 1),
  }
}
