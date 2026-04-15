import { Pressable, Text, StyleSheet, Animated, type PressableProps } from 'react-native';
import { useRef } from 'react';
import { useTheme } from '../../src/theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
}

export function Button({ title, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const { colors, radius } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
      ? colors.surfaceElevated
      : 'transparent';

  const textColor =
    variant === 'primary'
      ? '#050505'
      : variant === 'secondary'
      ? colors.text
      : colors.primary;

  const paddingVertical = size === 'lg' ? 16 : 14;

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable
        {...props}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.button,
          {
            backgroundColor,
            paddingVertical,
            borderRadius: radius.lg,
            opacity: props.disabled ? 0.5 : 1,
          },
        ]}
      >
        <Text style={[styles.text, { color: textColor, fontSize: size === 'lg' ? 17 : 16 }]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
