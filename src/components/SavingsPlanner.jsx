import { projectGrowth } from '../lib/taxEngine'
import { fmtUSD, fmtPct } from '../lib/format'
import { MoneyField, SliderField } from './Field'
import GrowthChart from './GrowthChart'
import { useLocalStorage } from '../lib/useLocalStorage'

// 50/30/20 is a common budgeting guideline, applied to monthly take-home.
export default function SavingsPlanner({ tax }) {
  const [savingsPct, setSavingsPct] = useLocalStorage('fintool.savingsPct', 20)
  const [includePreTax, setIncludePreTax] = useLocalStorage('fintool.includePreTax', true)
  const [startBalance, setStartBalance] = useLocalStorage('fintool.startBalance', 0)
  const [returnPct, setReturnPct] = useLocalStorage('fintool.returnPct', 7)
  const [years, setYears] = useLocalStorage('fintool.years', 30)

  const monthlyTakeHome = tax.takeHome / 12
  const monthlySavings = monthlyTakeHome * (savingsPct / 100)
  const monthlyRoth = tax.rothIra / 12
  const monthlyRetirement = (tax.preTax + tax.rothIra) / 12
  const monthlyContribution = monthlySavings + (includePreTax ? monthlyRetirement : 0)
  const needsWants = monthlyTakeHome - monthlySavings - monthlyRoth

  const totalSavingsRate = tax.gross > 0
    ? (monthlySavings * 12 + tax.preTax + tax.rothIra) / tax.gross
    : 0

  const points = projectGrowth({
    startBalance,
    monthlyContribution,
    annualReturnPct: returnPct,
    years,
  })
  const last = points[points.length - 1]

  return (
    <section className="card planner">
      <h2>Savings &amp; investing plan</h2>
      <div className="planner-grid">
        <div className="planner-inputs">
          <SliderField
            label="Save from take-home" min={0} max={60} value={savingsPct}
            onChange={setSavingsPct}
            display={`${savingsPct}% · ${fmtUSD(monthlySavings)}/mo`}
          />
          <p className="guideline">
            50/30/20 guideline on your take-home of {fmtUSD(monthlyTakeHome)}/mo:
            needs ≤ {fmtUSD(monthlyTakeHome * 0.5)}, wants ≤ {fmtUSD(monthlyTakeHome * 0.3)},
            savings ≥ {fmtUSD(monthlyTakeHome * 0.2)}. At {savingsPct}% you'd have{' '}
            {fmtUSD(needsWants)}/mo left for needs + wants
            {monthlyRoth > 0 ? ` (after your ${fmtUSD(monthlyRoth)}/mo Roth IRA)` : ''}.
          </p>
          <label className="check-field">
            <input
              type="checkbox" checked={includePreTax}
              onChange={(e) => setIncludePreTax(e.target.checked)}
            />
            <span>
              Include retirement contributions ({fmtUSD(monthlyRetirement)}/mo) in the projection
            </span>
          </label>
          <MoneyField label="Current invested balance" value={startBalance}
            onChange={setStartBalance} step={1000} />
          <SliderField
            label="Expected annual return" min={0} max={12} step={0.5} value={returnPct}
            onChange={setReturnPct} display={`${returnPct}%`}
          />
          <SliderField
            label="Time horizon" min={1} max={50} value={years}
            onChange={setYears} display={`${years} yrs`}
          />
          <div className="planner-summary">
            <div>
              <span className="tile-label">Investing / month</span>
              <span className="tile-value small">{fmtUSD(monthlyContribution)}</span>
            </div>
            <div>
              <span className="tile-label">Total savings rate</span>
              <span className="tile-value small">{fmtPct(totalSavingsRate)}</span>
              <span className="tile-sub">of gross income</span>
            </div>
            <div>
              <span className="tile-label">Projected in {years} yrs</span>
              <span className="tile-value small">{fmtUSD(last.balance)}</span>
              <span className="tile-sub">{fmtUSD(last.balance - last.contributions)} from growth</span>
            </div>
          </div>
        </div>
        <GrowthChart points={points} />
      </div>
    </section>
  )
}
