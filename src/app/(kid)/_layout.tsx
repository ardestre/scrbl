import { Pressable, StyleSheet, Text } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { ProfileAvatar } from '@/components/avatar';
import { TabIcon, type TabIconName } from '@/components/tab-icon';
import { chunky } from '@/components/ui';
import { Fonts, Ink, Pop, Spacing, type PopName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useActiveChild, useWorld } from '@/world/store';

const TABS: { name: string; title: string; icon: TabIconName; tone: PopName }[] = [
  { name: 'create', title: 'Create', icon: 'create', tone: 'orange' },
  { name: 'my-art', title: 'My Art', icon: 'art', tone: 'pink' },
  { name: 'bookshelf', title: 'Bookshelf', icon: 'books', tone: 'sky' },
  { name: 'story-time', title: 'Story Time', icon: 'story', tone: 'yellow' },
];

export default function KidLayout() {
  const t = useTheme();
  const child = useActiveChild();
  if (!child) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: t.surface },
        headerLeft: () => <SwitchProfile />,
        // The selected tab lights up as a coloured sticker with ink text.
        tabBarActiveTintColor: Ink,
        tabBarInactiveTintColor: t.textSecondary,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.ink, borderTopWidth: 2.5, height: 78, paddingTop: 8, paddingBottom: 10 },
        tabBarItemStyle: { borderRadius: 18, marginHorizontal: 6, overflow: 'hidden' },
        tabBarLabelStyle: { fontFamily: Fonts.label, fontSize: 14 },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarActiveBackgroundColor: Pop[tab.tone],
            tabBarIcon: ({ color }) => <TabIcon name={tab.icon} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}

/** The kid's icon and name in the corner. Tapping it goes back to "Who's drawing?". */
function SwitchProfile() {
  const t = useTheme();
  const child = useActiveChild();
  const setActiveChild = useWorld((s) => s.setActiveChild);
  if (!child) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${child.name}. Switch profile`}
      onPress={() => {
        setActiveChild(null);
        router.replace('/');
      }}
      style={({ pressed }) => [styles.switch, chunky(t, { pressed, depth: 3 }), { backgroundColor: t.surfaceAlt }]}>
      <ProfileAvatar profile={child} size={34} />
      <Text style={[styles.name, { color: t.text }]}>{child.name}</Text>
      <Text style={[styles.hint, { color: t.accentText }]}>Switch</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginLeft: Spacing.four, padding: 4, paddingRight: 14, borderRadius: 999 },
  name: { fontSize: 18, fontFamily: Fonts.label },
  hint: { fontSize: 14, fontFamily: Fonts.medium },
});
