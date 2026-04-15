import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../../src/theme';
import { STRINGS } from '../../src/constants/strings';
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const { colors, spacing } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    setSent(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text, marginBottom: spacing.lg }]}>
        Recuperar contraseña
      </Text>

      {sent ? (
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          Si el email existe, te hemos enviado instrucciones.
        </Text>
      ) : (
        <>
          <TextInput
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          />

          <Pressable
            onPress={handleSend}
            style={[styles.button, { backgroundColor: colors.primary, marginTop: spacing.md }]}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Enviar instrucciones</Text>
          </Pressable>
        </>
      )}

      <Pressable onPress={() => router.back()} style={{ marginTop: spacing.xl }}>
        <Text style={{ color: colors.textSecondary }}>Volver</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
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
