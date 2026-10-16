import '@/global.css';

/** The base colours: Linen paper and Shadow Grey ink. */
export const Palette = {
  shadowGrey: '#231F20',
  linen: '#EFE6DD',
} as const;

/**
 * Bright sticker colours for tiles, tabs and badges. Text on any of them is always ink
 * (Shadow Grey), which keeps at least 6:1 contrast in both themes.
 */
export const Pop = {
  pink: '#FF8AD8',
  lime: '#D7F25B',
  purple: '#A98BFF',
  orange: '#FF8A5B',
  sky: '#8EC9FF',
  mint: '#8EE3A8',
  yellow: '#FFE15A',
  lavender: '#D9CCFF',
} as const;

export type PopName = keyof typeof Pop;

/** Ink for outlines, chunky shadows and text on Pop colours. */
export const Ink = Palette.shadowGrey;

export const Colors = {
  light: {
    text: Ink,
    textSecondary: '#5E5550',
    background: Palette.linen,
    surface: Palette.linen,
    /** Cards and panels: white paper on the Linen desk. */
    surfaceAlt: '#FFFFFF',
    line: '#D6C7B9',
    /** Outlines and hard shadows on cards and buttons. */
    ink: Ink,
    accent: '#5A3BE0',
    accentText: '#5A3BE0',
    accentSoft: Pop.lavender,
    onAccent: '#FFFFFF',
    sun: Pop.yellow,
    berry: '#B5174F',
    leaf: Pop.mint,
  },
  dark: {
    text: Palette.linen,
    textSecondary: '#B8ACA2',
    background: '#141214',
    surface: '#1C191A',
    surfaceAlt: '#2A2526',
    line: '#3D3536',
    ink: '#000000',
    accent: Pop.purple,
    accentText: '#C3AEFF',
    accentSoft: '#3A2F66',
    onAccent: Ink,
    sun: Pop.yellow,
    berry: '#FF8AB0',
    leaf: Pop.mint,
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };

/** Drawing paper stays white in both themes, like real paper. */
export const Paper = '#FFFFFF';

/** Text on the sun-yellow kid bubbles and on every Pop colour is always ink, in both themes. */
export const OnSun = Ink;

/** Fredoka, a round, friendly face, for headings, buttons and labels. Body text stays the system font. */
export const Fonts = {
  display: 'Fredoka_700Bold',
  label: 'Fredoka_600SemiBold',
  medium: 'Fredoka_500Medium',
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
