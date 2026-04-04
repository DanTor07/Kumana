import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useAuth } from '../../hooks/useAuth'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

const ID_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
  { value: 'PA', label: 'Pasaporte' },
  { value: 'NIT', label: 'NIT' },
]

export default function CompleteProfileScreen({ navigation }) {
  const { saveProfile, loading } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [idType, setIdType] = useState('CC')
  const [cedula, setCedula] = useState('')

  const isValid = name.trim().length > 1 && username.trim().length > 2 &&
    email.includes('@') && cedula.trim().length > 4

  const handleSave = async () => {
    if (!isValid) return
    // saveProfile actualiza el contexto → AppNavigator detecta isAuthenticated y cambia a MainTabs automáticamente
    await saveProfile({ name: name.trim(), username: username.trim(), email: email.trim(), idType, cedula: cedula.trim() })
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

        <Text style={styles.title}>Completa tu perfil</Text>
        <Text style={styles.subtitle}>Cuéntanos un poco más sobre ti</Text>

        {[
          { label: 'Nombre completo', value: name, setter: setName, placeholder: 'Daniel Torres', keyboard: 'default' },
          { label: 'Usuario', value: username, setter: setUsername, placeholder: '@danield', keyboard: 'default' },
          { label: 'Correo electrónico', value: email, setter: setEmail, placeholder: 'daniel@email.com', keyboard: 'email-address' },
          { label: 'Número de documento', value: cedula, setter: setCedula, placeholder: '1234567890', keyboard: 'numeric' },
        ].map(({ label, value, setter, placeholder, keyboard }) => (
          <View key={label} style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setter}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textMuted}
              keyboardType={keyboard}
              autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
            />
          </View>
        ))}

        {/* Selector de tipo de ID */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tipo de documento</Text>
          <View style={styles.idTypeRow}>
            {ID_TYPES.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                style={[styles.idChip, idType === value && styles.idChipActive]}
                onPress={() => setIdType(value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.idChipText, idType === value && styles.idChipTextActive]}>
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, !isValid && styles.btnDisabled]}
          onPress={handleSave}
          disabled={!isValid || loading}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Comenzar a invertir'}</Text>
        </TouchableOpacity>
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
  fieldGroup: { marginBottom: SPACING.md },
  label: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: SPACING.xs, letterSpacing: 1 },
  input: {
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    color: COLORS.white, fontSize: 15, fontWeight: '600',
  },
  idTypeRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  idChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, backgroundColor: COLORS.cardLight,
    borderWidth: 1, borderColor: 'transparent',
  },
  idChipActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}1a` },
  idChipText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
  idChipTextActive: { color: COLORS.primary },
  btnPrimary: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.md,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: COLORS.primaryDark, fontWeight: '900', fontSize: 16 },
})
