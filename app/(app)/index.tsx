import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SlideUpView } from '../../src/utils/animations';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/theme';
import { mockMatches } from '../../src/mocks/matches.mock';
import { mockRankingsMale, mockRankingsFemale } from '../../src/mocks/rankings.mock';
import { mockTournaments } from '../../src/mocks/tournaments.mock';
import { useFavoritesStore } from '../../src/store/favoritesStore';
import { MatchCard } from '../../components/matches/MatchCard';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { router } from 'expo-router';
import { getFlagEmoji } from '../../src/utils/flags.utils';
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Star, Play } from 'lucide-react-native';
import { MatchResultCard } from '../../components/matches/MatchResultCard';
import type { Match, Team } from '../../src/types';

function getTeamShortName(team: Team) {
  return team.players.map((p) => p.name.split(' ').pop()).join(' / ');
}

function formatTime(iso?: string) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function getMatchResultForFavorite(match: Match, favoriteIds: string[]) {
  const isTeamA = match.teamA.players.some((p) => favoriteIds.includes(p.id));
  const isTeamB = match.teamB.players.some((p) => favoriteIds.includes(p.id));
  if (!isTeamA && !isTeamB) return null;
  const mySets = isTeamA
    ? match.sets.reduce((acc, s) => acc + (s.teamA > s.teamB ? 1 : 0), 0)
    : match.sets.reduce((acc, s) => acc + (s.teamB > s.teamA ? 1 : 0), 0);
  const oppSets = isTeamA
    ? match.sets.reduce((acc, s) => acc + (s.teamB > s.teamA ? 1 : 0), 0)
    : match.sets.reduce((acc, s) => acc + (s.teamA > s.teamB ? 1 : 0), 0);
  const won = mySets > oppSets;
  const opponent = getTeamShortName(isTeamA ? match.teamB : match.teamA);
  return { won, mySets, oppSets, opponent };
}

function RankingMini({ entries, title, onPress }: { entries: typeof mockRankingsMale; title: string; onPress: () => void }) {
  const { colors, spacing, radius, shadows } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.rankingMini, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}
    >
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 }}>{title}</Text>
      {entries.slice(0, 3).map((entry) => {
        const change = entry.previousPosition ? entry.previousPosition - entry.position : 0;
        const changeColor = change > 0 ? colors.success : change < 0 ? colors.error : colors.textMuted;
        const ChangeIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
        return (
          <View key={entry.player.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '800', width: 18 }}>{entry.position}</Text>
            <Avatar name={entry.player.name} imageUrl={entry.player.avatarUrl} size={24} />
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 8 }}>
              <Text style={{ fontSize: 12, marginRight: 4 }}>{getFlagEmoji(entry.player.countryCode)}</Text>
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                {entry.player.name.split(' ').pop()}
              </Text>
            </View>
            <ChangeIcon size={12} color={changeColor} />
          </View>
        );
      })}
    </Pressable>
  );
}

