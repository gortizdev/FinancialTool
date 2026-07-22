# FinancialTool

A personal financial planner for estimating US federal taxes and projecting savings, built as a static React app.

## Features

- **Federal tax estimate** for combined W-2 + 1099 contracting income, including SE tax, the half-SE deduction, a simplified 20% QBI deduction, and Additional Medicare tax.
- **Pay-stub-driven year-end projection** — enter your latest stub date, pay frequency, gross & federal withholding per check, and YTD figures to get projected year-end wages and a withholding shortfall/overage verdict, with a suggested W-4 step 4c fix.
- **401(k) paycheck election planner** with employer-match math.
- **Roth IRA contribution planner** with income phase-out warnings.
- **Accounts tab** for checking/savings/credit cards, with an emergency-fund meter.
- **Savings plan tab** with a compound-growth projection chart.

All inputs auto-save to your browser's `localStorage` as you type.

## Getting started

```bash
npm install
npm run dev
```

## Building for production

```bash
npm run build
```

This produces a fully static site in `dist/`, deployable to any static host (e.g. Cloudflare Pages, Netlify, Vercel).

## Data & privacy

This app has no backend. All data you enter stays in your browser's `localStorage` (under `fintool.*` keys) and is never sent anywhere. Use the header's **Export** button to download a JSON backup, and **Import** to restore it (e.g. when moving to a new device or browser). **Reset** clears all stored data.

## Updating tax data

Tax-year figures (brackets, standard deduction, SE tax thresholds, etc.) are hardcoded per year in `src/lib/taxData.js`. When the IRS publishes new figures each fall, add or update the relevant year's entry in that file.

## Known simplifications

- Federal taxes only — this tool is built for Florida residents and does not calculate any state income tax.
- Standard deduction only; no itemized deductions.
- No tax credits or capital gains handling.
- QBI deduction is simplified (flat 20%, no phase-outs).

## Disclaimer

This tool provides rough estimates for personal financial planning only. It is not tax advice or investment advice. Consult a qualified professional for your actual tax and financial decisions.
