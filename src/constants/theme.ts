import '@/global.css';

import { Platform } from 'react-native';

/**
 * SCRBL palette: Shadow Grey #231F20, Tomato Jam #BB4430, Tropical Teal #7EBDC2,
 * Vanilla Custard #F3DFA2 and Linen #EFE6DD. Other values are tints and shades of these,
 * picked so text stays readable (at least 4.5:1 contrast).
 */
export const Palette = {
  shadowGrey: '#231F20',
  tomatoJam: '#BB4430',
  tropicalTeal: '#7EBDC2',
  vanillaCustard: '#F3DFA2',
  linen: '#EFE6DD',
} as const;

export const Colors = {
  light: {
    text: Palette.shadowGrey,
    textSecondary: '#5E5550',
    background: Palette.linen,
    surface: '#F7F1EA',
    surfaceAlt: Palette.linen,
    line: '#DCCFC2',
    accent: Palette.tomatoJam,
    accentSoft: '#F4D3CB',
    onAccent: '#FFFFFF',
    sun: Palette.vanillaCustard,
    berry: '#A3392A',
    leaf: Palette.tropicalTeal,
  },
  dark: {
    text: Palette.linen,
    textSecondary: '#B8ACA2',
    background: '#1A1718',
    surface: Palette.shadowGrey,
    surfaceAlt: '#2E2929',
    line: '#463D3B',
    accent: '#E2735F',
    accentSoft: '#5A2A22',
    onAccent: Palette.shadowGrey,
    sun: Palette.vanillaCustard,
    berry: '#E2735F',
    leaf: Palette.tropicalTeal,
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

/** Drawing paper stays white in both themes, like real paper. */
export const Paper = '#FFFFFF';

/** Text on the sun-yellow kid bubbles is always dark, in both themes. */
export const OnSun = Palette.shadowGrey;

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
