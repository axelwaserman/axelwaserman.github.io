const DAYS_PER_YEAR = 365.25
const DAYS_PER_MONTH = 30.44

export function formatRelativeDate(iso: string | null, now: Date = new Date()): string {
  if (iso === null || iso === '') return ''

  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''

  const deltaMs = Math.max(0, now.getTime() - parsed.getTime())

  if (deltaMs < 24 * 60 * 60 * 1000) return 'today'

  const days = deltaMs / (24 * 60 * 60 * 1000)
  const years = days / DAYS_PER_YEAR
  const months = days / DAYS_PER_MONTH

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (Math.floor(years) >= 1) {
    return formatter.format(-Math.floor(years), 'year')
  }

  if (Math.floor(months) >= 1) {
    return formatter.format(-Math.floor(months), 'month')
  }

  return formatter.format(-Math.floor(days), 'day')
}
