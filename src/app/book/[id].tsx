import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { PageArt } from '@/components/page-art';
import { Button, chunky, Row, Screen, Title } from '@/components/ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorld } from '@/world/store';

export default function BookReader() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useWorld((s) => s.books.find((b) => b.id === id));
  const creations = useWorld((s) => s.creations);
  const [index, setIndex] = useState(0);
  // Keep the picture, the words and the page buttons on one screen, even on a landscape tablet.
  const { height } = useWindowDimensions();
  const readerWidth = Math.max(320, Math.min(900, ((height - 280) * 4) / 3));

  if (!book) {
    return (
      <Screen>
        <Title>This book isn’t on the shelf anymore</Title>
        <Button label="Back" onPress={() => router.back()} style={{ alignSelf: 'flex-start' }} />
      </Screen>
    );
  }
  const page = book.pages[Math.min(index, book.pages.length - 1)];
  const last = book.pages.length - 1;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Title size={24}>{book.title}</Title>
        <Button kind="ghost" label="Close" onPress={() => router.back()} />
      </Row>
      <View style={{ maxWidth: readerWidth, width: '100%', alignSelf: 'center', gap: Spacing.four }}>
        <View style={[{ borderRadius: 20, overflow: 'hidden' }, chunky(t, { depth: 6 })]}>
          <PageArt book={book} page={page} creations={creations} />
        </View>
        <Text style={[styles.text, { color: t.text }]}>{page.text}</Text>
        <Row style={{ justifyContent: 'space-between' }}>
          <Button kind="ghost" label="Back" disabled={index === 0} onPress={() => setIndex(index - 1)} />
          <Text style={[styles.pageNumber, { color: t.textSecondary }]}>
            Page {index + 1} of {book.pages.length}
          </Text>
          <Button label={index === last ? 'The End' : 'Next page'} disabled={index === last} onPress={() => setIndex(index + 1)} />
        </Row>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  text: { fontFamily: Fonts.medium, fontSize: 26, lineHeight: 36, minHeight: 100 },
  pageNumber: { fontFamily: Fonts.label, fontVariant: ['tabular-nums'] },
});
