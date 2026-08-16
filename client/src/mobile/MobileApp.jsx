import { useEffect, useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, Bell, ChevronLeft, Eye, EyeOff, Home, LayoutGrid, Plus, Search, Snowflake, User
} from 'lucide-react'
import MoneyFlow from './MoneyFlow.jsx'
import MobileProfile from './MobileProfile.jsx'
import OpeningScreen from './OpeningScreen.jsx'
import SavingPlan from '../components/SavingPlan.jsx'
import DailyLoop from '../components/DailyLoop.jsx'
import LanguageSwitch from '../components/LanguageSwitch.jsx'
import { useI18n } from '../lib/i18n.jsx'
import { usePullRefresh } from '../hooks/usePullRefresh.js'

const TABS = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'income', label: 'Income', icon: ArrowDownLeft },
  { id: 'spend', label: 'Spend', icon: ArrowUpRight },
  { id: 'profile', label: 'You', icon: User }
]

const CAT = {
  'Food & Dining': { bg: '#FFE8DC', fg: '#D4653A' },
  Transportation: { bg: '#DCE8FF', fg: '#3D6FD9' },
  Shopping: { bg: '#EDE4FF', fg: '#7B63C9' },
  Entertainment: { bg: '#FFDDED', fg: '#D45A8A' },
  'Bills & Utilities': { bg: '#FFF3D4', fg: '#C49A1A' },
  Healthcare: { bg: '#D8F4EA', fg: '#1F9A72' },
  Education: { bg: '#D9F0FF', fg: '#2A8FC4' },
  Housing: { bg: '#FFDDE3', fg: '#D45A6A' },
  'Personal Care': { bg: '#E8E0FF', fg: '#6B5BB5' },
  Travel: { bg: '#D5F5F0', fg: '#1A9A8A' },
  'Gifts & Donations': { bg: '#FFE4D0', fg: '#E07A3A' },
  Salary: { bg: '#D8F5E8', fg: '#00A86B' },
  Freelance: { bg: '#D6F3EE', fg: '#0E8F82' },
  Business: { bg: '#E0E4FF', fg: '#4F5BD5' },
  Investment: { bg: '#D9F6E3', fg: '#1F9A5A' },
  Gift: { bg: '#FFF0D4', fg: '#C4891A' },
  Other: { bg: '#ECECEC', fg: '#6B6B6B' }
}

function catTone(name) {
  return CAT[name] || { bg: '#E6F4F0', fg: '#00A86B' }
}

