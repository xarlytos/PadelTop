import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SlideUpView } from '../../../src/utils/animations';
import { useTheme } from '../../../src/theme';
import { useAuthStore } from '../../../src/store/authStore';
import { Avatar } from '../../../components/common/Avatar';
import { router } from 'expo-router';
import { Settings, Heart, Crown, LogOut, ChevronRight, Bell } from 'lucide-react-native';

export default function ProfileScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const { user, logout } = useAuthStore();

  const displayName = user?.displayName ?? 'Invitado';
  const email = user?.email ?? 'No has iniciado sesión';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <SlideUpView duration={350}>
          <View style={[styles.headerCard, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
            <Avatar name={displayName} size={80} borderColor={colors.primary} />
            <Text style={[styles.name, { color: colors.text, marginTop: spacing.md }]}>
              {displayName}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              {email}
            </Text>
          </View>
        </SlideUpView>

        <SlideUpView duration={350} delay={100} style={{ marginTop: spacing.lg }}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MI CUENTA</Text>
          <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
            <MenuRow icon={Heart} label="Mis favoritos" onPress={() => router.push('/(app)/more/favorites')} />
            <MenuRow icon={Bell} label="Notificaciones" onPress={() => router.push('/(app)/more/notifications-settings')} />
            <MenuRow icon={Crown} label="Suscripción Premium" onPress={() => router.push('/(app)/more/premium')} isLast />
          </View>
        </SlideUpView>

        <SlideUpView duration={350} delay={200} style={{ marginTop: spacing.lg }}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PREFERENCIAS</Text>
          <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}>
            <MenuRow icon={Settings} label="Ajustes" onPress={() => router.push('/(app)/more/settings')} isLast />
          </View>
        </SlideUpView>

        {user && (
          <SlideUpView duration={350} delay={300} style={{ marginTop: spacing.lg }}>
            <Pressable
              onPress={logout}
              style={[styles.logoutButton, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, ...shadows.md }]}
            >
              <LogOut size={18} color={colors.error} />
              <Text style={{ color: colors.error, fontSize: 15, fontWeight: '700', marginLeft: 12 }}>
                Cerrar sesión
              </Text>
            </Pressable>
          </SlideUpView>
        )}
      </View>
    </ScrollView>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onPress,
  isLast,
}: {
  icon: typeof Settings;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.menuRow, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
    >
      <View style={styles.rowLeft}>
        <Icon size={18} color={colors.textSecondary} />
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
      </View>
      <ChevronRight size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    padding: 24,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  card: {
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
});
