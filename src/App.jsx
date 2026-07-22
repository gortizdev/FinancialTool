import { useState } from 'react'
import { TAX_DATA, FILING_STATUSES } from './lib/taxData'
import { computeTaxes } from './lib/taxEngine'
import { fmtUSD, fmtPct } from './lib/format'
import { MoneyField, SelectField } from './components/Field'
import TaxSummary from './components/TaxSummary'
import PaycheckBar from './components/PaycheckBar'
import BracketLadder from './components/BracketLadder'
import TaxDonut from './components/TaxDonut'
import TaxDetail from './components/TaxDetail'
import SavingsPlanner from './components/SavingsPlanner'
import VerdictCard from './components/VerdictCard'
import Paycheck401k from './components/Paycheck401k'
import BusinessExpenses from './components/BusinessExpenses'
import Accounts from './components/Accounts'
import DataControls from './components/DataControls'
import ThemeToggle from './components/ThemeToggle'
import { estimateRemaining, checksRemaining, FREQS } from './lib/payroll'
import { useLocalStorage } from './lib/useLocalStorage'

function todayStr() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

const YEARS = Object.keys(TAX_DATA).map(Number).sort()

const TABS = [
  { id: 'taxes', label: 'Income & taxes' },
  { id: 'paycheck', label: 'Paycheck' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'plan', label: 'Savings plan' },
]

const ICON_PROPS = {
  width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round',
  strokeLinejoin: 'round', 'aria-hidden': true,
}

function IconTaxes() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="1.5" width="10" height="13" rx="1" />
      <line x1="5.5" y1="5" x2="10.5" y2="5" />
      <line x1="5.5" y1="8" x2="10.5" y2="8" />
      <line x1="5.5" y1="11" x2="8.5" y2="11" />
    </svg>
  )
}

function IconPaycheck() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="1.5" y="4" width="13" height="8" rx="1.4" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

function IconAccounts() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M1.5 6 8 1.5 14.5 6" />
      <line x1="1.5" y1="6" x2="14.5" y2="6" />
      <line x1="3" y1="6" x2="3" y2="13" />
      <line x1="6.3" y1="6" x2="6.3" y2="13" />
      <line x1="9.7" y1="6" x2="9.7" y2="13" />
      <line x1="13" y1="6" x2="13" y2="13" />
      <line x1="1.5" y1="14.5" x2="14.5" y2="14.5" />
    </svg>
  )
}

function IconPlan() {
  return (
    <svg {...ICON_PROPS}>
      <polyline points="1.5,13 5.5,8.5 8.5,10.5 14.5,3" />
      <polyline points="11,3 14.5,3 14.5,6.5" />
    </svg>
  )
}

const TAB_ICONS = { taxes: IconTaxes, paycheck: IconPaycheck, accounts: IconAccounts, plan: IconPlan }

