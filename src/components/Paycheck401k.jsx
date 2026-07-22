import { fmtUSD, fmtPct } from '../lib/format'
import { FREQS } from '../lib/payroll'
import { MoneyField, PercentField, SelectField, CountField } from './Field'
import VerdictCard from './VerdictCard'
import { useLocalStorage } from '../lib/useLocalStorage'

/**
 * Turn a 401(k) goal into the payroll election % to actually set,
 * and check the current election against the target, the IRS limit,
 * and the employer match.
 */
export default function Paycheck401k({
  wages, k401Target, setK401, limit, periods, remaining,
  freq, onFreqChange, onRemainingChange, perCheckGross,
}) {
  const [electionPct, setElectionPct] = useLocalStorage('fintool.electionPct', 0)
  const [ytd, setYtd] = useLocalStorage('fintool.k401Ytd', 0)
  const [matchRate, setMatchRate] = useLocalStorage('fintool.matchRate', 100)
  const [matchUpTo, setMatchUpTo] = useLocalStorage('fintool.matchUpTo', 0)
  const [maxMatchPct, setMaxMatchPct] = useLocalStorage('fintool.maxMatchPct', 0)

  const grossPerCheck = perCheckGross > 0 ? perCheckGross : (periods > 0 ? wages / periods : 0)
  const perCheckNow = (electionPct / 100) * grossPerCheck
  const uncapped = ytd + perCheckNow * remaining
  const projected = Math.min(limit, uncapped)
  const hitsLimitEarly = uncapped > limit && remaining > 0

  const pctFor = (annualTarget) => {
    if (grossPerCheck <= 0 || remaining <= 0) return null
    const needPerCheck = Math.max(0, annualTarget - ytd) / remaining
    return { pct: (needPerCheck / grossPerCheck) * 100, perCheck: needPerCheck }
  }
  const forTarget = k401Target > 0 ? pctFor(k401Target) : null
  const forMax = pctFor(limit)

  // Match is computed per paycheck the way most plans apply it. The optional
  // max caps the employer's total match as a % of pay ("50% of the first 8%,
  // capped at 3% of pay").
  const capPct = maxMatchPct > 0 ? maxMatchPct : Infinity
  const matchedPct = Math.min(electionPct, matchUpTo)
  const currentMatchOfPay = Math.min((matchRate / 100) * matchedPct, capPct)
  const fullMatchOfPay = Math.min((matchRate / 100) * matchUpTo, capPct)
  const annualMatch = (currentMatchOfPay / 100) * wages
  const missedMatch = ((fullMatchOfPay - currentMatchOfPay) / 100) * wages
  // Smallest election that still earns the full available match.
  const minElectionForFull = matchRate > 0
    ? Math.min(matchUpTo, (fullMatchOfPay / matchRate) * 100)
    : matchUpTo

  const targetShort = k401Target > 0 && projected < k401Target - 1
  const syncable = Math.abs(projected - k401Target) > 1 && projected > 0

  return (
    <section className="card k401">
      <h2>401(k) paycheck allocation</h2>
      <p className="guideline">
        {perCheckGross > 0 ? (
          <>Gross pay ≈ <strong>{fmtUSD(grossPerCheck)}</strong> per check (from your pay
          stub). Elections are set as a % of gross in most payroll systems.</>
        ) : (
          <>Gross pay ≈ <strong>{fmtUSD(grossPerCheck)}</strong> per check ({periods}/yr
          from your W-2 wages). Elections are set as a % of gross in most payroll systems.</>
        )}
      </p>
      <div className="stub-grid">
        <SelectField label="Pay frequency" value={freq} onChange={onFreqChange}
          options={FREQS} />
        <CountField label="Paychecks left this year" value={remaining}
          onChange={onRemainingChange}
          hint="Projection uses only these remaining checks" />
        <PercentField label="Current election (% of gross)" value={electionPct}
          onChange={setElectionPct} max={90}
          hint={`= ${fmtUSD(perCheckNow)} per check`} />
        <MoneyField label="401(k) contributed YTD" value={ytd}
          onChange={setYtd} step={100} hint='Stub "YTD" column' />
        <PercentField label="Employer match rate" value={matchRate}
          onChange={setMatchRate} max={200} step={25}
          hint="e.g. 100 = dollar-for-dollar, 50 = fifty cents per $1" />
        <PercentField label="…on the first % of pay" value={matchUpTo}
          onChange={setMatchUpTo} max={15}
          hint="0 if no employer match" />
        <PercentField label="Max match (% of pay)" value={maxMatchPct}
          onChange={setMaxMatchPct} max={15}
          hint="Cap on the total employer match · 0 = no cap" />
      </div>

      <VerdictCard label="Projected by Dec 31 at your current election"
        ok={!targetShort} okText="✓ On track" badText="⚠ Below your plan">
        <div className="verdict-nums">
          <strong>{fmtUSD(projected)}</strong> contributed
          {k401Target > 0 && <> vs your planned <strong>{fmtUSD(k401Target)}</strong></>}
          {' '}· limit {fmtUSD(limit)}
          {hitsLimitEarly && ' — you would hit the limit before year-end; payroll stops there'}
        </div>
        {forTarget && targetShort && (
          <p className="verdict-fix">
            To reach {fmtUSD(k401Target)} by Dec 31, set your election to about{' '}
            <strong>{forTarget.pct.toFixed(1)}%</strong> ({fmtUSD(forTarget.perCheck)}/check)
            for the remaining {remaining} checks.
          </p>
        )}
        {forMax && forMax.pct > 0 && (
          <p className="verdict-fix">
            To max the {fmtUSD(limit)} limit this year: <strong>{forMax.pct.toFixed(1)}%</strong>{' '}
            ({fmtUSD(forMax.perCheck)}/check).
          </p>
        )}
        {syncable && (
          <button className="link-btn" onClick={() => setK401(Math.round(projected))}>
            Use projected {fmtUSD(projected)} as the 401(k) amount in the tax estimate
          </button>
        )}
      </VerdictCard>

      {matchUpTo > 0 && (
        <VerdictCard label="Employer match" ok={!(missedMatch > 0)}
          okText="✓ Full match captured" badText="⚠ Leaving match behind">
          <div className="verdict-nums">
            ≈ <strong>{fmtUSD(annualMatch)}</strong>/yr in employer match at your
            current election
            {missedMatch > 0 && (
              <> — contributing below {fmtPct(minElectionForFull / 100, 1)} forfeits about{' '}
              <strong className="bad-text">{fmtUSD(missedMatch)}</strong>/yr of free money</>
            )}
          </div>
          {missedMatch > 0 && (
            <p className="verdict-fix">
              Set your election to at least <strong>{minElectionForFull.toFixed(1)}%</strong> to
              capture the full match before optimizing anything else.
            </p>
          )}
        </VerdictCard>
      )}
    </section>
  )
}
