export const darkTheme = {
  background: '#0A0B10',
  surface: '#14161F',
  surfaceElevated: '#1C1E2A',
  surfaceHighlight: '#252836',
  primary: '#00D4FF',
  primaryLight: '#33DDFF',
  primaryDark: '#00A8CC',
  accent: '#7B61FF',
  text: '#FFFFFF',
  textSecondary: '#9AA3B2',
  textMuted: '#5A616D',
  border: '#252836',
  success: '#00D4FF',
  error: '#FF4D6D',
  warning: '#FFD740',
  live: '#FF4D6D',
} as const;

export const lightTheme = {
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#E8EBF0',
  surfaceHighlight: '#DEE2E9',
  primary: '#00A8CC',
  primaryLight: '#00D4FF',
  primaryDark: '#007A99',
  accent: '#5B3FD9',
  text: '#0A0B10',
  textSecondary: '#5F6877',
  textMuted: '#9AA3B2',
  border: '#DEE2E9',
  success: '#00A8CC',
  error: '#E53935',
  warning: '#F9A825',
  live: '#E53935',
} as const;

export type ThemeColors = typeof darkTheme;
