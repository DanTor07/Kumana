import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useFinance, CURRENCIES, formatAmount } from '../context/FinanceContext'

// Currencies supported by Frankfurter API (free, no key needed)
const FRANKFURTER = new Set([
  'EUR','GBP','JPY','CHF','CAD','AUD','CNY','HKD','NZD','SEK','NOK','DKK',
  'MXN','BRL','HUF','PLN','CZK','RON','BGN','ISK','IDR','INR','ILS','KRW',
  'MYR','PHP','SGD','THB','TRY','ZAR',
])

const RANGE_DAYS = { '1D': 1, '1S': 7, '1M': 30, '1A': 365 }

function getStartDate(range) {
  const d = new Date()
  d.setDate(d.getDate() - (RANGE_DAYS[range] || 30))
  return d.toISOString().split('T')[0]
}

// Deterministic PRNG so chart is stable across re-renders
function seededRand(seed) {
  let s = (Math.abs(seed) + 1.3) * 9999
  return () => {
    s = Math.sin(s) * 10000
    return s - Math.floor(s)
  }
}

// Walk backwards from today's rate so chart always ends at real current rate
function generateSyntheticData(currentRate, days, volatility = 0.014) {
  const rand = seededRand(currentRate + days)
  const pts = [currentRate]
  for (let i = 0; i < days; i++) {
    pts.push(pts[pts.length - 1] / (1 + (rand() - 0.5) * volatility * 2))
  }
  pts.reverse()
  return pts.map((value, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - i))
    return { date: d.toISOString().split('T')[0], value }
  })
}

// ── Dynamic Line Chart ──────────────────────────────────────────────────────
function LineChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <div
        className="w-full rounded-xl"
        style={{ height: 70, background: 'rgba(255,255,255,0.04)' }}
      />
    )
  }
  if (!data || data.length < 2) return null

  const W = 300, H = 90
  const values = data.map(d => d.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const span = maxV - minV || minV * 0.01

  const px = i => (i / (data.length - 1)) * W
  const py = v => H - 8 - ((v - minV) / span) * (H - 16)

  const pts  = data.map((d, i) => `${px(i)},${py(d.value)}`).join(' ')
  const area = `0,${H} ${pts} ${W},${H}`

  const isUp  = data[data.length - 1].value >= data[0].value
  const color = isUp ? '#00c28b' : '#ef4444'
  const endX  = px(data.length - 1)
  const endY  = py(data[data.length - 1].value)

  return (
    <svg width="100%" height="70" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#chartGrad)" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={endX} cy={endY} r="4"  fill={color} />
      <circle cx={endX} cy={endY} r="8"  fill={color} fillOpacity="0.25" />
    </svg>
  )
}

