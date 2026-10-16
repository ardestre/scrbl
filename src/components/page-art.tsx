import { StyleSheet, View } from 'react-native';

import { ArtView } from '@/components/art-view';
import type { Book, BookPage, Creation } from '@/world/types';

const PAGE_ASPECT = 4 / 3;

/**
 * One book illustration. A place in the cast becomes the background, and characters stand in front.
 * Every creation is drawn in the book's style, so the whole book looks consistent.
 */
export function PageArt({ book, page, creations }: { book: Book; page: BookPage; creations: Creation[] }) {
  const cast = page.cast.map((id) => creations.find((c) => c.id === id)).filter((c): c is Creation => Boolean(c));
  const place = cast.find((c) => c.kind === 'place');
  const actors = cast.filter((c) => c.kind !== 'place');
  const backdrop = place ?? { sketch: [], style: book.style, mood: book.mood, variant: 0 };
  const n = actors.length;
  const slotWidth = place ? 38 : Math.min(100 / Math.max(n, 1), 50);

  return (
    <View style={[styles.page, { aspectRatio: PAGE_ASPECT }]}>
      <ArtView art={{ ...backdrop, mood: book.mood }} styleOverride={book.style} aspect={PAGE_ASPECT} style={StyleSheet.absoluteFill} />
      {actors.map((actor, i) => {
        const gap = (100 - slotWidth * n) / (n + 1);
        const left = place ? (i === 0 ? 3 : 100 - slotWidth - 3) : gap + i * (slotWidth + gap);
        return (
          <View key={actor.id} style={[styles.slot, { left: `${left}%`, width: `${slotWidth}%`, height: place ? '55%' : '72%' }]}>
            <ArtView art={actor} styleOverride={book.style} background={false} aspect={(slotWidth / (place ? 55 : 72)) * PAGE_ASPECT} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', overflow: 'hidden', borderRadius: 14 },
  slot: { position: 'absolute', bottom: '5%' },
});
