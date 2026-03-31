import React, { useState } from 'react'
import { CURRENCIES } from '../context/FinanceContext'
import { COLORS } from '../styles/theme'

export default function ChartPicker({ value, exclude, onChange, onClose }) {
  const [search, setSearch] = useState('')
  const list = Object.values(CURRENCIES).filter(
    c => c.code !== exclude && (
      c.code.includes(search.toUpperCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div
        className="w-full max-w-[430px] rounded-t-3xl pb-10"
        style={{ background: COLORS.card, boxShadow: '0 -20px 40px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 rounded-full mx-auto mt-3 mb-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <p className="text-center text-base font-bold text-white mb-4 px-5">Selecciona moneda</p>
        
        <div className="px-5 mb-4">
          <div className="flex items-center gap-2 px-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="material-symbols-rounded text-xl" style={{ color: COLORS.textMuted }}>search</span>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar moneda o país..."
              className="flex-1 bg-transparent py-4 text-white text-sm outline-none placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="overflow-y-auto px-4 max-h-[50vh]">
          {list.map(c => (
            <button
              key={c.code}
              onClick={() => { onChange(c.code); onClose() }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl mb-2 border-0 text-left transition-colors"
              style={{
                background: value === c.code ? 'rgba(0,194,139,0.1)' : 'transparent',
                border: value === c.code ? `1px solid ${COLORS.primary}44` : '1px solid transparent',
              }}
            >
              <span className="text-3xl">{c.flag}</span>
              <div className="flex-1">
                <p className="text-base font-bold text-white leading-tight">{c.code}</p>
                <p className="text-xs" style={{ color: COLORS.textMuted }}>{c.name}</p>
              </div>
              {value === c.code && (
                <span className="material-symbols-rounded text-xl" style={{ color: COLORS.primary, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              )}
            </button>
          ))}
          {list.length === 0 && (
            <p className="text-center py-10" style={{ color: COLORS.textDim }}>No se encontraron divisas</p>
          )}
        </div>
      </div>
    </div>
  )
}
