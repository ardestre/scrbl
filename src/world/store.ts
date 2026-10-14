import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Book, Creation, Credits, Folder } from './types';

const newId = () => Math.random().toString(36).slice(2, 10);

export const STARTING_CREDITS: Credits = {
  plan: 'explorer',
  creationsLeft: 30,
  creationsPerMonth: 30,
  booksLeft: 4,
  booksPerMonth: 4,
};

type WorldState = {
  childName: string;
  creations: Creation[];
  folders: Folder[];
  books: Book[];
  credits: Credits;
  /** Grown-up mode, unlocked by the parent gate. Never saved, so it locks again on restart. */
  parentUnlocked: boolean;

  addCreation: (creation: Omit<Creation, 'id' | 'createdAt'>) => Creation;
  updateCreation: (id: string, patch: Partial<Pick<Creation, 'name' | 'folderId'>>) => void;
  deleteCreation: (id: string) => void;
  addFolder: (name: string) => Folder;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  addBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  setParentUnlocked: (unlocked: boolean) => void;
};

export const useWorld = create<WorldState>()(
  persist(
    (set) => ({
      childName: 'Mia',
      creations: [],
      folders: [],
      books: [],
      credits: STARTING_CREDITS,
      parentUnlocked: false,

      addCreation: (input) => {
        const creation: Creation = { ...input, id: newId(), createdAt: Date.now() };
        set((s) => ({
          creations: [creation, ...s.creations],
          credits: { ...s.credits, creationsLeft: Math.max(0, s.credits.creationsLeft - 1) },
        }));
        return creation;
      },
      updateCreation: (id, patch) =>
        set((s) => ({ creations: s.creations.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCreation: (id) => set((s) => ({ creations: s.creations.filter((c) => c.id !== id) })),

      addFolder: (name) => {
        const folder: Folder = { id: newId(), name: name.trim(), createdAt: Date.now() };
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

      setParentUnlocked: (parentUnlocked) => set({ parentUnlocked }),
    }),
    {
      name: 'scrbl-world',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ parentUnlocked: _locked, ...saved }) => saved,
    },
  ),
);

export const useCreation = (id: string | undefined) => useWorld((s) => s.creations.find((c) => c.id === id));
