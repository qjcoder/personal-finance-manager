import { SURVEY, catsFromLifestyle, isOn } from '../data/lifestyleSurvey.js'

export const MAIN_SHARE = [
  ['Food & Dining', 0.38],
  ['Housing', 0.25],
  ['Bills & Utilities', 0.18],
  ['Transportation', 0.09],
  ['Education', 0.10]
]

export const MAIN_CATS = MAIN_SHARE.map(([id]) => id)
export const NEED_MAIN = ['Housing', 'Bills & Utilities', 'Food & Dining', 'Transportation']
const SOMETIMES = 0.4
const MISC = 'Education'
const INTO_MISC = [
  'Healthcare',
  'Shopping',
  'Entertainment',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Other'
]

export const ALL_PLAN_IDS = [...MAIN_CATS, ...INTO_MISC, 'Emergency fund', 'Goals', 'Invest']

export const SCHEMES = [
  { id: '50-30-20', needs: 50, wants: 30, save: 20 },
  { id: '40-30-30', needs: 40, wants: 30, save: 30 },
  { id: '40-20-40', needs: 40, wants: 20, save: 40 },
  { id: '60-20-20', needs: 60, wants: 20, save: 20 }
]

export function getScheme(id) {
  return SCHEMES.find((row) => row.id === id) || SCHEMES[0]
}

export function schemeFromProfile(profile) {
  return getScheme(profile?.plan_scheme)
}

export function toMain(name) {
  return INTO_MISC.includes(name) ? MISC : name
}

export function parsePlanCats(profile) {
  if (profile?.lifestyle?.done) return catsFromLifestyle(profile.lifestyle)
  const raw = profile?.plan_cats
  if (!Array.isArray(raw)) return null
  return raw.filter((id) => ALL_PLAN_IDS.includes(id))
}

export function buildSavingPlan(profile, summary, categoryData = []) {
  const scheme = schemeFromProfile(profile)
  const savePct = scheme.save
  const salary = Number(profile?.monthly_salary) || 0
  const extra = Number(profile?.other_income) || 0
  const stated = salary + extra
  const monthIncome = Number(summary?.month_income) || 0
  const income = stated > 0 ? stated : monthIncome
  const spent = Number(summary?.month_expenses) || 0
  const spentMap = Object.fromEntries(
    (categoryData || []).map((row) => [row.category, Number(row.amount) || 0])
  )
  const customized = Boolean(profile?.lifestyle?.done)
  const answers = profile?.lifestyle?.answers || {}
  const selected = parsePlanCats(profile)

  if (customized) {
    return finish({
      ...allocate(income, scheme, answers, spentMap),
      customized: true,
      fromSurvey: true,
      selected,
      fromProfile: stated > 0,
      income,
      spent,
      scheme
    })
  }

  const saveAmt = income * (savePct / 100)
  const needsAmt = income * (scheme.needs / 100)
  const wantsAmt = income * (scheme.wants / 100)
  const spendAmt = needsAmt + wantsAmt
  const needRows = splitRows(
    MAIN_SHARE.filter(([name]) => NEED_MAIN.includes(name)),
    needsAmt,
    spentMap
  ).map((row) => ({ ...row, kind: 'flex', pct: pct(row.planned, income), daily: row.planned / 30, weekly: row.planned / 4.345 }))
  const wantRows = splitRows(
    MAIN_SHARE.filter(([name]) => !NEED_MAIN.includes(name)),
    wantsAmt,
    spentMap
  ).map((row) => ({ ...row, kind: 'flex', pct: pct(row.planned, income), daily: row.planned / 30, weekly: row.planned / 4.345 }))
  const rows = [...needRows, ...wantRows]

  return finish({
    customized: false,
    fromSurvey: false,
    selected,
    fromProfile: stated > 0,
    income,
    savePct,
    needsPct: scheme.needs,
    wantsPct: scheme.wants,
    saveAmt,
    needsAmt,
    wantsAmt,
    spendAmt,
    rows: [
      { name: 'Save', planned: saveAmt, kind: 'save', pct: savePct, daily: saveAmt / 30, weekly: saveAmt / 4.345, used: 0 },
      ...rows
    ],
    mainCats: rows,
    warnRent: false,
    spent,
    scheme
  })
}

