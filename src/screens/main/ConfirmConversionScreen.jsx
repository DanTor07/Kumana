import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFinanceManager } from '../../hooks/useFinanceManager'
import { formatAmount, CURRENCIES } from '../../constants/currencies'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

const formatRate = (r) => {
  if (!r) return '0'
  if (r < 0.0001) return r.toFixed(7)
  if (r < 0.01)   return r.toFixed(5)
  if (r < 1)      return r.toFixed(4)
  return formatAmount(r, '')
}

export default function ConfirmConversionScreen({ route, navigation }) {
  const { amount = 0, fromCur = 'USD', toCur = 'COP' } = route.params ?? {}
  const { getRate, handleExchange, wallet } = useFinanceManager()

  const [seconds, setSeconds] = useState(60)
  const [success, setSuccess] = useState(false)
  const [expired, setExpired] = useState(false)

  const rate              = getRate(fromCur, toCur)
  const toAmount          = rate ? amount * rate : 0
  const available         = wallet[fromCur] || 0
  const insufficientFunds = amount > available
  const canConfirm        = !expired && !!rate && !insufficientFunds

  useEffect(() => {
    if (seconds <= 0) { setExpired(true); return }
    const id = setInterval(() => setSeconds(prev => prev - 1), 1000)
    return () => clearInterval(id)
  }, [seconds])

  const handleConfirm = async () => {
    if (!canConfirm) return
    const ok = await handleExchange(fromCur, toCur, amount, toAmount, rate)
    if (ok) setSuccess(true)
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#0a1f18', '#0f231d', '#071a13']} style={styles.successBg}>
          <View style={styles.successContainer}>

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
                  Tasa aplicada: 1 {fromCur} = {formatRate(rate)} {toCur}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, styles.btnFullWidth]}
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

  // ── Pantalla de confirmación ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisar Conversión</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Ícono central */}
        <View style={styles.iconWrap}>
          <LinearGradient colors={[`${COLORS.primary}33`, `${COLORS.primary}11`]} style={styles.iconCircle}>
            <MaterialIcons name="currency-exchange" size={32} color={COLORS.primary} />
          </LinearGradient>
        </View>

        <Text style={styles.mainTitle}>Confirmar Transacción</Text>
        <Text style={styles.mainSubtitle}>Por favor revisa los detalles cuidadosamente.</Text>

        {/* Tarjeta de detalles */}
        <View style={styles.detailCard}>

          {/* Tú Envías */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Tú Envías</Text>
              <View style={styles.currencyRow}>
                <Text style={styles.currencyFlag}>{CURRENCIES[fromCur]?.flag}</Text>
                <Text style={styles.currencyCode}>{fromCur}</Text>
              </View>
            </View>
            <Text style={styles.detailAmount}>
              {CURRENCIES[fromCur]?.symbol}{formatAmount(amount, fromCur)}
            </Text>
          </View>

          {/* Línea divisora con tasa */}
          <View style={styles.ratePill}>
            <View style={styles.dottedLine} />
            <View style={styles.ratePillBadge}>
              <MaterialIcons name="arrow-forward" size={12} color={COLORS.white} />
              <Text style={styles.ratePillText}>
                1 {fromCur} = {formatRate(rate)} {toCur}
              </Text>
            </View>
            <View style={styles.dottedLine} />
          </View>

          {/* Tú Recibes */}
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Text style={styles.detailLabel}>Tú Recibes</Text>
              <View style={styles.currencyRow}>
                <Text style={styles.currencyFlag}>{CURRENCIES[toCur]?.flag}</Text>
                <Text style={styles.currencyCode}>{toCur}</Text>
              </View>
            </View>
            <Text style={[styles.detailAmount, { color: COLORS.primary }]}>
              {CURRENCIES[toCur]?.symbol}{formatAmount(toAmount, toCur)}
            </Text>
          </View>

          <View style={styles.cardDivider} />

          {/* Comisión */}
          <View style={styles.detailRow}>
            <Text style={styles.detailMeta}>Comisión</Text>
            <View style={styles.feeRow}>
              <Text style={styles.detailMeta}>{CURRENCIES[fromCur]?.symbol}0.00</Text>
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>GRATIS</Text>
              </View>
            </View>
          </View>

          {/* Tiempo */}
          <View style={[styles.detailRow, { marginBottom: 0 }]}>
            <Text style={styles.detailMeta}>Tiempo de llegada</Text>
            <Text style={styles.detailMetaValue}>Al instante</Text>
          </View>
        </View>

        {/* Aviso timer */}
        <View style={styles.timerNotice}>
          <MaterialIcons
            name="timer"
            size={16}
            color={expired ? COLORS.error : COLORS.primary}
          />
          {expired ? (
            <Text style={[styles.timerText, { color: COLORS.error }]}>
              La tasa expiró. Vuelve atrás para una nueva cotización.
            </Text>
          ) : (
            <Text style={styles.timerText}>
              Las tasas están garantizadas por{' '}
              <Text style={{ color: COLORS.white, fontWeight: '900' }}>{seconds} segundos</Text>
              . Si el tiempo expira, actualizaremos la cotización con la tasa de mercado más reciente.
            </Text>
          )}
        </View>

        {insufficientFunds && !expired && (
          <Text style={styles.fundsError}>
            Saldo insuficiente de {fromCur}. Deposita fondos desde la pestaña Cambio.
          </Text>
        )}

      </ScrollView>

      {/* Botones fijos al fondo */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnPrimary, !canConfirm && styles.btnDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
          activeOpacity={0.8}
        >
          {expired ? (
            <Text style={styles.btnText}>Tasa expirada</Text>
          ) : insufficientFunds ? (
            <Text style={styles.btnText}>Saldo insuficiente</Text>
          ) : (
            <View style={styles.btnRow}>
              <Text style={styles.btnText}>Confirmar conversión</Text>
              <MaterialIcons name="check-circle" size={20} color={COLORS.primaryDark} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.btnCancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  headerTitle: { color: COLORS.white, fontWeight: '900', fontSize: 17 },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },

  // Ícono central
  iconWrap: { alignItems: 'center', marginBottom: SPACING.md, marginTop: SPACING.sm },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
  mainTitle: { color: COLORS.white, fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: SPACING.xs },
  mainSubtitle: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginBottom: SPACING.lg },

  // Tarjeta de detalles
  detailCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xxl,
    padding: SPACING.lg, borderWidth: 1, borderColor: `${COLORS.primary}22`,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailLeft: { gap: 6 },
  detailLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  currencyFlag: { fontSize: 20 },
  currencyCode: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  detailAmount: { color: COLORS.white, fontSize: 20, fontWeight: '900' },

  // Línea con tasa
  ratePill: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dottedLine: { flex: 1, height: 1, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)' },
  ratePillBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.cardLight, borderRadius: 999,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  ratePillText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },

  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: SPACING.md },

  detailMeta: { color: COLORS.textMuted, fontSize: 13 },
  detailMetaValue: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  feeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  freeBadge: {
    backgroundColor: `${COLORS.primary}22`, borderRadius: 999,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  freeBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '900' },

  // Timer notice
  timerNotice: {
    flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start',
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: `${COLORS.primary}22`,
  },
  timerText: { flex: 1, color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },

  fundsError: { color: COLORS.error, fontSize: 12, textAlign: 'center', marginBottom: SPACING.sm },

  // Footer fijo
  footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.sm },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md + 2, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnFullWidth: { width: '100%' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  btnText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 16 },
  btnCancel: { alignItems: 'center', paddingVertical: SPACING.sm },
  btnCancelText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },

  // Success
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
