import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ArtView } from '@/components/art-view';
import { DrawingPad } from '@/components/drawing-pad';
import { KIND_TONE, KindIcon } from '@/components/kind-icon';
import { Sticker } from '@/components/sticker';
import { Body, Button, Card, Chip, chunky, Field, Row, Title } from '@/components/ui';
import { Fonts, Ink, Pop, Radius, Spacing } from '@/constants/theme';
import { useIsWide, useTheme } from '@/hooks/use-theme';
import { BRUSH_SIZES, CRAYONS, KIND_ORDER, KINDS, MOODS, PALETTES, STYLES, styleName } from '@/world/catalog';
import { questionsFor } from '@/world/questions';
import { useChildWorld, useCreation, useWorld } from '@/world/store';
import type { ArtStyleId, MoodId } from '@/world/types';

import type { Draft, useCreateFlow } from './use-create-flow';

type Flow = ReturnType<typeof useCreateFlow>;

export function KindPicker({ onPick }: { onPick: Flow['start'] }) {
  return (
    <>
      <Row style={{ flexWrap: 'nowrap', alignItems: 'center' }}>
        <View style={{ flexShrink: 1 }}>
          <Title size={36}>What do you want to draw today?</Title>
          <Body muted>Draw it however you like. Pip will help bring it to life.</Body>
        </View>
        <Sticker shape="smile" tone="yellow" size={64} rotate={12} />
      </Row>
      <View style={styles.kinds}>
        {KIND_ORDER.map((kind, i) => (
          <Card
            key={kind}
            tone={KIND_TONE[kind]}
            accessibilityLabel={`Draw a ${KINDS[kind].label}`}
            onPress={() => onPick(kind)}
            style={[styles.kind, { transform: [{ rotate: `${i % 2 ? 1.2 : -1.2}deg` }] }]}>
            <View style={styles.kindIcon}>
              <KindIcon kind={kind} />
            </View>
            <Text style={styles.kindName}>{KINDS[kind].label}</Text>
            <Text style={styles.kindHint}>{KINDS[kind].hint}</Text>
          </Card>
        ))}
      </View>
    </>
  );
}

