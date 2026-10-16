import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { ProfileAvatar } from '@/components/avatar';
import { Sticker } from '@/components/sticker';
import { chunky } from '@/components/ui';
import { Fonts, Ink, Palette, Pop, Radius, Spacing, type PopName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorld } from '@/world/store';

/** The "Who's drawing?" screen is always Linen, in light and dark mode, like a sheet of drawing paper. */
const STAGE = { background: Palette.linen, text: Ink, muted: '#5E5550' };

const LOGO: { letter: string; tone: PopName; tilt: number }[] = [
  { letter: 'S', tone: 'pink', tilt: -6 },
  { letter: 'C', tone: 'yellow', tilt: 4 },
  { letter: 'R', tone: 'sky', tilt: -3 },
  { letter: 'B', tone: 'lime', tilt: 5 },
  { letter: 'L', tone: 'orange', tilt: -4 },
];

export default function WhoIsDrawing() {
  const t = useTheme();
  const profiles = useWorld((s) => s.profiles);
  const setActiveChild = useWorld((s) => s.setActiveChild);
  const { width } = useWindowDimensions();
  const tile = width >= 900 ? 150 : width >= 600 ? 128 : 104;
  // The stage keeps its own light look, so its outlines are always ink.
  const stageInk = { ...t, ink: Ink };

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
        <View style={styles.hero}>
          <Sticker shape="smile" tone="yellow" size={64} rotate={-12} style={[styles.floater, { left: -78, top: -6 }]} />
          <Sticker shape="flower" tone="pink" size={52} rotate={10} style={[styles.floater, { right: -70, top: 4 }]} />
          <Sticker shape="sparkle" tone="purple" size={40} style={[styles.floater, { right: -34, bottom: -18 }]} />
          <View style={styles.logo} accessible accessibilityRole="header" accessibilityLabel="SCRBL">
            {LOGO.map(({ letter, tone, tilt }) => (
              <View key={letter} style={[styles.logoTile, chunky(stageInk, { depth: 3 }), { backgroundColor: Pop[tone], transform: [{ rotate: `${tilt}deg` }] }]}>
                <Text style={styles.logoLetter}>{letter}</Text>
              </View>
            ))}
          </View>
        </View>
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
          <Tile label="Add a kid" size={tile} onPress={addKid} accessibilityLabel="Add a kid’s profile" dashed>
            <View style={[styles.iconTile, { width: tile, height: tile, backgroundColor: Pop.lime }]}>
              <Svg width={tile * 0.4} height={tile * 0.4} viewBox="0 0 24 24">
                <Path d="M12 4v16M4 12h16" stroke={Ink} strokeWidth={3} strokeLinecap="round" />
              </Svg>
            </View>
          </Tile>
          <Tile label="Grown-ups" size={tile} onPress={openGrownUps} accessibilityLabel="Grown-ups profile, needs the PIN">
            <View style={[styles.iconTile, { width: tile, height: tile, backgroundColor: Pop.purple }]}>
              <Svg width={tile * 0.42} height={tile * 0.42} viewBox="0 0 24 24" fill="none">
                <Rect x={5} y={11} width={14} height={10} rx={2} fill={Pop.yellow} stroke={Ink} strokeWidth={2} />
                <Path d="M8 11V8a4 4 0 0 1 8 0v3" stroke={Ink} strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </View>
          </Tile>
        </View>

        {profiles.length ? (
          <Pressable
            accessibilityRole="button"
            onPress={openGrownUps}
            style={({ pressed }) => [styles.manage, chunky(stageInk, { pressed, depth: 3 }), { backgroundColor: '#FFFFFF' }]}>
            <Text style={styles.manageText}>Manage profiles</Text>
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
  dashed,
  children,
}: {
  label: string;
  size: number;
  onPress: () => void;
  accessibilityLabel: string;
  dashed?: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={{ width: size, alignItems: 'center', gap: Spacing.three }}>
      {({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => {
        const lift = hovered && !pressed ? -4 : pressed ? 3 : 0;
        return (
          <>
            <View
              style={{
                borderRadius: size * 0.2,
                borderWidth: 3,
                borderStyle: dashed ? 'dashed' : 'solid',
                borderColor: Ink,
                overflow: 'hidden',
                boxShadow: `${pressed ? 1 : 5}px ${pressed ? 1 : 5}px 0px ${Ink}`,
                transform: [{ translateY: lift }, { rotate: hovered ? '-2deg' : '0deg' }],
              }}>
              {children}
            </View>
            <Text numberOfLines={1} style={styles.name}>
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
  hero: { position: 'relative', marginBottom: Spacing.two },
  floater: { position: 'absolute' },
  logo: { flexDirection: 'row', gap: 6 },
  logoTile: { width: 50, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontFamily: Fonts.display, fontSize: 32, color: Ink },
  title: { fontFamily: Fonts.display, color: STAGE.text, fontSize: 44, textAlign: 'center' },
  subtitle: { color: STAGE.muted, fontSize: 18, textAlign: 'center', maxWidth: 460, lineHeight: 25 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.six, maxWidth: 900, marginTop: Spacing.three },
  iconTile: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontFamily: Fonts.label, color: STAGE.text },
  manage: { marginTop: Spacing.four, paddingVertical: 10, paddingHorizontal: 24, borderRadius: Radius.pill },
  manageText: { color: Ink, fontSize: 17, fontFamily: Fonts.label },
});
