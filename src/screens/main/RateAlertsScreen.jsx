import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { useFinanceManager } from '../../hooks/useFinanceManager'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

const PAIRS = [
  ['USD', 'COP'], ['USD', 'EUR'], ['EUR', 'USD'],
  ['GBP', 'USD'], ['USD', 'MXN'], ['USD', 'BRL'], ['EUR', 'COP'],
]

const getStep = (rate) => {
  if (!rate) return 1
  if (rate >= 1000) return 50
  if (rate >= 100)  return 5
  if (rate >= 10)   return 0.5
  if (rate >= 1)    return 0.01
  if (rate >= 0.1)  return 0.001
  return 0.0001
}

const formatRate = (rate) => {
  if (!rate) return '—'
  if (rate >= 1000) return rate.toLocaleString('es-CO', { maximumFractionDigits: 0 })
  if (rate < 0.001) return rate.toFixed(6)
  if (rate < 0.1)   return rate.toFixed(4)
  return rate.toFixed(3)
}

export default function RateAlertsScreen() {
  const { CURRENCIES, getRate, ratesLoading } = useFinanceManager()

  const [selectedPair, setSelectedPair] = useState(PAIRS[0])
  const [targetRate, setTargetRate]     = useState(0)
  const [alerts, setAlerts]             = useState([])
  const [showPairList, setShowPairList] = useState(false)
  const [created, setCreated]           = useState(false)

  const [from, to] = selectedPair
  const currentRate = getRate(from, to) || 0
  const step = getStep(currentRate)

  useEffect(() => {
    if (currentRate > 0) setTargetRate(prev => +(currentRate + step * 3).toFixed(7))
  }, [selectedPair, currentRate])

  const handlePairSelect = (pair) => {
    setSelectedPair(pair)
    setShowPairList(false)
  }

  const handleCreateAlert = () => {
    if (!currentRate) return
    const newAlert = {
      id: Date.now(), from, to,
      target: targetRate, current: currentRate,
      type: targetRate > currentRate ? 'VENDER' : 'COMPRAR',
      active: true,
    }
    setAlerts(prev => [newAlert, ...prev])
    setCreated(true)
    setTimeout(() => setCreated(false), 2000)
  }

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alertas</Text>
          <Text style={[styles.headerSub, { color: ratesLoading ? COLORS.warning : COLORS.primary }]}>
            {ratesLoading ? 'Sincronizando...' : 'Sintonizado al mercado'}
          </Text>
        </View>
        <View style={styles.bellIcon}>
          <MaterialIcons name="notifications-active" size={22} color={COLORS.textMuted} />
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Nueva Alerta de Precio</Text>

          {/* Selector de par */}
          <TouchableOpacity
            style={styles.pairSelector}
            onPress={() => setShowPairList(prev => !prev)}
            activeOpacity={0.7}
          >
            <Text style={styles.pairFlag}>{CURRENCIES[from]?.flag} / {CURRENCIES[to]?.flag}</Text>
            <Text style={styles.pairCode}>{from} / {to}</Text>
            <Text style={styles.pairRate}>{formatRate(currentRate)}</Text>
            <MaterialIcons name="expand-more" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {showPairList && (
            <View style={styles.pairList}>
              {PAIRS.map(([f, t]) => (
                <TouchableOpacity
                  key={`${f}${t}`}
                  style={[styles.pairListItem, f === from && t === to && styles.pairListItemActive]}
                  onPress={() => handlePairSelect([f, t])}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pairListFlag}>{CURRENCIES[f]?.flag} {CURRENCIES[t]?.flag}</Text>
                  <Text style={styles.pairListCode}>{f} / {t}</Text>
                  <Text style={styles.pairListRate}>{formatRate(getRate(f, t))}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Control de tasa objetivo */}
          <View style={styles.targetControl}>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => setTargetRate(prev => +(prev - step).toFixed(7))}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.targetCenter}>
              <Text style={styles.targetValue}>{formatRate(targetRate)}</Text>
              <Text style={styles.targetLabel}>Tasa Objetivo</Text>
              <Text style={styles.currentRateHint}>
                Actual: <Text style={{ color: COLORS.textMuted, fontWeight: '700' }}>{formatRate(currentRate)}</Text>
                {'  ·  '}Paso: <Text style={{ color: COLORS.textMuted, fontWeight: '700' }}>{step}</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => setTargetRate(prev => +(prev + step).toFixed(7))}
              activeOpacity={0.7}
            >
              <Text style={styles.adjustBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btnCreate, { backgroundColor: created ? COLORS.success : COLORS.primary }, !currentRate && styles.btnDisabled]}
            onPress={handleCreateAlert}
            disabled={!currentRate || created}
            activeOpacity={0.8}
          >
            <MaterialIcons name={created ? 'check' : 'add-alert'} size={18} color={COLORS.primaryDark} />
            <Text style={styles.btnCreateText}>{created ? '¡Alerta Activada!' : 'Activar Notificación'}</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de alertas */}
        <Text style={styles.sectionLabel}>Monitoreo Activo</Text>

        {alerts.length === 0 && (
          <Text style={styles.emptyText}>Sin alertas activas aún.</Text>
        )}

        {alerts.map(a => (
          <View key={a.id} style={styles.alertItem}>
            <View style={styles.alertTop}>
              <View style={styles.alertTitleRow}>
                <Text style={styles.alertPair}>{a.from}/{a.to}</Text>
                <View style={[styles.typeBadge, { backgroundColor: a.type === 'COMPRAR' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                  <Text style={[styles.typeText, { color: a.type === 'COMPRAR' ? COLORS.success : COLORS.error }]}>{a.type}</Text>
                </View>
              </View>
              <Switch
                value={a.active}
                onValueChange={() => toggleAlert(a.id)}
                trackColor={{ false: COLORS.cardLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
            <View style={styles.alertBottom}>
              <View>
                <Text style={styles.alertBottomLabel}>Avisar en</Text>
                <Text style={styles.alertBottomValue}>{formatRate(a.target)}</Text>
              </View>
              <Text style={styles.alertCurrent}>
                Actual: {formatRate(getRate(a.from, a.to) || a.current)}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.md,
  },
  headerTitle: { color: COLORS.white, fontWeight: '900', fontSize: 22 },
  headerSub: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  bellIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1, paddingHorizontal: SPACING.lg },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: SPACING.md,
  },
  sectionLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: SPACING.sm },
  pairSelector: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.xl,
    padding: SPACING.md, marginBottom: SPACING.md,
  },
  pairFlag: { fontSize: 20 },
  pairCode: { flex: 1, color: COLORS.white, fontWeight: '700' },
  pairRate: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  pairList: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden', marginBottom: SPACING.md,
  },
  pairListItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pairListItemActive: { backgroundColor: `${COLORS.primary}0d` },
  pairListFlag: { fontSize: 18 },
  pairListCode: { flex: 1, color: COLORS.white, fontWeight: '600', fontSize: 13 },
  pairListRate: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  targetControl: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  adjustBtn: {
    width: 48, height: 48, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
  },
  adjustBtnText: { color: COLORS.primary, fontSize: 24, fontWeight: '900' },
  targetCenter: { alignItems: 'center', flex: 1 },
  targetValue: { color: COLORS.white, fontSize: 28, fontWeight: '900' },
  targetLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  currentRateHint: { color: COLORS.textDim, fontSize: 10, marginTop: 4 },
  btnCreate: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md, borderRadius: RADIUS.xl,
  },
  btnDisabled: { opacity: 0.5 },
  btnCreateText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 15 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', paddingVertical: SPACING.xxl, fontSize: 13 },
  alertItem: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: SPACING.sm,
  },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  alertPair: { color: COLORS.white, fontWeight: '900', fontSize: 15 },
  typeBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  alertBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  alertBottomLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  alertBottomValue: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  alertCurrent: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
})
