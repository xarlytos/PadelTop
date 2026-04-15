import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../src/theme';

interface BadgeProps {
  text: string;
  color?: string;
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({ text, color, dot, pulse }: BadgeProps) {
  const { colors, radius } = useTheme();
  const bg = color ?? colors.primary;

  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [pulse]);

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderRadius: radius.sm }]}>
      {dot && pulse && (
        <Animated.View
          style={[
            styles.pulse,
            { backgroundColor: '#FFFFFF', opacity },
            { transform: [{ scale }] },
          ]}
        />
      )}
      {dot && <View style={[styles.dot, { backgroundColor: '#FFFFFF' }]} />}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  pulse: {
    position: 'absolute',
    left: 10,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
