import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SlideUpView } from '../../../src/utils/animations';
import { useTheme } from '../../../src/theme';
import { Check, Crown } from 'lucide-react-native';
import { Button } from '../../../components/common/Button';

const BENEFITS = [
  'Marcador en tiempo real vía WebSocket',
  'Estadísticas detalladas punto por punto',
  'Jugadores favoritos ilimitados',
  'Notificaciones instantáneas',
  'Widget en pantalla de inicio',
  'Sin anuncios',
  'Historial completo de partidos',
];

export default function PremiumScreen() {
  const { colors, spacing, radius, shadows } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
          <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}20` }]}>
            <Crown size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text, marginTop: spacing.md }]}>
            PadelTop Premium
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Desbloquea todo el potencial de la app
          </Text>
        </View>

        <View style={{ marginTop: spacing.lg, gap: 10 }}>
          {BENEFITS.map((benefit, index) => (
            <SlideUpView
              key={benefit}
              delay={index * 50}
              duration={300}
              style={[styles.benefitRow, { backgroundColor: colors.surfaceElevated, borderRadius: radius.md, ...shadows.sm }]}
            >
              <View style={[styles.checkWrap, { backgroundColor: `${colors.primary}20` }]}>
                <Check size={16} color={colors.primary} strokeWidth={3} />
              </View>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 }}>
                {benefit}
              </Text>
            </SlideUpView>
          ))}
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <SlideUpView
            delay={400}
            duration={350}
            style={[styles.planCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}
          >
            <View style={styles.planHeader}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Mensual</Text>
              <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>2,99 €</Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md }}>
              Cancela cuando quieras
            </Text>
            <Button title="Suscribirse" variant="primary" size="lg" />
          </SlideUpView>

          <SlideUpView
            delay={500}
            duration={350}
            style={[styles.planCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}
          >
            <View style={[styles.badgeRecommended, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#050505', fontSize: 10, fontWeight: '800' }}>RECOMENDADO</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Anual</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>19,99 €</Text>
                <Text style={{ color: colors.textMuted, fontSize: 14, textDecorationLine: 'line-through' }}>
                  35,88 €
                </Text>
              </View>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: spacing.md }}>
              Ahorra un 44 %
            </Text>
            <Button title="Suscribirse" variant="primary" size="lg" />
          </SlideUpView>
        </View>

        <Pressable style={{ marginTop: spacing.lg, alignSelf: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
            Restaurar compras
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 6,
    textAlign: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  checkWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  badgeRecommended: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
});
