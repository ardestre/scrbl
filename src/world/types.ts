/** A point on the drawing paper. Paper is always 1000 x 1000 units, whatever the screen size. */
export type Point = [x: number, y: number];

export type Stroke = {
  color: string;
  /** Brush width in paper units. */
  width: number;
  points: Point[];
};

export type CreationKind = 'character' | 'place' | 'pet' | 'object';

export type ArtStyleId = 'storybook' | 'cartoon' | 'watercolor' | 'clay' | 'comic' | 'paper';

export type MoodId = 'bright' | 'pastel' | 'sunny' | 'night';

/** Something the kid drew: the original sketch plus the art made from it. */
export type Creation = {
  id: string;
  kind: CreationKind;
  name: string;
  /** The kid's answers to the helper's questions, such as what the character loves. */
  answers: Record<string, string>;
  sketch: Stroke[];
  style: ArtStyleId;
  mood: MoodId;
  /** Which of the generated versions the kid picked. */
  variant: number;
  /** Image made by the art service. Missing until the real service is connected. */
  artUri?: string;
  /** A kid-made folder, or null when it only lives in the automatic folder for its kind. */
  folderId: string | null;
  createdAt: number;
};

export type Folder = {
  id: string;
  name: string;
  createdAt: number;
};

export type BookPage = {
  text: string;
  /** Creations shown on this page. A place, if any, becomes the page's background. */
  cast: string[];
};

export type Book = {
  id: string;
  title: string;
  theme: StoryThemeId;
  style: ArtStyleId;
  mood: MoodId;
  pages: BookPage[];
  createdAt: number;
};

export type StoryThemeId = 'bravery' | 'sharing' | 'bedtime' | 'school' | 'adventure';

export type Credits = {
  plan: 'trial' | 'explorer' | 'family';
  creationsLeft: number;
  creationsPerMonth: number;
  booksLeft: number;
  booksPerMonth: number;
};
