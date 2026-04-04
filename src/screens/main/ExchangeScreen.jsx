import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, StyleSheet, KeyboardAvoidingView, Platform, Keyboard,
  TouchableWithoutFeedback,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFinanceManager } from '../../hooks/useFinanceManager'
import { formatAmount, CURRENCIES } from '../../constants/currencies'
import ChartPicker from '../../components/ChartPicker'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

const RISK_COLOR = {
  BAJO:  { text: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  MEDIO: { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ALTO:  { text: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

const formatRate = (r) => {
  if (!r) return '0'
  if (r < 0.0001) return r.toFixed(7)
  if (r < 0.001)  return r.toFixed(6)
  if (r < 0.01)   return r.toFixed(5)
  if (r < 0.1)    return r.toFixed(4)
  return formatAmount(r, '')
}

export default function ExchangeScreen() {
  const {
    wallet, investments, baseCurrency, ratesLoading, ratesError,
    aiData, aiLoading, aiError, analyzePortfolio,
    getRate, getTotalInBase, handleDeposit, handleExchange, CURRENCIES: CURR,
  } = useFinanceManager()

  const [showDeposit, setShowDeposit] = useState(false)
  const [showInvest, setShowInvest]   = useState(false)
  const [fromCur, setFromCur]         = useState('COP')
  const [toCur, setToCur]             = useState('USD')
  const [fromAmount, setFromAmount]   = useState('')
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker]     = useState(false)
  const [investSuccess, setInvestSuccess]   = useState(false)

  // Deposit modal state
  const [depCurrency, setDepCurrency] = useState('COP')
  const [depAmount, setDepAmount]     = useState('')
  const [showDepPicker, setShowDepPicker] = useState(false)

  const rate       = getRate(fromCur, toCur)
  const fromAmtNum = parseFloat(fromAmount) || 0
  const toAmtNum   = rate ? fromAmtNum * rate : 0
  const available  = wallet[fromCur] || 0

  const getButtonState = () => {
    if (investSuccess)          return { label: '¡Completado!',            bg: COLORS.success }
    if (available === 0)        return { label: 'Sin saldo — Deposita primero', bg: COLORS.cardLight }
    if (fromAmtNum > available) return { label: 'Saldo insuficiente',      bg: COLORS.error }
    return { label: 'Confirmar intercambio', bg: COLORS.primary }
  }

  const canInvest = fromAmtNum > 0 && fromAmtNum <= available && !!rate

  const onConfirmInvest = async () => {
    if (!canInvest) return
    const ok = await handleExchange(fromCur, toCur, fromAmtNum, toAmtNum, rate)
    if (ok) {
      setInvestSuccess(true)
      setFromAmount('')
      setTimeout(() => { setInvestSuccess(false); setShowInvest(false) }, 2000)
    }
  }

  const onConfirmDeposit = () => {
    const n = parseFloat(depAmount)
    if (n > 0) {
      handleDeposit(depCurrency, n)
      setDepAmount('')
      setShowDeposit(false)
    }
  }

  const holdings = Object.entries(wallet)
    .filter(([, v]) => v > 0)
    .map(([cur, amt]) => ({ cur, amt, inBase: getRate(cur, baseCurrency) ? amt * getRate(cur, baseCurrency) : 0 }))
    .sort((a, b) => b.inBase - a.inBase)

  const btnState = getButtonState()

  return (
    <SafeAreaView style={styles.safeArea}>
      {showFromPicker && <ChartPicker value={fromCur} exclude={toCur} onChange={setFromCur} onClose={() => setShowFromPicker(false)} />}
      {showToPicker   && <ChartPicker value={toCur} exclude={fromCur} onChange={setToCur}  onClose={() => setShowToPicker(false)} />}
      {showDepPicker  && <ChartPicker value={depCurrency} onChange={setDepCurrency} onClose={() => setShowDepPicker(false)} />}

      {/* Modal depositar */}
      <Modal visible={showDeposit} animationType="slide" transparent onRequestClose={() => { Keyboard.dismiss(); setShowDeposit(false) }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Depositar fondos</Text>
                <TouchableOpacity style={styles.currencySelector} onPress={() => setShowDepPicker(true)} activeOpacity={0.7}>
                  <Text style={styles.depFlag}>{CURR[depCurrency]?.flag}</Text>
                  <Text style={styles.depCode}>{depCurrency}</Text>
                  <MaterialIcons name="expand-more" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
                <View style={styles.depInputRow}>
                  <Text style={styles.depSymbol}>{CURR[depCurrency]?.symbol}</Text>
                  <TextInput
                    style={styles.depInput}
                    value={depAmount}
                    onChangeText={setDepAmount}
                    placeholder="0.00"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    keyboardAppearance="dark"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
                <TouchableOpacity style={styles.btnPrimary} onPress={onConfirmDeposit} activeOpacity={0.8}>
                  <Text style={styles.btnText}>Confirmar depósito</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSecondary} onPress={() => { Keyboard.dismiss(); setShowDeposit(false) }} activeOpacity={0.7}>
                  <Text style={styles.btnSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inversiones</Text>
        <View style={[styles.liveBadge, { backgroundColor: ratesLoading ? `${COLORS.warning}1a` : `${COLORS.primary}1a` }]}>
          <View style={[styles.liveDot, { backgroundColor: ratesLoading ? COLORS.warning : COLORS.primary }]} />
          <Text style={[styles.liveText, { color: ratesLoading ? COLORS.warning : COLORS.primary }]}>
            {ratesLoading ? '...' : 'Live'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Portafolio */}
        <LinearGradient colors={['#1a3d30', '#0d2a20']} style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Portafolio estimado ({baseCurrency})</Text>
          <Text style={styles.portfolioAmount}>
            {CURR[baseCurrency]?.symbol}{formatAmount(getTotalInBase(), baseCurrency)}
          </Text>
        </LinearGradient>

        {/* Acciones */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.btnSecondaryAction} onPress={() => setShowDeposit(true)} activeOpacity={0.7}>
            <Text style={[styles.btnSecondaryActionText, { color: COLORS.primary }]}>+ Depositar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnPrimaryAction}
            onPress={() => setShowInvest(prev => !prev)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPrimaryActionText}>{showInvest ? 'Cerrar' : 'Invertir'}</Text>
          </TouchableOpacity>
        </View>

        {/* Formulario de inversión */}
        {showInvest && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Transferir divisas</Text>

            <View style={styles.exchangeRow}>
              <TouchableOpacity style={styles.currencyBtn} onPress={() => setShowFromPicker(true)} activeOpacity={0.7}>
                <Text style={styles.currencyFlag}>{CURR[fromCur]?.flag}</Text>
                <Text style={styles.currencyCode}>{fromCur}</Text>
              </TouchableOpacity>
              <View style={styles.amountInput}>
                <TextInput
                  style={styles.amountText}
                  value={fromAmount}
                  onChangeText={setFromAmount}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  keyboardAppearance="dark"
                />
              </View>
            </View>

            <View style={styles.rateInfoRow}>
              <View style={styles.divider} />
              <Text style={styles.rateInfo}>1 {fromCur} = {formatRate(rate)} {toCur}</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.exchangeRow}>
              <TouchableOpacity style={styles.currencyBtn} onPress={() => setShowToPicker(true)} activeOpacity={0.7}>
                <Text style={styles.currencyFlag}>{CURR[toCur]?.flag}</Text>
                <Text style={styles.currencyCode}>{toCur}</Text>
              </TouchableOpacity>
              <View style={[styles.amountInput, { backgroundColor: `${COLORS.primary}1a` }]}>
                <Text style={styles.toAmountText}>
                  {rate && fromAmtNum > 0 ? formatAmount(toAmtNum, toCur) : '0.00'}
                </Text>
              </View>
            </View>

            {available === 0 && (
              <Text style={styles.noBalanceHint}>
                No tienes {fromCur} en tu billetera.{' '}
                <Text style={{ color: COLORS.primary }} onPress={() => { setShowInvest(false); setShowDeposit(true) }}>
                  Depositar ahora
                </Text>
              </Text>
            )}

            <TouchableOpacity
              style={[styles.btnConfirm, { backgroundColor: btnState.bg, opacity: (!canInvest && !investSuccess) ? 0.6 : 1 }]}
              disabled={!canInvest || investSuccess}
              onPress={onConfirmInvest}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>{btnState.label}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Activos */}
        {holdings.length > 0 && (
          <View style={styles.mb}>
            <Text style={styles.sectionLabel}>Mis Activos</Text>
            {holdings.map(h => (
              <View key={h.cur} style={styles.holdingItem}>
                <Text style={styles.holdingFlag}>{CURR[h.cur]?.flag}</Text>
                <View style={styles.holdingInfo}>
                  <Text style={styles.holdingCode}>{h.cur}</Text>
                  <Text style={styles.holdingAmount}>{CURR[h.cur]?.symbol}{formatAmount(h.amt, h.cur)}</Text>
                </View>
                {h.cur !== baseCurrency && (
                  <Text style={styles.holdingBase}>≈ {formatAmount(h.inBase, baseCurrency)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* IA Analista */}
        <View style={styles.aiCard}>
          <LinearGradient colors={['#1e1b4b', '#0d2a20']} style={styles.aiHeader}>
            <View style={styles.aiIconWrap}>
              <MaterialIcons name="psychology" size={22} color="#818cf8" />
            </View>
            <View>
              <Text style={styles.aiTitle}>Analista IA</Text>
              <Text style={styles.aiSubtitle}>Gemini Pro</Text>
            </View>
          </LinearGradient>

          <View style={styles.aiBody}>
            {aiLoading ? (
              <Text style={styles.aiLoadingText}>Procesando mercado...</Text>
            ) : aiData ? (
              <View>
                <View style={[styles.riskBadge, { backgroundColor: RISK_COLOR[aiData.riesgo_global]?.bg }]}>
                  <Text style={[styles.riskText, { color: RISK_COLOR[aiData.riesgo_global]?.text }]}>
                    Riesgo {aiData.riesgo_global}
                  </Text>
                </View>
                <Text style={styles.aiSummary}>{aiData.resumen}</Text>
                <View style={styles.adviceCard}>
                  <Text style={styles.adviceLabel}>Consejo Estratégico</Text>
                  <Text style={styles.adviceText}>{aiData.consejo_del_dia}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.aiPlaceholder}>
                Optimiza tu portafolio con asesoría basada en IA y tendencias actuales.
              </Text>
            )}

            <TouchableOpacity
              style={[styles.btnAi, aiLoading && { opacity: 0.6 }]}
              onPress={analyzePortfolio}
              disabled={aiLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAiText}>
                {aiLoading ? 'Analizando...' : aiData ? 'Recalcular análisis' : 'Analizar Portafolio'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 999 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  scroll: { flex: 1, paddingHorizontal: SPACING.lg },
  portfolioCard: {
    borderRadius: RADIUS.xxl, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: `${COLORS.primary}33`,
  },
  portfolioLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 4 },
  portfolioAmount: { color: COLORS.white, fontSize: 32, fontWeight: '900' },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  btnSecondaryAction: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.cardLight, alignItems: 'center',
  },
  btnSecondaryActionText: { fontWeight: '700' },
  btnPrimaryAction: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  btnPrimaryActionText: { color: COLORS.primaryDark, fontWeight: '900' },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: SPACING.md,
  },
  sectionTitle: { color: COLORS.white, fontWeight: '700', fontSize: 13, marginBottom: SPACING.md },
  exchangeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  currencyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, flex: 1,
  },
  currencyFlag: { fontSize: 20 },
  currencyCode: { color: COLORS.white, fontWeight: '700' },
  amountInput: {
    flex: 1, backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, justifyContent: 'center',
    borderWidth: 1, borderColor: `${COLORS.primary}33`,
  },
  amountText: { color: COLORS.white, fontWeight: '700', fontSize: 16, paddingVertical: SPACING.sm },
  toAmountText: { color: COLORS.primary, fontWeight: '700', fontSize: 16, paddingVertical: SPACING.sm },
  rateInfoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  rateInfo: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  noBalanceHint: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', marginBottom: SPACING.sm },
  btnConfirm: { paddingVertical: SPACING.md, borderRadius: RADIUS.xl, alignItems: 'center' },
  btnPrimary: { backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.sm },
  btnSecondary: { backgroundColor: COLORS.cardLight, borderRadius: RADIUS.xl, paddingVertical: SPACING.md, alignItems: 'center' },
  btnText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 15 },
  btnSecondaryText: { color: COLORS.textMuted, fontWeight: '700' },
  mb: { marginBottom: SPACING.md },
  sectionLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: SPACING.sm, marginLeft: 4 },
  holdingItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md, marginBottom: SPACING.xs,
  },
  holdingFlag: { fontSize: 24 },
  holdingInfo: { flex: 1 },
  holdingCode: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  holdingAmount: { color: COLORS.white, fontSize: 16, fontWeight: '900' },
  holdingBase: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  aiCard: {
    borderRadius: RADIUS.xxl, borderWidth: 1, borderColor: '#4f46e533',
    overflow: 'hidden', marginBottom: SPACING.md,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  aiIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(99,102,241,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  aiTitle: { color: COLORS.white, fontWeight: '900', fontSize: 14 },
  aiSubtitle: { color: '#818cf8', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  aiBody: { padding: SPACING.md, backgroundColor: 'rgba(15,35,29,0.6)' },
  aiLoadingText: { color: '#818cf8', textAlign: 'center', paddingVertical: SPACING.xl, fontWeight: '700' },
  aiSummary: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20, marginBottom: SPACING.md },
  aiPlaceholder: { color: COLORS.textMuted, fontSize: 13, marginBottom: SPACING.md, lineHeight: 20 },
  riskBadge: { alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 999, marginBottom: SPACING.sm },
  riskText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  adviceCard: {
    backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: RADIUS.lg,
    padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)', marginBottom: SPACING.md,
  },
  adviceLabel: { color: '#818cf8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', marginBottom: 4 },
  adviceText: { color: COLORS.textMuted, fontSize: 13 },
  btnAi: {
    backgroundColor: '#4f46e5', borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  btnAiText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl, padding: SPACING.lg,
  },
  modalTitle: { color: COLORS.white, fontWeight: '900', fontSize: 18, marginBottom: SPACING.md },
  currencySelector: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, marginBottom: SPACING.md,
  },
  depFlag: { fontSize: 22 },
  depCode: { flex: 1, color: COLORS.white, fontWeight: '700' },
  depInputRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: `${COLORS.primary}33`,
  },
  depSymbol: { color: COLORS.textMuted, fontWeight: '700' },
  depInput: { flex: 1, color: COLORS.white, fontSize: 20, fontWeight: '900', paddingVertical: SPACING.md },
})
