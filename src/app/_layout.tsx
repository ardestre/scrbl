import { Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const c = Colors[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const [fontsLoaded, fontError] = useFonts({ Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });
  // Wait for the rounded font so headings don't jump; if it fails to load, carry on with the system font.
  if (!fontsLoaded && !fontError) return null;
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: c.accent, background: c.surface, card: c.surface, text: c.text, border: c.line },
      }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(kid)" />
        <Stack.Screen name="parent" />
        <Stack.Screen name="profile/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="creation/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="book/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
