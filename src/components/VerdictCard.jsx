export default function VerdictCard({ label, ok, okText, badText, children }) {
  return (
    <div className="verdict">
      <div className="verdict-head">
        <span className="verdict-label">{label}</span>
        <span className={`status ${ok ? 'good' : 'bad'}`}>{ok ? okText : badText}</span>
      </div>
      {children}
    </div>
  )
}
