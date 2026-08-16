import { applyUserCaps, buildSavingPlan, dailySavePace, isWantCategory, toMain } from './savingPlan.js'

export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function daysInMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export function livePlan(profile, summary, categoryData) {
  return applyUserCaps(buildSavingPlan(profile, summary, categoryData), profile?.plan_caps)
}

export function freezeOn(profile, now = Date.now()) {
  const until = Number(profile?.wants_freeze_until) || 0
  return until > now
}

export function isPayday(profile, d = new Date()) {
  const day = Number(profile?.payday) || 1
  return d.getDate() === day
}

export function todaySpendMap(transactions = []) {
  const key = todayKey()
  const map = {}
  for (const row of transactions) {
    if (row.type !== 'expense') continue
    if (String(row.date || '').slice(0, 10) !== key) continue
    const name = toMain(row.category)
    map[name] = (map[name] || 0) + (Number(row.amount) || 0)
  }
  return map
}

export function weekSpend(transactions = []) {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  start.setHours(0, 0, 0, 0)
  let out = 0
  for (const row of transactions) {
    if (row.type !== 'expense') continue
    const d = new Date(String(row.date || '').slice(0, 10))
    if (d >= start && d <= now) out += Number(row.amount) || 0
  }
  return out
}

export function todayLeft(plan, transactions = []) {
  const days = daysInMonth()
  const used = todaySpendMap(transactions)
  return (plan?.mainCats || []).map((row) => {
    const cap = row.kind === 'fixed' ? 0 : (Number(row.planned) || 0) / days
    const spent = used[row.name] || 0
    const left = Math.max(0, cap - spent)
    return {
      name: row.name,
      kind: row.kind,
      cap,
      spent,
      left,
      over: cap > 0 && spent > cap
    }
  })
}

export function leftoverToday(plan, transactions = []) {
  const pace = dailySavePace(plan, transactions)
  return Math.max(0, Math.round(pace.extra || 0))
}

export function weekScore(plan, transactions = []) {
  const days = daysInMonth()
  const spent = weekSpend(transactions)
  const allow = ((Number(plan?.spendAmt) || 0) / days) * 7
  const saveAllow = ((Number(plan?.saveAmt) || 0) / days) * 7
  const saved = Math.max(0, allow + saveAllow - spent)
  const pct = allow > 0 ? Math.min(100, Math.round((saved / (saveAllow || 1)) * 100)) : 0
  return { spent, allow, saved, saveAllow, pct, tight: spent > allow }
}

export function todayTx(transactions = []) {
  const key = todayKey()
  return (transactions || []).filter((row) => String(row.date || '').slice(0, 10) === key)
}

export function payStamp() {
  return `pay_self_${monthKey()}`
}

export function lockStamp() {
  return `lock_${todayKey()}`
}

export const DEFAULT_BILLS = [
  { id: 'power', name: 'Bijli', cat: 'Bills & Utilities', day: 10, amount: '' },
  { id: 'gas', name: 'Gas', cat: 'Bills & Utilities', day: 15, amount: '' },
  { id: 'mobile', name: 'Mobile', cat: 'Bills & Utilities', day: 5, amount: '' },
  { id: 'school', name: 'School', cat: 'Education', day: 5, amount: '' }
]

export function userBills(profile) {
  const raw = Array.isArray(profile?.bills) ? profile.bills : []
  if (!raw.length) return DEFAULT_BILLS
  return DEFAULT_BILLS.map((base) => raw.find((row) => row.id === base.id) || base)
}

export function dueBills(profile, d = new Date()) {
  const day = d.getDate()
  return userBills(profile).filter((row) => {
    const due = Number(row.day) || 0
    if (!due || !(Number(row.amount) > 0)) return false
    const diff = due - day
    return diff >= 0 && diff <= 2
  })
}

export function monthClose(plan, summary, d = new Date()) {
  const days = daysInMonth(d)
  const day = d.getDate()
  const closing = day >= days - 2
  const spent = Number(summary?.month_expenses) || Number(plan?.spent) || 0
  const income = Number(plan?.income) || 0
  const saved = Math.max(0, income - spent)
  const target = Number(plan?.saveAmt) || 0
  const leak = (plan?.mainCats || []).filter((row) => row.over).map((row) => row.name)
  return { closing, saved, target, hit: saved >= target, leak }
}

export function pickGoal(goals, profile) {
  const id = Number(profile?.save_goal_id)
  return (goals || []).find((g) => Number(g.id) === id) || (goals || [])[0] || null
}

export function buildReminders({ profile, plan, transactions, extra }) {
  const items = []
  const now = new Date()
  const hour = now.getHours()
  if (isPayday(profile) && !profile?.[payStamp()]) items.push({ id: 'pay', text: 'loop.payday' })
  if (extra > 0 && hour >= 20 && !profile?.[lockStamp()]) items.push({ id: 'lock', text: 'loop.lockNight' })
  const until = Number(profile?.wants_freeze_until) || 0
  if (until > Date.now() && until - Date.now() < 6 * 3600 * 1000) items.push({ id: 'thaw', text: 'loop.thawSoon' })
  for (const row of todayLeft(plan, transactions)) {
    if (row.cap > 0 && row.left <= row.cap * 0.2 && !row.over) {
      items.push({ id: `low-${row.name}`, text: 'loop.almost', name: row.name })
    }
  }
  for (const bill of dueBills(profile)) {
    items.push({ id: `bill-${bill.id}`, text: 'loop.billDue', name: bill.name, amount: bill.amount })
  }
  const close = monthClose(plan, { month_expenses: plan?.spent })
  if (close.closing) items.push({ id: 'close', text: 'loop.monthClose' })
  return items
}
