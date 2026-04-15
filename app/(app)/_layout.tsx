import { Tabs } from 'expo-router';
import { Home, Trophy, BarChart3, Menu, Circle } from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { mockMatches } from '../../src/mocks/matches.mock';
import { HeaderTitle } from '../../components/common/HeaderTitle';
import { HeaderProfileButton } from '../../components/common/HeaderProfileButton';

export default function AppLayout() {
  const { colors } = useTheme();
  const liveCount = mockMatches.filter((m) => m.status === 'live').length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Partidos',
          tabBarIcon: ({ color, size }) => <Circle size={size} color={color} />,
          tabBarBadge: liveCount > 0 ? liveCount : undefined,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: 'Torneos',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="rankings"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Más',
          tabBarIcon: ({ color, size }) => <Menu size={size} color={color} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
