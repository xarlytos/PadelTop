import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { SlideUpView } from '../../../src/utils/animations';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../src/theme';
import { mockTournaments } from '../../../src/mocks/tournaments.mock';
import { fetchTournaments } from '../../../src/api/tournaments.api';
import { CONFIG } from '../../../src/constants/config';
import { router } from 'expo-router';
import { Trophy, MapPin, Calendar, Users } from 'lucide-react-native';
import type { Tournament, TournamentStatus } from '../../../src/types/tournament.types';

const TABS: { key: TournamentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'ongoing', label: 'En curso' },
  { key: 'upcoming', label: 'Próximos' },
  { key: 'finished', label: 'Finalizados' },
];

const TIER_COLORS: Record<string, string> = {
  Major: '#FFD740',
  P1: '#00D4FF',
  P2: '#7B61FF',
  Master: '#FF6B00',
  Open: '#8B929D',
};

const STATUS_LABELS: Record<string, string> = {
  ongoing: 'En curso',
  upcoming: 'Próximo',
  finished: 'Finalizado',
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  if (sameMonth) {
    return `${s.getDate()} - ${e.getDate()} ${monthNames[s.getMonth()]}. ${s.getFullYear()}`;
  }
  return `${s.getDate()} ${monthNames[s.getMonth()]}. - ${e.getDate()} ${monthNames[e.getMonth()]}. ${s.getFullYear()}`;
}

export default function TournamentsScreen() {
  const { colors, spacing, radius, shadows, isDark } = useTheme();
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);
  const [activeTab, setActiveTab] = useState<TournamentStatus | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const indicatorX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (CONFIG.USE_MOCKS) return;

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const data = await fetchTournaments();
        if (!cancelled) setTournaments(data);
      } catch {
        if (!cancelled) setTournaments(mockTournaments);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const featured = tournaments.find((t) => t.status === 'ongoing') || tournaments.find((t) => t.status === 'upcoming') || tournaments[0];
  const filtered = activeTab === 'all' ? tournaments : tournaments.filter((t) => t.status === activeTab);
  const rest = filtered.filter((t) => t.id !== featured?.id);

  const onTabPress = (tab: TournamentStatus | 'all', index: number) => {
    setActiveTab(tab);
    Animated.spring(indicatorX, {
      toValue: index * 90,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        {/* Hero torneo destacado */}
        {featured && (
          <SlideUpView duration={400}>
            <Pressable
              onPress={() => router.push(`/(app)/tournaments/${featured.id}`)}
              style={[styles.heroCard, { borderRadius: radius.lg, ...shadows.md, overflow: 'hidden' }]}
            >
              <LinearGradient
                colors={isDark ? ['#00A8CC22', '#14161F'] : ['#00D4FF15', colors.surfaceElevated]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ padding: 20 }}>
                <View style={styles.heroBadgeRow}>
                  <View style={[styles.tierBadge, { backgroundColor: `${TIER_COLORS[featured.tier]}25` }]}>
                    <Text style={[styles.tierText, { color: TIER_COLORS[featured.tier] }]}>{featured.tier}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800' }}>
                      {STATUS_LABELS[featured.status].toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.heroName, { color: colors.text, marginTop: spacing.sm }]}>{featured.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '600' }}>{featured.circuit}</Text>

                <View style={{ marginTop: spacing.md, gap: 8 }}>
                  <View style={styles.metaRow}>
                    <MapPin size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{featured.city}, {featured.country}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Calendar size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      {formatDateRange(featured.startDate, featured.endDate)}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Users size={14} color={colors.textSecondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                      {featured.pairsCount} parejas · {featured.surface} · {featured.prizeMoney}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </SlideUpView>
        )}

        {/* Tabs */}
        <View style={[styles.tabsWrapper, { borderBottomColor: colors.border, marginTop: spacing.lg }]}>
          <View style={styles.tabs}>
            {TABS.map((tab, index) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable key={tab.key} onPress={() => onTabPress(tab.key, index)} style={{ width: 90, alignItems: 'center' }}>
                  <Text style={[styles.tabText, { color: isActive ? colors.primary : colors.textSecondary }]}>{tab.label}</Text>
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

        {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />}

        {/* Lista de torneos */}
        {!loading && rest.length === 0 && filtered.length <= 1 ? (
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg }}>No hay torneos en esta sección.</Text>
        ) : (
          <View style={{ marginTop: spacing.md, gap: spacing.md }}>
            {rest.map((tournament, index) => (
              <SlideUpView key={tournament.id} delay={index * 50} duration={350}>
                <Pressable
                  onPress={() => router.push(`/(app)/tournaments/${tournament.id}`)}
                  style={[
                    styles.card,
                    { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.tierBadgeSmall, { backgroundColor: `${TIER_COLORS[tournament.tier]}20` }]}>
                      <Text style={[styles.tierTextSmall, { color: TIER_COLORS[tournament.tier] }]}>{tournament.tier}</Text>
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700' }}>{STATUS_LABELS[tournament.status]}</Text>
                  </View>

                  <Text style={[styles.cardName, { color: colors.text, marginTop: 8 }]}>{tournament.name}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{tournament.circuit}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '500' }}>
                      {formatDateRange(tournament.startDate, tournament.endDate)}
                    </Text>
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{tournament.prizeMoney}</Text>
                  </View>
                </Pressable>
              </SlideUpView>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    position: 'relative',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabsWrapper: {
    borderBottomWidth: 1,
  },
  tabs: {
    flexDirection: 'row',
    position: 'relative',
    alignSelf: 'center',
    width: TABS.length * 90,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 14,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    marginLeft: 15,
    width: 60,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  tierTextSmall: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});
