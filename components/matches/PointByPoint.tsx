import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../src/theme';
import type { PointEvent } from '../../src/types/match.types';

interface PointByPointProps {
  points: PointEvent[];
}

export function PointByPoint({ points }: PointByPointProps) {
  const { colors, spacing } = useTheme();

  if (points.length === 0) {
    return (
      <View style={{ padding: spacing.md }}>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          No hay datos de punto a punto disponibles.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: spacing.md }}>
      {points.map((point, index) => {
        const isLast = index === points.length - 1;
        return (
          <View key={point.id} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: point.winner === 'A' ? colors.primary : colors.live }]} />
            {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
            <View style={styles.content}>
              <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                Set {point.setIndex + 1} · Juego {point.gameIndex + 1} · Punto {point.pointNumber}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                {point.description}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                Marcado antes: {point.scoreBefore} · Saca: {point.server === 'A' ? 'Pareja A' : 'Pareja B'}
              </Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: 12,
  },
  line: {
    position: 'absolute',
    left: 4,
    top: 20,
    bottom: -16,
    width: 2,
  },
  content: {
    flex: 1,
  },
});