export default function App() {
  const [tab, setTab] = useState('taxes')
  const [year, setYear] = useLocalStorage('fintool.year', 2026)
  const [status, setStatus] = useLocalStorage('fintool.status', 'single')
  const [seGross, setSeGross] = useLocalStorage('fintool.seGross', 0)
  const [expenses, setExpenses] = useLocalStorage('fintool.expenses', [])
  const [k401, setK401] = useLocalStorage('fintool.k401', 0)
  const [rothIra, setRothIra] = useLocalStorage('fintool.rothIra', 0)
  const [interest, setInterest] = useLocalStorage('fintool.interest', 0)
  const [qualDividends, setQualDividends] = useLocalStorage('fintool.qualDividends', 0)
  const [ltcg, setLtcg] = useLocalStorage('fintool.ltcg', 0)
  const [stcg, setStcg] = useLocalStorage('fintool.stcg', 0)
  const [freq, setFreq] = useLocalStorage('fintool.freq', '26')
  const [remaining, setRemaining] = useLocalStorage('fintool.remaining', estimateRemaining(26))
  const [stubDate, setStubDate] = useLocalStorage('fintool.stubDate', todayStr())
  const [grossPerCheck, setGrossPerCheck] = useLocalStorage('fintool.grossPerCheck', 0)
  const [fedPerCheck, setFedPerCheck] = useLocalStorage('fintool.fedPerCheck', 0)
  const [ytdGross, setYtdGross] = useLocalStorage('fintool.ytdGross', 0)
  const [ytdFedWh, setYtdFedWh] = useLocalStorage('fintool.ytdFedWh', 0)
  const [estPayments, setEstPayments] = useLocalStorage('fintool.estPayments', 0)
  const [accounts, setAccounts] = useLocalStorage('fintool.accounts', {
    checking: [], savings: [], cards: [],
  })

  function changeFreq(id) {
    setFreq(id)
    setRemaining(checksRemaining(stubDate, Number(id)))
  }

  function changeStubDate(value) {
    setStubDate(value)
    setRemaining(checksRemaining(value, Number(freq)))
  }

  const limits = TAX_DATA[year].limits
  const seExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const periods = Number(freq)
  const projectedWages = ytdGross + grossPerCheck * remaining
  const wages = projectedWages
  const projWithholding = ytdFedWh + fedPerCheck * remaining + estPayments
  const inputs = {
    year, status, wages, seGross, seExpenses, k401, rothIra,
    interest, qualDividends, ltcg, stcg,
  }
  const tax = computeTaxes(inputs)
  // Tax attributable to the 1099 income — what to set aside from contracting pay.
  const seTaxShare = seGross > 0
    ? tax.totalTax - computeTaxes({ ...inputs, seGross: 0, seExpenses: 0 }).totalTax
    : 0

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Financial Planner</h1>
          <p className="tagline">Estimate your taxes, then plan what to save and invest.</p>
        </div>
        <div className="header-tools">
          <ThemeToggle />
          <DataControls />
        </div>
      </header>

      <div role="tablist" aria-label="Sections" className="tab-bar">
        {TABS.map((t) => {
          const Icon = TAB_ICONS[t.id]
          return (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
              aria-label={t.label}
              className={`tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}>
              <Icon />
              <span className="tab-label">{t.label}</span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="tab-panel" hidden={tab !== 'taxes'}>
        <div className="top-grid">
          <section className="card inputs">
            <h2>Your income</h2>
            <div className="field-row">
              <SelectField label="Tax year" value={String(year)}
                onChange={(v) => setYear(Number(v))}
                options={YEARS.map((y) => ({ id: String(y), label: String(y) }))} />
              <SelectField label="Filing status" value={status} onChange={setStatus}
                options={FILING_STATUSES} />
            </div>
            <h3 className="expenses-title">Latest pay stub</h3>
            <div className="field-row">
              <label className="field">
                <span className="field-label">Paycheck date</span>
                <div className="field-input">
                  <input type="date" value={stubDate}
                    onChange={(e) => changeStubDate(e.target.value)} />
                </div>
              </label>
              <SelectField label="Pay frequency" value={freq} onChange={changeFreq}
                options={FREQS} />
            </div>
            <div className="field-row">
              <MoneyField label="Gross pay per paycheck" value={grossPerCheck}
                onChange={setGrossPerCheck} step={100} />
              <MoneyField label="Federal tax withheld per paycheck" value={fedPerCheck}
                onChange={setFedPerCheck} step={10} />
            </div>
            <div className="field-row">
              <MoneyField label="YTD gross wages" value={ytdGross}
                onChange={setYtdGross} step={1000} />
              <MoneyField label="YTD federal withheld" value={ytdFedWh}
                onChange={setYtdFedWh} step={100} />
            </div>
            <MoneyField label="Estimated tax payments made or planned" value={estPayments}
              onChange={setEstPayments} step={100}
              hint="Quarterly 1040-ES for 1099 income" />
            <p className="guideline">
              {remaining} checks left this year → projected{' '}
              <strong>{fmtUSD(projectedWages)}</strong> year-end W-2 wages
            </p>
            <MoneyField label="1099 gross contracting income / yr" value={seGross}
              onChange={setSeGross} step={1000}
              hint="Before business expenses" />
            {seGross > 0 && (
              <BusinessExpenses expenses={expenses} onChange={setExpenses} seGross={seGross} />
            )}
            <h3 className="expenses-title">Investment income</h3>
            <div className="field-row">
              <MoneyField label="Interest & ordinary dividends" value={interest}
                onChange={setInterest} step={100} hint="Taxed as ordinary income" />
              <MoneyField label="Qualified dividends" value={qualDividends}
                onChange={setQualDividends} step={100} hint="Taxed at capital-gains rates" />
            </div>
            <div className="field-row">
              <MoneyField label="Long-term capital gains" value={ltcg}
                onChange={setLtcg} step={100} hint="Held over a year · 0/15/20% rates" />
              <MoneyField label="Short-term capital gains" value={stcg}
                onChange={setStcg} step={100} hint="Held under a year · taxed as ordinary income" />
            </div>
            <span className="field-hint">
              Enter net gains — losses and loss carryovers aren't modeled.
            </span>
            <MoneyField label="401(k) contribution / yr" value={k401} onChange={setK401}
              hint={`${year} limit: ${fmtUSD(limits.k401)}`} max={limits.k401} />
            <MoneyField label="Roth IRA / yr" value={rothIra} onChange={setRothIra}
              hint={`${year} limit: ${fmtUSD(limits.ira)} · after-tax — doesn't reduce your taxable income`}
              max={limits.ira} />
            {(rothIra > 0 || tax.rothStatus === 'ineligible') && tax.rothStatus !== 'ok' && (
              <span className="field-hint bad-text">
                {tax.rothStatus === 'partial'
                  ? `Heads up: your income is in the Roth IRA phase-out range (${fmtUSD(TAX_DATA[year].rothIraPhaseOut[status][0])}–${fmtUSD(TAX_DATA[year].rothIraPhaseOut[status][1])}) — your allowed contribution is reduced.`
                  : `Heads up: above ${fmtUSD(TAX_DATA[year].rothIraPhaseOut[status][1])} MAGI, direct Roth IRA contributions aren't allowed (a 'backdoor' conversion is the common workaround).`}
              </span>
            )}
          </section>

          <section className="card results">
            <h2>Tax estimate · {year}</h2>
            <TaxSummary tax={tax} />
            {(ytdGross > 0 || grossPerCheck > 0) && (() => {
              const liability = tax.federal + tax.seTax + tax.additionalMedicare + tax.niit
              const diff = projWithholding - liability
              const short = diff < -1
              const perCheck = remaining > 0 ? -diff / remaining : 0
              return (
                <>
                  <VerdictCard label="Year-end federal tax check" ok={!short}
                    okText="✓ On track" badText="⚠ Shortfall">
                    <div className="verdict-nums">
                      Projected withholding + payments <strong>{fmtUSD(projWithholding)}</strong>{' '}
                      vs estimated liability <strong>{fmtUSD(liability)}</strong> →{' '}
                      <strong className={short ? 'bad-text' : 'good-text'}>
                        {short ? `${fmtUSD(-diff)} short` : `${fmtUSD(diff)} over`}
                      </strong>
                    </div>
                    {short ? (
                      <p className="verdict-fix">
                        {remaining > 0 ? (
                          <>To close the gap, withhold about <strong>{fmtUSD(perCheck)}</strong>{' '}
                          extra per remaining paycheck (W-4 step 4c) — or make estimated
                          payments totaling {fmtUSD(-diff)}.</>
                        ) : (
                          <>No paychecks left this year — cover the gap with a 1040-ES
                          estimated payment of {fmtUSD(-diff)}.</>
                        )}
                      </p>
                    ) : (
                      <p className="verdict-fix">
                        You're projected to overpay by {fmtUSD(diff)} — you'd get it back as a
                        refund when you file.
                      </p>
                    )}
                  </VerdictCard>
                  <p className="safe-harbor">
                    Penalty safe harbor: no underpayment penalty if your withholding +
                    estimated payments reach 90% of this year's tax, or 100% of last
                    year's (110% if last year's AGI was over $150k).
                  </p>
                </>
              )
            })()}
            {seGross > 0 && (
              <p className="se-callout">
                Your 1099 work adds <strong>{fmtUSD(seTaxShare)}</strong> in tax
                (self-employment tax + income tax). Set aside about{' '}
                <strong>{fmtPct(tax.se > 0 ? seTaxShare / tax.se : 0, 0)}</strong> of each
                contracting payment — roughly <strong>{fmtUSD(seTaxShare / 4)}</strong> per
                quarterly estimated-tax payment.
              </p>
            )}
            <PaycheckBar tax={tax} />
            <BracketLadder year={year} status={status} tax={tax} />
            <TaxDonut tax={tax} />
            <TaxDetail tax={tax} />
          </section>
        </div>
      </div>

      <div role="tabpanel" className="tab-panel" hidden={tab !== 'paycheck'}>
        <Paycheck401k wages={wages} k401Target={k401} setK401={setK401}
          limit={limits.k401} periods={periods} remaining={remaining}
          freq={freq} onFreqChange={changeFreq} onRemainingChange={setRemaining}
          perCheckGross={grossPerCheck} />
      </div>

      <div role="tabpanel" className="tab-panel" hidden={tab !== 'accounts'}>
        <Accounts accounts={accounts} onChange={setAccounts} tax={tax} />
      </div>

      <div role="tabpanel" className="tab-panel" hidden={tab !== 'plan'}>
        <SavingsPlanner tax={tax} />
      </div>

      <footer>
        Estimates use the {year} federal standard deduction and brackets, no state
        income tax (Florida), the simplified 20% QBI deduction (no high-income
        phase-outs), and long-term gains and qualified dividends at 0/15/20% with
        NIIT. For planning only — not tax or investment advice.
      </footer>
    </div>
  )
}
