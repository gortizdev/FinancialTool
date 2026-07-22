// Number inputs change value on scroll-wheel while focused — blur so a page
// scroll never silently edits a field.
const blurOnWheel = (e) => e.currentTarget.blur()

export function MoneyField({ label, value, onChange, hint, max, step = 500 }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input money">
        <span className="prefix">$</span>
        <input
          type="number" min="0" max={max} step={step} inputMode="numeric"
          value={value === 0 ? '' : value} placeholder="0" onWheel={blurOnWheel}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function PercentField({ label, value, onChange, hint, max = 100, step = 0.5 }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input percent">
        <input
          type="number" min="0" max={max} step={step} inputMode="decimal"
          value={value === 0 ? '' : value} placeholder="0" onWheel={blurOnWheel}
          onChange={(e) => onChange(Math.min(max, Math.max(0, Number(e.target.value) || 0)))}
        />
        <span className="suffix">%</span>
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function CountField({ label, value, onChange, hint, max = 999 }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input">
        <input
          type="number" min="0" max={max} step={1} inputMode="numeric"
          value={value} onWheel={blurOnWheel} onChange={(e) =>
            onChange(Math.min(max, Math.max(0, Math.round(Number(e.target.value) || 0))))}
        />
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      </div>
    </label>
  )
}

export function SliderField({ label, value, onChange, min, max, step = 1, display }) {
  return (
    <label className="field slider-field">
      <span className="field-label">
        {label}
        <span className="slider-value">{display ?? value}</span>
      </span>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}
