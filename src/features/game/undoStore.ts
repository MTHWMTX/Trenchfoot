import { create } from 'zustand';
import type { GameModelState } from '../../types';

const MAX_UNDO = 50;

interface UndoState {
  past: GameModelState[][];
  future: GameModelState[][];
  pushState: (snapshot: GameModelState[]) => void;
  undo: (current: GameModelState[]) => GameModelState[] | null;
  redo: (current: GameModelState[]) => GameModelState[] | null;
  clear: () => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  past: [],
  future: [],
  pushState: (snapshot) =>
    set((s) => ({
      past: [...s.past.slice(-(MAX_UNDO - 1)), snapshot],
      future: [],
    })),
  undo: (current) => {
    const { past } = get();
    if (past.length === 0) return null;
    const prev = past[past.length - 1];
    set((s) => ({
      past: s.past.slice(0, -1),
      future: [...s.future, current],
    }));
    return prev;
  },
  redo: (current) => {
    const { future } = get();
    if (future.length === 0) return null;
    const next = future[future.length - 1];
    set((s) => ({
      past: [...s.past, current],
      future: s.future.slice(0, -1),
    }));
    return next;
  },
  clear: () => set({ past: [], future: [] }),
}));
