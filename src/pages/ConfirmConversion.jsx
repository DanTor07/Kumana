import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { formatAmount } from '../context/FinanceContext'
import { useFinanceManager } from '../hooks/useFinanceManager'
import { COLORS, commonStyles } from '../styles/theme'

export default function ConfirmConversion() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getRate, handleExchange, wallet, CURRENCIES } = useFinanceManager()

  const fromCur = location.state?.fromCur || 'USD'
  const toCur   = location.state?.toCur   || 'EUR'
  const amount  = parseFloat(location.state?.amount) || 0

  const [timer, setTimer]       = useState(60)
  const [confirmed, setConfirmed] = useState(false)
  const [didInvest, setDidInvest] = useState(false)

  const rate      = getRate(fromCur, toCur)
  const toAmount  = rate && amount > 0 ? amount * rate : 0
  const fromInfo  = CURRENCIES[fromCur]
  const toInfo    = CURRENCIES[toCur]
  const available = wallet[fromCur] || 0
  const hasFunds  = amount > 0 && amount <= available && rate

  useEffect(() => {
    if (timer <= 0 || confirmed) return
    const t = setTimeout(() => setTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timer, confirmed])

  const handleConfirm = async () => {
    if (hasFunds) {
      const ok = await handleExchange(fromCur, toCur, amount, toAmount, rate)
      if (ok) setDidInvest(true)
    }
    setConfirmed(true)
    setTimeout(() => navigate('/cambio'), 2500)
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: COLORS.bgDark }}>
        <div 
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8 animate-bounce"
          style={{ background: `${COLORS.primary}1a`, border: `2px solid ${COLORS.primary}` }}
        >
          <span className="material-symbols-rounded text-6xl" style={{ color: COLORS.primary, fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h2 className="text-3xl font-black text-white mb-3 text-center">
          {didInvest ? '¡Éxito total!' : 'Simulación lista'}
        </h2>
        <p className="text-sm text-center mb-10 leading-relaxed" style={{ color: COLORS.textMuted }}>
          {didInvest 
            ? 'Tu balance ha sido actualizado automáticamente.' 
            : 'No tenías fondos suficientes, pero la simulación fue guardada.'}
        </p>
        <div className="w-full rounded-2xl p-6" style={{ background: COLORS.card, border: `1px solid ${COLORS.primary}33` }}>
          <div className="flex justify-between py-3 border-b border-white/5">
            <span className="text-sm font-bold" style={{ color: COLORS.textMuted }}>Enviaste</span>
            <p className="text-sm font-black text-white">{fromInfo?.flag} {formatAmount(amount, fromCur)} {fromCur}</p>
          </div>
          <div className="flex justify-between py-3 border-b border-white/5">
            <span className="text-sm font-bold" style={{ color: COLORS.textMuted }}>Recibiste</span>
            <p className="text-sm font-black text-emerald-400">{toInfo?.flag} {formatAmount(toAmount, toCur)} {toCur}</p>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-sm font-bold" style={{ color: COLORS.textMuted }}>Comisión</span>
            <span className="text-[10px] font-black px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">TARIF $0</span>
          </div>
        </div>
        <div className="mt-10 flex items-center gap-3 animate-pulse">
           <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
           <p className="text-xs font-bold text-zinc-600">Volviendo a inversiones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: COLORS.bg }}>
      <header className="px-6 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center border-0" style={{ background: COLORS.card }}>
          <span className="material-symbols-rounded text-zinc-400">arrow_back</span>
        </button>
        <h1 className="text-lg font-black text-white">Confirmar Conversión</h1>
      </header>

      <main className="flex-1 px-6 py-4">
        <div className="flex justify-center mb-8">
           <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <span className="material-symbols-rounded text-4xl text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>currency_exchange</span>
           </div>
        </div>

        {!hasFunds && amount > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
             <span className="material-symbols-rounded text-amber-500">warning</span>
             <p className="text-xs font-bold text-amber-500 leading-relaxed">Saldo insuficiente. Esta transacción solo se ejecutará como simulación.</p>
          </div>
        )}

        <div style={commonStyles.card} className="mb-6">
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Detalle de Operación</p>
           
           <div className="flex gap-4 items-center mb-6">
              <span className="text-3xl">{fromInfo?.flag}</span>
              <div className="flex-1">
                 <p className="text-xs font-bold text-zinc-500">Pagaste</p>
                 <p className="text-xl font-black text-white">{fromInfo?.symbol}{formatAmount(amount, fromCur)}</p>
              </div>
              <span className="text-xs font-bold text-zinc-600">{fromCur}</span>
           </div>

           <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/5"></div>
              <div className="px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2">
                 <span className="material-symbols-rounded text-xs text-emerald-500">stat_0</span>
                 <p className="text-[10px] font-black text-emerald-500">1 {fromCur} = {formatAmount(rate || 0, toCur)} {toCur}</p>
              </div>
              <div className="flex-1 h-px bg-white/5"></div>
           </div>

           <div className="flex gap-4 items-center mb-4">
              <span className="text-3xl">{toInfo?.flag}</span>
              <div className="flex-1">
                 <p className="text-xs font-bold text-zinc-500">Recibirás</p>
                 <p className="text-2xl font-black text-emerald-400">{toInfo?.symbol}{formatAmount(toAmount, toCur)}</p>
              </div>
              <span className="text-xs font-bold text-zinc-600">{toCur}</span>
           </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl mb-10" style={{ background: timer > 20 ? 'rgba(0,194,139,0.05)' : 'rgba(239,68,68,0.05)', border: `1px solid ${timer > 20 ? COLORS.primary : COLORS.error}22` }}>
           <span className="material-symbols-rounded" style={{ color: timer > 20 ? COLORS.primary : COLORS.error }}>history_toggle_off</span>
           <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-0.5">Tasa bloqueada</p>
              <p className="text-xs font-bold text-zinc-400">Expira en {timer} segundos</p>
           </div>
           <p className="text-xl font-black tabular-nums" style={{ color: timer > 20 ? COLORS.primary : COLORS.error }}>{timer}s</p>
        </div>
      </main>

      <footer className="px-6 pb-12 flex flex-col gap-3">
         <button 
           onClick={handleConfirm}
           disabled={timer === 0 || !rate}
           className="w-full py-5 rounded-2xl font-black text-base border-0 shadow-xl"
           style={{ background: COLORS.primary, color: COLORS.primaryDark, boxShadow: `0 8px 24px ${COLORS.primary}33`, opacity: timer === 0 ? 0.5 : 1 }}
         >
           Confirmar {hasFunds ? 'Transacción' : 'Simulación'}
         </button>
         <button onClick={() => navigate(-1)} className="w-full py-4 text-sm font-bold text-zinc-600 border-0 bg-transparent">Cancelar operación</button>
      </footer>
    </div>
  )
}
