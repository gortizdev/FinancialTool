import { useRef, useState } from 'react'

const PREFIX = 'fintool.'

function collectExport() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(PREFIX)) continue
    try {
      data[key] = JSON.parse(localStorage.getItem(key))
    } catch {
      // skip unparsable entries
    }
  }
  return { version: 1, exportedAt: new Date().toISOString(), data }
}

export default function DataControls() {
  const [error, setError] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const fileInputRef = useRef(null)
  const resetTimerRef = useRef(null)

  function handleExport() {
    const payload = collectExport()
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'financial-planner-backup.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    setError('')
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const payload = JSON.parse(text)
      if (!payload || typeof payload !== 'object' || typeof payload.data !== 'object' || payload.data === null) {
        setError('Invalid backup file')
        return
      }
      const entries = Object.entries(payload.data).filter(([key]) => key.startsWith(PREFIX))
      if (entries.length === 0) {
        setError('Backup file has no recognizable data')
        return
      }
      for (const [key, value] of entries) {
        localStorage.setItem(key, JSON.stringify(value))
      }
      window.location.reload()
    } catch {
      setError('Could not read that file')
    }
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      resetTimerRef.current = setTimeout(() => setConfirmReset(false), 4000)
      return
    }
    clearTimeout(resetTimerRef.current)
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(PREFIX)) keys.push(key)
    }
    keys.forEach((key) => localStorage.removeItem(key))
    window.location.reload()
  }

  return (
    <div className="data-controls">
      <span className="data-hint">Auto-saved in this browser</span>
      <div className="data-controls-row">
        <button type="button" className="ghost-btn" onClick={handleExport}>Export</button>
        <button type="button" className="ghost-btn" onClick={handleImportClick}>Import</button>
        <input ref={fileInputRef} type="file" accept="application/json,.json"
          onChange={handleFileChange} hidden />
        <button type="button" className={`ghost-btn${confirmReset ? ' bad-text' : ''}`}
          onClick={handleReset}>
          {confirmReset ? 'Really reset?' : 'Reset'}
        </button>
      </div>
      {error && <span className="data-error bad-text">{error}</span>}
    </div>
  )
}
