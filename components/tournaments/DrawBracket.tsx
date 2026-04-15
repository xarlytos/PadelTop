import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useRef, useState } from 'react';
import { SlideUpView } from '../../src/utils/animations';
import { useTheme } from '../../src/theme';
import { getFlagEmoji } from '../../src/utils/flags.utils';
import { ChevronRight } from 'lucide-react-native';
import type { DrawMatch } from '../../src/mocks/tournamentDraw.mock';

interface DrawBracketProps {
  matches: DrawMatch[];
}

const ROUND_ORDER = ['1ª Ronda', '2ª Ronda', 'Dieciseisavos', 'Octavos', 'Cuartos', 'Semifinal', 'Final'];
const PAGE_WIDTH = 340;

function getRoundIndex(round: string) {
  const idx = ROUND_ORDER.indexOf(round);
  return idx === -1 ? 999 : idx;
}

function parseScoreSets(score?: string) {
  if (!score) return [];
  return score.split(' ').map((set) => {
    const parts = set.split('-');
    return { teamA: parts[0] || '-', teamB: parts[1] || '-' };
  });
}

export function DrawBracket({ matches }: DrawBracketProps) {
  const { colors, spacing, radius, shadows } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const roundsMap = new Map<string, DrawMatch[]>();
  matches.forEach((m) => {
    const list = roundsMap.get(m.round) || [];
    list.push(m);
    roundsMap.set(m.round, list);
  });

  const sortedRounds = Array.from(roundsMap.entries()).sort((a, b) => getRoundIndex(a[0]) - getRoundIndex(b[0]));

  const goToNext = () => {
    if (currentPage < sortedRounds.length - 1) {
      const next = currentPage + 1;
      scrollRef.current?.scrollTo({ x: next * PAGE_WIDTH, animated: true });
      setCurrentPage(next);
    }
  };

  const onScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const page = Math.round(x / PAGE_WIDTH);
    setCurrentPage(page);
  };

  return (
    <View style={{ marginTop: spacing.md }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
      >
        {sortedRounds.map(([round, roundMatches], roundIndex) => (
          <View key={round} style={{ width: PAGE_WIDTH, paddingRight: spacing.md }}>
            <Text style={[styles.roundTitle, { color: colors.textMuted, marginBottom: 12 }]}>
              {round} · {roundMatches.length} {roundMatches.length === 1 ? 'partido' : 'partidos'}
            </Text>

            <View style={{ gap: spacing.md }}>
              {roundMatches.map((match, matchIndex) => (
                <SlideUpView key={match.id} delay={roundIndex * 50 + matchIndex * 40} duration={300}>
                  <MatchCard match={match} />
                </SlideUpView>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {currentPage < sortedRounds.length - 1 && (
        <Pressable
          onPress={goToNext}
          style={[
            styles.nextButton,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
        >
          <ChevronRight size={20} color={colors.primary} />
        </Pressable>
      )}

      <View style={[styles.dots, { marginTop: spacing.md }]}>
        {sortedRounds.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              { backgroundColor: idx === currentPage ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function MatchCard({ match }: { match: DrawMatch }) {
  const { colors, radius, shadows } = useTheme();
  const sets = parseScoreSets(match.score);
  const isBye = match.teamB.players.length === 0 || match.teamB.players.every((p) => !p.id);

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.sm }]}>
      <TeamRow
        team={match.teamA}
        isWinner={match.winner === 'A'}
        sets={sets.map((s) => s.teamA)}
        colors={colors}
      />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      {isBye ? (
        <View style={styles.byeRow}>
          <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>BYE</Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, fontWeight: '600' }}>BYE</Text>
        </View>
      ) : (
        <TeamRow
          team={match.teamB}
          isWinner={match.winner === 'B'}
          sets={sets.map((s) => s.teamB)}
          colors={colors}
        />
      )}
    </View>
  );
}

function TeamRow({
  team,
  isWinner,
  sets,
  colors,
}: {
  team: { players: { name: string; countryCode?: string }[] };
  isWinner?: boolean;
  sets: string[];
  colors: any;
}) {
  return (
    <View style={styles.teamRow}>
      <View style={styles.teamLeft}>
        <View style={{ gap: 4 }}>
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
  roundTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    padding: 14,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
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
    paddingVertical: 8,
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
  nextButton: {
    position: 'absolute',
    right: 8,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
