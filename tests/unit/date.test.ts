import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatRelativeDate } from '../../src/lib/date'

const NOW = new Date('2026-06-02T12:00:00Z')

test('formatRelativeDate: null input returns empty string', () => {
  assert.equal(formatRelativeDate(null, NOW), '')
})

test('formatRelativeDate: empty string input returns empty string', () => {
  assert.equal(formatRelativeDate('', NOW), '')
})

test('formatRelativeDate: invalid date returns empty string', () => {
  assert.equal(formatRelativeDate('not-a-date', NOW), '')
})

test('formatRelativeDate: <24h ago returns today', () => {
  assert.equal(formatRelativeDate('2026-06-02T01:00:00Z', NOW), 'today')
})

test('formatRelativeDate: future date returns today (clock-skew clamp)', () => {
  assert.equal(formatRelativeDate('2027-01-01T00:00:00Z', NOW), 'today')
})

test('formatRelativeDate: ~3 months ago returns a non-empty string mentioning month', () => {
  const out = formatRelativeDate('2026-03-02T12:00:00Z', NOW)
  assert.ok(out.length > 0, `expected non-empty output, got "${out}"`)
  assert.match(out, /month/i)
})
