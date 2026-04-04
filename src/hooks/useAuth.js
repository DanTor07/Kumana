import { useState, useCallback } from 'react'
import { useFinance } from '../context/FinanceContext'

/**
 * Controller hook for authentication (Registration/Profile).
 */

export function useAuth() {
  const { user, updateUser } = useFinance()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const registerPhone = useCallback(async (phone, countryCode) => {
    setLoading(true)
    setError(null)
    try {
      // Simulation of SMS sending
      console.log(`Sending SMS to ${countryCode} ${phone}`)
      updateUser({ phone, countryCode })
      return true
    } catch (err) {
      setError('Error al enviar el código. Inténtalo de nuevo.')
      return false
    } finally {
      setLoading(false)
    }
  }, [updateUser])

  const verifyCode = useCallback(async (code) => {
    setLoading(true)
    setError(null)
    try {
      // Simulation of code verification
      if (code === '123456') { // Mock correct code
        updateUser({ phoneVerified: true })
        return true
      }
      setError('Código incorrecto.')
      return false
    } catch (err) {
      setError('Error de conexión.')
      return false
    } finally {
      setLoading(false)
    }
  }, [updateUser])

  const saveProfile = useCallback(async (profileData) => {
    setLoading(true)
    try {
      updateUser({ 
        ...profileData, 
        memberSince: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long' }) 
      })
      return true
    } catch (err) {
      setError('Error al guardar el perfil.')
      return false
    } finally {
      setLoading(false)
    }
  }, [updateUser])

  return {
    user,
    loading,
    error,
    registerPhone,
    verifyCode,
    saveProfile,
  }
}
