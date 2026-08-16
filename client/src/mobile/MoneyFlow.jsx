import { useMemo, useState } from 'react'
import { ChevronLeft, MoreHorizontal } from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'

const RANGES = [
  { id: 'All', label: 'All' },
  { id: 'W', label: 'W' },
  { id: 'M', label: 'M' },
  { id: '3M', label: '3M' },
  { id: '6M', label: '6M' },
  { id: 'Y', label: 'Y' }
]

const BAR_COLORS = ['#4554E5', '#FF8A4C', '#F5C451', '#118BE3', '#16C784', '#A78BFA']

export default function MoneyFlow({
  mode, money, transactions, trend, categoryData, onBack, onDelete
}) {
  const [range, setRange] = useState('6M')
  const { t } = useI18n()
  const isIn = mode === 'in'
  const type = isIn ? 'income' : 'expense'

  const items = useMemo(() => {
    return (transactions || []).filter((t) => t.type === type && inRange(t.date, range))
  }, [transactions, type, range])

  const total = items.reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const groups = groupByDate(items)
  const bars = isIn ? (trend?.income || []) : (trend?.expenses || [])
  const labels = (trend?.labels || []).map(shortMonth)
  const peak = bars.reduce((best, v, i) => (v > (bars[best] || 0) ? i : best), 0)
  const max = Math.max(...bars, 1)

  const cats = isIn
    ? rollup(items)
    : (categoryData || []).map((c) => ({ name: c.category, value: Number(c.amount || 0) }))
  const catTotal = cats.reduce((s, c) => s + c.value, 0) || 1

  return (
    <div className="flow">
      <div className="flow-top">
        <header className="flow-head">
          <button type="button" onClick={onBack} aria-label="Back"><ChevronLeft size={22} /></button>
          <h1>{isIn ? t('income') : t('spending')}</h1>
          <button type="button" aria-label="More"><MoreHorizontal size={20} /></button>
        </header>

        <div className="flow-ranges">
          {RANGES.map((r) => (
            <button key={r.id} type="button" className={range === r.id ? 'is-on' : ''} onClick={() => setRange(r.id)}>
              {r.label}
            </button>
          ))}
        </div>

        <p className="flow-kicker">{isIn ? 'Total earning' : 'Total spending'}</p>
        <p className="flow-total">{money(total)}</p>

        <div className="flow-chart">
          {bars.length === 0 && <p className="flow-empty">No data</p>}
          {bars.map((value, i) => (
            <div key={`${labels[i]}-${i}`} className="flow-col">
              <div
                className={`flow-bar ${i === peak ? 'is-peak' : ''}`}
                style={{ height: `${Math.max((value / max) * 100, 6)}%` }}
              />
              <span>{labels[i] || ''}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="flow-sheet">
        <div className="flow-sheet-h">
          <div>
            <p className="flow-sheet-title">{isIn ? t('income') : t('spending')}</p>
            <p className="flow-sheet-amt">{money(isIn ? total : catTotal === 1 ? total : catTotal)}</p>
          </div>
          <span className="flow-month">monthly</span>
        </div>

        {!isIn && cats.length > 0 && (
          <>
            <div className="flow-stack">
              {cats.map((c, i) => (
                <i key={c.name} style={{ width: `${(c.value / catTotal) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
              ))}
            </div>
            <div className="flow-legend">
              {cats.slice(0, 4).map((c, i) => (
                <span key={c.name}><b style={{ background: BAR_COLORS[i % BAR_COLORS.length] }} />{t(`cat.${c.name}`, c.name.split(' ')[0])}</span>
              ))}
            </div>
          </>
        )}

        {groups.map((group) => (
          <div key={group.date} className="mt-5">
            <p className="flow-day">{group.label}</p>
            {group.items.map((row) => (
              <div key={row.id} className="flow-row">
                <span className="flow-ico" style={{ background: isIn ? '#E7F9F1' : '#EEF2FF', color: isIn ? '#16C784' : '#4554E5' }}>
                  {row.category.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#0F1941]">{t(`cat.${row.category}`, row.category)}</p>
                  <p className="truncate text-[12px] text-[#8A94A6]">{row.description || row.date}</p>
                </div>
                <div className="text-right">
                  <p className={`tabular text-[15px] font-semibold ${isIn ? 'text-[#16C784]' : 'text-[#E5484D]'}`}>
                    {isIn ? '+' : '−'}{money(row.amount)}
                  </p>
                  {onDelete && (
                    <button type="button" className="text-[11px] text-[#8A94A6]" onClick={() => onDelete(row.id)}>×</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}

function rollup(items) {
  const map = new Map()
  for (const t of items) {
    map.set(t.category, (map.get(t.category) || 0) + Number(t.amount || 0))
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }))
}

function inRange(dateStr, range) {
  if (range === 'All' || !dateStr) return true
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return true
  const days = { W: 7, M: 31, '3M': 93, '6M': 186, Y: 365 }[range] || 365
  return Date.now() - d.getTime() <= days * 86400000
}

function shortMonth(value) {
  if (!value || !String(value).includes('-')) return String(value || '').slice(0, 3)
  const [year, month] = String(value).split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-GB', { month: 'short' })
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

function formatDay(value) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
}
