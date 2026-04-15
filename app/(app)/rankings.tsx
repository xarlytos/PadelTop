import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../src/theme';
import { mockRankingsMale, mockRankingsFemale } from '../../src/mocks/rankings.mock';
import { fetchRankings } from '../../src/api/rankings.api';
import { CONFIG } from '../../src/constants/config';
import { RankingRow } from '../../components/rankings/RankingRow';
import { router } from 'expo-router';
import type { RankingEntry } from '../../src/types/ranking.types';

const TABS = [
  { key: 'male', label: 'Masculino' },
  { key: 'female', label: 'Femenino' },
] as const;

type Tab = (typeof TABS)[number]['key'];
const TAB_WIDTH = 140;

export default function RankingsScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('male');
  const [maleData, setMaleData] = useState<RankingEntry[]>(mockRankingsMale);
  const [femaleData, setFemaleData] = useState<RankingEntry[]>(mockRankingsFemale);
  const [loading, setLoading] = useState(false);

  const indicatorX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (CONFIG.USE_MOCKS) return;

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        await fetchRankings();
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onTabPress = (tab: Tab, index: number) => {
    setActiveTab(tab);
    Animated.spring(indicatorX, {
      toValue: index * TAB_WIDTH,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const data = activeTab === 'male' ? maleData : femaleData;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabsWrapper, { margin: spacing.md, backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.sm }]}>
        <View style={styles.tabs}>
          {TABS.map((tab, index) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onTabPress(tab.key, index)}
                style={[styles.tab, isActive && styles.tabActive]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? colors.text : colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
          <Animated.View
            style={[
              styles.tabIndicator,
              { backgroundColor: colors.surfaceHighlight },
              { transform: [{ translateX: indicatorX }] },
            ]}
          />
        </View>
      </View>

      {loading && (
        <ActivityIndicator style={{ marginTop: spacing.lg }} color={colors.primary} />
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
        {!loading && data.map((entry, index) => (
          <RankingRow
            key={entry.player.id}
            entry={entry}
            index={index}
            onPress={() => router.push(`/(app)/more/players/${entry.player.id}`)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsWrapper: {
    overflow: 'hidden',
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    position: 'relative',
  },
  tab: {
    width: TAB_WIDTH,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: TAB_WIDTH,
    borderRadius: 10,
  },
});
