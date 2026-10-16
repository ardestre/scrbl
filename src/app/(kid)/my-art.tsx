import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ArtView } from '@/components/art-view';
import { KIND_TONE } from '@/components/kind-icon';
import { Button, Card, chunky, Empty, Field, Row, Screen, Title } from '@/components/ui';
import { Fonts, Ink, Pop, Radius, Spacing, type PopName } from '@/constants/theme';
import { useIsWide, useTheme } from '@/hooks/use-theme';
import { KIND_ORDER, KINDS, styleName } from '@/world/catalog';
import { useChildWorld, useWorld } from '@/world/store';
import { filterCreations, type Selection } from '@/world/folders';

function FolderButton({ label, count, active, tone = 'lavender', onPress }: { label: string; count: number; active: boolean; tone?: PopName; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.folder,
        active ? [chunky(t, { pressed, depth: 3 }), { backgroundColor: Pop[tone] }] : { borderWidth: 2.5, borderColor: 'transparent' },
      ]}>
      <View style={[styles.dot, { backgroundColor: Pop[tone], borderColor: t.ink }]} />
      <Text style={[styles.folderText, { color: active ? Ink : t.text, flex: 1 }]}>{label}</Text>
      <Text style={[styles.folderText, { color: active ? Ink : t.textSecondary }]}>{count}</Text>
    </Pressable>
  );
}

export default function MyArtScreen() {
  const t = useTheme();
  const wide = useIsWide();
  const { creations, folders } = useChildWorld();
  const addFolder = useWorld((s) => s.addFolder);
  const [sel, setSel] = useState<Selection>({ type: 'all' });
  const [newName, setNewName] = useState('');

  const openFolder = sel.type === 'folder' ? folders.find((f) => f.id === sel.id) : undefined;
  const current: Selection = sel.type === 'folder' && !openFolder ? { type: 'all' } : sel;
  const items = filterCreations(creations, current);
  const heading =
    current.type === 'all' ? 'Everything' : current.type === 'kind' ? KINDS[current.kind].plural : (openFolder?.name ?? 'Everything');

  const createFolder = () => {
    const name = newName.trim();
    if (!name) return;
    const folder = addFolder(name);
    setNewName('');
    setSel({ type: 'folder', id: folder.id });
  };

  return (
    <Screen>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: Spacing.five }}>
        <View accessibilityLabel="Folders" style={[styles.sidebar, wide ? { width: 230 } : styles.sidebarNarrow]}>
          <FolderButton label="Everything" tone="yellow" count={creations.length} active={current.type === 'all'} onPress={() => setSel({ type: 'all' })} />
          {wide ? <Text style={[styles.groupLabel, { color: t.textSecondary }]}>SORTED FOR YOU</Text> : null}
          {KIND_ORDER.map((kind) => (
            <FolderButton
              key={kind}
              label={KINDS[kind].plural}
              tone={KIND_TONE[kind]}
              count={creations.filter((c) => c.kind === kind).length}
              active={current.type === 'kind' && current.kind === kind}
              onPress={() => setSel({ type: 'kind', kind })}
            />
          ))}
          {wide ? <Text style={[styles.groupLabel, { color: t.textSecondary }]}>MY FOLDERS</Text> : null}
          {folders.map((f) => (
            <FolderButton
              key={f.id}
              label={f.name}
              tone="mint"
              count={creations.filter((c) => c.folderId === f.id).length}
              active={current.type === 'folder' && current.id === f.id}
              onPress={() => setSel({ type: 'folder', id: f.id })}
            />
          ))}
          <Row style={{ marginTop: Spacing.two, width: wide ? '100%' : undefined, flexWrap: 'nowrap' }}>
            <Field
              value={newName}
              onChangeText={setNewName}
              placeholder="New folder"
              accessibilityLabel="New folder name"
              maxLength={30}
              onSubmitEditing={createFolder}
              style={{ paddingVertical: 8 }}
            />
            <Button label="Add" onPress={createFolder} disabled={!newName.trim()} style={{ paddingHorizontal: 16, paddingVertical: 9 }} />
          </Row>
        </View>

        <View style={{ flex: 1, gap: Spacing.four }}>
          <Title>{heading}</Title>
          {items.length ? (
            <View style={styles.grid}>
              {items.map((c) => (
                <Card key={c.id} accessibilityLabel={`Open ${c.name}`} onPress={() => router.push({ pathname: '/creation/[id]', params: { id: c.id } })} style={styles.card}>
                  <ArtView art={c} style={{ borderRadius: 14, overflow: 'hidden' }} />
                  <Text style={[styles.cardName, { color: t.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <View style={[styles.tag, { backgroundColor: Pop[KIND_TONE[c.kind]] }]}>
                    <Text style={styles.tagText}>
                      {KINDS[c.kind].label} · {styleName(c.style)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          ) : (
            <Empty>
              {creations.length
                ? 'Nothing in here yet. Open a drawing and move it to this folder.'
                : 'Your drawings will live here. Go to Create to make your first one!'}
            </Empty>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sidebar: { gap: 4 },
  sidebarNarrow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  folder: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.pill },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  folderText: { fontSize: 16, fontFamily: Fonts.label },
  groupLabel: { fontSize: 13, letterSpacing: 1, fontFamily: Fonts.label, paddingHorizontal: 12, paddingTop: 14, paddingBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.five },
  card: { width: 170, flexGrow: 1, maxWidth: 240 },
  cardName: { fontSize: 18, fontFamily: Fonts.display, paddingHorizontal: 4, paddingTop: 4 },
  tag: { alignSelf: 'flex-start', marginHorizontal: 4, marginBottom: 4, paddingHorizontal: 9, paddingVertical: 2, borderRadius: 99, borderWidth: 2, borderColor: Ink },
  tagText: { fontSize: 13, fontFamily: Fonts.label, color: Ink },
});
