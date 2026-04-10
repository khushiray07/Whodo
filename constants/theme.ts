export const colors = {
  primary: '#6b1ef3',
  primaryDim: '#5f00e2',
  primaryContainer: '#ad8eff',
  secondary: '#006a28',
  secondaryDim: '#005d22',
  secondaryContainer: '#5cfd80',
  tertiary: '#b41924',
  tertiaryContainer: '#ff928c',
  error: '#b41340',
  errorContainer: '#f74b6d',
  surface: '#f6f6fc',
  surfaceContainer: '#e7e8ef',
  surfaceContainerLow: '#f0f0f7',
  surfaceContainerHigh: '#e1e2ea',
  surfaceContainerHighest: '#dbdce4',
  surfaceContainerLowest: '#ffffff',
  onSurface: '#2d2f33',
  onSurfaceVariant: '#5a5b60',
  outline: '#75777c',
  outlineVariant: '#acadb2',
  background: '#f6f6fc',
  onPrimary: '#f7f0ff',
  onSecondary: '#cfffce',
  onSecondaryContainer: '#005d22',
  onTertiary: '#ffefee',
  onError: '#ffefef',
  whatsapp: '#25D366',
} as const;

export const fonts = {
  headline: 'PlusJakartaSans_700Bold',
  headlineExtra: 'PlusJakartaSans_800ExtraBold',
  headlineMedium: 'PlusJakartaSans_500Medium',
  headlineSemiBold: 'PlusJakartaSans_600SemiBold',
  body: 'BeVietnamPro_400Regular',
  bodyMedium: 'BeVietnamPro_500Medium',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
  bodyBold: 'BeVietnamPro_700Bold',
} as const;

export const radii = {
  sm: 8,
  default: 16,
  lg: 24,
  xl: 48,
  full: 9999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const shadows = {
  card: {
    shadowColor: '#6b1ef3',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 4,
  },
  cardLight: {
    shadowColor: '#6b1ef3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  fab: {
    shadowColor: '#6b1ef3',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 8,
  },
} as const;
