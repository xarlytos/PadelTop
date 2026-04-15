import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SlideUpView } from '../../src/utils/animations';
import { useTheme } from '../../src/theme';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { getFlagEmoji } from '../../src/utils/flags.utils';
import type { Match } from '../../src/types/match.types';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  index?: number;
}

export function MatchCard({ match, onPress, index = 0 }: MatchCardProps) {
  const { colors, spacing, shadows, radius, typography } = useTheme();

  const teamAPlayers = match.teamA.players;
  const teamBPlayers = match.teamB.players;

  const teamAName = teamAPlayers.map((p) => p.name.split(' ').pop()).join(' / ');
  const teamBName = teamBPlayers.map((p) => p.name.split(' ').pop()).join(' / ');

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <SlideUpView delay={index * 60} duration={400}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            marginBottom: spacing.md,
            ...shadows.md,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.tournament, { color: colors.textMuted }]}>
            {match.tournamentName} · {match.round}
          </Text>
          {isLive && <Badge text="LIVE" color={colors.live} dot pulse />}
          {isFinished && <Badge text="FINAL" color={colors.textMuted} />}
        </View>

        <View style={styles.content}>
          <View style={styles.teamSide}>
            <View style={styles.avatars}>
              {teamAPlayers.map((p, i) => (
                <View key={p.id} style={[styles.avatarWrap, { marginLeft: i > 0 ? -10 : 0 }]}>
                  <Avatar name={p.name} imageUrl={p.avatarUrl} size={36} borderColor={colors.surfaceElevated} />
                </View>
              ))}
            </View>
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
              {teamAName}
            </Text>
            <Text style={[styles.flags, { color: colors.textSecondary }]}>
              {teamAPlayers.map((p) => getFlagEmoji(p.countryCode)).join(' ')}
            </Text>
          </View>

          <View style={styles.scoreSide}>
            {match.sets.length > 0 ? (
              <View style={styles.setsRow}>
                {match.sets.map((set, idx) => (
                  <Text key={idx} style={[styles.setText, { color: colors.text }]}>
                    {set.teamA}-{set.teamB}
                    {idx < match.sets.length - 1 && (
                      <Text style={{ color: colors.textMuted }}>  </Text>
                    )}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={[styles.vsText, { color: colors.textMuted }]}>VS</Text>
            )}

            {isLive && match.currentGame && (
              <View style={[styles.gameBadge, { backgroundColor: `${colors.primary}20` }]}>
                <Text style={[styles.gameText, { color: colors.primary }]}>
                  {match.currentGame.teamA} - {match.currentGame.teamB}
                </Text>
              </View>
            )}
          </View>

          <View style={[styles.teamSide, styles.teamSideRight]}>
            <View style={styles.avatars}>
              {teamBPlayers.map((p, i) => (
                <View key={p.id} style={[styles.avatarWrap, { marginLeft: i > 0 ? -10 : 0 }]}>
                  <Avatar name={p.name} imageUrl={p.avatarUrl} size={36} borderColor={colors.surfaceElevated} />
                </View>
              ))}
            </View>
            <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
              {teamBName}
            </Text>
            <Text style={[styles.flags, { color: colors.textSecondary }]}>
              {teamBPlayers.map((p) => getFlagEmoji(p.countryCode)).join(' ')}
            </Text>
          </View>
        </View>
      </Pressable>
    </SlideUpView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tournament: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamSide: {
    flex: 1,
    alignItems: 'flex-start',
  },
  teamSideRight: {
    alignItems: 'flex-end',
  },
  avatars: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  avatarWrap: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  flags: {
    fontSize: 12,
    marginTop: 3,
  },
  scoreSide: {
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 90,
  },
  setsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '700',
  },
  gameBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gameText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
