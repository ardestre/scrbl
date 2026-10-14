import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: c.accent, background: c.surface, card: c.surface, text: c.text, border: c.line },
      }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="creation/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="book/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
