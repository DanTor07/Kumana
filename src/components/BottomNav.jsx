import { useNavigate } from 'react-router-dom'

const tabs = [
  { label: 'Inicio',  icon: 'home',               path: '/dashboard' },
  { label: 'Cambio',  icon: 'currency_exchange',   path: '/cambio'    },
  { label: 'Alerta',  icon: 'notifications',       path: '/alertas', badge: true },
  { label: 'Perfil',  icon: 'person',              path: '/perfil'    },
]

export default function BottomNav({ active = 'Inicio' }) {
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] flex items-center justify-around py-2 z-40"
      style={{ background: '#0d1f1a', borderTop: '1px solid #1e3d33' }}
    >
      {tabs.map(tab => {
        const isActive = tab.label === active
        return (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-0.5 px-4 py-1 relative border-0 bg-transparent"
          >
            <div className="relative">
              <span
                className="material-symbols-rounded text-2xl"
                style={{
                  color: isActive ? '#00c28b' : '#5a8a78',
                  fontVariationSettings: isActive
                    ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                    : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                }}
              >
                {tab.icon}
              </span>
              {tab.badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </div>
            <span className="text-[11px] font-medium" style={{ color: isActive ? '#00c28b' : '#5a8a78' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
