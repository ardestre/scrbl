import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { ArtView } from '@/components/art-view';
import { AVATARS, CharacterAvatar } from '@/components/avatar';
import { PinGate } from '@/components/pin-gate';
import { Body, Button, Field, Row, Screen, Title } from '@/components/ui';
import { Fonts, Ink, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWorld } from '@/world/store';
import type { AvatarId } from '@/world/types';

/** Adding or editing a kid's profile. Only grown-ups can do this, so it sits behind the PIN. */
export default function ProfileScreen() {
  const unlocked = useWorld((s) => s.parentUnlocked);
  return (
    <Screen>
      <Button kind="ghost" label="Cancel" onPress={() => router.back()} style={{ alignSelf: 'flex-start' }} />
      {unlocked ? <ProfileEditor /> : <PinGate />}
    </Screen>
  );
}

function ProfileEditor() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const existing = useWorld((s) => s.profiles.find((p) => p.id === id));
  const allCreations = useWorld((s) => s.creations);
  const addProfile = useWorld((s) => s.addProfile);
  const updateProfile = useWorld((s) => s.updateProfile);
  const deleteProfile = useWorld((s) => s.deleteProfile);
  const [name, setName] = useState(existing?.name ?? '');
  const [avatar, setAvatar] = useState<AvatarId>(existing?.avatar ?? AVATARS[0].id);
  const [drawingId, setDrawingId] = useState<string | undefined>(existing?.avatarCreationId);
  const [confirming, setConfirming] = useState(false);

  if (id !== 'new' && !existing) {
    return <Body>This profile isn’t here any more.</Body>;
  }
  const drawings = existing ? allCreations.filter((c) => c.childId === existing.id) : [];

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (existing) updateProfile(existing.id, { name: trimmed, avatar, avatarCreationId: drawingId });
    else addProfile(trimmed, avatar);
    router.back();
  };

  return (
    <View style={{ gap: Spacing.five }}>
      <Title size={32}>{existing ? `Edit ${existing.name}` : 'Add a kid'}</Title>

      <View style={{ gap: Spacing.two }}>
        <Text style={[styles.label, { color: t.textSecondary }]}>NAME</Text>
        <Field value={name} onChangeText={setName} placeholder="Their first name" accessibilityLabel="Name" maxLength={20} autoFocus={!existing} />
      </View>

      <View style={{ gap: Spacing.three }}>
        <Text style={[styles.label, { color: t.textSecondary }]}>CHARACTER ICON</Text>
        <View style={styles.grid}>
          {AVATARS.map((a) => {
            const on = !drawingId && avatar === a.id;
            return (
              <Pressable
                key={a.id}
                accessibilityRole="button"
                accessibilityLabel={a.name}
                accessibilityState={{ selected: on }}
                onPress={() => {
                  setAvatar(a.id);
                  setDrawingId(undefined);
                }}
                style={[styles.pick, on ? { backgroundColor: t.accentSoft, borderColor: t.ink, boxShadow: `3px 3px 0px ${t.ink}` } : null]}>
                <View style={[styles.clip, { borderColor: Ink }]}>
                  <CharacterAvatar id={a.id} size={84} />
                </View>
                <Text style={[styles.pickName, { color: on ? Ink : t.text }]}>{a.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {drawings.length ? (
        <View style={{ gap: Spacing.three }}>
          <Text style={[styles.label, { color: t.textSecondary }]}>OR ONE OF {existing!.name.toUpperCase()}’S DRAWINGS</Text>
          <View style={styles.grid}>
            {drawings.map((c) => {
              const on = drawingId === c.id;
              return (
                <Pressable
                  key={c.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${c.name} as the icon`}
                  accessibilityState={{ selected: on }}
                  onPress={() => setDrawingId(c.id)}
                  style={[styles.pick, on ? { backgroundColor: t.accentSoft, borderColor: t.ink, boxShadow: `3px 3px 0px ${t.ink}` } : null]}>
                  <View style={[styles.clip, { width: 84, height: 84, borderColor: Ink }]}>
                    <ArtView art={c} />
                  </View>
                  <Text style={[styles.pickName, { color: on ? Ink : t.text }]} numberOfLines={1}>
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <Row>
        <Button label={existing ? 'Save' : 'Add kid'} onPress={save} disabled={!name.trim()} />
        {existing && !confirming ? <Button kind="ghost" label="Delete profile" onPress={() => setConfirming(true)} /> : null}
      </Row>

      {existing && confirming ? (
        <View style={[styles.confirm, { borderColor: t.berry }]}>
          <Body>
            Delete {existing.name}’s profile? Their {drawings.length} drawings, folders and books are deleted too. This can’t be undone.
          </Body>
          <Row>
            <Button
              label="Delete everything"
              style={{ backgroundColor: t.berry, borderColor: t.berry }}
              onPress={() => {
                deleteProfile(existing.id);
                router.back();
              }}
            />
            <Button kind="ghost" label="Keep it" onPress={() => setConfirming(false)} />
          </Row>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontFamily: Fonts.label, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  pick: { width: 104, alignItems: 'center', gap: Spacing.one, padding: 6, borderWidth: 2.5, borderColor: 'transparent', borderRadius: Radius.large },
  clip: { borderRadius: 16, borderWidth: 2.5, overflow: 'hidden' },
  pickName: { fontSize: 15, fontFamily: Fonts.label },
  confirm: { borderWidth: 2.5, borderRadius: Radius.large, padding: Spacing.four, gap: Spacing.three },
});
