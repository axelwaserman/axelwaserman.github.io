import { contact, title } from '@/data/cv'

/**
 * Schema.org `Person` JSON-LD payload (D-22).
 *
 * Built at module scope from `cv.ts` exports so SSR and first client render
 * produce byte-identical output (no Math.random / Date.now in the construction
 * path — see memory `feedback_ssr_hydration_determinism.md`).
 *
 * `jobTitle` is derived from `cv.ts` `title` by splitting on the literal
 * ' | ' separator and taking the leading clause, matching D-22's locked
 * value 'Senior Engineering Manager' while staying single-source-of-truth
 * with the displayed CV title.
 */
export interface PersonSchema {
  readonly '@context': 'https://schema.org'
  readonly '@type': 'Person'
  readonly name: string
  readonly email: string
  readonly url: string
  readonly jobTitle: string
  readonly sameAs: readonly [string, string]
}

const SITE_URL = 'https://axelwaserman.github.io'

export const personSchema: PersonSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Axel Waserman',
  email: contact.email,
  url: SITE_URL,
  jobTitle: title.split(' | ')[0],
  sameAs: [contact.github, contact.linkedin],
} as const
