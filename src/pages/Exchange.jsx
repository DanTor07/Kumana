import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import { useFinance, CURRENCIES, formatAmount } from '../context/FinanceContext'

// ── Gemini AI config ────────────────────────────────────────────────────────
const GEMINI_KEY = 'AIzaSyAz8SiFd1Pp11vm2HbZlVHDy3ruZpNNyrU'
// Modelos en orden de fallback (el primero disponible se usa)
const GEMINI_MODELS = [
  'gemini-2.5-flash-preview-04-17', // Gemini 2.5 Flash Preview
  'gemini-2.5-flash',               // Gemini 2.5 Flash
  'gemini-2.5-flash-preview',       // Gemini 2.5 Flash Preview (alias)
  'gemma-3-27b-it',                 // Gemma 3 27B
  'gemma-3-12b-it',                 // Gemma 3 12B
  'gemini-2.0-flash',               // Gemini 2.0 Flash (fallback)
  'gemini-1.5-flash',               // Gemini 1.5 Flash (fallback)
]

async function callGemini(prompt) {
  let lastError = null
  for (const model of GEMINI_MODELS) {
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
      lastError = 'Límite de solicitudes alcanzado. Espera 1 minuto e intenta de nuevo. (Error 429)'
      continue // intenta el siguiente modelo
    }
    if (res.status === 404) {
      lastError = `Modelo no disponible: ${model}`
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
  }
  throw new Error(lastError || 'Todos los modelos fallaron')
}

function buildPrompt({ wallet, investments, baseCurrency, rates }) {
  const today = new Date().toLocaleDateString('es-CO', { dateStyle: 'long' })

  const walletLines = Object.entries(wallet)
    .filter(([, v]) => v > 0)
    .map(([cur, amt]) => {
      const inBase = rates[baseCurrency] && rates[cur]
        ? (amt * rates[baseCurrency]) / rates[cur]
        : null
      return `  ${cur}: ${formatAmount(amt, cur)}${inBase ? ` (≈ ${formatAmount(inBase, baseCurrency)} ${baseCurrency})` : ''}`
    }).join('\n') || '  Sin fondos depositados aún'

  const rateLines = Object.entries(rates)
    .filter(([cur]) => Object.keys(CURRENCIES).includes(cur))
    .map(([cur, r]) => `  1 USD = ${formatAmount(r, cur)} ${cur}`)
    .join('\n')

  const historyLines = investments.slice(0, 8)
    .map(inv => {
      const d = new Date(inv.date).toLocaleDateString('es-CO')
      return `  ${d}: ${inv.fromCurrency}→${inv.toCurrency} | ${formatAmount(inv.fromAmount, inv.fromCurrency)} ${inv.fromCurrency} → ${formatAmount(inv.toAmount, inv.toCurrency)} ${inv.toCurrency}`
    }).join('\n') || '  Sin conversiones aún'

  return `Eres un asesor financiero de divisas experto. Hoy es ${today}.
El usuario usa la app Kumana para gestionar su portafolio de divisas.

MONEDA BASE DEL USUARIO: ${baseCurrency}

PORTAFOLIO ACTUAL:
${walletLines}

TASAS DE CAMBIO ACTUALES (relativas a USD):
${rateLines}

HISTORIAL DE CONVERSIONES RECIENTES:
${historyLines}

Analiza el portafolio y responde ÚNICAMENTE con este JSON (sin markdown, sin texto extra):
{
  "riesgo_global": "BAJO|MEDIO|ALTO",
  "resumen": "2-3 oraciones analizando el portafolio actual",
  "top_monedas": [
    { "moneda": "USD", "accion": "MANTENER|COMPRAR|REDUCIR", "tendencia": "ALCISTA|BAJISTA|ESTABLE", "motivo": "razón breve en español" }
  ],
  "analisis_portafolio": "análisis específico de LAS POSICIONES que tiene el usuario: qué está bien, qué está en riesgo",
  "consejo_del_dia": "consejo concreto y accionable para HOY en español, máx 2 oraciones"
}`
}

