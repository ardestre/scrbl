import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ArtView } from '@/components/art-view';
import { KIND_TONE } from '@/components/kind-icon';
import { Body, Button, Chip, chunky, Field, Row, Screen, Title } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useIsWide, useTheme } from '@/hooks/use-theme';
import { KINDS, styleName } from '@/world/catalog';
import { ANSWER_LABELS } from '@/world/questions';
import { useCreation, useWorld } from '@/world/store';

export default function CreationScreen() {
  const t = useTheme();
  const wide = useIsWide();
  const { id } = useLocalSearchParams<{ id: string }>();
  const creation = useCreation(id);
  const allFolders = useWorld((s) => s.folders);
  const books = useWorld((s) => s.books);
  const owner = useWorld((s) => s.profiles.find((p) => p.id === creation?.childId));
  const folders = allFolders.filter((f) => f.childId === creation?.childId);
  const updateCreation = useWorld((s) => s.updateCreation);
  const deleteCreation = useWorld((s) => s.deleteCreation);
  const parentUnlocked = useWorld((s) => s.parentUnlocked);
  const [name, setName] = useState(creation?.name ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!creation) {
    return (
      <Screen>
        <Title>This drawing isn’t here anymore</Title>
        <Button label="Back to My Art" onPress={() => router.back()} style={{ alignSelf: 'flex-start' }} />
      </Screen>
    );
  }

  const inBooks = books.filter((b) => b.pages.some((p) => p.cast.includes(creation.id)));
  const facts: [string, string][] = [
    ...(owner ? [['Drawn by', owner.name] as [string, string]] : []),
    ['Kind', KINDS[creation.kind].label],
    ...Object.entries(creation.answers).map(([k, v]): [string, string] => [ANSWER_LABELS[k] ?? k, v]),
    ['In books', inBooks.length ? inBooks.map((b) => b.title).join(', ') : 'Not yet'],
  ];

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <Title size={34}>{creation.name}</Title>
        <Button kind="ghost" label="Close" onPress={() => router.back()} />
      </Row>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: Spacing.four }}>
        <View style={styles.figure}>
          <Text style={[styles.caption, { color: t.textSecondary }]}>MY DRAWING</Text>
          <ArtView art={creation} mode="sketch" style={[styles.art, chunky(t)]} />
        </View>
        <View style={styles.figure}>
          <Text style={[styles.caption, { color: t.textSecondary }]}>{styleName(creation.style).toUpperCase()} STYLE</Text>
          <ArtView art={creation} style={[styles.art, chunky(t)]} />
        </View>
      </View>
      <View style={styles.facts}>
        {facts.map(([label, value]) => (
          <View key={label} style={styles.fact}>
            <Text style={[styles.factLabel, { color: t.textSecondary }]}>{label}</Text>
            <Text style={[styles.factValue, { color: t.text }]}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={{ gap: Spacing.three }}>
        <Title size={18}>Folder</Title>
        <Row>
          <Chip tone={KIND_TONE[creation.kind]} label={`Just ${KINDS[creation.kind].plural}`} selected={creation.folderId === null} onPress={() => updateCreation(creation.id, { folderId: null })} />
          {folders.map((f) => (
            <Chip key={f.id} tone="mint" label={f.name} selected={creation.folderId === f.id} onPress={() => updateCreation(creation.id, { folderId: f.id })} />
          ))}
        </Row>
      </View>
      <Row style={{ flexWrap: 'nowrap' }}>
        <Field value={name} onChangeText={setName} accessibilityLabel="Name" maxLength={40} />
        <Button kind="ghost" label="Rename" disabled={!name.trim() || name.trim() === creation.name} onPress={() => updateCreation(creation.id, { name: name.trim() })} />
      </Row>
      {parentUnlocked ? (
        <Row>
          {confirmDelete ? (
            <>
              <Body>Delete {creation.name} for good?</Body>
              <Button
                label="Delete"
                onPress={() => {
                  deleteCreation(creation.id);
                  router.back();
                }}
              />
              <Button kind="ghost" label="Keep it" onPress={() => setConfirmDelete(false)} />
            </>
          ) : (
            <Button kind="ghost" label="Delete drawing" onPress={() => setConfirmDelete(true)} />
          )}
        </Row>
      ) : (
        <Body muted style={{ fontSize: 14 }}>
          Deleting a drawing needs a grown-up.
        </Body>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  figure: { flex: 1, gap: 6 },
  caption: { fontSize: 13, fontFamily: Fonts.label, letterSpacing: 0.8 },
  art: { borderRadius: Radius.large, overflow: 'hidden' },
  facts: { gap: Spacing.two },
  fact: { flexDirection: 'row', gap: Spacing.four },
  factLabel: { width: 130, fontSize: 16, fontFamily: Fonts.label },
  factValue: { flex: 1, fontSize: 16, fontWeight: '600' },
});
