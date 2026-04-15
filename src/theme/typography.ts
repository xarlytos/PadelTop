export const typography = {
  display: { fontSize: 40, fontWeight: '800', letterSpacing: -0.5 },
  score: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  scoreSmall: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  heading1: { fontSize: 26, fontWeight: '700', letterSpacing: -0.3 },
  heading2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  heading3: { fontSize: 17, fontWeight: '600', letterSpacing: -0.1 },
  body: { fontSize: 15, fontWeight: '400', letterSpacing: 0 },
  bodySmall: { fontSize: 13, fontWeight: '400', letterSpacing: 0 },
  caption: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
  overline: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
} as const;

export type Typography = typeof typography;
