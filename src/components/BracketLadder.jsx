import { TAX_DATA } from '../lib/taxData'
import { fmtUSD, fmtPct } from '../lib/format'

// Shows which federal bracket ordinary income lands in, and how full that
// bracket is, plus the next bracket up (grayed) as a preview.
export default function BracketLadder({ year, status, tax }) {
  const ordinaryTaxable = Math.max(0, tax.taxable - Math.min(tax.qualDividends + tax.ltcg, tax.taxable))
  if (ordinaryTaxable <= 0) return null

  const brackets = TAX_DATA[year].brackets[status]
  let currentIdx = 0
  for (let i = 0; i < brackets.length; i++) {
    if (ordinaryTaxable > brackets[i][0]) currentIdx = i
    else break
  }
  const nextIdx = currentIdx + 1 < brackets.length ? currentIdx + 1 : null
  const rowIdxs = nextIdx != null
    ? [...Array(currentIdx + 1).keys(), nextIdx]
    : [...Array(currentIdx + 1).keys()]

  const rows = rowIdxs.map((i) => {
    const [lo, rate] = brackets[i]
    const hi = i + 1 < brackets.length ? brackets[i + 1][0] : Infinity
    const isCurrent = i === currentIdx
    const isNext = nextIdx != null && i === nextIdx
    let fill
    if (isNext) fill = 0
    else if (isCurrent) {
      fill = hi === Infinity ? 100 : Math.max(0, Math.min(100, ((ordinaryTaxable - lo) / (hi - lo)) * 100))
    } else fill = 100
    return { i, lo, hi, rate, isCurrent, isNext, fill }
  })

  const currentRate = brackets[currentIdx][1]
  const takeaway = nextIdx != null
    ? `You're in the ${fmtPct(currentRate, 0)} bracket — ${fmtUSD(brackets[nextIdx][0] - ordinaryTaxable)} of room until ${fmtPct(brackets[nextIdx][1], 0)}.`
    : `You're in the ${fmtPct(currentRate, 0)} bracket — the top bracket.`

  return (
    <div className="bracket-ladder">
      <h3>Federal bracket position</h3>
      <div className="ladder-rows">
        {rows.map((r) => (
          <div className={`ladder-row${r.isCurrent ? ' current' : ''}${r.isNext ? ' next' : ''}`} key={r.i}>
            <span className="ladder-rate">{fmtPct(r.rate, 0)}</span>
            <div className="ladder-track">
              <div className="ladder-fill" style={{ width: `${r.fill}%` }} />
            </div>
            <span className="ladder-range">
              {fmtUSD(r.lo)}–{r.hi === Infinity ? '+' : fmtUSD(r.hi)}
            </span>
          </div>
        ))}
      </div>
      <p className="ladder-takeaway">{takeaway}</p>
    </div>
  )
}
