import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, Image, Modal,
  StyleSheet, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../hooks/useAuth'
import { useFinanceManager } from '../../hooks/useFinanceManager'
import ChartPicker from '../../components/ChartPicker'
import { COLORS, SPACING, RADIUS } from '../../styles/theme'

export default function ProfileScreen({ navigation }) {
  const { user, saveProfile } = useAuth()
  const { baseCurrency, setBaseCurrency, CURRENCIES } = useFinanceManager()

  const [showLogout, setShowLogout]           = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const handleAvatarPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      })
      if (!result.canceled && result.assets[0]) {
        await saveProfile({ avatar: result.assets[0].uri })
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar la imagen.')
    }
  }

  const handleLogout = () => {
    setShowLogout(false)
    saveProfile({
      name: '', username: '', email: '', phone: '',
      idType: 'CC', cedula: '', avatar: null, memberSince: '',
    })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {showCurrencyPicker && (
        <ChartPicker value={baseCurrency} onChange={setBaseCurrency} onClose={() => setShowCurrencyPicker(false)} />
      )}

      {/* Modal de logout */}
      <Modal visible={showLogout} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.modalSubtitle}>Tendrás que volver a autenticarte para ver tu balance.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowLogout(false)} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnLogout} onPress={handleLogout} activeOpacity={0.8}>
                <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <TouchableOpacity style={styles.avatarWrap} onPress={handleAvatarPick} activeOpacity={0.8}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={12} color={COLORS.primaryDark} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user.name || 'Usuario Kumana'}</Text>
          <Text style={styles.userHandle}>@{user.username || 'sin_usuario'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Verificado</Text>
            </View>
            <View style={[styles.badge, styles.badgePro]}>
              <Text style={[styles.badgeText, { color: '#f59e0b' }]}>Nivel Pro</Text>
            </View>
          </View>
        </View>

        {/* Info de cuenta */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>Información de Cuenta</Text>
          {[
            { icon: 'mail', label: 'Email', value: user.email || 'No asignado' },
            { icon: 'phone', label: 'Teléfono', value: user.phone || 'No asignado' },
            { icon: 'badge', label: user.idType || 'ID', value: user.cedula || 'No verificada' },
          ].map(({ icon, label, value }, i, arr) => (
            <View key={label} style={[styles.infoRow, i < arr.length - 1 && styles.infoRowBorder]}>
              <View style={styles.infoIcon}>
                <MaterialIcons name={icon} size={20} color={COLORS.textMuted} />
              </View>
              <View>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Preferencias */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>Preferencias</Text>
          <TouchableOpacity style={styles.prefRow} onPress={() => setShowCurrencyPicker(true)} activeOpacity={0.7}>
            <View style={styles.prefIcon}>
              <MaterialIcons name="payments" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.prefInfo}>
              <Text style={styles.prefTitle}>Moneda Base</Text>
              <Text style={styles.prefValue}>
                {CURRENCIES[baseCurrency]?.flag} {baseCurrency} — {CURRENCIES[baseCurrency]?.name}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setShowLogout(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Cerrar Sesión Activa</Text>
        </TouchableOpacity>

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
  headerTitle: { color: COLORS.white, fontWeight: '900', fontSize: 18 },
  scroll: { flex: 1, paddingHorizontal: SPACING.lg },
  avatarCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', marginBottom: SPACING.md,
  },
  avatarWrap: { position: 'relative', marginBottom: SPACING.md },
  avatarImg: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: `${COLORS.primary}33` },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitials: { color: COLORS.primaryDark, fontSize: 28, fontWeight: '900' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.card,
  },
  userName: { color: COLORS.white, fontSize: 20, fontWeight: '900', marginBottom: 4 },
  userHandle: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: SPACING.md },
  badgeRow: { flexDirection: 'row', gap: SPACING.sm },
  badge: {
    paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 999,
    backgroundColor: `${COLORS.primary}1a`, borderWidth: 1, borderColor: `${COLORS.primary}33`,
  },
  badgePro: { backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' },
  badgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  infoCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: SPACING.md,
  },
  sectionLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, marginBottom: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  prefIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}1a`, alignItems: 'center', justifyContent: 'center',
  },
  prefInfo: { flex: 1 },
  prefTitle: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  prefValue: { color: COLORS.textMuted, fontSize: 12 },
  logoutBtn: {
    paddingVertical: SPACING.lg, borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(239,68,68,0.1)', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', marginBottom: SPACING.md,
  },
  logoutText: { color: COLORS.error, fontWeight: '900', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl, padding: SPACING.lg,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: SPACING.lg },
  modalTitle: { color: COLORS.white, fontWeight: '900', fontSize: 20, textAlign: 'center', marginBottom: SPACING.sm },
  modalSubtitle: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginBottom: SPACING.xl },
  modalActions: { flexDirection: 'row', gap: SPACING.sm },
  btnCancel: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.xl, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  btnCancelText: { color: COLORS.textMuted, fontWeight: '700' },
  btnLogout: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.xl, backgroundColor: COLORS.error, alignItems: 'center' },
  btnLogoutText: { color: COLORS.white, fontWeight: '900' },
})
