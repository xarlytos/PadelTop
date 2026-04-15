import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { ThemeProvider } from '../src/theme';
import { useAuthStore } from '../src/store/authStore';
import { useFavoritesStore } from '../src/store/favoritesStore';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const { isAuthenticated, init } = useAuthStore();
  const { init: initFavorites } = useFavoritesStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      initFavorites();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const timeout = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/welcome');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(app)');
      }
      setIsReady(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, segments, navigationState]);

  if (!navigationState?.key || !isReady) {
    return (
      <ThemeProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <Slot />
    </ThemeProvider>
  );
}
