import { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFinanceManager } from '../../hooks/useFinanceManager'
import { formatAmount, CURRENCIES } from '../../constants/currencies'
import LineChart from '../../components/LineChart'
import ChartPicker from '../../components/ChartPicker'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

const TIME_RANGES = ['1D', '1S', '1M', '1A']

export default function DashboardScreen({ navigation }) {
  const {
    user, baseCurrency, ratesLoading, getRate, getTotalInBase,
    chartData, chartLoading, fetchChartData, CURRENCIES: CURR,
  } = useFinanceManager()

  const [simAmount, setSimAmount] = useState('')
  const [simFrom, setSimFrom]     = useState('COP')
  const [simTo, setSimTo]         = useState('USD')
  const [timeRange, setTimeRange] = useState('1M')
  const [chartFrom, setChartFrom] = useState('USD')
  const [chartTo, setChartTo]     = useState('COP')
  const [showPicker, setShowPicker] = useState(null) // 'from' | 'to' | 'simFrom' | 'simTo'

  const totalBalance  = getTotalInBase()
  const curInfo       = CURR[baseCurrency]
  const chartRate     = getRate(chartFrom, chartTo)
  const simAmountNum  = parseFloat(simAmount) || 0
  const simRate       = getRate(simFrom, simTo)
  const simResult     = simRate && simAmountNum > 0 ? simAmountNum * simRate : null

  const chartChange = chartData && chartData.length >= 2
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100)
    : null
  const chartIsUp = chartChange !== null && chartChange >= 0

  const initials  = user.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  const firstName = user.name ? user.name.split(' ')[0] : 'Usuario'

  useEffect(() => {
    fetchChartData(chartFrom, chartTo, timeRange)
  }, [timeRange, chartFrom, chartTo, fetchChartData])

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Pickers */}
      {showPicker === 'from' && <ChartPicker value={chartFrom} exclude={chartTo} onChange={setChartFrom} onClose={() => setShowPicker(null)} />}
      {showPicker === 'to'   && <ChartPicker value={chartTo} exclude={chartFrom} onChange={setChartTo}  onClose={() => setShowPicker(null)} />}
      {showPicker === 'simFrom' && <ChartPicker value={simFrom} exclude={simTo} onChange={setSimFrom} onClose={() => setShowPicker(null)} />}
      {showPicker === 'simTo'   && <ChartPicker value={simTo} exclude={simFrom} onChange={setSimTo}   onClose={() => setShowPicker(null)} />}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.welcomeLabel}>Bienvenido</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Alerts')} activeOpacity={0.7}>
          <MaterialIcons name="notifications" size={22} color={COLORS.textMuted} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Balance Card */}
        <LinearGradient colors={['#1a3d30', '#0d2a20']} style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Balance total ({baseCurrency})</Text>
              <Text style={styles.balanceAmount}>
                {curInfo?.symbol}{formatAmount(totalBalance, baseCurrency)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.depositBtn}
              onPress={() => navigation.navigate('Exchange')}
              activeOpacity={0.8}
            >
              <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.depositBtnGrad}>
                <MaterialIcons name="add" size={16} color={COLORS.primaryDark} />
                <Text style={styles.depositBtnText}>Depositar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {totalBalance === 0 && (
            <Text style={styles.balanceHint}>Empieza depositando fondos para invertir.</Text>
          )}
        </LinearGradient>

        {/* Market Trend Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tendencia del Mercado</Text>
            <View style={[styles.liveBadge, ratesLoading && styles.liveBadgeLoading]}>
              <View style={[styles.liveDot, ratesLoading ? styles.liveDotYellow : styles.liveDotGreen]} />
              <Text style={[styles.liveText, { color: ratesLoading ? COLORS.warning : COLORS.primary }]}>
                {ratesLoading ? 'Sync' : 'En vivo'}
              </Text>
            </View>
          </View>

          {/* Par selector */}
          <View style={styles.pairRow}>
            <TouchableOpacity style={styles.pairBtn} onPress={() => setShowPicker('from')} activeOpacity={0.7}>
              <Text style={styles.pairFlag}>{CURR[chartFrom]?.flag}</Text>
              <Text style={styles.pairCode}>{chartFrom}</Text>
              <MaterialIcons name="expand-more" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.swapBtn}
              onPress={() => { const f = chartFrom; setChartFrom(chartTo); setChartTo(f) }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="swap-horiz" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pairBtn} onPress={() => setShowPicker('to')} activeOpacity={0.7}>
              <Text style={styles.pairFlag}>{CURR[chartTo]?.flag}</Text>
              <Text style={styles.pairCode}>{chartTo}</Text>
              <MaterialIcons name="expand-more" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.rateRow}>
            <View>
              <Text style={styles.rateLabel}>1 {chartFrom} hoy</Text>
              <View style={styles.rateValueRow}>
                <Text style={styles.rateValue}>{chartRate ? formatAmount(chartRate, chartTo) : '—'}</Text>
                <Text style={styles.rateCurrency}>{chartTo}</Text>
              </View>
            </View>
            {chartChange !== null && (
              <View style={[styles.changeBadge, { backgroundColor: chartIsUp ? `${COLORS.primary}1a` : `${COLORS.error}1a` }]}>
                <MaterialIcons
                  name={chartIsUp ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={chartIsUp ? COLORS.primary : COLORS.error}
                />
                <Text style={[styles.changeText, { color: chartIsUp ? COLORS.primary : COLORS.error }]}>
                  {chartIsUp ? '+' : ''}{chartChange.toFixed(2)}%
                </Text>
              </View>
            )}
          </View>

          <LineChart data={chartData} isLoading={chartLoading} />

          {/* Rango de tiempo */}
          <View style={styles.rangeRow}>
            {TIME_RANGES.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.rangeBtn, timeRange === r && styles.rangeBtnActive]}
                onPress={() => setTimeRange(r)}
                activeOpacity={0.7}
              >
                <Text style={[styles.rangeText, timeRange === r && styles.rangeTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Simulador */}
        <View style={[styles.card, { marginBottom: SPACING.xxl }]}>
          <View style={styles.simHeader}>
            <MaterialIcons name="calculate" size={22} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Simulador de Conversión</Text>
          </View>

          <View style={styles.pairRow}>
            <TouchableOpacity style={styles.pairBtn} onPress={() => setShowPicker('simFrom')} activeOpacity={0.7}>
              <Text style={styles.pairFlag}>{CURR[simFrom]?.flag}</Text>
              <Text style={styles.pairCode}>{simFrom}</Text>
              <MaterialIcons name="expand-more" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.swapBtn}
              onPress={() => { const f = simFrom; setSimFrom(simTo); setSimTo(f) }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="swap-horiz" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.pairBtn} onPress={() => setShowPicker('simTo')} activeOpacity={0.7}>
              <Text style={styles.pairFlag}>{CURR[simTo]?.flag}</Text>
              <Text style={styles.pairCode}>{simTo}</Text>
              <MaterialIcons name="expand-more" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.simInputRow}>
            <Text style={styles.simSymbol}>{CURR[simFrom]?.symbol}</Text>
            <TextInput
              style={styles.simInput}
              value={simAmount}
              onChangeText={setSimAmount}
              placeholder="0.00"
              placeholderTextColor={'rgba(255,255,255,0.4)'}
              keyboardType="numeric"
            />
          </View>

          {simResult !== null && (
            <View style={styles.simResult}>
              <Text style={styles.simResultLabel}>Recibirías aprox.</Text>
              <Text style={styles.simResultValue}>
                {CURR[simTo]?.symbol}{formatAmount(simResult, simTo)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btnPrimary, (!simAmount || simAmountNum <= 0) && styles.btnDisabled]}
            onPress={() => navigation.navigate('ConfirmConversion', { amount: simAmountNum, fromCur: simFrom, toCur: simTo })}
            disabled={!simAmount || simAmountNum <= 0}
            activeOpacity={0.8}
          >
            <MaterialIcons name="currency-exchange" size={18} color={COLORS.primaryDark} />
            <Text style={styles.btnText}>Continuar al cambio</Text>
          </TouchableOpacity>
        </View>
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 15 },
  welcomeLabel: { color: COLORS.textMuted, fontSize: 11 },
  userName: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  notifBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error,
  },
  scroll: { flex: 1, paddingHorizontal: SPACING.lg },
  balanceCard: {
    borderRadius: RADIUS.xxl, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: `${COLORS.primary}33`,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 4 },
  balanceAmount: { color: COLORS.white, fontSize: 30, fontWeight: '900' },
  depositBtn: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  depositBtnGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.xl,
  },
  depositBtnText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 12 },
  balanceHint: { color: COLORS.textDim, fontSize: 11, marginTop: SPACING.sm },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: SPACING.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  cardTitle: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderRadius: 999, backgroundColor: `${COLORS.primary}1a`,
  },
  liveBadgeLoading: { backgroundColor: `${COLORS.warning}1a` },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveDotGreen: { backgroundColor: COLORS.primary },
  liveDotYellow: { backgroundColor: COLORS.warning },
  liveText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  pairRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  pairBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: `${COLORS.primary}40`,
  },
  pairFlag: { fontSize: 18 },
  pairCode: { flex: 1, color: COLORS.white, fontWeight: '700', fontSize: 13 },
  swapBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardLight, alignItems: 'center', justifyContent: 'center',
  },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.md },
  rateLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  rateValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: SPACING.xs },
  rateValue: { color: COLORS.white, fontSize: 24, fontWeight: '900' },
  rateCurrency: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  changeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: RADIUS.md,
  },
  changeText: { fontWeight: '900', fontSize: 14 },
  rangeRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.md },
  rangeBtn: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardLight, alignItems: 'center',
  },
  rangeBtnActive: { backgroundColor: COLORS.primary },
  rangeText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '900' },
  rangeTextActive: { color: COLORS.primaryDark },
  simHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  simInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: `${COLORS.primary}33`,
  },
  simSymbol: { color: COLORS.textMuted, fontWeight: '900', fontSize: 14 },
  simInput: { flex: 1, color: COLORS.white, fontSize: 20, fontWeight: '900', paddingVertical: SPACING.md },
  simResult: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: `${COLORS.primary}0d`, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    borderWidth: 1, borderColor: `${COLORS.primary}26`, marginBottom: SPACING.md,
  },
  simResultLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  simResultValue: { color: COLORS.primaryLight, fontSize: 18, fontWeight: '900' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingVertical: SPACING.md,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 15 },
})
