import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ArtView } from '@/components/art-view';
import { PageArt } from '@/components/page-art';
import { PinGate } from '@/components/pin-gate';
import { Body, Button, Chip, Empty, Field, Meter, Panel, Row, Screen, Title } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ai } from '@/services/ai';
import { STYLES, THEMES } from '@/world/catalog';
import { useChildWorld, useWorld } from '@/world/store';
import type { ArtStyleId, Book, StoryThemeId } from '@/world/types';

export default function StoryTimeScreen() {
  const unlocked = useWorld((s) => s.parentUnlocked);
  return <Screen>{unlocked ? <StoryTime /> : <PinGate />}</Screen>;
}

function StoryTime() {
  const t = useTheme();
  const { child, creations } = useChildWorld();
  const childName = child?.name ?? '';
  const credits = useWorld((s) => s.credits);
  const setParentUnlocked = useWorld((s) => s.setParentUnlocked);
  const addBook = useWorld((s) => s.addBook);
  const [cast, setCast] = useState<string[]>([]);
  const [theme, setTheme] = useState<StoryThemeId>('bravery');
  const [moment, setMoment] = useState('');
  const [style, setStyle] = useState<ArtStyleId>(creations[0]?.style ?? 'storybook');
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<Book | null>(null);

  const toggle = (id: string) => setCast((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const makeDraft = async () => {
    const chosen = creations.filter((c) => cast.includes(c.id));
    setDrafting(true);
    try {
      const mood = chosen.find((c) => c.kind !== 'place')?.mood ?? chosen[0]?.mood ?? 'bright';
      if (!child) return;
      setDraft(await ai.draftBook({ childId: child.id, cast: chosen, theme, moment, style, mood }));
    } finally {
      setDrafting(false);
    }
  };

  const save = () => {
    if (!draft) return;
    addBook(draft);
    setDraft(null);
    setCast([]);
    setMoment('');
    router.navigate('/bookshelf');
  };

  if (draft) {
    const setPage = (i: number, text: string) => setDraft({ ...draft, pages: draft.pages.map((p, j) => (j === i ? { ...p, text } : p)) });
    return (
      <>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flexShrink: 1 }}>
            <Title>Your draft</Title>
            <Body muted>Change any words you like, then save it to {childName}’s Bookshelf.</Body>
          </View>
          <Row>
            <Button kind="ghost" label="Change choices" onPress={() => setDraft(null)} />
            <Button label="Save to Bookshelf" onPress={save} disabled={!draft.title.trim()} />
          </Row>
        </Row>
        <Row style={{ flexWrap: 'nowrap' }}>
          <Text style={[styles.label, { color: t.text }]}>Title</Text>
          <Field value={draft.title} onChangeText={(title) => setDraft({ ...draft, title })} accessibilityLabel="Book title" maxLength={60} />
        </Row>
        <View style={styles.pages}>
          {draft.pages.map((p, i) => (
            <View key={i} style={[styles.page, { borderColor: t.line, backgroundColor: t.surface }]}>
              <PageArt book={draft} page={p} creations={creations} />
              <Text style={[styles.pageNumber, { color: t.textSecondary }]}>Page {i + 1}</Text>
              <Field value={p.text} onChangeText={(text) => setPage(i, text)} multiline accessibilityLabel={`Page ${i + 1} text`} style={{ minHeight: 90, textAlignVertical: 'top', fontWeight: '600' }} />
            </View>
          ))}
        </View>
      </>
    );
  }

  return (
    <>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexShrink: 1 }}>
          <Title>Story Time</Title>
          <Body muted>
            Pick who’s in tonight’s story from {childName}’s world. SCRBL drafts an illustrated book, and you can edit every page before you read it together.
          </Body>
        </View>
        <Button kind="ghost" label="Lock" onPress={() => setParentUnlocked(false)} />
      </Row>

      <Panel>
        <Row>
          <Text style={[styles.label, { color: t.text }]}>Explorer plan</Text>
          <Meter left={credits.creationsLeft} total={credits.creationsPerMonth} label="creations" />
          <Meter left={credits.booksLeft} total={credits.booksPerMonth} label="books" />
        </Row>
      </Panel>

      <Panel>
        <Title size={19}>1. Who’s in the story?</Title>
        {creations.length ? (
          <View style={styles.cast}>
            {creations.map((c) => {
              const on = cast.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  accessibilityRole="button"
                  accessibilityLabel={c.name}
                  accessibilityState={{ selected: on }}
                  onPress={() => toggle(c.id)}
                  style={[styles.castCard, { borderColor: on ? t.accent : 'transparent', backgroundColor: t.surface }]}>
                  <ArtView art={c} style={{ borderRadius: 10, overflow: 'hidden' }} />
                  <Text style={[styles.castName, { color: t.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Empty>{childName} hasn’t drawn anything yet. Their characters and places will show up here.</Empty>
        )}
      </Panel>

      <Panel>
        <Title size={19}>2. What’s it about?</Title>
        <Row>
          {(Object.keys(THEMES) as StoryThemeId[]).map((k) => (
            <Chip key={k} label={THEMES[k].label} selected={theme === k} onPress={() => setTheme(k)} />
          ))}
        </Row>
        <Text style={[styles.label, { color: t.text }]}>Add something from real life (optional)</Text>
        <Field value={moment} onChangeText={setMoment} placeholder={`${childName} lost a tooth today`} accessibilityLabel="Something from real life" maxLength={140} />
      </Panel>

      <Panel>
        <Title size={19}>3. Art style for this book</Title>
        <Row>
          {STYLES.filter((s) => !s.locked).map((s) => (
            <Chip key={s.id} label={s.name} selected={style === s.id} onPress={() => setStyle(s.id)} />
          ))}
        </Row>
      </Panel>

      <Row>
        <Button label="Draft the book (1 book credit)" onPress={makeDraft} disabled={!cast.length || credits.booksLeft <= 0 || drafting} />
        {drafting ? <ActivityIndicator color={t.accent} /> : null}
        {!cast.length ? <Body muted>Pick at least one character.</Body> : null}
        {credits.booksLeft <= 0 ? <Body muted>No books left this month.</Body> : null}
      </Row>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: '800' },
  cast: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  castCard: { width: 130, padding: 6, gap: 4, borderRadius: Radius.medium, borderWidth: 3 },
  castName: { fontSize: 14, fontWeight: '800' },
  pages: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  page: { width: 280, flexGrow: 1, maxWidth: 420, padding: 8, gap: Spacing.two, borderRadius: Radius.medium, borderWidth: 1 },
  pageNumber: { fontWeight: '800' },
});
