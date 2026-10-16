import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { ProfileAvatar } from '@/components/avatar';
import { Fonts, Palette, Radius, Spacing } from '@/constants/theme';
import { useWorld } from '@/world/store';

/** The "Who's drawing?" screen is always Linen, in light and dark mode. */
const STAGE = { background: Palette.linen, text: Palette.shadowGrey, muted: '#5E5550', tile: Palette.shadowGrey, ring: Palette.tomatoJam };

export default function WhoIsDrawing() {
  const profiles = useWorld((s) => s.profiles);
  const setActiveChild = useWorld((s) => s.setActiveChild);
  const { width } = useWindowDimensions();
  const tile = width >= 900 ? 150 : width >= 600 ? 128 : 104;

  const openKid = (id: string) => {
    setActiveChild(id);
    router.replace('/create');
  };
  const openGrownUps = () => {
    setActiveChild(null);
    router.push('/parent');
  };
  const addKid = () => {
    setActiveChild(null);
    router.push({ pathname: '/profile/[id]', params: { id: 'new' } });
  };

  return (
    <SafeAreaView style={[styles.stage, { backgroundColor: STAGE.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo} accessibilityLabel="SCRBL">
          <Text style={{ color: Palette.tomatoJam }}>S</Text>
          <Text style={{ color: '#5E9EA3' }}>C</Text>
          <Text style={{ color: Palette.shadowGrey }}>R</Text>
          <Text style={{ color: '#5E9EA3' }}>B</Text>
          <Text style={{ color: Palette.tomatoJam }}>L</Text>
        </Text>
        <Text accessibilityRole="header" style={styles.title}>
          {profiles.length ? 'Who’s drawing today?' : 'Welcome to SCRBL'}
        </Text>
        {!profiles.length ? (
          <Text style={styles.subtitle}>A grown-up sets things up first: make a PIN, then add a profile for each kid.</Text>
        ) : null}

        <View style={styles.tiles}>
          {profiles.map((p) => (
            <Tile key={p.id} label={p.name} size={tile} onPress={() => openKid(p.id)} accessibilityLabel={`${p.name}’s profile`}>
              <ProfileAvatar profile={p} size={tile} />
            </Tile>
          ))}
          <Tile label="Add a kid" size={tile} onPress={addKid} accessibilityLabel="Add a kid’s profile">
            <View style={[styles.iconTile, { width: tile, height: tile, borderRadius: tile * 0.16, borderStyle: 'dashed', borderWidth: 3, borderColor: STAGE.muted }]}>
              <Svg width={tile * 0.4} height={tile * 0.4} viewBox="0 0 24 24">
                <Path d="M12 4v16M4 12h16" stroke={STAGE.muted} strokeWidth={2.5} strokeLinecap="round" />
              </Svg>
            </View>
          </Tile>
          <Tile label="Grown-ups" size={tile} onPress={openGrownUps} accessibilityLabel="Grown-ups profile, needs the PIN">
            <View style={[styles.iconTile, { width: tile, height: tile, borderRadius: tile * 0.16, backgroundColor: STAGE.tile }]}>
              <Svg width={tile * 0.42} height={tile * 0.42} viewBox="0 0 24 24" fill="none">
                <Rect x={5} y={11} width={14} height={10} rx={2} stroke={Palette.linen} strokeWidth={2} />
                <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={Palette.linen} strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>
          </Tile>
        </View>

        {profiles.length ? (
          <Pressable accessibilityRole="button" onPress={openGrownUps} style={({ pressed }) => [styles.manage, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={styles.manageText}>MANAGE PROFILES</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Tile({
  label,
  size,
  onPress,
  accessibilityLabel,
  children,
}: {
  label: string;
  size: number;
  onPress: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={{ width: size, alignItems: 'center', gap: Spacing.three }}>
      {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => {
        const lit = pressed || hovered;
        return (
          <>
            <View
              style={{
                borderRadius: size * 0.16 + 4,
                padding: 3,
                borderWidth: 3,
                borderColor: lit ? STAGE.ring : 'transparent',
                transform: [{ scale: pressed ? 0.96 : 1 }],
              }}>
              {children}
            </View>
            <Text numberOfLines={1} style={[styles.name, { color: lit ? STAGE.text : STAGE.muted }]}>
              {label}
            </Text>
          </>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.five, gap: Spacing.five },
  logo: { fontFamily: Fonts.display, fontSize: 30, fontWeight: '800', letterSpacing: 1 },
  title: { fontFamily: Fonts.display, color: STAGE.text, fontSize: 40, fontWeight: '700', textAlign: 'center' },
  subtitle: { color: STAGE.muted, fontSize: 17, textAlign: 'center', maxWidth: 460, lineHeight: 24 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.six, maxWidth: 900, marginTop: Spacing.four },
  iconTile: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '700' },
  manage: { marginTop: Spacing.five, borderWidth: 2, borderColor: STAGE.muted, paddingVertical: 10, paddingHorizontal: 22, borderRadius: Radius.small },
  manageText: { color: STAGE.muted, fontSize: 15, fontWeight: '800', letterSpacing: 2 },
});
