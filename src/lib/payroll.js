export const FREQS = [
  { id: '52', label: 'Weekly (52/yr)' },
  { id: '26', label: 'Every 2 weeks (26/yr)' },
  { id: '24', label: 'Twice a month (24/yr)' },
  { id: '12', label: 'Monthly (12/yr)' },
]

export function estimateRemaining(periodsPerYear) {
  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  const daysLeft = Math.max(0, (endOfYear - now) / 86400000)
  return Math.round((daysLeft / 365) * periodsPerYear)
}

// Parse a 'YYYY-MM-DD' string as a local date (avoids the UTC-parsing shift
// that new Date('YYYY-MM-DD') introduces). Falls back to today.
function parseLocalDate(dateStr) {
  const m = typeof dateStr === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    if (!Number.isNaN(d.getTime())) return d
  }
  return new Date()
}

function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.floor((date - start) / 86400000) + 1
}

// How many pay periods have elapsed by the given pay-stub date, out of
// periodsPerYear for the year. Always at least 1 (the stub itself).
export function checksElapsed(dateStr, periodsPerYear) {
  const doy = dayOfYear(parseLocalDate(dateStr))
  return Math.max(1, Math.round((doy / 365) * periodsPerYear))
}

// Pay periods left in the year after the given pay-stub date.
export function checksRemaining(dateStr, periodsPerYear) {
  return Math.max(0, periodsPerYear - checksElapsed(dateStr, periodsPerYear))
}
