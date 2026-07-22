import { fmtUSD } from '../lib/format'

const blurOnWheel = (e) => e.currentTarget.blur()

const GROUPS = [
  { key: 'checking', title: 'Checking', placeholder: 'Chase checking…', addLabel: '+ Add account' },
  { key: 'savings', title: 'Savings', placeholder: 'High-yield savings…', addLabel: '+ Add account' },
  { key: 'cards', title: 'Credit cards', placeholder: 'Chase Sapphire…', addLabel: '+ Add card' },
]

function AccountGroup({ title, placeholder, addLabel, rows, onChange }) {
  function updateLabel(id, label) {
    onChange(rows.map((r) => (r.id === id ? { ...r, label } : r)))
  }

  function updateAmount(id, amount) {
    const clean = Math.max(0, Number(amount) || 0)
    onChange(rows.map((r) => (r.id === id ? { ...r, amount: clean } : r)))
  }

  function removeRow(id) {
    onChange(rows.filter((r) => r.id !== id))
  }

  function addRow() {
    onChange([...rows, { id: crypto.randomUUID(), label: '', amount: 0 }])
  }

  return (
    <div className="account-group">
      <h3 className="expenses-title">{title}</h3>
      {rows.map((r) => (
        <div className="expense-row" key={r.id}>
          <input
            type="text" className="expense-label" placeholder={placeholder}
            value={r.label} onChange={(ev) => updateLabel(r.id, ev.target.value)}
          />
          <div className="field-input money expense-amount">
            <span className="prefix">$</span>
            <input
              type="number" min="0" step={100} inputMode="numeric"
              value={r.amount === 0 ? '' : r.amount} placeholder="0" onWheel={blurOnWheel}
              onChange={(ev) => updateAmount(r.id, ev.target.value)}
            />
          </div>
          <button type="button" className="expense-remove" onClick={() => removeRow(r.id)}
            aria-label="Remove account">×</button>
        </div>
      ))}
      <button type="button" className="link-btn expense-add" onClick={addRow}>{addLabel}</button>
    </div>
  )
}

export default function Accounts({ accounts, onChange, tax }) {
  const totalChecking = accounts.checking.reduce((sum, r) => sum + r.amount, 0)
  const totalSavings = accounts.savings.reduce((sum, r) => sum + r.amount, 0)
  const totalCash = totalChecking + totalSavings
  const cardDebt = accounts.cards.reduce((sum, r) => sum + r.amount, 0)
  const netCash = totalCash - cardDebt

  const monthlyTakeHome = tax.takeHome / 12
  const months = monthlyTakeHome > 0 ? totalCash / monthlyTakeHome : 0
  const fillPct = Math.min(months / 6, 1) * 100

  function setGroup(key, rows) {
    onChange({ ...accounts, [key]: rows })
  }

  return (
    <section className="card accounts">
      <h2>Accounts</h2>

      <div className="tiles">
        <div className="tile">
          <span className="tile-label">Total cash</span>
          <span className="tile-value">{fmtUSD(totalCash)}</span>
        </div>
        <div className="tile">
          <span className="tile-label">Card debt</span>
          <span className={`tile-value${cardDebt > 0 ? ' bad-text' : ''}`}>{fmtUSD(cardDebt)}</span>
        </div>
        <div className="tile">
          <span className="tile-label">Net cash</span>
          <span className="tile-value">{fmtUSD(netCash)}</span>
        </div>
      </div>

      {GROUPS.map((g) => (
        <AccountGroup
          key={g.key}
          title={g.title}
          placeholder={g.placeholder}
          addLabel={g.addLabel}
          rows={accounts[g.key]}
          onChange={(rows) => setGroup(g.key, rows)}
        />
      ))}

      <div className="ef-meter">
        <h3 className="expenses-title">Emergency fund</h3>
        <div className="ef-track">
          <div className="ef-fill" style={{ width: `${fillPct}%` }} />
          <div className="ef-tick" style={{ left: '50%' }} />
          <div className="ef-tick" style={{ left: '100%' }} />
        </div>
        <div className="ef-tick-labels">
          <span style={{ left: '50%' }}>3 mo</span>
          <span style={{ left: '100%' }}>6 mo</span>
        </div>
        <p className="ef-text">{months.toFixed(1)} months of take-home covered</p>
        {months < 3 && (
          <p className="status bad-text">⚠ Below the 3-month guideline</p>
        )}
        {months >= 3 && months <= 6 && (
          <p className="status good-text">✓ Within the 3–6 month guideline</p>
        )}
        {months > 6 && (
          <>
            <p className="status good-text">✓ Fully funded</p>
            <p className="guideline">— beyond 6 months, extra cash could be working in investments</p>
          </>
        )}
      </div>

      {cardDebt > 0 && (
        <p className="se-callout">
          Card APRs (often 20%+) usually exceed expected market returns, so the common
          guideline is to pay down high-APR balances before investing extra cash.
        </p>
      )}
    </section>
  )
}
