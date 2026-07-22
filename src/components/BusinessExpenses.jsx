import { fmtUSD } from '../lib/format'

const blurOnWheel = (e) => e.currentTarget.blur()

export default function BusinessExpenses({ expenses, onChange, seGross }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const net = Math.max(0, seGross - total)

  function updateLabel(id, label) {
    onChange(expenses.map((e) => (e.id === id ? { ...e, label } : e)))
  }

  function updateAmount(id, amount) {
    const clean = Math.max(0, Number(amount) || 0)
    onChange(expenses.map((e) => (e.id === id ? { ...e, amount: clean } : e)))
  }

  function removeExpense(id) {
    onChange(expenses.filter((e) => e.id !== id))
  }

  function addExpense() {
    onChange([...expenses, { id: crypto.randomUUID(), label: '', amount: 0 }])
  }

  return (
    <div className="expenses">
      <h3 className="expenses-title">Business expenses (Schedule C)</h3>
      {expenses.map((e) => (
        <div className="expense-row" key={e.id}>
          <input
            type="text" className="expense-label" placeholder="Software, mileage, home office…"
            value={e.label} onChange={(ev) => updateLabel(e.id, ev.target.value)}
          />
          <div className="field-input money expense-amount">
            <span className="prefix">$</span>
            <input
              type="number" min="0" step={100} inputMode="numeric"
              value={e.amount === 0 ? '' : e.amount} placeholder="0" onWheel={blurOnWheel}
              onChange={(ev) => updateAmount(e.id, ev.target.value)}
            />
          </div>
          <button type="button" className="expense-remove" onClick={() => removeExpense(e.id)}
            aria-label="Remove expense">×</button>
        </div>
      ))}
      <button type="button" className="link-btn expense-add" onClick={addExpense}>+ Add expense</button>
      <p className="expenses-summary">
        Total expenses −{fmtUSD(total)} · Net 1099 income {fmtUSD(net)}
      </p>
    </div>
  )
}
