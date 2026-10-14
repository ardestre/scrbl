import { Tabs } from 'expo-router/js-tabs';

import { TabIcon, type TabIconName } from '@/components/tab-icon';
import { useTheme } from '@/hooks/use-theme';

const TABS: { name: string; title: string; icon: TabIconName }[] = [
  { name: 'index', title: 'Create', icon: 'create' },
  { name: 'my-art', title: 'My Art', icon: 'art' },
  { name: 'bookshelf', title: 'Bookshelf', icon: 'books' },
  { name: 'story-time', title: 'Story Time', icon: 'story' },
];

export default function TabLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
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
