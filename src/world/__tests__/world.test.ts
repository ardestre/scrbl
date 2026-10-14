import { draftBookFromTemplate } from '../draft-book';
import { filterCreations } from '../folders';
import { openingLine, questionsFor } from '../questions';
import { bounds, isClosed, mainColor, toPath } from '../strokes';
import type { Creation, Point, Stroke } from '../types';

const circle = (cx: number, cy: number, r: number, color = '#1C7ED6'): Stroke => ({
  color,
  width: 12,
  points: Array.from({ length: 30 }, (_, i): Point => [cx + Math.cos((i / 29) * Math.PI * 2) * r, cy + Math.sin((i / 29) * Math.PI * 2) * r]),
});
const line = (color = '#1D2240'): Stroke => ({ color, width: 12, points: [[100, 100], [200, 300], [300, 500], [400, 700]] });

const creation = (over: Partial<Creation>): Creation => ({
  id: 'x',
  kind: 'character',
  name: 'Ziggy',
  answers: {},
  sketch: [circle(500, 500, 200)],
  style: 'storybook',
  mood: 'bright',
  variant: 0,
  folderId: null,
  createdAt: 0,
  ...over,
});

describe('strokes', () => {
  it('treats a loop as a closed shape and a line as open', () => {
    expect(isClosed(circle(500, 500, 200))).toBe(true);
    expect(isClosed(line())).toBe(false);
  });

  it('measures the drawing', () => {
    const square: Stroke = { color: '#000000', width: 6, points: [[400, 300], [600, 300], [600, 700], [400, 700]] };
    expect(bounds([square])).toEqual({ x: 400, y: 300, w: 200, h: 400 });
  });

  it('falls back to the whole paper for an empty drawing', () => {
    expect(bounds([])).toEqual({ x: 0, y: 0, w: 1000, h: 1000 });
  });

  it('builds a smooth path', () => {
    expect(toPath([[0, 0], [10, 10], [20, 0]])).toBe('M0 0Q10 10 15 5L20 0');
    expect(toPath([[0, 0], [10, 10], [20, 0]], true).endsWith('Z')).toBe(true);
  });

  it('picks the main crayon, skipping the dark outline crayon', () => {
    expect(mainColor([line('#1D2240'), line('#1D2240'), circle(0, 0, 10, '#2F9E44')])).toBe('#2F9E44');
  });
});

describe('helper questions', () => {
  it('asks a character about what it loves and what it is like, then style and colours', () => {
    expect(questionsFor('character').map((q) => q.key)).toEqual(['name', 'love', 'trait', 'style', 'mood']);
  });

  it('asks a place what is special about it', () => {
    expect(questionsFor('place').map((q) => q.key)).toEqual(['name', 'special', 'style', 'mood']);
  });

  it('reacts to the colours and shapes in the drawing', () => {
    const line1 = openingLine('pet', [circle(500, 500, 200, '#2F9E44'), line()]);
    expect(line1).toContain('green lines');
    expect(line1).toContain('1 shape');
    expect(line1).toContain('pet');
  });
});

describe('My Art folders', () => {
  const items = [
    creation({ id: 'a', kind: 'character', folderId: 'f1' }),
    creation({ id: 'b', kind: 'place', folderId: null }),
    creation({ id: 'c', kind: 'character', folderId: null }),
  ];

  it('shows everything, a kind, or a kid-made folder', () => {
    expect(filterCreations(items, { type: 'all' })).toHaveLength(3);
    expect(filterCreations(items, { type: 'kind', kind: 'character' }).map((c) => c.id)).toEqual(['a', 'c']);
    expect(filterCreations(items, { type: 'folder', id: 'f1' }).map((c) => c.id)).toEqual(['a']);
  });
});

describe('book drafting template', () => {
  const hero = creation({ id: 'hero', name: 'Captain Noodle', answers: { love: 'flying kites', trait: 'brave' } });
  const friend = creation({ id: 'pal', kind: 'pet', name: 'Bubbles' });
  const place = creation({ id: 'volcano', kind: 'place', name: 'Candy Volcano', answers: { special: 'it rains gumdrops' } });

  it('casts the hero, friend and place, with the place on every page', () => {
    const book = draftBookFromTemplate({ cast: [place, friend, hero], theme: 'bravery', style: 'cartoon', mood: 'bright' }, 'b1', 5);
    expect(book.title).toBe('Captain Noodle and Bubbles');
    expect(book.pages[0].text).toContain('In Candy Volcano, where it rains gumdrops');
    expect(book.pages[0].text).toContain('loved flying kites');
    expect(book.pages.every((p) => p.cast.includes('volcano'))).toBe(true);
    expect(book.pages.at(-1)?.text).toMatch(/The End\.$/);
    expect(book.style).toBe('cartoon');
  });

  it('adds a page for a real-life moment', () => {
    const without = draftBookFromTemplate({ cast: [hero], theme: 'bedtime', style: 'storybook', mood: 'night' }, 'b', 0);
    const withMoment = draftBookFromTemplate({ cast: [hero], theme: 'bedtime', moment: 'Mia lost her first tooth', style: 'storybook', mood: 'night' }, 'b', 0);
    expect(withMoment.pages).toHaveLength(without.pages.length + 1);
    expect(withMoment.pages.some((p) => p.text.endsWith('Mia lost her first tooth.'))).toBe(true);
  });

  it('never lists a creation twice on one page', () => {
    const book = draftBookFromTemplate({ cast: [hero], theme: 'sharing', style: 'storybook', mood: 'bright' }, 'b', 0);
    for (const page of book.pages) expect(new Set(page.cast).size).toBe(page.cast.length);
  });
});
