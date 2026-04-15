import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/theme';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: number;
  borderColor?: string;
}

export function Avatar({ name, imageUrl, size = 40, borderColor }: AvatarProps) {
  const { colors, radius } = useTheme();

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: borderColor ? 2 : 0,
            borderColor: borderColor || 'transparent',
          },
        ]}
      />
    );
  }

  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: borderColor ? 2 : 0,
          borderColor: borderColor || 'transparent',
          overflow: 'hidden',
        },
      ]}
    >
      <LinearGradient
        colors={['#2A2D36', '#1A1D24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={[styles.text, { fontSize: size * 0.38, color: colors.primaryLight }]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  text: {
    fontWeight: '800',
  },
});
