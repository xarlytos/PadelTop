import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type ThemeColors } from './colors';
import { typography, type Typography } from './typography';
import { spacing, type Spacing } from './spacing';
import { shadows, type Shadows } from './shadows';
import { radius, type Radius } from './radius';
import { useThemeStore } from '../store/themeStore';

export interface Theme {
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  shadows: Shadows;
  radius: Radius;
  isDark: boolean;
}

const ThemeContext = createContext<Theme>({
  colors: darkTheme,
  typography,
  spacing,
  shadows,
  radius,
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { theme: storedTheme } = useThemeStore();

  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    if (storedTheme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(storedTheme === 'dark');
    }
  }, [storedTheme, systemColorScheme]);

  const themeValue: Theme = {
    colors: isDark ? darkTheme : lightTheme,
    typography,
    spacing,
    shadows,
    radius,
    isDark,
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
