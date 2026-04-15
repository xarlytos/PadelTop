import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { SlideUpView } from '../../../src/utils/animations';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../src/theme';
import { mockTournaments } from '../../../src/mocks/tournaments.mock';
import { mockTournamentData } from '../../../src/mocks/tournamentData.mock';
import { DrawBracket } from '../../../components/tournaments/DrawBracket';
import { CONFIG } from '../../../src/constants/config';
import { fetchTournamentById } from '../../../src/api/tournaments.api';
import { MapPin, Calendar, Trophy, Users, DollarSign } from 'lucide-react-native';
import type { Tournament } from '../../../src/types/tournament.types';

const TABS = ['Cuadro', 'Participantes', 'Info'] as const;
type Tab = (typeof TABS)[number];
const TAB_WIDTH = 100;

const TIER_COLORS: Record<string, string> = {
  Major: '#FFD740',
  P1: '#00D4FF',
  P2: '#7B61FF',
  Master: '#FF6B00',
  Open: '#8B929D',
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${s.getDate()} ${monthNames[s.getMonth()]} - ${e.getDate()} ${monthNames[e.getMonth()]} · ${s.getFullYear()}`;
}

export default function TournamentDetailScreen() {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const { colors, spacing, radius, shadows, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('Cuadro');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);

  const indicatorX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fallbackTournament = mockTournaments.find((t) => t.id === tournamentId) || null;

    if (CONFIG.USE_MOCKS) {
      setTournament(fallbackTournament);
      if (fallbackTournament?.category === 'female') setGender('female');
      return;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const data = await fetchTournamentById(tournamentId);
        if (!cancelled) {
          setTournament(data);
          if (data?.category === 'female') setGender('female');
        }
      } catch {
        if (!cancelled) {
          setTournament(fallbackTournament);
          if (fallbackTournament?.category === 'female') setGender('female');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  const onTabPress = (tab: Tab, index: number) => {
    setActiveTab(tab);
    Animated.spring(indicatorX, {
      toValue: index * TAB_WIDTH,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const data = mockTournamentData[tournamentId];
  const drawMatches = data?.draws[gender] ?? [];
  const participants = data?.participants[gender] ?? [];

  const showGenderToggle = true;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Torneo no encontrado</Text>
      </View>
    );
  }

  const tierColor = TIER_COLORS[tournament.tier] || colors.primary;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header del torneo */}
      <View style={[styles.header, { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' }]}>
        <LinearGradient
          colors={isDark ? ['#00A8CC15', '#0A0B10'] : ['#00D4FF10', colors.background]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={{ padding: spacing.md, paddingTop: spacing.lg, alignItems: 'center' }}>
          <View style={[styles.tierBadge, { backgroundColor: `${tierColor}25` }]}>
            <Text style={[styles.tierText, { color: tierColor }]}>{tournament.tier}</Text>
          </View>

          <Text style={[styles.title, { color: colors.text, marginTop: spacing.sm }]}>{tournament.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '600' }}>{tournament.circuit}</Text>

          {showGenderToggle && (
            <View style={[styles.genderToggle, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, marginTop: spacing.md }]}>
              <Pressable
                onPress={() => setGender('male')}
                style={[
                  styles.genderButton,
                  gender === 'male' && { backgroundColor: colors.primary, borderRadius: radius.lg },
                ]}
              >
                <Text style={{ color: gender === 'male' ? '#050505' : colors.text, fontSize: 13, fontWeight: '700' }}>Masculino</Text>
              </Pressable>
              <Pressable
                onPress={() => setGender('female')}
                style={[
                  styles.genderButton,
                  gender === 'female' && { backgroundColor: colors.primary, borderRadius: radius.lg },
                ]}
              >
                <Text style={{ color: gender === 'female' ? '#050505' : colors.text, fontSize: 13, fontWeight: '700' }}>Femenino</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsWrapper, { borderBottomColor: colors.border, marginTop: spacing.lg }]}>
        <View style={styles.tabs}>
          {TABS.map((label, index) => {
            const isActive = activeTab === label;
            return (
              <Pressable key={label} onPress={() => onTabPress(label, index)} style={{ width: TAB_WIDTH, alignItems: 'center' }}>
                <Text style={[styles.tabText, { color: isActive ? colors.primary : colors.textSecondary }]}>
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

      {/* Contenido por tab */}
      <View key={`${activeTab}-${gender}`} style={{ minHeight: 300, paddingHorizontal: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.md }}>
        {activeTab === 'Cuadro' && (
          drawMatches.length > 0 ? (
            <DrawBracket matches={drawMatches} />
          ) : (
            <Text style={{ color: colors.textSecondary, marginTop: spacing.lg, textAlign: 'center' }}>
              El cuadro aún no está disponible.
            </Text>
          )
        )}

        {activeTab === 'Participantes' && (
          <View style={{ paddingTop: spacing.md }}>
            {participants.length === 0 ? (
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                Lista de participantes no disponible.
              </Text>
            ) : (
              <View style={[styles.participantsGrid, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.sm, padding: spacing.md }]}>
                {participants.map((p, idx) => (
                  <SlideUpView key={idx} delay={idx * 20} duration={250}>
                    <View style={styles.participantRow}>
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{p}</Text>
                    </View>
                  </SlideUpView>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'Info' && (
          <View style={{ paddingTop: spacing.md }}>
            <SlideUpView duration={350}>
              <View style={[styles.infoCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
                <InfoItem icon={<MapPin size={18} color={colors.primary} />} label="Ubicación" value={`${tournament.city}, ${tournament.country}`} />
                <InfoItem icon={<Calendar size={18} color={colors.primary} />} label="Fechas" value={formatDateRange(tournament.startDate, tournament.endDate)} />
                <InfoItem icon={<Trophy size={18} color={colors.primary} />} label="Superficie" value={tournament.surface} />
                <InfoItem icon={<DollarSign size={18} color={colors.primary} />} label="Premio" value={tournament.prizeMoney} />
                <InfoItem icon={<Users size={18} color={colors.primary} />} label="Participantes" value={`${tournament.pairsCount} parejas`} isLast />
              </View>
            </SlideUpView>

            <SlideUpView duration={350} delay={100} style={{ marginTop: spacing.lg }}>
              <View style={[styles.infoCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
                <InfoItem label="Temporada" value={`${tournament.season}`} isLast />
                <InfoItem
                  label="Categoría"
                  value={tournament.category === 'both' ? 'Masculino / Femenino' : tournament.category === 'male' ? 'Masculino' : 'Femenino'}
                  isLast
                />
              </View>
            </SlideUpView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function InfoItem({ icon, label, value, isLast }: { icon?: React.ReactNode; label: string; value: string; isLast?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoItem, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {icon}
        <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500' }}>{label}</Text>
      </View>
      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  genderToggle: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  genderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabsWrapper: {
    borderBottomWidth: 1,
  },
  tabs: {
    flexDirection: 'row',
    position: 'relative',
    alignSelf: 'center',
    width: TABS.length * TAB_WIDTH,
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
    marginLeft: (TAB_WIDTH - 60) / 2,
    width: 60,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  participantsGrid: {
    gap: 10,
  },
  participantRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  infoCard: {
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
});
