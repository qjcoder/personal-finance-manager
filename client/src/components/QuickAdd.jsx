import { useState } from 'react'
import { freezeOn, leftoverToday, livePlan, todayLeft } from '../lib/dailyLoop.js'
import { isWantCategory } from '../lib/savingPlan.js'
import { EXPENSE_CATEGORIES } from '../lib/currency.js'
import { useI18n } from '../lib/i18n.jsx'
import Modal from './Modal.jsx'

const CHIP = [
  'Food & Dining',
  'Bills & Utilities',
  'Transportation',
  'Housing',
  'Education',
  'Shopping',
  'Entertainment',
  'Other'
]

const SHORT = {
  'Food & Dining': 'Food',
  'Bills & Utilities': 'Bills',
  Transportation: 'Ride',
  Housing: 'Rent',
  Education: 'Misc',
  Shopping: 'Shop',
  Entertainment: 'Fun',
  Other: 'Other'
}

export default function QuickAdd({ currency, profile, summary, categoryData, transactions, onClose, onSave, sheet, edit }) {
  const { t } = useI18n()
  const plan = livePlan(profile, summary, categoryData)
  const left = todayLeft(plan, transactions)
  const leftMap = Object.fromEntries(left.map((row) => [row.name, row]))
  const frozen = freezeOn(profile)
  const [amount, setAmount] = useState(edit ? String(Math.round(Number(edit.amount) || 0)) : '')
  const [cat, setCat] = useState(edit?.category || 'Food & Dining')
  const [warn, setWarn] = useState(false)
  const want = isWantCategory(cat)
  const room = leftMap[cat]?.left
  const blocked = frozen && want && !edit

  function submit(e) {
    e.preventDefault()
    const n = Number(amount)
    if (!(n > 0)) return
    if (blocked) return
    const over = room != null && n > room
    if ((over || want) && !warn) {
      setWarn(true)
      return
    }
    onSave({
      type: 'expense',
      amount: n,
      category: cat,
      description: '',
      date: edit?.date || new Date().toISOString().slice(0, 10)
    })
  }

  return (
    <Modal title={edit ? t('quick.edit') : t('quick.add')} onClose={onClose} sheet={sheet}>
      <form className="quick" onSubmit={submit}>
        <label className="quick-amt">
          <span>{currency}</span>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            autoFocus
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setWarn(false) }}
            placeholder="0"
            required
          />
        </label>
        {room != null && (
          <p className="quick-left">{t('plan.left')}: {Math.round(room)}</p>
        )}
        <div className="quick-chips">
          {(CHIP.filter((id) => EXPENSE_CATEGORIES.includes(id) || id === 'Housing')).map((id) => (
            <button
              key={id}
              type="button"
              className={cat === id ? 'is-on' : ''}
              onClick={() => { setCat(id); setWarn(false) }}
            >
              {t(`tile.${SHORT[id]}`, SHORT[id])}
            </button>
          ))}
        </div>
        {blocked && <p className="plan-warn">{t('loop.frozen')}</p>}
        {want && !blocked && <p className="plan-warn">{t('plan.pauseWant')}</p>}
        {warn && !blocked && <p className="plan-warn">{t('plan.overCap')}</p>}
        <button type="submit" className="btn-primary mt-2 w-full rounded-xl py-3 font-semibold" disabled={blocked}>
          {warn ? t('plan.addAnyway') : (edit ? t('quick.edit') : t('quick.add'))}
        </button>
      </form>
    </Modal>
  )
}

export { leftoverToday }