export default function MobileApp({
  page, setPage, currency, money, summary, transactions, goals, budgets,
  categoryData, trend, profile, onAdd, onDeleteTx, onUpdateGoal, onDeleteGoal,
  onSavedProfile, onRestored, onRefresh, onPaySelf, onLockLeft, onFreeze, onPickGoal, onEditTx
}) {
  const name = profile?.full_name || ''
  const first = name.split(' ')[0]
  const [intro, setIntro] = useState(true)
  const pull = usePullRefresh(onRefresh)

  useEffect(() => {
    if (!intro && page === 'dashboard') onRefresh?.().catch(() => {})
  }, [page, intro])

  if (intro) {
    return <OpeningScreen onDone={() => setIntro(false)} />
  }

  return (
    <div className="m-app flex h-full flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto"
        ref={pull.ref}
        {...pull.handlers}
      >
        {(pull.offset > 0 || pull.busy) && (
          <div className="pull-fresh" style={{ height: pull.offset }}>
            <i className={pull.busy ? 'is-spin' : ''} />
          </div>
        )}
        {page === 'dashboard' && (
          <HomeScreen
            name={name}
            first={first}
            summary={summary}
            money={money}
            transactions={transactions}
            profile={profile}
            categoryData={categoryData}
            onProfile={() => setPage('profile')}
            onSeeAll={() => setPage('transactions')}
            onAdd={onAdd}
            onSaved={onSavedProfile}
            goals={goals}
            onPaySelf={onPaySelf}
            onLockLeft={onLockLeft}
            onFreeze={onFreeze}
            onEdit={onEditTx}
          />
        )}
        {page === 'income' && (
          <MoneyFlow
            mode="in"
            money={money}
            transactions={transactions}
            trend={trend}
            categoryData={categoryData}
            onBack={() => setPage('dashboard')}
            onDelete={onDeleteTx}
          />
        )}
        {page === 'spend' && (
          <MoneyFlow
            mode="out"
            money={money}
            transactions={transactions}
            trend={trend}
            categoryData={categoryData}
            onBack={() => setPage('dashboard')}
            onDelete={onDeleteTx}
          />
        )}
        {page === 'transactions' && (
          <ActivityScreen items={transactions} money={money} onDelete={onDeleteTx} onEdit={onEditTx} onBack={() => setPage('dashboard')} />
        )}
        {page === 'goals' && (
          <GoalsScreen items={goals} money={money} onUpdate={onUpdateGoal} onDelete={onDeleteGoal} />
        )}
        {page === 'budget' && (
          <BudgetScreen items={budgets} money={money} />
        )}
        {page === 'analytics' && (
          <MoneyFlow
            mode="out"
            money={money}
            transactions={transactions}
            trend={trend}
            categoryData={categoryData}
            onBack={() => setPage('dashboard')}
            onDelete={onDeleteTx}
          />
        )}
        {page === 'profile' && (
          <MobileProfile currencyCode={currency.code} onSaved={onSavedProfile} onRestored={onRestored} />
        )}
      </div>

      <nav className="m-dock" aria-label="Primary">
        {TABS.slice(0, 2).map((tab) => (
          <DockBtn key={tab.id} tab={tab} page={page} setPage={setPage} />
        ))}
        <button type="button" className="m-dock-plus" aria-label="Add" onClick={() => onAdd(page === 'income' ? 'income' : 'expense')}>
          <Plus size={26} strokeWidth={2.5} />
        </button>
        {TABS.slice(2).map((tab) => (
          <DockBtn key={tab.id} tab={tab} page={page} setPage={setPage} />
        ))}
      </nav>
    </div>
  )
}

function DockBtn({ tab, page, setPage }) {
  const { t } = useI18n()
  const Icon = tab.icon
  const on = page === tab.id
  const labels = { dashboard: 'home', income: 'income', spend: 'spend', profile: 'you' }
  return (
    <button type="button" className={on ? 'is-on' : ''} onClick={() => setPage(tab.id)}>
      <Icon size={22} strokeWidth={on ? 2.6 : 2} />
      {t(labels[tab.id], tab.label)}
    </button>
  )
}

