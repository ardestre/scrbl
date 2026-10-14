import type { ArtStyleId, CreationKind, MoodId, StoryThemeId } from './types';

export const KINDS: Record<CreationKind, { label: string; plural: string; hint: string }> = {
  character: { label: 'Character', plural: 'Characters', hint: 'A hero, a friend, a silly monster' },
  place: { label: 'Place', plural: 'Places', hint: 'A castle, a volcano, a treehouse' },
  pet: { label: 'Pet', plural: 'Pets', hint: 'A dragon puppy, a flying fish' },
  object: { label: 'Magic object', plural: 'Magic objects', hint: 'A wand, a map, a talking hat' },
};

export const KIND_ORDER: CreationKind[] = ['character', 'place', 'pet', 'object'];

export const STYLES: { id: ArtStyleId; name: string; locked?: boolean }[] = [
  { id: 'storybook', name: 'Storybook' },
  { id: 'cartoon', name: 'Cartoon' },
  { id: 'watercolor', name: 'Watercolour' },
  { id: 'clay', name: 'Clay', locked: true },
  { id: 'comic', name: 'Comic', locked: true },
  { id: 'paper', name: 'Paper cut-out', locked: true },
];

export const styleName = (id: ArtStyleId) => STYLES.find((s) => s.id === id)?.name ?? id;

export const MOODS: { id: MoodId; name: string }[] = [
  { id: 'bright', name: 'Bright and bold' },
  { id: 'pastel', name: 'Soft pastels' },
  { id: 'sunny', name: 'Warm and sunny' },
  { id: 'night', name: 'Magic night' },
];

export const PALETTES: Record<MoodId, string[]> = {
  bright: ['#FF6B6B', '#FFD43B', '#51CF66', '#4DABF7', '#CC5DE8', '#FF922B'],
  pastel: ['#FFC9C9', '#FFEC99', '#B2F2BB', '#A5D8FF', '#E5DBFF', '#FFD8A8'],
  night: ['#5C7CFA', '#9775FA', '#22B8CF', '#F783AC', '#FCC419', '#3BC9DB'],
  sunny: ['#FFA94D', '#FFD43B', '#94D82D', '#FF8787', '#FFE066', '#63E6BE'],
};

export const CRAYONS = ['#1D2240', '#E03131', '#F76707', '#FAB005', '#2F9E44', '#1C7ED6', '#7048E8', '#D6336C', '#868E96'];

export const CRAYON_WORDS: Record<string, string> = {
  '#1D2240': 'dark',
  '#E03131': 'red',
  '#F76707': 'orange',
  '#FAB005': 'yellow',
  '#2F9E44': 'green',
  '#1C7ED6': 'blue',
  '#7048E8': 'purple',
  '#D6336C': 'pink',
  '#868E96': 'grey',
};

export const BRUSH_SIZES = [6, 12, 22];

export const THEMES: Record<StoryThemeId, { label: string; problem: string; solve: string; end: string }> = {
  bravery: {
    label: 'Being brave',
    problem: 'heard a tiny voice calling for help from deep inside a dark cave',
    solve: 'took a big breath, counted to three, and stepped inside',
    end: 'Being brave doesn’t mean you’re never scared. It means you go anyway.',
  },
  sharing: {
    label: 'Sharing',
    problem: 'found a giant basket of treats and wanted to keep every single one',
    solve: 'saw a friend sitting all alone with nothing to eat, and shared half',
    end: 'Treats taste twice as sweet when you share them.',
  },
  bedtime: {
    label: 'Bedtime',
    problem: 'couldn’t fall asleep because the stars were far too exciting',
    solve: 'counted the stars one by one until the yawns came',
    end: 'Even the greatest adventurers need a good night’s sleep. Goodnight!',
  },
  school: {
    label: 'First day of school',
    problem: 'felt wobbly and nervous about the first day at a brand-new school',
    solve: 'said hello to just one new face, and then another',
    end: 'New places are just adventures you haven’t had yet.',
  },
  adventure: {
    label: 'Big adventure',
    problem: 'found a crinkly old map with a big red X on it',
    solve: 'followed the map over hills and through puddles to the X',
    end: 'The best treasure was the adventure itself.',
  },
};
