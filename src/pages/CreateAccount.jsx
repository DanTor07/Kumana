import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const countryCodes = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+1', flag: '🇺🇸', name: 'EE.UU.' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
]

export default function CreateAccount() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState(countryCodes[0])
  const [showDropdown, setShowDropdown] = useState(false)

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
  }

  const isValid = phone.length >= 7

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#10221d' }}
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-xl flex items-center justify-center border-0"
          style={{ background: '#1a3028' }}
        >
          <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>arrow_back</span>
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)' }}
          >
            <span className="material-symbols-rounded text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              currency_exchange
            </span>
          </div>
          <span className="font-bold text-base text-white">Kumana Fintech</span>
        </div>
      </header>

      <main className="flex-1 px-6 pt-4">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2">Crear cuenta</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#7aa899' }}>
            Ingresa tu número de móvil para recibir un código de verificación.
          </p>
        </div>

        {/* Phone input */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7aa899' }}>
            Número de teléfono
          </label>
          <div
            className="flex items-center rounded-2xl overflow-visible relative"
            style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}
          >
            {/* Country selector */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-4 border-0 bg-transparent shrink-0"
              style={{ borderRight: '1px solid rgba(0,194,139,0.15)' }}
            >
              <span className="text-xl">{countryCode.flag}</span>
              <span className="text-sm font-medium text-white">{countryCode.code}</span>
              <span className="material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>expand_more</span>
            </button>

            {/* Phone number input */}
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="300 000 0000"
              className="flex-1 bg-transparent px-4 py-4 text-white text-base outline-none placeholder:text-opacity-40"
              style={{ color: 'white' }}
            />
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="mt-1 rounded-2xl overflow-hidden z-10 relative"
              style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}
            >
              {countryCodes.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setCountryCode(c); setShowDropdown(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left border-0 bg-transparent hover:bg-white/5"
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-sm text-white">{c.name}</span>
                  <span className="ml-auto text-sm" style={{ color: '#7aa899' }}>{c.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div
          className="flex items-start gap-3 p-4 rounded-2xl mb-8"
          style={{ background: 'rgba(0,194,139,0.08)', border: '1px solid rgba(0,194,139,0.15)' }}
        >
          <span className="material-symbols-rounded text-xl shrink-0 mt-0.5" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>
            info
          </span>
          <p className="text-xs leading-relaxed" style={{ color: '#7aa899' }}>
            Te enviaremos un SMS con un código de 6 dígitos. Se aplicarán tarifas estándar de mensajería.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 pb-10">
        <button
          onClick={() => isValid && navigate('/verificar', { state: { phone, countryCode: countryCode.code } })}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 mb-4 transition-opacity"
          style={{
            background: isValid ? 'linear-gradient(135deg, #00c28b, #06f9b4)' : '#1a3028',
            color: isValid ? '#0a1f18' : '#5a8a78',
            border: 'none',
          }}
        >
          Continuar
          <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
        </button>
        <p className="text-center text-xs leading-relaxed" style={{ color: '#5a8a78' }}>
          Al continuar, aceptas nuestros{' '}
          <span style={{ color: '#00c28b' }}>Términos de Servicio</span>
          {' '}y{' '}
          <span style={{ color: '#00c28b' }}>Política de Privacidad</span>
        </p>
      </footer>
    </div>
  )
}