function HomeScreen({ name, first, summary, money, transactions, profile, categoryData, onProfile, onSeeAll, onAdd, onSaved, goals, onPaySelf, onLockLeft, onFreeze, onPickGoal, onEdit }) {
  const { t } = useI18n()
  const [hide, setHide] = useState(false)
  const [q, setQ] = useState('')
  const [searchOn, setSearchOn] = useState(false)
  const hour = new Date().getHours()
  const hello = hour < 12 ? t('hello.m') : hour < 18 ? t('hello.a') : t('hello.e')
  const recent = (transactions || []).slice(0, 5)
  const visible = q.trim()
    ? recent.filter((t) => `${t.category} ${t.description || ''}`.toLowerCase().includes(q.trim().toLowerCase()))
    : recent
  const monthIn = summary?.month_income || 0
  const pct = summary?.income > 0 ? (monthIn / summary.income) * 100 : 0
  const masked = '••••••'

  return (
    <div className="home">
      <header className="home-top">
        <button type="button" className="home-user" onClick={onProfile}>
          <span>{(first || 'T').charAt(0)}</span>
          <div>
            <small>{hello}</small>
            <strong>{name || t('there')}</strong>
          </div>
        </button>
        <div className="home-tools">
          <LanguageSwitch tone="dark" />
          <button type="button" aria-label={t('search')} onClick={() => setSearchOn((v) => !v)}>
            <Search size={18} />
          </button>
          <button type="button" aria-label="Alerts">
            <Bell size={18} />
          </button>
        </div>
      </header>

      {searchOn && (
        <input
          className="home-search"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search')}
        />
      )}

      <p className="home-kicker">{t('totalBalance')}</p>
      <div className="home-bal">
        <h1>{summary ? (hide ? masked : money(summary.balance)) : '—'}</h1>
        <button type="button" aria-label="Hide balance" onClick={() => setHide((v) => !v)}>
          {hide ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <div className="home-delta">
        <span>{hide ? masked : `+${money(monthIn)}`}</span>
        <em>{pct.toFixed(1)}%</em>
      </div>

      <div className="home-cta">
        <button type="button" onClick={() => onAdd('income')}>
          <Plus size={20} />
          <span>{t('income')}</span>
        </button>
        <button type="button" className="is-fill" onClick={() => onAdd('expense')}>
          <ArrowUpRight size={20} />
          <span>{t('expenses')}</span>
        </button>
        <button type="button" onClick={onFreeze}>
          <Snowflake size={20} />
          <span>{t('loop.ice')}</span>
        </button>
        <button type="button" onClick={onSeeAll}>
          <LayoutGrid size={20} />
          <span>{t('all')}</span>
        </button>
      </div>

      <section className="home-sheet">
        <DailyLoop
          profile={profile}
          summary={summary}
          categoryData={categoryData}
          transactions={transactions}
          goals={goals}
          money={money}
          onPaySelf={onPaySelf}
          onLockLeft={onLockLeft}
          onAdd={onAdd}
          onPickGoal={onPickGoal}
        />
        <SavingPlan profile={profile} summary={summary} money={money} categoryData={categoryData} transactions={transactions} onSaved={onSaved} />
        <div className="home-today">
          <p>{t('today')}</p>
          <button type="button" onClick={onSeeAll}>{t('all')}</button>
        </div>
        {visible.map((row) => (
          <TxRow key={row.id} t={row} money={money} onEdit={onEdit} />
        ))}
        {visible.length === 0 && <p className="home-empty">{t('empty')}</p>}
      </section>
    </div>
  )
}

function ActivityScreen({ items, money, onDelete, onEdit, onBack }) {
  const { t } = useI18n()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [find, setFind] = useState(false)

  const filtered = (items || []).filter((t) => {
    if (filter === 'in' && t.type !== 'income') return false
    if (filter === 'out' && t.type !== 'expense') return false
    const hay = `${t.category} ${t.description || ''}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })
  const groups = groupByDate(filtered)

  return (
    <div className="m-history">
      <header className="m-hist-head">
        <button type="button" className="m-icon-btn" onClick={onBack} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <h1>{t('history')}</h1>
        <button type="button" className="m-icon-btn" onClick={() => setFind((v) => !v)} aria-label="Search">
          <Search size={18} />
        </button>
      </header>

      {find && (
        <div className="px-4 pb-2">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search')}
            className="m-search"
          />
        </div>
      )}

      <div className="m-chips">
        {[
          { id: 'all', label: t('all') },
          { id: 'in', label: t('income') },
          { id: 'out', label: t('sent') }
        ].map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`m-chip ${filter === chip.id ? 'is-on' : ''}`}
            onClick={() => setFilter(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">
        {groups.length === 0 && <p className="py-10 text-center text-sm text-muted">{t('empty')}</p>}
        {groups.map((group) => (
          <div key={group.date} className="mt-5">
            <p className="mb-1 text-[13px] text-[#9a9a9a]">{group.label}</p>
            {group.items.map((t) => (
              <TxRow key={t.id} t={t} money={money} onDelete={onDelete} onEdit={onEdit} history />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function GoalsScreen({ items, money, onUpdate, onDelete }) {
  return (
    <div className="m-pad pb-8">
      <h1 className="text-[28px] font-semibold tracking-tight text-ink">Goals</h1>
      <div className="mt-5 space-y-3">
        {items.length === 0 && <p className="text-sm text-muted">Empty</p>}
        {items.map((goal) => (
          <article key={goal.id} className="m-card">
            <div className="flex justify-between gap-3">
              <h3 className="font-semibold text-ink">{goal.name}</h3>
              <span className="text-[13px] font-semibold text-brand">{goal.progress.toFixed(0)}%</span>
            </div>
            <p className="mt-2 text-sm text-muted">{money(goal.current_amount)} / {money(goal.target_amount)}</p>
            <div className="m-bar mt-3"><i style={{ width: `${Math.min(goal.progress, 100)}%` }} /></div>
            <div className="mt-3 flex gap-2">
              <input id={`m-goal-${goal.id}`} type="number" step="0.01" className="field min-w-0 flex-1 !rounded-xl" />
              <button
                type="button"
                className="btn-primary rounded-xl px-3 text-sm font-semibold"
                onClick={() => {
                  const value = parseFloat(document.getElementById(`m-goal-${goal.id}`).value)
                  if (value > 0) onUpdate(goal.id, value)
                }}
              >
                Add
              </button>
              <button type="button" className="px-2 text-sm text-rose-500" onClick={() => onDelete(goal.id)}>×</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function BudgetScreen({ items, money }) {
  return (
    <div className="m-pad pb-8">
      <h1 className="text-[28px] font-semibold tracking-tight text-ink">Budget</h1>
      <div className="mt-5 space-y-3">
        {items.length === 0 && <p className="text-sm text-muted">Empty</p>}
        {items.map((budget) => {
          const over = budget.remaining < 0
          return (
            <article key={budget.id || budget.category} className="m-card">
              <div className="flex items-center gap-3">
                <span className="m-glyph" style={{ background: catTone(budget.category).bg, color: catTone(budget.category).fg }}>
                  {budget.category.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <h3 className="truncate font-semibold text-ink">{budget.category}</h3>
                    <span className={`text-[12px] font-semibold ${over ? 'text-rose-500' : 'text-brand'}`}>
                      {over ? 'Over' : `${money(budget.remaining)}`}
                    </span>
                  </div>
                  <div className="m-bar mt-2">
                    <i className={over ? 'is-over' : ''} style={{ width: `${Math.min(budget.percentage, 100)}%`, background: catTone(budget.category).fg }} />
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function TxRow({ t: row, money, onDelete, onEdit, history = false, dark = false }) {
  const { t } = useI18n()
  const tone = catTone(row.category)
  const inFlow = row.type === 'income'
  const stamp = formatStamp(row.date)
  return (
    <button type="button" className={history ? 'm-hist-row' : 'm-row'} onClick={() => !inFlow && onEdit?.(row)}>
      <span className="m-glyph" style={{ background: tone.bg, color: tone.fg }}>
        {row.category.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${dark ? 'text-white' : 'text-[#111]'}`}>{t(`cat.${row.category}`, row.category)}</p>
        <p className={`truncate text-[12px] ${dark ? 'text-white/45' : 'text-[#9a9a9a]'}`}>{row.description || (inFlow ? t('received') : t('sent'))}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`tabular text-[15px] font-semibold ${inFlow ? 'text-[#16C784]' : history ? 'text-[#e85a7a]' : dark ? 'text-white' : 'text-[#111]'}`}>
          {inFlow ? '+' : '−'}{money(row.amount)}
        </p>
        {history && <p className="mt-0.5 text-[11px] text-[#9a9a9a]">{stamp}</p>}
        {onDelete && (
          <span
            role="button"
            tabIndex={0}
            className="text-[11px] text-[#9a9a9a]"
            onClick={(e) => { e.stopPropagation(); onDelete(row.id) }}
          >×</span>
        )}
      </div>
    </button>
  )
}

function groupByDate(items) {
  const map = new Map()
  for (const item of items || []) {
    const key = item.date || 'Unknown'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return [...map.entries()].map(([date, rows]) => ({
    date,
    label: formatDay(date),
    items: rows
  }))
}

function formatStamp(value) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDay(value) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  const today = new Date()
  const yday = new Date()
  yday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
