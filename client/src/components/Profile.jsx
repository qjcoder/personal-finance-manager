import { useEffect, useState } from 'react'
import { getProfile, saveProfile } from '../lib/api.js'
import BackupPanel from './BackupPanel.jsx'
import LanguageSwitch from './LanguageSwitch.jsx'
import { LifestyleSurveyHost } from './LifestyleSurvey.jsx'
import SchemePicker from './SchemePicker.jsx'
import { getScheme } from '../lib/savingPlan.js'
import { useI18n } from '../lib/i18n.jsx'

const EMPTY = {
  full_name: '',
  city: '',
  occupation: '',
  monthly_salary: '',
  other_income: '',
  pay_cycle: 'monthly',
  payday: '1',
  household_members: '1',
  dependents: '0',
  monthly_rent: '',
  savings_target_pct: '20',
  wake_time: '07:00',
  sleep_time: '23:00',
  work_start: '09:00',
  work_end: '18:00',
  commute: '',
  weekday_routine: '',
  weekend_routine: '',
  notes: ''
}

export default function Profile({ currencyCode, onSaved, onRestored }) {
  const { t } = useI18n()
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [survey, setSurvey] = useState(false)

  useEffect(() => {
    getProfile()
      .then((data) => setForm({ ...EMPTY, ...data }))
      .catch(() => setStatus('Could not load profile'))
      .finally(() => setLoading(false))
  }, [])

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('Saving…')
    try {
      const saved = await saveProfile(form)
      setForm({ ...EMPTY, ...saved })
      setStatus('Saved')
      onSaved?.(saved)
    } catch {
      setStatus('Could not save. Try again.')
    }
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading profile…</p>
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[28px] font-semibold tracking-tight text-ink">{t('page.profile')}</h2>
          <LanguageSwitch />
        </div>
        <section className="card rounded-2xl p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('name')}><input className="field w-full !rounded-[10px]" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} /></Field>
            <Field label={t('city')}><input className="field w-full !rounded-[10px]" value={form.city} onChange={(e) => update('city', e.target.value)} /></Field>
            <Field label={`${t('salary')} (${currencyCode})`}><input className="field w-full !rounded-[10px]" type="number" min="0" step="0.01" value={form.monthly_salary} onChange={(e) => update('monthly_salary', e.target.value)} /></Field>
            <Field label={t('extra')}><input className="field w-full !rounded-[10px]" type="number" min="0" step="0.01" value={form.other_income} onChange={(e) => update('other_income', e.target.value)} /></Field>
            <Field label={t('cycle')}>
              <select className="field w-full !rounded-[10px]" value={form.pay_cycle} onChange={(e) => update('pay_cycle', e.target.value)}>
                <option value="monthly">{t('month')}</option>
                <option value="weekly">{t('week')}</option>
                <option value="biweekly">{t('biweek')}</option>
              </select>
            </Field>
            <Field label={t('payday')}><input className="field w-full !rounded-[10px]" type="number" min="1" max="31" value={form.payday} onChange={(e) => update('payday', e.target.value)} /></Field>
          </div>
        </section>
        <section className="card rounded-2xl p-5 profile-schemes">
          <p className="mb-3 text-sm font-semibold text-ink">{t('plan.title')}</p>
          <SchemePicker
            value={form.plan_scheme || getScheme(form.plan_scheme).id}
            onPick={async (id) => {
              const scheme = getScheme(id)
              const next = { ...form, plan_scheme: scheme.id, savings_target_pct: scheme.save }
              setForm(next)
              try {
                const saved = await saveProfile(next)
                setForm({ ...EMPTY, ...saved })
                onSaved?.(saved)
              } catch {
                setStatus('Could not save. Try again.')
              }
            }}
          />
        </section>
        <section className="card rounded-2xl p-5">
          <p className="mb-1 text-sm font-semibold text-ink">{t('plan.update')}</p>
          <p className="mb-4 text-sm text-muted">{t('plan.updateHint')}</p>
          <button type="button" className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold" onClick={() => setSurvey(true)}>
            {form.lifestyle?.done ? t('plan.edit') : t('plan.apply')}
          </button>
        </section>
        <button type="submit" className="btn-primary rounded-full px-5 py-2.5 text-sm font-semibold">Save</button>
        {status && <p className="text-sm text-muted">{status}</p>}
      </form>
      <div className="mt-6">
        <BackupPanel onRestored={onRestored} />
      </div>
      {survey && (
        <LifestyleSurveyHost
          profile={form}
          onSaved={(saved) => {
            setForm({ ...EMPTY, ...saved })
            onSaved?.(saved)
          }}
          onClose={() => setSurvey(false)}
        />
      )}
    </>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}
