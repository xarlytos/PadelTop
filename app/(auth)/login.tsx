import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { STRINGS } from '../../src/constants/strings';
import { router } from 'expo-router';
import { Button } from '../../components/common/Button';

export default function LoginScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await login(email, password);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={{ width: '100%', paddingHorizontal: 24 }}>
        <Text style={[styles.heading, { color: colors.text }]}>{STRINGS.login}</Text>
        <Text style={[styles.subheading, { color: colors.textSecondary, marginBottom: spacing.xl }]}>
          Bienvenido de vuelta, fan del pádel
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>EMAIL</Text>
          <TextInput
            placeholder="tu@email.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { color: colors.text }]}
          />

          <Text style={[styles.label, { color: colors.textMuted, marginTop: spacing.md }]}>CONTRASEÑA</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { color: colors.text }]}
          />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginTop: spacing.sm }}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        </View>

        <Button
          title={isLoading ? 'Cargando...' : STRINGS.login}
          onPress={handleLogin}
          disabled={isLoading}
          variant="primary"
          size="lg"
          style={{ marginTop: spacing.lg }}
        />

        <Pressable onPress={() => router.back()} style={{ marginTop: spacing.xl, alignSelf: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: '500' }}>Volver</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 16,
    marginTop: 6,
  },
  card: {
    padding: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    fontSize: 15,
    fontWeight: '600',
  },
});
