import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { formatAmount } from '../context/FinanceContext'
import { useFinanceManager } from '../hooks/useFinanceManager'
import LineChart from '../components/LineChart'
import ChartPicker from '../components/ChartPicker'
import { COLORS, commonStyles } from '../styles/theme'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    user,
    baseCurrency,
    ratesLoading,
    getRate,
    getTotalInBase,
    chartData,
    chartLoading,
    fetchChartData,
    CURRENCIES
  } = useFinanceManager()

  const [simAmount, setSimAmount]         = useState('')
  const [simFrom, setSimFrom]             = useState('COP')
  const [simTo, setSimTo]                 = useState('USD')
  const [timeRange, setTimeRange]         = useState('1M')
  const [chartFrom, setChartFrom]         = useState('USD')
  const [chartTo, setChartTo]             = useState(() => baseCurrency === 'USD' ? 'EUR' : baseCurrency)
  const [showChartPicker, setShowChartPicker] = useState(null)

  const totalBalance = getTotalInBase()
  const curInfo      = CURRENCIES[baseCurrency]
  const chartRate    = getRate(chartFrom, chartTo)

  const chartChange = chartData && chartData.length >= 2
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100)
    : null
  const chartIsUp = chartChange !== null && chartChange >= 0

  const simAmountNum = parseFloat(simAmount) || 0
  const simRate      = getRate(simFrom, simTo)
  const simResult    = simRate && simAmountNum > 0 ? simAmountNum * simRate : null

  const initials  = user.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  const firstName = user.name ? user.name.split(' ')[0] : 'Usuario'

  useEffect(() => {
    fetchChartData(chartFrom, chartTo, timeRange)
  }, [timeRange, chartFrom, chartTo, fetchChartData])

  return (
    <div className="min-h-screen flex flex-col pb-20" style={{ background: COLORS.bg }}>

      <header style={commonStyles.header}>
        <div className="flex items-center gap-3">
          <div className="relative">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-11 h-11 rounded-full object-cover" />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold"
                style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`, color: COLORS.primaryDark }}
              >
                {initials}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: COLORS.success, borderColor: COLORS.bg }} />
          </div>
          <div>
            <p className="text-xs" style={{ color: COLORS.textMuted }}>Bienvenido</p>
            <p className="text-sm font-bold text-white">{firstName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center border-0" style={{ background: COLORS.card }}>
            <span className="material-symbols-rounded" style={{ color: COLORS.textMuted }}>search</span>
          </button>
          <button onClick={() => navigate('/alertas')} className="w-10 h-10 rounded-xl flex items-center justify-center border-0 relative" style={{ background: COLORS.card }}>
            <span className="material-symbols-rounded" style={{ color: COLORS.textMuted }}>notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 overflow-y-auto">

        <div className="rounded-3xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1a3d30, #0d2a20)', border: `1px solid ${COLORS.primary}33` }}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: COLORS.textMuted }}>Balance total ({baseCurrency})</p>
              <p className="text-3xl font-extrabold text-white">
                {curInfo?.symbol}{formatAmount(totalBalance, baseCurrency)}
              </p>
            </div>
            <button
              onClick={() => navigate('/cambio')}
              className="flex items-center gap-1 px-4 py-2.5 rounded-2xl border-0 text-xs font-bold"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`, color: COLORS.primaryDark }}
            >
              <span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
              Depositar
            </button>
          </div>
          {totalBalance === 0 && (
            <p className="text-xs mt-2" style={{ color: COLORS.textDim }}>
              Empieza depositando fondos en tu cuenta para invertir.
            </p>
          )}
        </div>


        {showChartPicker === 'from' && (
          <ChartPicker value={chartFrom} exclude={chartTo} onChange={setChartFrom} onClose={() => setShowChartPicker(null)} />
        )}
        {showChartPicker === 'to' && (
          <ChartPicker value={chartTo} exclude={chartFrom} onChange={setChartTo} onClose={() => setShowChartPicker(null)} />
        )}

        <div style={commonStyles.card} className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-white">Tendencia del Mercado</h2>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: ratesLoading ? `${COLORS.warning}1a` : `${COLORS.success}1a` }}>
              <span className={`w-1.5 h-1.5 rounded-full ${ratesLoading ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${ratesLoading ? 'text-yellow-500' : 'text-green-500'}`}>
                {ratesLoading ? 'Sincronizando' : 'En vivo'}
              </span>
            </div>
          </div>

          {/* Pair selector */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => setShowChartPicker('from')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-0 flex-1"
              style={{ background: COLORS.cardLight, border: `1px solid ${COLORS.primary}40` }}
            >
              <span className="text-xl">{CURRENCIES[chartFrom]?.flag}</span>
              <span className="text-sm font-bold text-white">{chartFrom}</span>
              <span className="material-symbols-rounded text-sm ml-auto" style={{ color: COLORS.textMuted }}>expand_more</span>
            </button>

            <button
              onClick={() => { const f = chartFrom; setChartFrom(chartTo); setChartTo(f) }}
              className="w-10 h-10 rounded-xl flex items-center justify-center border-0 shrink-0"
              style={{ background: COLORS.cardLight }}
            >
              <span className="material-symbols-rounded text-lg" style={{ color: COLORS.primary }}>swap_horiz</span>
            </button>

            <button
              onClick={() => setShowChartPicker('to')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-0 flex-1"
              style={{ background: COLORS.cardLight, border: `1px solid ${COLORS.primary}40` }}
            >
              <span className="text-xl">{CURRENCIES[chartTo]?.flag}</span>
              <span className="text-sm font-bold text-white">{chartTo}</span>
              <span className="material-symbols-rounded text-sm ml-auto" style={{ color: COLORS.textMuted }}>expand_more</span>
            </button>
          </div>

          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs mb-1" style={{ color: COLORS.textMuted }}>1 {chartFrom} hoy</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{chartRate ? formatAmount(chartRate, chartTo) : '—'}</span>
                <span className="text-sm font-bold" style={{ color: COLORS.textMuted }}>{chartTo}</span>
              </div>
            </div>
            {chartChange !== null && (
              <div
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all"
                style={{
                  background: chartIsUp ? `${COLORS.primary}1a` : `${COLORS.error}1a`,
                  color: chartIsUp ? COLORS.primary : COLORS.error,
                }}
              >
                <span className="material-symbols-rounded text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {chartIsUp ? 'trending_up' : 'trending_down'}
                </span>
                <span className="text-sm font-black tabular-nums">
                  {chartIsUp ? '+' : ''}{chartChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <LineChart data={chartData} isLoading={chartLoading} />

          {/* Time range selector */}
          <div className="flex gap-2 mt-5">
            {['1D', '1S', '1M', '1A'].map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className="flex-1 py-2 rounded-xl text-xs font-black border-0 transition-all"
                style={{
                  background: timeRange === r ? COLORS.primary : COLORS.cardLight,
                  color: timeRange === r ? COLORS.primaryDark : COLORS.textMuted,
                  boxShadow: timeRange === r ? `0 4px 12px ${COLORS.primary}4d` : 'none'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>


        <div style={commonStyles.card} className="mb-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-rounded text-2xl" style={{ color: COLORS.primary, fontVariationSettings: "'FILL' 1" }}>calculate</span>
            <h2 className="text-sm font-bold text-white">Simulador de Conversión</h2>
          </div>

          <div className="flex gap-2 mb-4">
            <select
              value={simFrom}
              onChange={e => setSimFrom(e.target.value)}
              className="flex-1 rounded-xl px-3 py-3 text-sm font-bold border-0 outline-none"
              style={{ background: COLORS.cardLight, color: 'white' }}
            >
              {Object.keys(CURRENCIES).map(c => (
                <option key={c} value={c}>{CURRENCIES[c].flag} {c}</option>
              ))}
            </select>
            <button
              onClick={() => { const t = simFrom; setSimFrom(simTo); setSimTo(t) }}
              className="w-11 h-11 rounded-xl flex items-center justify-center border-0 shrink-0"
              style={{ background: COLORS.cardLight }}
            >
              <span className="material-symbols-rounded text-xl" style={{ color: COLORS.primary }}>swap_horiz</span>
            </button>
            <select
              value={simTo}
              onChange={e => setSimTo(e.target.value)}
              className="flex-1 rounded-xl px-3 py-3 text-sm font-bold border-0 outline-none"
              style={{ background: COLORS.cardLight, color: 'white' }}
            >
              {Object.keys(CURRENCIES).map(c => (
                <option key={c} value={c}>{CURRENCIES[c].flag} {c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 px-4 rounded-xl mb-4" style={{ background: COLORS.cardLight, border: `1px solid ${COLORS.primary}33` }}>
            <span className="text-sm font-black" style={{ color: COLORS.textMuted }}>{CURRENCIES[simFrom]?.symbol}</span>
            <input
              type="number"
              value={simAmount}
              onChange={e => setSimAmount(e.target.value)}
              className="flex-1 bg-transparent py-4 text-white text-xl font-black outline-none placeholder:text-zinc-800"
              placeholder="0.00"
            />
          </div>

          {simResult !== null && (
            <div className="flex items-center justify-between px-5 py-4 rounded-xl mb-5" style={{ background: `${COLORS.primary}0d`, border: `1px solid ${COLORS.primary}26` }}>
              <span className="text-xs font-bold" style={{ color: COLORS.textMuted }}>Recibirías aprox.</span>
              <span className="text-xl font-black" style={{ color: COLORS.primaryLight }}>
                {CURRENCIES[simTo]?.symbol}{formatAmount(simResult, simTo)}
              </span>
            </div>
          )}

          <button
            onClick={() => navigate('/confirmar', { state: { amount: simAmountNum, fromCur: simFrom, toCur: simTo } })}
            disabled={!simAmount || simAmountNum <= 0}
            className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 border-0 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`, color: COLORS.primaryDark, opacity: (!simAmount || simAmountNum <= 0) ? 0.5 : 1 }}
          >
            <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>currency_exchange</span>
            Continuar al cambio
          </button>
        </div>
      </main>

      <BottomNav active="Inicio" />
    </div>
  )
}
