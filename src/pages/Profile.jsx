import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../hooks/useAuth'
import { useFinanceManager } from '../hooks/useFinanceManager'
import ChartPicker from '../components/ChartPicker'
import { COLORS, commonStyles } from '../styles/theme'

const ID_TYPES = { CC: 'Cédula de Ciudadanía', CE: 'Cédula de Extranjería', PA: 'Pasaporte', NIT: 'NIT' }

export default function Profile() {
  const navigate = useNavigate()
  const { user, saveProfile } = useAuth()
  const { baseCurrency, setBaseCurrency, CURRENCIES } = useFinanceManager()

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
    <div className="min-h-screen flex flex-col pb-24" style={{ background: COLORS.bg }}>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80" onClick={() => setShowLogout(false)}>
          <div className="w-full max-w-[430px] p-8 rounded-t-[32px]" style={{ background: COLORS.card }} onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 rounded-full mx-auto mb-6 bg-white/10" />
            <h3 className="text-xl font-black text-white text-center mb-2">¿Cerrar sesión?</h3>
            <p className="text-sm text-center mb-8 text-zinc-500">Tendrás que volver a autenticarte para ver tu balance.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-4 rounded-xl font-bold border-0 bg-white/5 text-zinc-400">Cancelar</button>
              <button onClick={handleLogout} className="flex-1 py-4 rounded-xl font-black border-0 bg-red-500 text-white">Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}

      {/* Currency Picker */}
      {showCurrencyPicker && (
        <ChartPicker value={baseCurrency} onChange={setBaseCurrency} onClose={() => setShowCurrencyPicker(false)} />
      )}

      <header style={commonStyles.header}>
        <button onClick={() => navigate('/dashboard')} className="w-10 h-10 rounded-xl flex items-center justify-center border-0 bg-white/5">
          <span className="material-symbols-rounded text-zinc-400">arrow_back</span>
        </button>
        <h1 className="text-lg font-black text-white">Mi Perfil</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-5 overflow-y-auto">
        {/* Profile Card */}
        <div style={commonStyles.card} className="mb-6 flex flex-col items-center">
          <div className="relative mb-4">
            {user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500/20" />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black" style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`, color: COLORS.primaryDark }}>
                {initials}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer bg-emerald-500 border-2 border-[#172d25]">
               <span className="material-symbols-rounded text-sm text-black font-black">edit</span>
               <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = ev => saveProfile({ avatar: ev.target.result })
                    reader.readAsDataURL(file)
                  }
               }}/>
            </label>
          </div>
          <h2 className="text-xl font-black text-white">{user.name || 'Usuario Kumana'}</h2>
          <p className="text-sm font-bold text-zinc-500 mb-4">@{user.username || 'sin_usuario'}</p>
          <div className="flex gap-2">
             <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-500 uppercase border border-emerald-500/20">Verificado</span>
             <span className="px-3 py-1 rounded-full bg-amber-500/10 text-[10px] font-black text-amber-500 uppercase border border-amber-500/20">Nivel Pro</span>
          </div>
        </div>

        {/* Info Section */}
        <div style={commonStyles.card} className="mb-6">
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Información de Cuenta</p>
           
           <div className="flex items-center gap-4 py-3 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <span className="material-symbols-rounded text-zinc-400">mail</span>
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-zinc-600 uppercase">Email</p>
                 <p className="text-sm font-bold text-white">{user.email || 'No asignado'}</p>
              </div>
           </div>

           <div className="flex items-center gap-4 py-3 border-b border-white/5">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <span className="material-symbols-rounded text-zinc-400">phone</span>
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-zinc-600 uppercase">Teléfono</p>
                 <p className="text-sm font-bold text-white">{user.phone || 'No asignado'}</p>
              </div>
           </div>

           <div className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                 <span className="material-symbols-rounded text-zinc-400">badge</span>
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-zinc-600 uppercase">{user.idType || 'ID'}</p>
                 <p className="text-sm font-bold text-white">{user.cedula || 'No verificada'}</p>
              </div>
           </div>
        </div>

        {/* Preferences */}
        <div style={commonStyles.card} className="mb-6">
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Preferencias</p>
           
           <button onClick={() => setShowCurrencyPicker(true)} className="w-full flex items-center gap-4 py-3 border-0 bg-transparent text-left group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-active:scale-90 transition-transform">
                 <span className="material-symbols-rounded text-emerald-500">payments</span>
              </div>
              <div className="flex-1">
                 <p className="text-sm font-bold text-white text-zinc-300">Moneda Base</p>
                 <p className="text-xs font-bold text-zinc-500">{CURRENCIES[baseCurrency]?.flag} {baseCurrency} — {CURRENCIES[baseCurrency]?.name}</p>
              </div>
              <span className="material-symbols-rounded text-zinc-700">chevron_right</span>
           </button>
        </div>

        {/* Logout CTA */}
        <button onClick={() => setShowLogout(true)} className="w-full py-5 rounded-2xl font-black text-red-500 bg-red-500/10 border border-red-500/20 mb-8 active:scale-95 transition-all">
           Cerrar Sesión Activa
        </button>
      </main>

      <BottomNav active="Perfil" />
    </div>
  )
}
