import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SlideUpView } from '../../../src/utils/animations';
import { useTheme } from '../../../src/theme';
import { useThemeStore, type ThemeMode } from '../../../src/store/themeStore';
import { useAuthStore } from '../../../src/store/authStore';
import { router } from 'expo-router';
import { STRINGS } from '../../../src/constants/strings';
import { Moon, Sun, Monitor, ChevronRight, LogOut, Bell, Crown } from 'lucide-react-native';

const THEME_OPTIONS: { key: ThemeMode; label: string; icon: typeof Moon }[] = [
  { key: 'dark', label: STRINGS.darkMode, icon: Moon },
  { key: 'light', label: STRINGS.lightMode, icon: Sun },
  { key: 'system', label: STRINGS.systemMode, icon: Monitor },
];

export default function SettingsScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const { theme, setTheme } = useThemeStore();
  const { logout, user } = useAuthStore();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.md }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: spacing.md }}>
          Ajustes
        </Text>

        <SlideUpView delay={0} duration={300} style={[styles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 }}>
            CUENTA
          </Text>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 6 }}>
            {user?.displayName ?? 'Invitado'}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
            {user?.email ?? 'No has iniciado sesión'}
          </Text>
        </SlideUpView>

        <Pressable
          onPress={() => router.push('/(app)/more/premium')}
          style={[styles.rowCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, marginTop: spacing.md, ...shadows.md }]}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}18` }]}>
              <Crown size={18} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>Suscripción Premium</Text>
          </View>
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Ver planes</Text>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: spacing.lg }]}>APARIENCIA</Text>
        <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
          {THEME_OPTIONS.map((option, idx) => {
            const Icon = option.icon;
            const isLast = idx === THEME_OPTIONS.length - 1;
            return (
              <Pressable
                key={option.key}
                onPress={() => setTheme(option.key)}
                style={[styles.themeRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <View style={styles.rowLeft}>
                  <Icon size={18} color={colors.textSecondary} />
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{option.label}</Text>
                </View>
                {theme === option.key && (
                  <View style={[styles.check, { backgroundColor: colors.primary }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => router.push('/(app)/more/notifications-settings')}
          style={[styles.rowCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, marginTop: spacing.md, ...shadows.md }]}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.accent}18` }]}>
              <Bell size={18} color={colors.accent} />
            </View>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>{STRINGS.notifications}</Text>
          </View>
          <ChevronRight size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={logout}
          style={[styles.rowCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, marginTop: spacing.md, ...shadows.md }]}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.error}18` }]}>
              <LogOut size={18} color={colors.error} />
            </View>
            <Text style={{ color: colors.error, fontSize: 15, fontWeight: '700' }}>{STRINGS.logout}</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
});
