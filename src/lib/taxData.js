// Federal tax parameters by tax year.
// Brackets are [lowerBound, rate] pairs on TAXABLE income (after deductions).
// 2025 values reflect OBBBA-adjusted figures; 2026 values from Rev. Proc. 2025-32.
// These are estimates for planning — verify against IRS publications before filing.

export const FILING_STATUSES = [
  { id: 'single', label: 'Single' },
  { id: 'mfj', label: 'Married filing jointly' },
  { id: 'hoh', label: 'Head of household' },
]

export const TAX_DATA = {
  2025: {
    standardDeduction: { single: 15750, mfj: 31500, hoh: 23625 },
    brackets: {
      single: [
        [0, 0.10], [11925, 0.12], [48475, 0.22], [103350, 0.24],
        [197300, 0.32], [250525, 0.35], [626350, 0.37],
      ],
      mfj: [
        [0, 0.10], [23850, 0.12], [96950, 0.22], [206700, 0.24],
        [394600, 0.32], [501050, 0.35], [751600, 0.37],
      ],
      hoh: [
        [0, 0.10], [17000, 0.12], [64850, 0.22], [103350, 0.24],
        [197300, 0.32], [250500, 0.35], [626350, 0.37],
      ],
    },
    ssWageBase: 176100,
    limits: { k401: 23500, ira: 7000 },
    rothIraPhaseOut: { single: [150000, 165000], mfj: [236000, 246000], hoh: [150000, 165000] },
  },
  2026: {
    standardDeduction: { single: 16100, mfj: 32200, hoh: 24150 },
    brackets: {
      single: [
        [0, 0.10], [12400, 0.12], [50400, 0.22], [105700, 0.24],
        [201775, 0.32], [256225, 0.35], [640600, 0.37],
      ],
      mfj: [
        [0, 0.10], [24800, 0.12], [100800, 0.22], [211400, 0.24],
        [403550, 0.32], [512450, 0.35], [768700, 0.37],
      ],
      hoh: [
        [0, 0.10], [17700, 0.12], [67450, 0.22], [105700, 0.24],
        [201775, 0.32], [256200, 0.35], [640600, 0.37],
      ],
    },
    ssWageBase: 184500,
    limits: { k401: 24500, ira: 7500 },
    rothIraPhaseOut: { single: [153000, 168000], mfj: [242000, 252000], hoh: [153000, 168000] },
  },
}

export const FICA = {
  ssRate: 0.062,
  medicareRate: 0.0145,
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: { single: 200000, mfj: 250000, hoh: 200000 },
}
