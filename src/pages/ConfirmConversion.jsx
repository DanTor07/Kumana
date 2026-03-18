import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useFinance, CURRENCIES, formatAmount } from '../context/FinanceContext'

export default function ConfirmConversion() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getRate, invest, wallet } = useFinance()

  const fromCur = location.state?.fromCur || 'USD'
  const toCur   = location.state?.toCur   || 'EUR'
  const amount  = parseFloat(location.state?.amount) || 0

  const [timer, setTimer]       = useState(60)
  const [confirmed, setConfirmed] = useState(false)
  const [didInvest, setDidInvest] = useState(false)

  const rate      = getRate(fromCur, toCur)
  const toAmount  = rate && amount > 0 ? amount * rate : 0
  const fromInfo  = CURRENCIES[fromCur]
  const toInfo    = CURRENCIES[toCur]
  const available = wallet[fromCur] || 0
  const hasFunds  = amount > 0 && amount <= available && rate

  useEffect(() => {
    if (timer <= 0 || confirmed) return
    const t = setTimeout(() => setTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timer, confirmed])

  const handleConfirm = () => {
    if (hasFunds) {
      invest(fromCur, toCur, amount, toAmount, rate)
      setDidInvest(true)
    }
    setConfirmed(true)
    setTimeout(() => navigate('/cambio'), 2500)
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#10221d' }}>
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'rgba(0,194,139,0.15)', border: '2px solid #00c28b' }}
        >
          <span className="material-symbols-rounded text-5xl" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2 text-center">
          {didInvest ? '¡Conversión exitosa!' : '¡Simulación completada!'}
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: '#7aa899' }}>
          {didInvest
            ? 'Tu portafolio ha sido actualizado.'
            : 'Deposita fondos para realizar la conversión real.'}
        </p>
        <div className="w-full rounded-3xl p-5" style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}>
          <div className="flex justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-sm" style={{ color: '#7aa899' }}>Enviaste</span>
            <span className="text-sm font-bold text-white">
              {fromInfo?.flag} {fromInfo?.symbol}{formatAmount(amount, fromCur)} {fromCur}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-sm" style={{ color: '#7aa899' }}>Recibiste</span>
            <span className="text-sm font-bold" style={{ color: '#00c28b' }}>
              {toInfo?.flag} {toInfo?.symbol}{formatAmount(toAmount, toCur)} {toCur}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm" style={{ color: '#7aa899' }}>Comisión</span>
            <span className="text-sm font-bold" style={{ color: '#00c28b' }}>GRATIS</span>
          </div>
        </div>
        <p className="text-xs mt-4" style={{ color: '#5a8a78' }}>Redirigiendo a inversiones...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#10221d' }}>
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center border-0"
          style={{ background: '#1a3028' }}
        >
          <span className="material-symbols-rounded" style={{ color: '#7aa899' }}>arrow_back</span>
        </button>
        <span className="font-semibold text-white">Revisar Conversión</span>
      </header>

      <main className="flex-1 px-6 py-4 flex flex-col">
        {/* Central icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,194,139,0.12)',
              border: '1px solid rgba(0,194,139,0.3)',
              boxShadow: '0 0 40px rgba(0,194,139,0.2)',
            }}
          >
            <span className="material-symbols-rounded text-4xl" style={{ color: '#00c28b', fontVariationSettings: "'FILL' 1" }}>
              currency_exchange
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-white text-center mb-1">Confirmar Transacción</h1>
        {!hasFunds && amount > 0 && (
          <p className="text-xs text-center mb-4" style={{ color: '#f59e0b' }}>
            Fondos insuficientes — solo simulación
          </p>
        )}
        {!hasFunds && amount === 0 && (
          <p className="text-xs text-center mb-4" style={{ color: '#5a8a78' }}>
            Ingresa un monto para simular
          </p>
        )}
        {hasFunds && <div className="mb-6" />}

        {/* Transaction details card */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: '#1a3028', border: '1px solid rgba(0,194,139,0.2)' }}>
          {/* Sending */}
          <div className="flex items-center gap-4 py-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#172d25' }}>
              {fromInfo?.flag}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#7aa899' }}>
                Tú Envías
              </p>
              <p className="text-xl font-extrabold text-white">
                {fromInfo?.symbol}{formatAmount(amount, fromCur)} {fromCur}
              </p>
              {hasFunds && (
                <p className="text-xs mt-0.5" style={{ color: '#5a8a78' }}>
                  Disponible: {fromInfo?.symbol}{formatAmount(available, fromCur)}
                </p>
              )}
            </div>
          </div>

          {/* Exchange rate divider */}
          <div className="flex items-center gap-3 py-2 px-4 my-2 rounded-2xl" style={{ background: 'rgba(0,194,139,0.06)' }}>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,194,139,0.2)' }} />
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-lg" style={{ color: '#00c28b' }}>swap_vert</span>
              <span className="text-sm font-semibold" style={{ color: '#00c28b' }}>
                {rate ? `1 ${fromCur} = ${formatAmount(rate, toCur)} ${toCur}` : 'Cargando tasa...'}
              </span>
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,194,139,0.2)' }} />
          </div>

          {/* Receiving */}
          <div className="flex items-center gap-4 py-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: '#172d25' }}>
              {toInfo?.flag}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#7aa899' }}>
                Tú Recibes
              </p>
              <p className="text-2xl font-extrabold" style={{ color: '#00c28b' }}>
                {toAmount > 0 ? `${toInfo?.symbol}${formatAmount(toAmount, toCur)} ${toCur}` : '—'}
              </p>
            </div>
          </div>

          <div className="h-px my-2" style={{ background: 'rgba(255,255,255,0.06)' }} />

          <div className="flex justify-between py-2.5">
            <span className="text-sm" style={{ color: '#7aa899' }}>Comisión</span>
            <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,194,139,0.12)', color: '#00c28b' }}>
              GRATIS
            </span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-sm" style={{ color: '#7aa899' }}>Tiempo de entrega</span>
            <span className="text-sm font-bold text-white">Al instante</span>
          </div>
        </div>

        {/* Rate lock timer */}
        <div
          className="flex items-center gap-3 p-4 rounded-2xl mb-4"
          style={{
            background: timer > 20 ? 'rgba(0,194,139,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${timer > 20 ? 'rgba(0,194,139,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}
        >
          <span
            className="material-symbols-rounded text-2xl"
            style={{ color: timer > 20 ? '#00c28b' : '#ef4444', fontVariationSettings: "'FILL' 1" }}
          >
            timer
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: timer > 20 ? '#00c28b' : '#ef4444' }}>
              Tasa garantizada por
            </p>
            <p className="text-xs" style={{ color: '#7aa899' }}>La tasa se actualizará al expirar</p>
          </div>
          <span className="text-2xl font-extrabold tabular-nums" style={{ color: timer > 20 ? '#00c28b' : '#ef4444' }}>
            {timer}s
          </span>
        </div>

        {!hasFunds && (
          <div className="p-4 rounded-2xl mb-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#f59e0b' }}>¿Quieres realizar esta conversión?</p>
            <p className="text-xs" style={{ color: '#7aa899' }}>
              Ve a Inversiones y deposita {fromInfo?.symbol}{formatAmount(amount, fromCur)} {fromCur} para ejecutarla.
            </p>
          </div>
        )}

        <div className="flex-1" />
      </main>

      {/* Footer */}
      <footer className="px-6 pb-10 flex flex-col gap-3">
        <button
          onClick={handleConfirm}
          disabled={timer === 0 || !rate}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border-0 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #00c28b, #06f9b4)', color: '#0a1f18' }}
        >
          <span className="material-symbols-rounded" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {hasFunds ? 'Confirmar conversión' : 'Confirmar simulación'}
        </button>
        {!hasFunds && (
          <button
            onClick={() => navigate('/cambio')}
            className="w-full py-3 rounded-2xl font-medium text-sm border-0 flex items-center justify-center gap-2"
            style={{ background: 'rgba(0,194,139,0.12)', color: '#00c28b' }}
          >
            <span className="material-symbols-rounded text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            Ir a Depositar
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 rounded-2xl font-medium text-sm border-0"
          style={{ background: '#1a3028', color: '#7aa899' }}
        >
          Cancelar
        </button>
      </footer>
    </div>
  )
}