function allocate(income, scheme, answers, spentMap) {
  let saveAmt = income * (scheme.save / 100)
  let needsAmt = income * (scheme.needs / 100)
  let wantsAmt = income * (scheme.wants / 100)
  const { weight, fixed } = weightsFromAnswers(answers)
  const rent = fixed.Housing || 0
  if (rent > needsAmt) {
    const extra = rent - needsAmt
    needsAmt = rent
    const fromWants = Math.min(wantsAmt, extra)
    wantsAmt -= fromWants
    saveAmt = Math.max(0, saveAmt - (extra - fromWants))
  }
  const used = rollSpent(spentMap)
  const needCats = NEED_MAIN.filter((name) => weight[name] > 0 || (name === 'Housing' && rent > 0))
  const wantCats = MAIN_CATS.filter((name) => !NEED_MAIN.includes(name) && weight[name] > 0)
  const flexNeed = needCats.filter((name) => !(name === 'Housing' && rent > 0))
  const needPool = Math.max(0, needsAmt - rent)
  const needSum = flexNeed.reduce((s, name) => s + shareOf(name) * (weight[name] || 1), 0) || 1
  if (!wantCats.length && wantsAmt > 0) {
    saveAmt += wantsAmt
    wantsAmt = 0
  }
  const wantSum = wantCats.reduce((s, name) => s + shareOf(name) * (weight[name] || 1), 0) || 1

  const mainCats = MAIN_CATS.filter((name) => needCats.includes(name) || wantCats.includes(name)).map((name) => {
    let planned = 0
    let kind = 'flex'
    if (name === 'Housing' && rent > 0) {
      planned = rent
      kind = 'fixed'
    } else if (NEED_MAIN.includes(name) && flexNeed.includes(name)) {
      planned = needPool * ((shareOf(name) * (weight[name] || 1)) / needSum)
      kind = weight[name] < 1 ? 'sometimes' : 'flex'
    } else if (wantCats.includes(name)) {
      planned = wantsAmt * ((shareOf(name) * (weight[name] || 1)) / wantSum)
      kind = weight[name] < 1 ? 'sometimes' : 'flex'
    }
    const u = used[name] || 0
    return {
      name,
      planned,
      used: u,
      over: planned > 0 && u > planned,
      kind,
      pct: pct(planned, income),
      daily: planned / 30,
      weekly: planned / 4.345
    }
  })
  const spendAmt = needsAmt + wantsAmt
  return {
    savePct: pct(saveAmt, income),
    needsPct: pct(needsAmt, income),
    wantsPct: pct(wantsAmt, income),
    saveAmt,
    needsAmt,
    wantsAmt,
    spendAmt,
    mainCats,
    rows: [
      {
        name: 'Save',
        planned: saveAmt,
        kind: 'save',
        pct: pct(saveAmt, income),
        daily: saveAmt / 30,
        weekly: saveAmt / 4.345,
        used: 0
      },
      ...mainCats
    ],
    warnRent: income > 0 && rent / income > 0.35
  }
}

function shareOf(name) {
  return MAIN_SHARE.find(([id]) => id === name)?.[1] || 0
}

function pct(part, whole) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}

function weightsFromAnswers(answers) {
  const weight = {}
  const fixed = {}
  for (const group of SURVEY) {
    for (const item of group.items) {
      if (!item.cat) continue
      const row = answers[item.id]
      if (!isOn(row)) continue
      const main = toMain(item.cat)
      if (!MAIN_CATS.includes(main)) continue
      const factor = row.choice === 'sometimes' ? SOMETIMES : 1
      weight[main] = Math.max(weight[main] || 0, factor)
      const amt = (Number(row.monthly) || 0) + (Number(row.daily) || 0) * 30
      if (item.lockMonths && amt > 0) fixed[main] = (fixed[main] || 0) + amt
    }
  }
  return { weight, fixed }
}

function rollSpent(spentMap) {
  const used = { ...spentMap }
  for (const name of INTO_MISC) {
    used[MISC] = (used[MISC] || 0) + (used[name] || 0)
  }
  return used
}

function splitRows(weights, total, spentMap) {
  const used = rollSpent(spentMap)
  const sum = weights.reduce((s, [, share]) => s + share, 0) || 1
  return weights.map(([name, share]) => {
    const planned = total * (share / sum)
    const u = used[name] || 0
    return { name, share, planned, used: u, over: planned > 0 && u > planned }
  })
}

function finish(plan) {
  const spendAmt = plan.spendAmt || 0
  const spent = plan.spent || 0
  return {
    ready: plan.income > 0,
    dailySpend: spendAmt / 30,
    weeklySpend: spendAmt / 4.345,
    spendUsed: spendAmt > 0 ? (spent / spendAmt) * 100 : 0,
    overSpend: spent > spendAmt && spendAmt > 0,
    ...plan
  }
}

function roundToTotal(parts, total) {
  const goal = Math.round(Number(total) || 0)
  const raw = parts.map((n) => Math.max(0, Number(n) || 0))
  const floors = raw.map((n) => Math.floor(n))
  let left = goal - floors.reduce((s, n) => s + n, 0)
  const order = raw
    .map((n, i) => ({ i, frac: n - Math.floor(n) }))
    .sort((a, b) => b.frac - a.frac)
  const out = [...floors]
  let k = 0
  while (left > 0 && order.length) {
    out[order[k % order.length].i] += 1
    left -= 1
    k += 1
  }
  while (left < 0) {
    const i = out.findIndex((n, idx) => idx !== out.length - 1 && n > 0) 
    if (i < 0) break
    out[i] -= 1
    left += 1
  }
  return out
}

