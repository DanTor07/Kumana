import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

const FEATURES = [
  { icon: 'shield',   label: 'Seguro' },
  { icon: 'bolt',     label: 'Instantáneo' },
  { icon: 'savings',  label: 'Sin comisiones' },
]

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient colors={['#0a1f18', '#0f231d', '#071a13']} style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.logoBox}>
          <MaterialIcons name="currency-exchange" size={18} color={COLORS.white} />
        </LinearGradient>
        <Text style={styles.logoText}>Kumana Fintech</Text>
      </View>

      {/* Hero card decorativa */}
      <View style={styles.heroWrap}>
        <View style={styles.glowBg} />
        <View style={styles.heroCard}>
          <View style={styles.heroCardTop}>
            <View>
              <Text style={styles.heroBalanceLabel}>Balance total</Text>
              <Text style={styles.heroBalanceAmount}>$2,000,000</Text>
              <View style={styles.heroTagRow}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>COP</Text>
                </View>
                <Text style={styles.heroRateText}>1 USD ≈ 4,120 COP</Text>
              </View>
            </View>
            <View style={styles.heroWalletIcon}>
              <MaterialIcons name="account-balance-wallet" size={22} color={COLORS.primary} />
            </View>
          </View>
          <View style={styles.heroCardBottom}>
            <View style={styles.heroDotsRow}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.heroDot} />
              ))}
              <Text style={styles.heroCardNumber}>8842</Text>
            </View>
            <View style={styles.heroBadge}>
              <MaterialIcons name="trending-up" size={14} color={COLORS.primaryLight} />
              <Text style={styles.heroBadgeText}>+2.4%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Headline */}
      <View style={styles.headline}>
        <Text style={styles.headlineTitle}>
          Tu dinero,{'\n'}
          <Text style={{ color: COLORS.primary }}>más inteligente.</Text>
        </Text>
        <Text style={styles.headlineSubtitle}>
          Gestiona tus finanzas con precisión y simplicidad. La nueva era de la banca digital empieza aquí.
        </Text>
      </View>

      {/* Feature pills */}
      <View style={styles.featuresRow}>
        {FEATURES.map(({ icon, label }) => (
          <View key={label} style={styles.featurePill}>
            <MaterialIcons name={icon} size={20} color={COLORS.primary} />
            <Text style={styles.featureLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('CreateAccount')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.btnPrimaryText}>Empezar ahora</Text>
            <MaterialIcons name="arrow-forward" size={18} color={COLORS.primaryDark} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('CreateAccount', { mode: 'login' })}
          activeOpacity={0.7}
        >
          <Text style={styles.btnSecondaryText}>
            ¿Ya tienes cuenta?{' '}
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
  },
  logoBox: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { color: COLORS.white, fontWeight: '700', fontSize: 17, letterSpacing: -0.3 },
  heroWrap: {
    alignItems: 'center', paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg, paddingBottom: SPACING.xl, position: 'relative',
  },
  glowBg: {
    position: 'absolute', left: '15%', right: '15%', top: '15%', bottom: '15%',
    borderRadius: RADIUS.xxl, backgroundColor: COLORS.primary, opacity: 0.12,
  },
  heroCard: {
    width: 288, borderRadius: RADIUS.xxl, padding: SPACING.lg,
    justifyContent: 'space-between',
    backgroundColor: '#1a3d30',
    borderWidth: 1, borderColor: 'rgba(0,194,139,0.25)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30,
    elevation: 20,
  },
  heroCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.xl },
  heroBalanceLabel: { color: '#7aa899', fontSize: 12, marginBottom: 2 },
  heroBalanceAmount: { color: COLORS.white, fontSize: 22, fontWeight: '700', marginBottom: SPACING.xs },
  heroTagRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  heroTag: {
    backgroundColor: 'rgba(0,194,139,0.1)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  heroTagText: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
  heroRateText: { color: '#7aa899', fontSize: 10, fontStyle: 'italic', opacity: 0.8 },
  heroWalletIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0,194,139,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  heroCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroDotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  heroCardNumber: { color: COLORS.white, fontSize: 12, fontWeight: '500', letterSpacing: 2, marginLeft: 4 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,194,139,0.2)', borderRadius: 999,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  heroBadgeText: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '500' },
  headline: { paddingHorizontal: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg },
  headlineTitle: { color: COLORS.white, fontSize: 36, fontWeight: '800', lineHeight: 44, textAlign: 'center', marginBottom: SPACING.sm },
  headlineSubtitle: { color: '#7aa899', fontSize: 13, lineHeight: 20, textAlign: 'center' },
  featuresRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  featurePill: {
    flex: 1, alignItems: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.md, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.card,
  },
  featureLabel: { color: COLORS.white, fontSize: 11, fontWeight: '500' },
  footer: { paddingHorizontal: SPACING.lg, gap: SPACING.sm, marginTop: 'auto', paddingBottom: SPACING.xxl },
  btnPrimary: { borderRadius: RADIUS.xl, overflow: 'hidden' },
  btnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md + 2, borderRadius: RADIUS.xl,
  },
  btnPrimaryText: { color: COLORS.primaryDark, fontWeight: '700', fontSize: 15 },
  btnSecondary: { paddingVertical: SPACING.sm, alignItems: 'center' },
  btnSecondaryText: { color: '#7aa899', fontSize: 13 },
})
