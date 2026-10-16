import { draftBookFromTemplate, type BookRequest } from '@/world/draft-book';
import type { ArtStyleId, Book, MoodId, Stroke } from '@/world/types';

/**
 * Everything SCRBL asks of AI goes through this interface.
 *
 * The real implementation will call the SCRBL backend, which holds the API keys,
 * runs safety checks on every input and output, and spends the family's credits.
 * The app never talks to an AI vendor directly.
 */
export interface AiService {
  /** Turns a sketch into finished art. Returns one entry per version for the kid to pick from. */
  makeArt(input: { sketch: Stroke[]; style: ArtStyleId; mood: MoodId; versions: number }): Promise<ArtVersion[]>;
  /** Drafts an illustrated book from the kid's world. */
  draftBook(input: BookRequest): Promise<Book>;
}

export type ArtVersion = {
  variant: number;
  /** Image of the finished art. Undefined means the app draws its built-in preview instead. */
  uri?: string;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const newId = () => Math.random().toString(36).slice(2, 10);

/** Offline stand-in used until the backend exists. Art is drawn on device from the sketch. */
export const previewAi: AiService = {
  async makeArt({ versions }) {
    await wait(1200);
    return Array.from({ length: versions }, (_, variant) => ({ variant }));
  },
  async draftBook(input) {
    await wait(600);
    return draftBookFromTemplate(input, newId(), Date.now());
  },
};

export const ai: AiService = previewAi;
