import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function VerifyNumber() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyCode, loading, error } = useAuth()
  const phone = location.state?.phone || '3000000088'
  const countryCode = location.state?.countryCode || '+57'

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)

  // Masked phone display
  const maskedPhone = `${countryCode} *** ** ${phone.slice(-2)}`

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      const idx = digits.findLastIndex(d => d !== '')
      if (idx >= 0) {
        const newDigits = [...digits]
        newDigits[idx] = ''
        setDigits(newDigits)
      }
      return
    }
    const idx = digits.findIndex(d => d === '')
    if (idx >= 0) {
      const newDigits = [...digits]
      newDigits[idx] = key
      setDigits(newDigits)
    }
  }

  const handleResend = () => {
    if (!canResend) return
    setCountdown(30)
    setCanResend(false)
    setDigits(['', '', '', '', '', ''])
  }

  const isComplete = digits.every(d => d !== '')

  const keys = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['','0','backspace'],
  ]

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0f231d' }}
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center border-0"
          style={{ background: '#1a3028' }}
        >
          <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>arrow_back</span>
        </button>
      </header>

      <main className="flex-1 px-6">
        {/* Title */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(0,194,139,0.12)', border: '1px solid rgba(0,194,139,0.25)' }}
          >
            <span
              className="material-symbols-rounded text-3xl"
              style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}
            >
              sms
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Verifica tu número</h1>
          <p className="text-sm" style={{ color: '#7aa899' }}>
            Ingresa el código enviado a
          </p>
          <p className="text-sm font-semibold text-white mt-1">{maskedPhone}</p>
        </div>

        {/* OTP Boxes */}
        <div className="flex justify-center gap-3 mb-4">
          {digits.map((d, i) => (
            <div
              key={i}
              className="w-12 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
              style={{
                background: d ? 'rgba(0,194,139,0.15)' : '#1a3028',
                border: d
                  ? '2px solid #00c28b'
                  : i === digits.findIndex(x => x === '')
                  ? '2px solid rgba(0,194,139,0.4)'
                  : '2px solid transparent',
                color: '#06f9b4',
                transition: 'all 0.15s ease',
              }}
            >
              {d || (i === digits.findIndex(x => x === '') ? '|' : '')}
            </div>
          ))}
        </div>

        {/* Resend */}
        <div className="text-center mb-8">
          {canResend ? (
            <button
              onClick={handleResend}
              className="text-sm font-semibold border-0 bg-transparent"
              style={{ color: '#00c28b' }}
            >
              Reenviar código
            </button>
          ) : (
            <p className="text-sm" style={{ color: '#7aa899' }}>
              Reenviar código en{' '}
              <span className="font-semibold text-white">
                00:{String(countdown).padStart(2, '0')}
              </span>
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-center text-xs font-medium text-red-500 mb-4 animate-bounce">
            {error} (Prueba con 123456)
          </p>
        )}

        {/* Numeric keypad */}
        <div className="flex flex-col gap-3">
          {keys.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-4">
              {row.map((key, ki) => (
                key === '' ? (
                  <div key={ki} className="w-20 h-14" />
                ) : key === 'backspace' ? (
                  <button
                    key={ki}
                    onClick={() => handleKeyPress('backspace')}
                    className="w-20 h-14 rounded-2xl flex items-center justify-center border-0"
                    style={{ background: '#1a3028' }}
                  >
                    <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>backspace</span>
                  </button>
                ) : (
                  <button
                    key={ki}
                    onClick={() => handleKeyPress(key)}
                    className="w-20 h-14 rounded-2xl flex items-center justify-center text-xl font-semibold text-white border-0 active:scale-95 transition-transform"
                    style={{ background: '#1a3028' }}
                  >
                    {key}
                  </button>
                )
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="px-6 pb-10 pt-4">
        <button
          disabled={!isComplete || loading}
          onClick={async () => {
            if (isComplete) {
              const ok = await verifyCode(digits.join(''))
              if (ok) navigate('/completar-perfil')
            }
          }}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all"
          style={{
            background: isComplete && !loading ? 'linear-gradient(135deg, #00c28b, #06f9b4)' : '#1a3028',
            color: isComplete && !loading ? '#0a1f18' : '#5a8a78',
            border: 'none',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Verificando...' : 'Verificar'}
          <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
        </button>
      </footer>
    </div>
  )
}
