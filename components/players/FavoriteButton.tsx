import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { useRef } from 'react';
import { Heart } from 'lucide-react-native';
import { useTheme } from '../../src/theme';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function FavoriteButton({ isFavorite, onPress, disabled }: FavoriteButtonProps) {
  const { colors, radius } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, friction: 5, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: isFavorite ? colors.live : colors.primary,
            borderRadius: radius.lg,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <Heart size={16} color="#050505" fill={isFavorite ? '#050505' : 'transparent'} />
        <Text style={[styles.text, { color: '#050505' }]}>
          {isFavorite ? 'Dejar de seguir' : 'Seguir'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
  },
});
