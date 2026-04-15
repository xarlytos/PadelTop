import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SlideUpView } from '../../../src/utils/animations';
import { useTheme } from '../../../src/theme';
import { useFavoritesStore } from '../../../src/store/favoritesStore';
import { mockMatches } from '../../../src/mocks/matches.mock';
import { router } from 'expo-router';
import { STRINGS } from '../../../src/constants/strings';
import { Avatar } from '../../../components/common/Avatar';
import { getFlagEmoji } from '../../../src/utils/flags.utils';

export default function FavoritesScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const { favorites } = useFavoritesStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: spacing.sm }}>
          {STRINGS.favorites}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 15, marginBottom: spacing.md }}>
          Tus jugadores seguidos y sus próximos partidos
        </Text>

        {favorites.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md },
            ]}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center' }}>
              Aún no sigues a ningún jugador.{'\n'}Ve a un perfil y pulsa "Seguir".
            </Text>
          </View>
        ) : (
          <>
            {favorites.map((player, index) => {
              const playerMatches = mockMatches.filter(
                (m) =>
                  m.teamA.players.some((p) => p.id === player.id) ||
                  m.teamB.players.some((p) => p.id === player.id)
              );
              const lastMatch = playerMatches.filter((m) => m.status === 'finished').pop();
              const nextMatch = playerMatches.find((m) => m.status === 'upcoming');

              return (
                <SlideUpView key={player.id} delay={index * 60} duration={350}>
                  <Pressable
                    onPress={() => router.push(`/(app)/more/players/${player.id}`)}
                    style={[
                      styles.playerCard,
                      { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md },
                    ]}
                  >
                    <View style={styles.playerHeader}>
                      <Avatar name={player.name} imageUrl={player.avatarUrl} size={48} />
                      <View style={styles.playerInfo}>
                        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                          {player.name}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                          {getFlagEmoji(player.countryCode)} {player.country} · Ranking #{player.ranking ?? '-'}
                        </Text>
                      </View>
                    </View>

                    {lastMatch && (
                      <View style={styles.matchInfo}>
                        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                          ÚLTIMO RESULTADO
                        </Text>
                        <Text style={{ color: colors.text, fontSize: 13, marginTop: 2 }}>
                          {lastMatch.tournamentName} · {lastMatch.round}
                        </Text>
                      </View>
                    )}

                    {nextMatch && (
                      <View style={styles.matchInfo}>
                        <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
                          PRÓXIMO PARTIDO
                        </Text>
                        <Text style={{ color: colors.text, fontSize: 13, marginTop: 2 }}>
                          {nextMatch.tournamentName} · {nextMatch.round}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </SlideUpView>
              );
            })}

            {favorites.length >= 2 && (
              <Pressable
                onPress={() => router.push('/(app)/more/premium')}
                style={[
                  styles.premiumBanner,
                  { backgroundColor: colors.primary, borderRadius: radius.lg, marginTop: spacing.lg },
                ]}
              >
                <Text style={{ color: '#050505', fontSize: 15, fontWeight: '800' }}>
                  Desbloquea favoritos ilimitados con Premium
                </Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  playerCard: {
    padding: 16,
    marginBottom: 12,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  matchInfo: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  premiumBanner: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
