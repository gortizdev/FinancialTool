import { useState } from 'react'
import { fmtUSD, fmtPct } from '../lib/format'

// Where each dollar of gross goes: part-to-whole stacked bar.
// Categorical slots 1–4 in fixed order; every segment is direct-labeled below
// (two light-mode slots sit under 3:1 contrast, so labels are required, not decor).
const SEGMENTS = [
  { key: 'takeHome', label: 'Take-home', varName: '--series-1' },
  { key: 'preTax', label: 'Pre-tax savings', varName: '--series-2' },
  { key: 'federal', label: 'Federal tax', varName: '--series-3' },
  { key: 'ficaState', label: 'FICA + SE tax', varName: '--series-4' },
]

export default function PaycheckBar({ tax }) {
  const [hover, setHover] = useState(null)
  const values = {
    takeHome: tax.takeHome,
    preTax: tax.preTax,
    federal: tax.federal,
    ficaState: tax.fica + tax.seTax + tax.additionalMedicare,
  }
  const total = tax.gross || 1
  const parts = SEGMENTS.filter((s) => values[s.key] > 0)

  return (
    <div className="paycheck">
      <h3>Where each dollar of gross goes</h3>
      <div className="stacked-bar" onPointerLeave={() => setHover(null)}>
        {parts.map((s) => (
          <div
            key={s.key}
            className={`bar-seg${hover === s.key ? ' hovered' : ''}`}
            style={{ flexGrow: values[s.key], background: `var(${s.varName})` }}
            onPointerEnter={() => setHover(s.key)}
            tabIndex={0}
            onFocus={() => setHover(s.key)}
            onBlur={() => setHover(null)}
            aria-label={`${s.label}: ${fmtUSD(values[s.key])}`}
          >
            {hover === s.key && (
              <div className="seg-tooltip" role="status">
                <strong>{fmtUSD(values[s.key])}</strong>
                <span>{s.label} · {fmtPct(values[s.key] / total)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bar-legend">
        {parts.map((s) => (
          <div className="legend-item" key={s.key}>
            <span className="swatch" style={{ background: `var(${s.varName})` }} />
            <span className="legend-name">{s.label}</span>
            <span className="legend-value">
              {fmtUSD(values[s.key])} · {fmtPct(values[s.key] / total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