function groupPct(needs, wants, save, income) {
  if (!(income > 0)) return { needs: 0, wants: 0, save: 0 }
  const n = Math.round((needs / income) * 100)
  const w = Math.round((wants / income) * 100)
  return { needs: n, wants: w, save: 100 - n - w }
}

export function applyUserCaps(plan, caps = {}) {
  const income = Number(plan.income) || 0
  if (!plan?.rows || income <= 0) return plan

  const next = plan.rows.map((row) => {
    const suggested = Number(row.planned) || 0
    if (row.name === 'Save') return { ...row, suggested }
    if (row.kind === 'fixed') return { ...row, suggested, planned: suggested }
    const cap = Number(caps[row.name])
    const planned = Number.isFinite(cap) && cap >= 0 ? cap : suggested
    return { ...row, suggested, planned, capped: Number.isFinite(cap) && cap >= 0 }
  })

  const spendRows = next.filter((row) => row.name !== 'Save')
  let overflow = spendRows.reduce((s, row) => s + row.planned, 0) - income
  if (overflow > 0) {
    const order = [
      ...spendRows.filter((row) => !NEED_MAIN.includes(row.name) && row.kind !== 'fixed'),
      ...spendRows.filter((row) => NEED_MAIN.includes(row.name) && row.kind !== 'fixed')
    ]
    for (const row of order) {
      if (overflow <= 0) break
      const cut = Math.min(row.planned, overflow)
      row.planned -= cut
      overflow -= cut
    }
  }

  const spendVals = spendRows.map((row) => row.planned)
  const saveGuess = Math.max(0, income - spendVals.reduce((s, n) => s + n, 0))
  const rounded = roundToTotal([...spendVals, saveGuess], income)
  spendRows.forEach((row, i) => {
    row.planned = rounded[i]
  })
  const saveAmt = rounded[rounded.length - 1] || 0
  const needsAmt = spendRows.filter((row) => NEED_MAIN.includes(row.name)).reduce((s, row) => s + row.planned, 0)
  const wantsAmt = spendRows.filter((row) => !NEED_MAIN.includes(row.name)).reduce((s, row) => s + row.planned, 0)
  const perc = groupPct(needsAmt, wantsAmt, saveAmt, income)

  const rows = next.map((row) => {
    if (row.name === 'Save') {
      return {
        ...row,
        planned: saveAmt,
        daily: saveAmt / 30,
        weekly: saveAmt / 4.345,
        pct: perc.save
      }
    }
    return {
      ...row,
      daily: row.planned / 30,
      weekly: row.planned / 4.345,
      pct: pct(row.planned, income),
      over: row.planned > 0 && (row.used || 0) > row.planned
    }
  })

  return {
    ...plan,
    rows,
    mainCats: rows.filter((row) => row.name !== 'Save'),
    saveAmt,
    needsAmt,
    wantsAmt,
    spendAmt: needsAmt + wantsAmt,
    savePct: perc.save,
    needsPct: perc.needs,
    wantsPct: perc.wants
  }
}

function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function dailySavePace(plan, transactions = []) {
  const now = new Date()
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const day = now.getDate()
  const key = todayKey(now)
  const todaySpend = (transactions || [])
    .filter((row) => row.type === 'expense' && String(row.date || '').slice(0, 10) === key)
    .reduce((s, row) => s + (Number(row.amount) || 0), 0)
  const saveAmt = Number(plan.saveAmt) || 0
  const spendAmt = Number(plan.spendAmt) || 0
  const dailySave = saveAmt / days
  const dailySpend = spendAmt / days
  const savedToday = dailySave + dailySpend - todaySpend
  const monthExpected = ((Number(plan.income) || 0) * day) / days
  const monthSaved = monthExpected - (Number(plan.spent) || 0)
  const extra = Math.max(0, dailySpend - todaySpend)
  const short = Math.max(0, todaySpend - dailySpend)
  const nextAim = dailySave + extra * 0.5 + (short > 0 ? short : dailySave * 0.1)
  return {
    days,
    day,
    dailySave,
    dailySpend,
    todaySpend,
    savedToday,
    monthSaved,
    extra,
    short,
    nextAim
  }
}

export function usedForCategory(categoryData, name) {
  const spentMap = Object.fromEntries(
    (categoryData || []).map((row) => [row.category, Number(row.amount) || 0])
  )
  const used = rollSpent(spentMap)
  const main = toMain(name)
  return used[main] || used[name] || 0
}

export function isWantCategory(name) {
  return Boolean(name) && name !== 'Save' && !NEED_MAIN.includes(toMain(name))
}
