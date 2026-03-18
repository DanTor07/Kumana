import { createContext, useContext, useState, useEffect, useCallback } from 'react'

export const CURRENCIES = {
  USD: { name: 'Dólar Americano',    flag: '🇺🇸', symbol: '$',   code: 'USD' },
  EUR: { name: 'Euro',               flag: '🇪🇺', symbol: '€',   code: 'EUR' },
  GBP: { name: 'Libra Esterlina',    flag: '🇬🇧', symbol: '£',   code: 'GBP' },
  COP: { name: 'Peso Colombiano',    flag: '🇨🇴', symbol: '$',   code: 'COP' },
  MXN: { name: 'Peso Mexicano',      flag: '🇲🇽', symbol: '$',   code: 'MXN' },
  BRL: { name: 'Real Brasileño',     flag: '🇧🇷', symbol: 'R$',  code: 'BRL' },
  JPY: { name: 'Yen Japonés',        flag: '🇯🇵', symbol: '¥',   code: 'JPY' },
  CHF: { name: 'Franco Suizo',       flag: '🇨🇭', symbol: 'Fr',  code: 'CHF' },
  CAD: { name: 'Dólar Canadiense',   flag: '🇨🇦', symbol: '$',   code: 'CAD' },
  ARS: { name: 'Peso Argentino',     flag: '🇦🇷', symbol: '$',   code: 'ARS' },
  CLP: { name: 'Peso Chileno',       flag: '🇨🇱', symbol: '$',   code: 'CLP' },
  PEN: { name: 'Sol Peruano',        flag: '🇵🇪', symbol: 'S/',  code: 'PEN' },
}

export function formatAmount(amount, currency) {
  const decimals = ['JPY', 'CLP', 'COP'].includes(currency) ? 0 : 2
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

const DEFAULT_STATE = {
  user: {
    name: '',
    username: '',
    email: '',
    phone: '',
    idType: 'CC',
    cedula: '',
    avatar: null,
    memberSince: '',
  },
  baseCurrency: 'COP',
  wallet: {},
  investments: [],
  rates: {},
  ratesBase: 'USD',
  lastUpdated: null,
}

function load() {
  try {
    const s = localStorage.getItem('kumana_v1')
    if (s) return { ...DEFAULT_STATE, ...JSON.parse(s) }
  } catch {}
  return DEFAULT_STATE
}

function save(data) {
  try { localStorage.setItem('kumana_v1', JSON.stringify(data)) } catch {}
}

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [state, setState] = useState(load)
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError, setRatesError] = useState(null)

  useEffect(() => { save(state) }, [state])

  const fetchRates = useCallback(async () => {
    setRatesLoading(true)
    setRatesError(null)
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = await res.json()
      if (data.result === 'success') {
        setState(prev => ({
          ...prev,
          rates: data.rates,
          ratesBase: 'USD',
          lastUpdated: new Date().toISOString(),
        }))
      } else {
        setRatesError('Error al obtener tasas')
      }
    } catch {
      setRatesError('Sin conexión — usando tasas guardadas')
    } finally {
      setRatesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates()
    const id = setInterval(fetchRates, 60000)
    return () => clearInterval(id)
  }, [fetchRates])

  // Returns: how many units of `to` you get for 1 unit of `from`
  const getRate = useCallback((from, to) => {
    if (from === to) return 1
    const r = state.rates
    if (!r || Object.keys(r).length === 0) return null
    // rates are relative to USD (ratesBase)
    if (from === 'USD') return r[to] ?? null
    if (to === 'USD') return r[from] ? 1 / r[from] : null
    if (!r[from] || !r[to]) return null
    return r[to] / r[from]
  }, [state.rates])

  const updateUser = useCallback((updates) => {
    setState(prev => ({ ...prev, user: { ...prev.user, ...updates } }))
  }, [])

  const setBaseCurrency = useCallback((currency) => {
    setState(prev => ({ ...prev, baseCurrency: currency }))
  }, [])

  const deposit = useCallback((currency, amount) => {
    setState(prev => ({
      ...prev,
      wallet: { ...prev.wallet, [currency]: (prev.wallet[currency] || 0) + amount },
    }))
  }, [])

  // Returns true if successful, false if insufficient funds
  const invest = useCallback((fromCurrency, toCurrency, fromAmount, toAmount, rate) => {
    let ok = false
    setState(prev => {
      const available = prev.wallet[fromCurrency] || 0
      if (available < fromAmount) return prev
      ok = true
      return {
        ...prev,
        wallet: {
          ...prev.wallet,
          [fromCurrency]: available - fromAmount,
          [toCurrency]: (prev.wallet[toCurrency] || 0) + toAmount,
        },
        investments: [
          {
            id: Date.now(),
            fromCurrency,
            toCurrency,
            fromAmount,
            toAmount,
            rate,
            date: new Date().toISOString(),
          },
          ...prev.investments,
        ],
      }
    })
    return ok
  }, [])

  const getTotalInBase = useCallback(() => {
    const base = state.baseCurrency
    return Object.entries(state.wallet).reduce((total, [cur, amt]) => {
      if (!amt || amt <= 0) return total
      const rate = cur === base ? 1 : (() => {
        const r = state.rates
        if (!r || !Object.keys(r).length) return null
        if (cur === 'USD') return r[base] ?? null
        if (base === 'USD') return r[cur] ? 1 / r[cur] : null
        return r[base] && r[cur] ? r[base] / r[cur] : null
      })()
      return rate != null ? total + amt * rate : total
    }, 0)
  }, [state.wallet, state.baseCurrency, state.rates])

  return (
    <FinanceContext.Provider value={{
      ...state,
      ratesLoading,
      ratesError,
      fetchRates,
      getRate,
      updateUser,
      setBaseCurrency,
      deposit,
      invest,
      getTotalInBase,
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be inside FinanceProvider')
  return ctx
}
