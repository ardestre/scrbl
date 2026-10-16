import { Pressable, StyleSheet, Text } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { ProfileAvatar } from '@/components/avatar';
import { TabIcon, type TabIconName } from '@/components/tab-icon';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useActiveChild, useWorld } from '@/world/store';

const TABS: { name: string; title: string; icon: TabIconName }[] = [
  { name: 'create', title: 'Create', icon: 'create' },
  { name: 'my-art', title: 'My Art', icon: 'art' },
  { name: 'bookshelf', title: 'Bookshelf', icon: 'books' },
  { name: 'story-time', title: 'Story Time', icon: 'story' },
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
        tabBarActiveTintColor: t.accentText,
        tabBarInactiveTintColor: t.textSecondary,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
        tabBarLabelStyle: { fontWeight: '800', fontSize: 13 },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title, tabBarIcon: ({ color }) => <TabIcon name={tab.icon} color={color} /> }}
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
      style={({ pressed }) => [styles.switch, { opacity: pressed ? 0.7 : 1 }]}>
      <ProfileAvatar profile={child} size={36} />
      <Text style={[styles.name, { color: t.text }]}>{child.name}</Text>
      <Text style={[styles.hint, { color: t.textSecondary }]}>Switch</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  switch: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  name: { fontSize: 17, fontWeight: '800' },
  hint: { fontSize: 14, fontWeight: '700' },
});
