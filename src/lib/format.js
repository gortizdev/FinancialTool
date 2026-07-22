const usd0 = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
})

export function fmtUSD(n) {
  return usd0.format(Math.round(n))
}

export function fmtUSDCompact(n) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`
  return usd0.format(Math.round(n))
}

export function fmtPct(fraction, digits = 1) {
  return `${(fraction * 100).toFixed(digits)}%`
}
