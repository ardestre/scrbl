import { THEMES } from './catalog';
import type { ArtStyleId, Book, BookPage, Creation, MoodId, StoryThemeId } from './types';

export type BookRequest = {
  cast: Creation[];
  theme: StoryThemeId;
  /** Something from real life the parent wants in the story, such as a lost tooth. */
  moment?: string;
  style: ArtStyleId;
  mood: MoodId;
};

const ROLE_ORDER = { character: 0, pet: 1, object: 2, place: 3 } as const;

/**
 * Drafts a short picture book from a fixed template.
 * Placeholder for the story model, which will write a real story from the same request.
 */
export function draftBookFromTemplate(req: BookRequest, id: string, now: number): Book {
  const cast = [...req.cast].sort((a, b) => ROLE_ORDER[a.kind] - ROLE_ORDER[b.kind]);
  const actors = cast.filter((c) => c.kind === 'character' || c.kind === 'pet');
  const place = cast.find((c) => c.kind === 'place');
  const object = cast.find((c) => c.kind === 'object');
  const hero = actors[0] ?? object;
  const friend = actors[1];
  const theme = THEMES[req.theme];

  const heroName = hero?.name ?? 'a little explorer';
  const love = hero?.answers.love ?? 'adventures';
  const trait = hero?.answers.trait ?? 'curious';
  const on = (...who: (Creation | undefined)[]) =>
    [place, ...who].filter((c): c is Creation => Boolean(c)).map((c) => c.id).filter((v, i, a) => a.indexOf(v) === i);

  const where = place
    ? `In ${place.name}, where ${place.answers.special ?? 'the most amazing things happen'}`
    : 'Once upon a time, in a faraway land';

  const pages: BookPage[] = [
    { text: `${where}, there lived ${heroName}, who loved ${love} more than anything.`, cast: on(hero) },
    { text: `${heroName} was ${trait} and full of ideas. But one day, ${heroName} ${theme.problem}.`, cast: on(hero) },
  ];
  if (friend) {
    pages.push({
      text: `Just then, ${friend.name} appeared. “Don’t worry,” said ${friend.name}. “We can figure this out together!”`,
      cast: on(hero, friend),
    });
  } else if (object && object !== hero) {
    pages.push({ text: `In ${heroName}’s pocket, the ${object.name} began to glow. Maybe it could help!`, cast: on(hero, object) });
  } else {
    pages.push({ text: `${heroName} sat down and had a good, long think.`, cast: on(hero) });
  }
  const moment = req.moment?.trim();
  if (moment) {
    const sentence = /[.!?]$/.test(moment) ? moment : `${moment}.`;
    pages.push({ text: `And do you know what else happened that very same day? ${sentence}`, cast: on(hero, friend) });
  }
  pages.push({ text: `So ${heroName} ${theme.solve}.`, cast: on(hero, friend, object) });
  pages.push({ text: `${theme.end} The End.`, cast: on(hero, friend) });

  const title = friend
    ? `${heroName} and ${friend.name}`
    : place
      ? `${heroName} of ${place.name}`
      : `The Story of ${heroName}`;

  return { id, title, theme: req.theme, style: req.style, mood: req.mood, pages, createdAt: now };
}
