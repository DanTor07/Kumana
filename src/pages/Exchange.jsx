import { useState, useCallback } from 'react'
import BottomNav from '../components/BottomNav'
import { formatAmount } from '../context/FinanceContext'
import { useFinanceManager } from '../hooks/useFinanceManager'
import ChartPicker from '../components/ChartPicker'
import { COLORS, commonStyles } from '../styles/theme'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY
const GEMINI_MODELS = [
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview',
  'gemma-3-27b-it',
  'gemma-3-12b-it',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
]

async function callGemini(prompt) {
  let lastError = null
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
          }),
        }
      )
      if (res.status === 429) {
        lastError = 'Límite de solicitudes alcanzado. Intenta luego. (429)'
        continue
      }
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        lastError = errJson?.error?.message || `Error ${res.status}`
        continue
      }
      const json = await res.json()
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) { lastError = 'Respuesta vacía de Gemini'; continue }
      return JSON.parse(text)
    } catch (e) {
      lastError = e.message
      continue
    }
  }
  throw new Error(lastError || 'Todos los modelos fallaron')
}

function buildPrompt({ wallet, investments, baseCurrency, rates, currencies }) {
  const today = new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })
  const walletLines = Object.entries(wallet)
    .filter(([, v]) => v > 0)
    .map(([cur, amt]) => {
      const rate = rates[baseCurrency] && rates[cur] ? rates[baseCurrency] / rates[cur] : null
      return `  ${cur}: ${formatAmount(amt, cur)}${rate ? ` (≈ ${formatAmount(amt * rate, baseCurrency)} ${baseCurrency})` : ''}`
    }).join('\n') || '  Sin fondos'

  const historyLines = investments.slice(0, 5)
    .map(inv => `  ${inv.fromCurrency}→${inv.toCurrency} | ${inv.fromAmount} → ${inv.toAmount}`)
    .join('\n') || '  Sin historial'

  return `Eres un asesor financiero experto. Analiza este portafolio:
Moneda base: ${baseCurrency}
Saldos:
${walletLines}
Historial:
${historyLines}
Responde SOLO con un JSON:
{
  "riesgo_global": "BAJO|MEDIO|ALTO",
  "resumen": "análisis breve",
  "top_monedas": [{ "moneda": "USD", "accion": "COMPRAR", "tendencia": "ALCISTA", "motivo": "resumen" }],
  "analisis_portafolio": "detalle",
  "consejo_del_dia": "consejo accionable"
}`
}

const RISK_COLOR = {
  BAJO: { text: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  MEDIO: { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ALTO: { text: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}



function DepositModal({ onClose, onDeposit, currencies }) {
  const [currency, setCurrency] = useState('COP')
  const [amount, setAmount] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const cur = currencies[currency]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={onClose}>
      {showPicker && <ChartPicker value={currency} onChange={setCurrency} onClose={() => setShowPicker(false)} />}
      <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: COLORS.card }} onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-4">Depositar fondos</h3>
        <button onClick={() => setShowPicker(true)} className="w-full flex items-center gap-3 p-4 rounded-xl mb-4 border-0" style={{ background: COLORS.cardLight }}>
           <span className="text-2xl">{cur.flag}</span>
           <span className="font-bold text-white">{cur.code}</span>
           <span className="ml-auto material-symbols-rounded text-sm" style={{ color: COLORS.textMuted }}>expand_more</span>
        </button>
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 border-0" style={{ background: COLORS.cardLight }}>
          <span className="font-bold text-zinc-500">{cur.symbol}</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="flex-1 bg-transparent text-white text-xl font-bold outline-none" />
        </div>
        <button 
          onClick={() => { const n = parseFloat(amount); if (n > 0) { onDeposit(currency, n); onClose() } }}
          className="w-full py-4 rounded-xl font-bold border-0"
          style={{ background: COLORS.primary, color: COLORS.primaryDark }}
        >
          Confirmar depósito
        </button>
      </div>
    </div>
  )
}

