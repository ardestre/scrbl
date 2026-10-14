import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ArtView } from '@/components/art-view';
import { Button, Empty, Field, Row, Screen, Title } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useIsWide, useTheme } from '@/hooks/use-theme';
import { KIND_ORDER, KINDS, styleName } from '@/world/catalog';
import { useWorld } from '@/world/store';
import { filterCreations, type Selection } from '@/world/folders';

function FolderButton({ label, count, active, onPress }: { label: string; count: number; active: boolean; onPress: () => void }) {
  const t = useTheme();
  const wide = useIsWide();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.folder, active && { backgroundColor: t.accentSoft }, !wide && { borderWidth: 1, borderColor: active ? t.accent : t.line }]}>
      <Text style={[styles.folderText, { color: t.text }]}>{label}</Text>
      <Text style={[styles.folderText, { color: t.textSecondary }]}>{count}</Text>
    </Pressable>
  );
}

export default function MyArtScreen() {
  const t = useTheme();
  const wide = useIsWide();
  const creations = useWorld((s) => s.creations);
  const folders = useWorld((s) => s.folders);
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
          <FolderButton label="Everything" count={creations.length} active={current.type === 'all'} onPress={() => setSel({ type: 'all' })} />
          {wide ? <Text style={[styles.groupLabel, { color: t.textSecondary }]}>SORTED FOR YOU</Text> : null}
          {KIND_ORDER.map((kind) => (
            <FolderButton
              key={kind}
              label={KINDS[kind].plural}
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
                <Pressable
                  key={c.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${c.name}`}
                  onPress={() => router.push({ pathname: '/creation/[id]', params: { id: c.id } })}
                  style={({ pressed }) => [styles.card, { borderColor: pressed ? t.accent : t.line, backgroundColor: t.surface }]}>
                  <ArtView art={c} style={{ borderRadius: 12, overflow: 'hidden' }} />
                  <Text style={[styles.cardName, { color: t.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={[styles.cardMeta, { color: t.textSecondary }]}>
                    {KINDS[c.kind].label} · {styleName(c.style)}
                  </Text>
                </Pressable>
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
  sidebar: { gap: 2 },
  sidebarNarrow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  folder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: Radius.small,
  },
  folderText: { fontSize: 15, fontWeight: '700' },
  groupLabel: { fontSize: 11.5, letterSpacing: 1, fontWeight: '800', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  card: { width: 170, flexGrow: 1, maxWidth: 240, padding: 8, gap: 4, borderRadius: Radius.medium, borderWidth: 1 },
  cardName: { fontSize: 17, fontWeight: '800', paddingHorizontal: 4, paddingTop: 2 },
  cardMeta: { fontSize: 13, fontWeight: '700', paddingHorizontal: 4, paddingBottom: 4 },
});
