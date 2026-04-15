import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { HeaderTitle } from '../../../components/common/HeaderTitle';
import { HeaderProfileButton } from '../../../components/common/HeaderProfileButton';

export default function MoreLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.text,
        headerTitleAlign: 'center',
        headerTitle: () => <HeaderTitle />,
        headerRight: () => <HeaderProfileButton />,
      }}
    >
      <Stack.Screen name="favorites" options={{ title: 'Favoritos' }} />
      <Stack.Screen name="premium" options={{ title: 'Premium' }} />
      <Stack.Screen name="settings" options={{ title: 'Ajustes' }} />
      <Stack.Screen name="notifications-settings" options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="players/[playerId]" options={{ title: 'Jugador' }} />
      <Stack.Screen name="profile" options={{ title: 'Perfil' }} />
    </Stack>
  );
}
