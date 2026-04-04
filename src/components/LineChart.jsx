import { View, ActivityIndicator, StyleSheet } from 'react-native'
import Svg, { Defs, LinearGradient, Stop, Polygon, Polyline, Circle } from 'react-native-svg'
import { COLORS } from '../styles/theme'

export default function LineChart({ data, isLoading }) {
  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.primary} size="small" />
      </View>
    )
  }
  if (!data || data.length < 2) {
    return <View style={styles.empty} />
  }

  const W = 300
  const H = 90
  const values = data.map(d => d.value)
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const span = (maxV - minV) || (minV ? minV * 0.01 : 1)
  const px = i => (i / (data.length - 1)) * W
  const py = v => H - 10 - ((v - minV) / span) * (H - 20)

  const points = data.map((d, i) => `${px(i)},${py(d.value)}`).join(' ')
  const areaPoints = `0,${H} ${points} ${W},${H}`
  const isUp = data[data.length - 1].value >= data[0].value
  const color = isUp ? COLORS.primary : COLORS.error
  const endX = px(data.length - 1)
  const endY = py(data[data.length - 1].value)

  return (
    <Svg width="100%" height={75} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Polygon points={areaPoints} fill="url(#chartGrad)" />
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={endX} cy={endY} r={10} fill={color} fillOpacity={0.15} />
      <Circle cx={endX} cy={endY} r={4} fill={color} />
    </Svg>
  )
}

const styles = StyleSheet.create({
  loader: {
    height: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    height: 75,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
  },
})
