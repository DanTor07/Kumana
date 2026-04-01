/**
 * Base API service using fetch, following the examples in the PDF.
 * This is the foundation for the "Model" in our MVC architecture.
 */

export const api = {
  get: async (url) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('API GET Error:', error)
      throw error
    }
  },

  post: async (url, data) => {
    // Simulated Post for later implementation with a real back-end
    console.log('Simulating POST to', url, 'with data:', data)
    return { status: 'success', data }
  },
}
