import { create } from 'zustand';

interface GameUIState {
  expandedModelId: string | null;
  setExpandedModel: (id: string | null) => void;
}

export const useGameStore = create<GameUIState>((set) => ({
  expandedModelId: null,
  setExpandedModel: (id) => set({ expandedModelId: id }),
}));
