import { fmtUSD, fmtUSDCompact } from '../lib/format'

// Composition of total tax by type. Colors are fixed per category so the
// same slice always reads the same way across scenarios.
const SEGMENT_DEFS = [
  { key: 'fed', label: 'Federal income tax', varName: '--series-1' },
  { key: 'pref', label: 'Capital gains & dividends tax', varName: '--series-2' },
  { key: 'ss', label: 'Social Security', varName: '--series-3' },
  { key: 'med', label: 'Medicare', varName: '--series-4' },
  { key: 'se', label: 'Self-employment tax', varName: '--baseline' },
  { key: 'niit', label: 'Net investment income tax', varName: '--bad-text' },
]

const R = 80
const C = 2 * Math.PI * R

export default function TaxDonut({ tax }) {
  if (!(tax.totalTax > 0)) return null

  const values = {
    fed: tax.federal - tax.prefTax,
    pref: tax.prefTax,
    ss: tax.socialSecurity,
    med: tax.medicare + tax.additionalMedicare,
    se: tax.seTax,
    niit: tax.niit,
  }
  const parts = SEGMENT_DEFS.filter((s) => values[s.key] > 0.5)

  let cursor = 0
  const arcs = parts.map((s) => {
    const value = values[s.key]
    const len = (value / tax.totalTax) * C
    const gap = parts.length > 1 ? 3 : 0
    const dash = Math.max(len - gap, 0)
    const offset = -cursor
    cursor += len
    return { ...s, value, dash, offset }
  })

  return (
    <div className="tax-donut">
      <h3>Where each tax dollar goes</h3>
      <div className="donut-wrap">
        <svg viewBox="0 0 200 200" role="img"
          aria-label={`Total tax ${fmtUSD(tax.totalTax)}, broken down by type`}>
          <g transform="rotate(-90 100 100)">
            {arcs.map((a) => (
              <circle key={a.key} cx="100" cy="100" r={R} fill="none"
                stroke={`var(${a.varName})`} strokeWidth="28"
                strokeDasharray={`${a.dash} ${C - a.dash}`} strokeDashoffset={a.offset}>
                <title>{`${a.label}: ${fmtUSD(a.value)}`}</title>
              </circle>
            ))}
          </g>
          <text x="100" y="96" textAnchor="middle" className="donut-total">
            {fmtUSDCompact(tax.totalTax)}
          </text>
          <text x="100" y="116" textAnchor="middle" className="donut-caption">
            total tax
          </text>
        </svg>
        <div className="bar-legend donut-legend">
          {arcs.map((a) => (
            <div className="legend-item" key={a.key}>
              <span className="swatch" style={{ background: `var(${a.varName})` }} />
              <span className="legend-name">{a.label}</span>
              <span className="legend-value">{fmtUSD(a.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
