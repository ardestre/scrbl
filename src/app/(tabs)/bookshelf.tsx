import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { PageArt } from '@/components/page-art';
import { Body, Empty, Screen, Title } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorld } from '@/world/store';

export default function BookshelfScreen() {
  const t = useTheme();
  const books = useWorld((s) => s.books);
  const creations = useWorld((s) => s.creations);
  return (
    <Screen>
      <View>
        <Title>Bookshelf</Title>
        <Body muted>Stories grown-ups made from your world. Tap one to read it together.</Body>
      </View>
      {books.length ? (
        <View style={styles.grid}>
          {books.map((b) => (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              accessibilityLabel={`Read ${b.title}`}
              onPress={() => router.push({ pathname: '/book/[id]', params: { id: b.id } })}
              style={({ pressed }) => [styles.book, { opacity: pressed ? 0.85 : 1 }]}>
              <View style={styles.cover}>
                <PageArt book={b} page={b.pages[0]} creations={creations} />
                <View style={styles.spine} />
              </View>
              <Text style={[styles.title, { color: t.text }]} numberOfLines={2}>
                {b.title}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Empty>No books yet. A grown-up can make one in Story Time.</Empty>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.five },
  book: { width: 230, flexGrow: 1, maxWidth: 320, gap: Spacing.two },
  cover: { borderTopLeftRadius: 6, borderBottomLeftRadius: 6, borderRadius: 14, overflow: 'hidden' },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, backgroundColor: 'rgba(0,0,0,0.18)' },
  title: { fontSize: 17, fontWeight: '800' },
});
