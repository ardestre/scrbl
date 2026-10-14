import { migrateWorld, STARTING_CREDITS, useWorld } from '../store';

jest.mock('@react-native-async-storage/async-storage', () => jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const base = { kind: 'character' as const, name: 'Ziggy', answers: {}, sketch: [], style: 'storybook' as const, mood: 'bright' as const, variant: 0, folderId: null };
const book = (id: string, childId: string) => ({ id, childId, title: 'T', theme: 'bravery' as const, style: 'storybook' as const, mood: 'bright' as const, pages: [], createdAt: 0 });

let kidId = '';

beforeEach(() => {
  useWorld.setState({ profiles: [], creations: [], folders: [], books: [], credits: STARTING_CREDITS, parentPin: null, parentUnlocked: false, activeChildId: null });
  kidId = useWorld.getState().addProfile('  Mia ', 'dragon').id;
  useWorld.getState().setActiveChild(kidId);
});

it('adds a kid profile with a tidy name', () => {
  expect(useWorld.getState().profiles).toEqual([expect.objectContaining({ id: kidId, name: 'Mia', avatar: 'dragon' })]);
});

it('saves a creation for the active kid and uses one creation credit', () => {
  const c = useWorld.getState().addCreation(base);
  const s = useWorld.getState();
  expect(s.creations[0].id).toBe(c.id);
  expect(c.childId).toBe(kidId);
  expect(s.credits.creationsLeft).toBe(STARTING_CREDITS.creationsLeft - 1);
});

it('refuses to save a drawing when no kid is active', () => {
  useWorld.getState().setActiveChild(null);
  expect(() => useWorld.getState().addCreation(base)).toThrow();
});

it('moves a drawing into a folder, and back out when the folder is deleted', () => {
  const c = useWorld.getState().addCreation(base);
  const folder = useWorld.getState().addFolder('  Sky Island ');
  expect(folder.name).toBe('Sky Island');
  expect(folder.childId).toBe(kidId);
  useWorld.getState().updateCreation(c.id, { folderId: folder.id });
  expect(useWorld.getState().creations[0].folderId).toBe(folder.id);
  useWorld.getState().deleteFolder(folder.id);
  expect(useWorld.getState().creations[0].folderId).toBeNull();
  expect(useWorld.getState().folders).toHaveLength(0);
});

it('uses one book credit per saved book', () => {
  useWorld.getState().addBook(book('b', kidId));
  expect(useWorld.getState().credits.booksLeft).toBe(STARTING_CREDITS.booksLeft - 1);
});

it('deleting a kid removes only their world', () => {
  const other = useWorld.getState().addProfile('Leo', 'robot').id;
  useWorld.getState().addCreation(base);
  useWorld.getState().addFolder('Mine');
  useWorld.getState().addBook(book('b1', kidId));
  useWorld.getState().setActiveChild(other);
  const leos = useWorld.getState().addCreation(base);
  useWorld.getState().addBook(book('b2', other));

  useWorld.getState().deleteProfile(kidId);
  const s = useWorld.getState();
  expect(s.profiles.map((p) => p.id)).toEqual([other]);
  expect(s.creations.map((c) => c.id)).toEqual([leos.id]);
  expect(s.folders).toHaveLength(0);
  expect(s.books.map((b) => b.id)).toEqual(['b2']);
});

it('drops a profile icon when that drawing is deleted', () => {
  const c = useWorld.getState().addCreation(base);
  useWorld.getState().updateProfile(kidId, { avatarCreationId: c.id });
  useWorld.getState().deleteCreation(c.id);
  expect(useWorld.getState().profiles[0].avatarCreationId).toBeUndefined();
});

it('locks grown-up mode whenever the profile changes', () => {
  useWorld.getState().setParentUnlocked(true);
  useWorld.getState().setActiveChild(null);
  expect(useWorld.getState().parentUnlocked).toBe(false);
});

it('never saves grown-up mode or the active kid', () => {
  useWorld.getState().setParentUnlocked(true);
  const options = useWorld.persist.getOptions();
  const saved = options.partialize?.(useWorld.getState()) as Record<string, unknown>;
  expect(saved).not.toHaveProperty('parentUnlocked');
  expect(saved).not.toHaveProperty('activeChildId');
  expect(saved).toHaveProperty('creations');
  expect(saved).toHaveProperty('profiles');
});

describe('moving saved data from version 1', () => {
  it('puts an existing world into a first profile', () => {
    const old = { childName: 'Sam', creations: [{ ...base, id: 'c1', createdAt: 0 }], folders: [{ id: 'f1', name: 'Pets', createdAt: 0 }], books: [], credits: STARTING_CREDITS };
    const world = migrateWorld(old, 1);
    expect(world.profiles).toHaveLength(1);
    const [first] = world.profiles;
    expect(first.name).toBe('Sam');
    expect(world.creations[0]).toMatchObject({ id: 'c1', childId: first.id });
    expect(world.folders[0]).toMatchObject({ id: 'f1', childId: first.id });
    expect(world.parentPin).toBeNull();
  });

  it('starts with no profiles when nothing was made yet', () => {
    expect(migrateWorld({ creations: [], books: [] }, 1).profiles).toEqual([]);
  });
});
