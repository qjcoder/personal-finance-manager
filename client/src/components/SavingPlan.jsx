import { useEffect, useState } from 'react'
import {
  Car, Film, Gift, GraduationCap, HeartPulse, Home,
  PiggyBank, Plane, Shield, ShoppingBag, Sparkles, Target, TrendingUp, Utensils, Zap, MoreHorizontal, SlidersHorizontal
} from 'lucide-react'
import { applyUserCaps, buildSavingPlan, dailySavePace, isWantCategory, NEED_MAIN } from '../lib/savingPlan.js'
import { saveProfile, setBudget } from '../lib/api.js'
import { useI18n } from '../lib/i18n.jsx'
import { LifestyleSurveyHost } from './LifestyleSurvey.jsx'

const META = {
  Housing: { icon: Home, bg: '#FFDDE3', fg: '#D45A6A', label: 'Home' },
  'Bills & Utilities': { icon: Zap, bg: '#FFF3D4', fg: '#C49A1A', label: 'Bills' },
  'Food & Dining': { icon: Utensils, bg: '#FFE8DC', fg: '#D4653A', label: 'Food' },
  Transportation: { icon: Car, bg: '#DCE8FF', fg: '#3D6FD9', label: 'Ride' },
  Healthcare: { icon: HeartPulse, bg: '#D8F4EA', fg: '#1F9A72', label: 'Health' },
  Education: { icon: GraduationCap, bg: '#D9F0FF', fg: '#2A8FC4', label: 'Misc' },
  Shopping: { icon: ShoppingBag, bg: '#EDE4FF', fg: '#7B63C9', label: 'Shop' },
  Entertainment: { icon: Film, bg: '#FFDDED', fg: '#D45A8A', label: 'Fun' },
  Travel: { icon: Plane, bg: '#D5F5F0', fg: '#1A9A8A', label: 'Travel' },
  'Personal Care': { icon: Sparkles, bg: '#E8E0FF', fg: '#6B5BB5', label: 'Care' },
  'Gifts & Donations': { icon: Gift, bg: '#FFE4D0', fg: '#E07A3A', label: 'Gifts' },
  Other: { icon: MoreHorizontal, bg: '#ECECEC', fg: '#6B6B6B', label: 'Other' },
  'Emergency fund': { icon: Shield, bg: '#D8F5E8', fg: '#1F9A72', label: 'Safety' },
  Goals: { icon: Target, bg: '#DCE8FF', fg: '#4554E5', label: 'Goals' },
  Invest: { icon: TrendingUp, bg: '#E0E4FF', fg: '#4554E5', label: 'Invest' }
}

