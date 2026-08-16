import { useEffect } from 'react'
import { quoteForToday } from '../data/quotes.js'
import { useI18n } from '../lib/i18n.jsx'

export default function OpeningScreen({ onDone }) {
  const { t, lang } = useI18n()
  const quote = quoteForToday(lang)
  const stamp = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  useEffect(() => {
    const timer = setTimeout(onDone, 5200)
    return () => clearTimeout(timer)
    // Show once per launch; quote is keyed to the calendar day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="open">
      <div className="open-mark">T</div>
      <p className="open-name">Tarteeb</p>
      <p className="open-day">{stamp}</p>
      <blockquote>“{quote.line}”</blockquote>
      <cite>{quote.by}</cite>
      <button type="button" onClick={onDone}>{t('continue')}</button>
    </div>
  )
}
