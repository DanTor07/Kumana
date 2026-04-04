import { StyleSheet } from 'react-native'

export const COLORS = {
  bg:           '#0f231d',
  card:         '#172d25',
  cardLight:    '#1e3d33',
  primary:      '#00c28b',
  primaryLight: '#06f9b4',
  primaryDark:  '#003d2b',
  success:      '#22c55e',
  warning:      '#f59e0b',
  error:        '#ef4444',
  textMuted:    '#5a8a78',
  textDim:      '#3d6b5a',
  white:        '#ffffff',
}

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}

export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
}

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
