import { useState } from 'react'
import { SCHEMES } from '../lib/savingPlan.js'
import { quoteForScheme } from '../data/quotes.js'
import { useI18n } from '../lib/i18n.jsx'

const TONE = {
  '50-30-20': { accent: '#118BE3', wash: 'rgb(17 139 227 / 0.16)' },
  '40-30-30': { accent: '#16C784', wash: 'rgb(22 199 132 / 0.16)' },
  '40-20-40': { accent: '#4554E5', wash: 'rgb(69 84 229 / 0.18)' },
  '60-20-20': { accent: '#F5C451', wash: 'rgb(245 196 81 / 0.16)' }
}

export default function SchemePicker({ value, onPick }) {
  const { t, lang } = useI18n()
  const [note, setNote] = useState(null)
  const quote = note ? quoteForScheme(note, lang) : null

  function pick(id) {
    onPick(id)
    setNote(id)
  }

  return (
    <div className="plan-schemes">
      <div className="plan-scheme-grid">
        {SCHEMES.map((row) => {
          const tone = TONE[row.id]
          const on = value === row.id
          return (
            <button
              key={row.id}
              type="button"
              className={on ? 'is-on' : ''}
              style={{
                '--s': tone.accent,
                '--w': tone.wash
              }}
              onClick={() => pick(row.id)}
            >
              <i className="plan-scheme-bar" aria-hidden="true">
                <span style={{ width: `${row.needs}%`, background: '#118BE3' }} />
                <span style={{ width: `${row.wants}%`, background: '#4554E5' }} />
                <span style={{ width: `${row.save}%`, background: '#16C784' }} />
              </i>
              <b>{row.needs}/{row.wants}/{row.save}</b>
            </button>
          )
        })}
      </div>

      {note && (
        <div className="scheme-pop">
          <button type="button" className="scheme-pop-bg" aria-label={t('close')} onClick={() => setNote(null)} />
          <div className="scheme-pop-box" role="dialog">
            <em style={{ background: TONE[note]?.wash, color: TONE[note]?.accent }}>
              {getSchemeLabel(note)}
            </em>
            <p>“{quote?.line}”</p>
            <cite>{quote?.by}</cite>
            <button type="button" className="plan-apply" onClick={() => setNote(null)}>{t('gotIt')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function getSchemeLabel(id) {
  const row = SCHEMES.find((s) => s.id === id)
  return row ? `${row.needs}/${row.wants}/${row.save}` : id
}
