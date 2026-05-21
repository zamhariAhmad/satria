"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type QuranBookmark = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  createdAt: string;
  note?: string;
};

export type LastRead = {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  updatedAt: string;
};

type QuranStore = {
  lastRead: LastRead | null;
  bookmarks: QuranBookmark[];
  setLastRead: (l: LastRead) => void;
  clearLastRead: () => void;
  addBookmark: (b: Omit<QuranBookmark, "createdAt">) => void;
  removeBookmark: (surahNumber: number, ayahNumber: number) => void;
  toggleBookmark: (b: Omit<QuranBookmark, "createdAt">) => void;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
};

export const useQuranStore = create<QuranStore>()(
  persist(
    (set, get) => ({
      lastRead: null,
      bookmarks: [],
      setLastRead: (l) => set({ lastRead: l }),
      clearLastRead: () => set({ lastRead: null }),
      addBookmark: (b) =>
        set((s) => {
          const exists = s.bookmarks.some(
            (x) =>
              x.surahNumber === b.surahNumber && x.ayahNumber === b.ayahNumber,
          );
          if (exists) return s;
          return {
            bookmarks: [
              { ...b, createdAt: new Date().toISOString() },
              ...s.bookmarks,
            ],
          };
        }),
      removeBookmark: (surahNumber, ayahNumber) =>
        set((s) => ({
          bookmarks: s.bookmarks.filter(
            (x) =>
              !(x.surahNumber === surahNumber && x.ayahNumber === ayahNumber),
          ),
        })),
      toggleBookmark: (b) => {
        const { isBookmarked, addBookmark, removeBookmark } = get();
        if (isBookmarked(b.surahNumber, b.ayahNumber)) {
          removeBookmark(b.surahNumber, b.ayahNumber);
        } else {
          addBookmark(b);
        }
      },
      isBookmarked: (surahNumber, ayahNumber) =>
        get().bookmarks.some(
          (x) => x.surahNumber === surahNumber && x.ayahNumber === ayahNumber,
        ),
    }),
    {
      name: "satria-quran-store",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
