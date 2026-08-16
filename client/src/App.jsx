import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, Target, Wallet, PieChart,
  TrendingUp, TrendingDown, Search, X, Sun, Moon, Lightbulb, User, Globe, ChevronDown
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart as RePie, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Legend
} from 'recharts'
import Modal from './components/Modal.jsx'
import Profile from './components/Profile.jsx'
import QuickAdd from './components/QuickAdd.jsx'
import LanguageSwitch from './components/LanguageSwitch.jsx'
import MobileApp from './mobile/MobileApp.jsx'
import { COUNTRIES } from './data/currencies.js'
import {
  addGoal, addTransaction, deleteGoal, deleteTransaction, getBudgets, getGoals,
  getInsights, getMonthlyTrend, getSpendingByCategory, getSummary, getTransactions,
  getProfile, saveProfile, setBudget, updateGoal, updateTransaction
} from './lib/api.js'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, formatMoney, loadCurrency, saveCurrency } from './lib/currency.js'
import { freezeOn, livePlan, lockStamp, payStamp, pickGoal } from './lib/dailyLoop.js'
import { isWantCategory, toMain, usedForCategory } from './lib/savingPlan.js'
import { THEMES, APP_NAME, loadTheme, saveTheme } from './lib/settings.js'
import { dailyTipSet } from './lib/tips.js'
import { useNativeShell } from './hooks/useNativeShell.js'
import { usePullRefresh } from './hooks/usePullRefresh.js'
import { useI18n } from './lib/i18n.jsx'

const NAV = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'analytics', label: 'Analytics', icon: PieChart }
]

const PIE_COLORS = ['#118BE3', '#4554E5', '#16C784', '#0F1941', '#7C6BC4', '#FF8A4C', '#F5C451', '#38BDF8']

