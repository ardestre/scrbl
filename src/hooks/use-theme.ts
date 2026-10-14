import { useWindowDimensions } from 'react-native';

import { Colors, ThemeColors, WideBreakpoint } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}

/** True on tablets and wide windows, where screens use two columns. */
export function useIsWide() {
  const { width } = useWindowDimensions();
  return width >= WideBreakpoint;
}
