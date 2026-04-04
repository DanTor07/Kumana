import { useState } from 'react'
import {
  Modal, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { CURRENCIES } from '../constants/currencies'
import { COLORS, SPACING, RADIUS } from '../styles/theme'

const ALL_CURRENCIES = Object.values(CURRENCIES)

export default function ChartPicker({ value, exclude, onChange, onClose }) {
  const [query, setQuery] = useState('')

  const filtered = ALL_CURRENCIES.filter(c =>
    c.code !== exclude &&
    (c.code.toLowerCase().includes(query.toLowerCase()) ||
     c.name.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.handle} />
          <Text style={styles.title}>Selecciona moneda</Text>

          <View style={styles.searchRow}>
            <MaterialIcons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar moneda o país..."
              placeholderTextColor={COLORS.textMuted}
              autoFocus
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, item.code === value && styles.itemActive]}
                onPress={() => { onChange(item.code); onClose() }}
                activeOpacity={0.7}
              >
                <Text style={styles.flag}>{item.flag}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemCode}>{item.code}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                {item.code === value && (
                  <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl, padding: SPACING.lg, maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: SPACING.md,
  },
  title: { fontSize: 18, fontWeight: '900', color: COLORS.white, marginBottom: SPACING.md },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, marginBottom: SPACING.md,
  },
  searchInput: { flex: 1, color: COLORS.white, paddingVertical: SPACING.sm, fontSize: 14 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  itemActive: { backgroundColor: `${COLORS.primary}0d`, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm },
  flag: { fontSize: 24, width: 32, textAlign: 'center' },
  itemInfo: { flex: 1 },
  itemCode: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  itemName: { color: COLORS.textMuted, fontSize: 12 },
  closeBtn: {
    marginTop: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardLight, borderRadius: RADIUS.xl, alignItems: 'center',
  },
  closeBtnText: { color: COLORS.textMuted, fontWeight: '700' },
})
