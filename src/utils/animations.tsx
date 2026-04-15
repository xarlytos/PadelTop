import { useEffect, useRef, type ReactNode } from 'react';
import { Animated } from 'react-native';

interface FadeInViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

export function FadeInView({ children, delay = 0, duration = 300, style }: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration]);

  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
}

interface SlideUpViewProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  style?: any;
}

export function SlideUpView({ children, delay = 0, duration = 350, style }: SlideUpViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, duration]);

  return <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}
