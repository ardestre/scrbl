import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts, Ink, MaxContentWidth, Pop, Radius, Spacing, type PopName, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The SCRBL sticker look: a thick ink outline and a hard, offset shadow with no blur.
 * Pressing pushes the element into its shadow.
 */
export function chunky(t: ThemeColors, { pressed = false, depth = 4 }: { pressed?: boolean; depth?: number } = {}): ViewStyle {
  const d = pressed ? 1 : depth;
  return {
    borderWidth: 2.5,
    borderColor: t.ink,
    boxShadow: `${d}px ${d}px 0px ${t.ink}`,
    transform: [{ translateX: pressed ? depth - 1 : 0 }, { translateY: pressed ? depth - 1 : 0 }],
  };
}

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const t = useTheme();
  const body = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.screen, { backgroundColor: t.surface }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>{body}</View>
      )}
    </SafeAreaView>
  );
}

export function Title({ children, size = 28, style }: { children: ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return (
    <Text accessibilityRole="header" style={[styles.title, { color: t.text, fontSize: size, lineHeight: size * 1.15 }, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted, style }: { children: ReactNode; muted?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[styles.body, { color: muted ? t.textSecondary : t.text }, style]}>{children}</Text>;
}

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  kind?: 'primary' | 'ghost' | 'sun';
  /** Paint the button in one of the bright sticker colours instead. */
  tone?: PopName;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, kind = 'primary', tone, disabled, style, ...rest }: ButtonProps) {
  const t = useTheme();
  const bg = tone ? Pop[tone] : kind === 'primary' ? t.accent : kind === 'sun' ? t.sun : t.surfaceAlt;
  const fg = tone || kind === 'sun' ? Ink : kind === 'primary' ? t.onAccent : t.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        chunky(t, { pressed: pressed && !disabled, depth: 3 }),
        { backgroundColor: bg, opacity: disabled ? 0.45 : 1 },
        style,
      ]}
      {...rest}>
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  left,
  tone = 'lavender',
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  left?: ReactNode;
  /** The colour the chip lights up in when selected. */
  tone?: PopName;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? chunky(t, { pressed, depth: 2 }) : { borderColor: t.ink, transform: [{ translateY: pressed ? 1 : 0 }] },
        { backgroundColor: selected ? Pop[tone] : t.surfaceAlt },
      ]}>
      {left}
      <Text style={[styles.chipText, { color: selected ? Ink : t.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.textSecondary}
      {...props}
      style={[styles.field, { borderColor: t.ink, backgroundColor: t.surfaceAlt, color: t.text }, props.style]}
    />
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[styles.panel, chunky(t), { backgroundColor: t.surfaceAlt }, style]}>{children}</View>;
}

/** A tappable sticker card, optionally painted in a Pop colour. Put Ink text on coloured cards. */
export function Card({
  children,
  tone,
  selected,
  onPress,
  accessibilityLabel,
  style,
}: {
  children: ReactNode;
  tone?: PopName;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={selected === undefined ? undefined : { selected }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        chunky(t, { pressed }),
        { backgroundColor: tone ? Pop[tone] : t.surfaceAlt },
        selected ? { borderColor: t.accent, borderWidth: 4, boxShadow: `4px 4px 0px ${t.accent}` } : null,
        style,
      ]}>
      {children}
    </Pressable>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.empty, { borderColor: t.ink, backgroundColor: t.surfaceAlt }]}>
      <Text style={[styles.body, { color: t.textSecondary, textAlign: 'center', fontWeight: '700' }]}>{children}</Text>
    </View>
  );
}

/** How much of a monthly allowance is left, such as creations or books. */
export function Meter({ left, total, label }: { left: number; total: number; label: string }) {
  const t = useTheme();
  return (
    <View style={styles.meter}>
      <View style={[styles.track, { backgroundColor: t.surface, borderColor: t.ink }]}>
        <View style={{ width: `${Math.round((left / Math.max(total, 1)) * 100)}%`, height: '100%', backgroundColor: t.leaf, borderRightWidth: left > 0 && left < total ? 2 : 0, borderColor: t.ink }} />
      </View>
      <Text style={[styles.meterText, { color: t.text }]}>
        {left} of {total} {label} left
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: Spacing.five, alignItems: 'center' },
  content: { width: '100%', maxWidth: MaxContentWidth, gap: Spacing.five },
  title: { fontFamily: Fonts.display },
  body: { fontSize: 16, lineHeight: 23 },
  button: {
    borderRadius: Radius.pill,
    paddingVertical: 11,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 17, fontFamily: Fonts.label },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 2,
    borderRadius: Radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 15,
  },
  chipText: { fontSize: 16, fontFamily: Fonts.medium },
  field: {
    borderWidth: 2.5,
    borderRadius: Radius.medium,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.three },
  panel: { borderRadius: Radius.large, padding: Spacing.five, gap: Spacing.four },
  card: { borderRadius: Radius.large, padding: 8, gap: 4 },
  meter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexGrow: 1 },
  track: { flexGrow: 1, minWidth: 80, height: 16, borderRadius: 99, borderWidth: 2, overflow: 'hidden' },
  meterText: { fontSize: 15, fontFamily: Fonts.medium, fontVariant: ['tabular-nums'] },
  empty: { borderWidth: 2.5, borderStyle: 'dashed', borderRadius: Radius.large, padding: Spacing.six },
});
