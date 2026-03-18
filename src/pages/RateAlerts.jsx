import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const CURRENCY_PAIRS = [
  { from: 'USD', to: 'COP', fromFlag: '🇺🇸', toFlag: '🇨🇴', current: 4150, step: 50 },
  { from: 'USD', to: 'EUR', fromFlag: '🇺🇸', toFlag: '🇪🇺', current: 0.92, step: 0.01 },
  { from: 'EUR', to: 'USD', fromFlag: '🇪🇺', toFlag: '🇺🇸', current: 1.09, step: 0.01 },
  { from: 'BTC', to: 'USD', fromFlag: '₿', toFlag: '🇺🇸', current: 62400, step: 500 },
]

const initialAlerts = [
  { id: 1, from: 'USD', to: 'EUR', fromFlag: '🇺🇸', toFlag: '🇪🇺', target: 0.95, current: 0.92, type: 'COMPRAR', active: true },
  { id: 2, from: 'BTC', to: 'USD', fromFlag: '₿', toFlag: '🇺🇸', target: 65000, current: 62400, type: 'VENDER', active: true },
]

export default function RateAlerts() {
  const navigate = useNavigate()
  const [selectedPair, setSelectedPair] = useState(CURRENCY_PAIRS[0])
  const [targetRate, setTargetRate] = useState(selectedPair.current + selectedPair.step * 3)
  const [alerts, setAlerts] = useState(initialAlerts)
  const [showPairDropdown, setShowPairDropdown] = useState(false)
  const [created, setCreated] = useState(false)

  const handlePairSelect = (pair) => {
    setSelectedPair(pair)
    setTargetRate(pair.current + pair.step * 3)
    setShowPairDropdown(false)
  }

  const handleCreateAlert = () => {
    const newAlert = {
      id: Date.now(),
      from: selectedPair.from,
      to: selectedPair.to,
      fromFlag: selectedPair.fromFlag,
      toFlag: selectedPair.toFlag,
      target: targetRate,
      current: selectedPair.current,
      type: targetRate > selectedPair.current ? 'VENDER' : 'COMPRAR',
      active: true,
    }
    setAlerts(prev => [newAlert, ...prev])
    setCreated(true)
    setTimeout(() => setCreated(false), 2000)
  }

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  const deleteAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const formatNumber = (n) => {
    if (n >= 1000) return n.toLocaleString('es-CO')
    return n % 1 === 0 ? n.toString() : n.toFixed(2)
  }

  return (
    <div
      className="min-h-screen flex flex-col pb-20"
      style={{ background: '#0f231d' }}
    >
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Alertas de Tasas</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Mercado en Vivo</span>
          </div>
        </div>
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center border-0"
          style={{ background: '#172d25' }}
        >
          <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>tune</span>
        </button>
      </header>

      <main className="flex-1 px-5 overflow-y-auto">
        {/* Create alert card */}
        <div
          className="rounded-3xl p-5 mb-5"
          style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className="material-symbols-rounded"
              style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}
            >
              add_alert
            </span>
            <h2 className="text-sm font-bold text-white">Nueva Alerta</h2>
          </div>

          {/* Pair selector */}
          <div className="mb-4 relative">
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#7aa899' }}>Par de divisas</label>
            <button
              onClick={() => setShowPairDropdown(!showPairDropdown)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border-0"
              style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}
            >
              <span className="text-xl">{selectedPair.fromFlag}</span>
              <span className="font-bold text-white">{selectedPair.from}</span>
              <span className="material-symbols-rounded text-lg" style={{ color: '#7aa899' }}>arrow_forward</span>
              <span className="text-xl">{selectedPair.toFlag}</span>
              <span className="font-bold text-white">{selectedPair.to}</span>
              <span className="ml-auto material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>expand_more</span>
            </button>

            {showPairDropdown && (
              <div
                className="absolute left-0 right-0 mt-1 rounded-2xl overflow-hidden z-10"
                style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}
              >
                {CURRENCY_PAIRS.map(pair => (
                  <button
                    key={`${pair.from}${pair.to}`}
                    onClick={() => handlePairSelect(pair)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-0 bg-transparent hover:bg-white/5 text-left"
                  >
                    <span className="text-lg">{pair.fromFlag}</span>
                    <span className="text-sm font-bold text-white">{pair.from} / {pair.to}</span>
                    <span className="text-lg">{pair.toFlag}</span>
                    <span className="ml-auto text-xs" style={{ color: '#7aa899' }}>
                      Actual: {formatNumber(pair.current)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rate input */}
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest mb-2" style={{ color: '#7aa899' }}>Tasa objetivo</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTargetRate(r => Math.max(0, parseFloat((r - selectedPair.step).toFixed(4))))}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border-0"
                style={{ background: '#1a3028', color: '#00c28b' }}
              >
                −
              </button>
              <div className="flex-1 text-center">
                <div className="text-3xl font-extrabold text-white tabular-nums">
                  {formatNumber(targetRate)}
                </div>
                <div className="text-xs mt-1" style={{ color: '#7aa899' }}>
                  Actual: {formatNumber(selectedPair.current)}{' '}
                  <span style={{ color: '#00c28b' }}>
                    {targetRate > selectedPair.current ? '↑ +1.2%' : '↓ -0.5%'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setTargetRate(r => parseFloat((r + selectedPair.step).toFixed(4)))}
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border-0"
                style={{ background: '#1a3028', color: '#00c28b' }}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleCreateAlert}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-0 transition-all"
            style={{
              background: created ? 'rgba(0,194,139,0.2)' : 'linear-gradient(135deg, #00c28b, #06f9b4)',
              color: created ? '#00c28b' : '#0a1f18',
            }}
          >
            <span
              className="material-symbols-rounded"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {created ? 'check_circle' : 'notifications_active'}
            </span>
            {created ? 'Alerta creada' : 'Crear Alerta'}
          </button>
        </div>

        {/* Active alerts */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-bold text-white">
              Alertas Activas{' '}
              <span
                className="text-xs px-2 py-0.5 rounded-full ml-1"
                style={{ background: 'rgba(0,194,139,0.15)', color: '#00c28b' }}
              >
                {alerts.filter(a => a.active).length}
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8" style={{ color: '#5a8a78' }}>
                <span className="material-symbols-rounded text-4xl block mb-2">notifications_off</span>
                <p className="text-sm">No tienes alertas activas</p>
              </div>
            ) : alerts.map(alert => (
              <div
                key={alert.id}
                className="rounded-3xl p-4"
                style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{alert.fromFlag}</span>
                    <span className="font-bold text-sm text-white">{alert.from}</span>
                    <span className="material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>arrow_forward</span>
                    <span className="text-lg">{alert.toFlag}</span>
                    <span className="font-bold text-sm text-white">{alert.to}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full ml-1"
                      style={{
                        background: alert.type === 'COMPRAR' ? 'rgba(0,194,139,0.15)' : 'rgba(239,68,68,0.15)',
                        color: alert.type === 'COMPRAR' ? '#00c28b' : '#ef4444',
                      }}
                    >
                      {alert.type}
                    </span>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className="relative w-12 h-6 rounded-full border-0 transition-all"
                    style={{ background: alert.active ? '#00c28b' : '#1a3028' }}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                      style={{ left: alert.active ? '26px' : '4px' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: '#7aa899' }}>Objetivo</p>
                    <p className="text-lg font-extrabold text-white">{formatNumber(alert.target)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs" style={{ color: '#7aa899' }}>Progreso</p>
                    <div
                      className="w-20 h-1.5 rounded-full mt-1 overflow-hidden"
                      style={{ background: '#1a3028' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (alert.current / alert.target) * 100)}%`,
                          background: 'linear-gradient(90deg, #00c28b, #06f9b4)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: '#7aa899' }}>Actual</p>
                    <p className="text-sm font-bold" style={{ color: '#00c28b' }}>{formatNumber(alert.current)}</p>
                  </div>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center border-0"
                    style={{ background: 'rgba(239,68,68,0.1)' }}
                  >
                    <span className="material-symbols-rounded text-base" style={{ color: '#ef4444' }}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav active="Alerta" />
    </div>
  )
}
