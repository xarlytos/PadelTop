import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../src/theme';
import { getFlagEmoji } from '../../src/utils/flags.utils';

interface PlayerLike {
  name: string;
  countryCode?: string;
}

interface MatchResultCardProps {
  teamA: { players: PlayerLike[] };
  teamB: { players: PlayerLike[] };
  winner?: 'A' | 'B';
  score?: string;
  header?: React.ReactNode;
  onPress?: () => void;
}

function parseScoreSets(score?: string) {
  if (!score) return [];
  return score.split(' ').map((set) => {
    const parts = set.split('-');
    return { teamA: parts[0] || '-', teamB: parts[1] || '-' };
  });
}

export function MatchResultCard({ teamA, teamB, winner, score, header, onPress }: MatchResultCardProps) {
  const { colors, radius, shadows } = useTheme();
  const sets = parseScoreSets(score);
  const isBye = teamB.players.length === 0 || teamB.players.every((p) => !p.name);

  const content = (
    <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.sm }]}>
      {header && <View style={{ marginBottom: 10 }}>{header}</View>}

      <TeamRow team={teamA} isWinner={winner === 'A'} sets={sets.map((s) => s.teamA)} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {isBye ? (
        <View style={styles.byeRow}>
          <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>BYE</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>BYE</Text>
        </View>
      ) : (
        <TeamRow team={teamB} isWinner={winner === 'B'} sets={sets.map((s) => s.teamB)} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={{ width: '100%' }}>
        {content}
      </Pressable>
    );
  }

  return content;
}

function TeamRow({
  team,
  isWinner,
  sets,
}: {
  team: { players: PlayerLike[] };
  isWinner?: boolean;
  sets: string[];
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.teamRow}>
      <View style={styles.teamLeft}>
        <View style={{ gap: 2 }}>
          {team.players.map((p, i) => (
            <View key={i} style={styles.playerLine}>
              <Text style={{ fontSize: 12, marginRight: 6 }}>{getFlagEmoji(p.countryCode || '')}</Text>
              <Text
                style={[
                  styles.playerName,
                  { color: isWinner ? colors.text : colors.textSecondary },
                  isWinner && { fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {p.name}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.teamRight}>
        {isWinner && <View style={[styles.winnerDot, { backgroundColor: colors.success }]} />}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {sets.length > 0 ? (
            sets.map((set, idx) => (
              <Text key={idx} style={[styles.setText, { color: isWinner ? colors.text : colors.textSecondary }]}>
                {set}
              </Text>
            ))
          ) : (
            <Text style={[styles.setText, { color: colors.textMuted }]}>-</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 12,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  teamLeft: {
    flex: 1,
    paddingRight: 10,
  },
  playerLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  byeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  teamRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  winnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  setText: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 18,
    textAlign: 'center',
  },
});
