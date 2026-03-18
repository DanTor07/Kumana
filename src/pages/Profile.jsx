import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useFinance, CURRENCIES } from '../context/FinanceContext'

const ID_TYPES = { CC: 'Cédula de Ciudadanía', CE: 'Cédula de Extranjería', PA: 'Pasaporte', NIT: 'NIT' }

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateUser, baseCurrency, setBaseCurrency } = useFinance()

  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [tempEmail, setTempEmail] = useState(user.email)
  const [tempPhone, setTempPhone] = useState(user.phone)
  const [showLogout, setShowLogout] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const handleLogout = () => {
    setShowLogout(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" style={{ background: '#10221d' }}>

      {/* Logout confirmation — full-screen backdrop */}
      {showLogout && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setShowLogout(false)}
        >
          <div
            className="w-full p-6 rounded-t-3xl"
            style={{ background: '#1a3028' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#2a4a3a' }} />
            <h3 className="text-lg font-extrabold text-white text-center mb-2">¿Cerrar sesión?</h3>
            <p className="text-sm text-center mb-6" style={{ color: '#7aa899' }}>
              Tendrás que iniciar sesión de nuevo para acceder.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm border-0"
                style={{ background: '#243f35', color: '#7aa899' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-2xl font-bold text-sm border-0"
                style={{ background: '#ef4444', color: 'white' }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Base currency picker */}
      {showCurrencyPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setShowCurrencyPicker(false)}
        >
          <div
            className="w-full rounded-t-3xl"
            style={{ background: '#1a3028', maxHeight: '70vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-4" style={{ background: '#2a4a3a' }} />
            <p className="text-center text-sm font-bold text-white mb-3 px-5">Moneda base del portafolio</p>
            <div className="px-4 pb-6">
              {Object.values(CURRENCIES).map(c => (
                <button
                  key={c.code}
                  onClick={() => { setBaseCurrency(c.code); setShowCurrencyPicker(false) }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 border-0 text-left"
                  style={{
                    background: baseCurrency === c.code ? 'rgba(0,194,139,0.12)' : 'transparent',
                    border: baseCurrency === c.code ? '1px solid rgba(0,194,139,0.3)' : '1px solid transparent',
                  }}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="flex-1 text-sm font-bold text-white">{c.code} — {c.name}</span>
                  {baseCurrency === c.code && (
                    <span className="material-symbols-rounded" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-xl flex items-center justify-center border-0"
          style={{ background: '#1a3028' }}
        >
          <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>arrow_back</span>
        </button>
        <h1 className="text-xl font-extrabold text-white">Perfil</h1>
      </header>

      <main className="flex-1 px-5 overflow-y-auto">
        {/* Avatar + name */}
        <div
          className="rounded-3xl p-6 mb-5 flex flex-col items-center text-center"
          style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="relative mb-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold"
                style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)', color: '#0a1f18' }}
              >
                {initials}
              </div>
            )}
            <label
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: '#00c28b', border: '2px solid #172d25' }}
            >
              <span className="material-symbols-rounded text-sm" style={{ color: '#0a1f18', fontVariationSettings: "'FILL' 1" }}>edit</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = ev => updateUser({ avatar: ev.target.result })
                  reader.readAsDataURL(file)
                }}
              />
            </label>
          </div>

          <h2 className="text-xl font-extrabold text-white mb-1">{user.name || 'Sin nombre'}</h2>
          {user.username && (
            <p className="text-sm mb-2" style={{ color: '#7aa899' }}>@{user.username}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(0,194,139,0.15)', color: '#00c28b' }}>
              <span className="material-symbols-rounded text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Verificado
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(255,193,7,0.15)', color: '#ffc107' }}>
              <span className="material-symbols-rounded text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
              Miembro Pro
            </div>
          </div>
          {user.memberSince && (
            <p className="text-xs mt-2" style={{ color: '#5a8a78' }}>Miembro desde {user.memberSince}</p>
          )}
        </div>

        {/* Personal info */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#7aa899' }}>Información Personal</h3>

          {/* Email */}
          <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {editingEmail ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs" style={{ color: '#7aa899' }}>Correo electrónico</label>
                <div className="flex items-center gap-2 px-3 rounded-xl" style={{ background: '#1a3028', border: '1px solid #00c28b' }}>
                  <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>mail</span>
                  <input value={tempEmail} onChange={e => setTempEmail(e.target.value)} autoFocus className="flex-1 bg-transparent py-3 text-white text-sm outline-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingEmail(false); setTempEmail(user.email) }} className="flex-1 py-2 rounded-xl text-sm border-0" style={{ background: '#1a3028', color: '#7aa899' }}>Cancelar</button>
                  <button onClick={() => { updateUser({ email: tempEmail }); setEditingEmail(false) }} className="flex-1 py-2 rounded-xl text-sm font-bold border-0" style={{ background: '#00c28b', color: '#0a1f18' }}>Guardar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,194,139,0.08)' }}>
                  <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>mail</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: '#7aa899' }}>Correo</p>
                  <p className="text-sm font-medium text-white truncate">{user.email || '—'}</p>
                </div>
                <button onClick={() => setEditingEmail(true)} className="w-8 h-8 rounded-lg flex items-center justify-center border-0" style={{ background: '#1a3028' }}>
                  <span className="material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>edit</span>
                </button>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {editingPhone ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs" style={{ color: '#7aa899' }}>Teléfono</label>
                <div className="flex items-center gap-2 px-3 rounded-xl" style={{ background: '#1a3028', border: '1px solid #00c28b' }}>
                  <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>phone</span>
                  <input value={tempPhone} onChange={e => setTempPhone(e.target.value)} autoFocus className="flex-1 bg-transparent py-3 text-white text-sm outline-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingPhone(false); setTempPhone(user.phone) }} className="flex-1 py-2 rounded-xl text-sm border-0" style={{ background: '#1a3028', color: '#7aa899' }}>Cancelar</button>
                  <button onClick={() => { updateUser({ phone: tempPhone }); setEditingPhone(false) }} className="flex-1 py-2 rounded-xl text-sm font-bold border-0" style={{ background: '#00c28b', color: '#0a1f18' }}>Guardar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,194,139,0.08)' }}>
                  <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>phone</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs mb-0.5" style={{ color: '#7aa899' }}>Teléfono</p>
                  <p className="text-sm font-medium text-white">{user.phone || '—'}</p>
                </div>
                <button onClick={() => setEditingPhone(true)} className="w-8 h-8 rounded-lg flex items-center justify-center border-0" style={{ background: '#1a3028' }}>
                  <span className="material-symbols-rounded text-sm" style={{ color: '#7aa899' }}>edit</span>
                </button>
              </div>
            )}
          </div>

          {/* ID */}
          <div className="py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,194,139,0.08)' }}>
                <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>badge</span>
              </div>
              <div className="flex-1">
                <p className="text-xs mb-0.5" style={{ color: '#7aa899' }}>{ID_TYPES[user.idType] || 'Identificación'}</p>
                <p className="text-sm font-medium text-white">{user.cedula || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: '#172d25', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#7aa899' }}>Configuración</h3>

          {/* Base currency */}
          <button
            onClick={() => setShowCurrencyPicker(true)}
            className="w-full flex items-center gap-3 py-3 border-0 bg-transparent text-left"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,194,139,0.08)' }}>
              <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>account_balance_wallet</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Moneda base del portafolio</p>
              <p className="text-xs" style={{ color: '#7aa899' }}>
                {CURRENCIES[baseCurrency]?.flag} {baseCurrency} — {CURRENCIES[baseCurrency]?.name}
              </p>
            </div>
            <span className="material-symbols-rounded text-lg" style={{ color: '#5a8a78' }}>chevron_right</span>
          </button>

          {[
            { icon: 'help', label: 'Ayuda y Soporte' },
            { icon: 'security', label: 'Seguridad' },
          ].map((item, i) => (
            <button key={item.label} className="w-full flex items-center gap-3 py-3 border-0 bg-transparent text-left" style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,194,139,0.08)' }}>
                <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>{item.icon}</span>
              </div>
              <span className="flex-1 text-sm font-medium text-white">{item.label}</span>
              <span className="material-symbols-rounded text-lg" style={{ color: '#5a8a78' }}>chevron_right</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogout(true)}
          className="w-full py-4 rounded-3xl font-bold text-base flex items-center justify-center gap-2 mb-5 border-0"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
          Cerrar sesión
        </button>
      </main>

      <BottomNav active="Perfil" />
    </div>
  )
}
