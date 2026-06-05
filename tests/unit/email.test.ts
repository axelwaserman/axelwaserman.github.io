import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EMAIL_ENCODED, decodeEmail } from '../../src/lib/email'

test('EMAIL_ENCODED is base64-encoded (no plain "@" or "axel.waserman" substring)', () => {
  assert.equal(EMAIL_ENCODED.includes('@'), false)
  assert.equal(EMAIL_ENCODED.includes('axel.waserman'), false)
  assert.match(EMAIL_ENCODED, /^[A-Za-z0-9+/]+=*$/)
})

test('decodeEmail round-trips EMAIL_ENCODED to the canonical address', () => {
  assert.equal(decodeEmail(EMAIL_ENCODED), 'axel.waserman@gmail.com')
})
