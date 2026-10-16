import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { ArtView } from '@/components/art-view';
import { DrawingPad } from '@/components/drawing-pad';
import { KindIcon } from '@/components/kind-icon';
import { Body, Button, Chip, Field, Row, Title } from '@/components/ui';
import { OnSun, Radius, Spacing } from '@/constants/theme';
import { useIsWide, useTheme } from '@/hooks/use-theme';
import { BRUSH_SIZES, CRAYONS, KIND_ORDER, KINDS, MOODS, PALETTES, STYLES, styleName } from '@/world/catalog';
import { questionsFor } from '@/world/questions';
import { useChildWorld, useCreation, useWorld } from '@/world/store';
import type { ArtStyleId, MoodId } from '@/world/types';

import type { Draft, useCreateFlow } from './use-create-flow';

type Flow = ReturnType<typeof useCreateFlow>;

export function KindPicker({ onPick }: { onPick: Flow['start'] }) {
  const t = useTheme();
  return (
    <>
      <View>
        <Title size={32}>What do you want to draw today?</Title>
        <Body muted>Draw it however you like. Pip will help bring it to life.</Body>
      </View>
      <View style={styles.kinds}>
        {KIND_ORDER.map((kind) => (
          <Pressable
            key={kind}
            accessibilityRole="button"
            accessibilityLabel={`Draw a ${KINDS[kind].label}`}
            onPress={() => onPick(kind)}
            style={({ pressed }) => [styles.kind, { backgroundColor: t.surfaceAlt, borderColor: pressed ? t.accent : t.line }]}>
            <KindIcon kind={kind} />
            <Title size={20}>{KINDS[kind].label}</Title>
            <Body muted style={{ textAlign: 'center', fontSize: 14 }}>
              {KINDS[kind].hint}
            </Body>
          </Pressable>
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
        <View accessibilityLabel="Crayons" style={[styles.tools, { backgroundColor: t.surfaceAlt, borderColor: t.line, flexDirection: wide ? 'column' : 'row' }]}>
          {CRAYONS.map((c) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Crayon ${c}`}
              accessibilityState={{ selected: color === c }}
              onPress={() => setColor(c)}
              style={[styles.swatch, { backgroundColor: c, borderColor: color === c ? t.text : 'transparent' }]}
            />
          ))}
          {BRUSH_SIZES.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={`Brush size ${s}`}
              accessibilityState={{ selected: size === s }}
              onPress={() => setSize(s)}
              style={[styles.size, { borderColor: size === s ? t.text : t.line, backgroundColor: t.surface }]}>
              <View style={{ width: s / 1.4 + 4, height: s / 1.4 + 4, borderRadius: 99, backgroundColor: t.text }} />
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
    <View style={{ alignSelf: kid ? 'flex-end' : 'flex-start', maxWidth: '85%', gap: 2 }}>
      {!kid ? <Text style={[styles.helperName, { color: t.accentText }]}>Pip</Text> : null}
      <View style={[styles.bubble, kid ? { backgroundColor: t.sun, borderBottomRightRadius: 6 } : { backgroundColor: t.accentSoft, borderBottomLeftRadius: 6 }]}>
        <Text style={[styles.bubbleText, { color: kid ? OnSun : t.text }]}>{text}</Text>
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
        <ArtView art={{ ...preview, style: 'storybook' }} mode="sketch" style={[styles.thumb, { borderColor: t.line }]} />
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
              <Pressable
                key={s.id}
                accessibilityRole="button"
                accessibilityLabel={s.locked ? `${s.name}, more styles coming` : s.name}
                accessibilityState={{ disabled: !!s.locked }}
                disabled={s.locked}
                onPress={() => send(s.id, s.name)}
                style={({ pressed }) => [styles.styleCard, { borderColor: pressed ? t.accent : t.line, backgroundColor: t.surface, opacity: s.locked ? 0.5 : 1 }]}>
                <ArtView art={{ ...preview, style: s.id }} mode={s.locked ? 'sketch' : 'art'} style={{ borderRadius: 10, overflow: 'hidden' }} />
                <Text style={[styles.styleName, { color: t.text }]}>{s.name}</Text>
                {s.locked ? (
                  <View style={[styles.lock, { backgroundColor: t.text }]}>
                    <Text style={{ color: t.surface, fontSize: 11, fontWeight: '800' }}>More styles</Text>
                  </View>
                ) : null}
              </Pressable>
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
                      <View key={c} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />
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
      <ActivityIndicator size="large" color={t.accent} />
      <Title>Bringing {draft.answers.name} to life…</Title>
      <Body muted>Pip is painting 3 versions in {styleName(draft.answers.style as ArtStyleId)} style.</Body>
    </View>
  );
}

export function PickStep({ flow, draft }: { flow: Flow; draft: Draft }) {
  const t = useTheme();
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
          <Pressable
            key={v.variant}
            accessibilityRole="button"
            accessibilityLabel={`Version ${i + 1}`}
            accessibilityState={{ selected: draft.picked === v.variant }}
            onPress={() => flow.pick(v.variant)}
            style={[styles.version, { borderColor: draft.picked === v.variant ? t.accent : t.line, backgroundColor: t.surface }]}>
            <ArtView art={{ sketch: draft.sketch, style, mood, variant: v.variant, artUri: v.uri }} style={{ borderRadius: 14, overflow: 'hidden' }} />
          </Pressable>
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
        <ArtView art={creation} style={[styles.thumb, { borderColor: t.line }]} />
      </View>
      <View style={{ flex: 1, gap: Spacing.four, width: '100%' }}>
        <Bubble who="helper" text={`${creation.name} is in your world now! Want to put ${creation.name} in a folder?`} />
        <Row>
          <Chip label={`Just ${KINDS[creation.kind].plural}`} selected={creation.folderId === null} onPress={() => updateCreation(creation.id, { folderId: null })} />
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
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  kind: {
    flexGrow: 1,
    flexBasis: 200,
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.five,
    borderRadius: Radius.large,
    borderWidth: 2,
  },
  studio: { gap: Spacing.four, alignItems: 'flex-start' },
  tools: { flexWrap: 'wrap', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.medium, borderWidth: 1 },
  swatch: { width: 42, height: 42, borderRadius: 21, borderWidth: 3 },
  size: { width: 42, height: 42, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  chat: { gap: Spacing.five, alignItems: 'flex-start' },
  thumb: { borderRadius: Radius.medium, borderWidth: 1, overflow: 'hidden' },
  helperName: { fontWeight: '800', fontSize: 13 },
  bubble: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
  bubbleText: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
  styleCard: { width: 140, padding: 8, gap: 6, borderRadius: 16, borderWidth: 2 },
  styleName: { fontWeight: '800', fontSize: 14 },
  lock: { position: 'absolute', top: 14, right: 14, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  making: { alignItems: 'center', gap: Spacing.four, paddingVertical: 80 },
  versions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.four },
  version: { flexGrow: 1, flexBasis: 220, padding: 6, borderRadius: 20, borderWidth: 3 },
});
