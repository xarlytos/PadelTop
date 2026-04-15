import { Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { Avatar } from './Avatar';
import { User } from 'lucide-react-native';

export function HeaderProfileButton() {
  const { colors, radius } = useTheme();
  const { user } = useAuthStore();

  return (
    <Pressable
      onPress={() => router.push('/(app)/more/profile')}
      style={[
        styles.button,
        { backgroundColor: colors.surfaceHighlight, borderRadius: radius.full },
      ]}
    >
      {user ? (
        <Avatar name={user.displayName} size={32} borderColor={colors.primary} />
      ) : (
        <User size={18} color={colors.textSecondary} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
});
