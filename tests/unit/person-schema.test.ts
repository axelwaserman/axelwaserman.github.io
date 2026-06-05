import { test } from 'node:test'
import assert from 'node:assert/strict'
import { personSchema } from '../../src/lib/person-schema'
import { contact, title } from '../../src/data/cv'

test('personSchema: @context is schema.org', () => {
  assert.equal(personSchema['@context'], 'https://schema.org')
})

test('personSchema: @type is Person', () => {
  assert.equal(personSchema['@type'], 'Person')
})

test('personSchema: name is Axel Waserman', () => {
  assert.equal(personSchema.name, 'Axel Waserman')
})

test('personSchema: email comes from cv.ts contact.email (not hardcoded)', () => {
  assert.equal(personSchema.email, contact.email)
  assert.equal(personSchema.email, 'axel.waserman@gmail.com')
})

test('personSchema: url is the production GitHub Pages URL', () => {
  assert.equal(personSchema.url, 'https://axelwaserman.github.io')
})

test('personSchema: jobTitle is the leading clause of cv.ts title (D-22)', () => {
  // cv.ts title: 'Senior Engineering Manager | Backend & Data'
  // D-22 jobTitle target: 'Senior Engineering Manager' (split on ' | ', take [0])
  assert.equal(personSchema.jobTitle, 'Senior Engineering Manager')
  assert.equal(personSchema.jobTitle, title.split(' | ')[0])
})

test('personSchema: sameAs contains GitHub and LinkedIn URLs from cv.ts', () => {
  assert.deepEqual(personSchema.sameAs, [contact.github, contact.linkedin])
  assert.equal(personSchema.sameAs[0], 'https://github.com/axelwaserman')
  assert.equal(
    personSchema.sameAs[1],
    'https://www.linkedin.com/in/axel-waserman-9753221a6/',
  )
})

test('personSchema: JSON.stringify produces deterministic minified output', () => {
  // Same input => same output, no Math.random / Date.now drift.
  const a = JSON.stringify(personSchema)
  const b = JSON.stringify(personSchema)
  assert.equal(a, b)
  // Sanity: minified (no newlines from default JSON.stringify).
  assert.ok(!a.includes('\n'), 'JSON should be minified, no newlines')
})

test('personSchema: JSON parses back to an object containing the email', () => {
  const json = JSON.stringify(personSchema)
  const parsed = JSON.parse(json) as { email: string; '@type': string }
  assert.equal(parsed['@type'], 'Person')
  assert.equal(parsed.email, 'axel.waserman@gmail.com')
})
