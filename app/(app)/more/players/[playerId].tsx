import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { SlideUpView } from '../../../../src/utils/animations';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../src/theme';
import { mockPlayers } from '../../../../src/mocks/players.mock';
import { mockPlayerSeasonStats, mockPlayerTournamentHistory } from '../../../../src/mocks/playerStats.mock';
import { mockMatches } from '../../../../src/mocks/matches.mock';
import { FavoriteButton } from '../../../../components/players/FavoriteButton';
import { Avatar } from '../../../../components/common/Avatar';
import { useFavoritesStore } from '../../../../src/store/favoritesStore';
import { CONFIG } from '../../../../src/constants/config';
import { fetchPlayerById } from '../../../../src/api/players.api';
import { getFlagEmoji } from '../../../../src/utils/flags.utils';
import type { Player } from '../../../../src/types/player.types';

export default function PlayerDetailScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();
  const { colors, spacing, radius, shadows, isDark } = useTheme();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const { addFavorite, removeFavorite, isFavorite, canAddMore } = useFavoritesStore();

  useEffect(() => {
    const fallbackPlayer = Object.values(mockPlayers).find((p) => p.id === playerId) || null;

    if (CONFIG.USE_MOCKS) {
      setPlayer(fallbackPlayer);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const data = await fetchPlayerById(playerId);
        if (!cancelled) setPlayer(data);
      } catch {
        if (!cancelled) setPlayer(fallbackPlayer);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Jugador no encontrado</Text>
      </View>
    );
  }

  const favorite = isFavorite(player.id);
  const canAdd = canAddMore();
  const seasonStats = mockPlayerSeasonStats[player.id];
  const history = mockPlayerTournamentHistory[player.id] ?? [];
  const lastMatches = mockMatches.filter(
    (m) =>
      m.teamA.players.some((p) => p.id === player.id) || m.teamB.players.some((p) => p.id === player.id)
  );

  const handleToggleFavorite = async () => {
    if (favorite) {
      await removeFavorite(player.id);
    } else {
      await addFavorite(player);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ['#0F1115', '#050505'] : ['#FFFFFF', '#F8F9FB']}
        style={[styles.header, { borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }]}
      >
        <Avatar name={player.name} imageUrl={player.avatarUrl} size={100} borderColor={colors.background} />

        <Text style={[styles.name, { color: colors.text, marginTop: spacing.md }]}>{player.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '500' }}>
          {getFlagEmoji(player.countryCode)} {player.country}
        </Text>

        <View style={{ marginTop: spacing.md }}>
          <FavoriteButton
            isFavorite={favorite}
            onPress={handleToggleFavorite}
            disabled={!favorite && !canAdd}
          />
        </View>

        {!favorite && !canAdd && (
          <Text style={{ color: colors.live, fontSize: 12, marginTop: 8, fontWeight: '600' }}>
            Límite de 2 favoritos en plan gratuito
          </Text>
        )}

        <View style={[styles.statsRow, { marginTop: spacing.lg }]}>
          <StatBox label="Ranking" value={`#${player.ranking ?? '-'}`} />
          <StatBox label="Puntos" value={`${(player.points ?? 0).toLocaleString()}`} />
          <StatBox label="Edad" value={`${player.age ?? '-'}`} />
        </View>
      </LinearGradient>

      {seasonStats && (
        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Estadísticas de temporada</Text>
          <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
            <StatRow label="Partidos jugados" value={`${seasonStats.matchesPlayed}`} />
            <StatRow label="Partidos ganados" value={`${seasonStats.matchesWon}`} />
            <StatRow label="Títulos" value={`${seasonStats.titles}`} />
            <StatRow label="Finales" value={`${seasonStats.finals}`} />
            <StatRow label="Aces" value={`${seasonStats.aces}`} />
            <StatRow label="Dobles faltas" value={`${seasonStats.doubleFaults}`} />
            <StatRow label="% puntos ganados" value={`${seasonStats.pointsWonPercentage}%`} />
            <StatRow label="Breaks convertidos" value={seasonStats.breakPointsConverted} isLast />
          </View>
        </View>
      )}

      <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Últimos partidos</Text>
        {lastMatches.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>No hay partidos recientes.</Text>
        ) : (
          lastMatches.map((match, index) => {
            const isTeamA = match.teamA.players.some((p) => p.id === player.id);
            const opponentPlayers = isTeamA ? match.teamB.players : match.teamA.players;
            const opponent = opponentPlayers.map((p) => p.name.split(' ').pop()).join(' / ');
            const opponentFlags = opponentPlayers.map((p) => getFlagEmoji(p.countryCode)).join(' ');
            const result = isTeamA
              ? match.sets.reduce((acc, s) => acc + (s.teamA > s.teamB ? 1 : 0), 0)
              : match.sets.reduce((acc, s) => acc + (s.teamB > s.teamA ? 1 : 0), 0);
            const opponentResult = isTeamA
              ? match.sets.reduce((acc, s) => acc + (s.teamB > s.teamA ? 1 : 0), 0)
              : match.sets.reduce((acc, s) => acc + (s.teamA > s.teamB ? 1 : 0), 0);
            const won = result > opponentResult;

            return (
              <SlideUpView key={match.id} delay={index * 50} duration={300}>
                <View
                  style={[
                    styles.matchCard,
                    { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.sm, marginBottom: spacing.sm },
                  ]}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 }}>
                    {match.tournamentName} · {match.round}
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 4 }}>
                    vs {opponentFlags} {opponent}
                  </Text>
                  <Text style={{ color: won ? colors.success : colors.error, fontSize: 14, marginTop: 6, fontWeight: '800' }}>
                    {won ? 'Victoria' : 'Derrota'} {result}-{opponentResult}
                  </Text>
                </View>
              </SlideUpView>
            );
          })
        )}
      </View>

      {history.length > 0 && (
        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg, paddingBottom: spacing.xl }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Historial de torneos</Text>
          {history.map((t, idx) => (
            <View
              key={idx}
              style={[
                styles.cardSmall,
                { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.sm, marginBottom: spacing.sm },
              ]}
            >
              <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>
                {t.tournamentName} {t.year}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 3 }}>
                {t.result} {t.partner ? `· con ${t.partner}` : ''}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  const { colors, radius, shadows } = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.sm }]}>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function StatRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500' }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 90,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  card: {
    padding: 16,
  },
  cardSmall: {
    padding: 14,
  },
  matchCard: {
    padding: 14,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
});
