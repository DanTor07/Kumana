export const COLORS = {
  primary: '#00c28b',
  primaryLight: '#06f9b4',
  primaryDark: '#0a1f18',
  bg: '#0f231d',
  bgDark: '#0a1f18',
  card: '#172d25',
  cardLight: '#1a3028',
  text: '#ffffff',
  textMuted: '#7aa899',
  textDim: '#5a8a78',
  textDark: '#3a5a4a',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#ffc107',
  info: '#3b82f6',
  white: '#ffffff',
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const FONTS = {
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  medium: 'font-medium',
}

// Mimicking StyleSheet.create from the PDF but for Web
export const commonStyles = {
  container: {
    backgroundColor: COLORS.bg,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  header: {
    paddingInline: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }
}
