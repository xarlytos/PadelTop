import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../src/theme';

export function HeaderTitle() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: colors.text }]}>
        Padel
        <Text style={{ color: colors.primary }}>Top</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
