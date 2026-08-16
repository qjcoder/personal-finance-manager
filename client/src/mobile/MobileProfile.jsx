import { useEffect, useState } from 'react'
import { ChevronRight, Download, MapPin, RotateCcw } from 'lucide-react'
import { exportBackup, getProfile, restoreBackup, saveProfile } from '../lib/api.js'
import LanguageSwitch from '../components/LanguageSwitch.jsx'
import { LifestyleSurveyHost } from '../components/LifestyleSurvey.jsx'
import SchemePicker from '../components/SchemePicker.jsx'
import { userBills } from '../lib/dailyLoop.js'
import { getScheme } from '../lib/savingPlan.js'
import { useI18n } from '../lib/i18n.jsx'

const EMPTY = {
  full_name: '',
  city: '',
  monthly_salary: '',
  other_income: '',
  pay_cycle: 'monthly',
  payday: '1',
  savings_target_pct: '20'
}

export default function MobileProfile({ currencyCode, onSaved, onRestored }) {
  const { t } = useI18n()
  const [form, setForm] = useState(EMPTY)
  const [full, setFull] = useState({})
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [survey, setSurvey] = useState(false)

  useEffect(() => {
    getProfile()
      .then((data) => {
        setFull(data || {})
        setForm({ ...EMPTY, ...data })
      })
      .catch(() => setStatus('Could not load'))
      .finally(() => setLoading(false))
  }, [])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function persist(patch = {}) {
    const next = { ...full, ...form, ...patch }
    const saved = await saveProfile(next)
    setFull(saved)
    setForm({ ...EMPTY, ...saved })
    onSaved?.(saved)
    return saved
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await persist()
      setStatus('Saved')
    } catch {
      setStatus('Try again')
    }
  }

  function restoreFromFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        if (!window.confirm('Replace current data?')) return
        await restoreBackup(JSON.parse(String(reader.result)))
        setStatus('Restored')
        onRestored?.()
      } catch {
        setStatus('Invalid file')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  async function download() {
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tarteeb-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const initial = (form.full_name || 'T').charAt(0).toUpperCase()
  const scheme = getScheme(form.plan_scheme)

  if (loading) return <p className="you-load">{t('loading')}</p>

  return (
    <form className="you" onSubmit={handleSubmit}>
      <header className="you-hero">
        <div className="you-lang">
          <LanguageSwitch tone="dark" />
        </div>
        <div className="you-id">
          <div className="you-ring">
            <div className="you-avatar">{initial}</div>
          </div>
          <div>
            <input
              className="you-name"
              value={form.full_name}
              onChange={(e) => update('full_name', e.target.value)}
              placeholder={t('name')}
              aria-label={t('name')}
            />
            <label className="you-city">
              <MapPin size={12} strokeWidth={2.4} />
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder={t('city')}
                aria-label={t('city')}
              />
            </label>
          </div>
        </div>
        <p className="you-kicker">{currencyCode}</p>
        <label className="you-salary">
          <input
            type="number"
            min="0"
            step="1"
            value={form.monthly_salary}
            onChange={(e) => update('monthly_salary', e.target.value)}
            aria-label={t('salary')}
          />
        </label>
        <div className="you-mix" aria-hidden>
          <i style={{ width: `${scheme.needs}%`, background: '#118BE3' }} />
          <i style={{ width: `${scheme.wants}%`, background: '#4554E5' }} />
          <i style={{ width: `${scheme.save}%`, background: '#16C784' }} />
        </div>
      </header>

      <div className="you-sheet">
        <section className="you-card">
          <label className="you-row">
            <span>{t('extra')}</span>
            <b>{currencyCode}</b>
            <input
              type="number"
              min="0"
              step="1"
              value={form.other_income}
              onChange={(e) => update('other_income', e.target.value)}
              placeholder="0"
            />
          </label>
          <label className="you-row">
            <span>{t('payday')}</span>
            <input
              type="number"
              min="1"
              max="31"
              value={form.payday}
              onChange={(e) => update('payday', e.target.value)}
            />
          </label>
          <div className="you-seg" role="group" aria-label={t('cycle')}>
            {[
              { id: 'monthly', label: t('month') },
              { id: 'weekly', label: t('week') },
              { id: 'biweekly', label: t('biweek') }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={form.pay_cycle === item.id ? 'is-on' : ''}
                onClick={() => update('pay_cycle', item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="you-card">
          {userBills(full).map((bill) => (
            <div key={bill.id} className="you-bill">
              <span>{bill.name}</span>
              <input
                type="number"
                min="1"
                max="31"
                value={bill.day}
                aria-label={`${bill.name} day`}
                onChange={(e) => {
                  const bills = userBills(full).map((row) => (
                    row.id === bill.id ? { ...row, day: Number(e.target.value) } : row
                  ))
                  setFull((prev) => ({ ...prev, bills }))
                }}
              />
              <input
                type="number"
                min="0"
                value={bill.amount}
                placeholder="0"
                onChange={(e) => {
                  const bills = userBills(full).map((row) => (
                    row.id === bill.id ? { ...row, amount: e.target.value } : row
                  ))
                  setFull((prev) => ({ ...prev, bills }))
                }}
              />
            </div>
          ))}
        </section>

        <section className="you-card you-plan">
          <SchemePicker
            value={form.plan_scheme || scheme.id}
            onPick={async (id) => {
              const nextScheme = getScheme(id)
              try {
                await persist({ plan_scheme: nextScheme.id, savings_target_pct: nextScheme.save })
              } catch {
                setStatus('Try again')
              }
            }}
          />
        </section>

        <button type="button" className="you-life" onClick={() => setSurvey(true)}>
          <span>{full.lifestyle?.done ? t('plan.edit') : t('plan.apply')}</span>
          <ChevronRight size={18} />
        </button>

        <button type="submit" className="you-save">{t('saveProfile')}</button>

        <div className="you-foot">
          <button type="button" aria-label={t('export')} onClick={() => download().catch(() => setStatus('Failed'))}>
            <Download size={18} />
          </button>
          <label aria-label={t('restore')}>
            <RotateCcw size={18} />
            <input type="file" accept="application/json,.json" className="hidden" onChange={restoreFromFile} />
          </label>
        </div>
        {status && <p className="you-status">{status}</p>}
      </div>
      {survey && (
        <LifestyleSurveyHost
          profile={full}
          onSaved={(saved) => {
            setFull(saved)
            setForm({ ...EMPTY, ...saved })
            onSaved?.(saved)
          }}
          onClose={() => setSurvey(false)}
        />
      )}
    </form>
  )
}
