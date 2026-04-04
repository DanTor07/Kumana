import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
// 3 buttons per row with 2 gaps between them and horizontal padding on both sides
const KEY_BTN_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 2) / 3

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function VerifyNumberScreen({ navigation, route }) {
  const mode = route.params?.mode ?? 'register'
  const { verifyCode, user, loading } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(60)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds(prev => prev - 1), 1000)
    return () => clearInterval(id)
  }, [seconds])

  const handleKey = (key) => {
    if (key === '⌫') {
      setCode(prev => prev.slice(0, -1))
    } else if (key !== '' && code.length < 6) {
      const newCode = code + key
      setCode(newCode)
      if (newCode.length === 6) handleVerify(newCode)
    }
  }

  const handleVerify = async (c) => {
    setError('')
    const ok = await verifyCode(c)
    if (ok) {
      if (mode === 'login') {
        if (!user.name) navigation.navigate('CompleteProfile')
        // user.name exists → AppNavigator detects name+phoneVerified and redirects automatically
      } else {
        navigation.navigate('CompleteProfile')
      }
    } else {
      setError('Código incorrecto. Intenta de nuevo.')
      setCode('')
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <Text style={styles.title}>Verifica tu número</Text>
      <Text style={styles.subtitle}>Ingresa el código de 6 dígitos{'\n'}enviado a {user.phone}</Text>

      {/* Cajas OTP */}
      <View style={styles.otpRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.otpBox,
              code[i] ? styles.otpBoxFilled : null,
              i === code.length ? styles.otpBoxActive : null,
            ]}
          >
            <Text style={styles.otpDigit}>{code[i] || ''}</Text>
          </View>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Teclado numérico */}
      <View style={styles.keyboard}>
        {KEYS.map((key, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.keyBtn, key === '' && styles.keyBtnEmpty]}
            onPress={() => handleKey(key)}
            disabled={key === ''}
            activeOpacity={0.7}
          >
            <Text style={[styles.keyText, key === '⌫' && styles.keyBackspace]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.resendRow}>
        {seconds > 0 ? (
          <Text style={styles.timerText}>Reenviar en {seconds}s</Text>
        ) : (
          <TouchableOpacity onPress={() => setSeconds(60)} activeOpacity={0.7}>
            <Text style={styles.resendText}>Reenviar código</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.lg, paddingTop: SPACING.xxl },
  backBtn: { marginBottom: SPACING.xl, alignSelf: 'flex-start' },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginBottom: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xl, lineHeight: 20 },
  otpRow: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'center', marginBottom: SPACING.md },
  otpBox: {
    width: 48, height: 56, borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  otpBoxFilled: { borderColor: `${COLORS.primary}66` },
  otpBoxActive: { borderColor: COLORS.primary },
  otpDigit: { color: COLORS.white, fontSize: 22, fontWeight: '900' },
  errorText: { color: COLORS.error, textAlign: 'center', marginBottom: SPACING.md, fontSize: 13 },
  keyboard: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm,
    justifyContent: 'center', marginTop: SPACING.lg,
  },
  keyBtn: {
    width: KEY_BTN_WIDTH, height: 64, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.cardLight, alignItems: 'center', justifyContent: 'center',
  },
  keyBtnEmpty: { backgroundColor: 'transparent' },
  keyText: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  keyBackspace: { fontSize: 18 },
  resendRow: { alignItems: 'center', marginTop: SPACING.xl },
  timerText: { color: COLORS.textMuted, fontSize: 13 },
  resendText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
})