export default function HomeScreen() {
  const { colors, spacing, radius, shadows, isDark } = useTheme();
  const { favorites } = useFavoritesStore();
  const favoriteIds = favorites.map((f) => f.id);

  const liveMatches = mockMatches.filter((m) => m.status === 'live');
  const upcomingMatches = mockMatches.filter((m) => m.status === 'upcoming');
  const finishedMatches = mockMatches.filter((m) => m.status === 'finished');

  const activeTournament = mockTournaments.find((t) => t.status === 'ongoing') || mockTournaments[0];

  const favoriteTodayMatches = upcomingMatches.filter((m) =>
    m.teamA.players.some((p) => favoriteIds.includes(p.id)) || m.teamB.players.some((p) => favoriteIds.includes(p.id))
  );

  const favoriteResults = finishedMatches
    .map((m) => ({ match: m, result: getMatchResultForFavorite(m, favoriteIds) }))
    .filter((r) => r.result) as { match: Match; result: NonNullable<ReturnType<typeof getMatchResultForFavorite>> }[];

  const tournamentUpcoming = upcomingMatches.filter((m) => m.tournamentId === activeTournament?.id);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[styles.greeting, { color: colors.text }]}>Hola, fan del pádel</Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary, marginTop: 4 }]}>
            Aquí tienes lo más importante del día
          </Text>
        </View>

        {/* 1. Hero: en directo */}
        {liveMatches.length > 0 && (
          <SlideUpView duration={400}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {liveMatches.map((match) => (
                <Pressable
                  key={match.id}
                  onPress={() => router.push(`/(app)/matches/${match.id}`)}
                  style={[styles.heroCard, { borderRadius: radius.lg, ...shadows.md, overflow: 'hidden' }]}
                >
                  <LinearGradient
                    colors={isDark ? ['#00A8CC22', '#0A0B10'] : ['#00D4FF15', colors.surfaceElevated]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={{ padding: 20 }}>
                    <View style={styles.heroBadgeRow}>
                      <Badge text="EN DIRECTO" color={colors.live} dot pulse />
                      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>{match.tournamentName}</Text>
                    </View>

                    <View style={styles.heroTeams}>
                      <View style={styles.heroTeam}>
                        <View style={styles.heroAvatars}>
                          {match.teamA.players.map((p, i) => (
                            <View key={p.id} style={[styles.heroAvatarWrap, { marginLeft: i > 0 ? -14 : 0 }]}>
                              <Avatar name={p.name} imageUrl={p.avatarUrl} size={48} borderColor={colors.background} />
                            </View>
                          ))}
                        </View>
                        <Text style={[styles.heroTeamName, { color: colors.text }]} numberOfLines={2}>
                          {getTeamShortName(match.teamA)}
                        </Text>
                        <Text style={[styles.heroFlags, { color: colors.textSecondary }]}>
                          {match.teamA.players.map((p) => getFlagEmoji(p.countryCode)).join(' ')}
                        </Text>
                      </View>

                      <View style={styles.heroScore}>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          {match.sets.map((set, idx) => (
                            <View key={idx} style={{ alignItems: 'center' }}>
                              <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>
                                {set.teamA}
                              </Text>
                              <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700' }}>
                                {set.teamB}
                              </Text>
                            </View>
                          ))}
                        </View>
                        {match.currentGame && (
                          <View style={[styles.gameBadge, { backgroundColor: `${colors.primary}25` }]}>
                            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '800' }}>
                              {match.currentGame.teamA} - {match.currentGame.teamB}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.heroTeam}>
                        <View style={styles.heroAvatars}>
                          {match.teamB.players.map((p, i) => (
                            <View key={p.id} style={[styles.heroAvatarWrap, { marginLeft: i > 0 ? -14 : 0 }]}>
                              <Avatar name={p.name} imageUrl={p.avatarUrl} size={48} borderColor={colors.background} />
                            </View>
                          ))}
                        </View>
                        <Text style={[styles.heroTeamName, { color: colors.text }]} numberOfLines={2}>
                          {getTeamShortName(match.teamB)}
                        </Text>
                        <Text style={[styles.heroFlags, { color: colors.textSecondary }]}>
                          {match.teamB.players.map((p) => getFlagEmoji(p.countryCode)).join(' ')}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: spacing.md, textAlign: 'center' }}>
                      {match.round} · Duración: {Math.floor((match.durationMinutes || 0) / 60)}h {(match.durationMinutes || 0) % 60}m
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </SlideUpView>
        )}

        {/* 2. Tus favoritos hoy */}
        <SlideUpView duration={350} style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Tus favoritos hoy</Text>
            {favoriteTodayMatches.length > 0 && (
              <Pressable onPress={() => router.push('/(app)/matches')}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Ver todos</Text>
              </Pressable>
            )}
          </View>

          {favorites.length === 0 ? (
            <Pressable
              onPress={() => router.push('/(app)/more/favorites')}
              style={[styles.emptyFavoritesCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}
            >
              <View style={[styles.starWrap, { backgroundColor: `${colors.accent}20` }]}>
                <Star size={20} color={colors.accent} />
              </View>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: spacing.sm }}>
                Sigue a tus jugadores
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                Recibe alertas cuando jueguen y no te pierdas nada
              </Text>
            </Pressable>
          ) : favoriteTodayMatches.length === 0 ? (
            <View style={[styles.emptyFavoritesCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Tus favoritos no juegan hoy</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {favoriteTodayMatches.map((match) => {
                const favsInMatch = [...match.teamA.players, ...match.teamB.players].filter((p) => favoriteIds.includes(p.id));
                const fav = favsInMatch[0];
                const isTeamA = match.teamA.players.some((p) => p.id === fav.id);
                const opponent = getTeamShortName(isTeamA ? match.teamB : match.teamA);
                return (
                  <Pressable
                    key={match.id}
                    onPress={() => router.push(`/(app)/matches/${match.id}`)}
                    style={[styles.favCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>{match.tournamentName}</Text>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 6 }}>{formatTime(match.startTime)}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                      <Avatar name={fav.name} imageUrl={fav.avatarUrl} size={28} />
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                        {getFlagEmoji(fav.countryCode)} vs {opponent}
                      </Text>
                    </View>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{match.round}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </SlideUpView>

        {/* 3. Resultados recientes */}
        {favoriteResults.length > 0 && (
          <SlideUpView duration={350} style={{ marginTop: spacing.lg }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Resultados de hoy</Text>
            {favoriteResults.map(({ match, result }, index) => (
              <SlideUpView key={match.id} delay={index * 60} duration={300}>
                <MatchResultCard
                  teamA={match.teamA}
                  teamB={match.teamB}
                  winner={match.winner === 'A' ? 'A' : 'B'}
                  score={match.score}
                  onPress={() => router.push(`/(app)/matches/${match.id}`)}
                  header={
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 }}>
                        {match.tournamentName} · {match.round}
                      </Text>
                      <View
                        style={[
                          styles.resultBadge,
                          { backgroundColor: result.won ? `${colors.success}20` : `${colors.error}20` },
                        ]}
                      >
                        <Text style={{ color: result.won ? colors.success : colors.error, fontSize: 10, fontWeight: '800' }}>
                          {result.won ? 'Victoria' : 'Derrota'}
                        </Text>
                      </View>
                    </View>
                  }
                />
              </SlideUpView>
            ))}
          </SlideUpView>
        )}

        {/* 4. Próximos partidos del torneo activo */}
        {tournamentUpcoming.length > 0 && (
          <SlideUpView duration={350} style={{ marginTop: spacing.lg }}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Próximos en {activeTournament?.name}</Text>
              <Pressable onPress={() => router.push(`/(app)/tournaments/${activeTournament?.id}`)}>
                <ChevronRight size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            {tournamentUpcoming.map((match, index) => (
              <MatchCard key={match.id} match={match} index={index} onPress={() => router.push(`/(app)/matches/${match.id}`)} />
            ))}
          </SlideUpView>
        )}

        {/* 5. Mini-rankings */}
        <SlideUpView duration={350} style={{ marginTop: spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ranking actualizado</Text>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <RankingMini
              entries={mockRankingsMale}
              title="MASCULINO"
              onPress={() => router.push('/(app)/rankings')}
            />
            <RankingMini
              entries={mockRankingsFemale}
              title="FEMENINO"
              onPress={() => router.push('/(app)/rankings')}
            />
          </View>
        </SlideUpView>

        {/* 6. Highlight del día */}
        <SlideUpView duration={350} style={{ marginTop: spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Highlight del día</Text>
          <Pressable
            style={[
              styles.highlightCard,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.lg,
                ...shadows.md,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.highlightThumb}
            >
              <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
            </LinearGradient>
            <View style={{ padding: spacing.md, flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }} numberOfLines={2}>
                La entrevista con Tapia tras clasificar a cuartos
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Premier Padel · 1:24</Text>
            </View>
          </Pressable>
        </SlideUpView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  heroCard: {
    width: 360,
    padding: 20,
    marginRight: 16,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTeam: {
    flex: 1,
    alignItems: 'center',
  },
  heroAvatars: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  heroAvatarWrap: {
    borderRadius: 24,
  },
  heroTeamName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroFlags: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  heroScore: {
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 100,
  },
  gameBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  emptyFavoritesCard: {
    padding: 20,
    alignItems: 'center',
  },
  starWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favCard: {
    width: 160,
    padding: 14,
    marginRight: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rankingMini: {
    flex: 1,
    padding: 12,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  highlightThumb: {
    width: 100,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
