import { TAX_DATA, FICA } from './taxData'

// Tax on taxable income given [lowerBound, rate] brackets.
export function bracketTax(taxable, brackets) {
  let tax = 0
  for (let i = 0; i < brackets.length; i++) {
    const [lo, rate] = brackets[i]
    if (taxable <= lo) break
    const hi = i + 1 < brackets.length ? brackets[i + 1][0] : Infinity
    tax += (Math.min(taxable, hi) - lo) * rate
  }
  return tax
}

export function marginalRate(taxable, brackets) {
  let rate = 0
  for (const [lo, r] of brackets) {
    if (taxable > lo) rate = r
    else break
  }
  return taxable > 0 ? rate : 0
}

/**
 * Estimate annual taxes for W-2 wages plus net 1099 self-employment income.
 * QBI deduction is the simple 20% (no SSTB/wage phase-outs at high incomes).
 */
export function computeTaxes({
  year, status, wages = 0, seGross = 0, seExpenses = 0, k401 = 0, rothIra = 0,
}) {
  const data = TAX_DATA[year]
  const se = Math.max(0, seGross - seExpenses)
  const gross = wages + se
  // Roth IRA contributions are after-tax — they don't reduce AGI, unlike 401k.
  const preTax = k401

  // Self-employment tax on 92.35% of net SE profit. The Social Security
  // portion shares one wage base with W-2 wages (wages fill it first).
  const seBase = 0.9235 * se
  const ssRoomLeft = Math.max(0, data.ssWageBase - Math.min(wages, data.ssWageBase))
  const seSocialSecurity = 2 * FICA.ssRate * Math.min(seBase, ssRoomLeft)
  const seMedicare = 2 * FICA.medicareRate * seBase
  const seTax = seSocialSecurity + seMedicare
  const halfSeTax = seTax / 2

  // Employee-side FICA on W-2 wages only; 401k/IRA don't reduce it.
  const socialSecurity = FICA.ssRate * Math.min(wages, data.ssWageBase)
  const medicare = FICA.medicareRate * wages
  const fica = socialSecurity + medicare

  // Additional Medicare 0.9% applies once, to combined wages + SE earnings.
  const additionalMedicare =
    FICA.additionalMedicareRate *
    Math.max(0, wages + seBase - FICA.additionalMedicareThreshold[status])

  const agi = Math.max(0, gross - preTax - halfSeTax)
  const deduction = data.standardDeduction[status]
  const taxableBeforeQbi = Math.max(0, agi - deduction)
  const qbi = Math.max(0, se - halfSeTax)
  const qbiDeduction = 0.2 * Math.min(qbi, taxableBeforeQbi)
  const taxable = Math.max(0, taxableBeforeQbi - qbiDeduction)
  const brackets = data.brackets[status]

  const federal = bracketTax(taxable, brackets)

  const totalTax = federal + fica + seTax + additionalMedicare
  // Spendable cash after taxes AND pre-tax contributions (those are savings, not spending money).
  const takeHome = Math.max(0, gross - totalTax - preTax)

  // Roth IRA eligibility phases out with MAGI (approximated here as AGI).
  const [phaseStart, phaseEnd] = data.rothIraPhaseOut[status]
  const rothStatus = agi >= phaseEnd ? 'ineligible' : agi >= phaseStart ? 'partial' : 'ok'

  return {
    gross, wages, se, seGross, seExpenses, preTax, rothIra, agi, deduction, qbiDeduction, taxable,
    federal, socialSecurity, medicare, fica,
    seTax, halfSeTax, additionalMedicare, totalTax, takeHome, rothStatus,
    effectiveRate: gross > 0 ? totalTax / gross : 0,
    marginalFederalRate: marginalRate(taxable, brackets),
  }
}

/**
 * Year-by-year portfolio projection with monthly compounding.
 * Returns [{ year, balance, contributions }] including year 0.
 */
export function projectGrowth({ startBalance, monthlyContribution, annualReturnPct, years }) {
  const r = annualReturnPct / 100 / 12
  const points = [{ year: 0, balance: startBalance, contributions: startBalance }]
  let balance = startBalance
  let contributions = startBalance
  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + r) + monthlyContribution
      contributions += monthlyContribution
    }
    points.push({ year: y, balance, contributions })
  }
  return points
}