const RISK_COLOR = {
  BAJO: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  MEDIO: { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  ALTO: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
}
const TREND_ICON = { ALCISTA: 'trending_up', BAJISTA: 'trending_down', ESTABLE: 'trending_flat' }
const TREND_COLOR = { ALCISTA: '#00c28b', BAJISTA: '#ef4444', ESTABLE: '#7aa899' }
const ACTION_COLOR = { MANTENER: '#7aa899', COMPRAR: '#00c28b', REDUCIR: '#ef4444' }

// ── Currency Picker Modal ──────────────────────────────────────────────────
function CurrencyPicker({ value, onChange, exclude, onClose }) {
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
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-4" style={{ background: '#2a4a3a' }} />
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
        <div className="overflow-y-auto px-3 pb-6" style={{ maxHeight: '55vh' }}>
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

// ── Deposit Modal ──────────────────────────────────────────────────────────
function DepositModal({ onClose, onDeposit }) {
  const [currency, setCurrency] = useState('COP')
  const [amount, setAmount] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const cur = CURRENCIES[currency]

  const handleDeposit = () => {
    const n = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (!n || n <= 0) return
    onDeposit(currency, n)
    onClose()
  }

  return (
    <>
      {showPicker && (
        <CurrencyPicker value={currency} onChange={setCurrency} onClose={() => setShowPicker(false)} />
      )}
      <div className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
        <div
          className="absolute bottom-0 left-1/2 w-full max-w-[430px] rounded-t-3xl p-6 pb-10"
          style={{ background: '#172d25', transform: 'translateX(-50%)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#2a4a3a' }} />
          <h3 className="text-lg font-extrabold text-white mb-1">Depositar fondos</h3>
          <p className="text-xs mb-5" style={{ color: '#7aa899' }}>Simula la carga de dinero a tu cuenta</p>

          <div className="mb-4">
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#7aa899' }}>Moneda</label>
            <button
              onClick={() => setShowPicker(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-0"
              style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}
            >
              <span className="text-xl">{cur.flag}</span>
              <span className="font-bold text-white">{cur.code}</span>
              <span className="text-sm" style={{ color: '#7aa899' }}>{cur.name}</span>
              <span className="ml-auto material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>expand_more</span>
            </button>
          </div>

          <div className="mb-5">
            <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#7aa899' }}>Monto</label>
            <div className="flex items-center gap-3 px-4 rounded-2xl" style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}>
              <span className="text-sm font-bold" style={{ color: '#7aa899' }}>{cur.symbol}</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-transparent py-4 text-white text-xl font-bold outline-none"
              />
              <span className="text-sm font-bold" style={{ color: '#7aa899' }}>{cur.code}</span>
            </div>
          </div>

          <button
            onClick={handleDeposit}
            className="w-full py-4 rounded-2xl font-bold text-base border-0"
            style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)', color: '#0a1f18' }}
          >
            Confirmar depósito
          </button>
        </div>
      </div>
    </>
  )
}

// ── Main Exchange / Inversiones Page ──────────────────────────────────────
export default function Exchange() {
  const {
    wallet, investments, baseCurrency, rates, ratesLoading, ratesError,
    getRate, deposit, invest, getTotalInBase, fetchRates,
  } = useFinance()

  const [showDeposit, setShowDeposit] = useState(false)
  const [showInvest, setShowInvest] = useState(false)
  const [fromCur, setFromCur] = useState('COP')
  const [toCur, setToCur] = useState('USD')
  const [fromAmount, setFromAmount] = useState('')
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)
  const [investSuccess, setInvestSuccess] = useState(false)

  // ── AI advisor state ──
  const [aiData, setAiData] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState(null)
  const [aiTime, setAiTime] = useState(null)

  const analyzePortfolio = async () => {
    setAiLoading(true)
    setAiError(null)
    try {
      const prompt = buildPrompt({ wallet, investments, baseCurrency, rates })
      const result = await callGemini(prompt)
      setAiData(result)
      setAiTime(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      setAiError(e.message || 'Error al contactar Gemini')
    } finally {
      setAiLoading(false)
    }
  }

  const totalBase = getTotalInBase()
  const rate = getRate(fromCur, toCur)
  const fromAmountNum = parseFloat(fromAmount) || 0
  const toAmountNum = rate ? fromAmountNum * rate : 0
  const availableFrom = wallet[fromCur] || 0
  const canInvest = fromAmountNum > 0 && fromAmountNum <= availableFrom && rate

  const holdingsList = Object.entries(wallet)
    .filter(([, v]) => v > 0)
    .map(([cur, amount]) => {
      const inBase = cur === baseCurrency ? amount : (getRate(cur, baseCurrency) ? amount * getRate(cur, baseCurrency) : null)
      return { cur, amount, inBase }
    })
    .sort((a, b) => (b.inBase || 0) - (a.inBase || 0))

  const handleInvest = () => {
    if (!canInvest) return
    const ok = invest(fromCur, toCur, fromAmountNum, toAmountNum, rate)
    if (ok) {
      setInvestSuccess(true)
      setFromAmount('')
      setTimeout(() => { setInvestSuccess(false); setShowInvest(false) }, 2000)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: '#0f231d' }}>

      {/* Modals */}
      {showDeposit && (
        <DepositModal onClose={() => setShowDeposit(false)} onDeposit={deposit} />
      )}
      {showFromPicker && (
        <CurrencyPicker value={fromCur} onChange={setFromCur} exclude={toCur} onClose={() => setShowFromPicker(false)} />
      )}
      {showToPicker && (
        <CurrencyPicker value={toCur} onChange={setToCur} exclude={fromCur} onClose={() => setShowToPicker(false)} />
      )}

      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Inversiones</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {ratesLoading
              ? <span className="text-xs" style={{ color: '#7aa899' }}>Actualizando tasas...</span>
              : ratesError
                ? <span className="text-xs text-red-400">{ratesError}</span>
                : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Tasas en vivo</span>
                  </>
                )
            }
          </div>
        </div>
        <button
          onClick={() => fetchRates()}
          className="w-10 h-10 rounded-xl flex items-center justify-center border-0"
          style={{ background: '#172d25' }}
        >
          <span className="material-symbols-rounded text-lg" style={{ color: '#7aa899' }}>refresh</span>
        </button>
      </header>

      <main className="flex-1 px-5 overflow-y-auto">

        {/* Portfolio summary card */}
        <div
          className="rounded-3xl p-5 mb-5"
          style={{ background: 'linear-gradient(135deg, #1a3d30, #0d2a20)', border: '1px solid rgba(0,194,139,0.2)' }}
        >
          <p className="text-xs font-medium mb-1" style={{ color: '#7aa899' }}>Portafolio total ({baseCurrency})</p>
          <p className="text-4xl font-extrabold text-white">
            {CURRENCIES[baseCurrency]?.symbol}{formatAmount(totalBase, baseCurrency)}
          </p>
          {holdingsList.length === 0 && (
            <p className="text-xs mt-2" style={{ color: '#5a8a78' }}>
              Deposita fondos para comenzar a invertir
            </p>
          )}
        </div>

        {/* Holdings */}
        {holdingsList.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-white mb-3 px-1">Mis activos</h2>
            <div className="flex flex-col gap-3">
              {holdingsList.map(({ cur, amount, inBase }) => {
                const info = CURRENCIES[cur]
                return (
                  <div
                    key={cur}
                    className="flex items-center gap-4 p-4 rounded-3xl"
                    style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: 'rgba(0,194,139,0.08)' }}
                    >
                      {info?.flag}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{cur}</p>
                        <p className="text-xs" style={{ color: '#7aa899' }}>{info?.name}</p>
                      </div>
                      <p className="text-xl font-extrabold text-white mt-0.5">
                        {info?.symbol}{formatAmount(amount, cur)}
                      </p>
                    </div>
                    {inBase != null && cur !== baseCurrency && (
                      <div className="text-right shrink-0">
                        <p className="text-xs" style={{ color: '#7aa899' }}>≈ en {baseCurrency}</p>
                        <p className="text-sm font-bold" style={{ color: '#00c28b' }}>
                          {CURRENCIES[baseCurrency]?.symbol}{formatAmount(inBase, baseCurrency)}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setShowDeposit(true)}
            className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-0"
            style={{ background: '#172d25', color: '#00c28b', border: '1px solid rgba(0,194,139,0.3)' }}
          >
            <span className="material-symbols-rounded text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Depositar
          </button>
          <button
            onClick={() => setShowInvest(!showInvest)}
            className="flex-1 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-0"
            style={{ background: showInvest ? '#00c28b' : 'linear-gradient(135deg, #00c28b, #06f9b4)', color: '#0a1f18' }}
          >
            <span className="material-symbols-rounded text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>currency_exchange</span>
            {showInvest ? 'Cancelar' : 'Invertir'}
          </button>
        </div>

        {/* Invest form */}
        {showInvest && (
          <div
            className="rounded-3xl p-5 mb-5"
            style={{ background: '#172d25', border: '1px solid rgba(0,194,139,0.2)' }}
          >
            <h2 className="text-sm font-bold text-white mb-4">Nueva inversión</h2>

            {/* From */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <label className="text-xs uppercase tracking-widest" style={{ color: '#7aa899' }}>Moneda origen</label>
                <span className="text-xs" style={{ color: availableFrom > 0 ? '#00c28b' : '#5a8a78' }}>
                  Disponible: {CURRENCIES[fromCur]?.symbol}{formatAmount(availableFrom, fromCur)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFromPicker(true)}
                  className="flex items-center gap-2 px-3 py-3 rounded-2xl border-0 shrink-0"
                  style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}
                >
                  <span className="text-lg">{CURRENCIES[fromCur]?.flag}</span>
                  <span className="text-sm font-bold text-white">{fromCur}</span>
                  <span className="material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>expand_more</span>
                </button>
                <div className="flex-1 flex items-center px-3 rounded-2xl" style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}>
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={e => setFromAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent py-3 text-white text-base font-bold outline-none"
                  />
                  <button
                    onClick={() => setFromAmount(String(availableFrom))}
                    className="text-xs px-2 py-1 rounded-lg border-0"
                    style={{ background: 'rgba(0,194,139,0.15)', color: '#00c28b' }}
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Rate & Arrow */}
            <div className="flex items-center justify-center gap-3 my-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(0,194,139,0.15)' }} />
              <div className="flex flex-col items-center gap-1">
                <span className="material-symbols-rounded text-xl" style={{ color: '#00c28b' }}>swap_vert</span>
                {rate ? (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,194,139,0.12)', color: '#00c28b' }}>
                    1 {fromCur} = {formatAmount(rate, toCur)} {toCur}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: '#5a8a78' }}>cargando...</span>
                )}
              </div>
              <div className="flex-1 h-px" style={{ background: 'rgba(0,194,139,0.15)' }} />
            </div>

            {/* To */}
            <div className="mb-5">
              <label className="text-xs uppercase tracking-widest mb-2 block" style={{ color: '#7aa899' }}>Moneda destino</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowToPicker(true)}
                  className="flex items-center gap-2 px-3 py-3 rounded-2xl border-0 shrink-0"
                  style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}
                >
                  <span className="text-lg">{CURRENCIES[toCur]?.flag}</span>
                  <span className="text-sm font-bold text-white">{toCur}</span>
                  <span className="material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>expand_more</span>
                </button>
                <div
                  className="flex-1 flex items-center px-3 py-3 rounded-2xl"
                  style={{ background: 'rgba(0,194,139,0.06)', border: '1px solid rgba(0,194,139,0.15)' }}
                >
                  <span className="text-base font-bold" style={{ color: '#06f9b4' }}>
                    {rate && fromAmountNum > 0
                      ? `≈ ${CURRENCIES[toCur]?.symbol}${formatAmount(toAmountNum, toCur)}`
                      : `${CURRENCIES[toCur]?.symbol}0.00`}
                  </span>
                </div>
              </div>
            </div>

            {/* Validation message */}
            {fromAmountNum > availableFrom && (
              <p className="text-xs text-red-400 mb-3 px-1">
                Fondos insuficientes. Disponible: {CURRENCIES[fromCur]?.symbol}{formatAmount(availableFrom, fromCur)}
              </p>
            )}

            <button
              onClick={handleInvest}
              disabled={!canInvest}
              className="w-full py-4 rounded-2xl font-bold text-base border-0 flex items-center justify-center gap-2 transition-all"
              style={{
                background: investSuccess
                  ? 'rgba(0,194,139,0.2)'
                  : canInvest
                    ? 'linear-gradient(135deg, #00c28b, #06f9b4)'
                    : '#1a3028',
                color: investSuccess ? '#00c28b' : canInvest ? '#0a1f18' : '#5a8a78',
              }}
            >
              <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>
                {investSuccess ? 'check_circle' : 'currency_exchange'}
              </span>
              {investSuccess ? '¡Inversión realizada!' : 'Confirmar inversión'}
            </button>
          </div>
        )}

        {/* History */}
        {investments.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-white mb-3 px-1">Historial</h2>
            <div className="flex flex-col gap-3">
              {investments.slice(0, 10).map(inv => {
                const fromInfo = CURRENCIES[inv.fromCurrency]
                const toInfo = CURRENCIES[inv.toCurrency]
                const date = new Date(inv.date)
                return (
                  <div
                    key={inv.id}
                    className="flex items-center gap-3 p-4 rounded-3xl"
                    style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
                      style={{ background: 'rgba(0,194,139,0.08)' }}
                    >
                      {toInfo?.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-white">{inv.fromCurrency}</span>
                        <span className="material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>arrow_forward</span>
                        <span className="text-sm font-bold text-white">{inv.toCurrency}</span>
                      </div>
                      <p className="text-xs" style={{ color: '#7aa899' }}>
                        {date.toLocaleDateString('es-CO')} {date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs" style={{ color: '#7aa899' }}>
                        -{fromInfo?.symbol}{formatAmount(inv.fromAmount, inv.fromCurrency)}
                      </p>
                      <p className="text-sm font-bold" style={{ color: '#00c28b' }}>
                        +{toInfo?.symbol}{formatAmount(inv.toAmount, inv.toCurrency)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {holdingsList.length === 0 && investments.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-rounded text-6xl block mb-3" style={{ color: '#2a4a3a' }}>savings</span>
            <p className="text-sm font-semibold" style={{ color: '#5a8a78' }}>Sin inversiones aún</p>
            <p className="text-xs mt-1" style={{ color: '#3a5a4a' }}>Deposita fondos para comenzar</p>
          </div>
        )}

        {/* ── Asesor IA ── */}
        <div className="mt-5 rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
          {/* Header */}
          <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #1a1f3a, #172d25)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
                  <span className="material-symbols-rounded text-lg" style={{ color: '#818cf8', fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">Asesor IA</p>
                  <p className="text-xs" style={{ color: '#818cf8' }}>Gemini · Google AI</p>
                </div>
              </div>
              {aiTime && !aiLoading && (
                <span className="text-xs" style={{ color: '#5a8a78' }}>Actualizado {aiTime}</span>
              )}
            </div>
            {!aiData && !aiLoading && (
              <p className="text-xs mt-2" style={{ color: '#7aa899' }}>
                Analiza tu portafolio con IA: tendencias, riesgo y recomendaciones personalizadas.
              </p>
            )}
          </div>

          {/* Body */}
          <div className="px-5 pb-5" style={{ background: '#172d25' }}>

            {/* Error */}
            {aiError && (
              <div className="py-3 px-4 rounded-2xl mb-4 mt-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-xs text-red-400">{aiError}</p>
                <p className="text-xs mt-1" style={{ color: '#5a8a78' }}>Verifica tu conexión o el modelo en el código.</p>
              </div>
            )}

            {/* Loading */}
            {aiLoading && (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.4)', animation: 'spin 1.5s linear infinite' }}>
                  <span className="material-symbols-rounded text-2xl" style={{ color: '#818cf8', fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <p className="text-sm font-semibold text-white">Analizando tu portafolio...</p>
                <p className="text-xs" style={{ color: '#5a8a78' }}>Gemini está procesando los datos</p>
              </div>
            )}

            {/* Results */}
            {aiData && !aiLoading && (() => {
              const risk = RISK_COLOR[aiData.riesgo_global] || RISK_COLOR.MEDIO
              return (
                <>
                  {/* Risk badge + summary */}
                  <div className="flex items-center gap-3 mt-4 mb-4">
                    <div className="px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
                      <span className="material-symbols-rounded text-sm" style={{ color: risk.text, fontVariationSettings: "'FILL' 1" }}>shield</span>
                      <span className="text-xs font-bold" style={{ color: risk.text }}>Riesgo {aiData.riesgo_global}</span>
                    </div>
                  </div>

                  <p className="text-sm mb-4 leading-relaxed" style={{ color: '#a8c5b8' }}>{aiData.resumen}</p>

                  {/* Top currencies */}
                  {aiData.top_monedas?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7aa899' }}>Recomendaciones de monedas</p>
                      <div className="flex flex-col gap-2">
                        {aiData.top_monedas.map((m, i) => {
                          const cur = CURRENCIES[m.moneda]
                          const trendColor = TREND_COLOR[m.tendencia] || '#7aa899'
                          const trendIcon = TREND_ICON[m.tendencia] || 'trending_flat'
                          const actColor = ACTION_COLOR[m.accion] || '#7aa899'
                          return (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#1a3028' }}>
                              <span className="text-2xl shrink-0">{cur?.flag || '🌐'}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-bold text-white">{m.moneda}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${actColor}20`, color: actColor }}>{m.accion}</span>
                                </div>
                                <p className="text-xs leading-snug" style={{ color: '#7aa899' }}>{m.motivo}</p>
                              </div>
                              <span className="material-symbols-rounded text-xl shrink-0" style={{ color: trendColor, fontVariationSettings: "'FILL' 1" }}>{trendIcon}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Portfolio analysis */}
                  {aiData.analisis_portafolio && (
                    <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#818cf8' }}>Análisis de tu portafolio</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#a8c5b8' }}>{aiData.analisis_portafolio}</p>
                    </div>
                  )}

                  {/* Consejo del día */}
                  {aiData.consejo_del_dia && (
                    <div className="flex gap-3 p-4 rounded-2xl mb-4" style={{ background: 'rgba(0,194,139,0.08)', border: '1px solid rgba(0,194,139,0.2)' }}>
                      <span className="material-symbols-rounded text-xl shrink-0 mt-0.5" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#00c28b' }}>Consejo del día</p>
                        <p className="text-sm leading-relaxed" style={{ color: '#a8c5b8' }}>{aiData.consejo_del_dia}</p>
                      </div>
                    </div>
                  )}
                </>
              )
            })()}

            {/* CTA button */}
            <button
              onClick={analyzePortfolio}
              disabled={aiLoading}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border-0 mt-2 disabled:opacity-60"
              style={{ background: aiLoading ? 'rgba(99,102,241,0.2)' : 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white' }}
            >
              <span className="material-symbols-rounded text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                {aiLoading ? 'hourglass_empty' : 'psychology'}
              </span>
              {aiLoading ? 'Analizando...' : aiData ? 'Actualizar análisis' : 'Analizar mi portafolio'}
            </button>

            <p className="text-center text-xs mt-3" style={{ color: '#3a5a4a' }}>
              Solo orientación. No es asesoría financiera certificada.
            </p>
          </div>
        </div>
      </main>

      <BottomNav active="Cambio" />
    </div>
  )
}
