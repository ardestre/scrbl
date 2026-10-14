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

import { Fonts, MaxContentWidth, OnSun, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
    <Text accessibilityRole="header" style={[styles.title, { color: t.text, fontSize: size, lineHeight: size * 1.2 }, style]}>
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
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, kind = 'primary', disabled, style, ...rest }: ButtonProps) {
  const t = useTheme();
  const bg = kind === 'primary' ? t.accent : kind === 'sun' ? t.sun : t.surfaceAlt;
  const fg = kind === 'primary' ? t.onAccent : kind === 'sun' ? OnSun : t.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: kind === 'ghost' ? t.line : bg, opacity: disabled ? 0.45 : pressed ? 0.8 : 1 },
        style,
      ]}
      {...rest}>
      <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, left }: { label: string; selected?: boolean; onPress: () => void; left?: ReactNode }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? t.accent : t.line,
          backgroundColor: selected ? t.accentSoft : t.surface,
          opacity: pressed ? 0.8 : 1,
        },
      ]}>
      {left}
      <Text style={[styles.chipText, { color: t.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.textSecondary}
      {...props}
      style={[styles.field, { borderColor: t.line, backgroundColor: t.surface, color: t.text }, props.style]}
    />
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[styles.panel, { backgroundColor: t.surfaceAlt, borderColor: t.line }, style]}>{children}</View>;
}

export function Empty({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={[styles.empty, { borderColor: t.line }]}>
      <Text style={[styles.body, { color: t.textSecondary, textAlign: 'center', fontWeight: '700' }]}>{children}</Text>
    </View>
  );
}

/** How much of a monthly allowance is left, such as creations or books. */
export function Meter({ left, total, label }: { left: number; total: number; label: string }) {
  const t = useTheme();
  return (
    <View style={styles.meter}>
      <View style={[styles.track, { backgroundColor: t.line }]}>
        <View style={{ width: `${Math.round((left / Math.max(total, 1)) * 100)}%`, height: '100%', backgroundColor: t.leaf }} />
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
  title: { fontFamily: Fonts.display, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 23 },
  button: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '800' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 2,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chipText: { fontSize: 15, fontWeight: '700' },
  field: {
    borderWidth: 2,
    borderRadius: Radius.small,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.three },
  panel: { borderWidth: 1, borderRadius: Radius.large, padding: Spacing.five, gap: Spacing.four },
  meter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexGrow: 1 },
  track: { flexGrow: 1, minWidth: 80, height: 10, borderRadius: 99, overflow: 'hidden' },
  meterText: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  empty: { borderWidth: 2, borderStyle: 'dashed', borderRadius: Radius.medium, padding: Spacing.six },
});
