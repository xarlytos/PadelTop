import { View, type ViewProps } from 'react-native';
import { useTheme } from '../../src/theme';

export function Card({ children, style, ...props }: ViewProps) {
  const { colors, radius, shadows } = useTheme();

  return (
    <View
      {...props}
      style={[
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: radius.lg,
          padding: 16,
          ...shadows.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
