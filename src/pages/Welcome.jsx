import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0a1f18 0%, #0f231d 60%, #071a13 100%)' }}
    >
      {/* Header */}
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)' }}
          >
            <span className="material-symbols-rounded text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              currency_exchange
            </span>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">Kumana Fintech</span>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col px-6 pt-8">
        {/* Decorative card visual */}
        <div className="relative flex justify-center mb-10">
          {/* Background glow */}
          <div
            className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
            style={{ background: '#00c28b', top: '10%', bottom: '10%' }}
          />
          {/* Main card */}
          <div
            className="relative w-72 h-44 rounded-3xl p-5 flex flex-col justify-between"
            style={{
              background: 'linear-gradient(135deg, #1a3d30 0%, #0d2a20 100%)',
              border: '1px solid rgba(0,194,139,0.25)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs" style={{ color: '#7aa899' }}>Balance total</p>
                <p className="text-2xl font-bold text-white mt-0.5">$2,000,000</p>
                <p className="text-xs" style={{ color: '#7aa899' }}>COP</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(0,194,139,0.15)' }}
              >
                <span className="material-symbols-rounded" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
                ))}
                <span className="text-xs ml-1 text-white font-medium tracking-widest">8842</span>
              </div>
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(0,194,139,0.2)', color: '#06f9b4' }}
              >
                <span className="material-symbols-rounded text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                +2.4%
              </div>
            </div>
          </div>

          {/* Floating exchange badge */}
          <div
            className="absolute -right-2 top-4 px-3 py-2 rounded-2xl text-xs font-medium"
            style={{ background: '#172d25', border: '1px solid rgba(0,194,139,0.2)', color: '#00c28b' }}
          >
            1 USD ≈ 4,120 COP
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Tu dinero,<br />
            <span style={{ color: '#00c28b' }}>más inteligente.</span>
          </h1>
          <p className="text-sm leading-relaxed mx-2" style={{ color: '#7aa899' }}>
            Gestiona tus finanzas con precisión y simplicidad. La nueva era de la banca digital empieza aquí.
          </p>
        </div>

        {/* Features row */}
        <div className="flex gap-3 mb-10">
          {[
            { icon: 'shield', label: 'Seguro' },
            { icon: 'bolt', label: 'Instantáneo' },
            { icon: 'savings', label: 'Sin comisiones' },
          ].map(f => (
            <div
              key={f.label}
              className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl"
              style={{ background: '#172d25' }}
            >
              <span
                className="material-symbols-rounded text-xl"
                style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}
              >
                {f.icon}
              </span>
              <span className="text-xs font-medium text-white">{f.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="px-6 pb-10 flex flex-col gap-3">
        <button
          onClick={() => navigate('/crear-cuenta')}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)', color: '#0a1f18' }}
        >
          Empezar ahora
          <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_forward</span>
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 rounded-2xl font-medium text-sm border-0 bg-transparent"
          style={{ color: '#7aa899' }}
        >
          ¿Ya tienes cuenta?{' '}
          <span style={{ color: '#00c28b', fontWeight: 600 }}>Inicia sesión</span>
        </button>
      </footer>
    </div>
  )
}
