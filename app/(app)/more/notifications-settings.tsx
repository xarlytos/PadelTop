import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../../../src/theme';

export default function NotificationsSettingsScreen() {
  const { colors, spacing } = useTheme();
  const [settings, setSettings] = useState({
    matchStart: true,
    scoreChanges: true,
    tournamentDraws: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.md }}>
        <SettingRow
          label="Inicio de partido de favoritos"
          value={settings.matchStart}
          onToggle={() => toggle('matchStart')}
          colors={colors}
        />
        <SettingRow
          label="Cambios de marcador"
          value={settings.scoreChanges}
          onToggle={() => toggle('scoreChanges')}
          colors={colors}
        />
        <SettingRow
          label="Nuevos torneos disponibles"
          value={settings.tournamentDraws}
          onToggle={() => toggle('tournamentDraws')}
          colors={colors}
        />
      </View>
    </ScrollView>
  );
}

function SettingRow({
  label,
  value,
  onToggle,
  colors,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  colors: any;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 10 }]}
    >
      <Text style={{ color: colors.text, fontSize: 15 }}>{label}</Text>
      <View
        style={[
          styles.toggle,
          { backgroundColor: value ? colors.primary : colors.border },
        ]}
      >
        <View
          style={[
            styles.knob,
            {
              backgroundColor: '#FFFFFF',
              transform: [{ translateX: value ? 20 : 0 }],
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
