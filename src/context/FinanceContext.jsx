import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { financeService } from '../services/financeService'
import { CURRENCIES, formatAmount } from '../constants/currencies'

const STORAGE_KEY = 'kumana_v1'

const DEFAULT_STATE = {
  user: {
    name: '',
    username: '',
    email: '',
    phone: '',
    phoneVerified: false,
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

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [state, setState] = useState(DEFAULT_STATE)
  const [hydrated, setHydrated] = useState(false)
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError, setRatesError] = useState(null)

  // Carga inicial desde AsyncStorage (asíncrono)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(s => {
        if (s) setState(prev => ({ ...prev, ...JSON.parse(s) }))
        setHydrated(true)
      })
      .catch(() => setHydrated(true))
  }, [])

  // Persistir cambios en AsyncStorage
  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {})
    }
  }, [state, hydrated])

  const fetchRates = useCallback(async () => {
    setRatesLoading(true)
    setRatesError(null)
    try {
      const data = await financeService.getLatestRates()
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
    if (hydrated) {
      fetchRates()
      const id = setInterval(fetchRates, 60000)
      return () => clearInterval(id)
    }
  }, [hydrated, fetchRates])

  // Retorna cuántas unidades de `to` se obtienen por 1 unidad de `from`
  const getRate = useCallback((from, to) => {
    if (from === to) return 1
    const r = state.rates
    if (!r || Object.keys(r).length === 0) return null
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

  // Retorna true si exitoso, false si fondos insuficientes
  const invest = useCallback((fromCurrency, toCurrency, fromAmount, toAmount, rate) => {
    const available = state.wallet[fromCurrency] || 0
    if (available < fromAmount) return false

    setState(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        [fromCurrency]: (prev.wallet[fromCurrency] || 0) - fromAmount,
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
    }))
    return true
  }, [state.wallet])

  const getTotalInBase = useCallback(() => {
    const base = state.baseCurrency
    return Object.entries(state.wallet).reduce((total, [cur, amt]) => {
      if (!amt || amt <= 0) return total
      const rate = getRate(cur, base)
      return rate != null ? total + amt * rate : total
    }, 0)
  }, [state.wallet, state.baseCurrency, getRate])

  if (!hydrated) return null

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
