import { useRef, useState } from 'react'
import { fmtUSD, fmtUSDCompact } from '../lib/format'

const W = 720
const H = 320
const PAD = { top: 16, right: 96, bottom: 28, left: 56 }

function niceTicks(max, count = 4) {
  const raw = max / count
  const mag = 10 ** Math.floor(Math.log10(raw || 1))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) || mag * 10
  const ticks = []
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(v)
  return ticks
}

// Portfolio balance is the story (accent); cumulative contributions are context (gray).
export default function GrowthChart({ points }) {
  const svgRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)

  const maxY = Math.max(...points.map((p) => p.balance), 1)
  const maxX = points[points.length - 1].year || 1
  const x = (yr) => PAD.left + (yr / maxX) * (W - PAD.left - PAD.right)
  const y = (v) => H - PAD.bottom - (v / maxY) * (H - PAD.top - PAD.bottom)

  const balancePath = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.year)},${y(p.balance)}`).join(' ')
  const contribPath = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.year)},${y(p.contributions)}`).join(' ')
  const areaPath = `${balancePath} L${x(maxX)},${y(0)} L${x(0)},${y(0)} Z`
  const ticks = niceTicks(maxY)

  function onPointerMove(e) {
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const yr = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * maxX)
    setHoverIdx(Math.max(0, Math.min(points.length - 1, yr)))
  }

  const hp = hoverIdx != null ? points[hoverIdx] : null
  const last = points[points.length - 1]

  return (
    <div className="growth-chart">
      <div className="chart-legend">
        <span className="legend-item">
          <span className="line-key" style={{ background: 'var(--series-1)' }} />
          <span className="legend-name">Portfolio value</span>
        </span>
        <span className="legend-item">
          <span className="line-key" style={{ background: 'var(--ink-muted)' }} />
          <span className="legend-name">Total contributed</span>
        </span>
      </div>
      <div className="chart-wrap">
        <svg
          ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img"
          aria-label={`Projected portfolio value over ${maxX} years, ending at ${fmtUSD(last.balance)}`}
          onPointerMove={onPointerMove} onPointerLeave={() => setHoverIdx(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)}
                stroke="var(--gridline)" strokeWidth="1" />
              <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="tick">
                {fmtUSDCompact(t)}
              </text>
            </g>
          ))}
          {points.filter((p) => p.year % Math.ceil(maxX / 8) === 0).map((p) => (
            <text key={p.year} x={x(p.year)} y={H - 8} textAnchor="middle" className="tick">
              {p.year === 0 ? 'now' : `yr ${p.year}`}
            </text>
          ))}
          <line x1={PAD.left} x2={W - PAD.right} y1={y(0)} y2={y(0)}
            stroke="var(--baseline)" strokeWidth="1" />

          <path d={areaPath} fill="var(--series-1)" opacity="0.10" />
          <path d={contribPath} fill="none" stroke="var(--ink-muted)" strokeWidth="2" />
          <path d={balancePath} fill="none" stroke="var(--series-1)" strokeWidth="2" />

          <text x={x(maxX) + 8} y={y(last.balance) + 4} className="end-label accent">
            {fmtUSDCompact(last.balance)}
          </text>
          <text x={x(maxX) + 8} y={y(last.contributions) + 4} className="end-label">
            {fmtUSDCompact(last.contributions)}
          </text>

          {hp && (
            <g>
              <line x1={x(hp.year)} x2={x(hp.year)} y1={PAD.top} y2={H - PAD.bottom}
                stroke="var(--baseline)" strokeWidth="1" />
              <circle cx={x(hp.year)} cy={y(hp.balance)} r="4" fill="var(--series-1)"
                stroke="var(--surface-1)" strokeWidth="2" />
              <circle cx={x(hp.year)} cy={y(hp.contributions)} r="4" fill="var(--ink-muted)"
                stroke="var(--surface-1)" strokeWidth="2" />
            </g>
          )}
        </svg>
        {hp && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(x(hp.year) / W) * 100}%`,
              transform: `translateX(${hp.year > maxX * 0.6 ? '-108%' : '8px'})`,
            }}
          >
            <div className="tt-title">{hp.year === 0 ? 'Today' : `Year ${hp.year}`}</div>
            <div className="tt-row">
              <span className="line-key" style={{ background: 'var(--series-1)' }} />
              <strong>{fmtUSD(hp.balance)}</strong><span>value</span>
            </div>
            <div className="tt-row">
              <span className="line-key" style={{ background: 'var(--ink-muted)' }} />
              <strong>{fmtUSD(hp.contributions)}</strong><span>contributed</span>
            </div>
            <div className="tt-row growth-row">
              <strong>{fmtUSD(hp.balance - hp.contributions)}</strong><span>growth</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
