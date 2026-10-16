import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ArtView } from '@/components/art-view';
import { ProfileAvatar } from '@/components/avatar';
import { PageArt } from '@/components/page-art';
import { PinGate } from '@/components/pin-gate';
import { Body, Button, Chip, Empty, Meter, Panel, Row, Screen, Title } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { KIND_ORDER, KINDS, styleName } from '@/world/catalog';
import { useWorld } from '@/world/store';
import type { CreationKind, Profile } from '@/world/types';

/** Leaving the grown-up profile always locks it again. */
function leave() {
  useWorld.getState().setParentUnlocked(false);
  router.replace('/');
}

export default function ParentScreen() {
  const unlocked = useWorld((s) => s.parentUnlocked);
  if (unlocked) return <ParentHome />;
  return (
    <Screen>
      <Button kind="ghost" label="Back to profiles" onPress={leave} style={{ alignSelf: 'flex-start' }} />
      <PinGate />
    </Screen>
  );
}

function ParentHome() {
  const t = useTheme();
  const profiles = useWorld((s) => s.profiles);
  const creations = useWorld((s) => s.creations);
  const books = useWorld((s) => s.books);
  const credits = useWorld((s) => s.credits);
  const [kid, setKid] = useState<string | 'all'>('all');
  const [kind, setKind] = useState<CreationKind | 'all'>('all');

  const byId = useMemo(() => new Map(profiles.map((p) => [p.id, p])), [profiles]);
  const shownCreations = creations
    .filter((c) => (kid === 'all' || c.childId === kid) && (kind === 'all' || c.kind === kind))
    .sort((a, b) => b.createdAt - a.createdAt);
  const shownBooks = books.filter((b) => kid === 'all' || b.childId === kid).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flexShrink: 1 }}>
          <Title size={32}>Grown-ups</Title>
          <Body muted>Everything your kids have made, in one place.</Body>
        </View>
        <Button kind="ghost" label="Lock and go to profiles" onPress={leave} />
      </Row>

      <Panel>
        <Title size={22}>Kids</Title>
        <View style={styles.kids}>
          {profiles.map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${p.name}’s profile`}
              onPress={() => router.push({ pathname: '/profile/[id]', params: { id: p.id } })}
              style={({ pressed }) => [styles.kid, { borderColor: pressed ? t.accent : t.line, backgroundColor: t.surface }]}>
              <ProfileAvatar profile={p} size={56} />
              <View style={{ flexShrink: 1 }}>
                <Text style={[styles.kidName, { color: t.text }]} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={[styles.meta, { color: t.textSecondary }]}>
                  {count(creations.filter((c) => c.childId === p.id).length, 'drawing')} ·{' '}
                  {count(books.filter((b) => b.childId === p.id).length, 'book')}
                </Text>
                <Text style={[styles.meta, { color: t.accentText }]}>Edit</Text>
              </View>
            </Pressable>
          ))}
          <Button
            kind="ghost"
            label="Add a kid"
            onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })}
            style={{ alignSelf: 'center' }}
          />
        </View>
      </Panel>

      <Panel>
        <Title size={22}>Plan</Title>
        <Body muted>The {credits.plan} plan is shared by every kid in the family.</Body>
        <Meter left={credits.creationsLeft} total={credits.creationsPerMonth} label="drawings brought to life" />
        <Meter left={credits.booksLeft} total={credits.booksPerMonth} label="books" />
      </Panel>

      <View style={{ gap: Spacing.three }}>
        <Title size={26}>Library</Title>
        <Row style={{ gap: Spacing.two }}>
          <Chip label="All kids" selected={kid === 'all'} onPress={() => setKid('all')} />
          {profiles.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              selected={kid === p.id}
              onPress={() => setKid(p.id)}
              left={<ProfileAvatar profile={p} size={22} />}
            />
          ))}
        </Row>
        <Row style={{ gap: Spacing.two }}>
          <Chip label="Everything" selected={kind === 'all'} onPress={() => setKind('all')} />
          {KIND_ORDER.map((k) => (
            <Chip key={k} label={KINDS[k].plural} selected={kind === k} onPress={() => setKind(k)} />
          ))}
        </Row>
      </View>

      {shownCreations.length ? (
        <View style={styles.grid}>
          {shownCreations.map((c) => (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${c.name}, by ${byId.get(c.childId)?.name ?? 'a kid'}`}
              onPress={() => router.push({ pathname: '/creation/[id]', params: { id: c.id } })}
              style={({ pressed }) => [styles.card, { borderColor: pressed ? t.accent : t.line, backgroundColor: t.surface }]}>
              <ArtView art={c} style={{ borderRadius: 12, overflow: 'hidden' }} />
              <Text style={[styles.cardName, { color: t.text }]} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={[styles.meta, styles.pad, { color: t.textSecondary }]}>
                {KINDS[c.kind].label} · {styleName(c.style)}
              </Text>
              <KidBadge profile={byId.get(c.childId)} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Empty>
          {profiles.length ? 'No drawings here yet. They show up as soon as a kid makes one.' : 'Add a kid to get started.'}
        </Empty>
      )}

      <Title size={26}>Books</Title>
      {shownBooks.length ? (
        <View style={styles.grid}>
          {shownBooks.map((b) => (
            <Pressable
              key={b.id}
              accessibilityRole="button"
              accessibilityLabel={`Read ${b.title}`}
              onPress={() => router.push({ pathname: '/book/[id]', params: { id: b.id } })}
              style={({ pressed }) => [styles.card, { borderColor: pressed ? t.accent : t.line, backgroundColor: t.surface }]}>
              <View style={{ borderRadius: 12, overflow: 'hidden' }}>
                <PageArt book={b} page={b.pages[0]} creations={creations} />
              </View>
              <Text style={[styles.cardName, { color: t.text }]} numberOfLines={2}>
                {b.title}
              </Text>
              <KidBadge profile={byId.get(b.childId)} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Empty>No books yet. Open a kid’s profile and go to Story Time to make one from their world.</Empty>
      )}
    </Screen>
  );
}

function KidBadge({ profile }: { profile: Profile | undefined }) {
  const t = useTheme();
  if (!profile) return null;
  return (
    <View style={[styles.badge, styles.pad]}>
      <ProfileAvatar profile={profile} size={22} />
      <Text style={[styles.meta, { color: t.text }]} numberOfLines={1}>
        {profile.name}
      </Text>
    </View>
  );
}

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const styles = StyleSheet.create({
  kids: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  kid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.medium,
    minWidth: 220,
  },
  kidName: { fontSize: 18, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  card: { width: 170, flexGrow: 1, maxWidth: 240, padding: 8, gap: 4, borderRadius: Radius.medium, borderWidth: 1 },
  cardName: { fontSize: 17, fontWeight: '800', paddingHorizontal: 4, paddingTop: 2 },
  meta: { fontSize: 13, fontWeight: '700' },
  pad: { paddingHorizontal: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingBottom: 4 },
});