export default function Exchange() {
  const {
    wallet, investments, baseCurrency, rates, ratesLoading, ratesError,
    getRate, getTotalInBase, handleDeposit, handleExchange, CURRENCIES
  } = useFinanceManager()

  const [showDeposit, setShowDeposit] = useState(false)
  const [showInvest, setShowInvest] = useState(false)
  const [fromCur, setFromCur] = useState('COP')
  const [toCur, setToCur] = useState('USD')
  const [fromAmount, setFromAmount] = useState('')
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)
  const [investSuccess, setInvestSuccess] = useState(false)



  const analyzePortfolio = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const prompt = buildPrompt({ wallet, investments, baseCurrency, rates, currencies: CURRENCIES })
      const result = await callGemini(prompt)
      setAiData(result)
    } catch (e) {
      setAiError(e.message)
    } finally {
      setAiLoading(false)
    }
  }

  const rate = getRate(fromCur, toCur)
  const fromAmtNum = parseFloat(fromAmount) || 0
  const toAmtNum = rate ? fromAmtNum * rate : 0
  const available = wallet[fromCur] || 0
  const canInvest = fromAmtNum > 0 && fromAmtNum <= available && rate

  const onConfirmInvest = async () => {
    if (!canInvest) return
    const ok = await handleExchange(fromCur, toCur, fromAmtNum, toAmtNum, rate)
    if (ok) {
      setInvestSuccess(true)
      setFromAmount('')
      setTimeout(() => { setInvestSuccess(false); setShowInvest(false) }, 2000)
    }
  }

  const holdings = Object.entries(wallet)
    .filter(([, v]) => v > 0)
    .map(([cur, amt]) => ({ cur, amt, inBase: getRate(cur, baseCurrency) ? amt * getRate(cur, baseCurrency) : 0 }))
    .sort((a,b) => b.inBase - a.inBase)

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: COLORS.bg }}>
      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} onDeposit={handleDeposit} currencies={CURRENCIES} />}
      {showFromPicker && <ChartPicker value={fromCur} exclude={toCur} onChange={setFromCur} onClose={() => setShowFromPicker(false)} />}
      {showToPicker && <ChartPicker value={toCur} exclude={fromCur} onChange={setToCur} onClose={() => setShowToPicker(false)} />}

      <header style={commonStyles.header}>
        <h1 className="text-2xl font-black text-white">Inversiones</h1>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: ratesLoading ? `${COLORS.warning}1a` : `${COLORS.success}1a` }}>
          <span className={`w-2 h-2 rounded-full ${ratesLoading ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`} />
          <span className="text-[10px] font-black text-white uppercase">{ratesLoading ? '...' : 'Live'}</span>
        </div>
      </header>

      <main className="flex-1 px-5 overflow-y-auto">
        {/* Portfolio */}
        <div className="rounded-3xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, #1a3d30, #0d2a20)', border: `1px solid ${COLORS.primary}33` }}>
          <p className="text-xs font-bold mb-1" style={{ color: COLORS.textMuted }}>Portafolio estimado ({baseCurrency})</p>
          <p className="text-4xl font-black text-white">{CURRENCIES[baseCurrency]?.symbol}{formatAmount(getTotalInBase(), baseCurrency)}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setShowDeposit(true)} className="flex-1 py-4 rounded-xl font-bold border-0" style={{ background: COLORS.cardLight, color: COLORS.primary }}>+ Depositar</button>
          <button onClick={() => setShowInvest(!showInvest)} className="flex-1 py-4 rounded-xl font-bold border-0" style={{ background: COLORS.primary, color: COLORS.primaryDark }}>{showInvest ? 'Cerrar' : 'Invertir'}</button>
        </div>

        {/* Invest Form */}
        {showInvest && (
          <div style={commonStyles.card} className="mb-6">
            <h2 className="text-sm font-bold text-white mb-4">Transferir divisas</h2>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setShowFromPicker(true)} className="flex-1 flex items-center gap-2 p-3 rounded-xl border-0" style={{ background: COLORS.cardLight }}>
                <span className="text-xl">{CURRENCIES[fromCur]?.flag}</span>
                <span className="font-bold text-white">{fromCur}</span>
              </button>
              <div className="flex-1 p-3 rounded-xl flex items-center" style={{ background: COLORS.cardLight }}>
                <input type="number" value={fromAmount} onChange={e => setFromAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-white font-bold outline-none" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-bold text-zinc-600">1 {fromCur} = {formatAmount(rate || 0, toCur)} {toCur}</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
             <div className="flex gap-2 mb-6">
              <button onClick={() => setShowToPicker(true)} className="flex-1 flex items-center gap-2 p-3 rounded-xl border-0" style={{ background: COLORS.cardLight }}>
                <span className="text-xl">{CURRENCIES[toCur]?.flag}</span>
                <span className="font-bold text-white">{toCur}</span>
              </button>
              <div className="flex-1 p-3 rounded-xl flex items-center bg-emerald-500/10">
                <span className="font-bold text-emerald-400">{rate && fromAmtNum > 0 ? formatAmount(toAmtNum, toCur) : '0.00'}</span>
              </div>
            </div>
            <button 
              disabled={!canInvest || investSuccess}
              onClick={onConfirmInvest}
              className="w-full py-4 rounded-xl font-black border-0 transition-all"
              style={{ background: investSuccess ? COLORS.success : COLORS.primary, color: COLORS.primaryDark, opacity: (!canInvest && !investSuccess) ? 0.4 : 1 }}
            >
              {investSuccess ? '¡Completado!' : 'Confirmar intercambio'}
            </button>
          </div>
        )}

        {/* Assets List */}
        {holdings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1">Mis Activos</h2>
            {holdings.map(h => (
              <div key={h.cur} className="flex items-center gap-4 p-4 rounded-2xl mb-2" style={{ background: COLORS.cardLight }}>
                <span className="text-2xl">{CURRENCIES[h.cur]?.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{h.cur}</p>
                  <p className="text-lg font-black text-white">{CURRENCIES[h.cur]?.symbol}{formatAmount(h.amt, h.cur)}</p>
                </div>
                {h.cur !== baseCurrency && (
                   <p className="text-xs font-bold text-emerald-500">≈ {formatAmount(h.inBase, baseCurrency)}</p>
                )}
              </div>
            ))}
          </div>
        )}


        <div className="rounded-3xl border border-indigo-500/30 overflow-hidden bg-slate-900/40">
           <div className="p-5 bg-gradient-to-br from-indigo-950 to-emerald-950">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <span className="material-symbols-rounded text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div>
                   <p className="text-sm font-black text-white">Analista IA</p>
                   <p className="text-[10px] uppercase font-bold text-indigo-400">Gemini Pro</p>
                </div>
             </div>
           </div>
           <div className="p-5">
             {aiLoading ? (
               <div className="py-10 text-center animate-pulse">
                 <p className="text-sm font-bold text-indigo-300">Procesando mercado...</p>
               </div>
             ) : aiData ? (
               <div className="animate-fade-in">
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase" style={{ background: RISK_COLOR[aiData.riesgo_global]?.bg, color: RISK_COLOR[aiData.riesgo_global]?.text }}>
                      Riesgo {aiData.riesgo_global}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">{aiData.resumen}</p>
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">Consejo Estratégico</p>
                    <p className="text-sm text-zinc-300">{aiData.consejo_del_dia}</p>
                  </div>
               </div>
             ) : (
               <p className="text-sm text-zinc-500 mb-6">Optimiza tu portafolio con asesoría basada en IA y tendencias actuales.</p>
             )}
             <button
               onClick={analyzePortfolio}
               disabled={aiLoading}
               className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 border-0 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform"
             >
               {aiLoading ? 'Analizando...' : aiData ? 'Recalcular análisis' : 'Analizar Portafolio'}
             </button>
           </div>
        </div>
      </main>

      <BottomNav active="Cambio" />
    </div>
  )
}