export function DrawStep({ flow, draft }: { flow: Flow; draft: Draft }) {
  const t = useTheme();
  const wide = useIsWide();
  const [color, setColor] = useState(CRAYONS[0]);
  const [size, setSize] = useState(BRUSH_SIZES[1]);
  return (
    <>
      <Row style={{ justifyContent: 'space-between' }}>
        <View style={{ flexShrink: 1 }}>
          <Title>Draw your {KINDS[draft.kind].label.toLowerCase()}</Title>
          <Body muted>Shapes you close up get filled with colour later. Scribbles are welcome.</Body>
        </View>
        <Row>
          <Button kind="ghost" label="Undo" onPress={flow.undo} disabled={!draft.sketch.length} />
          <Button kind="ghost" label="Start over" onPress={flow.clear} disabled={!draft.sketch.length} />
          <Button label="I'm done!" onPress={flow.finishDrawing} disabled={!draft.sketch.length} />
        </Row>
      </Row>
      <View style={[styles.studio, { flexDirection: wide ? 'row' : 'column' }]}>
        <View accessibilityLabel="Crayons" style={[styles.tools, chunky(t), { backgroundColor: t.surfaceAlt, flexDirection: wide ? 'column' : 'row' }]}>
          {CRAYONS.map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Crayon ${c}`}
              accessibilityState={{ selected: color === c }}
              onPress={() => setColor(c)}
              style={[styles.swatch, { backgroundColor: c, borderColor: t.ink, borderWidth: color === c ? 4 : 2, transform: [{ scale: color === c ? 1.12 : 1 }] }]}
            />
          ))}
          {BRUSH_SIZES.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={`Brush size ${s}`}
              accessibilityState={{ selected: size === s }}
              onPress={() => setSize(s)}
              style={[styles.size, { borderColor: t.ink, borderWidth: size === s ? 3.5 : 2, backgroundColor: size === s ? Pop.yellow : t.surface }]}>
              <View style={{ width: s / 1.4 + 4, height: s / 1.4 + 4, borderRadius: 99, backgroundColor: size === s ? Ink : t.text }} />
            </Pressable>
          ))}
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          <DrawingPad strokes={draft.sketch} color={color} width={size} onStrokeEnd={flow.addStroke} />
        </View>
      </View>
      <Row>
        <Button kind="ghost" label="Back" onPress={flow.cancel} />
      </Row>
    </>
  );
}

function Bubble({ who, text }: { who: 'helper' | 'kid'; text: string }) {
  const t = useTheme();
  const kid = who === 'kid';
  return (
    <View style={{ alignSelf: kid ? 'flex-end' : 'flex-start', maxWidth: '85%', gap: 4 }}>
      {!kid ? <Text style={[styles.helperName, { color: t.accentText }]}>Pip</Text> : null}
      <View
        style={[
          styles.bubble,
          chunky(t, { depth: 3 }),
          kid ? { backgroundColor: Pop.yellow, borderBottomRightRadius: 6 } : { backgroundColor: Pop.lavender, borderBottomLeftRadius: 6 },
        ]}>
        <Text style={styles.bubbleText}>{text}</Text>
      </View>
    </View>
  );
}

export function ChatStep({ flow, draft }: { flow: Flow; draft: Draft }) {
  const t = useTheme();
  const wide = useIsWide();
  const [typed, setTyped] = useState('');
  const q = questionsFor(draft.kind)[draft.questionIndex];
  const send = (value: string, shown = value) => {
    if (!value.trim()) return;
    setTyped('');
    flow.answer(value, shown);
  };
  const preview = { sketch: draft.sketch, mood: 'bright' as MoodId, variant: 0 };

  return (
    <View style={[styles.chat, { flexDirection: wide ? 'row' : 'column' }]}>
      <View style={{ width: wide ? 280 : '100%', gap: Spacing.three }}>
        <ArtView art={{ ...preview, style: 'storybook' }} mode="sketch" style={[styles.thumb, chunky(t)]} />
        <Button kind="ghost" label="Keep drawing" onPress={flow.backToDrawing} />
      </View>
      <View style={{ flex: 1, gap: Spacing.three, width: '100%' }}>
        {draft.chat.map((line, i) => (
          <Bubble key={i} {...line} />
        ))}
        {q?.type === 'text' || q?.type === 'choice' ? (
          <View style={{ gap: Spacing.three }}>
            {q.type === 'choice' ? (
              <Row>
                {q.options.map((o) => (
                  <Chip key={o} label={o} onPress={() => send(o)} />
                ))}
              </Row>
            ) : null}
            <Row>
              <Field
                value={typed}
                onChangeText={setTyped}
                placeholder={q.type === 'text' ? q.placeholder : 'Or type your own'}
                accessibilityLabel="Your answer"
                autoFocus={q.type === 'text'}
                maxLength={40}
                returnKeyType="send"
                onSubmitEditing={() => send(typed)}
              />
              <Button label="Send" onPress={() => send(typed)} disabled={!typed.trim()} />
            </Row>
          </View>
        ) : null}
        {q?.type === 'style' ? (
          <View style={styles.styleGrid}>
            {STYLES.map((s) => (
              <Card
                key={s.id}
                accessibilityLabel={s.locked ? `${s.name}, more styles coming` : s.name}
                onPress={s.locked ? undefined : () => send(s.id, s.name)}
                style={[styles.styleCard, { opacity: s.locked ? 0.5 : 1 }]}>
                <ArtView art={{ ...preview, style: s.id }} mode={s.locked ? 'sketch' : 'art'} style={{ borderRadius: 12, overflow: 'hidden' }} />
                <Text style={[styles.styleName, { color: t.text }]}>{s.name}</Text>
                {s.locked ? (
                  <View style={[styles.lock, { backgroundColor: Pop.yellow, borderColor: Ink }]}>
                    <Text style={{ color: Ink, fontSize: 12, fontFamily: Fonts.label }}>More soon</Text>
                  </View>
                ) : null}
              </Card>
            ))}
          </View>
        ) : null}
        {q?.type === 'mood' ? (
          <Row>
            {MOODS.map((m) => (
              <Chip
                key={m.id}
                label={m.name}
                onPress={() => send(m.id, m.name)}
                left={
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {PALETTES[m.id].slice(0, 4).map((c) => (
                      <View key={c} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c, borderWidth: 1.5, borderColor: t.ink }} />
                    ))}
                  </View>
                }
              />
            ))}
          </Row>
        ) : null}
      </View>
    </View>
  );
}

export function MakingStep({ draft }: { draft: Draft }) {
  const t = useTheme();
  return (
    <View style={styles.making}>
      <Row style={{ justifyContent: 'center' }}>
        <Sticker shape="sparkle" tone="pink" size={44} rotate={-10} />
        <ActivityIndicator size="large" color={t.accent} />
        <Sticker shape="burst" tone="lime" size={44} rotate={10} />
      </Row>
      <Title>Bringing {draft.answers.name} to life…</Title>
      <Body muted>Pip is painting 3 versions in {styleName(draft.answers.style as ArtStyleId)} style.</Body>
    </View>
  );
}

export function PickStep({ flow, draft }: { flow: Flow; draft: Draft }) {
  const style = draft.answers.style as ArtStyleId;
  const mood = draft.answers.mood as MoodId;
  return (
    <>
      <View>
        <Title>Which {draft.answers.name} is the real one?</Title>
        <Body muted>Pick your favourite. Your original drawing is saved with it.</Body>
      </View>
      <View style={styles.versions}>
        {draft.versions.map((v, i) => (
          <Card
            key={v.variant}
            accessibilityLabel={`Version ${i + 1}`}
            selected={draft.picked === v.variant}
            onPress={() => flow.pick(v.variant)}
            style={styles.version}>
            <ArtView art={{ sketch: draft.sketch, style, mood, variant: v.variant, artUri: v.uri }} style={{ borderRadius: 16, overflow: 'hidden' }} />
          </Card>
        ))}
      </View>
      <Row>
        <Button kind="ghost" label="Try other colours" onPress={flow.tryAgain} />
        <Button label="Keep this one" onPress={flow.keep} disabled={draft.picked == null} />
      </Row>
    </>
  );
}

export function SavedStep({ flow, draft }: { flow: Flow; draft: Draft }) {
  const t = useTheme();
  const wide = useIsWide();
  const creation = useCreation(draft.savedId ?? undefined);
  const { folders } = useChildWorld();
  const updateCreation = useWorld((s) => s.updateCreation);
  if (!creation) return null;
  return (
    <View style={[styles.chat, { flexDirection: wide ? 'row' : 'column' }]}>
      <View style={{ width: wide ? 280 : '100%' }}>
        <ArtView art={creation} style={[styles.thumb, chunky(t)]} />
      </View>
      <View style={{ flex: 1, gap: Spacing.four, width: '100%' }}>
        <Bubble who="helper" text={`${creation.name} is in your world now! Want to put ${creation.name} in a folder?`} />
        <Row>
          <Chip tone={KIND_TONE[creation.kind]} label={`Just ${KINDS[creation.kind].plural}`} selected={creation.folderId === null} onPress={() => updateCreation(creation.id, { folderId: null })} />
          {folders.map((f) => (
            <Chip key={f.id} label={f.name} selected={creation.folderId === f.id} onPress={() => updateCreation(creation.id, { folderId: f.id })} />
          ))}
        </Row>
        <Row>
          <Button label="Draw something else" onPress={flow.cancel} />
          <Button
            kind="ghost"
            label="See My Art"
            onPress={() => {
              flow.cancel();
              router.navigate('/my-art');
            }}
          />
        </Row>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.five, paddingTop: Spacing.two },
  kind: { flexGrow: 1, flexBasis: 200, alignItems: 'center', gap: Spacing.two, padding: Spacing.five },
  kindIcon: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#FFFFFF', borderWidth: 2.5, borderColor: Ink, alignItems: 'center', justifyContent: 'center' },
  kindName: { fontFamily: Fonts.display, fontSize: 22, color: Ink },
  kindHint: { fontSize: 15, color: Ink, textAlign: 'center', fontWeight: '500' },
  studio: { gap: Spacing.four, alignItems: 'flex-start' },
  tools: { flexWrap: 'wrap', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.large },
  swatch: { width: 42, height: 42, borderRadius: 21 },
  size: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chat: { gap: Spacing.five, alignItems: 'flex-start' },
  thumb: { borderRadius: Radius.large, overflow: 'hidden' },
  helperName: { fontFamily: Fonts.label, fontSize: 15 },
  bubble: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: 20 },
  bubbleText: { fontSize: 17, fontFamily: Fonts.medium, lineHeight: 23, color: Ink },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  styleCard: { width: 140, gap: 6 },
  styleName: { fontFamily: Fonts.label, fontSize: 16, paddingHorizontal: 4 },
  lock: { position: 'absolute', top: 14, right: 14, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, borderWidth: 2 },
  making: { alignItems: 'center', gap: Spacing.four, paddingVertical: 80 },
  versions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.five },
  version: { flexGrow: 1, flexBasis: 220 },
});
