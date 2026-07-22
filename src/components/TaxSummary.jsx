import { fmtUSD, fmtPct } from '../lib/format'

export default function TaxSummary({ tax }) {
  return (
    <>
      <div className="hero-stat">
        <span className="hero-stat-label">Take-home / yr</span>
        <div className="hero-stat-value">{fmtUSD(tax.takeHome)}</div>
        <p className="hero-stat-sub">
          of {fmtUSD(tax.gross)} gross · {fmtPct(tax.effectiveRate)} effective tax rate
        </p>
      </div>
      <div className="tiles">
        <div className="tile">
          <span className="tile-label">Total tax</span>
          <span className="tile-value bad">{fmtUSD(tax.totalTax)}</span>
          <span className="tile-sub">federal + FICA + SE{tax.niit > 0 ? ' + NIIT' : ''}</span>
        </div>
        <div className="tile">
          <span className="tile-label">Effective rate</span>
          <span className="tile-value">{fmtPct(tax.effectiveRate)}</span>
          <span className="tile-sub">of gross income</span>
        </div>
        <div className="tile">
          <span className="tile-label">Marginal bracket</span>
          <span className="tile-value">{fmtPct(tax.marginalFederalRate, 0)}</span>
          <span className="tile-sub">federal, next $1 earned</span>
        </div>
      </div>
    </>
  )
}
