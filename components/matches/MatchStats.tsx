import { View, Text, StyleSheet } from 'react-native';
import { FadeInView } from '../../src/utils/animations';
import { useTheme } from '../../src/theme';
import type { MatchStatsData } from '../../src/types/match.types';

interface MatchStatsProps {
  stats: MatchStatsData;
}

function parseValue(value: number | string): number {
  if (typeof value === 'number') return value;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function StatBar({
  label,
  valueA,
  valueB,
  colorA,
  colorB,
  suffix = '',
}: {
  label: string;
  valueA: number | string;
  valueB: number | string;
  colorA: string;
  colorB: string;
  suffix?: string;
}) {
  const { colors, radius, typography } = useTheme();

  const numA = parseValue(valueA);
  const numB = parseValue(valueB);
  const max = Math.max(numA, numB, 1);
  const pctA = (numA / max) * 100;
  const pctB = (numB / max) * 100;

  return (
    <FadeInView duration={400} style={styles.row}>
      <View style={styles.valuesTop}>
        <Text style={[styles.valueText, { color: colorA, textAlign: 'left' }]}>
          {valueA}{suffix}
        </Text>
        <Text style={[styles.labelText, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.valueText, { color: colorB, textAlign: 'right' }]}>
          {valueB}{suffix}
        </Text>
      </View>

      <View style={styles.bars}>
        <View style={[styles.barTrack, { backgroundColor: colors.surfaceHighlight, borderRadius: radius.full }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${pctA}%`,
                backgroundColor: colorA,
                borderRadius: radius.full,
                alignSelf: 'flex-start',
              },
            ]}
          />
        </View>

        <View style={[styles.barTrack, { backgroundColor: colors.surfaceHighlight, borderRadius: radius.full }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${pctB}%`,
                backgroundColor: colorB,
                borderRadius: radius.full,
                alignSelf: 'flex-start',
              },
            ]}
          />
        </View>
      </View>
    </FadeInView>
  );
}

export function MatchStats({ stats }: MatchStatsProps) {
  const { colors, spacing } = useTheme();

  const rows = [
    { label: 'Puntos ganados', valueA: stats.pointsWon.teamA, valueB: stats.pointsWon.teamB },
    { label: 'Errores no forzados', valueA: stats.unforcedErrors.teamA, valueB: stats.unforcedErrors.teamB },
    { label: 'Winners', valueA: stats.winners.teamA, valueB: stats.winners.teamB },
    { label: 'Dobles faltas', valueA: stats.doubleFaults.teamA, valueB: stats.doubleFaults.teamB },
    { label: 'Puntos de break', valueA: stats.breakPoints.teamA, valueB: stats.breakPoints.teamB },
    { label: '% 1er servicio', valueA: stats.firstServePercentage.teamA, valueB: stats.firstServePercentage.teamB, suffix: '%' },
    { label: 'Puntos ganados 1er saque', valueA: stats.firstServePointsWon.teamA, valueB: stats.firstServePointsWon.teamB, suffix: '%' },
    { label: 'Puntos ganados 2do saque', valueA: stats.secondServePointsWon.teamA, valueB: stats.secondServePointsWon.teamB, suffix: '%' },
  ];

  return (
    <View style={{ padding: spacing.md, gap: 20 }}>
      {rows.map((row) => (
        <StatBar
          key={row.label}
          label={row.label}
          valueA={row.valueA}
          valueB={row.valueB}
          suffix={row.suffix}
          colorA={colors.primary}
          colorB={colors.accent}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
  },
  valuesTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  labelText: {
    flex: 2,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  bars: {
    gap: 6,
  },
  barTrack: {
    height: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
});
