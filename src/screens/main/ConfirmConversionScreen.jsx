import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet,  } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFinanceManager } from '../../hooks/useFinanceManager'
import { formatAmount, CURRENCIES } from '../../constants/currencies'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

export default function ConfirmConversionScreen({ route, navigation }) {
  const { amount = 0, fromCur = 'USD', toCur = 'COP' } = route.params ?? {}
  const { getRate, handleExchange, wallet } = useFinanceManager()

  const [seconds, setSeconds]   = useState(60)
  const [success, setSuccess]   = useState(false)
  const [expired, setExpired]   = useState(false)

  const rate              = getRate(fromCur, toCur)
  const toAmount          = rate ? amount * rate : 0
  const available         = wallet[fromCur] || 0
  const insufficientFunds = amount > available

  useEffect(() => {
    if (seconds <= 0) { setExpired(true); return }
    const id = setInterval(() => setSeconds(prev => prev - 1), 1000)
    return () => clearInterval(id)
  }, [seconds])

  const handleConfirm = async () => {
    if (!rate || expired) return
    const ok = await handleExchange(fromCur, toCur, amount, toAmount, rate)
    if (ok) setSuccess(true)
  }

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#0a1f18', '#0f231d', '#071a13']} style={styles.successBg}>
          <View style={styles.successContainer}>

            {/* Icono con anillo doble */}
            <View style={styles.successRingOuter}>
              <View style={styles.successRingInner}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.successIconGrad}>
                  <MaterialIcons name="check" size={44} color={COLORS.primaryDark} />
                </LinearGradient>
              </View>
            </View>

            <Text style={styles.successTitle}>¡Operación exitosa!</Text>
            <Text style={styles.successDate}>
              {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>

            {/* Tarjeta de resumen */}
            <View style={styles.successCard}>
              <View style={styles.successCardRow}>
                <View style={styles.successCurrencyBlock}>
                  <Text style={styles.successCurrencyLabel}>Enviaste</Text>
                  <Text style={styles.successCurrencyAmount}>
                    {CURRENCIES[fromCur]?.symbol}{formatAmount(amount, fromCur)}
                  </Text>
                  <Text style={styles.successCurrencyCode}>{fromCur}</Text>
                </View>

                <View style={styles.successArrowWrap}>
                  <MaterialIcons name="arrow-forward" size={20} color={COLORS.primary} />
                </View>

                <View style={styles.successCurrencyBlock}>
                  <Text style={styles.successCurrencyLabel}>Recibiste</Text>
                  <Text style={[styles.successCurrencyAmount, { color: COLORS.primary }]}>
                    {CURRENCIES[toCur]?.symbol}{formatAmount(toAmount, toCur)}
                  </Text>
                  <Text style={styles.successCurrencyCode}>{toCur}</Text>
                </View>
              </View>

              <View style={styles.successDivider} />

              <View style={styles.successRateRow}>
                <MaterialIcons name="trending-up" size={14} color={COLORS.primaryLight} />
                <Text style={styles.successRateText}>
                  Tasa aplicada: 1 {fromCur} = {formatAmount(rate || 0, toCur)} {toCur}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('DashboardMain')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>Volver al inicio</Text>
            </TouchableOpacity>

          </View>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar cambio</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Resumen */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Envías</Text>
              <Text style={styles.summaryValue}>{CURRENCIES[fromCur]?.symbol}{formatAmount(amount, fromCur)}</Text>
              <Text style={styles.summaryCurrency}>{fromCur}</Text>
            </View>
            <MaterialIcons name="arrow-forward" size={28} color={COLORS.primary} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Recibes</Text>
              <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{CURRENCIES[toCur]?.symbol}{formatAmount(toAmount, toCur)}</Text>
              <Text style={styles.summaryCurrency}>{toCur}</Text>
            </View>
          </View>
          <Text style={styles.rateText}>Tasa: 1 {fromCur} = {formatAmount(rate || 0, toCur)} {toCur}</Text>
        </View>

        {/* Countdown */}
        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Tasa reservada por</Text>
          <Text style={[styles.countdownValue, expired && { color: COLORS.error }]}>{seconds}s</Text>
          {expired && <Text style={styles.expiredText}>La tasa expiró. Vuelve al inicio para una nueva cotización.</Text>}
        </View>

        {insufficientFunds && !expired && (
          <Text style={styles.fundsError}>
            Saldo insuficiente de {fromCur}. Deposita fondos desde la pestaña Cambio.
          </Text>
        )}

        <TouchableOpacity
          style={[styles.btnPrimary, (expired || !rate || insufficientFunds) && styles.btnDisabled]}
          onPress={handleConfirm}
          disabled={expired || !rate || insufficientFunds}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>
            {expired ? 'Tasa expirada' : insufficientFunds ? 'Saldo insuficiente' : 'Confirmar intercambio'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.btnSecondaryText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { color: COLORS.white, fontWeight: '900', fontSize: 18 },
  content: { flex: 1, padding: SPACING.lg },
  summaryCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: `${COLORS.primary}33`, marginBottom: SPACING.md,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  summaryValue: { color: COLORS.white, fontSize: 22, fontWeight: '900' },
  summaryCurrency: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  rateText: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },
  countdownCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.lg,
    alignItems: 'center', marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  countdownLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: SPACING.xs },
  countdownValue: { color: COLORS.white, fontSize: 48, fontWeight: '900' },
  expiredText: { color: COLORS.error, fontSize: 12, textAlign: 'center', marginTop: SPACING.sm },
  fundsError: { color: COLORS.error, fontSize: 12, textAlign: 'center', marginBottom: SPACING.sm },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.sm,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 16 },
  btnSecondary: {
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  btnSecondaryText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },
  successBg: { flex: 1 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  successRingOuter: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: `${COLORS.primary}18`,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
  },
  successRingInner: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: `${COLORS.primary}28`,
    alignItems: 'center', justifyContent: 'center',
  },
  successIconGrad: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { color: COLORS.white, fontSize: 26, fontWeight: '900', marginBottom: SPACING.xs },
  successDate: { color: COLORS.textMuted, fontSize: 12, marginBottom: SPACING.xl },
  successCard: {
    width: '100%', backgroundColor: COLORS.card, borderRadius: RADIUS.xxl,
    padding: SPACING.lg, borderWidth: 1, borderColor: `${COLORS.primary}33`,
    marginBottom: SPACING.xl,
  },
  successCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  successCurrencyBlock: { flex: 1, alignItems: 'center' },
  successCurrencyLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  successCurrencyAmount: { color: COLORS.white, fontSize: 20, fontWeight: '900', marginBottom: 2 },
  successCurrencyCode: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  successArrowWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${COLORS.primary}1a`, alignItems: 'center', justifyContent: 'center',
  },
  successDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: SPACING.sm },
  successRateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  successRateText: { color: COLORS.textMuted, fontSize: 11 },
})
