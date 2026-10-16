import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { PageArt } from '@/components/page-art';
import { Sticker } from '@/components/sticker';
import { Body, chunky, Empty, Row, Screen, Title } from '@/components/ui';
import { Fonts, Pop, Spacing, type PopName } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useChildWorld, useWorld } from '@/world/store';

const SPINES: PopName[] = ['pink', 'sky', 'lime', 'orange', 'purple', 'yellow'];

export default function BookshelfScreen() {
  const t = useTheme();
  const { books } = useChildWorld();
  const creations = useWorld((s) => s.creations);
  return (
    <Screen>
      <Row style={{ flexWrap: 'nowrap' }}>
        <View style={{ flexShrink: 1 }}>
          <Title size={36}>Bookshelf</Title>
          <Body muted>Stories grown-ups made from your world. Tap one to read it together.</Body>
        </View>
        <Sticker shape="flower" tone="sky" size={56} rotate={-8} />
      </Row>
      {books.length ? (
        <View style={styles.grid}>
          {books.map((b, i) => (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              accessibilityLabel={`Read ${b.title}`}
              onPress={() => router.push({ pathname: '/book/[id]', params: { id: b.id } })}
              style={({ pressed }) => [styles.book, { transform: [{ rotate: `${i % 2 ? 1 : -1}deg` }, { translateY: pressed ? 3 : 0 }] }]}>
              <View style={[styles.cover, chunky(t, { depth: 5 })]}>
                <PageArt book={b} page={b.pages[0]} creations={creations} />
                <View style={[styles.spine, { backgroundColor: Pop[SPINES[i % SPINES.length]], borderColor: t.ink }]} />
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.six },
  book: { width: 230, flexGrow: 1, maxWidth: 320, gap: Spacing.two },
  cover: { borderRadius: 18, borderTopLeftRadius: 6, borderBottomLeftRadius: 6, overflow: 'hidden' },
  spine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 16, borderRightWidth: 2.5 },
  title: { fontSize: 19, fontFamily: Fonts.display },
});
