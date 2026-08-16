import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { allowsSometimes, applyLocks, catsFromLifestyle, emptyAnswers, questionQueue, txt } from '../data/lifestyleSurvey.js'
import { saveProfile } from '../lib/api.js'
import { buildSavingPlan, getScheme } from '../lib/savingPlan.js'
import { useI18n } from '../lib/i18n.jsx'
import SchemePicker from './SchemePicker.jsx'

const TILE = {
  Housing: 'Home',
  'Bills & Utilities': 'Bills',
  'Food & Dining': 'Food',
  Transportation: 'Ride',
  Healthcare: 'Health',
  Education: 'Misc',
  Shopping: 'Shop',
  Entertainment: 'Fun',
  Travel: 'Travel',
  'Personal Care': 'Care',
  'Gifts & Donations': 'Gifts',
  Other: 'Other',
  'Emergency fund': 'Safety',
  Goals: 'Goals',
  Invest: 'Invest'
}

export default function LifestyleSurvey({ answers, setAnswers, onSave, busy, onClose, profile }) {
  const { t, lang } = useI18n()
  const queue = useMemo(() => questionQueue(answers), [answers])
  const [i, setI] = useState(0)
  const [review, setReview] = useState(false)
  const [schemeId, setSchemeId] = useState(profile?.plan_scheme || '50-30-20')

  const total = Math.max(queue.length, 1)
  const idx = Math.min(i, queue.length - 1)
  const item = !review && queue.length ? queue[idx] : null
  const row = item ? answers[item.id] || { on: false, monthly: '', daily: '', answered: false } : null
  const choice = row?.choice || (row?.answered ? (row.on ? 'yes' : 'no') : '')
  const ternary = item ? allowsSometimes(item) : false
  const locked = Boolean(item?.lockMonths && row?.lockedUntil && new Date(`${row.lockedUntil}T23:59:59`) >= new Date())
  const askAmt = Boolean(item?.lockMonths)
  const needAmt = askAmt && item?.type === 'yesmoney' && row?.answered && choice === 'yes'
  const canNext = !item
    || (item.type === 'yesno' && row.answered)
    || (item.type === 'yesmoney' && row.answered && (!askAmt || choice !== 'yes' || Number(row.daily || row.monthly) > 0))

  function patch(id, extra) {
    const next = {
      ...answers,
      [id]: { ...(answers[id] || { monthly: '', daily: '' }), ...extra, answered: true }
    }
    setAnswers(next)
    return next
  }

  function advance(nextAnswers) {
    const q = questionQueue(nextAnswers)
    const pos = item ? q.findIndex((x) => x.id === item.id) : -1
    if (pos < 0 || pos >= q.length - 1) setReview(true)
    else setI(pos + 1)
  }

  function setChoice(nextChoice) {
    if (!item) return
    if (locked && nextChoice !== 'yes') return
    const on = nextChoice !== 'no'
    const next = patch(item.id, { choice: nextChoice, on })
    if (item.type === 'yesno' || !item.lockMonths || nextChoice !== 'yes') advance(next)
  }

  function setAmt(field, value) {
    if (!item || locked) return
    patch(item.id, { [field]: value, on: true, choice: 'yes' })
  }

  function goNext() {
    advance(answers)
  }

  function goBack() {
    if (review) {
      setReview(false)
      return
    }
    setI((n) => Math.max(0, n - 1))
  }

  const scheme = getScheme(schemeId)
  const preview = buildSavingPlan({
    ...(profile || {}),
    lifestyle: { done: true, answers },
    plan_scheme: scheme.id,
    savings_target_pct: scheme.save
  }, null, [])

  return (
    <div className="survey-pop">
      <button type="button" className="survey-bg" aria-label={t('no')} onClick={onClose} />
      <div className="survey-box" role="dialog" aria-modal="true">
        <div className="survey-top">
          <span>Tarteeb</span>
          <div className="survey-top-end">
            <em>{review ? t('plan.review') : `${idx + 1} / ${total}`}</em>
            <button type="button" className="survey-x" aria-label={t('close')} onClick={onClose}>
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <div className="survey-bar">
          <i style={{ width: `${review ? 100 : ((idx + 1) / total) * 100}%` }} />
        </div>

        {item && (
          <div className="survey-body">
            <small>{txt(lang, item.groupTitle)}</small>
            <h3>{txt(lang, item.q)}</h3>
            <div className={ternary ? 'survey-yn is-3' : 'survey-yn'}>
              <button type="button" className={choice === 'yes' ? 'is-on' : ''} onClick={() => setChoice('yes')}>{t('yes')}</button>
              {ternary && (
                <button type="button" className={choice === 'sometimes' ? 'is-on' : ''} onClick={() => setChoice('sometimes')}>{t('sometimes')}</button>
              )}
              <button type="button" className={choice === 'no' ? 'is-on' : ''} disabled={locked} onClick={() => setChoice('no')}>{t('no')}</button>
            </div>
            {needAmt && (
              <div className="life-amt">
                <label>
                  <span>{item.period === 'daily' ? t('dailyPkr') : t('monthlyPkr')}</span>
                  <div className={locked ? 'survey-field is-lock' : 'survey-field'}>
                    <em>Rs</em>
                    <input
                      autoFocus={!locked}
                      readOnly={locked}
                      inputMode="decimal"
                      value={item.period === 'daily' ? row.daily : row.monthly}
                      onChange={(e) => setAmt(item.period === 'daily' ? 'daily' : 'monthly', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </label>
                <p className="survey-note">
                  {locked ? t('rentLocked').replace('{date}', row.lockedUntil) : t('rentLock')}
                </p>
              </div>
            )}
          </div>
        )}

        {review && (
          <div className="survey-body survey-plan">
            <small>{t('plan.review')}</small>
            <h3>{t('plan.ready')}</h3>
            <p className="survey-hint">
              {preview.income > 0
                ? `${t('plan.income')}: ${Math.round(preview.income).toLocaleString()} PKR`
                : t('plan.empty')}
            </p>
            <SchemePicker value={schemeId} onPick={setSchemeId} />
            <div className="plan-track survey-track">
              <i className="is-save" style={{ width: `${preview.savePct}%` }} />
              <i className="is-need" style={{ width: `${preview.needsPct}%` }} />
              <i className="is-want" style={{ width: `${preview.wantsPct}%` }} />
            </div>
            <div className="survey-cats">
              {(preview.rows || []).map((row) => (
                <div key={row.name}>
                  <span>
                    {row.name === 'Save' ? t('save') : t(`tile.${TILE[row.name] || 'Other'}`, row.name)}
                    <i>{t(`plan.kind.${row.kind}`)}</i>
                  </span>
                  <strong>{Math.round(row.planned).toLocaleString()}</strong>
                </div>
              ))}
            </div>
            {preview.warnRent && <p className="survey-note">{t('plan.rentHigh')}</p>}
          </div>
        )}

        <div className="survey-nav">
          <button type="button" className="survey-back" onClick={i === 0 && !review ? onClose : goBack}>
            {t('back')}
          </button>
          {review ? (
            <button type="button" className="plan-apply survey-next" disabled={busy} onClick={() => onSave(schemeId)}>
              {busy ? t('loading') : t('plan.apply')}
            </button>
          ) : (
            <button type="button" className="plan-apply survey-next" disabled={!canNext} onClick={goNext}>
              {t('next')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function LifestyleSurveyHost({ profile, onSaved, onClose }) {
  const [answers, setAnswers] = useState(() => mergeAnswers(profile?.lifestyle?.answers))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setAnswers(mergeAnswers(profile?.lifestyle?.answers))
  }, [profile?.lifestyle])

  async function saveSurvey(schemeId) {
    setBusy(true)
    try {
      const lockedAnswers = applyLocks(answers)
      const lifestyle = { done: true, answers: lockedAnswers }
      const scheme = getScheme(schemeId)
      const saved = await saveProfile({
        ...(profile || {}),
        lifestyle,
        plan_cats: catsFromLifestyle(lifestyle),
        plan_scheme: scheme.id,
        savings_target_pct: scheme.save
      })
      onSaved?.(saved)
      onClose?.()
    } finally {
      setBusy(false)
    }
  }

  return (
    <LifestyleSurvey
      profile={profile}
      answers={answers}
      setAnswers={setAnswers}
      onSave={saveSurvey}
      busy={busy}
      onClose={onClose}
    />
  )
}

export function mergeAnswers(saved) {
  const base = emptyAnswers()
  if (!saved) return base
  const out = { ...base }
  for (const [id, row] of Object.entries(saved)) {
    out[id] = { ...(base[id] || {}), ...row, answered: true }
  }
  return out
}
