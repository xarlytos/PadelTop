import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../src/theme';
import { mockMatches } from '../../../src/mocks/matches.mock';
import { mockMatchStats } from '../../../src/mocks/matchStats.mock';
import { mockMatchPoints } from '../../../src/mocks/matchPoints.mock';
import { MatchStats } from '../../../components/matches/MatchStats';
import { Avatar } from '../../../components/common/Avatar';
import { getFlagEmoji } from '../../../src/utils/flags.utils';
import { CONFIG } from '../../../src/constants/config';
import { fetchMatchById, fetchMatchStats, fetchMatchPoints } from '../../../src/api/matches.api';
import { Clock, ChevronLeft, Bell } from 'lucide-react-native';
import type { Match, MatchStatsData, PointEvent } from '../../../src/types/match.types';
import type { Player } from '../../../src/types/player.types';

const TABS = ['Resumen', 'Estadísticas', 'H2H'] as const;
type Tab = (typeof TABS)[number];

function formatTime(iso?: string) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatShortDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPlayerName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  const firstInitial = parts[0].charAt(0).toUpperCase();
  const rest = parts.slice(1).join(' ');
  return `${firstInitial}. ${rest}`;
}

function getPlayerDisplayLabel(player: Player) {
  const seed = player.seed;
  if (seed) return `${player.name} (${seed})`;
  if (player.ranking) return `${player.name} (${player.ranking})`;
  return player.name;
}

function getPlayerShortLabel(player: Player) {
  const seed = player.seed;
  const name = formatPlayerName(player.name);
  if (seed) return `${name} (${seed})`;
  if (player.ranking) return `${name} (${player.ranking})`;
  return name;
}

