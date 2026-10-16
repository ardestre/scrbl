import { useState } from 'react';

import { ai, type ArtVersion } from '@/services/ai';
import { openingLine, questionsFor } from '@/world/questions';
import { useWorld } from '@/world/store';
import type { ArtStyleId, CreationKind, MoodId, Stroke } from '@/world/types';

export type ChatLine = { who: 'helper' | 'kid'; text: string };

export type Draft = {
  kind: CreationKind;
  sketch: Stroke[];
  step: 'draw' | 'chat' | 'making' | 'pick' | 'saved';
  answers: Record<string, string>;
  questionIndex: number;
  chat: ChatLine[];
  versions: ArtVersion[];
  /** Bumped by "Try other colours", so the next versions look different. */
  round: number;
  picked: number | null;
  savedId: string | null;
};

export const VERSIONS_PER_ROUND = 3;

/** The kid's create flow: pick a kind, draw, answer the helper's questions, pick a version, save. */
export function useCreateFlow() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const addCreation = useWorld((s) => s.addCreation);
  const update = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const start = (kind: CreationKind) =>
    setDraft({ kind, sketch: [], step: 'draw', answers: {}, questionIndex: 0, chat: [], versions: [], round: 0, picked: null, savedId: null });

  const makeVersions = async (d: Draft) => {
    const versions = await ai.makeArt({
      sketch: d.sketch,
      style: d.answers.style as ArtStyleId,
      mood: d.answers.mood as MoodId,
      versions: VERSIONS_PER_ROUND,
    });
    setDraft((cur) =>
      cur && cur.step === 'making'
        ? { ...cur, step: 'pick', picked: null, versions: versions.map((v) => ({ ...v, variant: v.variant + cur.round * VERSIONS_PER_ROUND })) }
        : cur,
    );
  };

  const actions = {
    start,
    cancel: () => setDraft(null),
    addStroke: (stroke: Stroke) => setDraft((d) => (d ? { ...d, sketch: [...d.sketch, stroke] } : d)),
    undo: () => setDraft((d) => (d ? { ...d, sketch: d.sketch.slice(0, -1) } : d)),
    clear: () => update({ sketch: [] }),
    backToDrawing: () => update({ step: 'draw' }),
    finishDrawing: () =>
      setDraft((d) =>
        d ? { ...d, step: 'chat', questionIndex: 0, answers: {}, chat: [{ who: 'helper', text: openingLine(d.kind, d.sketch) }] } : d,
      ),
    answer: (value: string, shown: string) => {
      if (!draft) return;
      const questions = questionsFor(draft.kind);
      const q = questions[draft.questionIndex];
      const answers = { ...draft.answers, [q.key]: value.trim() };
      const chat: ChatLine[] = [...draft.chat, { who: 'kid', text: shown.trim() }];
      const next = draft.questionIndex + 1;
      if (next >= questions.length) {
        const d: Draft = { ...draft, answers, chat, questionIndex: next, step: 'making' };
        setDraft(d);
        void makeVersions(d);
        return;
      }
      const nq = questions[next];
      if (nq.type !== 'text') chat.push({ who: 'helper', text: nq.ask(answers.name) });
      setDraft({ ...draft, answers, chat, questionIndex: next });
    },
    tryAgain: () => {
      if (!draft) return;
      const d: Draft = { ...draft, step: 'making', round: draft.round + 1 };
      setDraft(d);
      void makeVersions(d);
    },
    pick: (variant: number) => update({ picked: variant }),
    keep: () => {
      if (!draft || draft.picked == null) return;
      const { name, style, mood, ...rest } = draft.answers;
      const chosen = draft.versions.find((v) => v.variant === draft.picked);
      const creation = addCreation({
        kind: draft.kind,
        name,
        answers: rest,
        sketch: draft.sketch,
        style: style as ArtStyleId,
        mood: mood as MoodId,
        variant: draft.picked,
        artUri: chosen?.uri,
        folderId: null,
      });
      update({ step: 'saved', savedId: creation.id });
    },
  };

  return { draft, ...actions };
}
