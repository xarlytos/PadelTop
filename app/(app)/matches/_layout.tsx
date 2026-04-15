import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { HeaderTitle } from '../../../components/common/HeaderTitle';
import { HeaderProfileButton } from '../../../components/common/HeaderProfileButton';

export default function MatchesLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Partidos' }} />
      <Stack.Screen name="[matchId]" options={{ title: 'Detalle del partido' }} />
    </Stack>
  );
}
