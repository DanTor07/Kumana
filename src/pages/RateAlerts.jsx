import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { COLORS, commonStyles } from '../styles/theme'

const CURRENCY_PAIRS = [
  { from: 'USD', to: 'COP', fromFlag: '🇺🇸', toFlag: '🇨🇴', current: 4150, step: 50 },
  { from: 'USD', to: 'EUR', fromFlag: '🇺🇸', toFlag: '🇪🇺', current: 0.92, step: 0.01 },
  { from: 'EUR', to: 'USD', fromFlag: '🇪🇺', toFlag: '🇺🇸', current: 1.09, step: 0.01 },
  { from: 'BTC', to: 'USD', fromFlag: '₿', toFlag: '🇺🇸', current: 62400, step: 500 },
]

const initialAlerts = [
  { id: 1, from: 'USD', to: 'EUR', fromFlag: '🇺🇸', toFlag: '🇪🇺', target: 0.95, current: 0.92, type: 'COMPRAR', active: true },
]

export default function RateAlerts() {
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
      ...selectedPair,
      target: targetRate,
      type: targetRate > selectedPair.current ? 'VENDER' : 'COMPRAR',
      active: true,
    }
    setAlerts(prev => [newAlert, ...prev])
    setCreated(true)
    setTimeout(() => setCreated(false), 2000)
  }

  const formatNumber = (n) => {
    if (n >= 1000) return n.toLocaleString('es-CO')
    return n % 1 === 0 ? n.toString() : n.toFixed(3)
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: COLORS.bg }}>
      <header style={commonStyles.header}>
        <div>
          <h1 className="text-2xl font-black text-white">Alertas</h1>
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Sintonizado al mercado</p>
        </div>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center border-0 bg-white/5">
           <span className="material-symbols-rounded text-zinc-400">notifications_active</span>
        </button>
      </header>

      <main className="flex-1 px-5 overflow-y-auto">
        {/* Create Alert */}
        <div style={commonStyles.card} className="mb-6">
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Nueva Alerta de Precio</p>
           
           <div className="mb-6 relative">
              <button onClick={() => setShowPairDropdown(!showPairDropdown)} className="w-full flex items-center gap-4 p-4 rounded-2xl border-0 bg-white/5 text-left">
                 <span className="text-2xl">{selectedPair.fromFlag} / {selectedPair.toFlag}</span>
                 <span className="font-bold text-white flex-1">{selectedPair.from} para {selectedPair.to}</span>
                 <span className="material-symbols-rounded text-zinc-600">expand_more</span>
              </button>

              {showPairDropdown && (
                <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-zinc-900 border border-white/10 z-20 shadow-2xl overflow-hidden">
                   {CURRENCY_PAIRS.map(p => (
                     <button key={`${p.from}${p.to}`} onClick={() => handlePairSelect(p)} className="flex items-center gap-4 w-full p-4 border-0 bg-transparent hover:bg-white/5 text-left border-b border-white/5 last:border-0">
                        <span className="text-xl">{p.fromFlag} {p.toFlag}</span>
                        <p className="text-sm font-bold text-white flex-1">{p.from} / {p.to}</p>
                        <p className="text-xs font-bold text-zinc-500">{formatNumber(p.current)}</p>
                     </button>
                   ))}
                </div>
              )}
           </div>

           <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                 <button onClick={() => setTargetRate(r => r - selectedPair.step)} className="w-12 h-12 rounded-xl bg-white/5 border-0 text-emerald-500 font-black text-xl">-</button>
                 <div className="text-center">
                    <p className="text-3xl font-black text-white tabular-nums">{formatNumber(targetRate)}</p>
                    <p className="text-[10px] font-bold text-zinc-600 mt-1 uppercase">Tasa Objetivo</p>
                 </div>
                 <button onClick={() => setTargetRate(r => r + selectedPair.step)} className="w-12 h-12 rounded-xl bg-white/5 border-0 text-emerald-500 font-black text-xl">+</button>
              </div>
           </div>

           <button 
             onClick={handleCreateAlert}
             className="w-full py-4 rounded-xl font-black border-0 transition-all flex items-center justify-center gap-2"
             style={{ background: created ? COLORS.success : COLORS.primary, color: COLORS.primaryDark }}
           >
             <span className="material-symbols-rounded text-base">{created ? 'check' : 'add_alert'}</span>
             {created ? '¡Alerta Activada!' : 'Activar Notificación'}
           </button>
        </div>

        {/* Alerts List */}
        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 ml-1">Monitoreo Activo</h2>
        {alerts.map(a => (
          <div key={a.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 mb-3">
             <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <p className="font-black text-white">{a.from}/{a.to}</p>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black ${a.type === 'COMPRAR' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>{a.type}</span>
                </div>
                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${a.active ? 'bg-emerald-500' : 'bg-zinc-700'}`} onClick={() => setAlerts(prev => prev.map(al => al.id === a.id ? {...al, active: !al.active} : al))}>
                   <div className={`w-3 h-3 rounded-full bg-white transition-transform ${a.active ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
             </div>
             <div className="flex items-end justify-between">
                <div>
                   <p className="text-[10px] font-bold text-zinc-600 uppercase">Avisar en</p>
                   <p className="text-xl font-black text-white">{formatNumber(a.target)}</p>
                </div>
                <p className="text-xs font-bold text-zinc-500 pb-1">Actual: {formatNumber(a.current)}</p>
             </div>
          </div>
        ))}
      </main>

      <BottomNav active="Alerta" />
    </div>
  )
}
