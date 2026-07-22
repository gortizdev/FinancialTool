import { fmtUSD, fmtPct } from '../lib/format'

export default function TaxSummary({ tax }) {
  return (
    <div className="tiles">
      <div className="tile hero">
        <span className="tile-label">Take-home pay / yr</span>
        <span className="tile-value">{fmtUSD(tax.takeHome)}</span>
        <span className="tile-sub">{fmtUSD(tax.takeHome / 12)} / month</span>
      </div>
      <div className="tile">
        <span className="tile-label">Total tax</span>
        <span className="tile-value">{fmtUSD(tax.totalTax)}</span>
        <span className="tile-sub">federal + FICA + SE</span>
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
  )
}