// ── Inline currency picker for the chart pair ───────────────────────────────
function ChartPicker({ value, exclude, onChange, onClose }) {
  const [search, setSearch] = useState('')
  const list = Object.values(CURRENCIES).filter(
    c => c.code !== exclude && (
      c.code.includes(search.toUpperCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  )
  return (
    <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="absolute bottom-0 left-1/2 w-full max-w-[430px] rounded-t-3xl"
        style={{ background: '#172d25', transform: 'translateX(-50%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-3" style={{ background: '#2a4a3a' }} />
        <p className="text-center text-sm font-bold text-white mb-3 px-5">Selecciona moneda</p>
        <div className="px-5 mb-3">
          <div className="flex items-center gap-2 px-3 rounded-2xl" style={{ background: '#1a3028' }}>
            <span className="material-symbols-rounded text-lg" style={{ color: '#7aa899' }}>search</span>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent py-3 text-white text-sm outline-none"
            />
          </div>
        </div>
        <div className="overflow-y-auto px-3 pb-8" style={{ maxHeight: '50vh' }}>
          {list.map(c => (
            <button
              key={c.code}
              onClick={() => { onChange(c.code); onClose() }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 border-0 text-left"
              style={{
                background: value === c.code ? 'rgba(0,194,139,0.12)' : 'transparent',
                border: value === c.code ? '1px solid rgba(0,194,139,0.3)' : '1px solid transparent',
              }}
            >
              <span className="text-2xl">{c.flag}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{c.code}</p>
                <p className="text-xs" style={{ color: '#7aa899' }}>{c.name}</p>
              </div>
              {value === c.code && (
                <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, baseCurrency, getRate, rates, ratesLoading, getTotalInBase } = useFinance()

  const [simAmount, setSimAmount]         = useState('')
  const [simFrom, setSimFrom]             = useState('COP')
  const [simTo, setSimTo]                 = useState('USD')
  const [timeRange, setTimeRange]         = useState('1M')
  const [chartData, setChartData]         = useState(null)
  const [chartLoading, setChartLoading]   = useState(false)
  const [chartFrom, setChartFrom]         = useState('USD')
  const [chartTo, setChartTo]             = useState(() => baseCurrency === 'USD' ? 'EUR' : baseCurrency)
  const [showChartPicker, setShowChartPicker] = useState(null) // 'from' | 'to' | null

  const totalBalance = getTotalInBase()
  const curInfo      = CURRENCIES[baseCurrency]

  const chartRate = getRate(chartFrom, chartTo)

  const chartChange = chartData && chartData.length >= 2
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100)
    : null
  const chartIsUp = chartChange !== null && chartChange >= 0

  const simAmountNum = parseFloat(simAmount) || 0
  const simRate      = getRate(simFrom, simTo)
  const simResult    = simRate && simAmountNum > 0 ? simAmountNum * simRate : null

  const initials  = user.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  const firstName = user.name ? user.name.split(' ')[0] : 'Usuario'

  // ── Fetch historical chart data when range or pair changes ──
  useEffect(() => {
    if (!rates || Object.keys(rates).length === 0) return

    const days  = RANGE_DAYS[timeRange] || 30
    const today = new Date().toISOString().split('T')[0]
    const start = getStartDate(timeRange)

    setChartLoading(true)
    setChartData(null)

    // Use Frankfurter when both currencies are supported (not COP, ARS, etc.)
    const fromOk    = chartFrom === 'USD' || FRANKFURTER.has(chartFrom)
    const toOk      = chartTo   === 'USD' || FRANKFURTER.has(chartTo)
    const canUseAPI = fromOk && toOk && chartFrom !== chartTo && timeRange !== '1D'

    if (canUseAPI) {
      fetch(`https://api.frankfurter.app/${start}..${today}?from=${chartFrom}&to=${chartTo}`)
        .then(r => r.json())
        .then(json => {
          if (json.rates) {
            const sorted = Object.entries(json.rates)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, r]) => ({ date, value: r[chartTo] }))
            setChartData(sorted)
          } else {
            setChartData(generateSyntheticData(chartRate || 1, days))
          }
        })
        .catch(() => setChartData(generateSyntheticData(chartRate || 1, days)))
        .finally(() => setChartLoading(false))
    } else {
      // Synthetic fallback (COP, ARS, CLP, PEN, or 1D range)
      setChartData(generateSyntheticData(chartRate || 1, days))
      setChartLoading(false)
    }
  }, [timeRange, chartFrom, chartTo, rates])

  return (
    <div className="min-h-screen flex flex-col pb-20" style={{ background: '#0f231d' }}>
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold"
                style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)', color: '#0a1f18' }}
              >
                {initials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: '#22c55e', borderColor: '#0f231d' }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: '#7aa899' }}>Bienvenido</p>
            <p className="text-sm font-bold text-white">{firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center border-0" style={{ background: '#172d25' }}>
            <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>search</span>
          </button>
          <button onClick={() => navigate('/alertas')} className="w-10 h-10 rounded-xl flex items-center justify-center border-0 relative" style={{ background: '#172d25' }}>
            <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 overflow-y-auto">
        {/* Balance card */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: 'linear-gradient(135deg, #1a3d30, #0d2a20)', border: '1px solid rgba(0,194,139,0.2)' }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#7aa899' }}>Balance total ({baseCurrency})</p>
              <p className="text-3xl font-extrabold text-white">
                {curInfo?.symbol}{formatAmount(totalBalance, baseCurrency)}
              </p>
            </div>
            <button
              onClick={() => navigate('/cambio')}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl border-0 text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)', color: '#0a1f18' }}
            >
              <span className="material-symbols-rounded text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              Depositar
            </button>
          </div>
          {totalBalance === 0 && (
            <p className="text-xs mt-1" style={{ color: '#5a8a78' }}>
              Ve a Inversiones para depositar fondos y empezar
            </p>
          )}
        </div>

        {/* ── Market Trend Chart ── */}
        {showChartPicker === 'from' && (
          <ChartPicker value={chartFrom} exclude={chartTo} onChange={setChartFrom} onClose={() => setShowChartPicker(null)} />
        )}
        {showChartPicker === 'to' && (
          <ChartPicker value={chartTo} exclude={chartFrom} onChange={setChartTo} onClose={() => setShowChartPicker(null)} />
        )}

        <div className="rounded-3xl p-5 mb-5" style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Title row */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-white">Tendencia del Mercado</h2>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: ratesLoading ? 'rgba(255,193,7,0.1)' : 'rgba(34,197,94,0.15)' }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${ratesLoading ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`} />
              <span className={`text-xs font-medium ${ratesLoading ? 'text-yellow-400' : 'text-green-400'}`}>
                {ratesLoading ? 'Actualizando...' : 'En vivo'}
              </span>
            </div>
          </div>

          {/* ── Pair selector (tappable) ── */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowChartPicker('from')}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl border-0 flex-1"
              style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.25)' }}
            >
              <span className="text-lg">{CURRENCIES[chartFrom]?.flag}</span>
              <span className="text-sm font-bold text-white">{chartFrom}</span>
              <span className="material-symbols-rounded text-sm ml-auto" style={{ color: '#7aa899' }}>expand_more</span>
            </button>

            <button
              onClick={() => { const f = chartFrom; setChartFrom(chartTo); setChartTo(f) }}
              className="w-9 h-9 rounded-xl flex items-center justify-center border-0 shrink-0"
              style={{ background: '#1a3028' }}
            >
              <span className="material-symbols-rounded text-base" style={{ color: '#00c28b' }}>swap_horiz</span>
            </button>

            <button
              onClick={() => setShowChartPicker('to')}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl border-0 flex-1"
              style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.25)' }}
            >
              <span className="text-lg">{CURRENCIES[chartTo]?.flag}</span>
              <span className="text-sm font-bold text-white">{chartTo}</span>
              <span className="material-symbols-rounded text-sm ml-auto" style={{ color: '#7aa899' }}>expand_more</span>
            </button>
          </div>

          {/* Current rate + % change badge */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xs mb-1" style={{ color: '#7aa899' }}>
                1 {chartFrom} en {chartTo}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">
                  {chartRate ? formatAmount(chartRate, chartTo) : '—'}
                </span>
                <span className="text-sm font-semibold" style={{ color: '#7aa899' }}>{chartTo}</span>
              </div>
            </div>
            {chartChange !== null && (
              <div
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl"
                style={{
                  background: chartIsUp ? 'rgba(0,194,139,0.12)' : 'rgba(239,68,68,0.12)',
                  color: chartIsUp ? '#00c28b' : '#ef4444',
                }}
              >
                <span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {chartIsUp ? 'trending_up' : 'trending_down'}
                </span>
                <span className="text-sm font-bold tabular-nums">
                  {chartIsUp ? '+' : ''}{chartChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          {/* Chart */}
          <LineChart data={chartData} isLoading={chartLoading} />

          {/* Min / Max */}
          {chartData && chartData.length >= 2 && !chartLoading && (() => {
            const values = chartData.map(d => d.value)
            const minV   = Math.min(...values)
            const maxV   = Math.max(...values)
            return (
              <div className="flex justify-between mt-1 px-1">
                <span className="text-xs" style={{ color: '#5a8a78' }}>
                  Mín {formatAmount(minV, chartTo)}
                </span>
                <span className="text-xs" style={{ color: '#5a8a78' }}>
                  Máx {formatAmount(maxV, chartTo)}
                </span>
              </div>
            )
          })()}

          {/* Time range buttons */}
          <div className="flex gap-2 mt-3">
            {['1D', '1S', '1M', '1A'].map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className="flex-1 py-1.5 rounded-xl text-xs font-semibold border-0"
                style={{
                  background: timeRange === r ? '#00c28b' : 'transparent',
                  color: timeRange === r ? '#0a1f18' : '#7aa899',
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <p className="text-center mt-2 text-xs" style={{ color: '#3a5a4a' }}>
            {(FRANKFURTER.has(chartTo) || chartTo === 'USD') &&
             (FRANKFURTER.has(chartFrom) || chartFrom === 'USD') &&
             timeRange !== '1D'
              ? 'Datos reales · Frankfurter API'
              : 'Datos simulados · tasa real de hoy'}
          </p>
        </div>

        {/* Live rates grid */}
        {rates && Object.keys(rates).length > 0 && (
          <div className="rounded-3xl p-5 mb-5" style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-sm font-bold text-white mb-3">Tasas principales</h2>
            <div className="grid grid-cols-2 gap-2">
              {[['USD','EUR'],['USD','COP'],['USD','GBP'],['EUR','COP']].map(([f, t]) => {
                const r = getRate(f, t)
                return (
                  <div key={`${f}${t}`} className="p-3 rounded-2xl" style={{ background: '#1a3028' }}>
                    <p className="text-xs mb-1" style={{ color: '#7aa899' }}>
                      {CURRENCIES[f]?.flag} {f} → {CURRENCIES[t]?.flag} {t}
                    </p>
                    <p className="text-sm font-bold text-white">{r ? formatAmount(r, t) : '—'}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Simulator */}
        <div className="rounded-3xl p-5" style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-rounded text-xl" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>calculate</span>
            <h2 className="text-sm font-bold text-white">Simulación Rápida</h2>
          </div>

          <div className="flex gap-2 mb-3">
            <select
              value={simFrom}
              onChange={e => setSimFrom(e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 text-sm font-bold border-0 outline-none"
              style={{ background: '#1a3028', color: 'white' }}
            >
              {Object.keys(CURRENCIES).map(c => (
                <option key={c} value={c}>{CURRENCIES[c].flag} {c}</option>
              ))}
            </select>
            <button
              onClick={() => { const t = simFrom; setSimFrom(simTo); setSimTo(t) }}
              className="w-10 h-10 rounded-xl flex items-center justify-center border-0 shrink-0"
              style={{ background: '#1a3028' }}
            >
              <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>swap_horiz</span>
            </button>
            <select
              value={simTo}
              onChange={e => setSimTo(e.target.value)}
              className="flex-1 rounded-xl px-3 py-2 text-sm font-bold border-0 outline-none"
              style={{ background: '#1a3028', color: 'white' }}
            >
              {Object.keys(CURRENCIES).map(c => (
                <option key={c} value={c}>{CURRENCIES[c].flag} {c}</option>
              ))}
            </select>
          </div>

          <div
            className="flex items-center gap-3 px-4 rounded-2xl mb-2"
            style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}
          >
            <span className="text-sm font-bold" style={{ color: '#7aa899' }}>{CURRENCIES[simFrom]?.symbol}</span>
            <input
              type="number"
              value={simAmount}
              onChange={e => setSimAmount(e.target.value)}
              className="flex-1 bg-transparent py-3.5 text-white text-lg font-bold outline-none"
              placeholder="0"
            />
          </div>

          {simResult !== null && (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl mb-3"
              style={{ background: 'rgba(0,194,139,0.06)', border: '1px solid rgba(0,194,139,0.15)' }}
            >
              <span className="text-sm" style={{ color: '#7aa899' }}>Recibirías</span>
              <span className="text-lg font-extrabold" style={{ color: '#06f9b4' }}>
                {CURRENCIES[simTo]?.symbol}{formatAmount(simResult, simTo)} {simTo}
              </span>
            </div>
          )}

          <button
            onClick={() => navigate('/confirmar', { state: { amount: simAmountNum, fromCur: simFrom, toCur: simTo } })}
            className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border-0"
            style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)', color: '#0a1f18' }}
          >
            <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>currency_exchange</span>
            Simular Conversión
          </button>
        </div>
      </main>

      <BottomNav active="Inicio" />
    </div>
  )
}
