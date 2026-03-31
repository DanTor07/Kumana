import { useState, useEffect, useCallback } from 'react'
import { useFinance, CURRENCIES } from '../context/FinanceContext'
import { financeService } from '../services/financeService'

/**
 * Controller hook for finance business logic (Model-View coordination).
 */

export function useFinanceManager() {
  const { 
    baseCurrency, 
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
  
  // Synthetic data as a fallback when API fails or doesn't support a currency
  const generateSyntheticData = useCallback((currentRate, days, volatility = 0.014) => {
    // Deterministic seed
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
        // Fallback for COP, etc.
        setChartData(generateSyntheticData(getRate(from, to) || 1, days))
      }
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setChartData(generateSyntheticData(getRate(from, to) || 1, days))
    } finally {
      setChartLoading(false)
    }
  }, [getRate, generateSyntheticData])

  const handleDeposit = useCallback(async (currency, amount) => {
    try {
      // Logic for deposit
      deposit(currency, amount)
      return true
    } catch (err) {
      console.error('Deposit Error:', err)
      return false
    }
  }, [deposit])

  const handleExchange = useCallback(async (fromCur, toCur, fromAmt, toAmt, rate) => {
    try {
      return invest(fromCur, toCur, fromAmt, toAmt, rate)
    } catch (err) {
      console.error('Exchange Error:', err)
      return false
    }
  }, [invest])

  return {
    baseCurrency,
    rates,
    ratesLoading,
    ratesError,
    wallet,
    investments,
    chartData,
    chartLoading,
    getRate,
    getTotalInBase,
    fetchChartData,
    handleDeposit,
    handleExchange,
    CURRENCIES
  }
}
