import Constants from 'expo-constants'

const getHost = () => {
  // Expo SDK 49+: debuggerHost está en expoGoConfig o manifest2
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.expoConfig?.hostUri

  const host = debuggerHost ? debuggerHost.split(':')[0] : null
  console.log('[API] BASE_URL host resolved to:', host ?? 'localhost (fallback)')
  return host ?? 'localhost'
}

export const BASE_URL = `http://${getHost()}:8080`

export const api = {
  get: async (url) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API GET Error:', error)
      throw error
    }
  },

  post: async (endpoint, data) => {
    const url = `${BASE_URL}${endpoint}`
    const body = JSON.stringify(data)
    console.log(`[API] POST ${url}`, body)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (!response.ok) {
        const errText = await response.text()
        console.error(`[API] POST ${endpoint} ${response.status}:`, errText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API POST Error:', error.message)
      throw error
    }
  },
}
