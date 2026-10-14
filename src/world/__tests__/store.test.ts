import { STARTING_CREDITS, useWorld } from '../store';

jest.mock('@react-native-async-storage/async-storage', () => jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const base = { kind: 'character' as const, name: 'Ziggy', answers: {}, sketch: [], style: 'storybook' as const, mood: 'bright' as const, variant: 0, folderId: null };

beforeEach(() => {
  useWorld.setState({ creations: [], folders: [], books: [], credits: STARTING_CREDITS, parentUnlocked: false });
});

it('saves a creation and uses one creation credit', () => {
  const c = useWorld.getState().addCreation(base);
  const s = useWorld.getState();
  expect(s.creations[0].id).toBe(c.id);
  expect(s.credits.creationsLeft).toBe(STARTING_CREDITS.creationsLeft - 1);
});

it('moves a drawing into a folder, and back out when the folder is deleted', () => {
  const c = useWorld.getState().addCreation(base);
  const folder = useWorld.getState().addFolder('  Sky Island ');
  expect(folder.name).toBe('Sky Island');
  useWorld.getState().updateCreation(c.id, { folderId: folder.id });
  expect(useWorld.getState().creations[0].folderId).toBe(folder.id);
  useWorld.getState().deleteFolder(folder.id);
  expect(useWorld.getState().creations[0].folderId).toBeNull();
  expect(useWorld.getState().folders).toHaveLength(0);
});

it('uses one book credit per saved book', () => {
  useWorld.getState().addBook({ id: 'b', title: 'T', theme: 'bravery', style: 'storybook', mood: 'bright', pages: [], createdAt: 0 });
  expect(useWorld.getState().credits.booksLeft).toBe(STARTING_CREDITS.booksLeft - 1);
});

it('never saves grown-up mode', () => {
  useWorld.getState().setParentUnlocked(true);
  const options = useWorld.persist.getOptions();
  const saved = options.partialize?.(useWorld.getState()) as Record<string, unknown>;
  expect(saved).not.toHaveProperty('parentUnlocked');
  expect(saved).toHaveProperty('creations');
});
