import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SlideUpView } from '../../src/utils/animations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { Avatar } from '../common/Avatar';
import { getFlagEmoji } from '../../src/utils/flags.utils';
import type { RankingEntry } from '../../src/types/ranking.types';

interface RankingRowProps {
  entry: RankingEntry;
  onPress?: () => void;
  index?: number;
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export function RankingRow({ entry, onPress, index = 0 }: RankingRowProps) {
  const { colors, spacing, radius, shadows } = useTheme();

  const change = entry.previousPosition ? entry.previousPosition - entry.position : 0;
  const isTop3 = entry.position <= 3;

  let ChangeIcon = Minus;
  let changeColor = colors.textMuted;
  let changeText = '-';

  if (change > 0) {
    ChangeIcon = TrendingUp;
    changeColor = colors.success;
    changeText = `+${change}`;
  } else if (change < 0) {
    ChangeIcon = TrendingDown;
    changeColor = colors.error;
    changeText = `${change}`;
  }

  return (
    <SlideUpView delay={index * 40} duration={300}>
      <Pressable
        onPress={onPress}
        style={[
          styles.row,
          {
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            marginBottom: spacing.sm,
            ...shadows.sm,
          },
        ]}
      >
        <View
          style={[
            styles.positionBadge,
            {
              backgroundColor: isTop3 ? `${MEDAL_COLORS[entry.position - 1]}20` : colors.surfaceHighlight,
              borderRadius: radius.full,
            },
          ]}
        >
          <Text
            style={[
              styles.positionText,
              { color: isTop3 ? MEDAL_COLORS[entry.position - 1] : colors.textSecondary },
            ]}
          >
            {entry.position}
          </Text>
        </View>

        <Avatar name={entry.player.name} imageUrl={entry.player.avatarUrl} size={42} />

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {entry.player.name}
          </Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {getFlagEmoji(entry.player.countryCode)} {entry.player.country}
          </Text>
        </View>

        <View style={styles.right}>
          <Text style={[styles.points, { color: colors.text }]}>
            {entry.points.toLocaleString()}
          </Text>
          <View style={styles.changeRow}>
            <ChangeIcon size={12} color={changeColor} strokeWidth={2.5} />
            <Text style={[styles.changeText, { color: changeColor }]}>{changeText}</Text>
          </View>
        </View>
      </Pressable>
    </SlideUpView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  positionBadge: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  positionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 14,
    fontWeight: '800',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