function formatDuration(minutes?: number) {
  if (minutes === undefined || minutes === null) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export default function MatchDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { colors, spacing, radius, shadows } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [activeTab, setActiveTab] = useState<Tab>('Resumen');
  const [match, setMatch] = useState<Match | null>(null);
  const [stats, setStats] = useState<MatchStatsData | null>(null);
  const [points, setPoints] = useState<PointEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const indicatorX = useRef(new Animated.Value(0)).current;
  const tabOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fallbackMatch = mockMatches.find((m) => m.id === matchId) || null;
    const fallbackStats = mockMatchStats[matchId] || null;
    const fallbackPoints = mockMatchPoints[matchId] ?? [];

    if (CONFIG.USE_MOCKS) {
      setMatch(fallbackMatch);
      setStats(fallbackStats);
      setPoints(fallbackPoints);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const [m, s, p] = await Promise.all([
          fetchMatchById(matchId),
          fetchMatchStats(matchId),
          fetchMatchPoints(matchId),
        ]);
        if (!cancelled) {
          setMatch(m);
          setStats(s);
          setPoints(p);
        }
      } catch {
        if (!cancelled) {
          setMatch(fallbackMatch);
          setStats(fallbackStats);
          setPoints(fallbackPoints);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const onTabPress = useCallback((tab: Tab, index: number) => {
    setActiveTab(tab);
    Animated.spring(indicatorX, {
      toValue: index * (TAB_WIDTH + TAB_GAP),
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
    tabOpacity.setValue(0.6);
    Animated.timing(tabOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const setsWonA = match?.sets.reduce((a, s) => a + (s.teamA > s.teamB ? 1 : 0), 0) ?? 0;
  const setsWonB = match?.sets.reduce((a, s) => a + (s.teamB > s.teamA ? 1 : 0), 0) ?? 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!match) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Partido no encontrado</Text>
      </SafeAreaView>
    );
  }

  const teamAPlayers = match.teamA.players;
  const teamBPlayers = match.teamB.players;
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  const cardBg = isDark ? '#1C1E2A' : colors.surfaceElevated;
  const scoreBg = '#2D3A12';
  const scoreText = '#A3E635';
  const servingBar = '#A3E635';
  const inactiveBar = '#3A3F4D';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => router.back()} style={styles.topHeaderButton}>
          <ChevronLeft size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.topHeaderTitle, { color: colors.text }]}>Detalle</Text>
        <Pressable style={styles.topHeaderButton}>
          <Bell size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tournament & Teams Card */}
        <View
          style={[
            styles.mainCard,
            { backgroundColor: cardBg, borderRadius: radius.xl, marginHorizontal: spacing.md, marginTop: spacing.sm },
          ]}
        >
          {/* Tournament header */}
          <View style={styles.tournamentHeader}>
            <View style={styles.tournamentLeft}>
              {match.tournamentLogo ? (
                <View style={[styles.logoBox, { backgroundColor: isDark ? '#0F1115' : '#F0F2F5' }]}>
                  <Text style={[styles.logoText, { color: colors.text }]}>PREMIER</Text>
                  <Text style={[styles.logoSub, { color: colors.primary }]}>PADEL</Text>
                </View>
              ) : (
                <View style={[styles.logoBox, { backgroundColor: isDark ? '#0F1115' : '#F0F2F5' }]}>
                  <Text style={[styles.logoText, { color: colors.text }]}>PREMIER</Text>
                  <Text style={[styles.logoSub, { color: colors.primary }]}>PADEL</Text>
                </View>
              )}
            </View>

            <View style={styles.tournamentCenter}>
              <Text style={[styles.tournamentName, { color: colors.text }]} numberOfLines={1}>
                {match.tournamentName}
              </Text>
              <View style={styles.locationRow}>
                <Text style={{ fontSize: 14 }}>{getFlagEmoji(match.locationFlag || match.teamA.players[0]?.countryCode || 'EG')}</Text>
                <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                  {match.location || match.teamA.players[0]?.country}
                </Text>
              </View>
            </View>

            <View style={styles.tournamentRight}>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatShortDate(match.startTime)}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? '#252836' : colors.border }]} />

          {/* Teams & Score */}
          <View style={styles.teamsRow}>
            {/* Team A */}
            <View style={styles.teamBlock}>
              <View style={styles.avatarsGroup}>
                {teamAPlayers.map((p, i) => (
                  <View key={p.id} style={[styles.avatarWrap, i > 0 && { marginLeft: -14 }]}>
                    <Avatar name={p.name} imageUrl={p.avatarUrl} size={52} borderColor={cardBg} />
                  </View>
                ))}
              </View>
            </View>

            {/* Score */}
            <View style={[styles.scorePill, { backgroundColor: scoreBg }]}>
              <Text style={[styles.scorePillText, { color: scoreText }]}>
                {setsWonA} - {setsWonB}
              </Text>
            </View>

            {/* Team B */}
            <View style={styles.teamBlock}>
              <View style={styles.avatarsGroup}>
                {teamBPlayers.map((p, i) => (
                  <View key={p.id} style={[styles.avatarWrap, i > 0 && { marginLeft: -14 }]}>
                    <Avatar name={p.name} imageUrl={p.avatarUrl} size={52} borderColor={cardBg} />
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Player names */}
          <View style={styles.namesRow}>
            <View style={styles.nameBlock}>
              {teamAPlayers.map((p) => (
                <Text key={p.id} style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                  {getPlayerDisplayLabel(p)}
                </Text>
              ))}
            </View>
            <View style={styles.nameBlock}>
              {teamBPlayers.map((p) => (
                <Text key={p.id} style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
                  {getPlayerDisplayLabel(p)}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsWrapper, { marginHorizontal: spacing.md, marginTop: spacing.lg }]}>
          <View style={[styles.tabsContainer, { backgroundColor: cardBg, borderRadius: radius.xl }]}>
            <View style={styles.tabs}>
              {TABS.map((label, index) => {
                const isActive = activeTab === label;
                return (
                  <Pressable
                    key={label}
                    onPress={() => onTabPress(label, index)}
                    style={styles.tabPressable}
                  >
                    <Text style={[styles.tabText, { color: isActive ? colors.text : colors.textSecondary }]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
              <Animated.View
                style={[
                  styles.tabIndicator,
                  { backgroundColor: colors.primary },
                  { transform: [{ translateX: indicatorX }] },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Tab Content */}
        <Animated.View key={activeTab} style={[styles.tabContent, { opacity: tabOpacity }]}>
          {activeTab === 'Resumen' && (
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: cardBg, borderRadius: radius.xl, marginHorizontal: spacing.md, marginTop: spacing.lg },
              ]}
            >
              {/* Summary header */}
              <View style={styles.summaryHeader}>
                <View style={styles.summaryHeaderLeft}>
                  <View style={[styles.liveDot, { backgroundColor: isLive ? colors.live : colors.primary }]} />
                  <View style={[styles.roundBadge, { backgroundColor: isDark ? '#252836' : colors.border }]}>
                    <Text style={[styles.roundBadgeText, { color: colors.text }]}>{match.round}</Text>
                  </View>
                </View>
                {isLive && match.durationMinutes !== undefined && (
                  <View style={styles.summaryHeaderRight}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={[styles.durationText, { color: colors.textSecondary }]}>
                      {formatDuration(match.durationMinutes)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Score rows */}
              <View style={styles.scoreRows}>
                {/* Team A row */}
                <View style={styles.scoreRow}>
                  <View style={[styles.serveIndicator, { backgroundColor: match.server === 'A' ? servingBar : inactiveBar }]} />
                  <View style={styles.scoreRowContent}>
                    <View style={styles.scoreRowNames}>
                      {teamAPlayers.map((p) => (
                        <Text key={p.id} style={[styles.scoreRowName, { color: colors.text }]}>
                          {getPlayerShortLabel(p)}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.scoreRowValues}>
                      <View style={[styles.pointPill, { backgroundColor: scoreBg }]}>
                        <Text style={[styles.pointPillText, { color: scoreText }]}>
                          {match.currentGameScore?.teamA ?? match.currentGame?.teamA ?? 0}
                        </Text>
                      </View>
                      <Text style={[styles.gameText, { color: colors.text }]}>
                        {match.currentSetGames?.teamA ?? match.currentGame?.teamA ?? 0}
                        {match.currentSetGames?.tieBreakA !== undefined ? (
                          <Text style={styles.superscript}> {match.currentSetGames.tieBreakA}</Text>
                        ) : null}
                      </Text>
                      <Text style={[styles.setText, { color: colors.textSecondary }]}>{setsWonA}</Text>
                    </View>
                  </View>
                </View>

                {/* Team B row */}
                <View style={styles.scoreRow}>
                  <View style={[styles.serveIndicator, { backgroundColor: match.server === 'B' ? servingBar : inactiveBar }]} />
                  <View style={styles.scoreRowContent}>
                    <View style={styles.scoreRowNames}>
                      {teamBPlayers.map((p) => (
                        <Text key={p.id} style={[styles.scoreRowName, { color: colors.text }]}>
                          {getPlayerShortLabel(p)}
                        </Text>
                      ))}
                    </View>
                    <View style={styles.scoreRowValues}>
                      <View style={[styles.pointPill, { backgroundColor: scoreBg }]}>
                        <Text style={[styles.pointPillText, { color: scoreText }]}>
                          {match.currentGameScore?.teamB ?? match.currentGame?.teamB ?? 0}
                        </Text>
                      </View>
                      <Text style={[styles.gameText, { color: colors.text }]}>
                        {match.currentSetGames?.teamB ?? match.currentGame?.teamB ?? 0}
                        {match.currentSetGames?.tieBreakB !== undefined ? (
                          <Text style={styles.superscript}> {match.currentSetGames.tieBreakB}</Text>
                        ) : null}
                      </Text>
                      <Text style={[styles.setText, { color: colors.textSecondary }]}>{setsWonB}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'Estadísticas' && stats && <MatchStats stats={stats} />}
          {activeTab === 'Estadísticas' && !stats && (
            <Text style={{ color: colors.textSecondary, marginTop: spacing.lg, textAlign: 'center' }}>
              Estadísticas no disponibles para este partido.
            </Text>
          )}
          {activeTab === 'H2H' && (
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 15 }}>
                Historial de enfrentamientos próximamente...
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TAB_WIDTH = 90;
const TAB_GAP = 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(120,120,128,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  mainCard: {
    padding: 16,
  },
  tournamentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tournamentLeft: {
    flex: 0,
  },
  logoBox: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  logoSub: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: -2,
  },
  tournamentCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tournamentRight: {
    flex: 0,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
  },
  avatarsGroup: {
    flexDirection: 'row',
  },
  avatarWrap: {
    borderRadius: 26,
  },
  scorePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  scorePillText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  namesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  nameBlock: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  tabsWrapper: {
    alignItems: 'center',
  },
  tabsContainer: {
    padding: 4,
    alignSelf: 'center',
  },
  tabs: {
    flexDirection: 'row',
    position: 'relative',
    alignSelf: 'center',
    width: TABS.length * TAB_WIDTH,
  },
  tabPressable: {
    width: TAB_WIDTH,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    marginLeft: (TAB_WIDTH - 56) / 2,
    width: 56,
    height: 3,
    borderRadius: 2,
  },
  tabContent: {
    minHeight: 300,
    marginTop: 8,
  },
  summaryCard: {
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  roundBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roundBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  summaryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  scoreRows: {
    gap: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serveIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  scoreRowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreRowNames: {
    gap: 2,
  },
  scoreRowName: {
    fontSize: 15,
    fontWeight: '500',
  },
  scoreRowValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pointPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 38,
    alignItems: 'center',
  },
  pointPillText: {
    fontSize: 16,
    fontWeight: '700',
  },
  gameText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
  },
  setText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  superscript: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    color: '#9AA3B2',
  },
});
