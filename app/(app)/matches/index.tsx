import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '../../../src/theme';
import { mockMatches } from '../../../src/mocks/matches.mock';
import { MatchCard } from '../../../components/matches/MatchCard';
import { MatchResultCard } from '../../../components/matches/MatchResultCard';
import { SlideUpView } from '../../../src/utils/animations';
import { router } from 'expo-router';
import { fetchMatches, fetchLiveMatches } from '../../../src/api/matches.api';
import { CONFIG } from '../../../src/constants/config';
import type { Match } from '../../../src/types/match.types';

function formatMatchTime(iso?: string) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatMatchDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default function MatchesScreen() {
  const { colors, spacing, shadows, radius } = useTheme();
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (CONFIG.USE_MOCKS) return;

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const [live, all] = await Promise.all([fetchLiveMatches(), fetchMatches()]);
        const merged = [...live, ...all.filter((m) => !live.some((l) => l.id === m.id))];
        if (!cancelled) setMatches(merged);
      } catch {
        if (!cancelled) setMatches(mockMatches);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const liveMatches = matches.filter((m) => m.status === 'live').sort((a, b) => new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime());
  const finishedMatches = matches.filter((m) => m.status === 'finished').sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime());
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming').sort((a, b) => new Date(a.startTime || 0).getTime() - new Date(b.startTime || 0).getTime());

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && (
        <View style={{ paddingTop: 40 }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      )}

      {!loading && (
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
          {liveMatches.length === 0 && finishedMatches.length === 0 && upcomingMatches.length === 0 && (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl }}>
              No hay partidos disponibles
            </Text>
          )}

          {/* En directo */}
          {liveMatches.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <View style={styles.sectionHeader}>
                <View style={[styles.liveDot, { backgroundColor: colors.live }]} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>En directo</Text>
              </View>
              {liveMatches.map((match, index) => (
                <SlideUpView key={match.id} delay={index * 60} duration={350}>
                  <MatchCard match={match} index={index} onPress={() => router.push(`/(app)/matches/${match.id}`)} />
                </SlideUpView>
              ))}
            </View>
          )}

          {/* Resultados */}
          {finishedMatches.length > 0 && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.sm }]}>Resultados</Text>
              {finishedMatches.map((match, index) => {
                const teamAWon = match.sets.reduce((a, s) => a + (s.teamA > s.teamB ? 1 : 0), 0) >
                  match.sets.reduce((a, s) => a + (s.teamB > s.teamA ? 1 : 0), 0);
                return (
                  <SlideUpView key={match.id} delay={index * 60} duration={350}>
                    <MatchResultCard
                      teamA={match.teamA}
                      teamB={match.teamB}
                      winner={teamAWon ? 'A' : 'B'}
                      score={match.sets.map((s) => `${s.teamA}-${s.teamB}`).join(' ')}
                      onPress={() => router.push(`/(app)/matches/${match.id}`)}
                      header={
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 }}>
                            {match.tournamentName} · {match.round}
                          </Text>
                          <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '700' }}>
                            {formatMatchDate(match.startTime)}
                          </Text>
                        </View>
                      }
                    />
                  </SlideUpView>
                );
              })}
            </View>
          )}

          {/* Próximos partidos */}
          {upcomingMatches.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.sm }]}>Próximos partidos</Text>
              {upcomingMatches.map((match, index) => (
                <SlideUpView key={match.id} delay={index * 60} duration={350}>
                  <Pressable
                    onPress={() => router.push(`/(app)/matches/${match.id}`)}
                    style={[
                      styles.upcomingCard,
                      { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 }}>
                        {match.tournamentName} · {match.round}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                          {formatMatchDate(match.startTime)}
                        </Text>
                        <View style={[styles.timeBadge, { backgroundColor: `${colors.primary}20` }]}>
                          <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
                            {formatMatchTime(match.startTime)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.teamsRow}>
                      <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                        {match.teamA.players.map((p) => p.name.split(' ').pop()).join(' / ')}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '700' }}>VS</Text>
                      <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
                        {match.teamB.players.map((p) => p.name.split(' ').pop()).join(' / ')}
                      </Text>
                    </View>
                  </Pressable>
                </SlideUpView>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  upcomingCard: {
    padding: 16,
    marginBottom: 12,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  teamName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
