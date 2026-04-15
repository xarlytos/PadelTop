import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { STRINGS } from '../../src/constants/strings';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  const { colors, spacing } = useTheme();
  const { setMockUser } = useAuthStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, marginBottom: spacing.sm }]}>
        {STRINGS.welcomeTitle}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, marginBottom: spacing.xxl }]}>
        {STRINGS.welcomeSubtitle}
      </Text>

      <Pressable
        onPress={() => router.push('/(auth)/login')}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{STRINGS.login}</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/(auth)/register')}
        style={[styles.button, { backgroundColor: colors.surfaceElevated, marginTop: spacing.md }]}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>{STRINGS.register}</Text>
      </Pressable>

      <Pressable
        onPress={setMockUser}
        style={{ marginTop: spacing.xl }}
      >
        <Text style={{ color: colors.primary }}>Entrar como invitado</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
