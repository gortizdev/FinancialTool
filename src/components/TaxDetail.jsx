import { fmtUSD } from '../lib/format'

export default function TaxDetail({ tax }) {
  const rows = [
    ['W-2 wages', tax.wages],
    ['1099 gross receipts', tax.seGross],
    ['Business expenses', -tax.seExpenses],
    ['Net 1099 income', tax.se],
    ['Pre-tax 401(k) contributions', -tax.preTax],
    ['½ self-employment tax deduction', -tax.halfSeTax],
    ['Adjusted gross income', tax.agi],
    ['Standard deduction', -tax.deduction],
    ['QBI deduction (20%, simplified)', -tax.qbiDeduction],
    ['Federal taxable income', tax.taxable],
    ['Federal income tax', tax.federal],
    ['Social Security (6.2% on wages)', tax.socialSecurity],
    ['Medicare (1.45% on wages)', tax.medicare],
    ['Self-employment tax (15.3%)', tax.seTax],
    ['Additional Medicare (0.9%)', tax.additionalMedicare],
  ]
  // Hide zero rows except the structural ones that anchor the walk-through.
  const structural = ['W-2 wages', 'Adjusted gross income', 'Standard deduction', 'Federal taxable income', 'Federal income tax']
  const visible = rows.filter(([label, value]) => {
    if (['1099 gross receipts', 'Net 1099 income'].includes(label)) return tax.seGross > 0
    return value !== 0 || structural.includes(label)
  })
  return (
    <details className="tax-detail">
      <summary>Full breakdown</summary>
      <table>
        <tbody>
          {visible.map(([label, value]) => (
            <tr key={label} className={value < 0 ? 'neg' : ''}>
              <td>{label}</td>
              <td className="num">{value < 0 ? `−${fmtUSD(-value)}` : fmtUSD(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
