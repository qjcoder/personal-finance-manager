import {
  buildReminders, freezeOn, isPayday, leftoverToday, livePlan, lockStamp, monthClose,
  payStamp, pickGoal, todayLeft, weekScore
} from '../lib/dailyLoop.js'
import { useI18n } from '../lib/i18n.jsx'

const SHORT = {
  'Food & Dining': 'Food',
  'Bills & Utilities': 'Bills',
  Transportation: 'Ride',
  Housing: 'Rent',
  Education: 'Misc'
}

function shortAmt(n) {
  const v = Math.round(Number(n) || 0)
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1).replace(/\.0$/, '')}k`
  return String(v)
}

export default function DailyLoop({
  profile, summary, categoryData, transactions, goals, money,
  onPaySelf, onLockLeft, onAdd, onPickGoal
}) {
  const { t } = useI18n()
  const plan = livePlan(profile, summary, categoryData)
  if (!plan.ready) return null
  const left = todayLeft(plan, transactions).filter((row) => row.kind !== 'fixed')
  const extra = leftoverToday(plan, transactions)
  const week = weekScore(plan, transactions)
  const close = monthClose(plan, summary)
  const payday = isPayday(profile)
  const paid = Boolean(profile?.[payStamp()])
  const locked = Boolean(profile?.[lockStamp()])
  const goal = pickGoal(goals, profile)
  const note = buildReminders({ profile, plan, transactions, extra })[0]
  const list = goals || []

  function cycleGoal() {
    if (!list.length) {
      onAdd('goal')
      return
    }
    const i = list.findIndex((row) => row.id === goal?.id)
    onPickGoal(list[(i + 1) % list.length].id)
  }

  return (
    <div className="loop">
      {payday && !paid && (
        <button type="button" className="loop-pay" onClick={onPaySelf}>
          {t('loop.payday')} · {money(plan.saveAmt)}
        </button>
      )}
      <div className="loop-today">
        {left.map((row) => (
          <button key={row.name} type="button" className={row.over ? 'is-over' : ''} onClick={() => onAdd('expense')}>
            <small>{t(`tile.${SHORT[row.name] || 'Misc'}`, SHORT[row.name] || row.name)}</small>
            <strong>{shortAmt(row.left)}</strong>
          </button>
        ))}
      </div>
      <div className="loop-bar">
        <button type="button" disabled={locked || extra <= 0} onClick={() => onLockLeft(extra)}>
          {t('loop.lock')} {extra > 0 ? shortAmt(extra) : ''}
        </button>
        <button type="button" onClick={cycleGoal}>{goal?.name || '+'}</button>
        <span className={week.tight || (close.closing && !close.hit) ? 'is-down' : ''}>
          {close.closing ? shortAmt(close.saved) : shortAmt(week.saved)}
        </span>
      </div>
      {note && <p className="loop-hint">{t(note.text)}{note.name ? ` · ${note.name}` : ''}</p>}
    </div>
  )
}
