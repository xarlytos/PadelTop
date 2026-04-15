import { View, Text } from 'react-native';
import { useTheme } from '../src/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600' }}>Pantalla no encontrada</Text>
    </View>
  );
}
