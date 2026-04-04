import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Modal, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

const COUNTRY_CODES = [
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+1',  country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+49', country: 'Alemania', flag: '🇩🇪' },
]

export default function CreateAccountScreen({ navigation, route }) {
  const isLogin = route.params?.mode === 'login'
  const { registerPhone, loading } = useAuth()
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0])
  const [phone, setPhone] = useState('')
  const [showPicker, setShowPicker] = useState(false)

  const isValid = phone.replace(/\D/g, '').length >= 7

  const handleContinue = async () => {
    if (!isValid) return
    const ok = await registerPhone(phone, selectedCountry.code)
    if (ok) navigation.navigate('VerifyNumber', { mode: isLogin ? 'login' : 'register' })
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.title}>{isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Ingresa tu número para continuar' : 'Ingresa tu número de celular para comenzar'}</Text>

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.countryBtn} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
            <Text style={styles.flag}>{selectedCountry.flag}</Text>
            <Text style={styles.countryCode}>{selectedCountry.code}</Text>
            <MaterialIcons name="expand-more" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="300 123 4567"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, !isValid && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={!isValid || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>{loading ? 'Enviando...' : 'Continuar'}</Text>
        </TouchableOpacity>

        {/* Modal selector de país */}
        <Modal visible={showPicker} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Selecciona tu país</Text>
              <FlatList
                data={COUNTRY_CODES}
                keyExtractor={item => item.code + item.country}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.countryItem, item.code === selectedCountry.code && styles.countryItemActive]}
                    onPress={() => { setSelectedCountry(item); setShowPicker(false) }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flag}>{item.flag}</Text>
                    <Text style={styles.countryName}>{item.country}</Text>
                    <Text style={styles.countryCodeText}>{item.code}</Text>
                    {item.code === selectedCountry.code && (
                      <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl },
  backBtn: { marginBottom: SPACING.xl, alignSelf: 'flex-start' },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginBottom: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.xl, lineHeight: 20 },
  inputRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  countryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  flag: { fontSize: 20 },
  countryCode: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  phoneInput: {
    flex: 1, backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    color: COLORS.white, fontSize: 16, fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl, padding: SPACING.lg, maxHeight: '70%',
  },
  modalTitle: { fontSize: 18, fontWeight: '900', color: COLORS.white, marginBottom: SPACING.md },
  countryItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  countryItemActive: { backgroundColor: `${COLORS.primary}0d`, borderRadius: RADIUS.md },
  countryName: { flex: 1, color: COLORS.white, fontWeight: '600', fontSize: 14 },
  countryCodeText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
})
