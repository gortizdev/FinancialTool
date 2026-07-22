import { useEffect } from 'react'
import { useLocalStorage } from '../lib/useLocalStorage'

const ORDER = ['auto', 'light', 'dark']
const LABEL = { auto: '◐ Auto', light: '☀ Light', dark: '☾ Dark' }

export default function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('fintool.theme', 'auto')

  useEffect(() => {
    if (theme === 'auto') {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = theme
    }
  }, [theme])

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]
    setTheme(next)
  }

  return (
    <button type="button" className="ghost-btn" onClick={cycle}
      aria-label={`Theme: ${theme} — click to change`}>
      {LABEL[theme]}
    </button>
  )
}
