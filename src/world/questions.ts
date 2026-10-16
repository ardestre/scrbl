import { CRAYON_WORDS, KINDS } from './catalog';
import { isClosed, mainColor } from './strokes';
import type { CreationKind, Stroke } from './types';

export type Question =
  | { key: 'name'; type: 'text'; placeholder: string }
  | { key: string; type: 'choice'; ask: (name: string) => string; options: string[] }
  | { key: 'style'; type: 'style'; ask: (name: string) => string }
  | { key: 'mood'; type: 'mood'; ask: (name: string) => string };

/** The helper's questions after a drawing, in order. The first one is asked by `openingLine`. */
export function questionsFor(kind: CreationKind): Question[] {
  const list: Question[] = [{ key: 'name', type: 'text', placeholder: kind === 'place' ? 'Sparkle Mountain' : 'Captain Noodle' }];
  if (kind === 'character' || kind === 'pet') {
    list.push({ key: 'love', type: 'choice', ask: (n) => `What does ${n} love most?`, options: ['pizza', 'flying', 'naps', 'treasure', 'dancing', 'bubbles'] });
    list.push({ key: 'trait', type: 'choice', ask: (n) => `And what is ${n} like?`, options: ['brave', 'shy', 'silly', 'kind', 'grumpy', 'curious'] });
  } else if (kind === 'place') {
    list.push({
      key: 'special',
      type: 'choice',
      ask: (n) => `What’s special about ${n}?`,
      options: ['it’s made of candy', 'dragons live there', 'it has secret doors', 'it rains rainbows', 'it’s always snowing'],
    });
  } else {
    list.push({ key: 'power', type: 'choice', ask: (n) => `What can the ${n} do?`, options: ['grant wishes', 'glow in the dark', 'talk', 'fly', 'shrink things'] });
  }
  list.push({ key: 'style', type: 'style', ask: (n) => `How should ${n} look in your world? Pick a style!` });
  list.push({ key: 'mood', type: 'mood', ask: () => 'What colours feel right?' });
  return list;
}

/**
 * The helper's first line, reacting to what was drawn.
 * Placeholder for the vision model, which will describe the actual drawing.
 */
export function openingLine(kind: CreationKind, sketch: Stroke[]): string {
  const color = mainColor(sketch);
  const word = (color && CRAYON_WORDS[color]) || 'colourful';
  const shapes = sketch.filter(isClosed).length;
  const shapeText = shapes ? ` and the ${shapes} shape${shapes > 1 ? 's' : ''}` : '';
  return `Ooh, I love those ${word} lines${shapeText}! Tell me about your ${KINDS[kind].label.toLowerCase()}. What’s its name?`;
}

export const ANSWER_LABELS: Record<string, string> = {
  love: 'Loves',
  trait: 'Is',
  special: 'Special because',
  power: 'Can',
};
