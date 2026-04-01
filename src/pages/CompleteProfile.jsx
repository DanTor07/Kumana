import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ID_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
]

export default function CompleteProfile() {
  const navigate = useNavigate()
  const { user, saveProfile, loading } = useAuth()

  const [name, setName] = useState(user.name || '')
  const [username, setUsername] = useState(user.username || '')
  const [email, setEmail] = useState(user.email || '')
  const [idType, setIdType] = useState(user.idType || 'CC')
  const [cedula, setCedula] = useState(user.cedula || '')
  const [showTooltip, setShowTooltip] = useState(false)
  const [focused, setFocused] = useState(null)

  const formatCedula = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    return `${d.slice(0, 3)}-${d.slice(3)}`
  }

  const isValidName = name.trim().length >= 3
  const isValidUsername = username.trim().length >= 3
  const isValidEmail = email.includes('@') && email.includes('.')
  const isValidCedula = cedula.replace(/\D/g, '').length >= 6
  const canSubmit = isValidName && isValidUsername && isValidEmail && isValidCedula

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    const ok = await saveProfile({
      name: name.trim(),
      username: username.trim().replace(/^@/, ''),
      email: email.trim(),
      idType,
      cedula,
    })
    if (ok) navigate('/dashboard')
  }

  const inputStyle = (key) => ({
    background: '#1a3028',
    border: `1px solid ${focused === key ? '#00c28b' : 'rgba(0,194,139,0.2)'}`,
    transition: 'border-color 0.2s',
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0B1210' }}>
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl flex items-center justify-center border-0" style={{ background: '#1a3028' }}>
          <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>arrow_back</span>
        </button>
        <span className="font-semibold text-white">Completa tu Perfil</span>
      </header>

      <main className="flex-1 px-6 pt-2 overflow-y-auto">
        <div className="flex items-center gap-2 mb-5">
          {[1,2,3].map(i => (
            <div key={i} className="h-1 flex-1 rounded-full" style={{ background: 'linear-gradient(90deg, #00c28b, #06f9b4)' }} />
          ))}
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#00c28b' }}>Paso 3 de 3</p>
          <h1 className="text-3xl font-extrabold text-white mb-1">Últimos pasos</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#7aa899' }}>
            Completa tu información para activar tu cuenta.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7aa899' }}>Nombre completo</label>
            <div className="flex items-center gap-3 px-4 rounded-2xl" style={inputStyle('name')}>
              <span className="material-symbols-rounded text-xl" style={{ color: focused === 'name' ? '#00c28b' : '#5a8a78' }}>person</span>
              <input type="text" value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="Tu nombre completo" className="flex-1 bg-transparent py-4 text-white text-base outline-none" />
              {isValidName && <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7aa899' }}>Nombre de usuario</label>
            <div className="flex items-center rounded-2xl overflow-hidden" style={inputStyle('username')}>
              <span className="pl-4 text-base font-bold" style={{ color: '#5a8a78' }}>@</span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())} onFocus={() => setFocused('username')} onBlur={() => setFocused(null)} placeholder="usuario123" className="flex-1 bg-transparent px-2 py-4 text-white text-base outline-none" />
              {isValidUsername && <span className="material-symbols-rounded text-lg pr-3" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7aa899' }}>Correo electrónico</label>
            <div className="flex items-center gap-3 px-4 rounded-2xl" style={inputStyle('email')}>
              <span className="material-symbols-rounded text-xl" style={{ color: focused === 'email' ? '#00c28b' : '#5a8a78' }}>mail</span>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="usuario@ejemplo.com" className="flex-1 bg-transparent py-4 text-white text-base outline-none" />
              {isValidEmail && <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
            </div>
          </div>

          {/* ID Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7aa899' }}>Tipo de identificación</label>
            <div className="flex gap-2 flex-wrap">
              {ID_TYPES.map(t => (
                <button key={t.value} onClick={() => setIdType(t.value)} className="px-3 py-2 rounded-xl text-xs font-bold border-0" style={{ background: idType === t.value ? '#00c28b' : '#1a3028', color: idType === t.value ? '#0a1f18' : '#7aa899' }}>
                  {t.value}
                </button>
              ))}
            </div>
            <p className="text-xs mt-1 px-1" style={{ color: '#5a8a78' }}>{ID_TYPES.find(t => t.value === idType)?.label}</p>
          </div>

          {/* Cedula */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#7aa899' }}>
                Número de {idType === 'PA' ? 'Pasaporte' : idType}
              </label>
              <button onClick={() => setShowTooltip(!showTooltip)} className="flex items-center gap-1 text-xs border-0 bg-transparent" style={{ color: '#00c28b' }}>
                <span className="material-symbols-rounded text-sm">help</span>¿Por qué?
              </button>
            </div>
            {showTooltip && (
              <div className="p-3 rounded-xl mb-2 text-xs leading-relaxed" style={{ background: 'rgba(0,194,139,0.08)', border: '1px solid rgba(0,194,139,0.2)', color: '#7aa899' }}>
                Requerido por la Superintendencia Financiera para verificar tu identidad y cumplir con regulaciones AML.
              </div>
            )}
            <div className="flex items-center gap-3 px-4 rounded-2xl" style={inputStyle('cedula')}>
              <span className="material-symbols-rounded text-xl" style={{ color: focused === 'cedula' ? '#00c28b' : '#5a8a78' }}>badge</span>
              <input type="text" value={cedula} onChange={e => setCedula(formatCedula(e.target.value))} onFocus={() => setFocused('cedula')} onBlur={() => setFocused(null)} placeholder="000-0000000" className="flex-1 bg-transparent py-4 text-white text-base outline-none" />
              {isValidCedula && <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5 px-1">
              <span className="material-symbols-rounded text-sm" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <p className="text-xs" style={{ color: '#7aa899' }}>Validaremos tu identidad al instante</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 pb-10 pt-3">
        <button
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 mb-4 border-0 transition-opacity"
          style={{ 
            background: canSubmit && !loading ? 'linear-gradient(135deg, #00c28b, #06f9b4)' : '#1a3028', 
            color: canSubmit && !loading ? '#0a1f18' : '#5a8a78',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Guardando...' : 'Finalizar registro'}
          <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
        </button>
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-rounded text-sm" style={{ color: '#5a8a78', fontVariationSettings: "'FILL' 1" }}>lock</span>
          <p className="text-xs text-center" style={{ color: '#5a8a78' }}>
            Cifrado de extremo a extremo · <span style={{ color: '#00c28b' }}>Términos y Condiciones</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
