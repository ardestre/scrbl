import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { PinRecord } from './pin';
import type { AvatarId, Book, Creation, Credits, Folder, Profile } from './types';

const newId = () => Math.random().toString(36).slice(2, 10);

export const STARTING_CREDITS: Credits = {
  plan: 'explorer',
  creationsLeft: 30,
  creationsPerMonth: 30,
  booksLeft: 4,
  booksPerMonth: 4,
};

type WorldData = {
  profiles: Profile[];
  creations: Creation[];
  folders: Folder[];
  books: Book[];
  credits: Credits;
  /** The grown-up PIN, stored only as a salted hash. Null until the parent sets one. */
  parentPin: PinRecord | null;
};

type WorldState = WorldData & {
  /** The kid using the app right now. Never saved, so the app always opens on "Who's drawing?". */
  activeChildId: string | null;
  /** Grown-up mode, unlocked with the PIN. Never saved, so it locks again on restart. */
  parentUnlocked: boolean;

  addProfile: (name: string, avatar: AvatarId) => Profile;
  updateProfile: (id: string, patch: Partial<Pick<Profile, 'name' | 'avatar' | 'avatarCreationId'>>) => void;
  /** Removes a kid and everything in their world. */
  deleteProfile: (id: string) => void;
  /** Switches to a kid's profile. Switching profiles always locks grown-up mode. */
  setActiveChild: (id: string | null) => void;

  addCreation: (creation: Omit<Creation, 'id' | 'createdAt' | 'childId'>) => Creation;
  updateCreation: (id: string, patch: Partial<Pick<Creation, 'name' | 'folderId'>>) => void;
  deleteCreation: (id: string) => void;
  addFolder: (name: string) => Folder;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  addBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  setParentPin: (pin: PinRecord) => void;
  setParentUnlocked: (unlocked: boolean) => void;
};

function requireChild(id: string | null): string {
  if (!id) throw new Error('No kid profile is active');
  return id;
}

export const useWorld = create<WorldState>()(
  persist(
    (set, get) => ({
      profiles: [],
      creations: [],
      folders: [],
      books: [],
      credits: STARTING_CREDITS,
      parentPin: null,
      activeChildId: null,
      parentUnlocked: false,

      addProfile: (name, avatar) => {
        const profile: Profile = { id: newId(), name: name.trim(), avatar, createdAt: Date.now() };
        set((s) => ({ profiles: [...s.profiles, profile] }));
        return profile;
      },
      updateProfile: (id, patch) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch, name: (patch.name ?? p.name).trim() } : p)) })),
      deleteProfile: (id) =>
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          creations: s.creations.filter((c) => c.childId !== id),
          folders: s.folders.filter((f) => f.childId !== id),
          books: s.books.filter((b) => b.childId !== id),
          activeChildId: s.activeChildId === id ? null : s.activeChildId,
        })),
      setActiveChild: (activeChildId) => set({ activeChildId, parentUnlocked: false }),

      addCreation: (input) => {
        const creation: Creation = { ...input, childId: requireChild(get().activeChildId), id: newId(), createdAt: Date.now() };
        set((s) => ({
          creations: [creation, ...s.creations],
          credits: { ...s.credits, creationsLeft: Math.max(0, s.credits.creationsLeft - 1) },
        }));
        return creation;
      },
      updateCreation: (id, patch) =>
        set((s) => ({ creations: s.creations.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCreation: (id) =>
        set((s) => ({
          creations: s.creations.filter((c) => c.id !== id),
          profiles: s.profiles.map((p) => (p.avatarCreationId === id ? { ...p, avatarCreationId: undefined } : p)),
        })),

      addFolder: (name) => {
        const folder: Folder = { id: newId(), childId: requireChild(get().activeChildId), name: name.trim(), createdAt: Date.now() };
        set((s) => ({ folders: [...s.folders, folder] }));
        return folder;
      },
      renameFolder: (id, name) =>
        set((s) => ({ folders: s.folders.map((f) => (f.id === id ? { ...f, name: name.trim() } : f)) })),
      deleteFolder: (id) =>
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
          creations: s.creations.map((c) => (c.folderId === id ? { ...c, folderId: null } : c)),
        })),

      addBook: (book) =>
        set((s) => ({
          books: [book, ...s.books],
          credits: { ...s.credits, booksLeft: Math.max(0, s.credits.booksLeft - 1) },
        })),
      deleteBook: (id) => set((s) => ({ books: s.books.filter((b) => b.id !== id) })),

      setParentPin: (parentPin) => set({ parentPin }),
      setParentUnlocked: (parentUnlocked) => set({ parentUnlocked }),
    }),
    {
      name: 'scrbl-world',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ profiles, creations, folders, books, credits, parentPin }): WorldData => ({
        profiles,
        creations,
        folders,
        books,
        credits,
        parentPin,
      }),
      migrate: (saved, version) => migrateWorld(saved, version),
    },
  ),
);

/**
 * Version 1 had a single kid and no profiles. Everything moves into a first profile,
 * named after the kid the app used to greet.
 */
export function migrateWorld(saved: unknown, version: number): WorldData {
  const old = (saved ?? {}) as Partial<WorldData> & { childName?: string };
  if (version >= 2) return { ...emptyWorld(), ...old } as WorldData;
  const hasData = Boolean(old.creations?.length || old.books?.length || old.folders?.length);
  const first: Profile | null = hasData
    ? { id: newId(), name: old.childName ?? 'My world', avatar: 'blob', createdAt: Date.now() }
    : null;
  const own = <T extends object>(items: T[] | undefined) => (items ?? []).map((item) => ({ ...item, childId: first!.id }));
  return {
    ...emptyWorld(),
    credits: old.credits ?? STARTING_CREDITS,
    profiles: first ? [first] : [],
    creations: first ? (own(old.creations) as Creation[]) : [],
    folders: first ? (own(old.folders) as Folder[]) : [],
    books: first ? (own(old.books) as Book[]) : [],
  };
}

function emptyWorld(): WorldData {
  return { profiles: [], creations: [], folders: [], books: [], credits: STARTING_CREDITS, parentPin: null };
}

export const useCreation = (id: string | undefined) => useWorld((s) => s.creations.find((c) => c.id === id));

export const useActiveChild = () => useWorld((s) => s.profiles.find((p) => p.id === s.activeChildId));

/** The active kid and only their drawings, folders and books. */
export function useChildWorld() {
  const childId = useWorld((s) => s.activeChildId);
  const profiles = useWorld((s) => s.profiles);
  const allCreations = useWorld((s) => s.creations);
  const allFolders = useWorld((s) => s.folders);
  const allBooks = useWorld((s) => s.books);
  return useMemo(
    () => ({
      child: profiles.find((p) => p.id === childId),
      creations: allCreations.filter((c) => c.childId === childId),
      folders: allFolders.filter((f) => f.childId === childId),
      books: allBooks.filter((b) => b.childId === childId),
    }),
    [childId, profiles, allCreations, allFolders, allBooks],
  );
}