function shortAmt(n) {
  const v = Math.round(Number(n) || 0)
  if (v >= 100000) return `${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1).replace(/\.0$/, '')}L`
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1).replace(/\.0$/, '')}k`
  return String(v)
}

export default function SavingPlan({ profile, summary, money, categoryData, transactions, tone = 'light', onSaved }) {
  const { t } = useI18n()
  const plan = applyUserCaps(buildSavingPlan(profile, summary, categoryData), profile?.plan_caps)
  const pace = dailySavePace(plan, transactions)
  const dark = tone === 'dark'
  const known = profile != null
  const [edit, setEdit] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [capRow, setCapRow] = useState(null)
  const [draft, setDraft] = useState(0)

  useEffect(() => {
    if (!known || skipped) return
    setEdit(!plan.customized)
  }, [known, plan.customized, skipped])

  if (edit) {
    return (
      <>
        <section className={dark ? 'plan plan-dark' : 'plan'}>
          <h3>{t('plan.ask')}</h3>
          <p className="plan-empty">{t('plan.surveyHint')}</p>
        </section>
        <LifestyleSurveyHost
          profile={profile}
          onSaved={onSaved}
          onClose={() => {
            setEdit(false)
            setSkipped(true)
          }}
        />
      </>
    )
  }

  if (!plan.ready) {
    return (
      <section className={dark ? 'plan plan-dark' : 'plan'}>
        <h3>{t('plan.title')}</h3>
        <p className="plan-empty">{t('plan.empty')}</p>
      </section>
    )
  }

  return (
    <section className={dark ? 'plan plan-dark' : 'plan'}>
      <div className="plan-head">
        <h3>{t('plan.title')}</h3>
        <div className="plan-head-actions">
          <button type="button" className="plan-edit" onClick={() => setEdit(true)} aria-label={t('plan.edit')}>
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="plan-sheet">
        <DailySave money={money} pace={pace} />
        <PlanRows
          rows={plan.rows}
          money={money}
          percents={{ save: plan.savePct, needs: plan.needsPct, wants: plan.wantsPct }}
          onCap={(row) => {
            if (row.kind === 'fixed') return
            setCapRow(row)
            setDraft(Math.round(row.planned || row.suggested || 0))
          }}
        />
        {plan.warnRent && <p className="plan-warn">{t('plan.rentHigh')}</p>}
      </div>
      {capRow && (
        <CapSheet
          row={capRow}
          draft={draft}
          setDraft={setDraft}
          money={money}
          income={plan.income}
          saveAfter={Math.max(0, plan.income - plan.rows.reduce((s, r) => {
            if (r.name === 'Save') return s
            return s + (r.name === capRow.name ? Number(draft) || 0 : r.planned)
          }, 0))}
          onClose={() => setCapRow(null)}
          onSave={async () => {
            const caps = { ...(profile?.plan_caps || {}), [capRow.name]: Number(draft) || 0 }
            const saved = await saveProfile({ ...(profile || {}), plan_caps: caps })
            try {
              await setBudget({ category: capRow.name, amount: Number(draft) || 0 })
            } catch {
              /* budget table is extra tracking */
            }
            onSaved?.(saved)
            setCapRow(null)
          }}
        />
      )}
    </section>
  )
}

function DailySave({ money, pace }) {
  const { t } = useI18n()
  const kept = pace.savedToday
  const ok = kept >= 0
  const target = pace.dailySave + pace.dailySpend
  const fill = target > 0 ? Math.min(100, Math.max(0, (kept / target) * 100)) : 0
  return (
    <div className={ok ? 'plan-daily' : 'plan-daily is-down'}>
      <span className="plan-daily-ico">
        <PiggyBank size={20} strokeWidth={2.2} />
      </span>
      <div>
        <b>{ok ? t('plan.savedToday') : t('plan.spentOver')}</b>
        <strong>{money(Math.abs(kept))}</strong>
        <span className="plan-track" aria-hidden>
          <i style={{ width: `${fill}%` }} />
        </span>
      </div>
      <em>
        {ok ? t('plan.nextDay') : t('plan.cutTomorrow')}
        <b>{shortAmt(ok ? pace.nextAim : (pace.short || pace.nextAim))}</b>
      </em>
    </div>
  )
}

function CapSheet({ row, draft, setDraft, money, onClose, onSave, income, saveAfter }) {
  const { t } = useI18n()
  const suggested = Math.round(row.suggested || row.planned || 0)
  const max = Math.max(suggested, Math.round(income || 0), Number(draft) || 0)
  const want = isWantCategory(row.name)
  return (
    <div className="scheme-pop" role="dialog">
      <button type="button" className="scheme-pop-bg" aria-label={t('close')} onClick={onClose} />
      <div className="scheme-pop-box cap-sheet">
        <h4>{t('plan.setRange')}</h4>
        <p>{t(`tile.${(META[row.name] || META.Other).label}`, (META[row.name] || META.Other).label)}</p>
        {want && <p className="plan-warn">{t('plan.pauseWant')}</p>}
        <label className="cap-value">
          {money(draft)}
          <span>{t('plan.limit')}</span>
        </label>
        <input
          type="range"
          min={0}
          max={max}
          step={100}
          value={Math.min(draft, max)}
          onChange={(e) => setDraft(Number(e.target.value))}
        />
        <input
          className="cap-num"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="0"
          value={Number.isFinite(draft) ? draft : ''}
          onChange={(e) => setDraft(Number(e.target.value))}
        />
        <small>{t('plan.toSave')}: {money(Math.max(0, saveAfter || 0))}</small>
        <button type="button" className="btn-primary mt-3 w-full rounded-xl py-3 font-semibold" onClick={onSave}>
          {t('gotIt')}
        </button>
      </div>
    </div>
  )
}

function PlanRows({ rows, money, percents, onCap }) {
  const { t } = useI18n()
  if (!rows?.length) return null
  const groups = [
    { id: 'save', title: t('save'), pct: percents?.save, items: rows.filter((r) => r.name === 'Save') },
    { id: 'needs', title: t('needs'), pct: percents?.needs, items: rows.filter((r) => NEED_MAIN.includes(r.name)) },
    { id: 'wants', title: t('wants'), pct: percents?.wants, items: rows.filter((r) => r.name !== 'Save' && !NEED_MAIN.includes(r.name)) }
  ]
  return (
    <div className="plan-lines">
      {groups.filter((g) => g.items.length).map((group) => {
        const total = group.items.reduce((s, r) => s + r.planned, 0)
        const saveRow = group.id === 'save' ? group.items[0] : null
        return (
          <div key={group.id} className={`plan-group is-${group.id}`}>
            <div className="plan-group-h">
              <span>{group.title}{group.pct != null ? ` · ${group.pct}%` : ''}</span>
              <strong>{shortAmt(total)}</strong>
            </div>
            {group.id === 'save' && saveRow && (
              <article className="plan-line">
                <span className="plan-ico" style={{ background: '#D8F5E8', color: '#1F9A72' }}>
                  <PiggyBank size={18} strokeWidth={2.2} />
                </span>
                <div>
                  <b>{group.title}</b>
                  <small>{group.pct}%</small>
                </div>
                <strong title={money(saveRow.planned)}>
                  {shortAmt(saveRow.planned)}
                  <em>{shortAmt(saveRow.daily)}{t('pace.day')}</em>
                </strong>
              </article>
            )}
            {group.id !== 'save' && group.items.map((row) => {
              const meta = META[row.name] || META.Other
              const Icon = meta.icon
              const used = Number(row.used) || 0
              const left = Math.max(0, row.planned - used)
              const fill = row.planned > 0 ? Math.min(100, (used / row.planned) * 100) : 0
              const locked = row.kind === 'fixed'
              return (
                <button
                  type="button"
                  key={row.name}
                  className={row.over ? 'plan-line is-over' : 'plan-line'}
                  onClick={() => onCap(row)}
                  disabled={locked}
                >
                  <span className="plan-ico" style={{ background: meta.bg, color: meta.fg }}>
                    <Icon size={18} strokeWidth={2.2} />
                  </span>
                  <div>
                    <b>
                      {row.name === 'Housing' && row.kind === 'fixed'
                        ? t('tile.Rent', 'Rent')
                        : t(`tile.${meta.label}`, meta.label)}
                    </b>
                    <small>{t(`plan.kind.${row.kind}`)}</small>
                    <span className="plan-track" aria-hidden>
                      <i style={{ width: `${fill}%` }} />
                    </span>
                  </div>
                  <strong title={money(row.planned)}>
                    {shortAmt(row.planned)}
                    <em>
                      {shortAmt(used)} / {shortAmt(row.planned)}
                      {row.kind !== 'fixed' && ` · ${shortAmt(left)} ${t('plan.left')}`}
                    </em>
                  </strong>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
