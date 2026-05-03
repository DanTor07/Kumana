import { api, BASE_URL } from './api'

const FRANKFURTER_SUPPORTED = new Set([
  'EUR','GBP','JPY','CHF','CAD','AUD','CNY','HKD','NZD','SEK','NOK','DKK',
  'MXN','BRL','HUF','PLN','CZK','RON','BGN','ISK','IDR','INR','ILS','KRW',
  'MYR','PHP','SGD','THB','TRY','ZAR',
])

export const financeService = {
  getLatestRates: async () => {
    try {
      const data = await api.get(`${BASE_URL}/rates/latest`)
      if (!data?.rates) throw new Error('Invalid response from rates API')
      return data
    } catch (error) {
      console.error('financeService.getLatestRates failed:', error)
      throw error
    }
  },

  getHistoricalRates: async (from, to, startDate) => {
    const canUseAPI = (from === 'USD' || FRANKFURTER_SUPPORTED.has(from)) &&
                     (to === 'USD' || FRANKFURTER_SUPPORTED.has(to)) &&
                     from !== to

    if (canUseAPI) {
      try {
        const data = await api.get(
          `${BASE_URL}/rates/historical?from=${from}&to=${to}&startDate=${startDate}`
        )
        if (Array.isArray(data) && data.length > 0) return data
      } catch (error) {
        console.warn('Backend historical rates failed, using synthetic data.', error)
      }
    }

    return null
  },

  depositWallet: async (userId, currency, amount) => {
    return await api.post('/wallet/deposit', { userId, currency, amount })
  },

  exchangeCurrency: async (userId, fromCurrency, toCurrency, fromAmount, toAmount, rate) => {
    return await api.post('/investments/exchange', {
      userId, fromCurrency, toCurrency, fromAmount, toAmount, rate,
    })
  },
}
