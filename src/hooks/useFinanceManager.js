import { useState, useCallback } from 'react'
import { useFinance } from '../context/FinanceContext'
import { CURRENCIES, formatAmount } from '../constants/currencies'
import { financeService } from '../services/financeService'

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-1.5-pro',
]

/**
 * Controller hook for finance business logic (Model-View coordination).
 */

export function useFinanceManager() {
  const {
    user,
    baseCurrency,
    setBaseCurrency,
    rates,
    ratesLoading,
    ratesError,
    getRate,
    getTotalInBase,
    deposit,
    invest,
    wallet,
    investments
  } = useFinance()

  const [chartData, setChartData] = useState(null)
  const [chartLoading, setChartLoading] = useState(false)
  
  const [aiData, setAiData]       = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError]     = useState(null)

  // Synthetic data as a fallback
  const generateSyntheticData = useCallback((currentRate, days, volatility = 0.014) => {
    let seed = (currentRate + days) * 9999
    const rand = () => {
      seed = Math.sin(seed) * 10000
      return seed - Math.floor(seed)
    }
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
  }, [])

  const fetchChartData = useCallback(async (from, to, timeRange) => {
    const RANGE_DAYS = { '1D': 1, '1S': 7, '1M': 30, '1A': 365 }
    const days = RANGE_DAYS[timeRange] || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    setChartLoading(true)
    try {
      const data = await financeService.getHistoricalRates(from, to, startDateStr)
      if (data) {
        setChartData(data)
      } else {
        setChartData(generateSyntheticData(getRate(from, to) || 1, days))
      }
    } catch (err) {
      setChartData(generateSyntheticData(getRate(from, to) || 1, days))
    } finally {
      setChartLoading(false)
    }
  }, [getRate, generateSyntheticData])

  const analyzePortfolio = useCallback(async () => {
    if (!GEMINI_KEY || GEMINI_KEY === 'TEST') {
      setAiError('Configura EXPO_PUBLIC_GEMINI_API_KEY en el archivo .env')
      return
    }
    setAiLoading(true)
    setAiError(null)

    const walletLines = Object.entries(wallet)
      .filter(([, v]) => v > 0)
      .map(([cur, amt]) => {
        const rate = getRate(cur, baseCurrency)
        return `  ${cur}: ${formatAmount(amt, cur)}${rate ? ` (≈ ${formatAmount(amt * rate, baseCurrency)} ${baseCurrency})` : ''}`
      }).join('\n') || '  Sin fondos'

    const historyLines = investments.slice(0, 5)
      .map(inv => `  ${inv.fromCurrency}→${inv.toCurrency} | ${inv.fromAmount} → ${inv.toAmount}`)
      .join('\n') || '  Sin historial'

    const prompt = `Eres un asesor financiero experto. Analiza este portafolio:
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

    let success = false
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
        if (!res.ok) continue
        const json = await res.json()
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          setAiData(JSON.parse(text))
          success = true
          break
        }
      } catch (e) {
        console.error(`Model ${model} failed:`, e)
      }
    }
    if (!success) setAiError('El asesor IA no está disponible en este momento.')
    setAiLoading(false)
  }, [wallet, investments, baseCurrency, getRate])

  const handleDeposit = useCallback(async (currency, amount) => {
    try {
      deposit(currency, amount)
      return true
    } catch (err) {
      return false
    }
  }, [deposit])

  const handleExchange = useCallback(async (fromCur, toCur, fromAmt, toAmt, rate) => {
    try {
      return invest(fromCur, toCur, fromAmt, toAmt, rate)
    } catch (err) {
      return false
    }
  }, [invest])

  return {
    user,
    baseCurrency,
    setBaseCurrency,
    rates,
    ratesLoading,
    ratesError,
    wallet,
    investments,
    chartData,
    chartLoading,
    aiData,
    aiLoading,
    aiError,
    getRate,
    getTotalInBase,
    fetchChartData,
    analyzePortfolio,
    handleDeposit,
    handleExchange,
    CURRENCIES
  }
}
