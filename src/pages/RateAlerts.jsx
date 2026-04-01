import { useState, useEffect } from 'react'
import BottomNav from '../components/BottomNav'
import { COLORS, commonStyles } from '../styles/theme'
import { useFinanceManager } from '../hooks/useFinanceManager'

const PAIRS = [
  ['USD', 'COP'], ['USD', 'EUR'], ['EUR', 'USD'],
  ['GBP', 'USD'], ['USD', 'MXN'], ['USD', 'BRL'], ['EUR', 'COP'],
]

const getStep = (rate) => {
  if (!rate) return 1
  if (rate >= 1000) return 50
  if (rate >= 100)  return 5
  if (rate >= 10)   return 0.5
  if (rate >= 1)    return 0.01
  if (rate >= 0.1)  return 0.001
  return 0.0001
}

const formatRate = (rate) => {
  if (!rate) return '—'
  if (rate >= 1000) return rate.toLocaleString('es-CO', { maximumFractionDigits: 0 })
  if (rate < 0.001) return rate.toFixed(6)
  if (rate < 0.1)   return rate.toFixed(4)
  return rate.toFixed(3)
}

export default function RateAlerts() {
  const { CURRENCIES, getRate, ratesLoading } = useFinanceManager()

  const [selectedPair, setSelectedPair]     = useState(PAIRS[0])
  const [targetRate, setTargetRate]         = useState(0)
  const [alerts, setAlerts]                 = useState([])
  const [showPairDropdown, setShowPairDropdown] = useState(false)
  const [created, setCreated]               = useState(false)

  const [from, to] = selectedPair
  const currentRate = getRate(from, to) || 0
  const step = getStep(currentRate)

  useEffect(() => {
    if (currentRate > 0) setTargetRate(+(currentRate + step * 3).toFixed(7))
  }, [selectedPair, currentRate])

  const handlePairSelect = (pair) => {
    setSelectedPair(pair)
    setShowPairDropdown(false)
  }

  const handleCreateAlert = () => {
    if (!currentRate) return
    const newAlert = {
      id: Date.now(),
      from, to,
      target: targetRate,
      current: currentRate,
      type: targetRate > currentRate ? 'VENDER' : 'COMPRAR',
      active: true,
    }
    setAlerts(prev => [newAlert, ...prev])
    setCreated(true)
    setTimeout(() => setCreated(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: COLORS.bg }}>
      <header style={commonStyles.header}>
        <div>
          <h1 className="text-2xl font-black text-white">Alertas</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: ratesLoading ? COLORS.warning : COLORS.primary }}>
            {ratesLoading ? 'Sincronizando...' : 'Sintonizado al mercado'}
          </p>
        </div>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center border-0 bg-white/5">
          <span className="material-symbols-rounded text-zinc-400">notifications_active</span>
        </button>
      </header>

      <main className="flex-1 px-5 overflow-y-auto">
        <div style={commonStyles.card} className="mb-6">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Nueva Alerta de Precio</p>

          {/* Pair selector */}
          <div className="mb-6 relative">
            <button
              onClick={() => setShowPairDropdown(!showPairDropdown)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-0 bg-white/5 text-left"
            >
              <span className="text-2xl">{CURRENCIES[from]?.flag} / {CURRENCIES[to]?.flag}</span>
              <span className="font-bold text-white flex-1">{from} / {to}</span>
              <span className="text-xs font-bold text-zinc-500 mr-1">{formatRate(currentRate)}</span>
              <span className="material-symbols-rounded text-zinc-600">expand_more</span>
            </button>

            {showPairDropdown && (
              <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-zinc-900 border border-white/10 z-20 shadow-2xl overflow-hidden">
                {PAIRS.map(([f, t]) => (
                  <button
                    key={`${f}${t}`}
                    onClick={() => handlePairSelect([f, t])}
                    className="flex items-center gap-4 w-full p-4 border-0 bg-transparent hover:bg-white/5 text-left border-b border-white/5 last:border-0"
                  >
                    <span className="text-xl">{CURRENCIES[f]?.flag} {CURRENCIES[t]?.flag}</span>
                    <p className="text-sm font-bold text-white flex-1">{f} / {t}</p>
                    <p className="text-xs font-bold text-zinc-500">{formatRate(getRate(f, t))}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Target rate control */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setTargetRate(r => +(r - step).toFixed(7))}
                className="w-12 h-12 rounded-xl bg-white/5 border-0 font-black text-xl"
                style={{ color: COLORS.primary }}
              >-</button>
              <div className="text-center">
                <p className="text-3xl font-black text-white tabular-nums">{formatRate(targetRate)}</p>
                <p className="text-[10px] font-bold text-zinc-600 mt-1 uppercase">Tasa Objetivo</p>
              </div>
              <button
                onClick={() => setTargetRate(r => +(r + step).toFixed(7))}
                className="w-12 h-12 rounded-xl bg-white/5 border-0 font-black text-xl"
                style={{ color: COLORS.primary }}
              >+</button>
            </div>
            <p className="text-center text-[10px] text-zinc-600">
              Actual: <span className="text-zinc-400 font-bold">{formatRate(currentRate)}</span>
              {' · '}Paso: <span className="text-zinc-400 font-bold">{step}</span>
            </p>
          </div>

          <button
            onClick={handleCreateAlert}
            disabled={!currentRate || created}
            className="w-full py-4 rounded-xl font-black border-0 transition-all flex items-center justify-center gap-2"
            style={{ background: created ? COLORS.success : COLORS.primary, color: COLORS.primaryDark, opacity: !currentRate ? 0.5 : 1 }}
          >
            <span className="material-symbols-rounded text-base">{created ? 'check' : 'add_alert'}</span>
            {created ? '¡Alerta Activada!' : 'Activar Notificación'}
          </button>
        </div>

        {/* Alerts list */}
        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 ml-1">Monitoreo Activo</h2>

        {alerts.length === 0 && (
          <p className="text-center text-sm text-zinc-600 py-8">Sin alertas activas aún.</p>
        )}

        {alerts.map(a => (
          <div key={a.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 mb-3">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <p className="font-black text-white">{a.from}/{a.to}</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${a.type === 'COMPRAR' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {a.type}
                </span>
              </div>
              <div
                className={`w-10 h-5 rounded-full p-1 transition-colors cursor-pointer ${a.active ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                onClick={() => setAlerts(prev => prev.map(al => al.id === a.id ? { ...al, active: !al.active } : al))}
              >
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${a.active ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase">Avisar en</p>
                <p className="text-xl font-black text-white">{formatRate(a.target)}</p>
              </div>
              <p className="text-xs font-bold text-zinc-500 pb-1">
                Actual: {formatRate(getRate(a.from, a.to) || a.current)}
              </p>
            </div>
          </div>
        ))}
      </main>

      <BottomNav active="Alerta" />
    </div>
  )
}
