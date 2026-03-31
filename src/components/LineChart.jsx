import React from 'react'
import { COLORS } from '../styles/theme'

export default function LineChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <div
        className="w-full rounded-xl animate-pulse"
        style={{ height: 70, background: 'rgba(255,255,255,0.04)' }}
      />
    )
  }
  if (!data || data.length < 2) return null

  const W = 300, H = 90
  const values = data.map(d => d.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const span = maxV - minV || minV * 0.01

  const px = i => (i / (data.length - 1)) * W
  const py = v => H - 10 - ((v - minV) / span) * (H - 20)

  const pts  = data.map((d, i) => `${px(i)},${py(d.value)}`).join(' ')
  const area = `0,${H} ${pts} ${W},${H}`

  const isUp  = data[data.length - 1].value >= data[0].value
  const color = isUp ? COLORS.primary : COLORS.error
  const endX  = px(data.length - 1)
  const endY  = py(data[data.length - 1].value)

  return (
    <svg width="100%" height="75" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#chartGrad)" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={endX} cy={endY} r="4"  fill={color} />
      <circle cx={endX} cy={endY} r="10" fill={color} fillOpacity="0.15" />
    </svg>
  )
}
