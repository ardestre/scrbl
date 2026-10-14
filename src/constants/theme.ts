import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1D2240',
    textSecondary: '#5A6088',
    background: '#E9EEF7',
    surface: '#FFFFFF',
    surfaceAlt: '#F4F6FB',
    line: '#D8DDEA',
    accent: '#3550D2',
    accentSoft: '#E3E8FF',
    onAccent: '#FFFFFF',
    sun: '#FFB21E',
    berry: '#D6336C',
    leaf: '#2B8A3E',
  },
  dark: {
    text: '#EEF0FF',
    textSecondary: '#A4A9D2',
    background: '#101228',
    surface: '#1A1D3A',
    surfaceAlt: '#22264A',
    line: '#30356A',
    accent: '#8FA3FF',
    accentSoft: '#2A3170',
    onAccent: '#10122A',
    sun: '#FFC34D',
    berry: '#F06595',
    leaf: '#69DB7C',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

/** Drawing paper stays white in both themes, like real paper. */
export const Paper = '#FFFFFF';

/** Text on the sun-yellow kid bubbles is always dark, in both themes. */
export const OnSun = '#2A1E00';

export const Fonts = {
  display: Platform.select({ ios: 'ui-rounded', web: 'var(--font-rounded)', default: undefined }),
};

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
} as const;

export const Radius = {
  small: 12,
  medium: 18,
  large: 24,
  pill: 999,
} as const;

export const MaxContentWidth = 1100;

/** Width at which tablet layouts (two columns, side panels) switch on. */
export const WideBreakpoint = 760;