export default function App() {
  const { t } = useI18n()
  const [page, setPage] = useState('dashboard')
  const [currency, setCurrency] = useState(loadCurrency)
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState(loadTheme)
  const [summary, setSummary] = useState(null)
  const [insights, setInsights] = useState([])
  const [transactions, setTransactions] = useState([])
  const [goals, setGoals] = useState([])
  const [budgets, setBudgets] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [trend, setTrend] = useState({ labels: [], income: [], expenses: [] })
  const [modal, setModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  const money = (n) => formatMoney(n, currency)
  const initial = APP_NAME.charAt(0)

  const countries = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter((c) => c.country.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [query])

  async function refresh() {
    const [s, t, g, b] = await Promise.all([
      getSummary(), getTransactions(), getGoals(), getBudgets()
    ])
    setSummary(s)
    setTransactions(t)
    setGoals(g)
    setBudgets(b)
    setInsights(await getInsights(currency.code))
  }

  async function loadCharts() {
    const [cats, monthly] = await Promise.all([getSpendingByCategory(), getMonthlyTrend()])
    setCategoryData(cats)
    setTrend(monthly)
  }

  async function reload() {
    await Promise.all([
      refresh(),
      loadCharts(),
      getProfile().then(setProfile).catch(() => {})
    ])
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.title = APP_NAME
  }, [])

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {})
  }, [])

  useEffect(() => {
    refresh().catch(console.error)
  }, [currency.code])

  useEffect(() => {
    function onVis() {
      if (document.visibilityState === 'visible') reload().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [currency.code])

  useEffect(() => {
    if (['analytics', 'dashboard', 'income', 'spend'].includes(page)) loadCharts().catch(console.error)
  }, [page])

  function changeCurrency(value) {
    const [country, code, locale] = value.split('|')
    const next = { country, code, locale }
    setCurrency(next)
    saveCurrency(next)
  }

  function changeTheme(id) {
    setTheme(id)
    saveTheme(id)
  }

  const native = useNativeShell()
  const pull = usePullRefresh(reload)

  function openAdd(kind) {
    if (kind === 'goal') setModal({ type: 'goal' })
    else if (kind === 'budget') setModal({ type: 'budget' })
    else setModal({ type: 'transaction', kind })
  }

  async function bumpSave(amount) {
    const n = Math.round(Number(amount) || 0)
    if (n <= 0) return
    const g = pickGoal(goals, profile)
    if (!g) {
      await addGoal({ name: 'Bachat', target_amount: Math.max(n * 12, 100000), current_amount: n })
    } else {
      await updateGoal(g.id, (Number(g.current_amount) || 0) + n)
    }
  }

  const modalLayer = (
    <>
      {modal?.type === 'transaction' && modal.kind === 'expense' && (
        <QuickAdd
          sheet={native}
          currency={currency.code}
          profile={profile}
          summary={summary}
          categoryData={categoryData}
          transactions={transactions}
          onClose={() => setModal(null)}
          onSave={async (payload) => {
            if (freezeOn(profile) && isWantCategory(payload.category)) return
            await addTransaction(payload)
            setModal(null)
            refresh()
            loadCharts().catch(() => {})
          }}
        />
      )}
      {modal?.type === 'edit' && (
        <QuickAdd
          sheet={native}
          edit={modal.tx}
          currency={currency.code}
          profile={profile}
          summary={summary}
          categoryData={categoryData}
          transactions={transactions}
          onClose={() => setModal(null)}
          onSave={async (payload) => {
            await updateTransaction(modal.tx.id, payload)
            setModal(null)
            refresh()
            loadCharts().catch(() => {})
          }}
        />
      )}
      {modal?.type === 'transaction' && modal.kind !== 'expense' && (
        <TransactionForm
          sheet={native}
          kind={modal.kind}
          currency={currency.code}
          categoryData={categoryData}
          caps={profile?.plan_caps}
          onClose={() => setModal(null)}
          onSave={async (payload) => { await addTransaction(payload); setModal(null); refresh() }}
        />
      )}
      {modal?.type === 'goal' && (
        <GoalForm
          sheet={native}
          currency={currency.code}
          onClose={() => setModal(null)}
          onSave={async (payload) => { await addGoal(payload); setModal(null); refresh() }}
        />
      )}
      {modal?.type === 'budget' && (
        <BudgetForm
          sheet={native}
          currency={currency.code}
          onClose={() => setModal(null)}
          onSave={async (payload) => { await setBudget(payload); setModal(null); refresh() }}
        />
      )}
    </>
  )

  if (native) {
    return (
      <div className="h-full native-ui">
        <MobileApp
          page={page}
          setPage={setPage}
          currency={currency}
          money={money}
          summary={summary}
          transactions={transactions}
          goals={goals}
          budgets={budgets}
          categoryData={categoryData}
          trend={trend}
          profile={profile}
          onAdd={openAdd}
          onDeleteTx={async (id) => { await deleteTransaction(id); refresh() }}
          onUpdateGoal={async (id, amount) => { await updateGoal(id, amount); refresh() }}
          onDeleteGoal={async (id) => { await deleteGoal(id); refresh() }}
          onSavedProfile={setProfile}
          onRestored={() => {
            reload().catch(() => {})
          }}
          onRefresh={reload}
          onPaySelf={async () => {
            if (!profile || profile[payStamp()]) return
            const plan = livePlan(profile, summary, categoryData)
            await bumpSave(plan.saveAmt)
            const saved = await saveProfile({ ...profile, [payStamp()]: true })
            setProfile(saved)
            await refresh()
          }}
          onLockLeft={async (extra) => {
            if (!profile || profile[lockStamp()]) return
            await bumpSave(extra)
            const saved = await saveProfile({ ...profile, [lockStamp()]: true })
            setProfile(saved)
            await refresh()
          }}
          onFreeze={async () => {
            if (!profile) return
            const until = freezeOn(profile) ? 0 : Date.now() + 48 * 60 * 60 * 1000
            const saved = await saveProfile({ ...profile, wants_freeze_until: until })
            setProfile(saved)
          }}
          onPickGoal={async (id) => {
            if (!profile) return
            const saved = await saveProfile({ ...profile, save_goal_id: id })
            setProfile(saved)
          }}
          onEditTx={(tx) => setModal({ type: 'edit', tx })}
        />
        {modalLayer}
      </div>
    )
  }

  const sidebar = (
    <div className="sidebar-panel flex h-full flex-col">
      <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="brand-mark" aria-hidden="true">{initial}</div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold tracking-tight text-white">{APP_NAME}</p>
            <p className="text-xs font-medium text-slate-300">{t('workspace')}</p>
          </div>
        </div>
        <button className="rounded-lg p-2 text-white md:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setMenuOpen(false) }}
              className={`nav-link flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 ${active ? 'is-active' : 'hover:bg-white/10'}`}
            >
              <Icon size={18} strokeWidth={2.25} />
              {t(`nav.${item.id}`)}
            </button>
          )
        })}
      </nav>
      <div className="space-y-3 border-t border-white/10 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-300">{t('theme')}</p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((item) => (
            <button
              key={item.id}
              onClick={() => changeTheme(item.id)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold ${
                theme === item.id ? 'btn-primary' : 'bg-white/10 text-white'
              }`}
            >
              {item.id === 'light' ? <Sun size={14} /> : <Moon size={14} />}
              {t(item.id)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full w-full overflow-hidden bg-app md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} aria-label="Close sidebar" />
          <div className="absolute inset-y-0 left-0 w-[min(280px,88vw)] overflow-hidden shadow-xl">
            {sidebar}
          </div>
        </div>
      )}

      <aside className="hidden min-h-0 md:flex md:h-full md:flex-col">
        {sidebar}
      </aside>

      <main
        className="page-canvas min-h-0 min-w-0 overflow-x-hidden overflow-y-auto"
        ref={pull.ref}
        {...pull.handlers}
      >
        {(pull.offset > 0 || pull.busy) && (
          <div className="pull-fresh" style={{ height: pull.offset }}>
            <i className={pull.busy ? 'is-spin' : ''} />
          </div>
        )}
        <header className="safe-header sticky top-0 z-10 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="brand-mark md:hidden" aria-hidden="true">{initial}</div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{APP_NAME}</p>
                <h1 className="truncate text-xl font-semibold leading-tight text-ink">
                  {page === 'dashboard' ? t('page.overview') : page === 'profile' ? t('page.profile') : t(`nav.${page}`)}
                </h1>
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              <LanguageSwitch />
              <button
                type="button"
                onClick={() => changeTheme(theme === 'light' ? 'dark' : 'light')}
                className="grid h-10 w-10 place-items-center rounded-full text-ink ring-1 ring-line md:hidden"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <div className="field hidden w-[min(100%,170px)] items-center gap-2 sm:flex">
                <Search size={14} className="shrink-0 text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchCountry')}
                  className="h-full w-full min-w-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
                />
              </div>
              <label className="field relative flex w-[118px] shrink-0 items-center gap-1.5 sm:w-[min(100%,220px)]">
                <Globe size={16} strokeWidth={2.25} className="shrink-0 text-brand" aria-hidden="true" />
                <span className="pointer-events-none min-w-0 flex-1 truncate text-[13px] font-semibold text-ink sm:hidden">
                  {currency.code}
                </span>
                <select
                  value={`${currency.country}|${currency.code}|${currency.locale}`}
                  onChange={(e) => changeCurrency(e.target.value)}
                  aria-label="Select country currency"
                  className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0 sm:static sm:h-full sm:min-w-0 sm:flex-1 sm:opacity-100"
                >
                  {countries.map((c) => (
                    <option key={`${c.country}-${c.code}`} value={`${c.country}|${c.code}|${c.locale}`}>
                      {c.country} ({c.code})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} strokeWidth={2.5} className="pointer-events-none shrink-0 text-ink" aria-hidden="true" />
              </label>
              <button
                onClick={() => setModal({ type: 'transaction', kind: 'income' })}
                className="btn-primary hidden h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold sm:inline-flex sm:items-center"
              >
                {t('addIncome')}
              </button>
              <button
                type="button"
                onClick={() => setPage('profile')}
                className="profile-btn compact sm:w-auto sm:px-[14px]"
                aria-label="Open profile"
              >
                <User size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">{profile?.full_name ? profile.full_name.split(' ')[0] : t('nav.profile')}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8">

        {page === 'dashboard' && summary && (
          <Dashboard
            summary={summary}
            insights={insights}
            money={money}
            transactions={transactions}
            trend={trend}
            profile={profile}
            categoryData={categoryData}
            onAdd={(kind) => setModal({ type: 'transaction', kind })}
            onSeeAll={() => setPage('transactions')}
            onSaved={setProfile}
          />
        )}
        {page === 'transactions' && (
          <Transactions
            items={transactions}
            money={money}
            onAdd={() => setModal({ type: 'transaction', kind: 'expense' })}
            onDelete={async (id) => { await deleteTransaction(id); refresh() }}
          />
        )}
        {page === 'goals' && (
          <Goals
            items={goals}
            money={money}
            onAdd={() => setModal({ type: 'goal' })}
            onUpdate={async (id, amount) => { await updateGoal(id, amount); refresh() }}
            onDelete={async (id) => { await deleteGoal(id); refresh() }}
          />
        )}
        {page === 'budget' && (
          <Budgets items={budgets} money={money} onAdd={() => setModal({ type: 'budget' })} />
        )}
        {page === 'analytics' && (
          <Analytics categoryData={categoryData} trend={trend} money={money} />
        )}
        {page === 'profile' && (
          <Profile
            currencyCode={currency.code}
            onSaved={setProfile}
            onRestored={() => {
              refresh().catch(() => {})
              getProfile().then(setProfile).catch(() => {})
            }}
          />
        )}
        </div>
      </main>

      {modalLayer}
    </div>
  )
}

function Dashboard({ summary, insights, money, transactions, trend, profile, categoryData, onAdd, onSeeAll, onSaved }) {
  const { t } = useI18n()
  const savingsRate = summary.income > 0 ? (summary.balance / summary.income) * 100 : 0
  const recent = (transactions || []).slice(0, 6)
  const line = (trend.labels || []).map((label, i) => ({
    name: label,
    income: trend.income?.[i] || 0,
    expenses: trend.expenses?.[i] || 0
  }))
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
  const cards = [
    { label: t('income'), value: summary.income, month: summary.month_income, tone: 'text-emerald-500', icon: TrendingUp },
    { label: t('expenses'), value: summary.expenses, month: summary.month_expenses, tone: 'text-rose-500', icon: TrendingDown },
    { label: t('balance'), value: summary.balance, month: summary.month_balance, tone: 'text-brand', icon: Wallet }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">{today}</p>
          <h2 className="mt-1 text-[28px] font-semibold tracking-tight text-ink sm:text-4xl">{t('headline')}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onAdd('income')} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">{t('btn.income')}</button>
          <button onClick={() => onAdd('expense')} className="rounded-full bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-500">{t('btn.expense')}</button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article key={card.label} className="card rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{card.label}</p>
                <span className="icon-well"><Icon size={16} /></span>
              </div>
              <p className={`money mt-5 text-[30px] leading-none ${card.tone}`}>{money(card.value)}</p>
              <p className="mt-3 text-sm text-muted">{t('thisMonth')} {money(card.month)}</p>
            </article>
          )
        })}
      </section>

      <article className="card rounded-2xl p-5">
        <SavingPlan profile={profile} summary={summary} money={money} categoryData={categoryData} transactions={transactions} onSaved={onSaved} />
      </article>

      <section className="card rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink">{t('cashFlow')}</h3>
            <p className="text-sm text-muted">{t('cashFlowHint')}</p>
          </div>
          <p className="text-sm font-medium text-brand">{savingsRate.toFixed(1)}{t('savedPct')}</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer>
            <AreaChart data={line}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => money(v)} />
              <Area type="monotone" dataKey="income" stroke="#16C784" fill="rgba(22,199,132,0.16)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#4554E5" fill="rgba(69,84,229,0.12)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-semibold text-ink">{t('recent')}</h3>
          <button onClick={onSeeAll} className="text-sm font-semibold text-brand">{t('viewAll')}</button>
        </div>
        <div className="divide-y divide-line">
          {recent.length === 0 && <p className="px-5 py-10 text-sm text-muted">{t('noTx')}</p>}
          {recent.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{t(`cat.${row.category}`, row.category)}</p>
                <p className="truncate text-xs text-muted">{row.description || row.date}</p>
              </div>
              <p className={`tabular shrink-0 text-sm font-semibold ${row.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {row.type === 'income' ? '+' : '−'}{money(row.amount)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <DailyTips insights={insights} />
    </div>
  )
}

function DailyTips({ insights }) {
  const { t } = useI18n()
  const { featured, more } = dailyTipSet()
  const stamp = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
  const personal = (insights || []).slice(0, 2)

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{t('briefing')}</p>
          <h3 className="mt-1 text-xl font-semibold text-ink">{t('tips')}</h3>
        </div>
        <p className="text-sm text-muted">{stamp}</p>
      </div>

      <article className="card relative overflow-hidden rounded-2xl p-6 sm:p-7">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/10" />
        <div className="flex items-start gap-4">
          <span className="icon-well mt-0.5 shrink-0"><Lightbulb size={18} /></span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t('tipDay')}</p>
            <h4 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{featured.title}</h4>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{featured.body}</p>
            <p className="mt-4 inline-flex rounded-full bg-brandsoft px-3 py-1.5 text-sm font-semibold text-brand">
              {featured.action}
            </p>
          </div>
        </div>
      </article>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {more.map((tip, index) => (
          <article key={tip.title} className="card rounded-2xl p-5">
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-brand">0{index + 1}</p>
            <h4 className="mt-3 font-semibold text-ink">{tip.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-muted">{tip.body}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand">{tip.action}</p>
          </article>
        ))}
      </div>

      {personal.length > 0 && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {personal.map((insight) => (
            <article key={insight.title} className="card rounded-2xl p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">For your ledger</p>
              <h4 className="mt-2 font-semibold text-ink">{insight.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{insight.message}</p>
              {insight.tip && <p className="mt-3 text-sm font-medium text-ink">{insight.tip}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function Transactions({ items, money, onAdd, onDelete }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Activity</h2>
          <p className="text-sm text-muted">{items.length} recorded {items.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <button onClick={onAdd} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">Add transaction</button>
      </div>
      <div className="card overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[110px_1fr_140px_72px] gap-3 border-b border-line px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted sm:grid">
          <span>Date</span>
          <span>Details</span>
          <span className="text-right">Amount</span>
          <span />
        </div>
        {items.length === 0 && <p className="px-5 py-14 text-center text-sm text-muted">No transactions yet.</p>}
        <div className="divide-y divide-line">
          {items.map((t) => (
            <div key={t.id} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[110px_1fr_140px_72px] sm:items-center sm:gap-3">
              <p className="text-sm text-muted">{t.date}</p>
              <div className="min-w-0">
                <p className="font-medium text-ink">{t.category}</p>
                <p className="truncate text-sm text-muted">{t.description || '—'}</p>
              </div>
              <p className={`tabular text-right text-sm font-semibold ${t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {t.type === 'income' ? '+' : '−'}{money(t.amount)}
              </p>
              <button onClick={() => onDelete(t.id)} className="justify-self-end text-xs font-medium text-muted hover:text-rose-700">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Goals({ items, money, onAdd, onUpdate, onDelete }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Savings goals</h2>
          <p className="text-sm text-muted">Track progress toward each target</p>
        </div>
        <button onClick={onAdd} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">New goal</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((goal) => (
          <article key={goal.id} className="card flex flex-col rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink">{goal.name}</h3>
                {goal.deadline && <p className="mt-1 text-sm text-muted">Due {goal.deadline}</p>}
              </div>
              <span className="rounded-full bg-brandsoft px-2.5 py-1 text-xs font-semibold text-brand">{goal.progress.toFixed(0)}%</span>
            </div>
            <p className="mt-4 tabular text-sm font-medium text-ink">{money(goal.current_amount)} <span className="font-normal text-muted">of {money(goal.target_amount)}</span></p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-app">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(goal.progress, 100)}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
              <input id={`goal-${goal.id}`} type="number" step="0.01" placeholder="Add amount" className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none" />
              <button
                type="button"
                onClick={() => {
                  const value = parseFloat(document.getElementById(`goal-${goal.id}`).value)
                  if (value > 0) onUpdate(goal.id, value)
                }}
                className="h-10 rounded-lg bg-ink px-3 text-sm font-semibold text-white"
              >
                Update
              </button>
              <button type="button" onClick={() => onDelete(goal.id)} className="h-10 px-2 text-sm font-medium text-rose-700">Delete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Budgets({ items, money, onAdd }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Monthly budgets</h2>
          <p className="text-sm text-muted">Limits by category for this month</p>
        </div>
        <button onClick={onAdd} className="btn-primary rounded-full px-4 py-2 text-sm font-semibold">Set budget</button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((budget) => {
          const over = budget.remaining < 0
          const watch = !over && budget.percentage > 80
          const status = over ? 'Over budget' : watch ? 'Near limit' : 'On track'
          const bar = over ? 'bg-rose-500' : watch ? 'bg-amber-500' : 'bg-brand'
          return (
            <article key={budget.id || budget.category} className="card rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-ink">{budget.category}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${over ? 'bg-rose-100 text-rose-700' : watch ? 'bg-amber-100 text-amber-800' : 'bg-brandsoft text-brand'}`}>
                  {status}
                </span>
              </div>
              <p className="mt-3 tabular text-sm text-ink">
                {money(budget.spent)} <span className="text-muted">of {money(budget.amount)}</span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-app">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }} />
              </div>
              <p className={`mt-3 text-sm ${over ? 'text-rose-700' : 'text-muted'}`}>
                {over ? `Over by ${money(Math.abs(budget.remaining))}` : `${money(budget.remaining)} remaining`}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Analytics({ categoryData, trend, money }) {
  const pie = categoryData.map((d) => ({ name: d.category, value: d.amount }))
  const total = pie.reduce((sum, item) => sum + Number(item.value || 0), 0)
  const line = (trend.labels || []).map((label, i) => ({
    name: formatMonthLabel(label),
    income: trend.income?.[i] || 0,
    expenses: trend.expenses?.[i] || 0
  }))
  const tooltipStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    color: 'var(--ink)'
  }

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-2">
      <article className="card min-w-0 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-ink">Spending mix</h3>
        <p className="mb-5 text-sm text-muted">Where your money went, by category</p>
        <div className="grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(220px,280px)_1fr]">
          <div className="relative mx-auto h-64 w-full max-w-[280px]">
            <ResponsiveContainer>
              <RePie>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={72} outerRadius={104} paddingAngle={2} stroke="var(--surface)">
                  {pie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, name) => [money(v), name]} contentStyle={tooltipStyle} />
              </RePie>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Total</p>
              <p className="money px-3 text-center text-lg text-ink">{money(total)}</p>
            </div>
          </div>
          <ul className="grid min-w-0 gap-x-6 gap-y-2 sm:grid-cols-2">
            {pie.length === 0 && <li className="text-sm text-muted">No spending yet.</li>}
            {pie.map((item, i) => {
              const share = total ? (item.value / total) * 100 : 0
              return (
                <li key={item.name} className="flex min-w-0 items-start gap-2 text-sm">
                  <span
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{item.name}</span>
                    <span className="block tabular-nums text-muted">{money(item.value)} · {share.toFixed(0)}%</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </article>
      <article className="card min-w-0 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-ink">Monthly trend</h3>
        <p className="mb-5 text-sm text-muted">Income and expenses by month</p>
        <div className="h-80 min-w-0">
          <ResponsiveContainer>
            <AreaChart data={line} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted)" tick={{ fill: 'var(--ink)', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted)" tick={{ fill: 'var(--ink)', fontSize: 12 }} tickFormatter={(v) => money(v)} width={86} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => money(v)} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ color: 'var(--ink)', fontSize: 13 }} />
              <Area type="monotone" dataKey="income" name="Amdan" stroke="#16C784" fill="rgba(22,199,132,0.14)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#4554E5" fill="rgba(69,84,229,0.1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  )
}

function formatMonthLabel(value) {
  if (!value || !String(value).includes('-')) return value
  const [year, month] = String(value).split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function Field({ label, children }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}

const inputClass = 'field w-full'

function TransactionForm({ kind, currency, onClose, onSave, sheet, categoryData, caps }) {
  const { t } = useI18n()
  const cats = kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const [cat, setCat] = useState('')
  const [warned, setWarned] = useState(false)
  const want = kind === 'expense' && isWantCategory(cat)
  return (
    <Modal title={`Add ${kind}`} onClose={onClose} sheet={sheet}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.target)
          const amount = Number(data.get('amount'))
          const category = data.get('category')
          const main = toMain(category)
          const cap = Number(caps?.[main] ?? caps?.[category])
          const used = usedForCategory(categoryData, category)
          const over = kind === 'expense' && cap > 0 && used + amount > cap
          const pause = kind === 'expense' && isWantCategory(category)
          if ((over || pause) && !warned) {
            setWarned(true)
            return
          }
          onSave({
            type: kind,
            amount: data.get('amount'),
            category,
            description: data.get('description'),
            date: data.get('date')
          })
        }}
      >
        <Field label={`Amount (${currency})`}><input className={inputClass} name="amount" type="number" step="0.01" required /></Field>
        <Field label="Category">
          <select
            className={inputClass}
            name="category"
            required
            value={cat}
            onChange={(e) => { setCat(e.target.value); setWarned(false) }}
          >
            <option value="">Select</option>
            {cats.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        {want && <p className="plan-warn">{t('plan.pauseWant')}</p>}
        {warned && kind === 'expense' && cat && Number(caps?.[toMain(cat)]) > 0 && (
          <p className="plan-warn">{t('plan.overCap')}</p>
        )}
        <Field label="Description"><input className={inputClass} name="description" /></Field>
        <Field label="Date"><input className={inputClass} name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
        <button className="btn-primary mt-2 w-full rounded-xl py-3 font-semibold">
          {warned ? t('plan.addAnyway') : 'Save'}
        </button>
      </form>
    </Modal>
  )
}

function GoalForm({ currency, onClose, onSave, sheet }) {
  return (
    <Modal title="New savings goal" onClose={onClose} sheet={sheet}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.target)
          onSave({
            name: data.get('name'),
            target_amount: data.get('target_amount'),
            current_amount: data.get('current_amount'),
            deadline: data.get('deadline')
          })
        }}
      >
        <Field label="Goal name"><input className={inputClass} name="name" required /></Field>
        <Field label={`Target (${currency})`}><input className={inputClass} name="target_amount" type="number" step="0.01" required /></Field>
        <Field label={`Current (${currency})`}><input className={inputClass} name="current_amount" type="number" step="0.01" defaultValue="0" /></Field>
        <Field label="Deadline"><input className={inputClass} name="deadline" type="date" /></Field>
        <button className="btn-primary mt-2 w-full rounded-xl py-3 font-semibold">Save goal</button>
      </form>
    </Modal>
  )
}

function BudgetForm({ currency, onClose, onSave, sheet }) {
  return (
    <Modal title="Set monthly budget" onClose={onClose} sheet={sheet}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.target)
          onSave({ category: data.get('category'), amount: data.get('amount') })
        }}
      >
        <Field label="Category">
          <select className={inputClass} name="category" required>
            <option value="">Select</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={`Monthly budget (${currency})`}><input className={inputClass} name="amount" type="number" step="0.01" required /></Field>
        <button className="btn-primary mt-2 w-full rounded-xl py-3 font-semibold">Save budget</button>
      </form>
    </Modal>
  )
}
