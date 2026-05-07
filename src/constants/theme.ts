export const COLORS = {
  // Primary
  primary: '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark: '#7C3AED',

  // Accent
  accent: '#F472B6',
  accentLight: '#F9A8D4',
  accentDark: '#EC4899',

  // Gold
  gold: '#F59E0B',
  goldLight: '#FCD34D',

  // Background
  bg: '#0A0A0A',
  bgCard: '#1A1A2E',
  bgElevated: '#16213E',
  bgOverlay: 'rgba(0,0,0,0.7)',

  // Surface
  surface: '#1E1E3F',
  surfaceLight: '#2A2A4A',

  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#6B7280',

  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const GRADIENTS = {
  primary: ['#8B5CF6', '#EC4899'] as const,
  premium: ['#F59E0B', '#EF4444'] as const,
  dark: ['#0A0A0A', '#1A1A2E'] as const,
  card: ['#1A1A2E', '#16213E'] as const,
  glow: ['#8B5CF6', '#F472B6', '#F59E0B'] as const,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FONT = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    xxxl: 36,
    hero: 48,
  },
} as const;
